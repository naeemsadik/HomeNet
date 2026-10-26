import type { GeocodedPlace } from "@/services/geocodeApi";
import type { Area } from "@/types/api";
import { areaFromPlace, distanceKm, nearestArea, pinFillPatch } from "../placeFromPin";

jest.mock("@/services/geocodeApi", () => ({}));

const area = (id: string, name: string, parent: string | null = null): Area => ({ id, name, city: "Dhaka", parent_area_id: parent });

// The shape of the live area list.
const areas = [
  area("gulshan", "Gulshan"),
  area("gulshan-2", "Gulshan-2", "gulshan"),
  area("banani", "Banani"),
  area("dhanmondi", "Dhanmondi"),
  area("mohammadpur", "Mohammadpur"),
  area("uttara", "Uttara"),
  area("sector-6", "Sector-6", "uttara"),
  area("bashundhara", "Bashundhara"),
  area("pm", "Postman Area muobwcfj"),
];

const place = (areaNames: string[]): GeocodedPlace => ({ address: "x", areaNames });

describe("areaFromPlace (names the geocoder really returned for Dhaka)", () => {
  it("matches the suburb", () => {
    expect(areaFromPlace(place(["Korail", "Gulshan"]), areas)?.id).toBe("gulshan"); // a Gulshan pin
    expect(areaFromPlace(place(["Block M", "Bashundhara Residential Area"]), areas)?.id).toBe("bashundhara");
  });

  it("finds a neighbourhood named inside a longer name, and ignores 'Thana'", () => {
    expect(areaFromPlace(place(["Lalmatia", "Dhanmondi Residential Area"]), areas)?.id).toBe("dhanmondi");
    expect(areaFromPlace(place(["Gulshan Thana"]), areas)?.id).toBe("gulshan");
  });

  it("uses a numbered sub-area only when its parent is named too", () => {
    expect(areaFromPlace(place(["Sector 6", "Uttara"]), areas)?.id).toBe("sector-6");
    expect(areaFromPlace(place(["Sector 6", "Somewhere Else"]), areas)).toBeNull();
    // Parent alone is fine.
    expect(areaFromPlace(place(["Uttara"]), areas)?.id).toBe("uttara");
  });

  it("returns null when no name is one of HomeNet's areas", () => {
    expect(areaFromPlace(place(["Tikkapara", "Johuri Moholla", "Shyamoli"]), areas)).toBeNull();
    expect(areaFromPlace(place([]), areas)).toBeNull();
  });

  it("is not fooled by an area list that isn't loaded", () => {
    expect(areaFromPlace(place(["Gulshan"]), [])).toBeNull();
  });
});

describe("distanceKm", () => {
  it("is zero for the same spot and plausible between Gulshan and Dhanmondi", () => {
    expect(distanceKm({ lat: 23.79, lng: 90.4 }, { lat: 23.79, lng: 90.4 })).toBe(0);
    const km = distanceKm({ lat: 23.7925, lng: 90.4078 }, { lat: 23.7461, lng: 90.3742 });
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(7);
  });
});

describe("nearestArea", () => {
  it("picks the neighbourhood whose centre the pin is close to", () => {
    expect(nearestArea({ lat: 23.7662, lng: 90.3589 }, areas)?.id).toBe("mohammadpur");
    expect(nearestArea({ lat: 23.7935, lng: 90.4075 }, areas)?.id).toBe("gulshan");
  });

  it("gives up when no listed neighbourhood is near", () => {
    expect(nearestArea({ lat: 23.9, lng: 90.2 }, areas)).toBeNull();
    expect(nearestArea({ lat: 23.7662, lng: 90.3589 }, [])).toBeNull();
  });

  it("never suggests a numbered sub-area or an area it has no centre for", () => {
    const only = [area("uttara", "Uttara"), area("sector-6", "Sector-6", "uttara"), area("pm", "Postman Area muobwcfj")];
    expect(nearestArea({ lat: 23.8759, lng: 90.3795 }, only)?.id).toBe("uttara");
    expect(nearestArea({ lat: 23.81, lng: 90.41 }, [area("pm", "Postman Area muobwcfj")])).toBeNull();
  });
});

describe("pinFillPatch", () => {
  const gulshan = areas[0];
  const none = { areaId: null, address: null };

  it("fills empty boxes from the pin", () => {
    const { patch, written } = pinFillPatch({ areaId: "", address: "" }, none, gulshan, "Road 1, Gulshan");
    expect(patch).toEqual({ areaId: "gulshan", areaName: "Gulshan", district: "Dhaka", address: "Road 1, Gulshan" });
    expect(written).toEqual({ areaId: "gulshan", address: "Road 1, Gulshan" });
  });

  it("replaces what an earlier pin wrote", () => {
    const earlier = { areaId: "gulshan", address: "Road 1, Gulshan" };
    const banani = areas[2];
    const { patch } = pinFillPatch({ areaId: "gulshan", address: "Road 1, Gulshan" }, earlier, banani, "Road 9, Banani");
    expect(patch.areaId).toBe("banani");
    expect(patch.address).toBe("Road 9, Banani");
  });

  it("never replaces what the owner chose or typed", () => {
    const earlier = { areaId: "gulshan", address: "Road 1, Gulshan" };
    const { patch } = pinFillPatch({ areaId: "uttara", address: "My own address" }, earlier, areas[2], "Road 9, Banani");
    expect(patch).toEqual({});
  });

  it("clears the area and address an earlier pin wrote when the new pin gives none", () => {
    const earlier = { areaId: "gulshan", address: "Road 1, Gulshan" };
    const { patch, written } = pinFillPatch({ areaId: "gulshan", address: "Road 1, Gulshan" }, earlier, null, null);
    expect(patch).toEqual({ areaId: "", areaName: "", district: "", address: "" });
    expect(written).toEqual({ areaId: null, address: null });
  });

  it("keeps an area and address the owner set when the new pin gives none", () => {
    const earlier = { areaId: "gulshan", address: "Road 1, Gulshan" };
    const { patch } = pinFillPatch({ areaId: "uttara", address: "My own address" }, earlier, null, null);
    expect(patch).toEqual({});
  });
});
