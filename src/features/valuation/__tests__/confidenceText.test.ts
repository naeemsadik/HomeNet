import { translate } from "@/i18n";
import { confidenceReasonText, formatCollected } from "../utils/confidenceText";
import type { ConfidenceBasis } from "../types/valuationTypes";

const render = (basis: ConfidenceBasis, language: "en" | "bn" = "en", purpose: "sale" | "rent" = "sale") =>
  confidenceReasonText(basis, { areaName: "Gulshan", purpose, language }, (key, params) =>
    translate(language, key, params),
  );

describe("formatCollected", () => {
  it("names the month in the right language", () => {
    expect(formatCollected("2026-10-30", "en")).toBe("October 2026");
    expect(formatCollected("2026-10-30", "bn")).toMatch(/২০২৬/);
  });

  it("reads the date in UTC, so the first of a month stays in its month", () => {
    const previous = process.env.TZ;
    process.env.TZ = "America/New_York";
    try {
      expect(formatCollected("2026-11-01", "en")).toBe("November 2026");
    } finally {
      process.env.TZ = previous;
    }
  });

  it("gives back text that is not a date instead of 'Invalid Date'", () => {
    expect(formatCollected("soon", "en")).toBe("soon");
  });
});

describe("confidenceReasonText", () => {
  it("says what the listing figure rests on, in English and in Bangla", () => {
    const basis: ConfidenceBasis = { kind: "listings", listings: 37, asOf: "2026-10-30" };
    expect(render(basis)).toBe(
      "Based on 37 asking prices for Gulshan flats on listing sites (October 2026), adjusted for your property's details.",
    );
    const bangla = render(basis, "bn");
    expect(bangla).toContain("37");
    expect(bangla).toContain("Gulshan");
    expect(bangla).not.toMatch(/asking prices/);
  });

  it("talks about rents for a rent", () => {
    expect(render({ kind: "listings", listings: 20, asOf: "2026-10-30" }, "en", "rent")).toMatch(/20 asking rents/);
  });

  it("adds each caveat that applies, in order", () => {
    const text = render({
      kind: "listings",
      listings: 12,
      asOf: "2026-10-30",
      mostlyOneSite: true,
      estimatedYieldInput: "rent",
    });
    expect(text.indexOf("Most of them come from one site")).toBeGreaterThan(text.indexOf("Based on 12"));
    expect(text.indexOf("The rent shown for the yield")).toBeGreaterThan(text.indexOf("one site"));
    expect(text).toMatch(/The rent shown for the yield is an estimate\.$/);
  });

  it.each(["apartmentsOnly", "builtInRate", "noData"] as const)("has a sentence for %s in both languages", (kind) => {
    for (const language of ["en", "bn"] as const) {
      const text = render({ kind }, language);
      expect(text).toContain("Gulshan");
      expect(text).not.toMatch(/valuation\.reason/);
    }
  });
});
