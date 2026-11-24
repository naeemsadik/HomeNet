import { faqPageSchema, jsonLdDocument, serializeJsonLd } from "..";
import { areaFaq, AREAS_WITH_FAQ } from "@/content/areaFaq";
import { CURATED_PROPERTY_GUIDES } from "@/content/curatedGuides";
import { seoAreaBySlug } from "@/content/areas";
import type { FaqEntry } from "../types";

const PAGE = "https://www.homenetbd.com/buy/gulshan";

/** The shape faqPageSchema builds, so the assertions need no `any`. */
type FaqNode = {
  "@type": string;
  "@id": string;
  url: string;
  mainEntity: {
    "@type": string;
    name: string;
    acceptedAnswer: { "@type": string; text: string };
  }[];
};

describe("faqPageSchema", () => {
  const entries: FaqEntry[] = [
    { question: "Is it verified?", answer: "Yes. Every listing passes four checks." },
    { question: "Is there a commission?", answer: "No." },
  ];

  it("builds a FAQPage Google would accept", () => {
    const node = faqPageSchema(entries, PAGE) as unknown as FaqNode;
    expect(node["@type"]).toBe("FAQPage");
    expect(node["@id"]).toBe(`${PAGE}#faq`);
    expect(node.url).toBe(PAGE);
    expect(node.mainEntity).toHaveLength(2);
    expect(node.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "Is it verified?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Every listing passes four checks." },
    });
  });

  it("emits nothing for a page with no FAQ, so thin pages carry no markup", () => {
    expect(faqPageSchema([], PAGE)).toBeUndefined();
  });

  it("drops blank entries rather than emitting an empty Question", () => {
    const node = faqPageSchema(
      [...entries, { question: "   ", answer: "orphaned" }, { question: "No answer yet", answer: "" }],
      PAGE,
    ) as unknown as FaqNode;
    expect(node.mainEntity).toHaveLength(2);
  });

  it("serializes into a valid JSON-LD document", () => {
    const text = serializeJsonLd(jsonLdDocument(faqPageSchema(entries, PAGE)!));
    const parsed = JSON.parse(text);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@graph"][0]["@type"]).toBe("FAQPage");
    // "<" is escaped so an answer can never close the script tag early.
    expect(text).not.toContain("<");
  });
});

describe("area FAQ content", () => {
  it("covers both intents for every curated area, with 4 to 5 questions", () => {
    for (const slug of AREAS_WITH_FAQ) {
      for (const intent of ["buy", "rent"] as const) {
        const entries = areaFaq(slug, intent);
        expect(entries.length).toBeGreaterThanOrEqual(4);
        expect(entries.length).toBeLessThanOrEqual(5);
      }
    }
  });

  it("points only at areas that actually exist", () => {
    for (const slug of AREAS_WITH_FAQ) {
      expect(seoAreaBySlug(slug)).toBeDefined();
    }
  });

  it("gives an area with no curated entry nothing, so no FAQ block renders", () => {
    expect(areaFaq("kazipara", "buy")).toEqual([]);
    expect(areaFaq(undefined, "buy")).toEqual([]);
  });

  it("asks different questions for buying and renting", () => {
    for (const slug of AREAS_WITH_FAQ) {
      const buying = areaFaq(slug, "buy").map((entry) => entry.question);
      const renting = areaFaq(slug, "rent").map((entry) => entry.question);
      expect(buying).not.toEqual(renting);
    }
  });

  it("does not repeat the same question set across areas", () => {
    const fingerprints = AREAS_WITH_FAQ.map((slug) =>
      areaFaq(slug, "buy")
        .map((entry) => entry.question)
        .join("|"),
    );
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
  });

  it("quotes no taka figure, since HomeNet publishes no price index", () => {
    for (const slug of AREAS_WITH_FAQ) {
      for (const intent of ["buy", "rent"] as const) {
        for (const entry of areaFaq(slug, intent)) {
          expect(entry.answer).not.toMatch(/Tk\s?[\d,]|৳|\blakh\b|\bcrore\b/i);
        }
      }
    }
  });

  it("opens every answer with a sentence that stands on its own", () => {
    for (const slug of AREAS_WITH_FAQ) {
      for (const intent of ["buy", "rent"] as const) {
        for (const entry of areaFaq(slug, intent)) {
          // The rule is a direct answer in one or two sentences, so judge both.
          // A bare "Yes." is the most direct opener there is; what matters is
          // that the substance arrives immediately after it, not paragraphs later.
          const opener = entry.answer.split(/(?<=\.)\s/).slice(0, 2).join(" ");
          expect(opener.length).toBeGreaterThan(40);
          // A snippet-ready answer states something; it does not open by stalling.
          expect(opener).not.toMatch(/^(It depends|Well|Generally speaking|As you know)/i);
        }
      }
    }
  });
});

describe("guide FAQ content", () => {
  const withFaq = CURATED_PROPERTY_GUIDES.filter((guide) => guide.faq?.length);

  it("carries FAQ on the comparison guides", () => {
    expect(withFaq.map((guide) => guide.slug)).toEqual(
      expect.arrayContaining([
        "gulshan-vs-banani-vs-bashundhara-dhaka",
        "buying-vs-renting-apartment-dhaka",
        "direct-owner-vs-broker-bangladesh",
      ]),
    );
  });

  it("builds a valid FAQPage for each", () => {
    for (const guide of withFaq) {
      const node = faqPageSchema(guide.faq ?? [], `https://www.homenetbd.com${guide.href}`) as unknown as FaqNode;
      expect(node["@type"]).toBe("FAQPage");
      expect(node.mainEntity.length).toBeGreaterThanOrEqual(4);
      for (const question of node.mainEntity) {
        expect(question.name.trim()).not.toBe("");
        expect(question.acceptedAnswer.text.trim()).not.toBe("");
      }
    }
  });

  it("answers directly, without opening by stalling", () => {
    for (const guide of withFaq) {
      for (const entry of guide.faq ?? []) {
        const opener = entry.answer.split(/(?<=\.)\s/).slice(0, 2).join(" ");
        expect(opener.length).toBeGreaterThan(40);
        expect(opener).not.toMatch(/^(It depends|Well|Generally speaking|As you know)/i);
      }
    }
  });

  it("asks each question only once across all guides", () => {
    const questions = withFaq.flatMap((guide) => (guide.faq ?? []).map((entry) => entry.question));
    expect(new Set(questions).size).toBe(questions.length);
  });
});
