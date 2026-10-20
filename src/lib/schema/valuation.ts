import { SITE_URL } from "@/lib/seo";
import { ORGANIZATION_ID } from "./brand";
import type { FaqEntry, SchemaNode } from "./types";

/**
 * FAQPage markup. Google only accepts it when the same questions and answers
 * are visible on the page, so pass the entries the page actually renders.
 */
export function faqPageSchema(entries: FaqEntry[], pageUrl: string): SchemaNode {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

/**
 * The valuation tool as a free web application. For the /instant-valuation
 * page once it exists; not mounted anywhere yet, since the site has no working
 * valuation (the card on /sell is a placeholder).
 */
export function valuationToolSchema(pagePath = "/instant-valuation"): SchemaNode {
  const url = `${SITE_URL}${pagePath}`;
  return {
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: "HomeNet Instant Property Valuation",
    url,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Real estate valuation",
    operatingSystem: "Web",
    inLanguage: ["en-BD", "bn-BD"],
    description:
      "Estimate the market value or monthly rent of a flat, house or plot in Bangladesh from its area, size, configuration and comparable listings on HomeNet.",
    offers: { "@type": "Offer", price: 0, priceCurrency: "BDT" },
    provider: { "@type": "Organization", "@id": ORGANIZATION_ID },
  };
}

/**
 * Questions a valuation page should answer. Facts only: no price figures,
 * since HomeNet does not yet publish a price index to back them.
 */
export const VALUATION_FAQ: FaqEntry[] = [
  {
    question: "How is a flat's value estimated in Dhaka?",
    answer:
      "By comparing it with similar listings nearby: the same area, a similar size in square feet, the same number of bedrooms, the building's age and the floor. Facing (south-facing flats ask more), a lift, a full generator backup, a piped Titas gas line and parking all move the price.",
  },
  {
    question: "How many square feet are in one katha?",
    answer:
      "One katha is 720 square feet (about 66.9 square metres). One bigha is 20 katha, or 14,400 square feet, and one decimal (shatak) is 435.6 square feet, so one katha is about 1.65 decimal.",
  },
  {
    question: "Is a land price in Dhaka quoted per katha or per square foot?",
    answer:
      "Land and plots are priced per katha. Flats and commercial floors are priced per square foot of the unit, usually including a share of common space.",
  },
  {
    question: "Is the HomeNet valuation free?",
    answer: "Yes. It needs no sign-up, and no broker is involved.",
  },
];
