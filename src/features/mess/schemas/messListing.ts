/**
 * Validation for the listing wizard, one schema per step (PRD 3.3.2).
 *
 * Messages are translation keys (mess.validation.*), rendered with t(), so
 * errors read in the visitor's language. Each step validates on its own,
 * including its cross-field rules, so "residents cannot outnumber seats" shows
 * on the Seats step without waiting for later steps to be filled in.
 */
import { z } from "@/lib/zod"; // not "zod": this module sets jitless mode for the CSP
import type { TranslationKey } from "@/i18n";
import { CHARGE_CATEGORIES, MAX_VIBE_TAGS, REQUIRED_MEDIA_LABELS, VIBE_TAGS } from "../constants/vocabulary";
import type { MediaLabel, MessMedia } from "../types/mess";
import type { MessListingForm, WizardStep } from "../utils/wizardForm";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (value: string) => ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));

const optionalTime = z.string().refine((value) => value === "" || HHMM.test(value), "mess.validation.time");
const optionalDate = z.string().refine((value) => value === "" || isDate(value), "mess.validation.date");

function count(min: number, max: number, minMessage: TranslationKey = "mess.validation.wholeNumber") {
  return z
    .number({ error: "mess.validation.wholeNumber" })
    .int("mess.validation.wholeNumber")
    .min(min, minMessage)
    .max(max, "mess.validation.tooHigh");
}

const amount = z.number().int("mess.validation.wholeNumber").min(0, "mess.validation.negative").max(50000, "mess.validation.tooHigh");

export const placeStep = z.object({
  subtype: z.enum(["mess", "seat_share"], { error: "mess.validation.chooseOne" }),
  gender_policy: z.enum(["male", "female"], { error: "mess.validation.gender" }),
  area_id: z.string().min(1, "mess.validation.area"),
  address: z.string().trim().min(3, "mess.validation.address").max(300, "mess.validation.tooHigh"),
  location: z.object({ lat: z.number(), lng: z.number() }, { error: "mess.validation.pin" }),
});

const seatSchema = z.object({
  room_label: z.string().trim().min(1, "mess.validation.roomLabel").max(30, "mess.validation.roomLabel"),
  seat_type: z.enum(["single", "shared"], { error: "mess.validation.chooseOne" }),
  beds_in_room: count(1, 8),
  washroom: z.enum(["attached", "common"], { error: "mess.validation.chooseOne" }),
  has_balcony: z.boolean(),
  rent: z.number({ error: "mess.validation.rentLow" }).int("mess.validation.wholeNumber").min(500, "mess.validation.rentLow").max(50000, "mess.validation.tooHigh"),
  available_from: z.string().refine(isDate, "mess.validation.date"),
  status: z.enum(["available", "reserved", "filled"]).optional(),
});

export const seatsStep = z
  .object({
    total_rooms: count(1, 30, "mess.validation.rooms"),
    total_seats: count(1, 60, "mess.validation.seats"),
    current_residents: count(0, 60),
    washroom_count: count(1, 30, "mess.validation.washrooms"),
    floor_level: count(0, 40),
    has_lift: z.boolean(),
    has_generator: z.boolean(),
    has_security_guard: z.boolean(),
    has_cctv: z.boolean(),
    seats: z.array(seatSchema).min(1, "mess.validation.seats").max(40, "mess.validation.seatsMax"),
  })
  .superRefine((value, ctx) => {
    if (value.current_residents > value.total_seats) {
      ctx.addIssue({ code: "custom", path: ["current_residents"], message: "mess.validation.residents" });
    }
    const open = value.seats.filter((seat) => (seat.status ?? "available") === "available").length;
    if (value.current_residents + open > value.total_seats) {
      ctx.addIssue({ code: "custom", path: ["total_seats"], message: "mess.validation.seatsVsTotal" });
    }
  });

export const chargeSchema = z
  .object({
    category: z.enum(CHARGE_CATEGORIES),
    billing: z.enum(["included", "fixed", "variable", "not_applicable"], { error: "mess.validation.billing" }),
    amount_min: amount.nullable(),
    amount_max: amount.nullable(),
    note: z.string().max(140, "mess.validation.tooHigh"),
  })
  .superRefine((charge, ctx) => {
    if (charge.billing === "fixed" && charge.amount_min == null) {
      ctx.addIssue({ code: "custom", path: ["amount_min"], message: "mess.validation.amountFixed" });
    }
    if (charge.billing === "variable") {
      if (charge.amount_min == null || charge.amount_max == null) {
        ctx.addIssue({ code: "custom", path: [charge.amount_min == null ? "amount_min" : "amount_max"], message: "mess.validation.amountRange" });
      } else if (charge.amount_max < charge.amount_min) {
        ctx.addIssue({ code: "custom", path: ["amount_max"], message: "mess.validation.amountOrder" });
      }
    }
  });

export const costsStep = z.object({
  charges: z.array(chargeSchema).length(CHARGE_CATEGORIES.length, "mess.validation.costs"),
  security_deposit: z.number().int("mess.validation.wholeNumber").min(0, "mess.validation.negative").max(500_000, "mess.validation.tooHigh").nullable(),
  advance_months: count(0, 12),
});

export const rulesStep = z
  .object({
    smoking_policy: z.enum(["not_allowed", "balcony_only", "allowed"], { error: "mess.validation.chooseOne" }),
    guest_policy: z.enum(["not_allowed", "day_only", "overnight_with_notice", "allowed"], { error: "mess.validation.chooseOne" }),
    meal_system: z.enum(["none", "shared_bazar", "meal_manager", "cook_provided", "self_cook"], { error: "mess.validation.chooseOne" }),
    study_friendly: z.boolean(),
    maid_service: z.boolean(),
    quiet_hours_start: optionalTime,
    quiet_hours_end: optionalTime,
    gate_open_time: optionalTime,
    gate_close_time: optionalTime,
    vibe_tags: z.array(z.enum(VIBE_TAGS)).max(MAX_VIBE_TAGS, "mess.validation.vibeMax"),
    managed_by: z.enum(["landlord", "resident_manager", "agent"], { error: "mess.validation.chooseOne" }),
    tenant_type: z.enum(["students_only", "students_and_jobholders", "any"], { error: "mess.validation.chooseOne" }),
    rent_last_revised_at: optionalDate,
    notice_period_days: z.number().int("mess.validation.wholeNumber").min(0, "mess.validation.negative").max(365, "mess.validation.tooHigh").nullable(),
  })
  .superRefine((value, ctx) => {
    // Quiet hours are a pair: one end alone says nothing.
    if (value.quiet_hours_start && !value.quiet_hours_end) ctx.addIssue({ code: "custom", path: ["quiet_hours_end"], message: "mess.validation.time" });
    if (!value.quiet_hours_start && value.quiet_hours_end) ctx.addIssue({ code: "custom", path: ["quiet_hours_start"], message: "mess.validation.time" });
  });

export const contactStep = z.object({
  contact_channels: z.array(z.enum(["phone", "whatsapp", "in_app"])).min(1, "mess.validation.channels"),
  verified_seekers_only: z.boolean(),
});

export const reviewStep = z.object({
  title: z.string().trim().min(5, "mess.validation.title").max(120, "mess.validation.titleLong"),
  description: z.string().max(2000, "mess.validation.tooHigh"),
});

export const STEP_SCHEMAS = {
  place: placeStep,
  seats: seatsStep,
  costs: costsStep,
  rules: rulesStep,
  photos: contactStep,
  review: reviewStep,
} satisfies Record<WizardStep, z.ZodType>;

/** The form fields each step owns, for clearing its errors. */
export const STEP_FIELDS: Record<WizardStep, (keyof MessListingForm)[]> = {
  place: ["subtype", "gender_policy", "area_id", "address", "location"],
  seats: ["total_rooms", "total_seats", "current_residents", "washroom_count", "floor_level", "has_lift", "has_generator", "has_security_guard", "has_cctv", "seats"],
  costs: ["charges", "security_deposit", "advance_months"],
  rules: [
    "smoking_policy",
    "guest_policy",
    "meal_system",
    "study_friendly",
    "maid_service",
    "quiet_hours_start",
    "quiet_hours_end",
    "gate_open_time",
    "gate_close_time",
    "vibe_tags",
    "managed_by",
    "tenant_type",
    "rent_last_revised_at",
    "notice_period_days",
  ],
  photos: ["contact_channels", "verified_seekers_only"],
  review: ["title", "description"],
};

export interface StepIssue {
  /** Dotted form path, e.g. "seats.0.rent". */
  path: string;
  message: TranslationKey;
}

/** A step's problems, or none. */
export function validateStep(step: WizardStep, values: MessListingForm): StepIssue[] {
  const result = STEP_SCHEMAS[step].safeParse(values);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({ path: issue.path.map(String).join("."), message: issue.message as TranslationKey }));
}

const PHOTO_MESSAGES: Partial<Record<MediaLabel, TranslationKey>> = {
  room: "mess.validation.photoRoom",
  washroom: "mess.validation.photoWashroom",
  building: "mess.validation.photoBuilding",
};

/** The required photo slots still empty (PRD D8), as messages per label. */
export function missingPhotos(media: readonly MessMedia[]): { label: MediaLabel; message: TranslationKey }[] {
  return REQUIRED_MEDIA_LABELS.filter((label) => !media.some((item) => item.label === label)).map((label) => ({
    label,
    message: PHOTO_MESSAGES[label]!,
  }));
}
