/**
 * AI-Assisted Property Listing — Data Contract
 *
 * Defines the shape of data returned by the AI property parser.
 * Every field is optional because the AI may not extract all details.
 */

// ─── Core parsed property interface ────────────────────────────────────────────

export type AiConfidenceLevel = "high" | "medium" | "low";
export type AiFieldConfidence = Record<string, AiConfidenceLevel>;

export interface AiParsedProperty {
  title?: string;
  description?: string;
  type?: "residential" | "commercial" | "land" | "parking";
  subtype?: string;
  listingType?: "sale" | "rent";
  price?: string;
  areaSize?: string;
  areaUnit?: "sqft" | "katha" | "bigha" | "sqm";
  bedrooms?: string;
  bathrooms?: string;
  floor?: string;
  facing?: string;
  address?: string;
  amenities?: Record<string, boolean>;
  confidence?: AiFieldConfidence;
}

// ─── Typed error for parse failures ────────────────────────────────────────────

export class AiParseError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MISSING_API_KEY"
      | "NETWORK_ERROR"
      | "INVALID_RESPONSE"
      | "BAD_JSON"
      | "UNKNOWN" = "UNKNOWN",
  ) {
    super(message);
    this.name = "AiParseError";
  }
}

// ─── Field groupings for the preview UI ────────────────────────────────────────

export interface AiFieldMeta {
  key: keyof AiParsedProperty;
  label: string;
  section: "Basics" | "Details" | "Location" | "Amenities";
}

export const AI_FIELD_DEFINITIONS: AiFieldMeta[] = [
  // Basics
  { key: "title", label: "Title", section: "Basics" },
  { key: "description", label: "Description", section: "Basics" },
  { key: "type", label: "Category", section: "Basics" },
  { key: "subtype", label: "Subtype", section: "Basics" },
  { key: "listingType", label: "Listing Purpose", section: "Basics" },

  // Details
  { key: "price", label: "Price (BDT)", section: "Details" },
  { key: "areaSize", label: "Area Size", section: "Details" },
  { key: "areaUnit", label: "Area Unit", section: "Details" },
  { key: "bedrooms", label: "Bedrooms", section: "Details" },
  { key: "bathrooms", label: "Bathrooms", section: "Details" },
  { key: "floor", label: "Floor", section: "Details" },
  { key: "facing", label: "Facing", section: "Details" },

  // Location
  { key: "address", label: "Address", section: "Location" },
];
