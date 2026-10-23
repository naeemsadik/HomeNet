import { allAreasQuery, filterAreas, pageAreas } from "@/hooks/useAllAreas";
import { fetchAreas } from "@/services/areaApi";
import type { Area } from "@/types/api";

jest.mock("@/services/areaApi", () => ({ fetchAreas: jest.fn() }));
const mockFetchAreas = fetchAreas as jest.MockedFunction<typeof fetchAreas>;

const area = (id: string, name: string, city: string | null, parent: string | null = null): Area => ({
  id,
  name,
  city,
  parent_area_id: parent,
});

const areas = [
  area("gulshan", "Gulshan", "Dhaka"),
  area("gulshan-2", "Gulshan-2", "Dhaka", "gulshan"),
  area("banani", "Banani", "Dhaka"),
  area("agrabad", "Agrabad", "Chattogram"),
];

describe("filterAreas", () => {
  it("matches names case-insensitively, like the API's search", () => {
    expect(filterAreas(areas, { search: "gulSHAN" }).map((a) => a.id)).toEqual(["gulshan", "gulshan-2"]);
  });

  it("filters by exact city and to top-level areas", () => {
    expect(filterAreas(areas, { city: "Dhaka", topLevelOnly: true }).map((a) => a.id)).toEqual([
      "gulshan",
      "banani",
    ]);
  });
});

describe("pageAreas", () => {
  it("pages locally and reports totals", () => {
    expect(pageAreas(areas, 2, 3)).toEqual({ items: [areas[3]], total: 4, total_pages: 2 });
    expect(pageAreas([], 1, 20)).toEqual({ items: [], total: 0, total_pages: 1 });
  });
});

describe("allAreasQuery", () => {
  const run = () => (allAreasQuery.queryFn as () => Promise<{ items: Area[]; total: number; complete: boolean }>)();

  it("always asks for the one identical all-areas request", async () => {
    mockFetchAreas.mockResolvedValue({ success: true, message: "", data: { items: areas, total: 4, page: 1, limit: 100, total_pages: 1 } } as never);
    await expect(run()).resolves.toMatchObject({ total: 4, complete: true });
    expect(mockFetchAreas).toHaveBeenCalledWith({ limit: 100 });
  });

  it("flags an answer the API cached for a different query", async () => {
    mockFetchAreas.mockResolvedValue({ success: true, message: "", data: { items: [areas[0]], total: 33, page: 1, limit: 1, total_pages: 33 } } as never);
    await expect(run()).resolves.toMatchObject({ complete: false });
  });
});
