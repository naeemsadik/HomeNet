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
    // No `additionalProperty` block of product claims here. Statements like
    // "four verification steps" or "unverified listings return 404" describe
    // today's implementation, and structured data is the worst place to keep
    // something that changes: it is cached and re-read long after the product
    // moves on. Those facts live in the visible copy and in public/llms.txt,
    // where they are edited alongside the behaviour they describe.
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
