/**
 * The all-in monthly cost of a seat: rent plus every fixed and estimated
 * variable charge, per seat per month (PRD D1).
 *
 * Must match the backend formula (PRD 2.5): the server stores the result of
 * cheapestAllIn() as mess_details.all_in_min/max and filters budgets on it.
 */
import { CHARGE_CATEGORIES } from "../constants/vocabulary";
import type { ChargeBilling, ChargeCategory, SeatStatus } from "../types/mess";

type ChargeLike = { billing: ChargeBilling | null | undefined; amount_min?: number | null; amount_max?: number | null };

export interface CostRange {
  min: number;
  max: number;
  isRange: boolean;
}

/** What the charges alone add to a seat's rent. Included and not-applicable rows add nothing. */
export function chargesTotal(charges: readonly ChargeLike[]): CostRange {
  let min = 0;
  let max = 0;
  for (const ch of charges) {
    if (ch.billing === "fixed") {
      min += ch.amount_min ?? 0;
      max += ch.amount_min ?? 0;
    }
    if (ch.billing === "variable") {
      min += ch.amount_min ?? 0;
      max += ch.amount_max ?? ch.amount_min ?? 0;
    }
  }
  return { min, max, isRange: max > min };
}

export function allInCost(rent: number, charges: readonly ChargeLike[]): CostRange {
  const extra = chargesTotal(charges);
  const min = rent + extra.min;
  const max = rent + extra.max;
  return { min, max, isRange: max > min };
}

/**
 * The cheapest available seat's all-in range, or null when no seat is open.
 * Charges are per listing, so the cheapest rent is the cheapest all-in.
 */
export function cheapestAllIn(
  seats: readonly { rent: number; status?: SeatStatus }[],
  charges: readonly ChargeLike[],
): (CostRange & { rent: number }) | null {
  const open = seats.filter((seat) => (seat.status ?? "available") === "available" && Number.isFinite(seat.rent));
  if (open.length === 0) return null;
  const rent = Math.min(...open.map((seat) => seat.rent));
  return { ...allInCost(rent, charges), rent };
}

/** True when every charge category has an answer: the "All costs declared" rule. */
export function costsComplete(charges: readonly { category: ChargeCategory; billing: ChargeBilling | null | undefined }[]): boolean {
  return CHARGE_CATEGORIES.every((category) => charges.some((ch) => ch.category === category && ch.billing != null));
}
