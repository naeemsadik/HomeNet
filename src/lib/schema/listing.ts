import { seoAreaBySlug, seoAreaForName } from "@/content/areas";
import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { SITE_URL } from "@/lib/seo";
import { INTENT_LABEL, type ListingIntent } from "./breadcrumb";
import { ORGANIZATION_ID } from "./brand";
import type { BreadcrumbCrumb, SchemaNode } from "./types";

const APARTMENT_SUBTYPES = new Set(["apartment", "flat", "condo", "short-let", "studio", "penthouse"]);
const HOUSE_SUBTYPES = new Set(["house", "villa", "duplex", "bungalow"]);

/** Unit codes are UN/CEFACT: FTK square foot, MTK square metre. */
const UNIT_CODES: Record<string, string> = { sqft: "FTK", sqm: "MTK" };

/** Amenity keys that are specs, not features, and are stated elsewhere. */
const SPEC_KEYS = new Set(["bedrooms", "bathrooms", "floor", "facing"]);

/** What is being listed, as a schema.org type. */
export function listingSubjectType(type: PropertyDetail["type"], subtype: string | null): string {
  const sub = (subtype ?? "").toLowerCase();
  if (type === "residential") {
    if (HOUSE_SUBTYPES.has(sub)) return "SingleFamilyResidence";
    if (APARTMENT_SUBTYPES.has(sub) || !sub) return "Apartment";
    return "Accommodation";
  }
  if (type === "parking") return "ParkingFacility";
  // schema.org has no type for a land plot or an office floor; Place is the
  // honest fallback, with additionalType naming what it is.
  return "Place";
}

const asNumber = (value: unknown): number | undefined => {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function floorSize(detail: PropertyDetail): SchemaNode | undefined {
  if (!detail.area_size) return undefined;
  const unit = (detail.area_unit || "sqft").toLowerCase();
  return {
    "@type": "QuantitativeValue",
    value: detail.area_size,
    unitCode: UNIT_CODES[unit],
    unitText: unit,
  };
}

function amenityFeatures(detail: PropertyDetail): SchemaNode[] | undefined {
  const raw = detail.amenities ?? {};
  const features: SchemaNode[] = Object.entries(raw)
    .filter(([key, value]) => !SPEC_KEYS.has(key) && value)
    .map(([key]) => ({
      "@type": "LocationFeatureSpecification",
      name: key.replace(/[_-]+/g, " "),
      value: true,
    }));
  if (typeof raw.facing === "string" && raw.facing.trim()) {
    features.push({ "@type": "LocationFeatureSpecification", name: "Facing", value: raw.facing.trim() });
  }
  if (raw.floor !== undefined && raw.floor !== null && raw.floor !== "") {
    features.push({ "@type": "LocationFeatureSpecification", name: "Floor", value: String(raw.floor) });
  }
  return features.length ? features : undefined;
}

export function listingUrl(id: string): string {
  return `${SITE_URL}/property/${encodeURIComponent(id)}`;
}

/**
 * A listing page's structured data: the listing, the home or plot it offers,
 * and the price. Contact details are left out on purpose: owners' phone
 * numbers are shown to visitors, not handed to scrapers.
 */
export function listingSchema(detail: PropertyDetail): SchemaNode {
  const url = listingUrl(detail.id);
  const amenities = detail.amenities ?? {};
  const subjectType = listingSubjectType(detail.type, detail.subtype);
  const isRent = detail.listing_type === "rent";
  const images = (detail.media ?? []).filter((m) => m.media_type === "image").map((m) => m.url);
  const city = detail.area?.city || "Dhaka";

  const subject: SchemaNode = {
    "@type": subjectType,
    name: detail.title,
    additionalType: subjectType === "Place" ? (detail.subtype || detail.type) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: detail.address || undefined,
      addressLocality: detail.area?.name || undefined,
      addressRegion: city,
      addressCountry: "BD",
    },
    geo:
      detail.location_lat != null && detail.location_lng != null
        ? { "@type": "GeoCoordinates", latitude: detail.location_lat, longitude: detail.location_lng }
        : undefined,
    floorSize: subjectType === "Place" || subjectType === "ParkingFacility" ? undefined : floorSize(detail),
    numberOfBedrooms: asNumber(amenities.bedrooms),
    numberOfBathroomsTotal: asNumber(amenities.bathrooms),
    amenityFeature: amenityFeatures(detail),
  };
  // Place has no floorSize; a plot's size still matters, so say it as a property.
  if (subjectType === "Place" && detail.area_size) {
    subject.additionalProperty = {
      "@type": "PropertyValue",
      name: "Size",
      value: detail.area_size,
      unitText: detail.area_unit || "sqft",
    };
  }

  return {
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: detail.title,
    description: detail.description || undefined,
    image: images.length ? images : undefined,
    datePosted: detail.published_at || detail.created_at,
    dateModified: detail.updated_at,
    inLanguage: "en-BD",
    about: subject,
    provider: { "@type": "Organization", "@id": ORGANIZATION_ID },
    offers: {
      "@type": "Offer",
      url,
      price: detail.price,
      priceCurrency: detail.price_currency || "BDT",
      businessFunction: isRent ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
      availability: detail.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      priceSpecification: isRent
        ? {
            "@type": "UnitPriceSpecification",
            price: detail.price,
            priceCurrency: detail.price_currency || "BDT",
            unitCode: "MON",
            unitText: "month",
          }
        : undefined,
    },
  };
}

/** Home › Property to Rent › Dhaka › Gulshan › the listing. */
export function listingCrumbs(detail: PropertyDetail): BreadcrumbCrumb[] {
  const intent: ListingIntent = detail.listing_type === "rent" ? "rent" : "buy";
  const crumbs: BreadcrumbCrumb[] = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: INTENT_LABEL[intent], url: `${SITE_URL}/${intent}` },
  ];
  const area = seoAreaForName(detail.area?.name) ?? seoAreaForName(detail.area?.parent?.name);
  const city = seoAreaBySlug(area?.parent) ?? (area?.parent ? undefined : area) ?? seoAreaForName(detail.area?.city);
  if (city) crumbs.push({ name: city.name, url: `${SITE_URL}/${intent}/${city.slug}` });
  if (area && area !== city) crumbs.push({ name: area.name, url: `${SITE_URL}/${intent}/${area.slug}` });
  crumbs.push({ name: detail.title, url: listingUrl(detail.id) });
  return crumbs;
}
