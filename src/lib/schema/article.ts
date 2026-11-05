import type { PropertyGuide } from "@/features/news/types/news";
import { SITE_URL } from "@/lib/seo";
import { ORGANIZATION_ID } from "./brand";
import type { BreadcrumbCrumb, SchemaNode } from "./types";

export function guideUrl(slug: string): string {
  return `${SITE_URL}/guides/${encodeURIComponent(slug)}`;
}

/**
 * An in-house guide as an Article, so search and answer engines can cite it
 * with its date and publisher. Syndicated (RSS) entries are someone else's
 * article and get none. Dates are stated only when the guide has them.
 */
export function articleSchema(guide: PropertyGuide): SchemaNode {
  const url = guideUrl(guide.slug);
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: guide.title,
    description: guide.excerpt || undefined,
    image: guide.imageUrl || undefined,
    datePublished: guide.publishedAt || undefined,
    dateModified: guide.updatedAt || guide.publishedAt || undefined,
    inLanguage: "en-BD",
    articleSection: guide.category,
    keywords: guide.tags?.length ? guide.tags.join(", ") : undefined,
    // The guides credit "HomeNet Team", never a named person (see curatedGuides.ts).
    author: { "@type": "Organization", name: guide.sourceName || "HomeNet Team", url: SITE_URL },
    publisher: { "@type": "Organization", "@id": ORGANIZATION_ID },
  };
}

/** Home › Guides › the guide. */
export function guideCrumbs(guide: PropertyGuide): BreadcrumbCrumb[] {
  return [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Guides", url: `${SITE_URL}/guides` },
    { name: guide.title, url: guideUrl(guide.slug) },
  ];
}
