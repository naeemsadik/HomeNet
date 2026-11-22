import { BRAND, ORGANIZATION_ID, WEBSITE_ID } from "./brand";
import type { SchemaNode } from "./types";

/**
 * HomeNet as an organisation. RealEstateAgent is the closest schema.org type for
 * a property marketplace; the description says plainly that owners deal with
 * buyers and tenants directly.
 */
export function organizationSchema(): SchemaNode {
  return {
    "@type": ["Organization", "RealEstateAgent"],
    "@id": ORGANIZATION_ID,
    name: BRAND.name,
    alternateName: BRAND.alternateName,
    disambiguatingDescription: BRAND.disambiguatingDescription,
    url: BRAND.url,
    logo: { "@type": "ImageObject", url: BRAND.logo, width: 1024, height: 1024 },
    image: BRAND.logo,
    description: BRAND.description,
    email: BRAND.email,
    telephone: BRAND.telephone ?? undefined,
    address: BRAND.address
      ? { "@type": "PostalAddress", ...BRAND.address, addressRegion: "Dhaka", addressCountry: "BD" }
      : { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
    geo: BRAND.geo ? { "@type": "GeoCoordinates", ...BRAND.geo } : undefined,
    // Cities as cities, neighbourhoods as places inside Dhaka. Google reads
    // the containment, so "Gulshan" is understood as the Dhaka one rather
    // than any other place of that name.
    areaServed: [
      ...BRAND.areaServed.map((name) => ({ "@type": "City", name, addressCountry: "BD" })),
      ...BRAND.neighbourhoodsServed.map((name) => ({
        "@type": "Place",
        name,
        containedInPlace: { "@type": "City", name: "Dhaka", addressCountry: "BD" },
      })),
    ],
    knowsLanguage: ["en", "bn"],
    knowsAbout: [
      "Flat rent in Dhaka",
      "Apartments for sale in Bangladesh",
      "Land and plot sale",
      "Commercial space",
      "Property valuation",
      "Katha, bigha and decimal land measurement",
      "Namjari (mutation) and khatian verification",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: BRAND.email,
      telephone: BRAND.telephone ?? undefined,
      areaServed: "BD",
      availableLanguage: ["English", "Bengali"],
    },
    sameAs: BRAND.sameAs.length ? BRAND.sameAs : undefined,
    /**
     * The differentiators as plain machine-readable facts, for the answer
     * engines that read the graph rather than the prose. Each one is true of
     * the product as built — the four verification steps are the ones in
     * src/content/landingCopy.ts, and the valuation is described as what it
     * is (an estimate from comparable listings) rather than as AI, which is
     * what the listing parser and the natural-language search are.
     */
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Commission",
        value:
          "No broker and no commission. Every listing is posted by the owner or someone acting for them, and enquiries go straight to that person. Listing is free.",
      },
      {
        "@type": "PropertyValue",
        name: "Listing verification",
        value:
          "Four steps before a listing is public: owner submission with photos; an automated completeness check on price, dimensions, map coordinates and photo count; a verification review; then publication with a Verified badge. Unverified listings return 404.",
      },
      {
        "@type": "PropertyValue",
        name: "Property valuation",
        value:
          "A free instant valuation estimates a property's sale value and monthly rent from its area, size, configuration and comparable HomeNet listings. No sign-up and no broker.",
      },
      {
        "@type": "PropertyValue",
        name: "AI features",
        value:
          "Listings can be created from a plain Bangla or English description, which is parsed into structured fields, and properties can be searched in natural language.",
      },
      {
        "@type": "PropertyValue",
        name: "Coverage",
        value:
          "Bangladesh, centred on Dhaka and organised by neighbourhood, with area pages for Chattogram, Sylhet and Cox's Bazar. Prices in BDT; land in katha and bigha.",
      },
    ],
  };
}

/**
 * The site, with the search box Google (and some AI crawlers) can call
 * directly. /buy?query= is read by the browse screen.
 */
export function websiteSchema(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: BRAND.name,
    alternateName: BRAND.alternateName,
    url: BRAND.url,
    inLanguage: ["en-BD", "bn-BD"],
    publisher: { "@type": "Organization", "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BRAND.url}/buy?query={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}
