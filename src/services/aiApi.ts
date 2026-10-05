import { z } from "@/lib/zod";
import apiClient, { toApiError } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import {
  AiParseError,
  type AiParsedProperty,
} from "@/features/property/types/aiListing";
import type { AiParsedSearch } from "@/features/property/types/aiSearch";

/**
 * HomeNet AI — client side.
 *
 * The app calls HomeNet operations; the API decides which provider and model
 * serve each one (see docs/BACKEND_REQUIREMENTS.md §1). Nothing in the app knows which vendor
 * is behind an operation, and no provider key ever reaches the client —
 * anything prefixed EXPO_PUBLIC_ is published inside the bundle.
 */

const CONFIDENCE = z.enum(["high", "medium", "low"]);

// One schema per field rather than one for the whole object: a single field
// the model got wrong (say, an unknown subtype) is dropped, not allowed to
// throw away every other field it got right. The server validates too; this
// is the client refusing to trust the network.
function pickValidFields<T>(
  raw: unknown,
  schemas: Record<string, z.ZodType>,
  unreadable: AiParseError,
): T {
  if (!raw || typeof raw !== "object") throw unreadable;
  const source = raw as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(schemas)) {
    const parsed = schema.safeParse(source[key]);
    if (parsed.success) result[key] = parsed.data;
  }
  return result as T;
}

/** What each failure means for the person using that feature — never a vendor or config detail. */
interface AiErrorCopy {
  unauthenticated: string;
  quota: string;
  unreadable: string;
  unavailable: string;
}

const NETWORK_MESSAGE = "Couldn't connect. Check your internet connection and try again.";

function toAiParseError(error: unknown, copy: AiErrorCopy): AiParseError {
  if (error instanceof AiParseError) return error;
  const { status } = toApiError(error);

  switch (status) {
    case null:
      return new AiParseError(NETWORK_MESSAGE, "NETWORK_ERROR");
    case 401:
      return new AiParseError(copy.unauthenticated, "UNAUTHENTICATED");
    case 429:
      return new AiParseError(copy.quota, "QUOTA_EXCEEDED");
    case 400:
    case 422:
      return new AiParseError(copy.unreadable, "UNREADABLE");
    default:
      // 404 until the endpoint is deployed, 5xx when every provider is down.
      return new AiParseError(copy.unavailable, "UNAVAILABLE");
  }
}

// ─── Quick listing ─────────────────────────────────────────────────────────────

// Models return numbers either as numbers or as strings; the listing form
// works in strings throughout.
const numericString = z.union([z.string(), z.number()]).transform(String);

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
  confidence: z.record(z.string(), CONFIDENCE),
} satisfies Record<keyof AiParsedProperty, z.ZodType>;

const LISTING_COPY: AiErrorCopy = {
  unauthenticated: "Please log in to use quick listing.",
  quota: "You've used today's quick listings. Try again tomorrow, or use the step-by-step form.",
  unreadable: "We couldn't read that description. Try including the property type, area and price.",
  unavailable: "Quick listing isn't available right now. Please use the step-by-step form instead.",
};

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
    return pickValidFields<AiParsedProperty>(
      data.data,
      PARSED_PROPERTY_FIELDS,
      new AiParseError(LISTING_COPY.unreadable, "UNREADABLE"),
    );
  } catch (error) {
    throw toAiParseError(error, LISTING_COPY);
  }
}

// ─── AI search ─────────────────────────────────────────────────────────────────

const amount = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().nonnegative());
const count = amount.pipe(z.number().int());
const place = z.string().trim().min(1);

const PARSED_SEARCH_FIELDS = {
  listingType: z.enum(["sale", "rent"]),
  type: z.enum(["residential", "commercial", "land", "parking"]),
  minPrice: amount,
  maxPrice: amount,
  minArea: amount,
  maxArea: amount,
  bedrooms: count,
  bathrooms: count,
  areaName: place,
  city: place,
  unmatched: z.array(z.string().trim().min(1)),
  summary: z.string().trim().min(1),
  confidence: z.record(z.string(), CONFIDENCE),
} satisfies Record<keyof AiParsedSearch, z.ZodType>;

const SEARCH_COPY: AiErrorCopy = {
  unauthenticated: "Please log in to use AI search.",
  quota: "You've reached the AI search limit for now. You can answer the guided questions instead.",
  unreadable:
    "We couldn't make sense of that. Try something like “2 bedroom flat for rent in Dhanmondi under 40 thousand”.",
  unavailable: "AI search isn't available right now. You can answer the guided questions instead.",
};

/**
 * AI search: a seeker's plain-words query → search filters. The listings are
 * then fetched from the normal properties API with those filters.
 * Server contract: POST /v1/ai/parse-search (docs/BACKEND_REQUIREMENTS.md §1b).
 */
export async function parsePropertySearch(query: string): Promise<AiParsedSearch> {
  try {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/v1/ai/parse-search",
      { query },
      { timeout: 20_000 },
    );
    return pickValidFields<AiParsedSearch>(
      data.data,
      PARSED_SEARCH_FIELDS,
      new AiParseError(SEARCH_COPY.unreadable, "UNREADABLE"),
    );
  } catch (error) {
    throw toAiParseError(error, SEARCH_COPY);
  }
}
