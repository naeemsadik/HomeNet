import type { Href } from "expo-router";
import type { TranslationKey } from "@/i18n";
import { stockImage } from "@/lib/cloudinaryImage";

export interface PhotoFeatureItem {
  id: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  href: Href;
  imageSource: string;
  imageAltKey: TranslationKey;
}

/**
 * 6 Core HomeNet Feature Cards
 * High-intent Rightmove-style cards arranged in a symmetrical 3-col x 2-row grid.
 */
export const PHOTO_FEATURE_CARDS: readonly PhotoFeatureItem[] = [
  {
    id: "list-property",
    badgeKey: "home.featureSections.photoCards.listProperty.badge",
    titleKey: "home.featureSections.photoCards.listProperty.title",
    descriptionKey: "home.featureSections.photoCards.listProperty.description",
    href: "/sell",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80"
    ),
    imageAltKey: "home.featureSections.photoCards.listProperty.imageAlt",
  },
  {
    id: "instant-valuation",
    badgeKey: "home.featureSections.photoCards.valuation.badge",
    titleKey: "home.featureSections.photoCards.valuation.title",
    descriptionKey: "home.featureSections.photoCards.valuation.description",
    href: "/instant-valuation",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
    ),
    imageAltKey: "home.featureSections.photoCards.valuation.imageAlt",
  },
  {
    id: "property-guides",
    badgeKey: "home.featureSections.photoCards.guides.badge",
    titleKey: "home.featureSections.photoCards.guides.title",
    descriptionKey: "home.featureSections.photoCards.guides.description",
    href: "/resources/property-price-index",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    ),
    imageAltKey: "home.featureSections.photoCards.guides.imageAlt",
  },
  {
    id: "commercial-property",
    badgeKey: "home.featureSections.photoCards.commercial.badge",
    titleKey: "home.featureSections.photoCards.commercial.title",
    descriptionKey: "home.featureSections.photoCards.commercial.description",
    href: "/buy?type=commercial",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
    ),
    imageAltKey: "home.featureSections.photoCards.commercial.imageAlt",
  },
  {
    id: "mess-accommodation",
    badgeKey: "home.featureSections.photoCards.mess.badge",
    titleKey: "home.featureSections.photoCards.mess.title",
    descriptionKey: "home.featureSections.photoCards.mess.description",
    href: "/mess",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ),
    imageAltKey: "home.featureSections.photoCards.mess.imageAlt",
  },
  {
    id: "holiday-stay",
    badgeKey: "home.featureSections.photoCards.holiday.badge",
    titleKey: "home.featureSections.photoCards.holiday.title",
    descriptionKey: "home.featureSections.photoCards.holiday.description",
    href: "/rent?subtype=short-let",
    imageSource: stockImage(
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ),
    imageAltKey: "home.featureSections.photoCards.holiday.imageAlt",
  },
] as const;
