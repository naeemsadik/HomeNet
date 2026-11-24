import { WEBSITE_ID } from "./brand";
import type { SchemaNode } from "./types";

export interface WebPageSchemaOptions {
  url: string;
  name: string;
  description?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  inLanguage?: string;
}

/**
 * A WebPage / CollectionPage structured data node for category/area landing pages.
 * Tells search engines and AI answer engines when the page was updated and what it contains.
 */
export function webPageSchema(options: WebPageSchemaOptions): SchemaNode {
  return {
    "@type": ["WebPage", "CollectionPage"],
    "@id": `${options.url}#webpage`,
    url: options.url,
    name: options.name,
    description: options.description || undefined,
    datePublished: options.datePublished || undefined,
    dateModified: options.dateModified || undefined,
    isPartOf: {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
    },
    inLanguage: options.inLanguage ?? "en-BD",
  };
}
