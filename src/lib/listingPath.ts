import { MESS_ENABLED } from "@/lib/features";

/**
 * Where a listing lives.
 *
 * A mess or seat-share listing is a Property row (PRD v1.0, section 2.1), so it
 * can turn up anywhere properties do: search results, saved listings, My
 * Properties, the admin list. Its page is /mess/:id, which shows seats, bills
 * and walking time and never prints the lister's number. The generic
 * /property/:id page shows none of that, so mess listings are sent to /mess
 * whenever the module is on.
 */
const MESS_SUBTYPES = new Set(["mess", "seat_share"]);

export function isMessSubtype(subtype: string | null | undefined): boolean {
  return !!subtype && MESS_SUBTYPES.has(subtype.trim().toLowerCase());
}

type ListingRef = { id: string; subtype?: string | null };

/** Whether the listing opens on the mess page rather than the property page. */
export const opensOnMessPage = (listing: ListingRef) => MESS_ENABLED && isMessSubtype(listing.subtype);

/** The listing's page: /mess/:id for a mess listing, /property/:id for the rest. */
export function listingPath(listing: ListingRef): string {
  const id = encodeURIComponent(listing.id);
  return opensOnMessPage(listing) ? `/mess/${id}` : `/property/${id}`;
}

/** Where the owner edits it: the mess wizard or the property form. */
export function listingEditPath(listing: ListingRef): string {
  const id = encodeURIComponent(listing.id);
  return opensOnMessPage(listing) ? `/mess/edit?id=${id}` : `/property/edit?id=${id}`;
}
