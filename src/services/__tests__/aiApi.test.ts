import apiClient from "@/services/apiClient";
import { generatePropertyDescription, smartSearch } from "@/services/aiApi";

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

const card = (over: Record<string, unknown> = {}) => ({
  id: "p1",
  title: "Luxury 4BR Apartment in Gulshan-1",
  type: "residential",
  subtype: null,
  listing_type: "sale",
  price: 25_000_000,
  price_currency: "BDT",
  area_size: 2200,
  area_unit: "sqft",
  address: "Road 11",
  amenities: { bedrooms: 4 },
  is_verified: true,
  published_at: "2026-09-01T00:00:00.000Z",
  area: { id: "gulshan-1", name: "Gulshan-1", city: "Dhaka" },
  media: [{ id: "m1", url: "https://img/1.jpg", thumbnail_url: null }],
  ai_badges: ["4 beds as requested"],
  ...over,
});

const filters = (over: Record<string, unknown> = {}) => ({
  area: "Gulshan",
  listing_type: "sale",
  type: "residential",
  min_price: null,
  max_price: 30_000_000,
  bedrooms: 3,
  bathrooms: null,
  amenities: ["parking"],
  ...over,
});

const pagination = { total: 1, page: 1, limit: 12, total_pages: 1 };

describe("smartSearch (AI search)", () => {
  it("posts to the property smart-search route with paging and the long timeout", async () => {
    respond({ query: "q", filters: filters(), listings: [], pagination });
    await smartSearch({ query: "3 bed flat in Gulshan", page: 2, limit: 5 });
    expect(post).toHaveBeenCalledWith(
      "/v1/properties/smart-search",
      { query: "3 bed flat in Gulshan", page: 2, limit: 5 },
      { timeout: 30_000 },
    );
  });

  it("defaults to the first page of twelve", async () => {
    respond({ query: "q", filters: filters(), listings: [], pagination });
    await smartSearch({ query: "flat" });
    expect(post.mock.calls[0][1]).toEqual({ query: "flat", page: 1, limit: 12 });
  });

  it("returns the filters, the listings with their badges, and the paging", async () => {
    respond({ query: "3 bed flat", filters: filters(), listings: [card()], pagination });
    const result = await smartSearch({ query: "3 bed flat" });
    expect(result.query).toBe("3 bed flat");
    expect(result.filters).toEqual(filters());
    expect(result.listings).toHaveLength(1);
    expect(result.listings[0]).toMatchObject({ id: "p1", price: 25_000_000, ai_badges: ["4 beds as requested"] });
    expect(result.pagination).toEqual(pagination);
  });

  it("keeps a listing whose optional parts are broken, and skips one that is unusable", async () => {
    respond({
      query: "q",
      filters: filters(),
      listings: [
        card({ id: "ok", ai_badges: "not a list", media: "nope", area_size: "big", is_verified: "yes" }),
        card({ id: "", title: "no id" }),
        card({ id: "bad-type", type: "castle" }),
        { nonsense: true },
      ],
      pagination,
    });
    const { listings } = await smartSearch({ query: "q" });
    expect(listings.map((l) => l.id)).toEqual(["ok"]);
    expect(listings[0]).toMatchObject({ ai_badges: [], media: [], area_size: null, is_verified: false });
  });

  it("drops a bad filter value without inventing a filter or losing the others", async () => {
    respond({
      query: "q",
      filters: filters({ type: "castle", min_price: -5, max_price: "30000000", bedrooms: 3, amenities: "parking", listing_type: "short_let" }),
      listings: [],
      pagination,
    });
    const result = await smartSearch({ query: "q" });
    expect(result.filters).toEqual({
      area: "Gulshan",
      listing_type: "short_let",
      type: null,
      min_price: null,
      max_price: null, // a numeric string is not a number: the API sends numbers
      bedrooms: 3,
      bathrooms: null,
      amenities: [],
    });
  });

  it("treats missing filters as 'nothing understood' and missing paging as one page", async () => {
    respond({ listings: [card()] });
    const result = await smartSearch({ query: "q" });
    expect(result.filters).toEqual({
      area: null,
      listing_type: null,
      type: null,
      min_price: null,
      max_price: null,
      bedrooms: null,
      bathrooms: null,
      amenities: [],
    });
    expect(result.pagination).toEqual({ total: 1, page: 1, limit: 1, total_pages: 1 });
  });

  it.each([null, "text", undefined])("treats %p as unreadable", async (data) => {
    respond(data);
    await expect(smartSearch({ query: "q" })).rejects.toMatchObject({ code: "UNREADABLE" });
  });

  it.each([
    [null, "NETWORK_ERROR"],
    [401, "UNAUTHENTICATED"],
    [429, "QUOTA_EXCEEDED"], // the API's throttle: 20 searches a minute
    [400, "UNREADABLE"], // query too short or invalid
    [503, "UNAVAILABLE"], // "AI service is experiencing high demand"
    [502, "UNAVAILABLE"], // model returned something unusable
    [404, "UNAVAILABLE"], // route not deployed
  ])("maps status %p to %s with search wording, never listing wording", async (status, code) => {
    fail(status);
    const error = await smartSearch({ query: "flat" }).catch((e) => e);
    expect(error).toMatchObject({ name: "AiParseError", code });
    expect(error.message).not.toMatch(/quick listing|step-by-step/i);
  });
});
