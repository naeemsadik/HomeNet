/**
 * Strongly-typed domain definitions for HomeNet's Instant Valuation Pipeline.
 *
 * Modeled on the OnTheMarket valuation experience and tuned for the Dhaka real
 * estate market (pricing dynamics, units in sqft/katha, BDT crore/lakh representations).
 */

export type ValuationPurpose = "sale" | "rent";

export type ValuationPropertyType =
  | "apartment"
  | "house"
  | "commercial"
  | "land";

export type PropertyFacing = "south" | "north" | "east" | "west";

export type PropertyCondition =
  | "brand_new"
  | "under_construction"
  | "resale";

export interface ValuationAmenities {
  lift: boolean;
  generator: boolean;
  parking: boolean;
  gas: boolean;
  cctv: boolean;
  rooftop: boolean;
  lakeParkView: boolean;
}

export interface ValuationRequestPayload {
  purpose: ValuationPurpose;
  propertyType: ValuationPropertyType;
  areaId: string;
  areaName: string;
  roadOrBlock?: string;
  buildingName?: string;
  address?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  sizeSqft: number;
  sizeUnit: "sqft" | "katha";
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  floorLevel: number | string; // e.g. 4 or "Mid Floor (4-8)"
  facing: PropertyFacing;
  propertyAge: PropertyCondition;
  amenities: ValuationAmenities;
}

export interface ComparableProperty {
  id: string;
  title: string;
  areaName: string;
  address: string;
  price: number;
  priceFormatted: string;
  pricePerSqft: number;
  sizeSqft: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  listingType: "sale" | "rent";
  isVerified: boolean;
  similarityScore: number; // e.g. 96 (%)
}

export interface AreaMarketMetric {
  areaName: string;
  avgPriceSqftSale: number;
  avgPriceSqftRent: number;
  yearOverYearGrowthPct: number;
  marketDemand: "Very High" | "High" | "Moderate";
  verifiedListingCount: number;
  popularSubzones: string[];
}

export interface ValueDriverImpact {
  id: string;
  name: string;
  deltaBdtPerSqft: number;
  formattedDelta: string;
  description: string;
  category: "location" | "facing" | "amenity" | "floor" | "condition";
}

export interface PriceBreakdownFactors {
  baseRatePerSqft: number;
  floorAdjustmentPct: number;
  facingAdjustmentPct: number;
  amenitiesAdjustmentPct: number;
  conditionAdjustmentPct: number;
  calculatedRatePerSqft: number;
}

export interface ValuationResponseData {
  valuationId: string;
  purpose: ValuationPurpose;
  propertyType: ValuationPropertyType;
  areaName: string;
  addressFormatted: string;
  sizeSqft: number;

  /** Estimated central market value in BDT */
  estimatedValue: number;
  estimatedValueFormatted: string;

  /** Low boundary of estimated valuation */
  lowEstimate: number;
  lowEstimateFormatted: string;

  /** High boundary of estimated valuation */
  highEstimate: number;
  highEstimateFormatted: string;

  /** Estimated Monthly Rental Yield */
  estimatedMonthlyRent: number;
  estimatedMonthlyRentFormatted: string;
  grossRentalYieldPct: number;

  /** Price per sqft */
  pricePerSqft: number;
  pricePerSqftFormatted: string;
  areaAveragePricePerSqft: number;
  areaAveragePricePerSqftFormatted: string;
  pricePerSqftDeltaPct: number; // e.g. +6.5% vs area average

  /** Confidence assessment */
  confidenceScore: "high" | "medium";
  confidencePct: number;
  confidenceReason: string;

  /** Dhaka Value Drivers Breakdown */
  valueDrivers: ValueDriverImpact[];
  breakdownFactors: PriceBreakdownFactors;

  /** 2-3 verified comparable listings */
  comparables: ComparableProperty[];

  /** Neighborhood market intelligence */
  marketMetric: AreaMarketMetric;

  /** Timestamp of calculation */
  generatedAt: string;
}

export interface ValuationApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export type ValuationStep = 1 | 2 | 3 | 4;
