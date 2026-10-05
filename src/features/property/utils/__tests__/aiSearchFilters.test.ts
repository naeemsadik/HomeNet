import type { Area } from "@/types/api";
import {
  areaIdsFor,
  describeSearch,
  resolveArea,
  toSearchQuery,
  withoutFields,
} from "../aiSearchFilters";

const area = (id: string, name: string, parent: string | null = null): Area => ({
  id,
  name,
  city: "Dhaka",
  parent_area_id: parent,
});

// The shape of the live data: parents with listings only under their children.
const areas = [
  area("gulshan", "Gulshan"),
  area("gulshan-1", "Gulshan-1", "gulshan"),
  area("gulshan-2", "Gulshan-2", "gulshan"),
  area("banani", "Banani"),
  area("uttara", "Uttara"),
  area("sector-7", "Sector-7", "uttara"),
  area("mirpur", "Mirpur"),
  area("mirpur-10", "Mirpur-10", "mirpur"),
];

describe("resolveArea", () => {
  it("matches a name however it is punctuated or cased", () => {
    expect(resolveArea("Gulshan 2", areas)?.id).toBe("gulshan-2");
    expect(resolveArea("gulshan-2", areas)?.id).toBe("gulshan-2");
    expect(resolveArea("  BANANI ", areas)?.id).toBe("banani");
  });

  it("prefers the parent for a bare parent name", () => {
    expect(resolveArea("Gulshan", areas)?.id).toBe("gulshan");
  });

  it("finds the most specific area named inside longer text", () => {
    expect(resolveArea("Gulshan-2, Dhaka", areas)?.id).toBe("gulshan-2");
    expect(resolveArea("near Gulshan avenue", areas)?.id).toBe("gulshan");
  });

  it("reads a sector together with its parent", () => {
    expect(resolveArea("Uttara sector 7", areas)?.id).toBe("sector-7");
  });

  it("returns null for an unknown or empty place instead of guessing", () => {
    expect(resolveArea("Narnia", areas)).toBeNull();
    expect(resolveArea("", areas)).toBeNull();
    expect(resolveArea(undefined, areas)).toBeNull();
  });

  it("returns null when two areas share the name", () => {
    const twins = [area("a", "Uttara"), area("p1", "Park"), area("p2", "Park"), ...areas.slice(0, 1)];
    expect(resolveArea("Park", twins)).toBeNull();
  });
});

describe("areaIdsFor", () => {
  it("covers a parent and its sub-areas, because area_id matches one area only", () => {
    expect(areaIdsFor(areas[0], areas)).toEqual(["gulshan", "gulshan-1", "gulshan-2"]);
  });

  it("covers just the area when it has no children", () => {
    expect(areaIdsFor(areas[3], areas)).toEqual(["banani"]);
  });
});

describe("toSearchQuery", () => {
  it("maps a parsed search onto the properties filters", () => {
    const { filters, area: matched, areaIds } = toSearchQuery(
      {
        listingType: "sale",
        type: "residential",
        minPrice: 10_000_000,
        maxPrice: 30_000_000,
        minArea: 1200,
        bedrooms: 3,
        bathrooms: 2,
        areaName: "Gulshan",
      },
      areas,
    );
    expect(filters).toEqual({
      status: "active",
      limit: 12,
      listing_type: "sale",
      type: "residential",
      min_price: 10_000_000,
      max_price: 30_000_000,
      min_area: 1200,
      bedrooms: 3,
      bathrooms: 2,
    });
    expect(matched?.id).toBe("gulshan");
    expect(areaIds).toEqual(["gulshan", "gulshan-1", "gulshan-2"]);
  });

  it("searches an unmatched place as text so it still narrows the results", () => {
    const { filters, area: matched, areaIds } = toSearchQuery({ areaName: "Narnia", city: "Dhaka" }, areas);
    expect(matched).toBeNull();
    expect(areaIds).toEqual([]);
    expect(filters).toMatchObject({ search: "Narnia", city: "Dhaka" });
  });

  it("does not add a city or text search when the area was matched", () => {
    const { filters } = toSearchQuery({ areaName: "Banani", city: "Dhaka" }, areas);
    expect(filters.city).toBeUndefined();
    expect(filters.search).toBeUndefined();
  });

  it("falls back to text search while areas are not loaded", () => {
    const { filters, areaIds } = toSearchQuery({ areaName: "Banani" }, []);
    expect(areaIds).toEqual([]);
    expect(filters.search).toBe("Banani");
  });
});

describe("describeSearch", () => {
  it("lists what was understood, in plain words", () => {
    const chips = describeSearch(
      { listingType: "rent", type: "residential", maxPrice: 40_000, bedrooms: 2, areaName: "Dhanmondi" },
      null,
    );
    expect(chips.map((c) => c.label)).toEqual(["For rent", "Residential", "Dhanmondi", "Up to ৳ 40,000", "2+ bedrooms"]);
  });

  it("writes prices in crore and lakh, as ranges or one-sided", () => {
    const label = (p: Parameters<typeof describeSearch>[0]) => describeSearch(p, null).find((c) => c.id === "price")?.label;
    expect(label({ minPrice: 5_000_000, maxPrice: 15_000_000 })).toBe("৳ 50 Lac – ৳ 1.50 Cr");
    expect(label({ minPrice: 20_000_000 })).toBe("From ৳ 2 Cr");
    expect(label({ maxPrice: 20_000_000 })).toBe("Up to ৳ 2 Cr");
  });

  it("shows the matched area's own name", () => {
    expect(describeSearch({ areaName: "gulshan 2" }, areas[2])[0].label).toBe("Gulshan-2");
  });

  it("describes size ranges", () => {
    const label = (p: Parameters<typeof describeSearch>[0]) => describeSearch(p, null).find((c) => c.id === "size")?.label;
    expect(label({ minArea: 1000, maxArea: 1800 })).toBe("1,000 – 1,800 sqft");
    expect(label({ minArea: 1500 })).toBe("1,500+ sqft");
  });

  it("carries the least certain confidence for a chip", () => {
    const [chip] = describeSearch(
      { maxPrice: 1, minPrice: 0, confidence: { minPrice: "high", maxPrice: "low" } },
      null,
    );
    expect(chip.confidence).toBe("low");
  });

  it("is empty when nothing was understood", () => {
    expect(describeSearch({ summary: "hello", unmatched: ["hello"] }, null)).toEqual([]);
  });
});

describe("withoutFields", () => {
  it("drops a removed chip's fields and leaves the rest", () => {
    const parsed = { minPrice: 1, maxPrice: 2, bedrooms: 3, summary: "x" };
    expect(withoutFields(parsed, ["minPrice", "maxPrice"])).toEqual({ bedrooms: 3, summary: "x" });
    expect(parsed.minPrice).toBe(1);
  });
});
