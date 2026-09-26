import { z } from "zod";
import apiClient, { toApiError } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import {
  AiParseError,
  type AiParsedProperty,
} from "@/features/property/types/aiListing";

/**
 * HomeNet AI — client side.
 *
 * The app calls HomeNet operations; the API decides which provider and model
 * serve each one (see docs/AI_LAYER.md). Nothing in the app knows which vendor
 * is behind an operation, and no provider key ever reaches the client —
 * anything prefixed EXPO_PUBLIC_ is published inside the bundle.
 */

// Models return numbers either as numbers or as strings; the listing form
// works in strings throughout.
const numericString = z.union([z.string(), z.number()]).transform(String);

// One schema per field rather than one for the whole object: a single field
// the model got wrong (say, an unknown subtype) is dropped, not allowed to
// throw away every other field it got right. The server validates too; this
// is the client refusing to trust the network.
const PARSED_PROPERTY_FIELDS = {
  title: z.string(),
  description: z.string(),
  type: z.enum(["residential", "commercial", "land", "parking"]),
  subtype: z.string(),
  listingType: z.enum(["sale", "rent"]),
  price: numericString,
  areaSize: numericString,
  areaUnit: z.enum(["sqft", "katha", "bigha", "sqm"]),
  bedrooms: numericString,
  bathrooms: numericString,
  floor: numericString,
  facing: z.string(),
  address: z.string(),
  amenities: z.record(z.string(), z.boolean()),
  confidence: z.record(z.string(), z.enum(["high", "medium", "low"])),
} satisfies Record<keyof AiParsedProperty, z.ZodType>;

function keepValidFields(raw: unknown): AiParsedProperty {
  if (!raw || typeof raw !== "object") {
    throw new AiParseError(
      "We couldn't read that description. Try including the property type, area and price.",
      "UNREADABLE",
    );
  }
  const source = raw as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(PARSED_PROPERTY_FIELDS)) {
    const parsed = schema.safeParse(source[key]);
    if (parsed.success) result[key] = parsed.data;
  }
  return result as AiParsedProperty;
}

const UNAVAILABLE = new AiParseError(
  "Quick listing isn't available right now. Please use the step-by-step form instead.",
  "UNAVAILABLE",
);

/** Turns any failure into a message an owner can act on — never a vendor or config detail. */
function toAiParseError(error: unknown): AiParseError {
  if (error instanceof AiParseError) return error;
  const { status } = toApiError(error);

  switch (status) {
    case null:
      return new AiParseError(
        "Couldn't connect. Check your internet connection and try again.",
        "NETWORK_ERROR",
      );
    case 401:
      return new AiParseError("Please log in to use quick listing.", "UNAUTHENTICATED");
    case 429:
      return new AiParseError(
        "You've used today's quick listings. Try again tomorrow, or use the step-by-step form.",
        "QUOTA_EXCEEDED",
      );
    case 400:
    case 422:
      return new AiParseError(
        "We couldn't read that description. Try including the property type, area and price.",
        "UNREADABLE",
      );
    default:
      // 404 until the endpoint is deployed, 5xx when every provider is down.
      return UNAVAILABLE;
  }
}

/**
 * Quick listing: an owner's free-text description → structured listing fields.
 * Server contract: POST /v1/ai/parse-property (docs/BACKEND_REQUIREMENTS.md §1).
 */
export async function generatePropertyDescription(
  description: string,
): Promise<AiParsedProperty> {
  try {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/v1/ai/parse-property",
      { description },
      // Model calls are slower than ordinary reads; the API allows 30 s.
      { timeout: 30_000 },
    );
    return keepValidFields(data.data);
  } catch (error) {
    throw toAiParseError(error);
  }
}
