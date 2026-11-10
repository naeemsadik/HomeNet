import { calculateDhakaValuation } from "../services/valuationService";
import type { ValuationRequestPayload } from "../types/valuationTypes";

// A small benchmark file with every case the estimate has to handle. The real
// one is regenerated from scraped listings, so its numbers must not decide these tests.
jest.mock("../data/areaBenchmarks.json", () => ({
  __esModule: true,
  default: {
    asOf: "2026-10-30",
    areas: {
      // Enough listings for both a sale and a rent figure.
      gulshan: {
        sale: { n: 40, median: 20000, p25: 18000, p75: 24000, status: "ok" },
        rent: { n: 30, median: 50, p25: 40, p75: 60, status: "ok" },
      },
      // Rent is solid, sale is not: a few asking prices only.
      banani: {
        sale: { n: 3, median: 5000, p25: 4000, p75: 6000, status: "insufficient" },
        rent: { n: 20, median: 45, p25: 38, p75: 55, status: "ok" },
      },
      // A thin sale sample is not used either.
      dhanmondi: {
        sale: { n: 9, median: 5000, p25: 4000, p75: 6000, status: "thin" },
      },
      // One site's odd listings stretch the top of the range.
      mirpur: {
        sale: { n: 20, median: 6000, p25: 3000, p75: 12000, status: "ok" },
      },
      // Priced from listings although the engine has no built-in rate for it.
      badda: {
        sale: { n: 25, median: 6500, p25: 5800, p75: 7400, status: "ok" },
      },
    },
  },
}));

const payload: ValuationRequestPayload = {
  purpose: "sale",
  propertyType: "apartment",
  areaId: "x",
  areaName: "Gulshan",
  roadOrBlock: "Road 92",
  buildingName: "",
  address: "",
  sizeSqft: 1000,
  sizeUnit: "sqft",
  bedrooms: 3,
  bathrooms: 3,
  balconies: 1,
  floorLevel: "2",
  facing: "west",
  propertyAge: "resale",
  amenities: { lift: false, generator: false, parking: false, gas: false, cctv: false, rooftop: false, lakeParkView: false },
};
const estimate = (over: Partial<ValuationRequestPayload>) => calculateDhakaValuation({ ...payload, ...over });

describe("estimate from listing benchmarks", () => {
  it("prices an area from its listing median once it has enough listings", () => {
    const result = estimate({});
    expect(result.areaAveragePricePerSqft).toBe(20000);
    expect(result.marketMetric.avgPriceSqftSale).toBe(20000);
  });

  it("does not use a thin or insufficient sale sample; it keeps the built-in rate", () => {
    const banani = estimate({ areaName: "Banani" });
    const dhanmondi = estimate({ areaName: "Dhanmondi" });
    expect(banani.areaAveragePricePerSqft).toBe(16200);
    expect(dhanmondi.areaAveragePricePerSqft).toBe(13500);
  });

  it("prices a rent from the rent median when that is the one with enough listings", () => {
    const banani = estimate({ areaName: "Banani", purpose: "rent" });
    expect(banani.marketMetric.avgPriceSqftRent).toBe(45);
    // The built-in rent rate for Gulshan would be 72, not the 50 the listings say.
    expect(estimate({ purpose: "rent" }).marketMetric.avgPriceSqftRent).toBe(50);
  });

  it("can price an area the engine had no built-in rate for", () => {
    const badda = estimate({ areaName: "Badda" });
    expect(badda.areaAveragePricePerSqft).toBe(6500);
    expect(badda.confidenceScore).not.toBe("low");
  });
});

describe("the range around the estimate", () => {
  it("follows the area's spread of asking prices, not a flat 6%", () => {
    const result = estimate({});
    expect(result.lowEstimate / result.estimatedValue).toBeCloseTo(0.9, 2);
    expect(result.highEstimate / result.estimatedValue).toBeCloseTo(1.2, 2);
  });

  it("never narrows below -6% / +6%, and never widens past 30%", () => {
    const wide = estimate({ areaName: "Mirpur" });
    expect(wide.lowEstimate / wide.estimatedValue).toBeCloseTo(0.7, 2);
    expect(wide.highEstimate / wide.estimatedValue).toBeCloseTo(1.3, 2);
  });

  it("keeps the flat -6% / +6% when the area has no listing data", () => {
    const result = estimate({ areaName: "Banani" });
    expect(result.lowEstimate / result.estimatedValue).toBeCloseTo(0.94, 2);
    expect(result.highEstimate / result.estimatedValue).toBeCloseTo(1.06, 2);
  });
});

describe("how much to trust it", () => {
  it("is high with listings behind the area and the building details filled in", () => {
    expect(estimate({}).confidenceScore).toBe("high");
  });

  it("is medium with listings behind the area but no road or block", () => {
    const result = estimate({ roadOrBlock: "" });
    expect(result.confidenceScore).toBe("medium");
    expect(result.confidenceReason).toMatch(/Add the road or block/);
  });

  it("says how many asking prices it rests on and when they were collected", () => {
    const reason = estimate({}).confidenceReason;
    expect(reason).toMatch(/Based on 40 asking prices for Gulshan flats on listing sites \(October 2026\)/);
    expect(estimate({ purpose: "rent" }).confidenceReason).toMatch(/30 asking rents/);
  });

  it("is a rough guide for an area we only have a built-in rate for, whatever else is filled in", () => {
    const result = estimate({ areaName: "Dhanmondi" });
    expect(result.confidenceScore).toBe("low");
    expect(result.confidenceReason).toMatch(/enough listings for Dhanmondi/);
  });

  it("is a rough guide for an area it knows nothing about", () => {
    const result = estimate({ areaName: "Keraniganj" });
    expect(result.confidenceScore).toBe("low");
    expect(result.confidenceReason).toMatch(/Dhaka-wide average/);
  });

  it("judges a rent by the rent listings and a sale by the sale listings", () => {
    expect(estimate({ areaName: "Banani", purpose: "rent" }).confidenceScore).toBe("high");
    expect(estimate({ areaName: "Banani", purpose: "sale" }).confidenceScore).toBe("low");
  });
});
