import type { Href } from "expo-router";
import type { TranslationKey } from "@/i18n";
import type { IconName } from "@/components/icons";
import { stockImage } from "@/lib/cloudinaryImage";

export interface PhotoFeatureItem {
  id: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  ctaKey: TranslationKey;
  href: Href;
  imageSource: string;
  imageAlt: string;
}

export interface UtilityFeatureItem {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  ctaKey: TranslationKey;
  href: Href;
  iconName: IconName;
}

/**
 * Tier 2 — 3-Column Core Action Photo Cards
 * Rightmove-style high-intent cards for listing creation, algorithmic valuation, and price index guides.
 */
export const PHOTO_FEATURE_CARDS: readonly PhotoFeatureItem[] = [
  {
    id: "list-property",
    badgeKey: "home.featureSections.photoCards.listProperty.badge",
    titleKey: "home.featureSections.photoCards.listProperty.title",
    descriptionKey: "home.featureSections.photoCards.listProperty.description",
    ctaKey: "home.featureSections.photoCards.listProperty.cta",
    href: "/sell",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80"
    ),
    imageAlt: "Modern residential flat in Bangladesh ready for direct listing",
  },
  {
    id: "instant-valuation",
    badgeKey: "home.featureSections.photoCards.valuation.badge",
    titleKey: "home.featureSections.photoCards.valuation.title",
    descriptionKey: "home.featureSections.photoCards.valuation.description",
    ctaKey: "home.featureSections.photoCards.valuation.cta",
    href: "/instant-valuation",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
    ),
    imageAlt: "Property valuation and market inspection",
  },
  {
    id: "property-guides",
    badgeKey: "home.featureSections.photoCards.guides.badge",
    titleKey: "home.featureSections.photoCards.guides.title",
    descriptionKey: "home.featureSections.photoCards.guides.description",
    ctaKey: "home.featureSections.photoCards.guides.cta",
    href: "/resources/property-price-index",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    ),
    imageAlt: "Dhaka city skyline showing real estate price benchmarks",
  },
] as const;

/**
 * Tier 3 — 3-Column Utility Cards
 * Focused discovery pathways for commercial spaces, mess/student accommodation, and holiday stays.
 */
export const UTILITY_FEATURE_CARDS: readonly UtilityFeatureItem[] = [
  {
    id: "commercial",
    titleKey: "home.featureSections.utilityCards.commercial.title",
    descriptionKey: "home.featureSections.utilityCards.commercial.description",
    ctaKey: "home.featureSections.utilityCards.commercial.cta",
    href: "/buy?type=commercial",
    iconName: "Building2",
  },
  {
    id: "mess",
    titleKey: "home.featureSections.utilityCards.mess.title",
    descriptionKey: "home.featureSections.utilityCards.mess.description",
    ctaKey: "home.featureSections.utilityCards.mess.cta",
    href: "/mess",
    iconName: "Bed",
  },
  {
    id: "holiday",
    titleKey: "home.featureSections.utilityCards.holiday.title",
    descriptionKey: "home.featureSections.utilityCards.holiday.description",
    ctaKey: "home.featureSections.utilityCards.holiday.cta",
    href: "/rent?subtype=short-let",
    iconName: "Compass",
  },
] as const;
