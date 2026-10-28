/**
 * One filter model for the hero, the inline filter bar and the filters modal.
 *
 * Before this there were two: `FilterState` (hero + modal) and
 * `RightmoveFilters` (Browse). Nothing converted between them, so a search
 * crossed the gap half-translated, bathrooms were written to the URL and never
 * read back, and the hero's badge counted amenities it never sent.
 *
 * The URL is the only durable state. These helpers are the conversions in and
 * out of it, plus the two passes that actually filter: `toApiFilters` for what
 * the API can do, and `applyClientFilters` for what it cannot.
 */
import { filterAddedSince } from "./addedToSite";

// Re-exported so the filter model stays the one import point for callers.
export { filterAddedSince } from "./addedToSite";
import type { Property, PropertyFilters } from "../types/property";
import type { PropertyType } from "@/types/api";

export type SearchPurpose = "all" | "sale" | "rent" | "short-let" | "sold";

export interface SearchFilters {
  purpose: SearchPurpose;
  query: string;
  /**
   * The place, by name: a city ("Dhaka") or a neighbourhood ("Gulshan"); ""
   * is everywhere. `resolveScope` (areaScope.ts) turns it into the area ids or
   * the centre-and-radius the API actually filters on, never a `city` param,
   * which the deployed API rejects outright with a 400.
   */
  area: string;
  radius: string;
  /** "all" or an API PropertyType: residential, commercial, land, parking. */
  propertyType: string;
  /** "", "24h", "3d", "7d", "14d", applied client-side. */
  addedToSite: string;
  includeSold: boolean;
  verifiedOnly: boolean;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  minBathrooms: string;
  maxBathrooms: string;
  /** Square feet, the API's min_area / max_area. */
  minSize: string;
  maxSize: string;
  /** Amenity keys, as listings store them: lift, parking, generator, … */
  amenities: string[];
}

export const defaultSearchFilters: SearchFilters = {
  purpose: "all",
  query: "",
  area: "",
  radius: "",
  propertyType: "all",
  addedToSite: "",
  includeSold: false,
  verifiedOnly: false,
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  maxBedrooms: "",
  minBathrooms: "",
  maxBathrooms: "",
  minSize: "",
  maxSize: "",
  amenities: [],
};

/**
 * Maps a `?type=` URL value onto the API's PropertyType enum. Older links and
 * bookmarks carry the subtype names "apartment" and "house", which the API
 * rejects as a type; they are folded into "residential" so those links still
 * open a working search instead of an error.
 */
const API_PROPERTY_TYPES = ["residential", "commercial", "land", "parking"];
const LEGACY_RESIDENTIAL_TYPES = ["apartment", "flat", "house", "villa"];

export function toPropertyTypeFilter(raw?: string): string {
  const value = raw?.toLowerCase();
  if (!value) return "all";
  if (API_PROPERTY_TYPES.includes(value)) return value;
  if (LEGACY_RESIDENTIAL_TYPES.includes(value)) return "residential";
  return "all";
}

/**
 * Reads a price the way a person writes one. Links and hand-typed values carry
 * "50 lakh", "1.5cr" and "৳25,00,000"; the dropdowns carry plain numbers.
 */
export function parsePriceToNumber(val: string): number | undefined {
  if (!val || !val.trim()) return undefined;
  const clean = val.toLowerCase().replace(/[,৳\s]/g, "");
  if (clean.endsWith("cr") || clean.endsWith("crore")) {
    const num = parseFloat(clean.replace(/cr|crore/, ""));
    return !isNaN(num) ? num * 10000000 : undefined;
  }
  if (clean.endsWith("lakh") || clean.endsWith("lac") || clean.endsWith("l")) {
    const num = parseFloat(clean.replace(/lakh|lac|l/, ""));
    return !isNaN(num) ? num * 100000 : undefined;
  }
  const parsed = parseFloat(clean);
  return !isNaN(parsed) ? parsed : undefined;
}

/** Prices become plain number strings so a dropdown can match them. */
function normalizePrice(raw?: string): string {
  const parsed = parsePriceToNumber(raw ?? "");
  return parsed === undefined ? "" : String(parsed);
}

/** A whole, positive count, or "", guards against `?bedrooms=abc`. */
function normalizeCount(raw?: string): string {
  if (!raw) return "";
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "";
}

/** expo-router hands back `string | string[] | undefined`. */
type ParamValue = string | string[] | undefined;
export type SearchParams = Record<string, ParamValue>;

function one(value: ParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export interface ParamContext {
  /** The route's own intent: /buy, /rent or /sold. */
  mode?: "buy" | "rent" | "sold";
  /** Pins the area, for the /buy/<area> and /rent/<area> landing pages. */
  fixedLocation?: string;
}

/** True when the URL asks for the filters modal to be open. */
export function isFiltersModalRequested(params: SearchParams): boolean {
  const filters = one(params.filters);
  return filters === "open" || filters === "true" || one(params.modal) === "filters";
}

export function filtersFromParams(
  params: SearchParams,
  { mode, fixedLocation }: ParamContext = {},
): SearchFilters {
  const status = one(params.status);
  const listingType = one(params.listing_type);
  const subtype = one(params.subtype);

  const purpose: SearchPurpose =
    mode === "sold" || status === "sold"
      ? "sold"
      : subtype === "short-let" || listingType === "short_let"
      ? "short-let"
      : listingType === "rent" || mode === "rent"
      ? "rent"
      : listingType === "sale" || mode === "buy"
      ? "sale"
      : "all";

  const amenities = (one(params.amenities) ?? "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  // `status=sold` already becomes the sold purpose above, so "include sold"
  // only ever comes from its own round-trip param.
  return {
    purpose,
    query: one(params.query) || one(params.search) || "",
    area: fixedLocation || one(params.location) || one(params.city) || "",
    radius: one(params.radius) || "",
    propertyType: toPropertyTypeFilter(one(params.type)),
    addedToSite: one(params.added) || "",
    includeSold: one(params.include_sold) === "true",
    verifiedOnly: one(params.is_verified) === "true",
    minPrice: normalizePrice(one(params.min_price)),
    maxPrice: normalizePrice(one(params.max_price)),
    // The hero sends `bedrooms=4` meaning "4 or more".
    minBedrooms: normalizeCount(one(params.bedrooms)),
    maxBedrooms: normalizeCount(one(params.max_bedrooms)),
    minBathrooms: normalizeCount(one(params.bathrooms)),
    maxBathrooms: normalizeCount(one(params.max_bathrooms)),
    minSize: normalizeCount(one(params.min_area)),
    maxSize: normalizeCount(one(params.max_area)),
    amenities,
  };
}

export interface ToParamsContext {
  /** On a pinned-area page the area lives in the path, never the query. */
  fixedLocation?: string;
}

/**
 * The inverse of `filtersFromParams`, so a filter change can be written to the
 * URL and read back identically. Empty values are left out rather than written
 * as blanks.
 */
export function filtersToParams(
  filters: SearchFilters,
  { fixedLocation }: ToParamsContext = {},
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.query.trim()) params.query = filters.query.trim();

  if (filters.purpose === "sold") {
    params.status = "sold";
  } else if (filters.purpose === "short-let") {
    params.subtype = "short-let";
    params.listing_type = "short_let";
  } else if (filters.purpose === "rent" || filters.purpose === "sale") {
    params.listing_type = filters.purpose;
  }

  if (!fixedLocation && filters.area.trim()) params.location = filters.area.trim();
  if (filters.propertyType && filters.propertyType !== "all") params.type = filters.propertyType;
  if (filters.radius) params.radius = filters.radius;
  if (filters.addedToSite) params.added = filters.addedToSite;
  if (filters.includeSold) params.include_sold = "true";
  if (filters.verifiedOnly) params.is_verified = "true";
  if (filters.minPrice) params.min_price = filters.minPrice;
  if (filters.maxPrice) params.max_price = filters.maxPrice;
  if (filters.minBedrooms) params.bedrooms = filters.minBedrooms;
  if (filters.maxBedrooms) params.max_bedrooms = filters.maxBedrooms;
  if (filters.minBathrooms) params.bathrooms = filters.minBathrooms;
  if (filters.maxBathrooms) params.max_bathrooms = filters.maxBathrooms;
  if (filters.minSize) params.min_area = filters.minSize;
  if (filters.maxSize) params.max_area = filters.maxSize;
  if (filters.amenities.length) params.amenities = filters.amenities.join(",");

  return params;
}

/**
 * Every query param these helpers own. `router.setParams` merges rather than
 * replaces, so clearing a filter has to write an empty value for its param,
 * otherwise the old one survives in the URL and comes straight back.
 */
export const FILTER_PARAM_KEYS = [
  "query",
  "search",
  "status",
  "listing_type",
  "subtype",
  "city",
  "location",
  "type",
  "radius",
  "added",
  "include_sold",
  "is_verified",
  "min_price",
  "max_price",
  "bedrooms",
  "max_bedrooms",
  "bathrooms",
  "max_bathrooms",
  "min_area",
  "max_area",
  "amenities",
] as const;

/**
 * `filtersToParams`, plus an empty value for each param that is in the URL now
 * and should not be after. Blanking only those keeps a shared link to the
 * tidy handful a search actually uses, rather than every param this file owns.
 */
export function filtersToParamPatch(
  filters: SearchFilters,
  { current, ...context }: ToParamsContext & { current?: SearchParams } = {},
): Record<string, string> {
  const written = filtersToParams(filters, context);
  const patch: Record<string, string> = { ...written };
  for (const key of FILTER_PARAM_KEYS) {
    if (written[key] !== undefined) continue;
    const existing = current ? one(current[key]) : undefined;
    // No `current` given: blank everything, since nothing says what is there.
    if (!current || (existing !== undefined && existing !== "")) patch[key] = "";
  }
  return patch;
}

/** Numeric value of a range end, or undefined when unset or unreadable. */
function num(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * A min above its max matches nothing, which reads as "broken" rather than
 * "empty". A hand-edited URL is the only way to get here, so the pair is
 * swapped into the search the person plainly meant.
 */
function orderedPair(minRaw: string, maxRaw: string): [number | undefined, number | undefined] {
  const min = num(minRaw);
  const max = num(maxRaw);
  if (min !== undefined && max !== undefined && min > max) return [max, min];
  return [min, max];
}

/** Filters the API cannot apply, so the fetch has to be widened for them. */
export function hasClientFilters(filters: SearchFilters): boolean {
  return (
    Boolean(filters.addedToSite) ||
    filters.amenities.length > 0 ||
    // The API takes `bedrooms`/`bathrooms` as minimums only.
    Boolean(filters.maxBathrooms) ||
    Boolean(filters.maxBedrooms)
  );
}

export function toApiFilters(filters: SearchFilters): PropertyFilters {
  const [minPrice, maxPrice] = orderedPair(filters.minPrice, filters.maxPrice);
  const [minBedrooms] = orderedPair(filters.minBedrooms, filters.maxBedrooms);
  const [minBathrooms] = orderedPair(filters.minBathrooms, filters.maxBathrooms);
  const [minSize, maxSize] = orderedPair(filters.minSize, filters.maxSize);

  const isShortLet = filters.purpose === "short-let";
  const isSold = filters.purpose === "sold";

  return {
    listing_type:
      filters.purpose === "sale"
        ? ("sale" as const)
        : isShortLet
        ? ("short_let" as const)
        : filters.purpose === "rent"
        ? ("rent" as const)
        : undefined,
    search: filters.query.trim() || undefined,
    type:
      filters.propertyType === "all" || !filters.propertyType
        ? undefined
        : (filters.propertyType.toLowerCase() as PropertyType),
    bedrooms: minBedrooms,
    bathrooms: minBathrooms,
    min_price: minPrice,
    max_price: maxPrice,
    min_area: minSize,
    max_area: maxSize,
    // The Sold section is sold-only; elsewhere "include sold" merely widens
    // an otherwise active-only list.
    status: isSold ? ("sold" as const) : filters.includeSold ? undefined : ("active" as const),
    is_verified: filters.verifiedOnly ? true : undefined,
    // A client-side pass can only narrow what it was given, so it needs a
    // wider page to work from or the first screen comes back nearly empty.
    limit: hasClientFilters(filters) ? 100 : 20,
  };
}

/** A room count a listing reports, wherever it keeps it. */
function roomCountOf(property: Property, key: "bedrooms" | "bathrooms"): number | undefined {
  const direct = property[key];
  if (typeof direct === "number") return direct;
  const fromAmenities = property.amenities?.[key];
  return typeof fromAmenities === "number" ? fromAmenities : undefined;
}

/**
 * The pass that runs after the fetch, for everything the API cannot filter.
 * Like `filterAddedSince`, a listing that cannot answer an active filter is
 * left out rather than let through.
 */
export function applyClientFilters(items: Property[], filters: SearchFilters): Property[] {
  let results = items;

  // The API ignores `status` when `listing_type` is set, so a sold query comes
  // back full of active listings. Presenting those as completed sales would be
  // a lie, so the client re-asserts the filter.
  if (filters.purpose === "sold") {
    results = results.filter((property) => property.status === "sold");
  }

  results = filterAddedSince(results, filters.addedToSite);

  if (filters.amenities.length) {
    results = results.filter((property) => {
      const amenities = property.amenities;
      if (!amenities) return false;
      return filters.amenities.every((key) => Boolean(amenities[key]));
    });
  }

  // The API's `bedrooms` / `bathrooms` are minimums, so both ceilings are ours.
  for (const key of ["bedrooms", "bathrooms"] as const) {
    const ceiling = num(key === "bedrooms" ? filters.maxBedrooms : filters.maxBathrooms);
    if (ceiling === undefined) continue;
    results = results.filter((property) => {
      const count = roomCountOf(property, key);
      return count !== undefined && count <= ceiling;
    });
  }

  return results;
}

/**
 * The one count every filter badge uses. One per active group, so ticking three
 * amenities reads as one filter, which is what it is. Purpose, query and area
 * are the search itself, not filters on it.
 */
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.minPrice || filters.maxPrice) count++;
  if (filters.minBedrooms || filters.maxBedrooms) count++;
  if (filters.minBathrooms || filters.maxBathrooms) count++;
  if (filters.minSize || filters.maxSize) count++;
  if (filters.propertyType && filters.propertyType !== "all") count++;
  if (filters.addedToSite) count++;
  if (filters.amenities.length) count++;
  if (filters.verifiedOnly) count++;
  if (filters.includeSold) count++;
  if (filters.radius) count++;
  return count;
}

/**
 * Keeps a range pair valid. Changing one end past the other clears the other
 * end rather than silently producing a search that matches nothing.
 */
export function clampRange(
  min: string,
  max: string,
  changed: "min" | "max",
): { min: string; max: string } {
  const minNum = num(min);
  const maxNum = num(max);
  if (minNum === undefined || maxNum === undefined || minNum <= maxNum) {
    return { min, max };
  }
  return changed === "min" ? { min, max: "" } : { min: "", max };
}

/**
 * Reset keeps the page's own intent: the purpose a /buy or /sold route implies,
 * and the area pinned by a /buy/<area> page. Clearing those would navigate the
 * person off the page they are on.
 */
export function resetSearchFilters(
  filters: SearchFilters,
  { fixedLocation }: ToParamsContext = {},
): SearchFilters {
  return {
    ...defaultSearchFilters,
    purpose: filters.purpose,
    area: fixedLocation || "",
  };
}
