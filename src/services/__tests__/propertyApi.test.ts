import apiClient from "@/services/apiClient";
import { getPropertiesInAreas } from "@/services/propertyApi";
import type { Property } from "@/features/property/types/property";

jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { get: jest.fn() } }));

const get = apiClient.get as jest.Mock;
const property = (id: string, created_at: string) => ({ id, created_at }) as Property;
const page = (items: Property[], total = items.length) => ({ data: { data: { items, total, page: 1, limit: 12 } } });

beforeEach(() => get.mockReset());

describe("getPropertiesInAreas", () => {
  it("passes the filters straight through when no area was chosen", async () => {
    get.mockResolvedValue(page([property("a", "2026-01-01")], 7));
    const result = await getPropertiesInAreas({ status: "active" }, []);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/v1/properties", { params: { status: "active" } });
    expect(result).toEqual({ items: [expect.objectContaining({ id: "a" })], total: 7 });
  });

  it("asks for one area with a single request", async () => {
    get.mockResolvedValue(page([]));
    await getPropertiesInAreas({ status: "active" }, ["banani"]);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/v1/properties", { params: { status: "active", area_id: "banani" } });
  });

  it("asks once per area, then merges newest first without duplicates", async () => {
    get.mockImplementation((_url: string, { params }: { params: { area_id: string } }) =>
      Promise.resolve(
        {
          gulshan: page([]),
          "gulshan-1": page([property("old", "2026-01-01"), property("shared", "2026-03-01")]),
          "gulshan-2": page([property("new", "2026-05-01"), property("shared", "2026-03-01")]),
        }[params.area_id],
      ),
    );
    const result = await getPropertiesInAreas({ limit: 12 }, ["gulshan", "gulshan-1", "gulshan-2"]);
    expect(get).toHaveBeenCalledTimes(3);
    expect(result.items.map((p) => p.id)).toEqual(["new", "shared", "old"]);
    expect(result.total).toBe(3);
  });

  it("cuts the merged list to the page size", async () => {
    get.mockResolvedValue(page([property("1", "2026-01-03"), property("2", "2026-01-02")]));
    get.mockResolvedValueOnce(page([property("3", "2026-01-05"), property("4", "2026-01-04")]));
    const result = await getPropertiesInAreas({ limit: 3 }, ["a", "b"]);
    expect(result.items.map((p) => p.id)).toEqual(["3", "4", "1"]);
    expect(result.total).toBe(4);
  });
});
