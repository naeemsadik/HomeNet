import type { SupportedLanguage } from "@/i18n";
import { formatLocalizedNumber } from "@/i18n/dataTranslators";
import type { PropertyGuide } from "../types/news";

/**
 * Resolves the localized guide title based on the active language.
 */
export function getLocalizedGuideTitle(
  guide: PropertyGuide | null | undefined,
  lang: SupportedLanguage,
): string {
  if (!guide) return "";
  if (lang === "bn" && guide.titleBn) {
    return guide.titleBn;
  }
  return guide.title;
}

/**
 * Resolves the localized guide excerpt based on the active language.
 */
export function getLocalizedGuideExcerpt(
  guide: PropertyGuide | null | undefined,
  lang: SupportedLanguage,
): string {
  if (!guide) return "";
  if (lang === "bn" && guide.excerptBn) {
    return guide.excerptBn;
  }
  return guide.excerpt;
}

/**
 * Resolves the localized guide markdown body content based on the active language.
 */
export function getLocalizedGuideContent(
  guide: PropertyGuide | null | undefined,
  lang: SupportedLanguage,
): string {
  if (!guide) return "";
  if (lang === "bn" && guide.contentMarkdownBn) {
    return guide.contentMarkdownBn;
  }
  return guide.contentMarkdown || guide.excerpt;
}

/**
 * Resolves the localized guide tags based on the active language.
 */
export function getLocalizedGuideTags(
  guide: PropertyGuide | null | undefined,
  lang: SupportedLanguage,
): string[] {
  if (!guide) return [];
  if (lang === "bn" && guide.tagsBn && guide.tagsBn.length > 0) {
    return guide.tagsBn;
  }
  return guide.tags || [];
}

/**
 * Maps raw backend GuideCategory string to localized label key via `t(...)`.
 */
export function getGuideCategoryLabel(
  category: string | null | undefined,
  t: (key: any) => string,
): string {
  if (!category) return "";
  const norm = category.toLowerCase().trim();
  switch (norm) {
    case "market":
      return t("guides.categories.market");
    case "buying":
      return t("guides.categories.buying");
    case "renting":
      return t("guides.categories.renting");
    case "selling":
      return t("guides.categories.selling");
    case "legal":
      return t("guides.categories.legal");
    case "ownership":
      return t("guides.categories.ownership");
    case "investment":
      return t("guides.categories.investment");
    case "developments":
      return t("guides.categories.developments");
    case "all":
      return t("guides.categories.all");
    default:
      return category;
  }
}

/**
 * Formats reading time with localized numerals and label.
 * e.g., "5 min read" -> "৫ মিনিট পড়ার সময়" (bn) / "5 min read" (en)
 */
export function formatReadTime(
  readTime: string | null | undefined,
  t: (key: any, vars?: any) => string,
  lang: SupportedLanguage,
): string {
  if (!readTime) return "";
  const match = readTime.match(/(\d+)/);
  if (match) {
    const rawNumber = match[1];
    const localizedTime = formatLocalizedNumber(rawNumber, lang);
    return t("guides.minRead", { time: localizedTime });
  }
  return readTime;
}

/**
 * Formats guide ISO date string using proper locale formatting.
 */
export function formatGuideDate(
  isoString: string | null | undefined,
  lang: SupportedLanguage,
): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
