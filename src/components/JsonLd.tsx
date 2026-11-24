import Head from "expo-router/head";

import { jsonLdDocument, serializeJsonLd, type SchemaNode } from "@/lib/schema";

/**
 * Structured data in the page head. A JSON-LD block is data, not script: the
 * browser never runs it, so the Content-Security-Policy does not apply (and
 * scripts/check-csp.mjs skips it).
 */
export function JsonLd({ nodes }: { nodes: (SchemaNode | undefined)[] }) {
  // A generator returns undefined when the page has nothing to describe — an
  // FAQ block that is not rendered, for instance. Dropping those here lets a
  // call site list every node it might emit without a conditional spread.
  const present = nodes.filter((node): node is SchemaNode => node !== undefined);
  if (present.length === 0) return null;
  return (
    <Head>
      <script type="application/ld+json">{serializeJsonLd(jsonLdDocument(...present))}</script>
    </Head>
  );
}
