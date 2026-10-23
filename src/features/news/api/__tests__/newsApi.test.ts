import { parseGuide } from "@/features/news/api/newsApi";

const liveGuide = {
  id: 12,
  slug: "rajuk-plan-approval",
  category: "legal",
  title: "Checking a RAJUK plan approval",
  excerpt: "What to ask for before you pay a booking deposit.",
  read_time: "4 min read",
  published_at: "2026-09-01T08:00:00.000Z",
  updated_at: "2026-09-20T08:00:00.000Z",
  source_type: "internal",
  content_markdown: "# Heading",
  author: { full_name: "HomeNet Team" },
};

describe("parseGuide", () => {
  it("maps a snake_case API guide to a PropertyGuide", () => {
    const guide = parseGuide(liveGuide);
    expect(guide).toMatchObject({
      id: "12",
      slug: "rajuk-plan-approval",
      category: "Legal",
      title: "Checking a RAJUK plan approval",
      readTime: "4 min read",
      publishedAt: "2026-09-01T08:00:00.000Z",
      updatedAt: "2026-09-20T08:00:00.000Z",
      href: "/guides/rajuk-plan-approval",
      sourceType: "internal",
      contentMarkdown: "# Heading",
      author: { name: "HomeNet Team" },
    });
  });

  it.each([
    ["null", null],
    ["a string", "guide"],
    ["a guide without a title", { ...liveGuide, title: "" }],
  ])("drops %s", (_label, raw) => {
    expect(parseGuide(raw)).toBeNull();
  });

  it("drops an unsafe source URL rather than passing it to the guide screens", () => {
    const guide = parseGuide({
      ...liveGuide,
      source_type: "rss",
      source_url: "javascript:alert(document.cookie)",
      href: "javascript:alert(1)",
    });
    expect(guide?.sourceUrl).toBeNull();
    expect(guide?.href).toBe("#");
  });

  it("keeps a safe publisher URL for syndicated news", () => {
    const guide = parseGuide({
      ...liveGuide,
      source_type: "rss",
      source_url: "https://www.tbsnews.net/economy/some-report",
    });
    expect(guide?.sourceUrl).toBe("https://www.tbsnews.net/economy/some-report");
    expect(guide?.href).toBe("https://www.tbsnews.net/economy/some-report");
  });
});
