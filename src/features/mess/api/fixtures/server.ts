/**
 * An in-memory mess backend for development and demos (MESS_FIXTURES). It
 * mirrors the API's behaviour as the PRD describes it, so the screens exercise
 * the same states they will meet for real: derived costs and rules, the search
 * filters, submit-time completeness checks (422), sign-in and rate limits on
 * contact (401, 429), and "verified students only" (403).
 *
 * State lives for the page session; a reload starts from the seed again.
 */
import { Platform } from "react-native";
import { ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { allAreasQuery, type AllAreas } from "@/hooks/useAllAreas";
import type { PaginatedResponse } from "@/features/property/types/property";
import { FRESHNESS_HIDE_DAYS, REQUIRED_MEDIA_LABELS } from "../../constants/vocabulary";
import { cheapestAllIn, costsComplete } from "../../utils/allInCost";
import { estimatedWalk, straightMetres } from "../../utils/geo";
import { deriveRuleKeys } from "../../utils/rules";
import { minutesOfDay } from "../../utils/time";
import type {
  CampusDistance,
  MessCard,
  MessDetail,
  MessDetails,
  MessDetailsInput,
  MessFilters,
  MyMessListing,
  Seat,
  SeekerPreference,
  UtilityCharge,
} from "../../types/mess";
import type { MessBackend } from "../messApi";
import { FIXTURE_DEFAULT_PHONE, FIXTURE_UNIVERSITIES, seedListings } from "./data";

interface StoredListing {
  owner_id: string;
  owner_phone: string;
  detail: Omit<MessDetail, "mess" | "distances" | "rules"> & { mess: Partial<MessDetailsInput> & { last_confirmed_at: string } };
}

const LATENCY_MS = 250;
const SEARCH_RADIUS_M = 6000;
const REVEALS_PER_HOUR = 5;

const listings = new Map<string, StoredListing>(seedListings().map((seed) => [seed.detail.id, seed]));
const reveals: { listing_id: string; user_id: string; at: number }[] = [];
const preferences = new Map<string, SeekerPreference>();
let nextId = 1;

const delay = <T>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
const fail = (message: string, status: number, errors: string[] = []) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new ApiError(message, status, null, errors, message)), LATENCY_MS));
const currentUser = () => useAuthStore.getState().user;

// ─── Derivations (PRD 2.4 and 2.5) ──────────────────────────────────────────

/**
 * The routing fallback from PRD 2.4.1: 1.35 × straight line at 80 m a minute.
 * One seeded listing is marked approximate so the UI's fallback state shows.
 */
function distancesFor(listing: StoredListing): CampusDistance[] {
  const { location_lat: lat, location_lng: lng, id } = listing.detail;
  if (lat == null || lng == null) return [];
  const rows: CampusDistance[] = [];
  for (const university of FIXTURE_UNIVERSITIES) {
    for (const campus of university.campuses) {
      const straight = straightMetres(lat, lng, campus.lat, campus.lng);
      if (straight > SEARCH_RADIUS_M) continue;
      const { walking_m, walking_min } = estimatedWalk(straight);
      rows.push({
        campus_id: campus.id,
        campus_name: campus.name,
        university_short: university.short_name,
        walking_m,
        walking_min,
        approximate: id === "fx-mess-4" || !id.startsWith("fx-mess-"),
      });
    }
  }
  return rows.sort((a, b) => a.walking_min - b.walking_min);
}

const DETAIL_DEFAULTS: MessDetailsInput = {
  gender_policy: "male",
  tenant_type: "students_only",
  managed_by: "resident_manager",
  total_rooms: 0,
  total_seats: 0,
  current_residents: 0,
  washroom_count: 0,
  floor_level: 0,
  has_lift: false,
  has_generator: false,
  has_security_guard: false,
  has_cctv: false,
  gate_open_time: null,
  gate_close_time: null,
  smoking_policy: "not_allowed",
  quiet_hours_start: null,
  quiet_hours_end: null,
  study_friendly: false,
  guest_policy: "day_only",
  meal_system: "none",
  maid_service: false,
  vibe_tags: [],
  security_deposit: null,
  advance_months: 1,
  notice_period_days: null,
  rent_last_revised_at: null,
  contact_channels: ["phone", "whatsapp"],
  verified_seekers_only: false,
};

function derivedMess(listing: StoredListing): MessDetails {
  const { seats, charges } = listing.detail;
  const mess = { ...DETAIL_DEFAULTS, ...listing.detail.mess };
  const cheapest = cheapestAllIn(seats, charges);
  return {
    ...mess,
    all_in_min: cheapest?.min ?? 0,
    all_in_max: cheapest?.max ?? 0,
    costs_complete: costsComplete(charges),
    available_seats: seats.filter((seat) => seat.status === "available").length,
  };
}

function toDetail(listing: StoredListing): MessDetail {
  return {
    ...listing.detail,
    mess: derivedMess(listing),
    distances: distancesFor(listing),
    rules: deriveRuleKeys({ ...DETAIL_DEFAULTS, ...listing.detail.mess }),
  };
}

function cover(detail: Pick<MessDetail, "media">) {
  const sorted = [...detail.media].sort((a, b) => a.display_order - b.display_order);
  const pick = sorted.find((media) => media.label === "room") ?? sorted[0];
  return pick ? { url: pick.url, label: pick.label } : null;
}

function toCard(listing: StoredListing, campusId?: string): MessCard {
  const detail = toDetail(listing);
  const open = detail.seats.filter((seat) => seat.status === "available");
  const walk = campusId ? detail.distances.find((row) => row.campus_id === campusId) : undefined;
  return {
    id: detail.id,
    title: detail.title,
    subtype: detail.subtype,
    area: detail.area,
    cover: cover(detail),
    cost: {
      all_in_min: detail.mess.all_in_min,
      all_in_max: detail.mess.all_in_max,
      rent_from: open.length ? Math.min(...open.map((seat) => seat.rent)) : 0,
      costs_complete: detail.mess.costs_complete,
    },
    walk: walk
      ? { campus_short: walk.university_short, walking_min: walk.walking_min, walking_m: walk.walking_m, approximate: walk.approximate }
      : null,
    occupancy: {
      current_residents: detail.mess.current_residents,
      available_seats: detail.mess.available_seats,
      per_washroom: detail.mess.washroom_count > 0 ? Math.ceil(detail.mess.total_seats / detail.mess.washroom_count) : detail.mess.total_seats,
      washrooms: [...new Set(open.map((seat) => seat.washroom))],
    },
    seat_types: [...new Set(open.map((seat) => seat.seat_type))],
    gender_policy: detail.mess.gender_policy,
    rules: detail.rules,
    vibe_tags: detail.mess.vibe_tags,
    is_verified: detail.is_verified,
    preferred_channel: detail.mess.contact_channels[0] ?? "phone",
    last_confirmed_at: detail.mess.last_confirmed_at,
  };
}

// ─── Search (PRD 2.4.3) ─────────────────────────────────────────────────────

function matches(listing: StoredListing, filters: MessFilters): boolean {
  const detail = toDetail(listing);
  const { mess } = detail;
  const open = detail.seats.filter((seat) => seat.status === "available");
  const ageDays = (Date.now() - Date.parse(mess.last_confirmed_at)) / 86_400_000;

  if (detail.status !== "active" || open.length === 0 || ageDays > FRESHNESS_HIDE_DAYS) return false;
  if (filters.campus_id) {
    const walk = detail.distances.find((row) => row.campus_id === filters.campus_id);
    if (!walk) return false;
    if (filters.max_walk_min && walk.walking_min > filters.max_walk_min) return false;
  }
  if (filters.lat != null && filters.lng != null && filters.radius && detail.location_lat != null && detail.location_lng != null) {
    if (straightMetres(filters.lat, filters.lng, detail.location_lat, detail.location_lng) > filters.radius) return false;
  }
  if (filters.area_id && detail.area?.id !== filters.area_id) return false;
  if (filters.gender && mess.gender_policy !== filters.gender) return false;
  if (filters.min_all_in && mess.all_in_min < filters.min_all_in) return false;
  if (filters.max_all_in && mess.all_in_min > filters.max_all_in) return false;
  if (filters.seat_type && !open.some((seat) => seat.seat_type === filters.seat_type)) return false;
  if (filters.washroom && !open.some((seat) => seat.washroom === filters.washroom)) return false;
  if (filters.has_balcony && !open.some((seat) => seat.has_balcony)) return false;
  if (filters.available_by && !open.some((seat) => seat.available_from <= filters.available_by!)) return false;
  if (filters.no_smoking && mess.smoking_policy !== "not_allowed") return false;
  if (filters.study_friendly && !mess.study_friendly) return false;
  if (filters.has_lift && !mess.has_lift) return false;
  if (filters.meal_system?.length && !filters.meal_system.includes(mess.meal_system)) return false;
  if (filters.guest_policy?.length && !filters.guest_policy.includes(mess.guest_policy)) return false;
  if (filters.gate_open_by && (!mess.gate_open_time || minutesOfDay(mess.gate_open_time) > minutesOfDay(filters.gate_open_by))) return false;
  if (filters.costs_complete && !mess.costs_complete) return false;
  if (filters.is_verified && !detail.is_verified) return false;
  return true;
}

function sortCards(cards: MessCard[], filters: MessFilters): MessCard[] {
  const sort = filters.sort_by ?? (filters.campus_id ? "walk_asc" : "recently_confirmed");
  const byId = (a: MessCard, b: MessCard) => a.id.localeCompare(b.id);
  return [...cards].sort((a, b) => {
    if (sort === "walk_asc" && a.walk && b.walk) {
      return a.walk.walking_min - b.walk.walking_min || a.cost.all_in_min - b.cost.all_in_min || byId(a, b);
    }
    if (sort === "all_in_asc") return a.cost.all_in_min - b.cost.all_in_min || byId(a, b);
    if (sort === "newest") {
      const created = (card: MessCard) => Date.parse(listings.get(card.id)?.detail.created_at ?? "");
      return created(b) - created(a) || byId(a, b);
    }
    return Date.parse(b.last_confirmed_at) - Date.parse(a.last_confirmed_at) || byId(a, b);
  });
}

// ─── Submit checks (PRD 2.3.4) ──────────────────────────────────────────────

function submitProblems(listing: StoredListing): string[] {
  const detail = toDetail(listing);
  const stored = listing.detail.mess;
  const problems: string[] = [];
  if (!detail.mess.costs_complete) problems.push("Answer every bill category: included, fixed, varies or not applicable.");
  if (!detail.seats.some((seat) => seat.status === "available")) problems.push("Add at least one available seat.");
  if (detail.location_lat == null || detail.location_lng == null) problems.push("Place the pin on the map.");
  for (const label of REQUIRED_MEDIA_LABELS) {
    if (!detail.media.some((media) => media.label === label)) problems.push(`Add a ${label} photo.`);
  }
  const required: (keyof MessDetailsInput)[] = ["gender_policy", "smoking_policy", "meal_system", "guest_policy", "current_residents"];
  for (const field of required) {
    if (stored[field] === undefined || stored[field] === null) problems.push(`Fill in ${field.replace(/_/g, " ")}.`);
  }
  if (!stored.contact_channels?.length) problems.push("Choose at least one way to be contacted.");
  if ((stored.current_residents ?? 0) > (stored.total_seats ?? 0)) problems.push("Current residents cannot be more than total seats.");
  return problems;
}

/** The real API joins the area; here the name comes from the area list the wizard's picker loaded. */
function areaName(id: string): string {
  const areas = queryClient.getQueryData<AllAreas>(allAreasQuery.queryKey)?.items ?? [];
  return areas.find((area) => area.id === id)?.name ?? "Dhaka";
}

// ─── Media ──────────────────────────────────────────────────────────────────

function localUrl(file: unknown): string {
  if (file && typeof file === "object" && "uri" in file) return String((file as { uri: string }).uri);
  if (Platform.OS === "web" && typeof URL !== "undefined" && typeof Blob !== "undefined" && file instanceof Blob) {
    return URL.createObjectURL(file);
  }
  return "";
}

// ─── The backend ────────────────────────────────────────────────────────────

function ownListing(id: string): StoredListing | ApiError {
  const user = currentUser();
  if (!user) return new ApiError("Sign in to continue", 401, null, [], "Sign in to continue");
  const listing = listings.get(id);
  if (!listing) return new ApiError("Listing not found", 404, null, [], "Listing not found");
  if (listing.owner_id !== user.id) return new ApiError("You can only change your own listing", 403, null, [], "Forbidden");
  return listing;
}

const isError = (value: unknown): value is ApiError => value instanceof ApiError;

export const fixtureBackend: MessBackend = {
  getUniversities: () => delay(FIXTURE_UNIVERSITIES),

  searchMess(filters, page, limit) {
    const cards = sortCards(
      [...listings.values()].filter((listing) => matches(listing, filters)).map((listing) => toCard(listing, filters.campus_id)),
      filters,
    );
    const start = (page - 1) * limit;
    return delay<PaginatedResponse<MessCard>>({ items: cards.slice(start, start + limit), total: cards.length, page, limit });
  },

  getMessDetail(id) {
    const listing = listings.get(id);
    const isOwner = listing && currentUser()?.id === listing.owner_id;
    if (!listing || (listing.detail.status !== "active" && !isOwner)) return fail("Listing not found", 404);
    return delay(toDetail(listing));
  },

  getMyMessListings() {
    const user = currentUser();
    if (!user) return fail("Sign in to continue", 401);
    const weekAgo = Date.now() - 7 * 86_400_000;
    const items: MyMessListing[] = [...listings.values()]
      .filter((listing) => listing.owner_id === user.id)
      .map((listing) => {
        const detail = toDetail(listing);
        return {
          id: detail.id,
          title: detail.title,
          subtype: detail.subtype,
          status: detail.status,
          area: detail.area,
          cover: cover(detail),
          seats: detail.seats,
          available_seats: detail.mess.available_seats,
          all_in_min: detail.mess.all_in_min,
          all_in_max: detail.mess.all_in_max,
          costs_complete: detail.mess.costs_complete,
          last_confirmed_at: detail.mess.last_confirmed_at,
          reveals_7d: reveals.filter((reveal) => reveal.listing_id === detail.id && reveal.at > weekAgo).length,
        };
      })
      .sort((a, b) => b.id.localeCompare(a.id));
    return delay({ items, total: items.length, page: 1, limit: 50 });
  },

  upsertMess(dto) {
    const user = currentUser();
    if (!user) return fail("Sign in to continue", 401);
    let listing: StoredListing;
    if (dto.property_id) {
      const own = ownListing(dto.property_id);
      if (isError(own)) return fail(own.message, own.status ?? 400);
      listing = own;
    } else {
      const now = new Date().toISOString();
      const id = `fx-new-${nextId++}`;
      listing = {
        owner_id: user.id,
        owner_phone: FIXTURE_DEFAULT_PHONE,
        detail: {
          id,
          title: "",
          description: null,
          subtype: "mess",
          status: "draft",
          is_verified: false,
          address: null,
          location_lat: null,
          location_lng: null,
          area: null,
          lister: { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url },
          media: [],
          mess: { last_confirmed_at: now },
          seats: [],
          charges: [],
          created_at: now,
          updated_at: now,
        },
      };
      listings.set(id, listing);
    }
    const detail = listing.detail;
    if (dto.subtype) detail.subtype = dto.subtype;
    if (dto.title !== undefined) detail.title = dto.title;
    if (dto.description !== undefined) detail.description = dto.description || null;
    if (dto.address !== undefined) detail.address = dto.address || null;
    if (dto.location_lat !== undefined) detail.location_lat = dto.location_lat;
    if (dto.location_lng !== undefined) detail.location_lng = dto.location_lng;
    if (dto.area_id !== undefined) detail.area = dto.area_id ? { id: dto.area_id, name: areaName(dto.area_id) } : null;
    if (dto.mess) detail.mess = { ...detail.mess, ...dto.mess };
    if (dto.seats) {
      detail.seats = dto.seats.map<Seat>((input) => ({
        ...input,
        id: input.id ?? `fx-seat-${nextId++}`,
        status: input.status ?? "available",
      }));
    }
    if (dto.charges) {
      detail.charges = dto.charges.map<UtilityCharge>((input) => ({
        category: input.category,
        billing: input.billing,
        amount_min: input.amount_min ?? null,
        amount_max: input.amount_max ?? null,
        note: input.note ?? null,
      }));
    }
    detail.updated_at = new Date().toISOString();
    return delay({ id: detail.id, status: detail.status });
  },

  submitMess(id) {
    const own = ownListing(id);
    if (isError(own)) return fail(own.message, own.status ?? 400);
    const problems = submitProblems(own);
    if (problems.length) return fail("This listing is not complete yet", 422, problems);
    own.detail.status = "pending";
    // Demo moderation: approved a few seconds later.
    setTimeout(() => {
      if (own.detail.status === "pending") own.detail.status = "active";
    }, 5000);
    return delay({ id, status: own.detail.status });
  },

  uploadMessMedia(id, file, label, displayOrder) {
    const own = ownListing(id);
    if (isError(own)) return fail(own.message, own.status ?? 400);
    const media = { id: `fx-media-${nextId++}`, url: localUrl(file), label, display_order: displayOrder ?? own.detail.media.length };
    own.detail.media.push(media);
    return delay(media);
  },

  deleteMessMedia(mediaId) {
    for (const listing of listings.values()) {
      listing.detail.media = listing.detail.media.filter((media) => media.id !== mediaId);
    }
    return delay(undefined);
  },

  setSeatStatus(id, seatId, status) {
    const own = ownListing(id);
    if (isError(own)) return fail(own.message, own.status ?? 400);
    const seat = own.detail.seats.find((row) => row.id === seatId);
    if (!seat) return fail("Seat not found", 404);
    seat.status = status;
    return delay(undefined);
  },

  confirmAvailable(id) {
    const own = ownListing(id);
    if (isError(own)) return fail(own.message, own.status ?? 400);
    own.detail.mess.last_confirmed_at = new Date().toISOString();
    return delay(undefined);
  },

  contactLister(id, channel) {
    const user = currentUser();
    if (!user) return fail("Sign in to see the number", 401);
    const listing = listings.get(id);
    if (!listing || listing.detail.status !== "active") return fail("Listing not found", 404);
    const mess = { ...DETAIL_DEFAULTS, ...listing.detail.mess };
    if (!mess.contact_channels.includes(channel)) return fail("This lister does not take that kind of contact", 400);
    if (mess.verified_seekers_only && !user.email_verified) return fail("This lister only accepts verified accounts", 403);
    const hourAgo = Date.now() - 3_600_000;
    const recent = reveals.filter((reveal) => reveal.user_id === user.id && reveal.at > hourAgo);
    if (recent.length >= REVEALS_PER_HOUR && !recent.some((reveal) => reveal.listing_id === id)) {
      return fail("Too many requests", 429);
    }
    reveals.push({ listing_id: id, user_id: user.id, at: Date.now() });
    const digits = listing.owner_phone.replace(/\D/g, "");
    if (channel === "whatsapp") return delay({ whatsapp_url: `https://wa.me/${digits}` });
    return delay({ phone: listing.owner_phone });
  },

  reportMess(id) {
    if (!currentUser()) return fail("Sign in to report a listing", 401);
    if (!listings.has(id)) return fail("Listing not found", 404);
    return delay(undefined);
  },

  getSeatPreferences() {
    const user = currentUser();
    if (!user) return fail("Sign in to continue", 401);
    return delay(preferences.get(user.id) ?? null);
  },

  putSeatPreferences(next) {
    const user = currentUser();
    if (!user) return fail("Sign in to continue", 401);
    preferences.set(user.id, next);
    return delay(next);
  },
};
