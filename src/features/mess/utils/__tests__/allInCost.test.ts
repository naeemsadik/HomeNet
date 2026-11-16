import { allInCost, chargesTotal, cheapestAllIn, costsComplete } from "../allInCost";
import { CHARGE_CATEGORIES } from "../../constants/vocabulary";
import type { UtilityCharge } from "../../types/mess";

const charge = (partial: Partial<UtilityCharge> & Pick<UtilityCharge, "category" | "billing">): UtilityCharge => ({
  amount_min: null,
  amount_max: null,
  note: null,
  ...partial,
});

// The PRD's worked example: rent 5,000, bills 1,050 to 1,200 (electricity varies).
const EXAMPLE: UtilityCharge[] = [
  charge({ category: "electricity", billing: "variable", amount_min: 400, amount_max: 550 }),
  charge({ category: "gas", billing: "fixed", amount_min: 250 }),
  charge({ category: "water", billing: "included" }),
  charge({ category: "waste", billing: "fixed", amount_min: 50 }),
  charge({ category: "internet", billing: "fixed", amount_min: 150 }),
  charge({ category: "maid", billing: "fixed", amount_min: 200 }),
  charge({ category: "meal", billing: "not_applicable" }),
  charge({ category: "service_charge", billing: "not_applicable" }),
];

describe("allInCost", () => {
  it("adds fixed amounts to both ends and variable ranges low to high", () => {
    expect(allInCost(5000, EXAMPLE)).toEqual({ min: 6050, max: 6200, isRange: true });
  });

  it("is a single figure when nothing varies", () => {
    const fixedOnly = EXAMPLE.filter((ch) => ch.billing !== "variable");
    expect(allInCost(5000, fixedOnly)).toEqual({ min: 5650, max: 5650, isRange: false });
  });

  it("adds nothing for included and not-applicable rows, even with amounts left in them", () => {
    const stale = [charge({ category: "water", billing: "included", amount_min: 300 }), charge({ category: "meal", billing: "not_applicable", amount_min: 900 })];
    expect(allInCost(4000, stale)).toEqual({ min: 4000, max: 4000, isRange: false });
  });

  it("treats a variable row with no high estimate as its low estimate", () => {
    expect(chargesTotal([charge({ category: "electricity", billing: "variable", amount_min: 400 })])).toEqual({ min: 400, max: 400, isRange: false });
  });
});

describe("cheapestAllIn", () => {
  it("prices the cheapest open seat, ignoring filled and reserved ones", () => {
    const seats = [
      { rent: 3000, status: "filled" as const },
      { rent: 3500, status: "reserved" as const },
      { rent: 5000, status: "available" as const },
      { rent: 4200, status: "available" as const },
    ];
    expect(cheapestAllIn(seats, EXAMPLE)).toEqual({ min: 5250, max: 5400, isRange: true, rent: 4200 });
  });

  it("is null when no seat is open", () => {
    expect(cheapestAllIn([{ rent: 3000, status: "filled" }], EXAMPLE)).toBeNull();
  });

  it("counts a seat with no status yet (a wizard draft) as open", () => {
    expect(cheapestAllIn([{ rent: 3000 }], [])?.min).toBe(3000);
  });
});

describe("costsComplete", () => {
  it("needs an answer for every one of the eight categories", () => {
    expect(costsComplete(EXAMPLE)).toBe(true);
    expect(costsComplete(EXAMPLE.slice(1))).toBe(false);
    expect(CHARGE_CATEGORIES).toHaveLength(8);
  });

  it("does not count a row left unanswered", () => {
    const unanswered = EXAMPLE.map((ch) => (ch.category === "gas" ? { ...ch, billing: null } : ch));
    expect(costsComplete(unanswered)).toBe(false);
  });
});
