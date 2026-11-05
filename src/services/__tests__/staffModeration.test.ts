import apiClient from "@/services/apiClient";
import { staffArchiveProperty, staffRestoreProperty } from "@/services/propertyApi";

jest.mock("@/services/apiClient", () => {
  const actual = jest.requireActual("@/services/apiClient");
  return { __esModule: true, ...actual, default: { post: jest.fn(), get: jest.fn(), delete: jest.fn(), patch: jest.fn() } };
});

const post = (apiClient as unknown as { post: jest.Mock }).post;

describe("staff moderation API", () => {
  beforeEach(() => post.mockResolvedValue({ data: { success: true, data: { id: "p1" } } }));

  it("archives with POST /v1/properties/:id/archive", async () => {
    await staffArchiveProperty("p1");
    expect(post).toHaveBeenCalledWith("/v1/properties/p1/archive");
  });

  it("restores with POST /v1/properties/:id/restore", async () => {
    await staffRestoreProperty("p1");
    expect(post).toHaveBeenCalledWith("/v1/properties/p1/restore");
  });
});
