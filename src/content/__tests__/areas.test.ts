import { areaSlug, SEO_AREAS, seoAreaBySlug, seoAreaForName } from "../areas";

describe("SEO_AREAS", () => {
  it("has unique slugs that are already in slug form", () => {
    const slugs = SEO_AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toBe(areaSlug(slug));
  });

  it("points every parent at a city-level area", () => {
    for (const area of SEO_AREAS.filter((a) => a.parent)) {
      const parent = seoAreaBySlug(area.parent);
      expect(parent).toBeDefined();
      expect(parent?.parent).toBeUndefined();
    }
  });
});

describe("seoAreaForName", () => {
  it.each([
    ["Gulshan-2", "gulshan-2"],
    ["Bashundhara R/A", "bashundhara-ra"],
    ["Cox's Bazar", "coxs-bazar"],
    ["DHANMONDI", "dhanmondi"],
  ])("finds the page for %s", (name, slug) => {
    expect(seoAreaForName(name)?.slug).toBe(slug);
  });

  it("returns nothing for an unknown area", () => {
    expect(seoAreaForName("Atlantis")).toBeUndefined();
    expect(seoAreaForName(null)).toBeUndefined();
  });
});

describe("the sitemap's view of this file", () => {
  it("finds exactly the catalog's slugs with its regex", () => {
    // scripts/generate-sitemap.mjs reads slugs this way rather than importing TS.
    const source = require("fs").readFileSync(require("path").resolve(__dirname, "../areas.ts"), "utf8");
    const found = [...new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m: RegExpMatchArray) => m[1]))];
    expect(found).toEqual(SEO_AREAS.map((a) => a.slug));
  });
});
