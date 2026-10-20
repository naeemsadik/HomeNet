/**
 * Schema.org JSON-LD for search engines and AI answer engines. Each generator
 * returns one node; `jsonLdDocument` bundles nodes into a single @graph and
 * <JsonLd> (src/components/JsonLd.tsx) puts it in the page head.
 */
import type { JsonLdDocument, SchemaNode, SchemaValue } from "./types";

export * from "./types";
export * from "./brand";
export * from "./organization";
export * from "./breadcrumb";
export * from "./listing";
export * from "./valuation";

/** Drops undefined values and empty objects left behind by optional fields. */
function prune(value: SchemaValue): SchemaValue {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, inner]) => [key, prune(inner)] as const)
      .filter(([, inner]) => inner !== undefined);
    // A node left with nothing but its @type says nothing.
    if (entries.length === 0 || (entries.length === 1 && entries[0][0] === "@type")) return undefined;
    return Object.fromEntries(entries) as SchemaNode;
  }
  return value;
}

export function jsonLdDocument(...nodes: SchemaNode[]): JsonLdDocument {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map((node) => prune(node)).filter((node): node is SchemaNode => node !== undefined),
  };
}

/**
 * The document as script-tag text. "<" is escaped so a listing title such as
 * "</script>" cannot end the tag early; JSON parsers read < as "<".
 */
export function serializeJsonLd(doc: JsonLdDocument): string {
  return JSON.stringify(doc).replace(/</g, "\\u003c");
}
