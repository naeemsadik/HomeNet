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

type ListingRef = { id: string; subtype?: string | null; title?: string | null; slug?: string | null };

/** Whether the listing opens on the mess page rather than the property page. */
export const opensOnMessPage = (listing: ListingRef) => MESS_ENABLED && isMessSubtype(listing.subtype);

const UUID_AT_END = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const SLUG_MAX = 60;

/**
 * The title as URL words: "3 Bed Flat, Gulshan-1!" is "3-bed-flat-gulshan-1".
 * Latin letters and digits only; a title with none of them (a Bangla title)
 * gives "", and the URL is then the id alone.
 */
export function titleSlug(title: string | null | undefined): string {
  if (!title) return "";
  const words = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (words.length <= SLUG_MAX) return words;
  const cut = words.slice(0, SLUG_MAX + 1);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut.slice(0, SLUG_MAX)).replace(/-+$/, "");
}

/**
 * The listing's URL segment.
 *
 * - The API's own `slug`, when it sends one (backend slug support is tracked
 *   separately); the page passes it to the API as is.
 * - Else the title words followed by the id: /property/3-bed-flat-gulshan-1-<uuid>.
 *   The id is read back from the end, so a later title change does not break
 *   old links; the page swaps in the current URL.
 * - Else the id alone. Ids that are not UUIDs (the mess fixtures) always use
 *   this, since only a UUID can be found again at the end of the segment.
 */
export function listingSegment(listing: ListingRef): string {
  const slug = listing.slug?.trim();
  if (slug) return slug;
  const words = titleSlug(listing.title);
  return words && UUID_AT_END.test(listing.id) && !UUID_AT_END.test(words) ? `${words}-${listing.id}` : listing.id;
}

/**
 * What to ask the API for, from a URL segment: the UUID at its end when it has
 * one (title-and-id URLs, and old /property/<uuid> links), else the whole
 * segment (a non-UUID id, or an API slug).
 */
export function listingKeyFromSegment(segment: string | null | undefined): string {
  let raw = (segment ?? "").trim();
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // A malformed escape: keep it as typed, and let the API answer 404.
  }
  return raw.match(UUID_AT_END)?.[1]?.toLowerCase() ?? raw;
}

function safeDecode(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

/** Whether two paths are the same page, whichever of them is percent-encoded. */
export const samePath = (a: string, b: string) => a === b || safeDecode(a) === safeDecode(b);

/**
 * The only places that spell out a listing URL. Every link, share, canonical
 * and structured-data URL goes through these, so the URL shape is changed here
 * and nowhere else.
 */
export const propertyPath = (listing: ListingRef) => `/property/${encodeURIComponent(listingSegment(listing))}`;
export const messPath = (listing: ListingRef) => `/mess/${encodeURIComponent(listingSegment(listing))}`;

/** The listing's page: /mess/:segment for a mess listing, /property/:segment for the rest. */
export function listingPath(listing: ListingRef): string {
  return opensOnMessPage(listing) ? messPath(listing) : propertyPath(listing);
}

/** Where the owner edits it: the mess wizard or the property form. Edit pages are private, so they keep the bare id. */
export function listingEditPath(listing: ListingRef): string {
  const id = encodeURIComponent(listing.id);
  return opensOnMessPage(listing) ? `/mess/edit?id=${id}` : `/property/edit?id=${id}`;
}
