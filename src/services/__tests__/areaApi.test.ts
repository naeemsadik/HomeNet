import apiClient from "@/services/apiClient";
import { fetchArea, fetchAreaChildren, fetchAreas, normalizeArea } from "@/services/areaApi";
import { collectAvailableCities, inferAreaCity, scopeAreasToCity } from "@/lib/areaMatcher";

jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { get: jest.fn() } }));

const get = apiClient.get as jest.Mock;
beforeEach(() => get.mockReset());

/** An area the way the API sends it: no `city`, a nested district. */
const apiArea = (over: Record<string, unknown> = {}) => ({
  id: "a1",
  name: "Gulshan",
  district_id: "d-dhaka",
  parent_area_id: null,
  center_lat: 23.79,
  center_lng: 90.41,
  district: { id: "d-dhaka", name: "Dhaka", division_id: "v-dhaka" },
  ...over,
});

describe("normalizeArea", () => {
  it("reads the city from the district the area sits in", () => {
    const area = normalizeArea(apiArea());
    expect(area.city).toBe("Dhaka");
    expect(area.district_id).toBe("d-dhaka");
    expect(area.division_id).toBe("v-dhaka");
    expect("district" in area).toBe(false);
  });

  it("normalises \"Dhaka District\" to the city the site calls Dhaka", () => {
    const area = normalizeArea(apiArea({ district: { id: "d-dhaka", name: "Dhaka District", division_id: "v-dhaka" } }));
    const byId = new Map([[area.id, area]]);
    expect(inferAreaCity(area, byId)).toBe("Dhaka");
  });

  it("keeps a city the row already has", () => {
    expect(normalizeArea(apiArea({ city: "Gazipur" })).city).toBe("Gazipur");
  });

  it("leaves the city empty when the row has no district to read it from", () => {
    const area = normalizeArea(apiArea({ district: null, district_id: undefined }));
    expect(area.city).toBeNull();
    expect(area.district_id).toBeNull();
  });
});

describe("the area calls", () => {
  it("fetchAreas returns every area with its city filled in", async () => {
    get.mockResolvedValue({
      data: {
        success: true,
        message: "OK",
        data: {
          items: [apiArea(), apiArea({ id: "a2", name: "Agrabad", district_id: "d-ctg", district: { id: "d-ctg", name: "Chattogram", division_id: "v-ctg" } })],
          total: 2,
          page: 1,
          limit: 100,
          total_pages: 1,
        },
      },
    });
    const res = await fetchAreas({ limit: 100 });
    expect(res.data?.items.map((a) => [a.name, a.city])).toEqual([
      ["Gulshan", "Dhaka"],
      ["Agrabad", "Chattogram"],
    ]);
    expect(res.data?.total).toBe(2);
    expect(get).toHaveBeenCalledWith("/v1/areas", { params: { limit: 100 } });
  });

  it("filters by district and division with the parameters the API has", async () => {
    get.mockResolvedValue({ data: { success: true, message: "OK", data: { items: [], total: 0, page: 1, limit: 20, total_pages: 0 } } });
    await fetchAreas({ district_id: "d-dhaka", division_id: "v-dhaka" });
    expect(get).toHaveBeenCalledWith("/v1/areas", { params: { district_id: "d-dhaka", division_id: "v-dhaka" } });
  });

  it("fetchArea and fetchAreaChildren fill the city in too", async () => {
    get.mockResolvedValueOnce({ data: { success: true, message: "OK", data: { ...apiArea(), parent: null, children: [] } } });
    expect((await fetchArea("a1")).data?.city).toBe("Dhaka");
    get.mockResolvedValueOnce({ data: { success: true, message: "OK", data: [apiArea({ id: "a3", name: "Gulshan-1" })] } });
    expect((await fetchAreaChildren("a1")).data?.[0].city).toBe("Dhaka");
  });
});

describe("with the city read from the district", () => {
  const areas = [
    normalizeArea(apiArea()),
    normalizeArea(apiArea({ id: "a2", name: "Mohakhali", district: { id: "d-dhaka", name: "Dhaka", division_id: "v-dhaka" } })),
    normalizeArea(apiArea({ id: "a3", name: "Boddhopara", district_id: "d-bogura", district: { id: "d-bogura", name: "Bogura", division_id: "v-raj" }, center_lat: null, center_lng: null })),
  ];

  it("places an area in its city without guessing from its name", () => {
    const byId = new Map(areas.map((a) => [a.id, a]));
    // "Boddhopara" is in no built-in list of known places; the district names its city.
    expect(inferAreaCity(areas[2], byId)).toBe("Bogura");
  });

  it("scopes a list to one city", () => {
    expect(scopeAreasToCity(areas, "Dhaka").map((a) => a.name)).toEqual(["Gulshan", "Mohakhali"]);
    expect(scopeAreasToCity(areas, "Bogura").map((a) => a.name)).toEqual(["Boddhopara"]);
  });

  it("offers the districts the API has as cities", () => {
    expect(collectAvailableCities(areas)).toEqual(expect.arrayContaining(["Dhaka", "Bogura"]));
  });
});
