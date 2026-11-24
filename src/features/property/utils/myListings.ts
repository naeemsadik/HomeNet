import type { MyMessListing } from "@/features/mess/types/mess";
import { isMessSubtype } from "@/lib/listingPath";
import type { PropertyStatus } from "@/types/api";
import type { Property } from "../types/property";

/**
 * My listings shows a seller's properties and their seat listings in one list.
 *
 * The rows come from two places. GET /v1/properties/my pages through every
 * Property row the seller owns, and a seat listing is a Property row too. GET
 * /v1/mess/my adds what only a seat listing has: its seats, when it was last
 * confirmed and how many students asked for the number. With the demo backend
 * (EXPO_PUBLIC_MESS_FIXTURES) the seat listings exist only on the mess side.
 */

export type ListingFilter = "all" | "active" | "draft" | "pending" | "rejected" | "sold" | "archived";

/** The filter pills, in the order they show. */
export const LISTING_FILTERS: readonly ListingFilter[] = ["all", "active", "draft", "pending", "rejected", "sold", "archived"];

export type MyListingRow =
  /** A seat listing with its seat details; `property` is its Property row when that page has loaded. */
  | { kind: "seat"; id: string; seat: MyMessListing; property?: Property }
  /** Any other listing. `sharedLiving` marks a mess subtype whose seat details did not come back. */
  | { kind: "property"; id: string; property: Property; sharedLiving: boolean };

/**
 * One list, each listing once. Seat listings come first, in the order the mess
 * API gives them, so the ones that need confirming every two weeks sit at the
 * top and stay put while more property pages load. (Past 50 seat listings, one
 * on a seat page not loaded yet shows as a property row until that page loads.)
 */
export function mergeMyListings(properties: readonly Property[], seats: readonly MyMessListing[]): MyListingRow[] {
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const seen = new Set<string>();
  const rows: MyListingRow[] = [];
  for (const seat of seats) {
    if (seen.has(seat.id)) continue;
    seen.add(seat.id);
    rows.push({ kind: "seat", id: seat.id, seat, property: propertyById.get(seat.id) });
  }
  for (const property of properties) {
    if (seen.has(property.id)) continue;
    seen.add(property.id);
    rows.push({ kind: "property", id: property.id, property, sharedLiving: isMessSubtype(property.subtype) });
  }
  return rows;
}

export function rowStatus(row: MyListingRow): PropertyStatus {
  return row.kind === "seat" ? row.seat.status : row.property.status;
}

/** Approved and waiting for the owner to press Publish. Either source may say so. */
export function rowReadyToPublish(row: MyListingRow): boolean {
  return row.kind === "seat"
    ? Boolean(row.seat.ready_to_publish || row.property?.ready_to_publish)
    : Boolean(row.property.ready_to_publish);
}

export function isSharedLiving(row: MyListingRow): boolean {
  return row.kind === "seat" || row.sharedLiving;
}

export function matchesFilter(row: MyListingRow, filter: ListingFilter): boolean {
  return filter === "all" || rowStatus(row) === filter;
}

/** How many rows each pill would show: the same test the list uses, so a count always matches its rows. */
export function countByFilter(rows: readonly MyListingRow[]): Record<ListingFilter, number> {
  const counts = Object.fromEntries(LISTING_FILTERS.map((filter) => [filter, 0])) as Record<ListingFilter, number>;
  for (const row of rows) {
    for (const filter of LISTING_FILTERS) if (matchesFilter(row, filter)) counts[filter] += 1;
  }
  return counts;
}

/**
 * Which words a status chip uses. The review states read the same on every
 * row, so a row matches its filter pill. Otherwise a seat listing keeps the
 * shared-living wording (Live, Closed) and a property the listing status.
 */
export type StatusWording =
  | { kind: "ready" }
  | { kind: "review" }
  | { kind: "notApproved" }
  | { kind: "seat"; status: PropertyStatus }
  | { kind: "property"; status: PropertyStatus };

export function statusWording(row: MyListingRow): StatusWording {
  const status = rowStatus(row);
  if (rowReadyToPublish(row)) return { kind: "ready" };
  if (status === "pending") return { kind: "review" };
  if (status === "rejected") return { kind: "notApproved" };
  return row.kind === "seat" ? { kind: "seat", status } : { kind: "property", status };
}

/** The API archives only active or sold listings; anything else can only be deleted. */
export function canArchive(status: PropertyStatus): boolean {
  return status === "active" || status === "sold";
}
