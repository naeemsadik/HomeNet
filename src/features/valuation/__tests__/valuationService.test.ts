import {
  calculateDhakaValuation,
  formatBdtPerSqft,
  formatBdtPrice,
  formatMonthlyRent,
  getInstantValuation,
  USE_MOCK_VALUATION_API,
} from "../services/valuationService";
import type { ValuationRequestPayload } from "../types/valuationTypes";

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
    expect(result.grossRentalYieldPct).toBeGreaterThan(3.5);
    expect(result.grossRentalYieldPct).toBeLessThan(7.5);
  });

  test("formats BDT currency into Crore and Lakh correctly", () => {
    expect(formatBdtPrice(25000000)).toBe("BDT 2.50 Cr");
    expect(formatBdtPrice(8500000)).toBe("BDT 85.00 Lakh");
    expect(formatBdtPerSqft(18500)).toBe("BDT 18,500/sqft");
    expect(formatMonthlyRent(95000)).toBe("BDT 95,000/mo");
    expect(formatMonthlyRent(150000)).toBe("BDT 1.50 Lakh/mo");
  });

  test("getInstantValuation adapter returns simulated data in mock mode", async () => {
    expect(USE_MOCK_VALUATION_API).toBe(true);
    const result = await getInstantValuation(basePayload);
    expect(result).toBeDefined();
    expect(result.estimatedValueFormatted).toContain("BDT");
    expect(result.comparables.length).toBeGreaterThan(0);
  });
});
