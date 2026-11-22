import type { FaqEntry, SchemaNode } from "./types";

/**
 * FAQPage markup, per Google's structured-data guidance.
 *
 * Google only accepts this when the same questions and answers are visible on
 * the page, so every call site passes the entries it actually renders rather
 * than a richer list written for the crawler. A page that renders no FAQ
 * emits no node: `faqPageSchema` returns undefined so the caller can spread it
 * away, which also keeps the markup off thin or noindex pages.
 *
 * The answer is plain text. Schema.org allows limited HTML in an Answer, but
 * the page renders these strings as text, and markup that appears in only one
 * of the two places is the mismatch Google rejects.
 */
export function faqPageSchema(entries: FaqEntry[], pageUrl: string): SchemaNode | undefined {
  const asked = entries.filter((entry) => entry.question.trim() && entry.answer.trim());
  if (asked.length === 0) return undefined;

  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: asked.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
