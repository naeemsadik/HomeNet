/**
 * The checks a mess listing must pass before it can be submitted for review
 * (PRD v1.0, section 2.3.4). The API runs the same list on
 * POST /v1/properties/:id/submit and answers 422 with one message per failed
 * check; the demo backend and the moderator's checklist on the listing page
 * use this function, so all three agree.
 *
 * The wizard does not call it: it checks the same rules field by field on the
 * form (schemas/messListing.ts), where each problem can point at its input.
 */
import { REQUIRED_MEDIA_LABELS } from "../constants/vocabulary";
import type { MediaLabel, MessDetailsInput, Seat, UtilityCharge } from "../types/mess";
import { costsComplete } from "./allInCost";

export type CompletenessKey =
  | "costs"
  | "available_seat"
  | "pin"
  | `photo_${"room" | "washroom" | "building"}`
  | "gender_policy"
  | "smoking_policy"
  | "meal_system"
  | "guest_policy"
  | "current_residents"
  | "contact_channels"
  | "residents_fit";

export interface CompletenessCheck {
  key: CompletenessKey;
  ok: boolean;
}

/** What the checks read: a stored draft (partial) or a full listing from GET /v1/mess/:id. */
export interface CompletenessInput {
  mess: Partial<MessDetailsInput> | null | undefined;
  seats: readonly Pick<Seat, "status">[];
  charges: readonly Pick<UtilityCharge, "category" | "billing">[];
  media: readonly { label: MediaLabel | null }[];
  location_lat: number | null | undefined;
  location_lng: number | null | undefined;
}

const REQUIRED_FIELDS = ["gender_policy", "smoking_policy", "meal_system", "guest_policy", "current_residents"] as const;

const present = (value: unknown) => value !== undefined && value !== null && value !== "";

/** Every check, in the order the lister fills the wizard. */
export function completenessChecks(listing: CompletenessInput): CompletenessCheck[] {
  const mess = listing.mess ?? {};
  const checks: CompletenessCheck[] = [
    { key: "pin", ok: listing.location_lat != null && listing.location_lng != null },
    { key: "gender_policy", ok: present(mess.gender_policy) },
    { key: "current_residents", ok: present(mess.current_residents) },
    {
      key: "residents_fit",
      ok: !present(mess.current_residents) || !present(mess.total_seats) || mess.current_residents! <= mess.total_seats!,
    },
    { key: "available_seat", ok: listing.seats.some((seat) => seat.status === "available") },
    { key: "costs", ok: costsComplete(listing.charges) },
  ];
  for (const field of REQUIRED_FIELDS) {
    if (field !== "gender_policy" && field !== "current_residents") checks.push({ key: field, ok: present(mess[field]) });
  }
  for (const label of REQUIRED_MEDIA_LABELS) {
    checks.push({ key: `photo_${label}` as CompletenessKey, ok: listing.media.some((item) => item.label === label) });
  }
  checks.push({ key: "contact_channels", ok: (mess.contact_channels?.length ?? 0) > 0 });
  return checks;
}

/** The checks that fail; empty when the listing can be submitted. */
export function missingForSubmit(listing: CompletenessInput): CompletenessKey[] {
  return completenessChecks(listing)
    .filter((check) => !check.ok)
    .map((check) => check.key);
}
