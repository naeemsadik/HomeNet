import { formatPrice } from "@/lib/format";
import type { Area } from "@/types/api";
import type { SmartSearchFilters, SmartSearchListing } from "../types/aiSearch";
import type { Property } from "../types/property";

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

// ─── Place → area (used by the guided steps) ───────────────────────────────────

/**
 * Matches a place as someone typed it to one of the API's areas.
 *
 * "Gulshan 2", "gulshan-2" and "Gulshan-2, Dhaka" all find Gulshan-2; a bare
 * sector number only matches when the parent is named too ("Uttara sector 7").
 * Returns null rather than guessing when the name is ambiguous or unknown.
 */
export function resolveArea(name: string | undefined, areas: Area[]): Area | null {
  const needle = squash(name ?? "");
  if (!needle) return null;

  const byId = new Map(areas.map((area) => [area.id, area]));
  const keysOf = (area: Area) => {
    const own = squash(area.name);
    const parent = area.parent_area_id ? byId.get(area.parent_area_id) : undefined;
    return parent ? [own, squash(parent.name) + own] : [own];
  };

  const exact = areas.filter((area) => keysOf(area).includes(needle));
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;

  // "Gulshan avenue" → the longest area name the text contains.
  const contained = areas
    .map((area) => ({ area, key: Math.max(...keysOf(area).filter((k) => needle.includes(k)).map((k) => k.length), 0) }))
    .filter(({ key }) => key >= 4);
  const longest = Math.max(0, ...contained.map(({ key }) => key));
  const best = contained.filter(({ key }) => key === longest);
  return best.length === 1 ? best[0].area : null;
}

/**
 * The area ids a place covers. The properties API's `area_id` filter matches
 * that one area only: Gulshan (the parent) returns nothing while its listings
 * sit under Gulshan-1 and Gulshan-2. So searching a parent means searching its
 * children too.
 */
export function areaIdsFor(area: Area, areas: Area[]): string[] {
  const children = areas.filter((a) => a.parent_area_id === area.id).map((a) => a.id);
  return [area.id, ...children];
}

// ─── "What we understood" chips ────────────────────────────────────────────────

export interface SearchChip {
  id: string;
  label: string;
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const price = (value: number) => formatPrice(value, "BDT");

/** "loading_dock" → "Loading dock". */
const amenityLabel = (tag: string) => capitalise(tag.replace(/_/g, " "));

/** The filters the model understood, in plain words, one chip each. */
export function describeFilters(filters: SmartSearchFilters): SearchChip[] {
  const chips: SearchChip[] = [];

  if (filters.listing_type) {
    const label = { sale: "For sale", rent: "For rent", short_let: "Short-let" }[filters.listing_type];
    chips.push({ id: "listing_type", label });
  }
  if (filters.type) chips.push({ id: "type", label: capitalise(filters.type) });
  if (filters.area) chips.push({ id: "area", label: filters.area });

  const { min_price: min, max_price: max } = filters;
  if (min !== null || max !== null) {
    const label =
      min !== null && max !== null
        ? `${price(min)} – ${price(max)}`
        : max !== null
          ? `Up to ${price(max)}`
          : `From ${price(min as number)}`;
    chips.push({ id: "price", label });
  }
  if (filters.bedrooms !== null) chips.push({ id: "bedrooms", label: `${filters.bedrooms}+ bedrooms` });
  if (filters.bathrooms !== null) chips.push({ id: "bathrooms", label: `${filters.bathrooms}+ bathrooms` });
  for (const tag of filters.amenities) chips.push({ id: `amenity:${tag}`, label: amenityLabel(tag) });

  return chips;
}

// ─── Search card → Property ────────────────────────────────────────────────────

/**
 * The search returns a slim card, not a Property. PropertyCard only reads the
 * fields the card has, so the rest are filled with neutral values rather than
 * made optional across the app. Short-lets show as rentals, as they do in Browse.
 */
export function toCardProperty(listing: SmartSearchListing): Property {
  const published = listing.published_at ?? "";
  return {
    id: listing.id,
    user_id: "",
    area_id: listing.area.id,
    title: listing.title,
    description: null,
    type: listing.type,
    subtype: listing.subtype,
    listing_type: listing.listing_type === "short_let" ? "rent" : listing.listing_type,
    price: listing.price,
    price_currency: listing.price_currency,
    area_size: listing.area_size,
    area_unit: listing.area_unit,
    location_lat: null,
    location_lng: null,
    address: listing.address,
    amenities: listing.amenities,
    status: "active",
    is_verified: listing.is_verified,
    virtual_tour_url: null,
    view_count: 0,
    published_at: listing.published_at,
    created_at: published,
    updated_at: published,
    area: { ...listing.area, parent_area_id: null },
    media: listing.media.map((item, index) => ({
      id: item.id,
      property_id: listing.id,
      media_type: "image",
      url: item.url,
      public_id: "",
      thumbnail_url: item.thumbnail_url,
      display_order: index,
    })),
  };
}
