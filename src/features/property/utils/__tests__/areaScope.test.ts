import type { Area } from "@/types/api";
import {
  areaCentre,
  areaIdsWithChildren,
  areaOptions,
  findArea,
  isCityName,
  resolveScope,
} from "../areaScope";

const area = (id: string, name: string, extra: Partial<Area> = {}): Area => ({
  id,
  name,
  city: "Dhaka",
  parent_area_id: null,
  center_lat: null,
  center_lng: null,
  ...extra,
});

const areas: Area[] = [
  area("g", "Gulshan", { center_lat: 23.7922, center_lng: 90.4156 }),
  area("g1", "Gulshan-1", { parent_area_id: "g" }),
  area("g2", "Gulshan-2", { parent_area_id: "g" }),
  area("b", "Banani", { center_lat: 23.7903, center_lng: 90.4077 }),
  area("bd", "Bashundhara", { center_lat: 23.8189, center_lng: 90.4368 }),
  area("m", "Mirpur"), // no centre known
  area("c", "Agrabad", { city: "Chattogram" }),
];

describe("isCityName", () => {
  it.each(["Dhaka", "dhaka", "Chattogram", "Sylhet", "Cox's Bazar", "coxs-bazar"])("knows %s is a city", (name) => {
    expect(isCityName(name)).toBe(true);
  });
  it.each(["Gulshan", "Dhaka Cantonment", ""])("knows %p is not a city", (name) => {
    expect(isCityName(name)).toBe(false);
  });
});

describe("findArea", () => {
  it("matches a name however it is spaced or punctuated", () => {
    expect(findArea("Gulshan 1", areas)?.id).toBe("g1");
    expect(findArea("gulshan-1", areas)?.id).toBe("g1");
    expect(findArea("GULSHAN", areas)?.id).toBe("g");
  });

  it("matches the longest area name a longer name starts with", () => {
    expect(findArea("Bashundhara R/A", areas)?.id).toBe("bd");
    expect(findArea("Gulshan 2 Circle", areas)?.id).toBe("g2");
  });

  it("does not guess from a short or unrelated name", () => {
    expect(findArea("Dhanmondi", areas)).toBeNull();
    expect(findArea("Ban", areas)).toBeNull();
    expect(findArea("", areas)).toBeNull();
  });
});

describe("areaIdsWithChildren", () => {
  it("includes the sub-areas, so Gulshan covers Gulshan-1 and Gulshan-2", () => {
    expect(areaIdsWithChildren(areas[0], areas)).toEqual(["g", "g1", "g2"]);
  });
  it("is just the area when it has none", () => {
    expect(areaIdsWithChildren(areas[3], areas)).toEqual(["b"]);
  });
});

describe("areaCentre", () => {
  it("uses the area's own centre", () => {
    expect(areaCentre(areas[3], areas)).toEqual({ lat: 23.7903, lng: 90.4077 });
  });
  it("borrows the parent's centre for a sub-area", () => {
    expect(areaCentre(areas[1], areas)).toEqual({ lat: 23.7922, lng: 90.4156 });
  });
  it("is null when neither is known", () => {
    expect(areaCentre(areas[5], areas)).toBeNull();
  });
  it("ignores a half-set or invalid centre", () => {
    expect(areaCentre(area("x", "Odd", { center_lat: 23.1, center_lng: null }), areas)).toBeNull();
    expect(areaCentre(area("y", "Odd2", { center_lat: Number.NaN, center_lng: 90 }), areas)).toBeNull();
  });
});

describe("resolveScope", () => {
  const scope = (name: string, radiusKm = 0) => resolveScope({ name, radiusKm, areas });

  it("is everything when no place is chosen", () => {
    expect(scope("")).toEqual({ scope: { kind: "none" }, radiusAvailable: false });
    expect(scope("   ").scope.kind).toBe("none");
  });

  it("uses the city filter for a whole city, and cannot do distance there", () => {
    expect(scope("Dhaka", 5)).toEqual({ scope: { kind: "city", city: "Dhaka" }, radiusAvailable: false });
  });

  it("asks for an area and its sub-areas by id, not by city", () => {
    expect(scope("Gulshan")).toEqual({ scope: { kind: "areas", ids: ["g", "g1", "g2"] }, radiusAvailable: true });
  });

  it.each([1, 3, 5, 10, 20])("measures + %i km from the area's centre", (km) => {
    expect(scope("Banani", km)).toEqual({
      scope: { kind: "radius", lat: 23.7903, lng: 90.4077, radius: km },
      radiusAvailable: true,
    });
  });

  it("measures a sub-area from its parent's centre", () => {
    expect(scope("Gulshan-2", 3).scope).toEqual({ kind: "radius", lat: 23.7922, lng: 90.4156, radius: 3 });
  });

  it("keeps the area filter, and says distance is unavailable, when the area has no centre", () => {
    expect(scope("Mirpur", 5)).toEqual({ scope: { kind: "areas", ids: ["m"] }, radiusAvailable: false });
  });

  it("falls back to a text search for a place the list does not know", () => {
    expect(scope("Dhanmondi", 5)).toEqual({ scope: { kind: "text", text: "Dhanmondi" }, radiusAvailable: false });
  });

  it("never sends a distance the API would refuse", () => {
    expect(scope("Banani", 500).scope).toMatchObject({ kind: "radius", radius: 50 });
    expect(scope("Banani", 0.4).scope.kind).toBe("areas");
  });
});

describe("areaOptions", () => {
  const options = areaOptions(areas, "All areas");

  it("starts with everything, then the cities", () => {
    expect(options[0]).toEqual({ label: "All areas", value: "" });
    expect(options.slice(1, 3).map((o) => o.value)).toEqual(["Chattogram", "Dhaka"]);
  });

  it("lists sub-areas, indented, directly under their area", () => {
    const values = options.map((o) => o.value);
    const g = values.indexOf("Gulshan");
    expect(values.slice(g, g + 3)).toEqual(["Gulshan", "Gulshan-1", "Gulshan-2"]);
    expect(options[g + 1].label.trim()).toBe("Gulshan-1");
    expect(options[g + 1].label).not.toBe("Gulshan-1");
  });

  it("still offers a sub-area whose parent is missing", () => {
    const orphan = areaOptions([area("o", "Orphan Block", { parent_area_id: "gone" })], "All");
    expect(orphan.map((o) => o.value)).toContain("Orphan Block");
  });
});

describe("fallbackAreaOptions", () => {
  const { fallbackAreaOptions } = require("../areaScope") as typeof import("../areaScope");
  const options = fallbackAreaOptions("All areas");

  it("offers everything, then the cities, then the neighbourhoods the site has pages for", () => {
    expect(options[0]).toEqual({ label: "All areas", value: "" });
    expect(options.slice(1, 5).map((o) => o.value)).toEqual(["Dhaka", "Chattogram", "Sylhet", "Cox's Bazar"]);
    expect(options.map((o) => o.value)).toEqual(expect.arrayContaining(["Gulshan", "Banani", "Uttara"]));
  });

  it("has no repeats", () => {
    const values = options.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("only names places the resolver can handle: cities by city filter, the rest by text", () => {
    for (const option of options.slice(1)) {
      const { scope } = resolveScope({ name: option.value, radiusKm: 5, areas: [] });
      expect(["city", "text"]).toContain(scope.kind);
    }
  });
});
