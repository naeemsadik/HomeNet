import Head from "expo-router/head";

import { jsonLdDocument, serializeJsonLd, type SchemaNode } from "@/lib/schema";

/**
 * Structured data in the page head. A JSON-LD block is data, not script: the
 * browser never runs it, so the Content-Security-Policy does not apply (and
 * scripts/check-csp.mjs skips it).
 */
export function JsonLd({ nodes }: { nodes: SchemaNode[] }) {
  if (nodes.length === 0) return null;
  return (
    <Head>
      <script type="application/ld+json">{serializeJsonLd(jsonLdDocument(...nodes))}</script>
    </Head>
  );
}
