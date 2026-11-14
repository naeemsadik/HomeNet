import { getProperties } from "@/services/propertyApi";
import {
  calculateDhakaValuation,
  findComparables,
  formatBdtPerSqft,
  formatBdtPrice,
  formatMonthlyRent,
  getInstantValuation,
  USE_MOCK_VALUATION_API,
} from "../services/valuationService";
import type { ValuationRequestPayload } from "../types/valuationTypes";

jest.mock("@/services/propertyApi", () => ({ getProperties: jest.fn() }));
// A fixed benchmark file: the real one is regenerated from scraped listings, and these tests
// must not change with it.
jest.mock("../data/areaBenchmarks.json", () => ({
  __esModule: true,
  default: {
    asOf: "2026-10-30",
    areas: {
      gulshan: {
        sale: { n: 40, median: 17000, p25: 15500, p75: 22000, largestSourceShare: 0.5, status: "ok" },
        rent: { n: 30, median: 48, p25: 38, p75: 68, largestSourceShare: 0.5, status: "ok" },
      },
      mirpur: {
        sale: { n: 20, median: 7000, p25: 5500, p75: 11000, largestSourceShare: 0.5, status: "ok" },
      },
    },
  },
}));
const mockGetProperties = getProperties as jest.Mock;

/** A live listing as the API returns it. */
const listing = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Flat ${id}`,
  listing_type: "sale",
  type: "residential",
  price: 30000000,
  area_size: 2000,
  area_unit: "sqft",
  bedrooms: 3,
  bathrooms: 3,
  is_verified: false,
  address: "Road 11, Gulshan",
  area: { id: "a", name: "Gulshan" },
  media: [{ media_type: "image", url: "https://example.com/p.jpg" }],
  ...over,
});
const answer = (items: unknown[]) => mockGetProperties.mockResolvedValue({ data: { items, total: items.length, page: 1, limit: 20 } });
beforeEach(() => mockGetProperties.mockReset());

describe("Instant Valuation Engine (Dhaka Real Estate Benchmark)", () => {
  const basePayload: ValuationRequestPayload = {
    purpose: "sale",
    propertyType: "apartment",
    areaId: "gulshan-2-dhaka",
    areaName: "Gulshan",
    roadOrBlock: "Road 92",
    buildingName: "Skyline Residency",
    address: "Road 92, Gulshan-2, Dhaka",
    sizeSqft: 2000,
    sizeUnit: "sqft",
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorLevel: "6",
    facing: "south",
    propertyAge: "brand_new",
    amenities: {
      lift: true,
      generator: true,
      parking: true,
      gas: true,
      cctv: true,
      rooftop: true,
      lakeParkView: false,
    },
  };

  test("calculates deterministic valuation for Gulshan apartment", () => {
    const result = calculateDhakaValuation(basePayload);

    expect(result).toBeDefined();
    expect(result.valuationId).toMatch(/^VAL-/);
    expect(result.areaName).toBe("Gulshan");
    expect(result.sizeSqft).toBe(2000);
    expect(result.estimatedValue).toBeGreaterThan(30000000); // 3 Cr+ in Gulshan for 2000 sqft
    expect(result.lowEstimate).toBeLessThan(result.estimatedValue);
    expect(result.highEstimate).toBeGreaterThan(result.estimatedValue);
    expect(result.confidenceScore).toBe("high");
    expect(result.valueDrivers.length).toBeGreaterThan(0);
  });

  test("the area sets the price first: the same flat is worth far more in Gulshan than in Mirpur", () => {
    const gulshan = calculateDhakaValuation(basePayload);
    const mirpur = calculateDhakaValuation({ ...basePayload, areaName: "Mirpur", areaId: "mirpur" });
    expect(gulshan.estimatedValue).toBeGreaterThan(mirpur.estimatedValue * 2);
  });

  test("road access, papers and waterlogging move the price, and say why", () => {
    const neutral = calculateDhakaValuation(basePayload);
    const mainRoad = calculateDhakaValuation({ ...basePayload, roadAccess: "main_road" });
    const lane = calculateDhakaValuation({ ...basePayload, roadAccess: "narrow_lane" });
    const unsure = calculateDhakaValuation({ ...basePayload, legalPapers: "unsure" });
    const flooded = calculateDhakaValuation({ ...basePayload, waterlogging: "sometimes" });

    expect(mainRoad.estimatedValue).toBeGreaterThan(neutral.estimatedValue);
    expect(lane.estimatedValue).toBeLessThan(neutral.estimatedValue);
    expect(unsure.estimatedValue).toBeLessThan(neutral.estimatedValue);
    expect(flooded.estimatedValue).toBeLessThan(neutral.estimatedValue);

    const laneDriver = lane.valueDrivers.find((d) => d.id === "vd-road")!;
    expect(laneDriver.deltaBdtPerSqft).toBeLessThan(0);
    expect(laneDriver.formattedDelta).toMatch(/^-BDT/);
    expect(lane.breakdownFactors.siteAdjustmentPct).toBe(-10);
    // Left out, they change nothing: an older client keeps getting the same price.
    expect(neutral.breakdownFactors.siteAdjustmentPct).toBe(0);
  });

  test("an area without its own benchmark is a rough guide, and says so", () => {
    const result = calculateDhakaValuation({ ...basePayload, areaName: "Keraniganj", areaId: "keraniganj" });
    expect(result.confidenceScore).toBe("low");
    expect(result.confidenceReason).toMatch(/Dhaka-wide average/);
  });

  test("claims no transaction records or listing counts it does not have", () => {
    const result = calculateDhakaValuation(basePayload);
    expect(result.confidenceReason).not.toMatch(/verified transaction/i);
    expect(result.marketMetric.verifiedListingCount).toBe(0);
  });

  test("applies south-facing bonus and sweet-spot floor premium", () => {
    const southFacingResult = calculateDhakaValuation({
      ...basePayload,
      facing: "south",
      floorLevel: "6",
    });

    const northFacingResult = calculateDhakaValuation({
      ...basePayload,
      facing: "north",
      floorLevel: "1", // Ground floor
    });

    expect(southFacingResult.pricePerSqft).toBeGreaterThan(northFacingResult.pricePerSqft);
    expect(southFacingResult.estimatedValue).toBeGreaterThan(northFacingResult.estimatedValue);
  });

  test("accurately converts Katha to Sqft (1 Katha = 720 Sqft)", () => {
    const kathaPayload: ValuationRequestPayload = {
      ...basePayload,
      propertyType: "land",
      sizeSqft: 5, // 5 Katha
      sizeUnit: "katha",
    };

    const result = calculateDhakaValuation(kathaPayload);
    expect(result.sizeSqft).toBe(5 * 720); // 3,600 sqft
  });

  test("calculates monthly rental yield for rental valuation purpose", () => {
    const rentPayload: ValuationRequestPayload = {
      ...basePayload,
      purpose: "rent",
    };

    const result = calculateDhakaValuation(rentPayload);
    expect(result.estimatedMonthlyRent).toBeGreaterThan(50000);
    // The yield is the rent over a year against the value, not a number assumed in advance:
    // what asking prices and asking rents say about the area decides it.
    const impliedYield = ((result.estimatedMonthlyRent * 12) / result.estimatedValue) * 100;
    expect(result.grossRentalYieldPct).toBeCloseTo(impliedYield, 0);
    expect(result.grossRentalYieldPct).toBeGreaterThan(0);
  });

  test("formats BDT currency into Crore and Lakh correctly", () => {
    expect(formatBdtPrice(25000000)).toBe("BDT 2.50 Cr");
    expect(formatBdtPrice(8500000)).toBe("BDT 85.00 Lakh");
    expect(formatBdtPerSqft(18500)).toBe("BDT 18,500/sqft");
    expect(formatMonthlyRent(95000)).toBe("BDT 95,000/mo");
    expect(formatMonthlyRent(150000)).toBe("BDT 1.50 Lakh/mo");
  });

  test("getInstantValuation adapter returns the estimate with live comparables in mock mode", async () => {
    expect(USE_MOCK_VALUATION_API).toBe(true);
    answer([listing("x1")]);
    const result = await getInstantValuation(basePayload);
    expect(result.estimatedValueFormatted).toContain("BDT");
    expect(result.comparables.map((c) => c.id)).toEqual(["x1"]);
  });

  test("the calculation invents no comparable listings", () => {
    expect(calculateDhakaValuation(basePayload).comparables).toEqual([]);
  });
});

describe("comparable listings", () => {
  const payload: ValuationRequestPayload = {
    purpose: "sale",
    propertyType: "apartment",
    areaId: "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b",
    areaName: "Gulshan",
    sizeSqft: 2000,
    sizeUnit: "sqft",
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorLevel: "6",
    facing: "south",
    propertyAge: "resale",
    amenities: { lift: true, generator: true, parking: true, gas: true, cctv: false, rooftop: false, lakeParkView: false },
  };

  test("asks for live listings in the same area, sale or rent and kind of property", async () => {
    answer([]);
    await findComparables(payload);
    expect(mockGetProperties).toHaveBeenCalledWith(
      expect.objectContaining({ area_id: payload.areaId, listing_type: "sale", type: "residential", status: "active" }),
    );
  });

  test("searches by area name when the area id is not a real one (quick chips, old links)", async () => {
    answer([]);
    await findComparables({ ...payload, areaId: "gulshan-dhaka" });
    const filters = mockGetProperties.mock.calls[0][0];
    expect(filters.area_id).toBeUndefined();
    expect(filters.search).toBe("Gulshan");
  });

  test("shows the three closest in size, a listing without a size last", async () => {
    answer([
      listing("far", { area_size: 4000 }),
      listing("nosize", { area_size: null }),
      listing("close", { area_size: 2100 }),
      listing("katha", { area_size: 3, area_unit: "katha" }), // 2,160 sqft
      listing("closest", { area_size: 1990 }),
    ]);
    const comps = await findComparables(payload);
    expect(comps.map((c) => c.id)).toEqual(["closest", "close", "katha"]);
    expect(comps[2].sizeSqft).toBe(2160);
  });

  test("keeps only what the listing says: no made-up match score, size or verified badge", async () => {
    answer([listing("v", { is_verified: true }), listing("n", { area_size: null, bedrooms: undefined, media: [] })]);
    const [verified, bare] = await findComparables(payload);
    expect(verified.isVerified).toBe(true);
    expect(verified).not.toHaveProperty("similarityScore");
    expect(bare.isVerified).toBe(false);
    expect(bare.sizeSqft).toBe(0);
    expect(bare.bedrooms).toBe(0);
    expect(bare.imageUrl).toBe("");
  });

  test("leaves out listings for the other purpose and listings without a price", async () => {
    answer([listing("rent", { listing_type: "rent" }), listing("free", { price: 0 }), listing("ok")]);
    expect((await findComparables(payload)).map((c) => c.id)).toEqual(["ok"]);
  });

  test("shows none, rather than made-up ones, when the request fails", async () => {
    mockGetProperties.mockRejectedValue(new Error("network down"));
    expect(await findComparables(payload)).toEqual([]);
  });
});
