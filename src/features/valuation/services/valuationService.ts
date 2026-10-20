import apiClient from "@/services/apiClient";
import { previewProperties } from "@/data/landingPreview";
import type {
  AreaMarketMetric,
  ComparableProperty,
  PriceBreakdownFactors,
  ValuationRequestPayload,
  ValuationResponseData,
  ValueDriverImpact,
} from "../types/valuationTypes";

// ============================================================================
// BACKEND INTEGRATION CONFIGURATION
// ============================================================================
/**
 * BACKEND DEVELOPER INSTRUCTIONS:
 * 
 * 1. When the backend endpoint is deployed, set `USE_MOCK_VALUATION_API = false`.
 * 2. Configure `VALUATION_API_ENDPOINT` below to your live backend endpoint.
 *    By default, apiClient already handles base URL, timeout, and JWT tokens.
 * 3. Ensure your backend returns data matching `ValuationResponseData` or add an
 *    adapter function to map your API response shape.
 */
export const USE_MOCK_VALUATION_API = true;
export const VALUATION_API_ENDPOINT = "/v1/properties/instant-valuation";

// ============================================================================
// DHAKA REAL ESTATE BENCHMARK DATA BOOK
// ============================================================================

interface AreaBenchmark {
  salePerSqft: number;
  rentPerSqft: number;
  yoyGrowth: number;
  demand: "Very High" | "High" | "Moderate";
  subzones: string[];
}

const DHAKA_AREA_BENCHMARKS: Record<string, AreaBenchmark> = {
  gulshan: {
    salePerSqft: 18500,
    rentPerSqft: 72,
    yoyGrowth: 9.4,
    demand: "Very High",
    subzones: ["Gulshan-1", "Gulshan-2", "South Avenue", "Gushan Lake Park"],
  },
  banani: {
    salePerSqft: 16200,
    rentPerSqft: 64,
    yoyGrowth: 8.7,
    demand: "Very High",
    subzones: ["Block C", "Block D", "Block F", "Road 11"],
  },
  baridhara: {
    salePerSqft: 22000,
    rentPerSqft: 88,
    yoyGrowth: 11.2,
    demand: "Very High",
    subzones: ["Diplomatic Zone", "Baridhara DOHS", "Parkway"],
  },
  dhanmondi: {
    salePerSqft: 13500,
    rentPerSqft: 52,
    yoyGrowth: 7.8,
    demand: "High",
    subzones: ["Road 27", "Road 8A", "Satmasjid Road", "Lakeside"],
  },
  uttara: {
    salePerSqft: 9400,
    rentPerSqft: 36,
    yoyGrowth: 8.1,
    demand: "High",
    subzones: ["Sector 3", "Sector 7", "Sector 11", "Sector 13", "Uttara Model Town"],
  },
  bashundhara: {
    salePerSqft: 8800,
    rentPerSqft: 34,
    yoyGrowth: 10.5,
    demand: "Very High",
    subzones: ["Block C", "Block D", "Block I", "Near Evercare", "North South Univ"],
  },
  mirpur: {
    salePerSqft: 6200,
    rentPerSqft: 25,
    yoyGrowth: 6.5,
    demand: "Moderate",
    subzones: ["Mirpur-1", "Mirpur-2", "Mirpur-10", "Mirpur DOHS"],
  },
  mohammadpur: {
    salePerSqft: 7600,
    rentPerSqft: 30,
    yoyGrowth: 7.0,
    demand: "Moderate",
    subzones: ["Kaderabad Housing", "Japan Garden City", "Salimullah Road"],
  },
  banasree: {
    salePerSqft: 7200,
    rentPerSqft: 28,
    yoyGrowth: 7.2,
    demand: "Moderate",
    subzones: ["Block B", "Block C", "Block E", "Rampura Road"],
  },
  motijheel: {
    salePerSqft: 11000,
    rentPerSqft: 45,
    yoyGrowth: 5.5,
    demand: "Moderate",
    subzones: ["Dilkusha", "Arambagh", "Purana Paltan"],
  },
};

const DEFAULT_BENCHMARK: AreaBenchmark = {
  salePerSqft: 7800,
  rentPerSqft: 30,
  yoyGrowth: 6.8,
  demand: "Moderate",
  subzones: ["Central", "North Zone", "South Zone"],
};

function normalizeAreaKey(areaName: string): string {
  const clean = areaName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const key of Object.keys(DHAKA_AREA_BENCHMARKS)) {
    if (clean.includes(key)) return key;
  }
  return "default";
}

// ============================================================================
// CURRENCY & FORMATTING UTILITIES (Crore / Lakh)
// ============================================================================

export function formatBdtPrice(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `BDT ${crore.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `BDT ${lakh.toFixed(2)} Lakh`;
  }
  return `BDT ${amount.toLocaleString("en-IN")}`;
}

export function formatBdtPerSqft(amount: number): string {
  return `BDT ${Math.round(amount).toLocaleString("en-IN")}/sqft`;
}

export function formatMonthlyRent(amount: number): string {
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `BDT ${lakh.toFixed(2)} Lakh/mo`;
  }
  return `BDT ${Math.round(amount).toLocaleString("en-IN")}/mo`;
}

// ============================================================================
// REALISTIC DHAKA PRICING ENGINE (MOCK IMPLEMENTATION)
// ============================================================================

export function calculateDhakaValuation(
  payload: ValuationRequestPayload
): ValuationResponseData {
  const areaKey = normalizeAreaKey(payload.areaName);
  const benchmark = DHAKA_AREA_BENCHMARKS[areaKey] || DEFAULT_BENCHMARK;

  // 1. Property Type Multiplier
  let propertyTypeMultiplier = 1.0;
  if (payload.propertyType === "commercial") propertyTypeMultiplier = 1.35;
  else if (payload.propertyType === "house") propertyTypeMultiplier = 1.25;
  else if (payload.propertyType === "land") propertyTypeMultiplier = 0.95;

  const baseRatePerSqft = benchmark.salePerSqft * propertyTypeMultiplier;

  // 2. Floor Adjustment
  // In Dhaka, 4th to 8th floors command a sweet-spot premium (less dust/mosquitoes, reliable lift).
  // Ground floor has privacy and security discounts.
  let floorAdjustmentPct = 0;
  const numericFloor = typeof payload.floorLevel === "number"
    ? payload.floorLevel
    : parseInt(String(payload.floorLevel).replace(/\D/g, ""), 10) || 4;

  if (numericFloor === 1 || numericFloor === 0) {
    floorAdjustmentPct = -0.06;
  } else if (numericFloor >= 4 && numericFloor <= 8) {
    floorAdjustmentPct = 0.04;
  } else if (numericFloor > 8 && numericFloor <= 14) {
    floorAdjustmentPct = 0.03;
  } else if (numericFloor > 14) {
    floorAdjustmentPct = 0.01;
  }

  // 3. Facing Adjustment
  // South-facing in Dhaka is universally desired for refreshing cross-breeze and winter sunlight.
  let facingAdjustmentPct = 0;
  if (payload.facing === "south") facingAdjustmentPct = 0.06;
  else if (payload.facing === "east") facingAdjustmentPct = 0.02;
  else if (payload.facing === "north") facingAdjustmentPct = -0.02;
  else if (payload.facing === "west") facingAdjustmentPct = -0.01;

  // 4. Dhaka Amenities Impact
  let amenitiesAdjustmentPct = 0;
  const valueDrivers: ValueDriverImpact[] = [];

  if (payload.amenities.lift) {
    amenitiesAdjustmentPct += 0.07;
    valueDrivers.push({
      id: "vd-lift",
      name: "High-Speed Lift / Elevator",
      deltaBdtPerSqft: Math.round(baseRatePerSqft * 0.07),
      formattedDelta: `+BDT ${Math.round(baseRatePerSqft * 0.07).toLocaleString("en-IN")}/sqft`,
      description: "Essential for upper floors in Dhaka residential buildings.",
      category: "amenity",
    });
  }

  if (payload.amenities.generator) {
    amenitiesAdjustmentPct += 0.05;
    valueDrivers.push({
      id: "vd-gen",
      name: "Full Standby Generator",
      deltaBdtPerSqft: Math.round(baseRatePerSqft * 0.05),
      formattedDelta: `+BDT ${Math.round(baseRatePerSqft * 0.05).toLocaleString("en-IN")}/sqft`,
      description: "Protects against load-shedding and powers pumps/lifts.",
      category: "amenity",
    });
  }

  if (payload.amenities.parking) {
    amenitiesAdjustmentPct += 0.06;
    valueDrivers.push({
      id: "vd-parking",
      name: "Dedicated Car Parking",
      deltaBdtPerSqft: Math.round(baseRatePerSqft * 0.06),
      formattedDelta: `+BDT ${Math.round(baseRatePerSqft * 0.06).toLocaleString("en-IN")}/sqft`,
      description: "Severe parking scarcity in Dhaka makes dedicated slots high value.",
      category: "amenity",
    });
  }

  if (payload.amenities.gas) {
    amenitiesAdjustmentPct += 0.04;
    valueDrivers.push({
      id: "vd-gas",
      name: "Titas / Reticulated LPG Gas",
      deltaBdtPerSqft: Math.round(baseRatePerSqft * 0.04),
      formattedDelta: `+BDT ${Math.round(baseRatePerSqft * 0.04).toLocaleString("en-IN")}/sqft`,
      description: "Uninterrupted cooking fuel connection adds strong buyer appeal.",
      category: "amenity",
    });
  }

  if (payload.amenities.lakeParkView) {
    amenitiesAdjustmentPct += 0.06;
    valueDrivers.push({
      id: "vd-lake",
      name: "Lake / Open Green Park View",
      deltaBdtPerSqft: Math.round(baseRatePerSqft * 0.06),
      formattedDelta: `+BDT ${Math.round(baseRatePerSqft * 0.06).toLocaleString("en-IN")}/sqft`,
      description: "Premium scenic view in densely built metropolitan Dhaka.",
      category: "location",
    });
  }

  if (payload.amenities.cctv) {
    amenitiesAdjustmentPct += 0.02;
  }
  if (payload.amenities.rooftop) {
    amenitiesAdjustmentPct += 0.02;
  }

  // Add facing driver if south
  if (payload.facing === "south") {
    valueDrivers.unshift({
      id: "vd-facing",
      name: "South-Facing Cross Breeze",
      deltaBdtPerSqft: Math.round(baseRatePerSqft * 0.06),
      formattedDelta: `+BDT ${Math.round(baseRatePerSqft * 0.06).toLocaleString("en-IN")}/sqft`,
      description: "Optimal airflow and natural daylight throughout the year.",
      category: "facing",
    });
  }

  // 5. Age / Condition Adjustment
  let conditionAdjustmentPct = 0;
  if (payload.propertyAge === "brand_new") {
    conditionAdjustmentPct = 0.05;
  } else if (payload.propertyAge === "under_construction") {
    conditionAdjustmentPct = -0.06;
  } else if (payload.propertyAge === "resale") {
    conditionAdjustmentPct = -0.05;
  }

  // 6. Net Rate per Sqft Calculation
  const totalMultiplier =
    1 +
    floorAdjustmentPct +
    facingAdjustmentPct +
    amenitiesAdjustmentPct +
    conditionAdjustmentPct;

  const calculatedRatePerSqft = Math.round(baseRatePerSqft * totalMultiplier);

  // Convert size if katha was selected (1 katha = 720 sqft)
  const effectiveSqft =
    payload.sizeUnit === "katha" ? payload.sizeSqft * 720 : payload.sizeSqft;

  const estimatedValue = Math.round(calculatedRatePerSqft * effectiveSqft);

  // Reasonable market spread (-5% to +6%)
  const lowEstimate = Math.round(estimatedValue * 0.94);
  const highEstimate = Math.round(estimatedValue * 1.06);

  // Estimated Monthly Rent & Gross Yield
  // Typical Dhaka gross yield ranges between 4.2% - 5.6%
  const annualRentalRate = benchmark.rentPerSqft * 12 * (1 + amenitiesAdjustmentPct * 0.5);
  const estimatedAnnualRent = annualRentalRate * effectiveSqft;
  const estimatedMonthlyRent = Math.round(estimatedAnnualRent / 12);
  const grossRentalYieldPct = Number(
    ((estimatedAnnualRent / estimatedValue) * 100).toFixed(2)
  );

  // Delta vs Area Average
  const areaAveragePricePerSqft = benchmark.salePerSqft;
  const pricePerSqftDeltaPct = Number(
    (
      ((calculatedRatePerSqft - areaAveragePricePerSqft) /
        areaAveragePricePerSqft) *
      100
    ).toFixed(1)
  );

  // Confidence Score
  const hasDetailedSpecs =
    Boolean(payload.roadOrBlock) &&
    payload.bedrooms > 0 &&
    payload.bathrooms > 0;
  const confidenceScore = hasDetailedSpecs ? "high" : "medium";
  const confidencePct = hasDetailedSpecs ? 94 : 82;
  const confidenceReason = hasDetailedSpecs
    ? `Calculated using verified transaction records and verified listing density in ${payload.areaName}.`
    : `Estimated based on general ${payload.areaName} sector averages. Add road/block for high accuracy.`;

  // Comparable Properties Selection
  const areaNameLower = payload.areaName.toLowerCase();
  const matchedComparables: ComparableProperty[] = previewProperties
    .filter((p) => {
      const pArea = (p.area?.name || "").toLowerCase();
      return (
        pArea.includes(areaNameLower) ||
        areaNameLower.includes(pArea) ||
        p.listing_type === payload.purpose
      );
    })
    .slice(0, 3)
    .map((p, idx) => {
      const sqft = p.sqft || p.area_size || 1800;
      const pricePerSq = Math.round(p.price / sqft);
      return {
        id: p.id,
        title: p.title,
        areaName: p.area?.name || payload.areaName,
        address: p.address || `${p.area?.name || payload.areaName}, Dhaka`,
        price: p.price,
        priceFormatted: formatBdtPrice(p.price),
        pricePerSqft: pricePerSq,
        sizeSqft: sqft,
        bedrooms: p.bedrooms || 3,
        bathrooms: p.bathrooms || 3,
        imageUrl:
          p.media?.[0]?.url ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        listingType: (p.listing_type as "sale" | "rent") || "sale",
        isVerified: p.is_verified ?? true,
        similarityScore: 95 - idx * 3,
      };
    });

  // If no direct area matches from previewProperties, generate high-quality fallback comparables
  if (matchedComparables.length === 0) {
    const fallbackBasePrice = estimatedValue;
    matchedComparables.push(
      {
        id: "comp-sim-01",
        title: `Verified ${payload.bedrooms || 3}BR Flat in ${payload.areaName}`,
        areaName: payload.areaName,
        address: `${payload.roadOrBlock || "Road 7"}, ${payload.areaName}, Dhaka`,
        price: Math.round(fallbackBasePrice * 0.98),
        priceFormatted: formatBdtPrice(Math.round(fallbackBasePrice * 0.98)),
        pricePerSqft: Math.round(calculatedRatePerSqft * 0.98),
        sizeSqft: effectiveSqft,
        bedrooms: payload.bedrooms || 3,
        bathrooms: payload.bathrooms || 3,
        imageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        listingType: payload.purpose,
        isVerified: true,
        similarityScore: 96,
      },
      {
        id: "comp-sim-02",
        title: `Modern ${payload.bedrooms || 3}BR Apartment with Generator`,
        areaName: payload.areaName,
        address: `${payload.roadOrBlock || "Sector 4"}, ${payload.areaName}, Dhaka`,
        price: Math.round(fallbackBasePrice * 1.03),
        priceFormatted: formatBdtPrice(Math.round(fallbackBasePrice * 1.03)),
        pricePerSqft: Math.round(calculatedRatePerSqft * 1.03),
        sizeSqft: Math.round(effectiveSqft * 1.05),
        bedrooms: payload.bedrooms || 3,
        bathrooms: payload.bathrooms || 3,
        imageUrl:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        listingType: payload.purpose,
        isVerified: true,
        similarityScore: 92,
      }
    );
  }

  const breakdownFactors: PriceBreakdownFactors = {
    baseRatePerSqft,
    floorAdjustmentPct: Number((floorAdjustmentPct * 100).toFixed(1)),
    facingAdjustmentPct: Number((facingAdjustmentPct * 100).toFixed(1)),
    amenitiesAdjustmentPct: Number((amenitiesAdjustmentPct * 100).toFixed(1)),
    conditionAdjustmentPct: Number((conditionAdjustmentPct * 100).toFixed(1)),
    calculatedRatePerSqft,
  };

  const marketMetric: AreaMarketMetric = {
    areaName: payload.areaName,
    avgPriceSqftSale: benchmark.salePerSqft,
    avgPriceSqftRent: benchmark.rentPerSqft,
    yearOverYearGrowthPct: benchmark.yoyGrowth,
    marketDemand: benchmark.demand,
    verifiedListingCount: 42,
    popularSubzones: benchmark.subzones,
  };

  const formattedAddress = [
    payload.buildingName,
    payload.roadOrBlock,
    payload.areaName,
    "Dhaka",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    valuationId: `VAL-${Date.now().toString(36).toUpperCase()}`,
    purpose: payload.purpose,
    propertyType: payload.propertyType,
    areaName: payload.areaName,
    addressFormatted: formattedAddress,
    sizeSqft: effectiveSqft,
    estimatedValue,
    estimatedValueFormatted: formatBdtPrice(estimatedValue),
    lowEstimate,
    lowEstimateFormatted: formatBdtPrice(lowEstimate),
    highEstimate,
    highEstimateFormatted: formatBdtPrice(highEstimate),
    estimatedMonthlyRent,
    estimatedMonthlyRentFormatted: formatMonthlyRent(estimatedMonthlyRent),
    grossRentalYieldPct,
    pricePerSqft: calculatedRatePerSqft,
    pricePerSqftFormatted: formatBdtPerSqft(calculatedRatePerSqft),
    areaAveragePricePerSqft,
    areaAveragePricePerSqftFormatted: formatBdtPerSqft(areaAveragePricePerSqft),
    pricePerSqftDeltaPct,
    confidenceScore,
    confidencePct,
    confidenceReason,
    valueDrivers,
    breakdownFactors,
    comparables: matchedComparables,
    marketMetric,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// SERVICE ADAPTER (PLUG-AND-PLAY)
// ============================================================================

/**
 * Request an instant property valuation.
 *
 * If `USE_MOCK_VALUATION_API` is true, executes the simulated Dhaka calculation
 * engine with a realistic 1.2s delay for seamless UX animation.
 * When false, delegates directly to the backend endpoint `VALUATION_API_ENDPOINT`.
 */
export async function getInstantValuation(
  payload: ValuationRequestPayload
): Promise<ValuationResponseData> {
  if (USE_MOCK_VALUATION_API) {
    // Simulate real-world network latency and server computation
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return calculateDhakaValuation(payload);
  }

  // Real backend call:
  const response = await apiClient.post<{
    data: ValuationResponseData;
  }>(VALUATION_API_ENDPOINT, payload);

  return response.data.data;
}
