/**
 * Mess & Seat Share: the API contract (PRD v1.0, sections 2.2 and 2.3).
 *
 * A mess listing is a Property row (type residential, listing_type rent,
 * subtype "mess" or "seat_share") with a MessDetails row, seats, utility
 * charges and precomputed campus distances. Field names are snake_case, as the
 * API returns them.
 */
import type { PropertyStatus } from "@/types/api";
import type { CHARGE_CATEGORIES, VIBE_TAGS } from "../constants/vocabulary";

export type MessSubtype = "mess" | "seat_share";
export type MessGenderPolicy = "male" | "female";
export type MessTenantType = "students_only" | "students_and_jobholders" | "any";
export type MessManagedBy = "landlord" | "resident_manager" | "agent";
/** single: a room of one's own; shared: a bed in a shared room. */
export type SeatType = "single" | "shared";
export type WashroomType = "attached" | "common";
export type SeatStatus = "available" | "reserved" | "filled";
export type ChargeCategory = (typeof CHARGE_CATEGORIES)[number];
export type ChargeBilling = "included" | "fixed" | "variable" | "not_applicable";
export type SmokingPolicy = "not_allowed" | "balcony_only" | "allowed";
export type MealSystem = "none" | "shared_bazar" | "meal_manager" | "cook_provided" | "self_cook";
export type GuestPolicy = "not_allowed" | "day_only" | "overnight_with_notice" | "allowed";
export type ContactChannel = "phone" | "whatsapp" | "in_app";
export type MediaLabel = "room" | "washroom" | "building" | "kitchen" | "common_area" | "other";
export type VibeTag = (typeof VIBE_TAGS)[number];

/**
 * House-rule keys the server derives from the structured fields, so the badge
 * set can never contradict the filter set. Times are 24-hour "HHMM".
 * See utils/rules.ts for the derivation and the labels.
 */
export type RuleKey =
  | "no_smoking_indoors"
  | "smoking_balcony_only"
  | "smoking_allowed"
  | `quiet_after_${string}`
  | `gate_opens_${string}`
  | `gate_closes_${string}`
  | "study_friendly"
  | "no_meal_system"
  | "shared_bazar"
  | "meal_manager"
  | "cook_provided"
  | "self_cook"
  | "guests_not_allowed"
  | "guests_day_only"
  | "guests_overnight_with_notice"
  | "guests_allowed";

// ─── Universities ────────────────────────────────────────────────────────────

/** Distances are measured to a campus gate, not to a university. */
export interface Campus {
  id: string;
  university_id: string;
  name: string;
  area_id: string | null;
  lat: number;
  lng: number;
  is_primary: boolean;
}

export interface University {
  id: string;
  name: string;
  short_name: string;
  city: string;
  campuses: Campus[];
}

// ─── Listing parts ───────────────────────────────────────────────────────────

/** One row per category per listing. Amounts are BDT per seat per month. */
export interface UtilityCharge {
  category: ChargeCategory;
  billing: ChargeBilling;
  /** fixed: the amount; variable: the low estimate. */
  amount_min: number | null;
  /** variable: the high estimate. */
  amount_max: number | null;
  note: string | null;
}

export interface Seat {
  id: string;
  room_label: string;
  seat_type: SeatType;
  /** 1 for a single seat. */
  beds_in_room: number;
  washroom: WashroomType;
  has_balcony: boolean;
  /** BDT per month for this seat. */
  rent: number;
  /** ISO date. */
  available_from: string;
  status: SeatStatus;
}

export interface MessMedia {
  id: string;
  url: string;
  label: MediaLabel | null;
  display_order: number;
}

/** Walking distance from a listing to one campus, computed by the platform from the map pin. */
export interface CampusDistance {
  campus_id: string;
  campus_name: string;
  university_short: string;
  walking_min: number;
  walking_m: number;
  /** True when routing failed and the distance is a straight-line estimate. */
  approximate: boolean;
}

/** The structured mess facts the lister enters (MessDetails, minus what the server derives). */
export interface MessDetailsInput {
  gender_policy: MessGenderPolicy;
  tenant_type: MessTenantType;
  managed_by: MessManagedBy;
  total_rooms: number;
  total_seats: number;
  current_residents: number;
  washroom_count: number;
  floor_level: number;
  has_lift: boolean;
  has_generator: boolean;
  has_security_guard: boolean;
  has_cctv: boolean;
  /** "HH:mm", 24-hour local time. */
  gate_open_time: string | null;
  gate_close_time: string | null;
  smoking_policy: SmokingPolicy;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  study_friendly: boolean;
  guest_policy: GuestPolicy;
  meal_system: MealSystem;
  maid_service: boolean;
  vibe_tags: VibeTag[];
  security_deposit: number | null;
  advance_months: number;
  notice_period_days: number | null;
  rent_last_revised_at: string | null;
  /** Ordered: [0] is the preferred channel. */
  contact_channels: ContactChannel[];
  verified_seekers_only: boolean;
}

/** MessDetails as the API returns it: the input plus the server's denormalized fields. */
export interface MessDetails extends MessDetailsInput {
  /** Cheapest available seat, rent plus charges, low end. */
  all_in_min: number;
  /** The same seat, high end of variable charges. */
  all_in_max: number;
  costs_complete: boolean;
  available_seats: number;
  last_confirmed_at: string;
}

// ─── Read shapes ─────────────────────────────────────────────────────────────

/** A search result (GET /v1/mess). */
export interface MessCard {
  id: string;
  title: string;
  subtype: MessSubtype;
  area: { id: string; name: string } | null;
  cover: { url: string; label: MediaLabel | null } | null;
  cost: { all_in_min: number; all_in_max: number; rent_from: number; costs_complete: boolean };
  /** Present only when the search named a campus. */
  walk: { campus_short: string; walking_min: number; walking_m: number; approximate: boolean } | null;
  occupancy: {
    current_residents: number;
    available_seats: number;
    per_washroom: number;
    washrooms: WashroomType[];
  };
  seat_types: SeatType[];
  gender_policy: MessGenderPolicy;
  rules: RuleKey[];
  vibe_tags: VibeTag[];
  is_verified: boolean;
  preferred_channel: ContactChannel;
  last_confirmed_at: string;
}

/** Full detail (GET /v1/mess/:id). Never contains a phone number or email. */
export interface MessDetail {
  id: string;
  title: string;
  description: string | null;
  subtype: MessSubtype;
  status: PropertyStatus;
  is_verified: boolean;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  area: { id: string; name: string } | null;
  lister: { id: string; full_name: string; avatar_url: string | null } | null;
  media: MessMedia[];
  mess: MessDetails;
  seats: Seat[];
  charges: UtilityCharge[];
  /** Walking distances to every campus within 6 km, nearest first. */
  distances: CampusDistance[];
  rules: RuleKey[];
  created_at: string;
  updated_at: string;
}

/** A row on the lister dashboard (GET /v1/mess/my). */
export interface MyMessListing {
  id: string;
  title: string;
  subtype: MessSubtype;
  status: PropertyStatus;
  area: { id: string; name: string } | null;
  cover: { url: string; label: MediaLabel | null } | null;
  seats: Seat[];
  available_seats: number;
  all_in_min: number;
  all_in_max: number;
  costs_complete: boolean;
  last_confirmed_at: string;
  /** Contact reveals in the last 7 days. */
  reveals_7d: number;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export type MessSort = "walk_asc" | "all_in_asc" | "newest" | "recently_confirmed";

/** GET /v1/mess query parameters (PRD 2.3.1). Booleans are only sent when true. */
export interface MessFilters {
  campus_id?: string;
  /** 5 to 60. Requires campus_id. */
  max_walk_min?: number;
  lat?: number;
  lng?: number;
  /** Metres. */
  radius?: number;
  area_id?: string;
  gender?: MessGenderPolicy;
  min_all_in?: number;
  max_all_in?: number;
  seat_type?: SeatType;
  washroom?: WashroomType;
  no_smoking?: boolean;
  study_friendly?: boolean;
  has_lift?: boolean;
  has_balcony?: boolean;
  meal_system?: MealSystem[];
  guest_policy?: GuestPolicy[];
  /** "HH:mm": the gate opens at or before this time. */
  gate_open_by?: string;
  /** ISO date: a seat is free by then. */
  available_by?: string;
  costs_complete?: boolean;
  is_verified?: boolean;
  sort_by?: MessSort;
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export interface SeatInput {
  id?: string;
  room_label: string;
  seat_type: SeatType;
  beds_in_room: number;
  washroom: WashroomType;
  has_balcony: boolean;
  rent: number;
  available_from: string;
  status?: SeatStatus;
}

export interface UtilityChargeInput {
  category: ChargeCategory;
  billing: ChargeBilling;
  amount_min?: number | null;
  amount_max?: number | null;
  note?: string | null;
}

/**
 * POST /v1/mess: upsert a draft. property_id present means update. Seats and
 * charges, when present, replace the stored set.
 */
export interface UpsertMessDto {
  property_id?: string;
  area_id?: string;
  subtype?: MessSubtype;
  title?: string;
  description?: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  mess?: Partial<MessDetailsInput>;
  seats?: SeatInput[];
  charges?: UtilityChargeInput[];
}

export interface MessMutationResult {
  id: string;
  status: PropertyStatus;
}

/** POST /v1/mess/:id/contact: one field, matching the channel asked for. */
export interface ContactResult {
  phone?: string;
  whatsapp_url?: string;
  /** P1: in-app chat. */
  conversation_id?: string;
}

export type ReportReason = "fake_listing" | "already_filled" | "wrong_price" | "broker_spam" | "inappropriate" | "other";

export interface SeekerPreference {
  campus_id: string | null;
  gender: MessGenderPolicy | null;
  max_all_in: number | null;
  lifestyle_tags: VibeTag[];
}
