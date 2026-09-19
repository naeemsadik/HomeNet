/**
 * Editorial content for the homepage guides section.
 *
 * Shape mirrors what a CMS or a `v1/guides` endpoint would return, so wiring the
 * real source later is an `api/newsApi.ts` change only — no UI rework.
 */
export type GuideCategory =
  | "Market"
  | "Buying"
  | "Renting"
  | "Selling"
  | "Ownership"
  | "Investment"
  | "Developments";

export interface PropertyGuide {
  id: string;
  slug: string;
  category: GuideCategory;
  title: string;
  excerpt: string;
  /** Human-readable, e.g. "6 min read". */
  readTime: string;
  /** Absolute URL. Null renders the neutral placeholder, never a stock photo. */
  imageUrl: string | null;
  /** ISO 8601. Null hides the date rather than inventing one. */
  publishedAt: string | null;
  /** In-app route or external URL. */
  href: string;
}

export interface PropertyGuideList {
  items: PropertyGuide[];
  total: number;
}
