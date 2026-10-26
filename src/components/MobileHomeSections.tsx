import { memo, type ComponentType } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowRight,
  BadgeCheck,
  Bed,
  Building2,
  Calculator,
  Home,
  Sparkles,
} from "@/components/icons";
import { usePropertyGuides } from "@/features/news/hooks/usePropertyGuides";
import type { PropertyGuide } from "@/features/news/types/news";
import { resolveGuideImage } from "@/features/news/utils/guideImageStrategy";
import {
  getGuideCategoryLabel,
  getLocalizedGuideTitle,
} from "@/features/news/utils/guideTranslators";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

type IconType = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

interface FeatureCard {
  key: string;
  icon: IconType;
  /** Tint behind the icon; kept light so the card reads as quiet. */
  tint: string;
  href: string;
  title: TranslationKey;
  copy: TranslationKey;
  cta: TranslationKey;
}

/**
 * What HomeNet offers beyond the search box, one card each, like the promo
 * cards on Rightmove's phone homepage. Every card opens something that exists.
 */
const FEATURE_CARDS: FeatureCard[] = [
  {
    key: "valuation",
    icon: Calculator,
    tint: "#E3F7EF",
    href: "/valuation",
    title: "home.mobileCards.valuation.title",
    copy: "home.mobileCards.valuation.copy",
    cta: "home.mobileCards.valuation.cta",
  },
  {
    key: "list",
    icon: Home,
    tint: "#FFF1DB",
    href: "/sell",
    title: "home.mobileCards.list.title",
    copy: "home.mobileCards.list.copy",
    cta: "home.mobileCards.list.cta",
  },
  {
    key: "ai",
    icon: Sparkles,
    tint: "#EDE8FF",
    href: "/ai-finder",
    title: "home.mobileCards.ai.title",
    copy: "home.mobileCards.ai.copy",
    cta: "home.mobileCards.ai.cta",
  },
  {
    key: "holiday",
    icon: Bed,
    tint: "#E1F0FF",
    href: "/rent?subtype=short-let",
    title: "home.mobileCards.holiday.title",
    copy: "home.mobileCards.holiday.copy",
    cta: "home.mobileCards.holiday.cta",
  },
  {
    key: "commercial",
    icon: Building2,
    tint: "#F1ECE4",
    href: "/buy?type=commercial",
    title: "home.mobileCards.commercial.title",
    copy: "home.mobileCards.commercial.copy",
    cta: "home.mobileCards.commercial.cta",
  },
  {
    key: "verified",
    icon: BadgeCheck,
    tint: "#E3F7EF",
    href: "/buy?is_verified=true",
    title: "home.mobileCards.verified.title",
    copy: "home.mobileCards.verified.copy",
    cta: "home.mobileCards.verified.cta",
  },
];

const FeatureCardView = memo(function FeatureCardView({ card }: { card: FeatureCard }) {
  const { t } = useTranslation();
  const Icon = card.icon;
  const title = t(card.title);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={title}
      onPress={() => router.push(card.href as never)}
      style={({ pressed }) => [styles.card, webPointer, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.cardBand, { backgroundColor: card.tint }]}>
        <Icon color={colorTokens.ink} size={34} strokeWidth={1.8} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardCopy}>{t(card.copy)}</Text>
        <View style={styles.cardCta}>
          <Text style={styles.cardCtaText}>{t(card.cta)}</Text>
          <ArrowRight color={colorTokens.ink} size={16} strokeWidth={2.2} />
        </View>
      </View>
    </Pressable>
  );
});

const NewsCard = memo(function NewsCard({ guide }: { guide: PropertyGuide }) {
  const { t, language } = useTranslation();
  const uri = guide.imageUrl || resolveGuideImage(guide);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={getLocalizedGuideTitle(guide, language)}
      onPress={() => router.push(guide.href as never)}
      style={({ pressed }) => [styles.newsCard, webPointer, pressed && { opacity: 0.92 }]}
    >
      <Image source={{ uri }} style={styles.newsImage} contentFit="cover" accessibilityIgnoresInvertColors />
      <View style={styles.newsBody}>
        <Text style={styles.newsCategory}>{getGuideCategoryLabel(guide.category, t)}</Text>
        <Text numberOfLines={3} style={styles.newsTitle}>
          {getLocalizedGuideTitle(guide, language)}
        </Text>
      </View>
    </Pressable>
  );
});

/** Latest guides and market updates: a short swipe row, with the full list one tap away. */
function NewsStrip() {
  const { t } = useTranslation();
  const { data } = usePropertyGuides(3);
  const guides = data?.items ?? [];
  if (guides.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.mobileCards.newsTitle")}</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/guides" as never)}
          style={webPointer}
        >
          <Text style={styles.sectionLink}>{t("home.mobileCards.newsSeeAll")}</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.newsRow}
      >
        {guides.map((guide) => (
          <NewsCard guide={guide} key={guide.id} />
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/market" as never)}
        style={[styles.marketLink, webPointer]}
      >
        <Text style={styles.marketLinkText}>{t("home.mobileCards.marketLink")}</Text>
        <ArrowRight color={colorTokens.ink} size={16} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

/**
 * Everything the phone homepage shows below the search card: feature cards and
 * news. The long website sections (comparison, how it works, product preview,
 * AI and owner banners) are left to the website.
 */
export function MobileHomeSections() {
  return (
    <View style={styles.wrap}>
      {FEATURE_CARDS.map((card) => (
        <FeatureCardView card={card} key={card.key} />
      ))}
      <NewsStrip />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    gap: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  cardBand: {
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    padding: 18,
    gap: 6,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
  },
  cardCopy: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: colorTokens.muted,
  },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  cardCtaText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colorTokens.ink,
    textDecorationLine: "underline",
  },
  section: {
    marginTop: 8,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colorTokens.ink,
    flexShrink: 1,
  },
  sectionLink: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colorTokens.brandText,
  },
  newsRow: {
    gap: 12,
    paddingRight: 4,
  },
  newsCard: {
    width: 248,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: 132,
    backgroundColor: colorTokens.surfaceSunken,
  },
  newsBody: {
    padding: 14,
    gap: 6,
  },
  newsCategory: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colorTokens.brandText,
  },
  newsTitle: {
    fontFamily: fonts.bold,
    fontSize: 15.5,
    lineHeight: 21,
    color: colorTokens.ink,
  },
  marketLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  marketLinkText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colorTokens.ink,
    textDecorationLine: "underline",
  },
});
