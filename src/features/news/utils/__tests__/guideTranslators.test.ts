import {
  formatGuideDate,
  formatReadTime,
  getGuideCategoryLabel,
  getLocalizedGuideContent,
  getLocalizedGuideExcerpt,
  getLocalizedGuideTags,
  getLocalizedGuideTitle,
} from "../guideTranslators";
import type { PropertyGuide } from "../../types/news";

const mockGuide: PropertyGuide = {
  id: "test-guide-1",
  slug: "test-guide-slug",
  category: "Legal",
  title: "English Legal Guide Title",
  titleBn: "বাংলা আইনি গাইড শিরোনাম",
  excerpt: "English excerpt explaining property deed rules.",
  excerptBn: "দলিলের নিয়ম ব্যাখ্যা করে বাংলা সারসংক্ষেপ।",
  readTime: "5 min read",
  imageUrl: null,
  publishedAt: "2026-08-15T09:00:00.000Z",
  updatedAt: "2026-09-27T00:00:00.000Z",
  href: "/guides/test-guide-slug",
  sourceType: "internal",
  tags: ["Namzari", "Khatian"],
  tagsBn: ["নামজারি", "খতিয়ান"],
  contentMarkdown: "# English Heading\nEnglish body text.",
  contentMarkdownBn: "# বাংলা শিরোনাম\nবাংলা বিবরণ।",
};

const mockFallbackGuide: PropertyGuide = {
  id: "test-guide-2",
  slug: "test-fallback-slug",
  category: "Market",
  title: "English Only Market Report",
  excerpt: "English only excerpt.",
  readTime: "3 min read",
  imageUrl: null,
  publishedAt: null,
  href: "/guides/test-fallback-slug",
  sourceType: "rss",
};

describe("guideTranslators", () => {
  describe("getLocalizedGuideTitle", () => {
    it("returns English title when language is en", () => {
      expect(getLocalizedGuideTitle(mockGuide, "en")).toBe("English Legal Guide Title");
    });

    it("returns Bengali title when language is bn and titleBn is present", () => {
      expect(getLocalizedGuideTitle(mockGuide, "bn")).toBe("বাংলা আইনি গাইড শিরোনাম");
    });

    it("falls back to English title when titleBn is not present", () => {
      expect(getLocalizedGuideTitle(mockFallbackGuide, "bn")).toBe("English Only Market Report");
    });

    it("handles null or undefined guide safely", () => {
      expect(getLocalizedGuideTitle(null, "bn")).toBe("");
      expect(getLocalizedGuideTitle(undefined, "en")).toBe("");
    });
  });

  describe("getLocalizedGuideExcerpt", () => {
    it("returns English excerpt when language is en", () => {
      expect(getLocalizedGuideExcerpt(mockGuide, "en")).toBe(
        "English excerpt explaining property deed rules.",
      );
    });

    it("returns Bengali excerpt when language is bn and excerptBn is present", () => {
      expect(getLocalizedGuideExcerpt(mockGuide, "bn")).toBe(
        "দলিলের নিয়ম ব্যাখ্যা করে বাংলা সারসংক্ষেপ।",
      );
    });

    it("falls back to English excerpt when excerptBn is not present", () => {
      expect(getLocalizedGuideExcerpt(mockFallbackGuide, "bn")).toBe("English only excerpt.");
    });
  });

  describe("getLocalizedGuideContent", () => {
    it("returns English markdown when language is en", () => {
      expect(getLocalizedGuideContent(mockGuide, "en")).toBe(
        "# English Heading\nEnglish body text.",
      );
    });

    it("returns Bengali markdown when language is bn and contentMarkdownBn is present", () => {
      expect(getLocalizedGuideContent(mockGuide, "bn")).toBe(
        "# বাংলা শিরোনাম\nবাংলা বিবরণ।",
      );
    });

    it("falls back to contentMarkdown or excerpt when contentMarkdownBn is absent", () => {
      expect(getLocalizedGuideContent(mockFallbackGuide, "bn")).toBe("English only excerpt.");
    });
  });

  describe("getLocalizedGuideTags", () => {
    it("returns English tags for en", () => {
      expect(getLocalizedGuideTags(mockGuide, "en")).toEqual(["Namzari", "Khatian"]);
    });

    it("returns Bengali tags for bn when tagsBn is present", () => {
      expect(getLocalizedGuideTags(mockGuide, "bn")).toEqual(["নামজারি", "খতিয়ান"]);
    });

    it("falls back to English tags when tagsBn is not defined", () => {
      expect(getLocalizedGuideTags(mockFallbackGuide, "bn")).toEqual([]);
    });
  });

  describe("getGuideCategoryLabel", () => {
    const mockT = (key: string) => {
      const dict: Record<string, string> = {
        "guides.categories.legal": "দলিল, নামজারি ও আইনি যাচাই",
        "guides.categories.market": "রিয়েল এস্টেট মার্কেট আপডেট",
        "guides.categories.buying": "ফ্ল্যাট/জমি ক্রয়ের পরামর্শ",
        "guides.categories.selling": "বিক্রয়ের নিয়মাবলী",
        "guides.categories.renting": "ভাড়া নির্দেশিকা",
        "guides.categories.ownership": "প্রপার্টির মালিকানা",
        "guides.categories.investment": "বিনিয়োগ পরামর্শ",
        "guides.categories.developments": "নতুন প্রজেক্ট ও উন্নয়ন",
        "guides.categories.all": "সকল নির্দেশিকা",
      };
      return dict[key] || key;
    };

    it("translates categories using translation keys", () => {
      expect(getGuideCategoryLabel("Legal", mockT)).toBe("দলিল, নামজারি ও আইনি যাচাই");
      expect(getGuideCategoryLabel("Market", mockT)).toBe("রিয়েল এস্টেট মার্কেট আপডেট");
      expect(getGuideCategoryLabel("Buying", mockT)).toBe("ফ্ল্যাট/জমি ক্রয়ের পরামর্শ");
      expect(getGuideCategoryLabel("Selling", mockT)).toBe("বিক্রয়ের নিয়মাবলী");
      expect(getGuideCategoryLabel("Renting", mockT)).toBe("ভাড়া নির্দেশিকা");
      expect(getGuideCategoryLabel("Ownership", mockT)).toBe("প্রপার্টির মালিকানা");
      expect(getGuideCategoryLabel("Investment", mockT)).toBe("বিনিয়োগ পরামর্শ");
      expect(getGuideCategoryLabel("Developments", mockT)).toBe("নতুন প্রজেক্ট ও উন্নয়ন");
    });

    it("returns raw category if unknown", () => {
      expect(getGuideCategoryLabel("Architecture", mockT)).toBe("Architecture");
    });

    it("handles null or undefined safely", () => {
      expect(getGuideCategoryLabel(null, mockT)).toBe("");
    });
  });

  describe("formatReadTime", () => {
    const mockT = (_key: string, vars?: { time: string }) => {
      return `${vars?.time} মিনিট পড়ার সময়`;
    };

    it("formats minutes with localized numerals", () => {
      expect(formatReadTime("5 min read", mockT, "bn")).toBe("৫ মিনিট পড়ার সময়");
      expect(formatReadTime("10 min read", mockT, "bn")).toBe("১০ মিনিট পড়ার সময়");
    });

    it("returns raw string if no digits match", () => {
      expect(formatReadTime("Quick read", mockT, "bn")).toBe("Quick read");
    });

    it("handles empty or null safely", () => {
      expect(formatReadTime(null, mockT, "bn")).toBe("");
    });
  });

  describe("formatGuideDate", () => {
    it("formats valid ISO date strings for en", () => {
      const formatted = formatGuideDate("2026-08-15T09:00:00.000Z", "en");
      expect(formatted).toContain("2026");
      expect(formatted).toMatch(/Aug|15/);
    });

    it("formats valid ISO date strings for bn", () => {
      const formatted = formatGuideDate("2026-08-15T09:00:00.000Z", "bn");
      expect(formatted).toContain("২০২৬");
    });

    it("handles null or invalid date strings safely", () => {
      expect(formatGuideDate(null, "en")).toBe("");
      expect(formatGuideDate("not-a-date", "en")).toBe("");
    });
  });
});
