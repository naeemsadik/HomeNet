import { SEO_AREAS, seoAreaBySlug } from "@/content/areas";
import { areaPageMeta } from "@/lib/areaPageMeta";

describe("areaPageMeta", () => {
  it.each(SEO_AREAS.flatMap((area) => (["buy", "rent"] as const).map((intent) => [area.slug, intent] as const)))(
    "%s (%s) fits what a search result shows",
    (slug, intent) => {
      const meta = areaPageMeta(seoAreaBySlug(slug)!, intent);
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeLessThanOrEqual(160);
    },
  );

  it("names the area in the title and keeps its Bangla search term in the description", () => {
    const meta = areaPageMeta(seoAreaBySlug("gulshan")!, "rent");
    expect(meta.title).toBe("Flats & Houses for Rent in Gulshan | HomeNet BD");
    expect(meta.description).toContain("Gulshan, Dhaka");
    expect(meta.description).toContain("গুলশান বাসা ভাড়া");
  });
});
