import apiClient from "@/services/apiClient";
import { resolveMapLink } from "@/services/mapApi";

jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { post: jest.fn() } }));

const post = apiClient.post as jest.Mock;
beforeEach(() => post.mockReset());

describe("resolveMapLink", () => {
  it("posts the short link and returns the place it points at", async () => {
    post.mockResolvedValue({ data: { success: true, message: "OK", data: { lat: 23.7931, lng: 90.4065 } } });
    await expect(resolveMapLink("https://maps.app.goo.gl/AbC")).resolves.toEqual({ lat: 23.7931, lng: 90.4065 });
    expect(post).toHaveBeenCalledWith("/v1/maps/resolve-link", { url: "https://maps.app.goo.gl/AbC" }, { timeout: 10_000 });
  });

  it.each([
    ["a missing body", null],
    ["non-numeric coordinates", { lat: "23.8", lng: "90.4" }],
    ["a longitude off the planet", { lat: 23.8, lng: 912 }],
    ["a latitude off the planet", { lat: 123.8, lng: 90.4 }],
  ])("rejects %s from the API", async (_label, body) => {
    post.mockResolvedValue({ data: { success: true, message: "OK", data: body } });
    await expect(resolveMapLink("https://maps.app.goo.gl/AbC")).rejects.toThrow(/can't be used/);
  });

  it("passes on a failure, such as the route not existing yet", async () => {
    post.mockRejectedValue(Object.assign(new Error("Request failed with status code 404"), { status: 404 }));
    await expect(resolveMapLink("https://maps.app.goo.gl/AbC")).rejects.toThrow(/404/);
  });
});
