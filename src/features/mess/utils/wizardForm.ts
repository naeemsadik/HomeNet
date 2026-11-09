/**
 * The listing wizard's form: its shape, its empty state, and how it maps to and
 * from the API (PRD 3.3). Numbers stay numbers in the form (the controls parse
 * what is typed), and "not given" is null or an empty string, never a guess.
 */
import { CHARGE_CATEGORIES, DEFAULT_CONTACT_CHANNELS } from "../constants/vocabulary";
import type {
  ChargeBilling,
  ChargeCategory,
  ContactChannel,
  GuestPolicy,
  MealSystem,
  MessCard,
  MessDetail,
  MessGenderPolicy,
  MessManagedBy,
  MessMedia,
  MessSubtype,
  MessTenantType,
  SeatStatus,
  SeatType,
  SmokingPolicy,
  UpsertMessDto,
  VibeTag,
  WashroomType,
} from "../types/mess";
import { cheapestAllIn, costsComplete } from "./allInCost";
import { deriveRuleKeys } from "./rules";
import { todayIso } from "./format";

export interface SeatForm {
  id?: string;
  room_label: string;
  seat_type: SeatType;
  beds_in_room: number;
  washroom: WashroomType;
  has_balcony: boolean;
  rent: number | null;
  available_from: string;
  status?: SeatStatus;
}

export interface ChargeForm {
  category: ChargeCategory;
  /** null until the lister answers. */
  billing: ChargeBilling | null;
  amount_min: number | null;
  amount_max: number | null;
  note: string;
}

export interface MessListingForm {
  // 1. Place
  subtype: MessSubtype;
  gender_policy: MessGenderPolicy | null;
  area_id: string;
  area_name: string;
  address: string;
  location: { lat: number; lng: number } | null;
  // 2. Seats & rooms
  total_rooms: number;
  total_seats: number;
  current_residents: number;
  washroom_count: number;
  floor_level: number;
  has_lift: boolean;
  has_generator: boolean;
  has_security_guard: boolean;
  has_cctv: boolean;
  seats: SeatForm[];
  // 3. Costs
  charges: ChargeForm[];
  security_deposit: number | null;
  advance_months: number;
  // 4. Rules & vibe
  smoking_policy: SmokingPolicy | null;
  guest_policy: GuestPolicy | null;
  meal_system: MealSystem | null;
  study_friendly: boolean;
  maid_service: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  gate_open_time: string;
  gate_close_time: string;
  vibe_tags: VibeTag[];
  managed_by: MessManagedBy | null;
  tenant_type: MessTenantType;
  rent_last_revised_at: string;
  notice_period_days: number | null;
  // 5. Photos & contact (photos are uploaded straight to the draft)
  contact_channels: ContactChannel[];
  verified_seekers_only: boolean;
  // 6. Review
  title: string;
  description: string;
}

export const WIZARD_STEPS = ["place", "seats", "costs", "rules", "photos", "review"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

/** The first of next month, the usual date a mess seat frees up. */
export function firstOfNextMonth(now: Date = new Date()): string {
  return todayIso(new Date(now.getFullYear(), now.getMonth() + 1, 1));
}

export function emptySeat(previous?: SeatForm): SeatForm {
  if (previous) {
    // "Add another seat like this": the same seat, a new identity.
    const { id: _id, status: _status, ...copy } = previous;
    return copy;
  }
  return {
    room_label: "",
    seat_type: "shared",
    beds_in_room: 2,
    washroom: "common",
    has_balcony: false,
    rent: null,
    available_from: firstOfNextMonth(),
  };
}

export function emptyForm(): MessListingForm {
  return {
    subtype: "mess",
    gender_policy: null,
    area_id: "",
    area_name: "",
    address: "",
    location: null,
    total_rooms: 2,
    total_seats: 4,
    current_residents: 3,
    washroom_count: 1,
    floor_level: 1,
    has_lift: false,
    has_generator: false,
    has_security_guard: false,
    has_cctv: false,
    seats: [emptySeat()],
    // Every bill starts unanswered: the lister has to say how each is billed.
    charges: CHARGE_CATEGORIES.map((category) => ({ category, billing: null, amount_min: null, amount_max: null, note: "" })),
    security_deposit: null,
    advance_months: 1,
    // Defaults the PRD asks the lister to confirm (3.3.1, step 4).
    smoking_policy: "not_allowed",
    guest_policy: "day_only",
    meal_system: null,
    study_friendly: false,
    maid_service: false,
    quiet_hours_start: "",
    quiet_hours_end: "",
    gate_open_time: "",
    gate_close_time: "",
    vibe_tags: [],
    managed_by: null,
    tenant_type: "students_only",
    rent_last_revised_at: "",
    notice_period_days: null,
    contact_channels: [...DEFAULT_CONTACT_CHANNELS],
    verified_seekers_only: false,
    title: "",
    description: "",
  };
}

/** An existing listing, as the form edits it. */
export function formFromDetail(detail: MessDetail): MessListingForm {
  const { mess } = detail;
  const base = emptyForm();
  return {
    ...base,
    subtype: detail.subtype,
    gender_policy: mess.gender_policy,
    area_id: detail.area?.id ?? "",
    area_name: detail.area?.name ?? "",
    address: detail.address ?? "",
    location: detail.location_lat != null && detail.location_lng != null ? { lat: detail.location_lat, lng: detail.location_lng } : null,
    total_rooms: mess.total_rooms,
    total_seats: mess.total_seats,
    current_residents: mess.current_residents,
    washroom_count: mess.washroom_count,
    floor_level: mess.floor_level,
    has_lift: mess.has_lift,
    has_generator: mess.has_generator,
    has_security_guard: mess.has_security_guard,
    has_cctv: mess.has_cctv,
    seats: detail.seats.length
      ? detail.seats.map((seat) => ({ ...seat, available_from: seat.available_from.slice(0, 10) }))
      : base.seats,
    charges: CHARGE_CATEGORIES.map((category) => {
      const saved = detail.charges.find((charge) => charge.category === category);
      return saved
        ? { category, billing: saved.billing, amount_min: saved.amount_min, amount_max: saved.amount_max, note: saved.note ?? "" }
        : { category, billing: null, amount_min: null, amount_max: null, note: "" };
    }),
    security_deposit: mess.security_deposit,
    advance_months: mess.advance_months,
    smoking_policy: mess.smoking_policy,
    guest_policy: mess.guest_policy,
    meal_system: mess.meal_system,
    study_friendly: mess.study_friendly,
    maid_service: mess.maid_service,
    quiet_hours_start: mess.quiet_hours_start ?? "",
    quiet_hours_end: mess.quiet_hours_end ?? "",
    gate_open_time: mess.gate_open_time ?? "",
    gate_close_time: mess.gate_close_time ?? "",
    vibe_tags: mess.vibe_tags,
    managed_by: mess.managed_by,
    tenant_type: mess.tenant_type,
    rent_last_revised_at: mess.rent_last_revised_at?.slice(0, 10) ?? "",
    notice_period_days: mess.notice_period_days,
    contact_channels: mess.contact_channels.length ? mess.contact_channels : base.contact_channels,
    verified_seekers_only: mess.verified_seekers_only,
    title: detail.title,
    description: detail.description ?? "",
  };
}

const orNull = (value: string) => (value.trim() ? value.trim() : null);

/**
 * What a step saves (POST /v1/mess). Each step sends its own fields, already
 * validated; the server merges them into the draft.
 */
export function dtoForStep(step: WizardStep, values: MessListingForm, propertyId: string | null): UpsertMessDto {
  const id = propertyId ? { property_id: propertyId } : {};
  switch (step) {
    case "place":
      return {
        ...id,
        subtype: values.subtype,
        area_id: values.area_id,
        address: values.address.trim(),
        location_lat: values.location?.lat,
        location_lng: values.location?.lng,
        mess: { gender_policy: values.gender_policy ?? undefined },
      };
    case "seats":
      return {
        ...id,
        mess: {
          total_rooms: values.total_rooms,
          total_seats: values.total_seats,
          current_residents: values.current_residents,
          washroom_count: values.washroom_count,
          floor_level: values.floor_level,
          has_lift: values.has_lift,
          has_generator: values.has_generator,
          has_security_guard: values.has_security_guard,
          has_cctv: values.has_cctv,
        },
        seats: values.seats.map((seat) => ({
          ...(seat.id ? { id: seat.id } : {}),
          room_label: seat.room_label.trim(),
          seat_type: seat.seat_type,
          beds_in_room: seat.seat_type === "single" ? 1 : seat.beds_in_room,
          washroom: seat.washroom,
          has_balcony: seat.has_balcony,
          rent: seat.rent ?? 0,
          available_from: seat.available_from,
          ...(seat.status ? { status: seat.status } : {}),
        })),
      };
    case "costs":
      return {
        ...id,
        charges: values.charges
          .filter((charge) => charge.billing !== null)
          .map((charge) => ({
            category: charge.category,
            billing: charge.billing!,
            amount_min: charge.billing === "fixed" || charge.billing === "variable" ? charge.amount_min : null,
            amount_max: charge.billing === "variable" ? charge.amount_max : null,
            note: orNull(charge.note),
          })),
        mess: { security_deposit: values.security_deposit, advance_months: values.advance_months },
      };
    case "rules":
      return {
        ...id,
        mess: {
          smoking_policy: values.smoking_policy ?? undefined,
          guest_policy: values.guest_policy ?? undefined,
          meal_system: values.meal_system ?? undefined,
          study_friendly: values.study_friendly,
          maid_service: values.maid_service,
          quiet_hours_start: orNull(values.quiet_hours_start),
          quiet_hours_end: orNull(values.quiet_hours_end),
          gate_open_time: orNull(values.gate_open_time),
          gate_close_time: orNull(values.gate_close_time),
          vibe_tags: values.vibe_tags,
          managed_by: values.managed_by ?? undefined,
          tenant_type: values.tenant_type,
          rent_last_revised_at: orNull(values.rent_last_revised_at),
          notice_period_days: values.notice_period_days,
        },
      };
    case "photos":
      return { ...id, mess: { contact_channels: values.contact_channels, verified_seekers_only: values.verified_seekers_only } };
    case "review":
      return { ...id, title: values.title.trim(), description: values.description.trim() };
  }
}

/**
 * The listing as a search card, for the Review step's "as students will see
 * it" preview. Mirrors how the server builds cards.
 */
export function previewCard(values: MessListingForm, media: MessMedia[], propertyId: string | null): MessCard {
  const seats = values.seats.map((seat) => ({ rent: seat.rent ?? 0, status: seat.status ?? ("available" as const) }));
  const answered = values.charges.filter((charge) => charge.billing !== null) as (ChargeForm & { billing: ChargeBilling })[];
  const cheapest = cheapestAllIn(seats, answered);
  const open = values.seats.filter((seat) => (seat.status ?? "available") === "available");
  const cover = [...media].sort((a, b) => a.display_order - b.display_order).find((item) => item.label === "room") ?? media[0];
  return {
    id: propertyId ?? "preview",
    title: values.title.trim() || values.address,
    subtype: values.subtype,
    area: values.area_id ? { id: values.area_id, name: values.area_name } : null,
    cover: cover ? { url: cover.url, label: cover.label } : null,
    cost: {
      all_in_min: cheapest?.min ?? 0,
      all_in_max: cheapest?.max ?? 0,
      rent_from: cheapest?.rent ?? 0,
      costs_complete: costsComplete(answered),
    },
    walk: null,
    occupancy: {
      current_residents: values.current_residents,
      available_seats: open.length,
      per_washroom: values.washroom_count > 0 ? Math.ceil(values.total_seats / values.washroom_count) : values.total_seats,
      washrooms: [...new Set(open.map((seat) => seat.washroom))],
    },
    seat_types: [...new Set(open.map((seat) => seat.seat_type))],
    gender_policy: values.gender_policy ?? "male",
    rules: deriveRuleKeys({
      smoking_policy: values.smoking_policy ?? undefined,
      quiet_hours_start: values.quiet_hours_start || null,
      gate_open_time: values.gate_open_time || null,
      gate_close_time: values.gate_close_time || null,
      study_friendly: values.study_friendly,
      meal_system: values.meal_system ?? undefined,
      guest_policy: values.guest_policy ?? undefined,
    }),
    vibe_tags: values.vibe_tags,
    is_verified: false,
    preferred_channel: values.contact_channels[0] ?? "phone",
    last_confirmed_at: new Date().toISOString(),
  };
}
