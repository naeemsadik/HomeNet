import type { Area } from "@/types/api";
import { DHAKA_CENTER, areaCenterFor } from "../areaCenters";

const area = (id: string, name: string, parent: string | null = null): Area => ({
  id,
  name,
  city: "Dhaka",
  parent_area_id: parent,
});

// The shape of the live data: Sector-N has no neighbourhood name of its own.
const areas = [
  area("uttara", "Uttara"),
  area("sector-7", "Sector-7", "uttara"),
  area("gulshan", "Gulshan"),
  area("gulshan-2", "Gulshan-2", "gulshan"),
  area("mirpur", "Mirpur"),
  area("mirpur-10", "Mirpur-10", "mirpur"),
  area("villa", "The Villa", "bashundhara"),
  area("bashundhara", "Bashundhara"),
  area("pm", "Postman Area muobwcfj"),
];

describe("areaCenterFor", () => {
  it("knows the main neighbourhoods", () => {
    expect(areaCenterFor("gulshan", "Gulshan", areas)).toEqual({ lat: 23.7925, lng: 90.4078 });
    expect(areaCenterFor("uttara", "Uttara", areas)).toEqual({ lat: 23.8759, lng: 90.3795 });
  });

  it("uses the neighbourhood for numbered sub-areas", () => {
    expect(areaCenterFor("gulshan-2", "Gulshan-2", areas)).toEqual(areaCenterFor("gulshan", "Gulshan", areas));
    expect(areaCenterFor("mirpur-10", "Mirpur-10", areas)).toEqual(areaCenterFor("mirpur", "Mirpur", areas));
  });

  it("falls back to the parent area when the name says nothing", () => {
    expect(areaCenterFor("sector-7", "Sector-7", areas)).toEqual(areaCenterFor("uttara", "Uttara", areas));
    expect(areaCenterFor("villa", "The Villa", areas)).toEqual(areaCenterFor("bashundhara", "Bashundhara", areas));
  });

  it("opens on Dhaka for an unknown area, no area, or areas not loaded yet", () => {
    expect(areaCenterFor("pm", "Postman Area muobwcfj", areas)).toEqual(DHAKA_CENTER);
    expect(areaCenterFor("", "", areas)).toEqual(DHAKA_CENTER);
    expect(areaCenterFor("sector-7", "Sector-7", [])).toEqual(DHAKA_CENTER);
  });

  it("only gives plausible Dhaka coordinates", () => {
    for (const a of areas) {
      const { lat, lng } = areaCenterFor(a.id, a.name, areas);
      expect(lat).toBeGreaterThan(23.6);
      expect(lat).toBeLessThan(24.0);
      expect(lng).toBeGreaterThan(90.2);
      expect(lng).toBeLessThan(90.6);
    }
  });
});
