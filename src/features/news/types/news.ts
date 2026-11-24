import type { FaqEntry } from "@/lib/schema";
/**
 * Editorial and market content for HomeNet guides & news.
 *
 * Supports both:
 * - Tier 1: In-house curated property & legal guides (`sourceType: "internal"`)
 * - Tier 2: Syndicated market news from Bangladesh publishers (`sourceType: "rss"`)
 */
export type GuideCategory =
  | "Market"
  | "Buying"
  | "Renting"
  | "Selling"
  | "Legal"
  | "Ownership"
  | "Investment"
  | "Developments";

export type GuideSourceType = "internal" | "rss";

export interface GuideAuthor {
  name: string;
  role?: string;
  avatarUrl?: string | null;
}

export interface PropertyGuide {
  id: string;
  slug: string;
  category: GuideCategory;
  title: string;
  /** Optional Bengali title for native reader localization. */
  titleBn?: string;
  /**
   * A shorter title for the <title> tag, when the editorial headline is too
   * long for a search result. Google truncates around 60 characters, and
   * " | HomeNet BD" costs 13 of them. The on-page heading still uses `title`.
   */
  seoTitle?: string;
  excerpt: string;
  /** Optional Bengali excerpt. */
  excerptBn?: string;
  /** Human-readable, e.g. "5 min read". */
  readTime: string;
  /** Absolute URL. Null renders the neutral placeholder, never a stock photo. */
  imageUrl: string | null;
  /** ISO 8601. Null hides the date rather than inventing one. */
  publishedAt: string | null;
  /** ISO 8601. When the content (and any figures in it) was last checked. */
  updatedAt?: string | null;
  /** In-app route or external URL. */
  href: string;
  /** Whether the guide is an in-house HomeNet guide or syndicated via external RSS. */
  sourceType: GuideSourceType;
  /** Name of the publisher or author (e.g. "HomeNet Editorial", "The Business Standard"). */
  sourceName?: string | null;
  /** Original canonical external URL for syndicated RSS entries. */
  sourceUrl?: string | null;
  /** Optional topic tags for search and categorization. */
  tags?: string[];
  /** Optional localized Bengali topic tags. */
  tagsBn?: string[];
  /** Full markdown content for in-house guides. */
  contentMarkdown?: string | null;
  /** Optional localized Bengali markdown content. */
  contentMarkdownBn?: string | null;
  /** Author information. */
  author?: GuideAuthor | null;
  /**
   * Direct-answer questions rendered at the end of the guide and emitted as
   * FAQPage markup. Google accepts that markup only while the questions are
   * visible, so these two always come from this one list.
   */
  faq?: FaqEntry[];
}

export interface PropertyGuideList {
  items: PropertyGuide[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface FetchPropertyGuidesParams {
  category?: GuideCategory | "All";
  sourceType?: GuideSourceType;
  search?: string;
  limit?: number;
  page?: number;
}

