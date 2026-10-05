import apiClient from "@/services/apiClient";
import { generatePropertyDescription, parsePropertySearch } from "@/services/aiApi";

jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: { post: jest.fn() },
  // The real one unwraps an AxiosError; the tests throw { status } directly.
  toApiError: (error: { status?: number | null }) => ({ status: error.status ?? null }),
}));

const post = apiClient.post as jest.Mock;
const respond = (data: unknown) => post.mockResolvedValue({ data: { success: true, message: "", data } });
const fail = (status: number | null) => post.mockRejectedValue({ status });

beforeEach(() => post.mockReset());

describe("generatePropertyDescription (quick listing)", () => {
  it("posts the description with the long model timeout", async () => {
    respond({ title: "Flat" });
    await generatePropertyDescription("3 bed flat in Gulshan, 1800 sqft");
    expect(post).toHaveBeenCalledWith(
      "/v1/ai/parse-property",
      { description: "3 bed flat in Gulshan, 1800 sqft" },
      { timeout: 30_000 },
    );
  });

  it("keeps the valid fields and drops only the bad ones", async () => {
    respond({
      title: "Flat in Gulshan",
      type: "castle", // not a property type
      listingType: "sale",
      price: 18_000_000, // numbers become strings: the form works in strings
      bedrooms: "3",
      areaUnit: "furlong", // not a unit
      amenities: { lift: true, generator: "yes" }, // one bad value invalidates the map
      confidence: { price: "high", title: "low" },
    });
    await expect(generatePropertyDescription("x".repeat(30))).resolves.toEqual({
      title: "Flat in Gulshan",
      listingType: "sale",
      price: "18000000",
      bedrooms: "3",
      confidence: { price: "high", title: "low" },
    });
  });

  it.each([null, "text", undefined])("treats %p as unreadable", async (data) => {
    respond(data);
    await expect(generatePropertyDescription("x".repeat(30))).rejects.toMatchObject({ code: "UNREADABLE" });
  });

  it.each([
    [null, "NETWORK_ERROR"],
    [401, "UNAUTHENTICATED"],
    [429, "QUOTA_EXCEEDED"],
    [400, "UNREADABLE"],
    [422, "UNREADABLE"],
    [404, "UNAVAILABLE"],
    [500, "UNAVAILABLE"],
  ])("maps status %p to %s with listing wording", async (status, code) => {
    fail(status);
    const error = await generatePropertyDescription("x".repeat(30)).catch((e) => e);
    expect(error).toMatchObject({ name: "AiParseError", code });
    if (code !== "NETWORK_ERROR") expect(error.message).toMatch(/listing|description|step-by-step/i);
  });
});

describe("parsePropertySearch (AI search)", () => {
  it("posts the query to its own endpoint", async () => {
    respond({ bedrooms: 3 });
    await parsePropertySearch("3 bed flat in Gulshan");
    expect(post).toHaveBeenCalledWith("/v1/ai/parse-search", { query: "3 bed flat in Gulshan" }, { timeout: 20_000 });
  });

  it("accepts numbers as numbers or numeric strings", async () => {
    respond({ listingType: "rent", maxPrice: "40000", minArea: 800, bedrooms: "2", areaName: " Dhanmondi " });
    await expect(parsePropertySearch("2 bed rent Dhanmondi")).resolves.toEqual({
      listingType: "rent",
      maxPrice: 40_000,
      minArea: 800,
      bedrooms: 2,
      areaName: "Dhanmondi",
    });
  });

  it("drops values that can't be filters instead of failing the whole search", async () => {
    respond({
      listingType: "swap",
      type: "land",
      minPrice: -5,
      maxPrice: "cheap",
      bedrooms: 2.5,
      bathrooms: 2,
      areaName: "   ",
      unmatched: ["near the metro", ""],
      summary: "Land, 2 bathrooms",
      confidence: { type: "high", bathrooms: "certain" },
    });
    await expect(parsePropertySearch("land")).resolves.toEqual({
      type: "land",
      bathrooms: 2,
      summary: "Land, 2 bathrooms",
    });
  });

  it("treats a missing body as unreadable", async () => {
    respond(null);
    await expect(parsePropertySearch("hi")).rejects.toMatchObject({ code: "UNREADABLE" });
  });

  it.each([
    [null, "NETWORK_ERROR"],
    [401, "UNAUTHENTICATED"],
    [429, "QUOTA_EXCEEDED"],
    [422, "UNREADABLE"],
    [404, "UNAVAILABLE"],
    [503, "UNAVAILABLE"],
  ])("maps status %p to %s with search wording, never listing wording", async (status, code) => {
    fail(status);
    const error = await parsePropertySearch("flat").catch((e) => e);
    expect(error).toMatchObject({ name: "AiParseError", code });
    expect(error.message).not.toMatch(/quick listing|step-by-step/i);
  });
});
