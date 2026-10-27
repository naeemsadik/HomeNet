import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "@/components/icons";
import { GooglePlayButton } from "@/components/Footer";
import { usePropertyGuides } from "@/features/news/hooks/usePropertyGuides";
import type { PropertyGuide } from "@/features/news/types/news";
import { resolveGuideImage } from "@/features/news/utils/guideImageStrategy";
import {
  getGuideCategoryLabel,
  getLocalizedGuideTitle,
} from "@/features/news/utils/guideTranslators";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

interface FeatureCard {
  key: string;
  image: string;
  href: string;
  title: TranslationKey;
  copy: TranslationKey;
  cta: TranslationKey;
}

/**
 * What HomeNet offers beyond the search box, one card each with curated real estate photography.
 * Every card opens something that exists.
 */
const FEATURE_CARDS: FeatureCard[] = [
  {
    key: "valuation",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    href: "/valuation",
    title: "home.mobileCards.valuation.title",
    copy: "home.mobileCards.valuation.copy",
    cta: "home.mobileCards.valuation.cta",
  },
  {
    key: "list",
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
    href: "/sell",
    title: "home.mobileCards.list.title",
    copy: "home.mobileCards.list.copy",
    cta: "home.mobileCards.list.cta",
  },
  {
    key: "ai",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    href: "/ai-finder",
    title: "home.mobileCards.ai.title",
    copy: "home.mobileCards.ai.copy",
    cta: "home.mobileCards.ai.cta",
  },
  {
    key: "holiday",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    href: "/rent?subtype=short-let",
    title: "home.mobileCards.holiday.title",
    copy: "home.mobileCards.holiday.copy",
    cta: "home.mobileCards.holiday.cta",
  },
  {
    key: "commercial",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    href: "/buy?type=commercial",
    title: "home.mobileCards.commercial.title",
    copy: "home.mobileCards.commercial.copy",
    cta: "home.mobileCards.commercial.cta",
  },
  {
    key: "verified",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    href: "/buy?is_verified=true",
    title: "home.mobileCards.verified.title",
    copy: "home.mobileCards.verified.copy",
    cta: "home.mobileCards.verified.cta",
  },
];

const FeatureCardView = memo(function FeatureCardView({ card }: { card: FeatureCard }) {
  const { t } = useTranslation();
  const title = t(card.title);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={title}
      onPress={() => router.push(card.href as never)}
      style={({ pressed }) => [styles.card, webPointer, pressed && { opacity: 0.92 }]}
    >
      <Image
        source={{ uri: card.image }}
        style={styles.cardBanner}
        contentFit="cover"
        accessibilityLabel={title}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardCopy}>{t(card.copy)}</Text>
        <View style={styles.cardCta}>
          <Text style={styles.cardCtaText}>{t(card.cta)}</Text>
          <ChevronRight color={colorTokens.ink} size={16} strokeWidth={2.2} />
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
    </View>
  );
}

/** "Download the Homenet app" card positioned between guides and footer resources. */
const AppDownloadCard = memo(function AppDownloadCard() {
  const { t } = useTranslation();

  return (
    <View style={styles.appDownloadCard}>
      <Text style={styles.appDownloadTitle}>{t("home.downloadAppTitle")}</Text>
      <GooglePlayButton />
    </View>
  );
});

/**
 * Everything the phone homepage shows below the search card: feature cards with curated photography,
 * guides strip, and the app download card.
 */
export function MobileHomeSections() {
  return (
    <View style={styles.wrap}>
      {FEATURE_CARDS.map((card) => (
        <FeatureCardView card={card} key={card.key} />
      ))}
      <NewsStrip />
      <AppDownloadCard />
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
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  cardBanner: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colorTokens.surfaceSunken,
  },
  cardBody: {
    padding: 16,
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
    borderRadius: radius.card,
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
  appDownloadCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    padding: 20,
    marginVertical: 16,
    gap: 14,
  },
  appDownloadTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colorTokens.brandText,
  },
});
