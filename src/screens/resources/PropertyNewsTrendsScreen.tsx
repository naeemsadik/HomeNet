import { useState, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  LineChart,
  Mail,
  ShieldCheck,
  Sparkles,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export type NewsCategory = "all" | "policy" | "infrastructure" | "market_trends";

export interface ArticleItem {
  id: string;
  category: "policy" | "infrastructure" | "market_trends";
  categoryKey: TranslationKey;
  topicKey: TranslationKey;
  dateKey: TranslationKey;
  readTimeKey: TranslationKey;
  titleKey: TranslationKey;
  summaryKey: TranslationKey;
  takeawayKey: TranslationKey;
}

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: "art-1",
    category: "infrastructure",
    categoryKey: "propertyNewsTrends.art1Category",
    topicKey: "propertyNewsTrends.art1Topic",
    dateKey: "propertyNewsTrends.art1Date",
    readTimeKey: "propertyNewsTrends.art1ReadTime",
    titleKey: "propertyNewsTrends.art1Title",
    summaryKey: "propertyNewsTrends.art1Summary",
    takeawayKey: "propertyNewsTrends.art1Takeaway",
  },
  {
    id: "art-2",
    category: "policy",
    categoryKey: "propertyNewsTrends.art2Category",
    topicKey: "propertyNewsTrends.art2Topic",
    dateKey: "propertyNewsTrends.art2Date",
    readTimeKey: "propertyNewsTrends.art2ReadTime",
    titleKey: "propertyNewsTrends.art2Title",
    summaryKey: "propertyNewsTrends.art2Summary",
    takeawayKey: "propertyNewsTrends.art2Takeaway",
  },
  {
    id: "art-3",
    category: "market_trends",
    categoryKey: "propertyNewsTrends.art3Category",
    topicKey: "propertyNewsTrends.art3Topic",
    dateKey: "propertyNewsTrends.art3Date",
    readTimeKey: "propertyNewsTrends.art3ReadTime",
    titleKey: "propertyNewsTrends.art3Title",
    summaryKey: "propertyNewsTrends.art3Summary",
    takeawayKey: "propertyNewsTrends.art3Takeaway",
  },
  {
    id: "art-4",
    category: "infrastructure",
    categoryKey: "propertyNewsTrends.art4Category",
    topicKey: "propertyNewsTrends.art4Topic",
    dateKey: "propertyNewsTrends.art4Date",
    readTimeKey: "propertyNewsTrends.art4ReadTime",
    titleKey: "propertyNewsTrends.art4Title",
    summaryKey: "propertyNewsTrends.art4Summary",
    takeawayKey: "propertyNewsTrends.art4Takeaway",
  },
  {
    id: "art-5",
    category: "market_trends",
    categoryKey: "propertyNewsTrends.art5Category",
    topicKey: "propertyNewsTrends.art5Topic",
    dateKey: "propertyNewsTrends.art5Date",
    readTimeKey: "propertyNewsTrends.art5ReadTime",
    titleKey: "propertyNewsTrends.art5Title",
    summaryKey: "propertyNewsTrends.art5Summary",
    takeawayKey: "propertyNewsTrends.art5Takeaway",
  },
];

export function PropertyNewsTrendsScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();

  const [activeCategory, setActiveCategory] = useState<NewsCategory>("all");
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const categories: { key: NewsCategory; labelKey: TranslationKey }[] = [
    { key: "all", labelKey: "propertyNewsTrends.tabAll" },
    { key: "policy", labelKey: "propertyNewsTrends.tabPolicy" },
    { key: "infrastructure", labelKey: "propertyNewsTrends.tabInfrastructure" },
    { key: "market_trends", labelKey: "propertyNewsTrends.tabMarketTrends" },
  ];

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") {
      return ARTICLES_DATA;
    }
    return ARTICLES_DATA.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const showFeatured = activeCategory === "all" || activeCategory === "policy";

  const handleSubscribe = () => {
    if (emailInput.trim().includes("@")) {
      setIsSubscribed(true);
    }
  };

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>
            {t("propertyNewsTrends.eyebrow")}
          </Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("propertyNewsTrends.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("propertyNewsTrends.subheading")}
          </Text>

          <View style={[styles.heroBadges, isPhone && styles.heroBadgesPhone]}>
            <View style={styles.badgeItem}>
              <Calendar color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("propertyNewsTrends.lastUpdated")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <BookOpen color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("propertyNewsTrends.digestBadge")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <ShieldCheck color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>Verified Market Gazette</Text>
            </View>
          </View>
        </View>

        {/* Category Filter Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsWrap}>
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  accessibilityRole="button"
                  onPress={() => setActiveCategory(cat.key)}
                  style={[
                    styles.tabButton,
                    webPointer,
                    isSelected && styles.tabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      isSelected && styles.tabButtonTextActive,
                    ]}
                  >
                    {t(cat.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Featured Editorial Story Card */}
        {showFeatured ? (
          <View style={styles.featuredSection}>
            <View
              style={[
                styles.featuredCard,
                isPhone && styles.featuredCardPhone,
              ]}
            >
              <View style={styles.featuredMetaRow}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>
                    {t("propertyNewsTrends.featuredBadge")}
                  </Text>
                </View>
                <View style={styles.featuredCategoryBadge}>
                  <Text style={styles.featuredCategoryBadgeText}>
                    {t("propertyNewsTrends.featuredCategory")}
                  </Text>
                </View>
                <View style={styles.timeMetaWrap}>
                  <Clock color={colorTokens.muted} size={14} />
                  <Text style={styles.timeMetaText}>
                    {t("propertyNewsTrends.featuredDate")} •{" "}
                    {t("propertyNewsTrends.featuredReadTime")}
                  </Text>
                </View>
              </View>

              <Text
                accessibilityRole="header"
                aria-level={2}
                style={[
                  styles.featuredTitle,
                  isPhone && styles.featuredTitlePhone,
                ]}
              >
                {t("propertyNewsTrends.featuredTitle")}
              </Text>

              <Text style={styles.featuredSummary}>
                {t("propertyNewsTrends.featuredSummary")}
              </Text>

              <View style={styles.takeawayBox}>
                <Sparkles
                  color={colorTokens.brandText}
                  size={18}
                  style={styles.takeawayIcon}
                />
                <Text style={styles.takeawayText}>
                  {t("propertyNewsTrends.featuredTakeaway")}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Curated Trends & Intelligence Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyNewsTrends.gridTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyNewsTrends.gridSubtitle")}
            </Text>
          </View>

          <View
            style={[
              styles.articlesGrid,
              (isPhone || isTablet) && styles.articlesGridStack,
            ]}
          >
            {filteredArticles.map((article) => (
              <View
                key={article.id}
                style={[
                  styles.articleCard,
                  isPhone && styles.articleCardPhone,
                ]}
              >
                <View style={styles.articleHeaderRow}>
                  <View style={styles.topicBadge}>
                    <Text style={styles.topicBadgeText}>
                      {t(article.topicKey)}
                    </Text>
                  </View>
                  <View style={styles.timeMetaWrap}>
                    <Clock color={colorTokens.muted} size={13} />
                    <Text style={styles.articleDateText}>
                      {t(article.dateKey)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.articleTitle}>{t(article.titleKey)}</Text>
                <Text style={styles.articleSummary}>
                  {t(article.summaryKey)}
                </Text>

                <View style={styles.articleTakeawayRow}>
                  <Text style={styles.articleTakeawayText}>
                    💡 {t(article.takeawayKey)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quarterly Market Snapshot Widget */}
        <View style={styles.section}>
          <View style={[styles.snapshotCard, isPhone && styles.snapshotCardPhone]}>
            <View style={styles.snapshotHeader}>
              <View style={styles.snapshotIconWrap}>
                <LineChart color={colorTokens.brandText} size={22} />
              </View>
              <View style={styles.snapshotHeaderTextWrap}>
                <Text
                  accessibilityRole="header"
                  aria-level={2}
                  style={styles.snapshotTitle}
                >
                  {t("propertyNewsTrends.snapshotTitle")}
                </Text>
                <Text style={styles.snapshotSubtitle}>
                  {t("propertyNewsTrends.snapshotSubtitle")}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.snapshotGrid,
                isPhone && styles.snapshotGridPhone,
              ]}
            >
              <View style={styles.snapshotMetricCard}>
                <Text style={styles.metricLabel}>
                  {t("propertyNewsTrends.stat1Label")}
                </Text>
                <Text style={styles.metricValue}>
                  {t("propertyNewsTrends.stat1Value")}
                </Text>
                <Text style={styles.metricNote}>
                  {t("propertyNewsTrends.stat1Note")}
                </Text>
              </View>

              <View style={styles.snapshotMetricCard}>
                <Text style={styles.metricLabel}>
                  {t("propertyNewsTrends.stat2Label")}
                </Text>
                <Text style={styles.metricValueHighlight}>
                  {t("propertyNewsTrends.stat2Value")}
                </Text>
                <Text style={styles.metricNote}>
                  {t("propertyNewsTrends.stat2Note")}
                </Text>
              </View>

              <View style={styles.snapshotMetricCard}>
                <Text style={styles.metricLabel}>
                  {t("propertyNewsTrends.stat3Label")}
                </Text>
                <Text style={styles.metricValue}>
                  {t("propertyNewsTrends.stat3Value")}
                </Text>
                <Text style={styles.metricNote}>
                  {t("propertyNewsTrends.stat3Note")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Newsletter Subscription Callout */}
        <View style={styles.section}>
          <View
            style={[
              styles.newsletterCard,
              isPhone && styles.newsletterCardPhone,
            ]}
          >
            <View style={styles.newsletterIconWrap}>
              <Mail color={colorTokens.brandText} size={24} />
            </View>

            <View style={styles.newsletterContentWrap}>
              <Text style={styles.newsletterTitle}>
                {t("propertyNewsTrends.newsletterTitle")}
              </Text>
              <Text style={styles.newsletterSubtitle}>
                {t("propertyNewsTrends.newsletterSubtitle")}
              </Text>

              {isSubscribed ? (
                <View style={styles.subscribedRow}>
                  <CheckCircle2 color={colorTokens.brandText} size={20} />
                  <Text style={styles.subscribedText}>
                    {t("propertyNewsTrends.subscribedSuccess")}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.subscribeInputRow,
                    isPhone && styles.subscribeInputRowPhone,
                  ]}
                >
                  <TextInput
                    accessibilityLabel={t("propertyNewsTrends.newsletterTitle")}
                    keyboardType="email-address"
                    onChangeText={setEmailInput}
                    placeholder={t("propertyNewsTrends.emailPlaceholder")}
                    placeholderTextColor={colorTokens.subtle}
                    style={styles.subscribeInput}
                    value={emailInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleSubscribe}
                    style={[styles.subscribeButton, webPointer]}
                  >
                    <Text style={styles.subscribeButtonText}>
                      {t("propertyNewsTrends.subscribeButton")}
                    </Text>
                    <ArrowRight color={colorTokens.brandText} size={16} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Editorial Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>
              {t("propertyNewsTrends.disclaimerTitle")}
            </Text>
            <Text style={styles.disclaimerText}>
              {t("propertyNewsTrends.disclaimerDesc")}
            </Text>
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 40,
    paddingBottom: 64,
  },
  containerPhone: {
    paddingHorizontal: layout.gutterPhone,
    paddingTop: 24,
    paddingBottom: 48,
  },
  // ─── Hero ──────────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 36,
  },
  heroPhone: {
    marginBottom: 24,
    alignItems: "flex-start",
    textAlign: "left",
  },
  eyebrow: {
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 14,
    maxWidth: 760,
  },
  heroTitlePhone: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: "left",
  },
  heroCopy: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colorTokens.muted,
    textAlign: "center",
    maxWidth: 680,
    marginBottom: 24,
  },
  heroCopyPhone: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 20,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  heroBadgesPhone: {
    justifyContent: "flex-start",
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    minHeight: 38,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.brandText,
  },
  // ─── Category Tabs ─────────────────────────────────────────────────────
  tabsSection: {
    marginBottom: 28,
  },
  tabsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tabButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  tabButtonText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  tabButtonTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  // ─── Featured Article Card ─────────────────────────────────────────────
  featuredSection: {
    marginBottom: 44,
  },
  featuredCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 32,
    ...shadow,
  },
  featuredCardPhone: {
    padding: 20,
  },
  featuredMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  featuredBadge: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.brandText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredCategoryBadge: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredCategoryBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.muted,
  },
  timeMetaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeMetaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
  },
  featuredTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    lineHeight: 32,
    color: colorTokens.ink,
    marginBottom: 12,
  },
  featuredTitlePhone: {
    fontSize: 20,
    lineHeight: 28,
  },
  featuredSummary: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colorTokens.body,
    marginBottom: 20,
  },
  takeawayBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 16,
  },
  takeawayIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  takeawayText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.brandText,
    flex: 1,
  },
  // ─── Common Sections ───────────────────────────────────────────────────
  section: {
    marginBottom: 44,
  },
  sectionHeaderWrap: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  sectionTitlePhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.muted,
  },
  // ─── Articles Grid ─────────────────────────────────────────────────────
  articlesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  articlesGridStack: {
    flexDirection: "column",
    gap: 16,
  },
  articleCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 24,
    ...shadow,
  },
  articleCardPhone: {
    minWidth: "100%",
    padding: 18,
  },
  articleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topicBadge: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.brandText,
  },
  articleDateText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
  },
  articleTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 24,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  articleSummary: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
    marginBottom: 16,
  },
  articleTakeawayRow: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  articleTakeawayText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colorTokens.body,
  },
  // ─── Quarterly Market Snapshot ─────────────────────────────────────────
  snapshotCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 28,
  },
  snapshotCardPhone: {
    padding: 18,
  },
  snapshotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  snapshotIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotHeaderTextWrap: {
    flex: 1,
  },
  snapshotTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
    color: colorTokens.ink,
    marginBottom: 2,
  },
  snapshotSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.muted,
  },
  snapshotGrid: {
    flexDirection: "row",
    gap: 16,
  },
  snapshotGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  snapshotMetricCard: {
    flex: 1,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 18,
    ...shadow,
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.muted,
    marginBottom: 6,
  },
  metricValue: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  metricValueHighlight: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.brandText,
    marginBottom: 4,
  },
  metricNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.subtle,
  },
  // ─── Newsletter Callout ────────────────────────────────────────────────
  newsletterCard: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 32,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    ...shadow,
  },
  newsletterCardPhone: {
    flexDirection: "column",
    padding: 20,
    gap: 16,
  },
  newsletterIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  newsletterContentWrap: {
    flex: 1,
  },
  newsletterTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 19,
    lineHeight: 26,
    color: colorTokens.brandText,
    marginBottom: 6,
  },
  newsletterSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.body,
    marginBottom: 18,
  },
  subscribeInputRow: {
    flexDirection: "row",
    gap: 10,
    maxWidth: 520,
  },
  subscribeInputRowPhone: {
    flexDirection: "column",
    maxWidth: "100%",
  },
  subscribeInput: {
    flex: 1,
    height: 44,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colorTokens.ink,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 18,
    minHeight: 44,
    gap: 8,
  },
  subscribeButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colorTokens.brandText,
  },
  subscribedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  subscribedText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colorTokens.brandText,
  },
  // ─── Editorial Disclaimer ──────────────────────────────────────────────
  disclaimerSection: {
    marginTop: 8,
  },
  disclaimerCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  disclaimerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colorTokens.muted,
  },
});

