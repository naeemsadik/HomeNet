/**
 * AI search — data contract.
 *
 * What POST /v1/properties/smart-search returns (docs/BACKEND_REQUIREMENTS.md
 * §1b; backend: modules/property/smart-searching). One call does everything:
 * the model turns the query into filters, the API runs them against verified
 * active listings, and the model writes a few "why it matches" badges per
 * listing. The app never asks the model to pick or rank listings.
 */

import type { ListingType, PropertyType } from "@/types/api";

/** Filters the model understood. null / [] means "the query didn't say". */
export interface SmartSearchFilters {
  /** A neighbourhood name; the API matches it against area names. */
  area: string | null;
  listing_type: ListingType | "short_let" | null;
  type: PropertyType | null;
  /** BDT. */
  min_price: number | null;
  max_price: number | null;
  /** Minimums. */
  bedrooms: number | null;
  bathrooms: number | null;
  /** Amenity tags such as "parking", "lift", "generator". */
  amenities: string[];
}

/** The slim card the search returns — not a full Property. */
export interface SmartSearchListing {
  id: string;
  title: string;
  type: PropertyType;
  subtype: string | null;
  listing_type: ListingType | "short_let";
  price: number;
  price_currency: string;
  area_size: number | null;
  area_unit: string | null;
  address: string | null;
  amenities: Record<string, unknown> | null;
  is_verified: boolean;
  published_at: string | null;
  area: { id: string; name: string; city: string | null };
  media: { id: string; url: string; thumbnail_url: string | null }[];
  /** Short notes on how the listing fits the query. Written by the model; empty if it failed. */
  ai_badges: string[];
}

export interface SmartSearchPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SmartSearchResult {
  query: string;
  filters: SmartSearchFilters;
  listings: SmartSearchListing[];
  pagination: SmartSearchPagination;
}
