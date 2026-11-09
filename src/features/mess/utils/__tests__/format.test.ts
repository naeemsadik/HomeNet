import { translate } from "@/i18n";
import { activeFilterChips } from "../filterChips";
import { daysSince, formatDate, formatDistance, formatTaka, formatTakaRange } from "../format";
import type { TranslationKey } from "@/i18n";

const en = (key: TranslationKey, params?: Record<string, string | number>) => translate("en", key, params);
const bn = (key: TranslationKey, params?: Record<string, string | number>) => translate("bn", key, params);

describe("money", () => {
  it("formats taka with grouping, never as Contact for price", () => {
    expect(formatTaka(6050, "en")).toBe("৳ 6,050");
    expect(formatTaka(0, "en")).toBe("৳ 0");
    expect(formatTaka(1, "en")).toBe("৳ 1");
    expect(formatTaka(125000, "en")).toBe("৳ 125,000");
    expect(formatTaka(6050, "bn")).toBe("৳ ৬,০৫০");
  });

  it("collapses a range whose ends match", () => {
    expect(formatTakaRange(6050, 6200, "en", en)).toBe("৳ 6,050 to ৳ 6,200");
    expect(formatTakaRange(6050, 6050, "en", en)).toBe("৳ 6,050");
  });
});

describe("distance and dates", () => {
  it("rounds short distances to 50 m and long ones to 0.1 km", () => {
    expect(formatDistance(948, "en", en)).toBe("950 m");
    expect(formatDistance(1240, "en", en)).toBe("1.2 km");
    expect(formatDistance(1240, "bn", bn)).toBe("১.২ কিমি");
  });

  it("formats ISO dates without a time-zone shift, adding the year only when it differs", () => {
    const now = new Date(2026, 10, 10);
    expect(formatDate("2026-12-01", "en", now)).toBe("1 Dec");
    expect(formatDate("2027-01-15", "en", now)).toBe("15 Jan 2027");
    expect(formatDate("2026-12-01", "bn", now)).toBe("১ ডিসেম্বর");
  });

  it("counts whole days since a timestamp", () => {
    const now = Date.parse("2026-11-10T12:00:00Z");
    expect(daysSince("2026-11-10T01:00:00Z", now)).toBe(0);
    expect(daysSince("2026-11-08T12:00:00Z", now)).toBe(2);
    expect(daysSince("not a date", now)).toBe(0);
  });
});

describe("activeFilterChips", () => {
  it("makes one removable chip per filter, and one per value of a multi-choice filter", () => {
    const filters = { campus_id: "c", max_walk_min: 15, max_all_in: 8000, meal_system: ["meal_manager" as const, "self_cook" as const], gate_open_by: "05:30" };
    const chips = activeFilterChips(filters, en, "en");
    expect(chips.map((chip) => chip.label)).toEqual(["Up to 15 min walk", "Up to ৳ 8,000", "Meal manager", "Cook your own", "Gate opens by 5:30 am"]);
    expect(chips[2].remove(filters)).toEqual({ ...filters, meal_system: ["self_cook"] });
    expect(chips[1].remove(filters)).not.toHaveProperty("max_all_in");
  });

  it("shows no walk chip without a campus, since the walk filter is not applied then", () => {
    expect(activeFilterChips({ max_walk_min: 15 }, en, "en")).toEqual([]);
  });
});
