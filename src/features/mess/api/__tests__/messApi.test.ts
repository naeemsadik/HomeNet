import apiClient from "@/services/apiClient";
import { submitProperty, uploadPropertyMedia } from "@/services/propertyApi";
import { httpBackend } from "../messApi";

jest.mock("@/services/apiClient", () => ({
  ...jest.requireActual("@/services/apiClient"),
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

jest.mock("@/services/propertyApi", () => ({
  submitProperty: jest.fn(),
  uploadPropertyMedia: jest.fn(),
  deletePropertyMedia: jest.fn(),
}));

const client = apiClient as unknown as Record<"get" | "post" | "put" | "patch", jest.Mock>;
const ok = <T>(data: T) => ({ data: { success: true, message: "OK", data } });

beforeEach(() => jest.clearAllMocks());

describe("httpBackend (the PRD 2.3 contract)", () => {
  it("searches GET /v1/mess with the filters as API query params", async () => {
    client.get.mockResolvedValueOnce(ok({ items: [], total: 0, page: 1, limit: 20 }));
    await httpBackend.searchMess({ campus_id: "c-uiu", max_walk_min: 15, meal_system: ["meal_manager"], no_smoking: true }, 1, 20);
    expect(client.get).toHaveBeenCalledWith("/v1/mess", {
      params: { page: 1, limit: 20, campus_id: "c-uiu", max_walk_min: 15, meal_system: "meal_manager", no_smoking: true },
    });
  });

  it("unwraps the envelope", async () => {
    client.get.mockResolvedValueOnce(ok({ id: "m1" }));
    await expect(httpBackend.getMessDetail("m1")).resolves.toEqual({ id: "m1" });
  });

  it("fails clearly when a success carries no data", async () => {
    client.get.mockResolvedValueOnce({ data: { success: true, message: "Empty", data: null } });
    await expect(httpBackend.getMessDetail("m1")).rejects.toThrow();
  });

  it("encodes ids in the path", async () => {
    client.get.mockResolvedValueOnce(ok({}));
    await httpBackend.getMessDetail("a/b");
    expect(client.get).toHaveBeenCalledWith("/v1/mess/a%2Fb");
  });

  it("upserts drafts with POST /v1/mess", async () => {
    client.post.mockResolvedValueOnce(ok({ id: "m1", status: "draft" }));
    const dto = { property_id: "m1", charges: [{ category: "gas" as const, billing: "included" as const }] };
    await expect(httpBackend.upsertMess(dto)).resolves.toEqual({ id: "m1", status: "draft" });
    expect(client.post).toHaveBeenCalledWith("/v1/mess", dto);
  });

  it("asks for a number with POST /v1/mess/:id/contact and the channel", async () => {
    client.post.mockResolvedValueOnce(ok({ phone: "+8801700000001" }));
    await expect(httpBackend.contactLister("m1", "phone")).resolves.toEqual({ phone: "+8801700000001" });
    expect(client.post).toHaveBeenCalledWith("/v1/mess/m1/contact", { channel: "phone" });
  });

  it("changes a seat with PATCH /v1/mess/:id/seats/:seatId", async () => {
    client.patch.mockResolvedValueOnce(ok(null));
    await httpBackend.setSeatStatus("m1", "s1", "filled");
    expect(client.patch).toHaveBeenCalledWith("/v1/mess/m1/seats/s1", { status: "filled" });
  });

  it("confirms with POST /v1/mess/:id/confirm and reports with a reason", async () => {
    client.post.mockResolvedValue(ok(null));
    await httpBackend.confirmAvailable("m1");
    await httpBackend.reportMess("m1", "fake_listing");
    expect(client.post).toHaveBeenNthCalledWith(1, "/v1/mess/m1/confirm");
    expect(client.post).toHaveBeenNthCalledWith(2, "/v1/mess/m1/report", { reason: "fake_listing" });
  });

  it("reuses the property routes for submit and labelled media", async () => {
    (submitProperty as jest.Mock).mockResolvedValueOnce({ success: true, message: "OK", data: { id: "m1", status: "pending" } });
    (uploadPropertyMedia as jest.Mock).mockResolvedValueOnce({ success: true, message: "OK", data: { id: "p1", url: "u", display_order: 2 } });
    await expect(httpBackend.submitMess("m1")).resolves.toEqual({ id: "m1", status: "pending" });
    const file = { uri: "file://x.jpg", name: "x.jpg", type: "image/jpeg" };
    await expect(httpBackend.uploadMessMedia("m1", file, "washroom", 2)).resolves.toEqual({ id: "p1", url: "u", label: "washroom", display_order: 2 });
    expect(uploadPropertyMedia).toHaveBeenCalledWith("m1", file, "image", 2, "washroom");
  });

  it("reads seat preferences as null when there are none", async () => {
    client.get.mockResolvedValueOnce(ok(null));
    await expect(httpBackend.getSeatPreferences()).resolves.toBeNull();
  });
});
