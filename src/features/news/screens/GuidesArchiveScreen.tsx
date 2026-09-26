import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  RotateCcw,
  Search,
  X,
} from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, radius, shadow, webPointer } from "@/theme";
import { usePropertyGuides } from "../hooks/usePropertyGuides";
import type { PropertyGuide } from "../types/news";
import { GUIDE_FALLBACK_IMAGE, resolveGuideImage } from "../utils/guideImageStrategy";

type ArchiveTab = "All" | "Market News" | "Legal & Docs" | "Buyer & Seller";
const ARCHIVE_TABS: ArchiveTab[] = [
  "All",
  "Market News",
  "Legal & Docs",
  "Buyer & Seller",
];

const ArchiveGuideCard = memo(function ArchiveGuideCard({ guide }: { guide: PropertyGuide }) {
  const isRss = guide.sourceType === "rss";

  const resolvedUrl = useMemo(
    () => guide.imageUrl || resolveGuideImage(guide),
    [guide.imageUrl, guide.id, guide.slug, guide.category, guide.title, guide.sourceType],
  );
  const [imgUri, setImgUri] = useState(resolvedUrl);

  useEffect(() => {
    setImgUri(resolvedUrl);
  }, [resolvedUrl]);

  const handleImageError = useCallback(() => {
    if (imgUri !== GUIDE_FALLBACK_IMAGE) {
      setImgUri(GUIDE_FALLBACK_IMAGE);
    }
  }, [imgUri]);

  const handlePress = useCallback(() => {
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
  }, [isRss, guide.sourceUrl, guide.href]);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${isRss ? guide.sourceName || "External News" : "HomeNet Guide"} - ${guide.title}`}
      onPress={handlePress}
      style={({ pressed, hovered }: any) => [
        styles.card,
        hovered && styles.cardHovered,
        pressed && styles.cardPressed,
        webPointer,
      ]}
    >
      <View style={styles.cardThumb}>
        <Image
          source={{ uri: imgUri }}
          style={styles.cardImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          onError={handleImageError}
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.badgeRow}>
          {isRss ? (
            <View style={styles.rssBadge}>
              <Text numberOfLines={1} style={styles.rssBadgeText}>
                {guide.sourceName || "Market News"}
              </Text>
              <ExternalLink color="#1D4ED8" size={11} strokeWidth={2.2} />
            </View>
          ) : (
            <View style={styles.homeNetBadge}>
              <Text style={styles.homeNetBadgeText}>HomeNet Guide</Text>
            </View>
          )}

          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{guide.category}</Text>
          </View>

          <Text style={styles.readTimeText}>{guide.readTime}</Text>
        </View>

        <Text numberOfLines={2} style={styles.cardTitle}>
          {guide.title}
        </Text>

        <Text numberOfLines={3} style={styles.cardExcerpt}>
          {guide.excerpt}
        </Text>

        {guide.tags && guide.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {guide.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

export function GuidesArchiveScreen() {
  const { isPhone, isTablet, isDesktop } = useResponsive();
  const [activeTab, setActiveTab] = useState<ArchiveTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } = usePropertyGuides({ limit: 50 });
  const allGuides = data?.items ?? [];

  const filteredGuides = useMemo(() => {
    let result = allGuides;

    // Filter by category tab
    if (activeTab === "Market News") {
      result = result.filter(
        (g) =>
          g.category === "Market" ||
          g.category === "Developments" ||
          g.category === "Investment" ||
          g.sourceType === "rss",
      );
    } else if (activeTab === "Legal & Docs") {
      result = result.filter(
        (g) => g.category === "Legal" || g.category === "Ownership",
      );
    } else if (activeTab === "Buyer & Seller") {
      result = result.filter(
        (g) =>
          g.category === "Buying" ||
          g.category === "Selling" ||
          g.category === "Renting",
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.excerpt.toLowerCase().includes(q) ||
          g.tags?.some((t) => t.toLowerCase().includes(q)) ||
          g.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allGuides, activeTab, searchQuery]);

  const numColumns = isPhone ? 1 : isTablet ? 2 : 3;

  const renderGuideItem = useCallback(
    ({ item }: { item: PropertyGuide }) => (
      <View
        style={[
          styles.gridItem,
          isTablet && styles.gridItemTablet,
          isPhone && styles.gridItemPhone,
        ]}
      >
        <ArchiveGuideCard guide={item} />
      </View>
    ),
    [isTablet, isPhone],
  );

  const keyExtractor = useCallback((item: PropertyGuide) => item.id, []);

  return (
    <AppChrome active="home">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Header Section */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            onPress={() => router.push("/" as never)}
            style={({ hovered }: any) => [
              styles.backLink,
              hovered && { opacity: 0.7 },
              webPointer,
            ]}
          >
            <ArrowLeft color={colors.greenOnLight} size={16} />
            <Text style={styles.backLinkText}>Home</Text>
          </Pressable>

          <Text style={styles.eyebrow}>HomeNet Knowledge Hub</Text>
          <Text style={[styles.title, isPhone && styles.titlePhone]}>
            Bangladesh Property Guides & News
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            Practical advice for buyers, sellers, and landlords in Bangladesh —
            from Namzari and Khatian verification to latest Dhaka market updates.
          </Text>
        </View>

        {/* Filter Controls: Search & Category Pills */}
        <View style={styles.controlsWrap}>
          <View style={styles.searchBar}>
            <Search color={colors.muted} size={18} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search guides, topics (e.g. Namzari, Katha, Stamp duty)..."
              placeholderTextColor="#899790"
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={[styles.clearBtn, webPointer]}
                accessibilityLabel="Clear search"
              >
                <X color={colors.muted} size={16} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.tabRow}>
            {ARCHIVE_TABS.map((tab) => {
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
        </View>

        {/* Content State Handling */}
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color={colors.green} size="large" />
            <Text style={styles.stateText}>Loading guides and market news...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorTitle}>Could not load guides</Text>
            <Text style={styles.errorCopy}>
              Something went wrong while retrieving property insights.
            </Text>
            <Pressable
              onPress={() => void refetch()}
              style={[styles.retryBtn, webPointer]}
            >
              <RotateCcw color={colors.white} size={15} />
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredGuides.length === 0 ? (
          <View style={styles.emptyPanel}>
            <View style={styles.emptyIconWell}>
              <BookOpen color={colors.greenOnLight} size={24} />
            </View>
            <Text style={styles.emptyTitle}>No matching guides found</Text>
            <Text style={styles.emptyCopy}>
              {searchQuery
                ? `No articles matched "${searchQuery}". Try a different search term or category.`
                : "No articles are available in this category yet."}
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setActiveTab("All");
              }}
              style={[styles.resetBtn, webPointer]}
            >
              <Text style={styles.resetBtnText}>Clear filters</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            key={`guides-grid-${numColumns}`}
            data={filteredGuides}
            renderItem={renderGuideItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            scrollEnabled={false}
            columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 1140,
    alignSelf: "center",
    paddingTop: 32,
    paddingBottom: 72,
  },
  containerPhone: {
    paddingTop: 20,
    paddingBottom: 48,
  },
  header: {
    gap: 8,
    marginBottom: 28,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  backLinkText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  eyebrow: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.headingExtraBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  titlePhone: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  subtitle: {
    maxWidth: 720,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15.5,
    lineHeight: 24,
    marginTop: 4,
  },
  subtitlePhone: {
    fontSize: 14,
    lineHeight: 21,
  },

  /* Controls */
  controlsWrap: {
    gap: 16,
    marginBottom: 32,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    ...shadow,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.regular,
    fontSize: 14.5,
    color: colors.ink,
    outlineWidth: 0,
  } as any,
  clearBtn: {
    padding: 6,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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

  /* FlatList Grid Layout */
  listContainer: {
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
  },
  gridItemTablet: {},
  gridItemPhone: {
    width: "100%",
    marginBottom: 16,
  },

  /* Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    height: "100%",
    justifyContent: "space-between",
    ...shadow,
  },
  cardHovered: {
    borderColor: "rgba(11,26,23,0.22)",
    transform: [{ translateY: -2 }],
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardThumb: {
    width: "100%",
    height: 170,
    backgroundColor: colors.soft,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    padding: 16,
    gap: 8,
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  homeNetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.greenLight,
  },
  homeNetBadgeText: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  rssBadge: {
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
  rssBadgeText: {
    color: "#1D4ED8",
    fontFamily: fonts.bold,
    fontSize: 11,
    maxWidth: 130,
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
  readTimeText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 16,
    lineHeight: 22,
  },
  cardExcerpt: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  tagChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.soft,
  },
  tagText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  /* States */
  stateContainer: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  emptyPanel: {
    alignItems: "center",
    gap: 10,
    padding: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyIconWell: {
    width: 52,
    height: 52,
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
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 440,
  },
  resetBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
  },
  resetBtnText: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  errorPanel: {
    alignItems: "center",
    gap: 10,
    padding: 36,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorTitle: {
    color: "#B91C1C",
    fontFamily: fonts.headingBold,
    fontSize: 17,
  },
  errorCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
  },
  retryBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
