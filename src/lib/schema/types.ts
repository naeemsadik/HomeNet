/**
 * Just enough typing to keep the generators honest. schema.org is open-ended,
 * so a node is any object with a @type; the helpers below are what the
 * generators actually build.
 */
export type SchemaValue = string | number | boolean | SchemaNode | SchemaValue[] | undefined;

export interface SchemaNode {
  "@type": string | string[];
  "@id"?: string;
  [property: string]: SchemaValue;
}

export interface JsonLdDocument {
  "@context": "https://schema.org";
  "@graph": SchemaNode[];
}

export interface BreadcrumbCrumb {
  name: string;
  /** Absolute URL. The last crumb (the page itself) may leave it out. */
  url?: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}
