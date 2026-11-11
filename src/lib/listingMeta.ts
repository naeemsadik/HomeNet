import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { formatLocalizedPrice, isPriceOnRequest } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import { SITE_NAME } from "@/lib/seo";

/**
 * A listing page's search-result title, description and share image. English,
 * like the exported HTML: these are what Google, Bing, answer engines and
 * WhatsApp/Facebook previews read.
 */

/** What people type for each subtype ("flat", not "apartment unit"). */
const SUBTYPE_NOUN: Record<string, string> = {
  apartment: "Flat",
  flat: "Flat",
  condo: "Flat",
  "short-let": "Serviced Apartment",
  studio: "Studio Flat",
  penthouse: "Penthouse",
  house: "House",
  villa: "Villa",
  duplex: "Duplex",
  bungalow: "Bungalow",
  office: "Office Space",
  "office-floor": "Office Floor",
  shop: "Shop",
  warehouse: "Warehouse",
  building: "Commercial Building",
  "residential-plot": "Residential Plot",
  "commercial-plot": "Commercial Plot",
  plot: "Plot",
  agricultural: "Agricultural Land",
  covered: "Parking Space",
  open: "Parking Space",
  garage: "Garage",
};

const TYPE_NOUN: Record<PropertyDetail["type"], string> = {
  residential: "Property",
  commercial: "Commercial Space",
  land: "Land",
  parking: "Parking Space",
};

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

function noun(detail: PropertyDetail): string {
  return SUBTYPE_NOUN[(detail.subtype ?? "").toLowerCase()] ?? TYPE_NOUN[detail.type] ?? "Property";
}

function bedrooms(detail: PropertyDetail): number {
  const beds = Number(detail.amenities?.bedrooms ?? 0);
  return detail.type === "residential" && Number.isFinite(beds) && beds > 0 ? beds : 0;
}

/** "3 Bed Flat for Sale", "Office Space for Rent". */
function headline(detail: PropertyDetail): string {
  const beds = bedrooms(detail);
  const purpose = detail.listing_type === "sale" ? "for Sale" : detail.listing_type === "rent" ? "for Rent" : "for Short Stay";
  return `${beds ? `${beds} Bed ` : ""}${noun(detail)} ${purpose}`;
}

function place(detail: PropertyDetail): string {
  return detail.area?.name || detail.area?.city || "Bangladesh";
}

/** "৳ 85 Lac", "৳ 40,500/mo", or null when the price is on request. */
function price(detail: PropertyDetail): string | null {
  if (typeof detail.price !== "number" || isPriceOnRequest(detail.price)) return null;
  const amount = formatLocalizedPrice(detail.price, detail.price_currency || "BDT", "en");
  return detail.listing_type === "rent" ? `${amount}/mo` : amount;
}

/** Cuts at a word boundary and adds an ellipsis when the text is too long. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** "3 Bed Flat for Sale in Badda, ৳ 85 Lac | HomeNet BD", without the price if it will not fit. */
export function listingMetaTitle(detail: PropertyDetail): string {
  const base = `${headline(detail)} in ${place(detail)}`;
  const amount = price(detail);
  const withPrice = amount ? `${base}, ${amount} | ${SITE_NAME}` : null;
  if (withPrice && withPrice.length <= TITLE_MAX) return withPrice;
  return `${base} | ${SITE_NAME}`;
}

/**
 * About 150 characters: what, where, the price, the main facts, then as much of
 * the owner's own description as fits.
 */
export function listingMetaDescription(detail: PropertyDetail): string {
  const where = [detail.area?.name, detail.area?.city].filter(Boolean).join(", ") || detail.address || "Bangladesh";
  const amount = price(detail);
  const lead = `${headline(detail)} in ${where}${amount ? ` at ${amount}` : ""}.`;

  const beds = bedrooms(detail);
  const baths = Number(detail.amenities?.bathrooms ?? 0);
  const facts = [
    beds ? `${beds} ${beds === 1 ? "bed" : "beds"}` : "",
    Number.isFinite(baths) && baths > 0 ? `${baths} ${baths === 1 ? "bath" : "baths"}` : "",
    detail.area_size ? `${detail.area_size.toLocaleString("en-BD")} ${detail.area_unit || "sqft"}` : "",
  ].filter(Boolean);
  const head = facts.length ? `${lead} ${facts.join(", ")}.` : lead;

  const closing = `See photos and contact details on ${SITE_NAME}.`;
  const room = DESCRIPTION_MAX - head.length - closing.length - 2;
  const text = (detail.description ?? "").replace(/\s+/g, " ").trim();
  const snippet = text && room >= 30 ? clip(text, room) : "";
  return clip([head, snippet, closing].filter(Boolean).join(" "), DESCRIPTION_MAX);
}

/**
 * The first photo at the 1200×630 share size. JPEG rather than f_auto: link
 * preview crawlers do not all accept WebP or AVIF.
 */
export function listingShareImage(detail: PropertyDetail): string | undefined {
  const first = detail.media?.find((m) => m.media_type === "image")?.url;
  return cdnImage(first, 1200, 630)?.replace("/f_auto,", "/f_jpg,");
}
