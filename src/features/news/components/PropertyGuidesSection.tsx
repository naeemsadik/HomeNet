import { ArrowRight, BookOpen, ExternalLink } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, radius, webPointer } from "@/theme";
import { usePropertyGuides } from "../hooks/usePropertyGuides";
import type { PropertyGuide } from "../types/news";
import { GUIDE_FALLBACK_IMAGE, resolveGuideImage } from "../utils/guideImageStrategy";

/** Category switcher tabs requested for the homepage section. */
type GuideTab = "All" | "Market News" | "Legal & Docs" | "Buyer & Seller";
const GUIDE_TABS: GuideTab[] = [
  "All",
  "Market News",
  "Legal & Docs",
  "Buyer & Seller",
];

/** Topics the section will carry once the guides source is connected. */
const PLANNED_TOPICS = [
  "Registering a property for the first time",
  "What to check before you buy",
  "What to check before you rent",
  "Understanding katha, bigha and sqft",
];

function GuideCard({ guide, featured }: { guide: PropertyGuide; featured?: boolean }) {
  const { isPhone } = useResponsive();
  const isRss = guide.sourceType === "rss";

  const resolvedUrl = useMemo(
    () => guide.imageUrl || resolveGuideImage(guide),
    [guide.imageUrl, guide.id, guide.slug, guide.category, guide.title, guide.sourceType],
  );
  const [hasError, setHasError] = useState(false);
  const displayUri = hasError ? GUIDE_FALLBACK_IMAGE : resolvedUrl;

  useEffect(() => {
    setHasError(false);
  }, [resolvedUrl]);

  const handleImageError = () => {
    setHasError(true);
  };

  const handlePress = () => {
    if (isRss && (guide.sourceUrl || guide.href)) {
      const targetUrl = guide.sourceUrl || guide.href;
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      } else {
        void Linking.openURL(targetUrl);
      }
      return;
    }
    router.push(guide.href as never);
  };

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${isRss ? guide.sourceName || "External News" : "HomeNet Guide"} - ${guide.category}: ${guide.title}`}
      onPress={handlePress}
      style={({ pressed, hovered }: any) => [
        styles.card,
        featured && !isPhone && styles.cardFeatured,
        hovered && styles.cardHovered,
        webPointer,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.thumb, featured && !isPhone && styles.thumbFeatured]}>
        <Image
          source={{ uri: displayUri }}
          style={styles.thumbImage}
          resizeMode="cover"
          onError={handleImageError}
        />
      </View>

      <View
        style={[
          styles.cardBody,
          featured && !isPhone && styles.cardBodyFeatured,
        ]}
      >
        <View style={styles.metaRow}>
          {/* Source Attribution Badge */}
          {isRss ? (
            <View style={styles.rssSourcePill}>
              <Text numberOfLines={1} style={styles.rssSourceText}>
                {guide.sourceName || "Market News"}
              </Text>
              <ExternalLink color="#1D4ED8" size={11} strokeWidth={2.2} />
            </View>
          ) : (
            <View style={styles.homeNetPill}>
              <Text style={styles.homeNetPillText}>HomeNet Guide</Text>
            </View>
          )}

          {/* Category Pill */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{guide.category}</Text>
          </View>

          <Text style={styles.readTime}>{guide.readTime}</Text>
        </View>

        <Text
          numberOfLines={2}
          style={[styles.cardTitle, featured && !isPhone && styles.cardTitleFeatured]}
        >
          {guide.title}
        </Text>

        {featured && !isPhone && guide.excerpt ? (
          <Text numberOfLines={3} style={styles.cardExcerpt}>
            {guide.excerpt}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function PropertyGuidesSection() {
  const { isPhone, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState<GuideTab>("All");
  const { data, isLoading, isError } = usePropertyGuides({ limit: 12 });

  const allItems = data?.items ?? [];

  // Filter items client-side according to active category tab
  const filteredItems = useMemo(() => {
    if (activeTab === "Market News") {
      return allItems.filter(
        (item) =>
          item.category === "Market" ||
          item.category === "Developments" ||
          item.category === "Investment" ||
          item.sourceType === "rss",
      );
    }
    if (activeTab === "Legal & Docs") {
      return allItems.filter(
        (item) => item.category === "Legal" || item.category === "Ownership",
      );
    }
    if (activeTab === "Buyer & Seller") {
      return allItems.filter(
        (item) =>
          item.category === "Buying" ||
          item.category === "Selling" ||
          item.category === "Renting",
      );
    }
    return allItems;
  }, [allItems, activeTab]);

  const items = filteredItems.slice(0, 4);
  const [lead, ...rest] = items;

  return (
    <View style={styles.section}>
      <View style={[styles.header, isPhone && styles.headerPhone]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Blogs & Real Estate News</Text>
          <Text style={[styles.title, isPhone && styles.titlePhone]}>
            Property advice & market updates
          </Text>
        </View>

        {allItems.length > 0 ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/guides" as never)}
            style={({ hovered }: any) => [styles.seeAll, hovered && { opacity: 0.7 }, webPointer]}
          >
            <Text style={styles.seeAllText}>See all guides</Text>
            <ArrowRight color={colors.greenOnLight} size={15} />
          </Pressable>
        ) : null}
      </View>

      {/* Category Switcher Tabs */}
      <View style={[styles.tabBar, isPhone && styles.tabBarPhone]}>
        {GUIDE_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ hovered }: any) => [
                styles.tabChip,
                isActive && styles.tabChipActive,
                hovered && !isActive && styles.tabChipHovered,
                webPointer,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${tab}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.tabChipText,
                  isActive && styles.tabChipTextActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.green} size="small" />
        </View>
      ) : isError || allItems.length === 0 ? (
        // No guides source yet. Say so plainly rather than shipping filler.
        <View style={styles.emptyPanel}>
          <View style={styles.emptyIconWell}>
            <BookOpen color={colors.greenOnLight} size={22} />
          </View>
          <Text style={styles.emptyTitle}>Guides are on the way</Text>
          <Text style={styles.emptyCopy}>
            Practical, Bangladesh-specific advice for buying, renting, selling
            and registering property — written by the HomeNet team.
          </Text>
          <View style={styles.topicWrap}>
            {PLANNED_TOPICS.map((topic) => (
              <View key={topic} style={styles.topicChip}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : items.length === 0 ? (
        // Empty state when filtering a tab with 0 results
        <View style={styles.emptyFilteredPanel}>
          <Text style={styles.emptyFilteredTitle}>No articles in this category yet</Text>
          <Text style={styles.emptyFilteredCopy}>
            We are actively preparing new market reports and guides for this section.
          </Text>
          <Pressable
            onPress={() => setActiveTab("All")}
            style={({ hovered }: any) => [
              styles.resetTabBtn,
              hovered && { opacity: 0.8 },
              webPointer,
            ]}
          >
            <Text style={styles.resetTabBtnText}>Show all guides & news</Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.grid,
            isTablet && styles.gridTablet,
            isPhone && styles.gridPhone,
          ]}
        >
          {lead ? (
            <View style={[styles.leadCol, (isTablet || isPhone) && styles.fullCol]}>
              <GuideCard guide={lead} featured />
            </View>
          ) : null}

          {rest.length > 0 ? (
            <View style={[styles.restCol, (isTablet || isPhone) && styles.fullCol]}>
              {rest.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    marginTop: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  headerPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  headerCopy: { gap: 4, flexShrink: 1 },
  eyebrow: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.headingExtraBold,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  titlePhone: { fontSize: 21 },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  seeAllText: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 14,
  },

  /* Category Switcher Tabs */
  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tabBarPhone: {
    gap: 6,
    marginBottom: 16,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tabChipHovered: {
    borderColor: "rgba(11,26,23,0.24)",
    backgroundColor: colors.soft,
  },
  tabChipText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  tabChipTextActive: {
    color: colors.white,
    fontFamily: fonts.bold,
  },

  grid: { flexDirection: "row", gap: 20, width: "100%" },
  gridTablet: { flexDirection: "column" },
  gridPhone: { flexDirection: "column", gap: 14 },
  leadCol: { flex: 1.15, minWidth: 0 },
  restCol: { flex: 1, minWidth: 0, gap: 14 },
  fullCol: { flex: undefined, width: "100%" },

  card: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    padding: 12,
  },
  cardFeatured: { flexDirection: "column", gap: 0, padding: 0 },
  cardHovered: { borderColor: "rgba(11,26,23,0.18)" },
  cardPressed: { opacity: 0.92 },

  thumb: {
    width: 104,
    height: 78,
    borderRadius: radius.xs,
    overflow: "hidden",
    backgroundColor: colors.soft,
    flexShrink: 0,
  },
  thumbFeatured: { width: "100%", height: 240, borderRadius: 0 },
  thumbImage: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.soft,
  },

  cardBody: { flex: 1, minWidth: 0, gap: 6, justifyContent: "center" },
  cardBodyFeatured: { padding: 18, gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },

  /* Badge Styles */
  homeNetPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.greenLight,
  },
  homeNetPillText: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  rssSourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "rgba(34,81,214,0.16)",
  },
  rssSourceText: {
    color: "#1D4ED8",
    fontFamily: fonts.bold,
    fontSize: 11,
    maxWidth: 140,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
  },
  categoryText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  readTime: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 15,
    lineHeight: 21,
  },
  cardTitleFeatured: { fontSize: 20, lineHeight: 27 },
  cardExcerpt: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },

  stateBox: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPanel: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    padding: 32,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyFilteredPanel: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    padding: 28,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyFilteredTitle: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 16,
  },
  emptyFilteredCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    textAlign: "center",
  },
  resetTabBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
  },
  resetTabBtnText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  emptyIconWell: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.greenLight,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 18,
  },
  emptyCopy: {
    maxWidth: 520,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  topicWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  topicText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
});

