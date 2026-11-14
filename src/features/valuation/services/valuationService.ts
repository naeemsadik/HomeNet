import apiClient from "@/services/apiClient";
import { getProperties } from "@/services/propertyApi";
import { cdnImage } from "@/lib/cloudinaryImage";
import { isMessSubtype } from "@/lib/listingPath";
import areaBenchmarkData from "../data/areaBenchmarks.json";
import { translate } from "@/i18n";
import { confidenceReasonText } from "../utils/confidenceText";
import type { Property, PropertyFilters } from "@/features/property/types/property";
import type { PropertyType } from "@/types/api";
import type {
  AreaMarketMetric,
  ConfidenceBasis,
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
  subzones: string[];
}

const DHAKA_AREA_BENCHMARKS: Record<string, AreaBenchmark> = {
  gulshan: {
    salePerSqft: 18500,
    rentPerSqft: 72,
    subzones: ["Gulshan-1", "Gulshan-2", "South Avenue", "Gushan Lake Park"],
  },
  banani: {
    salePerSqft: 16200,
    rentPerSqft: 64,
    subzones: ["Block C", "Block D", "Block F", "Road 11"],
  },
  baridhara: {
    salePerSqft: 22000,
    rentPerSqft: 88,
    subzones: ["Diplomatic Zone", "Baridhara DOHS", "Parkway"],
  },
  dhanmondi: {
    salePerSqft: 13500,
    rentPerSqft: 52,
    subzones: ["Road 27", "Road 8A", "Satmasjid Road", "Lakeside"],
  },
  uttara: {
    salePerSqft: 9400,
    rentPerSqft: 36,
    subzones: ["Sector 3", "Sector 7", "Sector 11", "Sector 13", "Uttara Model Town"],
  },
  bashundhara: {
    salePerSqft: 8800,
    rentPerSqft: 34,
    subzones: ["Block C", "Block D", "Block I", "Near Evercare", "North South Univ"],
  },
  mirpur: {
    salePerSqft: 6200,
    rentPerSqft: 25,
    subzones: ["Mirpur-1", "Mirpur-2", "Mirpur-10", "Mirpur DOHS"],
  },
  mohammadpur: {
    salePerSqft: 7600,
    rentPerSqft: 30,
    subzones: ["Kaderabad Housing", "Japan Garden City", "Salimullah Road"],
  },
  banasree: {
    salePerSqft: 7200,
    rentPerSqft: 28,
    subzones: ["Block B", "Block C", "Block E", "Rampura Road"],
  },
  motijheel: {
    salePerSqft: 11000,
    rentPerSqft: 45,
    subzones: ["Dilkusha", "Arambagh", "Purana Paltan"],
  },
};

const DEFAULT_BENCHMARK: AreaBenchmark = {
  salePerSqft: 7800,
  rentPerSqft: 30,
  subzones: ["Central", "North Zone", "South Zone"],
};

// ============================================================================
// PRICES FROM LISTINGS
// ============================================================================

/**
 * What areaBenchmarks.json holds for one area and purpose. The file is built
 * offline from listing sites (see pipeline/benchmarkPipeline.ts) and holds only
 * counts and quartiles of asking prices.
 */
interface ListingRate {
  n: number;
  median: number;
  p25: number;
  p75: number;
  /** The biggest single site's share of n, 0 to 1. */
  largestSourceShare: number;
}

interface BenchmarkFile {
  asOf: string;
  areas: Record<string, Partial<Record<"sale" | "rent", ListingRate & { status: "ok" | "thin" | "insufficient" }>>>;
}

const BENCHMARK_DATA = areaBenchmarkData as unknown as BenchmarkFile;

/**
 * An area's price from listings, only when there are enough of them (status
 * "ok"). A thin sample is not used: a figure from a handful of asking prices
 * is worse than saying we only have a rough rate.
 */
function listingRate(areaKey: string, purpose: "sale" | "rent"): ListingRate | null {
  const stats = BENCHMARK_DATA.areas[areaKey]?.[purpose];
  if (!stats || stats.status !== "ok") return null;
  return {
    n: stats.n,
    median: stats.median,
    p25: stats.p25,
    p75: stats.p75,
    largestSourceShare: stats.largestSourceShare ?? 0,
  };
}

/** Above this share from one site, a figure is capped at medium confidence. */
const MAX_SINGLE_SOURCE_SHARE = 0.75;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * The range around the estimate. From listings it follows the spread of the
 * area's asking prices (the middle half), kept between a tenth and 30% either
 * way so one odd listing cannot make the range useless. Without listings it is
 * the flat -6% / +6% the estimate always used.
 */
function estimateSpread(rate: ListingRate | null): { low: number; high: number } {
  if (!rate) return { low: 0.94, high: 1.06 };
  return {
    low: clamp(rate.p25 / rate.median, 0.7, 0.94),
    high: clamp(rate.p75 / rate.median, 1.06, 1.3),
  };
}

/** True when the area has its own benchmark; otherwise the estimate uses the Dhaka-wide average. */
export function hasAreaBenchmark(areaName: string): boolean {
  return normalizeAreaKey(areaName) !== "default";
}

function normalizeAreaKey(areaName: string): string {
  const clean = areaName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const key of Object.keys(DHAKA_AREA_BENCHMARKS)) {
    if (clean.includes(key)) return key;
  }
  // An area with no built-in rate can still be priced from listings, once there are enough.
  for (const key of Object.keys(BENCHMARK_DATA.areas)) {
    if (clean.includes(key.replace(/[^a-z0-9]/g, "")) && (listingRate(key, "sale") || listingRate(key, "rent"))) {
      return key;
    }
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
  const baseBenchmark = DHAKA_AREA_BENCHMARKS[areaKey] || DEFAULT_BENCHMARK;
  // The listings are apartments, so they speak for an apartment and for nothing else.
  const isApartment = payload.propertyType === "apartment";
  // Where there are enough listings, their median replaces the built-in rate.
  const saleListings = listingRate(areaKey, "sale");
  const rentListings = listingRate(areaKey, "rent");
  const benchmark: AreaBenchmark = {
    ...baseBenchmark,
    salePerSqft: saleListings?.median ?? baseBenchmark.salePerSqft,
    rentPerSqft: rentListings?.median ?? baseBenchmark.rentPerSqft,
  };

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
  // Without a floor there is nothing to adjust: assuming one would add or take off a few percent unseen.
  const floorGiven = payload.floorLevel !== undefined && String(payload.floorLevel).trim() !== "";
  const numericFloor = !floorGiven
    ? NaN
    : typeof payload.floorLevel === "number"
      ? payload.floorLevel
      : parseInt(String(payload.floorLevel).replace(/\D/g, ""), 10);

  if (Number.isNaN(numericFloor)) {
    floorAdjustmentPct = 0;
  } else if (numericFloor === 1 || numericFloor === 0) {
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

  // 6. The site: road access, papers and monsoon waterlogging. After the area, these move a Dhaka
  // price the most: buyers and banks discount a narrow lane, unclear papers and standing water.
  let siteAdjustmentPct = 0;
  const siteDriver = (id: string, name: string, pct: number, description: string, category: ValueDriverImpact["category"]) => {
    const delta = Math.round(baseRatePerSqft * pct);
    valueDrivers.push({
      id,
      name,
      deltaBdtPerSqft: delta,
      formattedDelta: `${delta >= 0 ? "+" : "-"}BDT ${Math.abs(delta).toLocaleString("en-IN")}/sqft`,
      description,
      category,
    });
  };
  // The floor and the age move the price too, so they are listed with the other drivers.
  if (floorAdjustmentPct !== 0) {
    siteDriver(
      "vd-floor",
      floorAdjustmentPct > 0 ? "Higher floor" : "Ground floor",
      floorAdjustmentPct,
      "",
      "floor",
    );
  }
  if (conditionAdjustmentPct !== 0) {
    siteDriver(
      "vd-condition",
      payload.propertyAge === "brand_new"
        ? "Newly built"
        : payload.propertyAge === "under_construction"
          ? "Still under construction"
          : "Previously lived in",
      conditionAdjustmentPct,
      "",
      "condition",
    );
  }
  const road = payload.roadAccess ?? "wide_road";
  if (road === "main_road") {
    siteAdjustmentPct += 0.08;
    siteDriver("vd-road", "On a main road (40 ft or wider)", 0.08, "Easy car access and frontage, which buyers and shops pay for.", "access");
  } else if (road === "narrow_lane") {
    siteAdjustmentPct -= 0.1;
    siteDriver("vd-road", "Narrow lane (under 20 ft)", -0.1, "Hard for cars, ambulances and fire service to reach; buyers discount it.", "access");
  }
  if ((payload.legalPapers ?? "complete") === "unsure") {
    siteAdjustmentPct -= 0.06;
    siteDriver("vd-papers", "Papers not confirmed", -0.06, "Banks lend less and buyers ask a discount until RAJUK approval and mutation are confirmed.", "legal");
  }
  if ((payload.waterlogging ?? "never") === "sometimes") {
    siteAdjustmentPct -= 0.07;
    siteDriver("vd-water", "Waterlogging in the monsoon", -0.07, "Standing water on the road or in the building lowers what buyers and tenants pay.", "location");
  }

  // 7. Net Rate per Sqft Calculation
  const totalMultiplier =
    1 +
    floorAdjustmentPct +
    facingAdjustmentPct +
    amenitiesAdjustmentPct +
    conditionAdjustmentPct +
    siteAdjustmentPct;

  const calculatedRatePerSqft = Math.round(baseRatePerSqft * totalMultiplier);

  // Convert size if katha was selected (1 katha = 720 sqft)
  const effectiveSqft =
    payload.sizeUnit === "katha" ? payload.sizeSqft * 720 : payload.sizeSqft;

  const estimatedValue = Math.round(calculatedRatePerSqft * effectiveSqft);

  const spread = estimateSpread(isApartment ? saleListings : null);
  const lowEstimate = Math.round(estimatedValue * spread.low);
  const highEstimate = Math.round(estimatedValue * spread.high);

  // Estimated Monthly Rent & Gross Yield
  // Typical Dhaka gross yield ranges between 4.2% - 5.6%
  const annualRentalRate = benchmark.rentPerSqft * 12 * (1 + amenitiesAdjustmentPct * 0.5);
  const estimatedAnnualRent = annualRentalRate * effectiveSqft;
  const estimatedMonthlyRent = Math.round(estimatedAnnualRent / 12);
  const rentSpread = estimateSpread(isApartment ? rentListings : null);
  const lowMonthlyRent = Math.round(estimatedMonthlyRent * rentSpread.low);
  const highMonthlyRent = Math.round(estimatedMonthlyRent * rentSpread.high);
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

  // How much to trust it. The area matters most: only an area with enough listings behind its
  // price can be medium or high, and only for an apartment, which is all the listings cover. An
  // area we only have a built-in rate for, or none, is a rough guide. Asking prices are not sale records.
  const knownArea = areaKey !== "default";
  const primary = payload.purpose === "rent" ? rentListings : saleListings;
  const otherRate = payload.purpose === "rent" ? saleListings : rentListings;
  const basis = isApartment ? primary : null;
  // One site deciding most of the figure, or a rent whose yield rests on an estimated sale price,
  // keeps it from being high.
  const mostlyOneSite = Boolean(basis && basis.largestSourceShare > MAX_SINGLE_SOURCE_SHARE);
  const capped = mostlyOneSite || (payload.purpose === "rent" && !saleListings);
  const confidenceScore: ValuationResponseData["confidenceScore"] = !basis
    ? "low"
    : !capped
      ? "high"
      : "medium";
  const confidencePct = confidenceScore === "high" ? 85 : confidenceScore === "medium" ? 70 : 50;
  const confidenceBasis: ConfidenceBasis = basis
    ? {
        kind: "listings",
        listings: basis.n,
        asOf: BENCHMARK_DATA.asOf,
        mostlyOneSite,
        estimatedYieldInput: otherRate ? undefined : payload.purpose === "rent" ? "sale" : "rent",
      }
    : primary
      ? { kind: "apartmentsOnly" }
      : knownArea
        ? { kind: "builtInRate" }
        : { kind: "noData" };
  const confidenceReason = confidenceReasonText(
    confidenceBasis,
    { areaName: payload.areaName, purpose: payload.purpose, language: "en" },
    (key, params) => translate("en", key, params),
  );

  const breakdownFactors: PriceBreakdownFactors = {
    baseRatePerSqft,
    floorAdjustmentPct: Number((floorAdjustmentPct * 100).toFixed(1)),
    facingAdjustmentPct: Number((facingAdjustmentPct * 100).toFixed(1)),
    amenitiesAdjustmentPct: Number((amenitiesAdjustmentPct * 100).toFixed(1)),
    conditionAdjustmentPct: Number((conditionAdjustmentPct * 100).toFixed(1)),
    siteAdjustmentPct: Number((siteAdjustmentPct * 100).toFixed(1)),
    calculatedRatePerSqft,
  };

  const marketMetric: AreaMarketMetric = {
    areaName: payload.areaName,
    avgPriceSqftSale: benchmark.salePerSqft,
    avgPriceSqftRent: benchmark.rentPerSqft,
    // Not measured yet: no listing count is claimed.
    verifiedListingCount: 0,
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
    lowMonthlyRent,
    highMonthlyRent,
    lowMonthlyRentFormatted: formatMonthlyRent(lowMonthlyRent),
    highMonthlyRentFormatted: formatMonthlyRent(highMonthlyRent),
    grossRentalYieldPct,
    pricePerSqft: calculatedRatePerSqft,
    pricePerSqftFormatted: formatBdtPerSqft(calculatedRatePerSqft),
    areaAveragePricePerSqft,
    areaAveragePricePerSqftFormatted: formatBdtPerSqft(areaAveragePricePerSqft),
    pricePerSqftDeltaPct,
    confidenceScore,
    confidencePct,
    confidenceReason,
    confidenceBasis,
    valueDrivers,
    breakdownFactors,
    // Filled from live listings by getInstantValuation (findComparables); the calculation itself invents none.
    comparables: [],
    marketMetric,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// COMPARABLE LISTINGS (LIVE, FROM HOMENET)
// ============================================================================

const SQFT_PER_KATHA = 720;
const COMPARABLES_SHOWN = 3;

/** An area id from the picker is a real one; the quick chips and old links make up "gulshan-dhaka". */
const isRealAreaId = (id: string | undefined) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LISTING_TYPE: Record<ValuationRequestPayload["propertyType"], PropertyType> = {
  apartment: "residential",
  house: "residential",
  commercial: "commercial",
  land: "land",
};

/** A listing's size in square feet, or null when it has none or uses a unit we can't convert. */
function listingSqft(p: Property): number | null {
  if (typeof p.sqft === "number" && p.sqft > 0) return p.sqft;
  if (typeof p.area_size !== "number" || p.area_size <= 0) return null;
  const unit = (p.area_unit ?? "sqft").toLowerCase();
  if (unit === "sqft") return p.area_size;
  if (unit === "katha") return p.area_size * SQFT_PER_KATHA;
  return null;
}

/**
 * Live HomeNet listings like the one being valued: the same area, sale or rent and kind of
 * property, closest in size first. They are asking prices on the site, not sale records, and
 * nothing is made up: when the request fails or finds none, there are none to show.
 */
export async function findComparables(payload: ValuationRequestPayload): Promise<ComparableProperty[]> {
  const filters: PropertyFilters = {
    listing_type: payload.purpose,
    type: LISTING_TYPE[payload.propertyType],
    status: "active",
    limit: 20,
    ...(isRealAreaId(payload.areaId) ? { area_id: payload.areaId } : { search: payload.areaName }),
  };
  let items: Property[];
  try {
    items = (await getProperties(filters)).data?.items ?? [];
  } catch {
    return [];
  }

  const targetSqft = payload.sizeUnit === "katha" ? payload.sizeSqft * SQFT_PER_KATHA : payload.sizeSqft;
  return items
    // A mess seat's rent is per seat, not for the home: it would drag a rent valuation down.
    .filter((p) => p.listing_type === payload.purpose && p.price > 0 && !isMessSubtype(p.subtype))
    .map((p) => ({ p, sqft: listingSqft(p) }))
    // Closest in size first; a listing without a size goes last.
    .sort((x, y) => (x.sqft === null ? Infinity : Math.abs(x.sqft - targetSqft)) - (y.sqft === null ? Infinity : Math.abs(y.sqft - targetSqft)))
    .slice(0, COMPARABLES_SHOWN)
    .map(({ p, sqft }) => {
      const photo = p.media?.find((m) => m.media_type === "image")?.url ?? null;
      return {
        id: p.id,
        title: p.title,
        areaName: p.area?.name ?? payload.areaName,
        address: p.address ?? p.area?.name ?? payload.areaName,
        price: p.price,
        priceFormatted: p.listing_type === "rent" ? formatMonthlyRent(p.price) : formatBdtPrice(p.price),
        pricePerSqft: sqft ? Math.round(p.price / sqft) : 0,
        sizeSqft: sqft ?? 0,
        bedrooms: p.bedrooms ?? 0,
        bathrooms: p.bathrooms ?? 0,
        imageUrl: (photo ? cdnImage(photo, 480, 320) : null) ?? "",
        listingType: p.listing_type === "rent" ? "rent" : "sale",
        isVerified: p.is_verified,
      };
    });
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
    const result = calculateDhakaValuation(payload);
    return { ...result, comparables: await findComparables(payload) };
  }

  // Real backend call:
  const response = await apiClient.post<{
    data: ValuationResponseData;
  }>(VALUATION_API_ENDPOINT, payload);

  return response.data.data;
}
