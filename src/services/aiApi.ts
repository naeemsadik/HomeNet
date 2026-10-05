import { z } from "@/lib/zod";
import apiClient, { toApiError } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import {
  AiParseError,
  type AiParsedProperty,
} from "@/features/property/types/aiListing";
import type {
  SmartSearchFilters,
  SmartSearchListing,
  SmartSearchResult,
} from "@/features/property/types/aiSearch";

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

const PROPERTY_TYPE = z.enum(["residential", "commercial", "land", "parking"]);
const LISTING_TYPE = z.enum(["sale", "rent", "short_let"]);

// Filters fall back to "not stated" one by one: a bad value in one never
// discards the rest, and never invents a filter the model didn't produce.
const nullableNumber = z.number().finite().positive().nullable().catch(null);
const filtersSchema = z
  .object({
    area: z.string().trim().min(1).nullable().catch(null),
    listing_type: LISTING_TYPE.nullable().catch(null),
    type: PROPERTY_TYPE.nullable().catch(null),
    min_price: nullableNumber,
    max_price: nullableNumber,
    bedrooms: nullableNumber,
    bathrooms: nullableNumber,
    amenities: z.array(z.string()).catch([]),
  })
  .catch({
    area: null,
    listing_type: null,
    type: null,
    min_price: null,
    max_price: null,
    bedrooms: null,
    bathrooms: null,
    amenities: [],
  });

const listingSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  type: PROPERTY_TYPE,
  subtype: z.string().nullable().catch(null),
  listing_type: LISTING_TYPE,
  price: z.number().finite(),
  price_currency: z.string().catch("BDT"),
  area_size: z.number().finite().nullable().catch(null),
  area_unit: z.string().nullable().catch(null),
  address: z.string().nullable().catch(null),
  amenities: z.record(z.string(), z.unknown()).nullable().catch(null),
  is_verified: z.boolean().catch(false),
  published_at: z.string().nullable().catch(null),
  area: z.object({ id: z.string(), name: z.string(), city: z.string().nullable().catch(null) }),
  media: z
    .array(z.object({ id: z.string(), url: z.string(), thumbnail_url: z.string().nullable().catch(null) }))
    .catch([]),
  // Badges are a bonus: the API leaves them empty when the model fails.
  ai_badges: z.array(z.string().trim().min(1)).catch([]),
}) satisfies z.ZodType<SmartSearchListing>;

function parseSmartSearch(raw: unknown, unreadable: AiParseError): SmartSearchResult {
  if (!raw || typeof raw !== "object") throw unreadable;
  const source = raw as Record<string, unknown>;

  // One malformed listing is skipped; the rest still show.
  const listings = (Array.isArray(source.listings) ? source.listings : []).flatMap((item) => {
    const parsed = listingSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });

  const page = z.object({ total: z.number(), page: z.number(), limit: z.number(), total_pages: z.number() });
  const pagination = page.safeParse(source.pagination);

  return {
    query: typeof source.query === "string" ? source.query : "",
    filters: filtersSchema.parse(source.filters) as SmartSearchFilters,
    listings,
    pagination: pagination.success
      ? pagination.data
      : { total: listings.length, page: 1, limit: listings.length, total_pages: 1 },
  };
}

const SEARCH_COPY: AiErrorCopy = {
  unauthenticated: "Please log in to use AI search.",
  quota: "Lots of people are searching right now. Wait a minute, or answer the guided questions instead.",
  unreadable:
    "We couldn't make sense of that. Describe the place, the kind of property or your budget, for example “2 bedroom flat for rent in Dhanmondi under 40 thousand”.",
  unavailable: "AI search is busy or unavailable right now. You can answer the guided questions instead.",
};

export interface SmartSearchParams {
  query: string;
  page?: number;
  /** The API allows 1–20. */
  limit?: number;
}

/**
 * AI search: a seeker's plain-words query → matching verified listings, the
 * filters the model understood, and short "why it matches" badges.
 * Server contract: POST /v1/properties/smart-search (docs/BACKEND_REQUIREMENTS.md §1b).
 */
export async function smartSearch({ query, page = 1, limit = 12 }: SmartSearchParams): Promise<SmartSearchResult> {
  try {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/v1/properties/smart-search",
      { query, page, limit },
      // Two model calls (filters, then badges) of up to 8 s each, plus the database.
      { timeout: 30_000 },
    );
    return parseSmartSearch(data.data, new AiParseError(SEARCH_COPY.unreadable, "UNREADABLE"));
  } catch (error) {
    throw toAiParseError(error, SEARCH_COPY);
  }
}
