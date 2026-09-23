import type { GuideCategory, PropertyGuide } from "../types/news";

/**
 * Editorial real-estate photography image strategy for HomeNet guides and news.
 *
 * Requirements:
 * 1. Visually relevant, high-resolution editorial real-estate photography.
 * 2. Unsplash CDN parameters aligned with project conventions (auto=format&fit=crop&w=1200&q=85).
 * 3. Strict separation of image assets from article content so the CDN/strategy can evolve independently.
 * 4. Respect publisher copyrights: syndicated RSS news deliberately uses HomeNet-owned/licensed
 *    generic category/topic photography rather than scraping external publisher images.
 * 5. Robust fallback to prevent broken or blank card visuals under any network condition.
 */

/** Universal fallback editorial real-estate photograph (contemporary residence). */
export const GUIDE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85";

/** Curated topic & category editorial photography */
export const CATEGORY_EDITORIAL_IMAGES: Record<GuideCategory, string> = {
  // Real apartment/building/city/property photography
  Market:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85",
  // Buyer perspective / apartment inspection / handover
  Buying:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
  // Modern rental apartment interior
  Renting:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85",
  // Real estate listing / agent / apartment exterior
  Selling:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85",
  // Property documents / registration desk / signing
  Legal:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
  // Land records / survey title deed verification desk
  Ownership:
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85",
  // Real property / commercial architecture / city investment
  Investment:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
  // Urban development / transit corridors / infrastructure
  Developments:
    "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=85",
};

/** Specific editorial matches for curated guides & syndicated news entries */
const SPECIFIC_GUIDE_EDITORIAL_IMAGES: Record<string, string> = {
  // Namzari / Mutation Guide -> Official land deed registration & signing desk
  "guide-namzari-mutation":
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
  "namzari-mutation-bangladesh-guide":
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",

  // Khatian Verification Guide -> Deed verification, legal archives & land records
  "guide-verify-khatian":
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85",
  "how-to-verify-khatian-cs-sa-rs-bs":
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85",

  // Dhaka Flat Registration Costs -> Financial paperwork, stamp duty & fee calculation
  "guide-flat-registration-costs":
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
  "dhaka-flat-registration-costs-breakdown":
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",

  // Katha / Bigha / Decimal Guide -> Real open land/plot parcel photography
  "guide-katha-bigha-decimal":
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
  "understanding-katha-bigha-decimal-sqft":
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",

  // Pre-Purchase Apartment Inspection Checklist -> Natural light apartment interior inspection
  "guide-apartment-inspection-checklist":
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  "dhaka-apartment-buyer-inspection-checklist":
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",

  // Direct Listing Saves Broker Commission -> Modern residential property for sale by owner
  "guide-direct-listing-saves-broker-commission":
    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=85",
  "direct-listing-saves-broker-commission-dhaka":
    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=85",

  // Syndicated: Bangladesh Bank Housing Loan Ceilings -> Residential tower & housing finance
  "news-bb-housing-loan-limit-2026":
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85",
  "bangladesh-bank-housing-finance-limit-revision":
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85",

  // Syndicated: Dhaka Metro Rail Real Estate Impact -> Modern transit & high-rise corridor
  "news-metro-rail-property-price-surge":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
  "dhaka-metro-rail-route-real-estate-impact":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
};

/**
 * Resolves an appropriate editorial real-estate photograph for any guide or news card.
 *
 * Rules:
 * 1. For syndicated RSS news: Always use a reliable licensed editorial category/topic image,
 *    never copying or scraping publisher images.
 * 2. If a specific guide slug/id has a bespoke editorial photo mapping, return it.
 * 3. For in-house guides: If an explicit valid imageUrl is already provided, preserve it.
 * 4. Match based on topic tags/title keywords (e.g. land, mutation, stamp duty, loan, inspection).
 * 5. Fallback to category photo, and finally to universal fallback.
 */
export function resolveGuideImage(guide?: Partial<PropertyGuide> | null): string {
  if (!guide) return GUIDE_FALLBACK_IMAGE;

  const isRss = guide.sourceType === "rss";

  // Check specific guide registration first
  if (guide.id && SPECIFIC_GUIDE_EDITORIAL_IMAGES[guide.id]) {
    return SPECIFIC_GUIDE_EDITORIAL_IMAGES[guide.id];
  }
  if (guide.slug && SPECIFIC_GUIDE_EDITORIAL_IMAGES[guide.slug]) {
    return SPECIFIC_GUIDE_EDITORIAL_IMAGES[guide.slug];
  }

  // For in-house guides with explicit imageUrl already set (e.g. from backend CMS)
  if (!isRss && guide.imageUrl && typeof guide.imageUrl === "string" && guide.imageUrl.trim() !== "") {
    return guide.imageUrl;
  }

  // Topic detection via tags & title keywords
  const titleLower = (guide.title || "").toLowerCase();
  const tagsLower = Array.isArray(guide.tags) ? guide.tags.map((t) => t.toLowerCase()) : [];
  const textCorpus = `${titleLower} ${tagsLower.join(" ")}`;

  // Land & plot photography
  if (
    textCorpus.includes("land") ||
    textCorpus.includes("plot") ||
    textCorpus.includes("katha") ||
    textCorpus.includes("bigha") ||
    textCorpus.includes("decimal") ||
    textCorpus.includes("boundary")
  ) {
    return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85";
  }

  // Legal & documentation desk
  if (
    textCorpus.includes("namzari") ||
    textCorpus.includes("mutation") ||
    textCorpus.includes("khatian") ||
    textCorpus.includes("porcha") ||
    textCorpus.includes("deed") ||
    textCorpus.includes("dolil") ||
    textCorpus.includes("registration")
  ) {
    return "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85";
  }

  // Financial / costs / tax paperwork
  if (
    textCorpus.includes("cost") ||
    textCorpus.includes("tax") ||
    textCorpus.includes("stamp") ||
    textCorpus.includes("duty") ||
    textCorpus.includes("ait") ||
    textCorpus.includes("fee")
  ) {
    return "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85";
  }

  // Apartment inspection / viewing
  if (
    textCorpus.includes("inspection") ||
    textCorpus.includes("checklist") ||
    textCorpus.includes("flat") ||
    textCorpus.includes("apartment") ||
    textCorpus.includes("rajuk")
  ) {
    return "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85";
  }

  // Transit / infrastructure / metro rail
  if (
    textCorpus.includes("metro") ||
    textCorpus.includes("transit") ||
    textCorpus.includes("rail") ||
    textCorpus.includes("corridor")
  ) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85";
  }

  // Banking / housing finance loan
  if (
    textCorpus.includes("loan") ||
    textCorpus.includes("bank") ||
    textCorpus.includes("finance") ||
    textCorpus.includes("interest")
  ) {
    return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85";
  }

  // Category fallback
  if (guide.category && CATEGORY_EDITORIAL_IMAGES[guide.category]) {
    return CATEGORY_EDITORIAL_IMAGES[guide.category];
  }

  return GUIDE_FALLBACK_IMAGE;
}
