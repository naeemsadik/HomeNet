/**
 * The fixed vocabularies of the mess module. Values only: every label is in
 * src/i18n/locales (the `mess` namespace), in English and hand-written Bangla.
 *
 * Vibe tags live in code rather than in a database enum so they can grow
 * without a migration; the API's DTO validates against the same list.
 */
import type {
  ContactChannel,
  GuestPolicy,
  MealSystem,
  MediaLabel,
  MessManagedBy,
  MessTenantType,
  SmokingPolicy,
} from "../types/mess";

/** Every listing must answer all of these before it can be submitted. */
export const CHARGE_CATEGORIES = [
  "electricity",
  "gas",
  "water",
  "waste",
  "internet",
  "maid",
  "meal",
  "service_charge",
] as const;

export const VIBE_TAGS = [
  "quiet",
  "early_risers",
  "night_owls",
  "study_focused",
  "gamers_welcome",
  "regular_prayer",
  "cook_together",
  "fitness",
  "music_ok_with_headphones",
  "clean_freak",
] as const;

export const MAX_VIBE_TAGS = 5;

export const SMOKING_POLICIES: readonly SmokingPolicy[] = ["not_allowed", "balcony_only", "allowed"];
export const MEAL_SYSTEMS: readonly MealSystem[] = ["none", "shared_bazar", "meal_manager", "cook_provided", "self_cook"];
export const GUEST_POLICIES: readonly GuestPolicy[] = ["not_allowed", "day_only", "overnight_with_notice", "allowed"];
export const TENANT_TYPES: readonly MessTenantType[] = ["students_only", "students_and_jobholders", "any"];
export const MANAGED_BY: readonly MessManagedBy[] = ["landlord", "resident_manager", "agent"];
export const CONTACT_CHANNELS: readonly ContactChannel[] = ["phone", "whatsapp", "in_app"];

/** Photo slots a mess listing must fill before submit (PRD D8). */
export const REQUIRED_MEDIA_LABELS: readonly MediaLabel[] = ["room", "washroom", "building"];
export const OPTIONAL_MEDIA_LABELS: readonly MediaLabel[] = ["kitchen", "common_area", "other"];
export const MEDIA_LABELS: readonly MediaLabel[] = [...REQUIRED_MEDIA_LABELS, ...OPTIONAL_MEDIA_LABELS];

/** In-app chat is P1: listers cannot pick it yet. */
export const SELECTABLE_CONTACT_CHANNELS: readonly ContactChannel[] = ["phone", "whatsapp"];

/** Survey defaults: mess residents prefer a call (66.7%), then WhatsApp. */
export const DEFAULT_CONTACT_CHANNELS: ContactChannel[] = ["phone", "whatsapp"];

/** Walk-time presets in the filter sheet, minutes. */
export const WALK_PRESETS = [5, 10, 15, 20, 30] as const;
/** All-in budget presets, BDT per month. */
export const BUDGET_PRESETS = [5000, 8000, 12000] as const;
/** Gate-opening presets for the Fajr-time filter. */
export const GATE_OPEN_PRESETS = ["05:00", "05:30", "06:00"] as const;

/** Unconfirmed listings drop out of search after this many days. */
export const FRESHNESS_HIDE_DAYS = 30;
/** Cards show the freshness stamp once a confirmation is older than this. */
export const FRESHNESS_CARD_DAYS = 7;
