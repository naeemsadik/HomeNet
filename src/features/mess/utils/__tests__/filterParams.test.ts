import {
  clearedFilters,
  countActiveFilters,
  filtersFromParams,
  filtersToParamPatch,
  filtersToParams,
  toApiParams,
} from "../filterParams";
import type { MessFilters } from "../../types/mess";

const FULL: MessFilters = {
  campus_id: "c-uiu",
  max_walk_min: 15,
  gender: "male",
  min_all_in: 4000,
  max_all_in: 8000,
  seat_type: "single",
  washroom: "attached",
  no_smoking: true,
  study_friendly: true,
  has_lift: true,
  has_balcony: true,
  meal_system: ["meal_manager", "self_cook"],
  guest_policy: ["day_only"],
  gate_open_by: "05:30",
  available_by: "2026-12-01",
  costs_complete: true,
  is_verified: true,
  sort_by: "all_in_asc",
};

describe("filter params", () => {
  it("round-trips every filter through the URL", () => {
    expect(filtersFromParams(filtersToParams(FULL))).toEqual(FULL);
  });

  it("writes only the filters in use", () => {
    expect(filtersToParams({ campus_id: "c-uiu", no_smoking: false })).toEqual({ campus_id: "c-uiu" });
  });

  it("drops what a hand-edited URL got wrong instead of sending it", () => {
    expect(
      filtersFromParams({
        gender: "mixed",
        max_walk_min: "3",
        seat_type: "suite",
        meal_system: "meal_manager,banquet",
        gate_open_by: "25:00",
        available_by: "soon",
        sort_by: "cheapest",
        no_smoking: "yes",
      }),
    ).toEqual({ meal_system: ["meal_manager"] });
  });

  it("swaps a budget whose min is above its max", () => {
    expect(filtersFromParams({ min_all_in: "9000", max_all_in: "5000" })).toEqual({ min_all_in: 5000, max_all_in: 9000 });
  });

  it("takes the first value when expo-router hands back an array", () => {
    expect(filtersFromParams({ gender: ["female", "male"] })).toEqual({ gender: "female" });
  });

  it("blanks the params a change removed, and only those", () => {
    const patch = filtersToParamPatch({ campus_id: "c-uiu" }, { campus_id: "c-uiu", gender: "male", seat_type: "", unrelated: "x" });
    expect(patch).toEqual({ campus_id: "c-uiu", gender: "" });
  });
});

describe("toApiParams", () => {
  it("sends lists as CSV and booleans only when true", () => {
    expect(toApiParams({ campus_id: "c", meal_system: ["none", "self_cook"], no_smoking: true, has_lift: false }, 2, 20)).toEqual({
      page: 2,
      limit: 20,
      campus_id: "c",
      meal_system: "none,self_cook",
      no_smoking: true,
    });
  });

  it("leaves out the walk filter and walk sort without a campus", () => {
    expect(toApiParams({ max_walk_min: 10, sort_by: "walk_asc" }, 1, 20)).toEqual({ page: 1, limit: 20 });
  });
});

describe("countActiveFilters and clearedFilters", () => {
  it("counts filters but not the campus or the sort", () => {
    expect(countActiveFilters({ campus_id: "c", sort_by: "newest" })).toBe(0);
    expect(countActiveFilters({ min_all_in: 1, max_all_in: 2, no_smoking: true })).toBe(2);
  });

  it("keeps the campus and sort when clearing", () => {
    expect(clearedFilters(FULL)).toEqual({ campus_id: "c-uiu", sort_by: "all_in_asc" });
  });
});
