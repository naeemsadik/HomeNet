import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Layers,
  Share2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { openExternalUrl } from "@/lib/safeUrl";
import { shareLink } from "@/lib/share";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, radius, shadow, webPointer } from "@/theme";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { usePropertyGuide, usePropertyGuides } from "../hooks/usePropertyGuides";
import type { PropertyGuide } from "../types/news";
import { GUIDE_FALLBACK_IMAGE, resolveGuideImage } from "../utils/guideImageStrategy";

interface GuideDetailScreenProps {
  slug: string;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/** Related guide mini card for editorial sidebar */
const RelatedGuideMiniItem = memo(function RelatedGuideMiniItem({
  guide,
}: {
  guide: PropertyGuide;
}) {
  const isRss = guide.sourceType === "rss";
  const resolvedUrl = useMemo(
    () => guide.imageUrl || resolveGuideImage(guide),
    [guide.imageUrl, guide.id, guide.slug, guide.category, guide.title, guide.sourceType],
  );
  const [imgUri, setImgUri] = useState(resolvedUrl);

  useEffect(() => {
    setImgUri(resolvedUrl);
  }, [resolvedUrl]);

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
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={guide.title}
      style={({ hovered, pressed }: any) => [
        styles.relatedItem,
        hovered && styles.relatedItemHovered,
        pressed && { opacity: 0.85 },
        webPointer,
      ]}
    >
      <View style={styles.relatedThumb}>
        <Image
          source={{ uri: imgUri }}
          style={styles.relatedThumbImg}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          onError={() => setImgUri(GUIDE_FALLBACK_IMAGE)}
        />
      </View>
      <View style={styles.relatedContent}>
        <View style={styles.relatedMetaRow}>
          <Text style={styles.relatedCategory}>{guide.category}</Text>
          <Text style={styles.relatedDot}>•</Text>
          <Text style={styles.relatedReadTime}>{guide.readTime}</Text>
        </View>
        <Text numberOfLines={2} style={styles.relatedTitle}>
          {guide.title}
        </Text>
      </View>
    </Pressable>
  );
});

export function GuideDetailScreen({ slug }: GuideDetailScreenProps) {
  const { isPhone, isWide, width } = useResponsive();
  const isMobile = isPhone || width < 900;

  const { data: guide, isLoading, isError } = usePropertyGuide(slug);
  const { data: allGuidesData } = usePropertyGuides({ limit: 6 });

  const isRss = guide?.sourceType === "rss";

  // Resolve cover image with fallback state handling
  const resolvedCoverUrl = useMemo(
    () => guide?.imageUrl || resolveGuideImage(guide),
    [guide],
  );
  const [coverUri, setCoverUri] = useState(resolvedCoverUrl);

  useEffect(() => {
    setCoverUri(resolvedCoverUrl);
  }, [resolvedCoverUrl]);

  const handleCoverError = useCallback(() => {
    if (coverUri !== GUIDE_FALLBACK_IMAGE) {
      setCoverUri(GUIDE_FALLBACK_IMAGE);
    }
  }, [coverUri]);

  // Filter out the active article from related items
  const relatedGuides = useMemo(() => {
    const items = allGuidesData?.items ?? [];
    return items.filter((item) => item.slug !== slug && item.id !== guide?.id).slice(0, 3);
  }, [allGuidesData, slug, guide?.id]);

  const handleExternalRead = () => {
    openExternalUrl(guide?.sourceUrl || guide?.href);
  };

  const handleShare = () => {
    if (!guide) return;
    void shareLink({ title: guide.title });
  };

  return (
    <AppChrome active="home" fluid>
      <View
        style={[
          styles.container,
          isWide && styles.containerWide,
          isMobile && styles.containerPhone,
        ]}
      >
        {/* Navigation Breadcrumb */}
        <View style={styles.topNavRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Guides"
            onPress={() => router.push("/guides" as never)}
            style={({ hovered }: any) => [
              styles.backBtn,
              hovered && { opacity: 0.7 },
              webPointer,
            ]}
          >
            <ArrowLeft color={colors.greenOnLight} size={16} />
            <Text style={styles.backBtnText}>All Guides & News</Text>
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable
              onPress={handleShare}
              style={({ hovered }: any) => [
                styles.shareBtn,
                hovered && { opacity: 0.7 },
                webPointer,
              ]}
              accessibilityLabel="Share article"
            >
              <Share2 color={colors.muted} size={15} />
              <Text style={styles.shareBtnText}>Share</Text>
            </Pressable>
          )}
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.green} size="large" />
            <Text style={styles.stateText}>Loading guide...</Text>
          </View>
        ) : isError || !guide ? (
          <View style={styles.notFoundPanel}>
            <BookOpen color={colors.muted} size={32} />
            <Text style={styles.notFoundTitle}>Guide not found</Text>
            <Text style={styles.notFoundCopy}>
              The property guide you are looking for may have been moved or updated.
            </Text>
            <Pressable
              onPress={() => router.push("/guides" as never)}
              style={[styles.primaryActionBtn, webPointer]}
            >
              <Text style={styles.primaryActionBtnText}>Browse all guides</Text>
            </Pressable>
          </View>
        ) : (
          /* ============================================================
             RESPONSIVE 2-COLUMN EDITORIAL CANVAS (FULL WIDTH)
             Mobile: Fluid 100% single-column vertical stack
             Desktop (>= 900px): Wide article canvas (~72%) + Sticky Sidebar (380px)
          ============================================================ */
          <View
            style={[
              styles.layoutGrid,
              isMobile && styles.layoutGridMobile,
            ]}
          >
            {/* Main Article Column */}
            <View style={styles.mainColumn}>
              {isRss ? (
                /* ------------------------------------------------------------
                   EXTERNAL RSS ARTICLE VIEW
                   Displays verified excerpt, metadata, publisher disclaimer,
                   and prominent outbound link.
                ------------------------------------------------------------ */
                <View style={[styles.articleCard, isMobile && styles.articleCardMobile]}>
                  {/* Publisher Syndication Banner */}
                  <View style={styles.syndicationBanner}>
                    <View style={styles.syndicationLeft}>
                      <View style={styles.syndicationPill}>
                        <Text style={styles.syndicationPillText}>
                          External Real Estate News
                        </Text>
                      </View>
                      <Text style={styles.syndicationNotice}>
                        Syndicated from{" "}
                        <Text style={styles.publisherHighlight}>
                          {guide.sourceName || "Publisher"}
                        </Text>
                      </Text>
                    </View>
                    <Text style={styles.categoryBadge}>{guide.category}</Text>
                  </View>

                  {/* Title & Metadata */}
                  <Text style={[styles.articleTitle, isMobile && styles.articleTitlePhone]}>
                    {guide.title}
                  </Text>

                  <View style={styles.metaRow}>
                    {guide.publishedAt ? (
                      <View style={styles.metaItem}>
                        <Calendar color={colors.muted} size={14} />
                        <Text style={styles.metaItemText}>
                          {formatDate(guide.publishedAt)}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.metaItem}>
                      <Clock color={colors.muted} size={14} />
                      <Text style={styles.metaItemText}>{guide.readTime}</Text>
                    </View>
                  </View>

                  {/* Contextual Cover Image Banner */}
                  <View
                    style={[
                      styles.coverBannerWrap,
                      isMobile && styles.coverBannerWrapMobile,
                    ]}
                  >
                    <Image
                      source={{ uri: coverUri }}
                      style={styles.coverBannerImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                      onError={handleCoverError}
                    />
                  </View>

                  <View style={styles.divider} />

                  {/* Summary / Excerpt */}
                  <View style={styles.rssExcerptBox}>
                    <Text style={styles.rssExcerptHeading}>Report Summary</Text>
                    <Text style={styles.rssExcerptCopy}>{guide.excerpt}</Text>
                  </View>

                  {/* Outbound Link CTA */}
                  <View style={styles.externalCtaBox}>
                    <Text style={styles.externalCtaNotice}>
                      HomeNet respects publisher copyrights and syndicates headlines
                      only. You can read the complete, original report directly on the
                      publisher's website:
                    </Text>
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Read full article on ${guide.sourceName || "publisher"}`}
                      onPress={handleExternalRead}
                      style={({ pressed, hovered }: any) => [
                        styles.readExternalBtn,
                        hovered && styles.readExternalBtnHovered,
                        pressed && { opacity: 0.9 },
                        webPointer,
                      ]}
                    >
                      <Text style={styles.readExternalBtnText}>
                        Read Full Article on {guide.sourceName || "Publisher"}
                      </Text>
                      <ExternalLink color={colors.white} size={16} strokeWidth={2.2} />
                    </Pressable>
                  </View>

                  {/* Verified Property Search CTA */}
                  <View style={styles.verifiedCtaBanner}>
                    <View style={styles.verifiedCtaCopy}>
                      <Text style={styles.verifiedCtaTitle}>
                        Looking for verified property in Dhaka?
                      </Text>
                      <Text style={styles.verifiedCtaSub}>
                        Direct contact with owners, complete specs, and zero broker
                        commissions.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => router.push("/buy" as never)}
                      style={({ hovered }: any) => [
                        styles.verifiedCtaBtn,
                        hovered && { opacity: 0.9 },
                        webPointer,
                      ]}
                    >
                      <Text style={styles.verifiedCtaBtnText}>Browse Properties</Text>
                      <ArrowRight color={colors.ink} size={15} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                /* ------------------------------------------------------------
                   HOMENET IN-HOUSE GUIDE VIEW
                   Full markdown article reader, author metadata, and local CTAs.
                ------------------------------------------------------------ */
                <View style={[styles.articleCard, isMobile && styles.articleCardMobile]}>
                  {/* Header Metadata */}
                  <View style={styles.guideMetaTop}>
                    <View style={styles.homeNetBadge}>
                      <ShieldCheck color={colors.greenOnLight} size={13} />
                      <Text style={styles.homeNetBadgeText}>HomeNet Guide</Text>
                    </View>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryText}>{guide.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock color={colors.muted} size={14} />
                      <Text style={styles.metaItemText}>{guide.readTime}</Text>
                    </View>
                    {guide.publishedAt ? (
                      <View style={styles.metaItem}>
                        <Calendar color={colors.muted} size={14} />
                        <Text style={styles.metaItemText}>
                          {formatDate(guide.publishedAt)}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Article Title */}
                  <Text style={[styles.articleTitle, isMobile && styles.articleTitlePhone]}>
                    {guide.title}
                  </Text>

                  {/* Author Attribution Card */}
                  {guide.author ? (
                    <View style={styles.authorCard}>
                      <View style={styles.authorAvatar}>
                        <User color={colors.greenOnLight} size={20} />
                      </View>
                      <View style={styles.authorCopy}>
                        <Text style={styles.authorName}>{guide.author.name}</Text>
                        {guide.author.role ? (
                          <Text style={styles.authorRole}>{guide.author.role}</Text>
                        ) : null}
                      </View>
                    </View>
                  ) : null}

                  {/* Contextual Cover Image Banner */}
                  <View
                    style={[
                      styles.coverBannerWrap,
                      isMobile && styles.coverBannerWrapMobile,
                    ]}
                  >
                    <Image
                      source={{ uri: coverUri }}
                      style={styles.coverBannerImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                      onError={handleCoverError}
                    />
                  </View>

                  <View style={styles.divider} />

                  {/* Markdown Body Content */}
                  <View style={styles.markdownWrapper}>
                    <MarkdownRenderer
                      content={guide.contentMarkdown || guide.excerpt}
                    />
                  </View>

                  {/* Tags Footer */}
                  {guide.tags && guide.tags.length > 0 ? (
                    <View style={styles.tagWrap}>
                      <Text style={styles.tagWrapLabel}>Tags:</Text>
                      {guide.tags.map((tag) => (
                        <View key={tag} style={styles.tagPill}>
                          <Text style={styles.tagPillText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* HomeNet Market Action CTA Banner */}
                  <View style={styles.verifiedCtaBanner}>
                    <View style={styles.verifiedCtaCopy}>
                      <Text style={styles.verifiedCtaTitle}>
                        Ready to explore properties in Bangladesh?
                      </Text>
                      <Text style={styles.verifiedCtaSub}>
                        Search thousands of verified flats, houses, and plots with
                        direct owner contacts and zero intermediary fees.
                      </Text>
                    </View>
                    <View style={styles.ctaButtonGroup}>
                      <Pressable
                        onPress={() => router.push("/buy" as never)}
                        style={({ hovered }: any) => [
                          styles.verifiedCtaBtn,
                          hovered && { opacity: 0.9 },
                          webPointer,
                        ]}
                      >
                        <Text style={styles.verifiedCtaBtnText}>Browse Properties</Text>
                        <ArrowRight color={colors.ink} size={15} />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push("/property/create" as never)}
                        style={({ hovered }: any) => [
                          styles.secondaryCtaBtn,
                          hovered && { opacity: 0.9 },
                          webPointer,
                        ]}
                      >
                        <Text style={styles.secondaryCtaBtnText}>List Property Free</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Sidebar Column (Desktop sticky or Mobile bottom stack) */}
            <View
              style={[
                styles.sidebarColumn,
                isMobile && styles.sidebarColumnMobile,
              ]}
            >
              {/* Overview & Quick Facts Card */}
              <View style={styles.sidebarCard}>
                <View style={styles.sidebarCardHeader}>
                  <Layers color={colors.greenOnLight} size={18} />
                  <Text style={styles.sidebarCardTitle}>Guide Overview</Text>
                </View>
                <View style={styles.factList}>
                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Category</Text>
                    <Text style={styles.factValue}>{guide.category}</Text>
                  </View>
                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Reading Time</Text>
                    <Text style={styles.factValue}>{guide.readTime}</Text>
                  </View>
                  {guide.publishedAt ? (
                    <View style={styles.factRow}>
                      <Text style={styles.factLabel}>Published</Text>
                      <Text style={styles.factValue}>
                        {formatDate(guide.publishedAt)}
                      </Text>
                    </View>
                  ) : null}
                  {guide.updatedAt ? (
                    <View style={styles.factRow}>
                      <Text style={styles.factLabel}>Last reviewed</Text>
                      <Text style={styles.factValue}>
                        {formatDate(guide.updatedAt)}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Source</Text>
                    <Text style={styles.factValue}>
                      {isRss ? guide.sourceName || "External News" : "HomeNet Research"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Related Guides Card */}
              {relatedGuides.length > 0 ? (
                <View style={styles.sidebarCard}>
                  <View style={styles.sidebarCardHeader}>
                    <BookOpen color={colors.greenOnLight} size={18} />
                    <Text style={styles.sidebarCardTitle}>Related Insights</Text>
                  </View>
                  <View style={styles.relatedList}>
                    {relatedGuides.map((relGuide) => (
                      <RelatedGuideMiniItem key={relGuide.id} guide={relGuide} />
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Quick Action Finder Card */}
              <View style={styles.sidebarActionCard}>
                <View style={styles.actionIconBox}>
                  <Sparkles color="#FFFFFF" size={20} />
                </View>
                <Text style={styles.actionCardTitle}>Need Property Guidance?</Text>
                <Text style={styles.actionCardCopy}>
                  Browse 100% verified flats and plots across Dhaka with direct owner
                  contacts.
                </Text>
                <Pressable
                  onPress={() => router.push("/buy" as never)}
                  style={({ hovered }: any) => [
                    styles.actionBtn,
                    hovered && { opacity: 0.9 },
                    webPointer,
                  ]}
                >
                  <Text style={styles.actionBtnText}>Explore Listings</Text>
                  <ArrowRight color={colors.ink} size={14} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 80,
  },
  containerWide: {
    paddingHorizontal: 48,
  },
  containerPhone: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  backBtnText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  shareBtnText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },

  /* Responsive 2-Column Grid */
  layoutGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 36,
    width: "100%",
  },
  layoutGridMobile: {
    flexDirection: "column",
    gap: 24,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    width: "100%",
  },
  sidebarColumn: {
    width: 380,
    gap: 24,
    ...(Platform.OS === "web"
      ? {
          position: "sticky" as any,
          top: 96,
        }
      : {}),
  },
  sidebarColumnMobile: {
    width: "100%",
    position: "relative" as any,
    top: 0,
  },

  /* Article Wrapper */
  articleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 40,
    width: "100%",
    ...shadow,
  },
  articleCardMobile: {
    padding: 18,
    borderRadius: radius.md,
  },
  guideMetaTop: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  homeNetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.greenLight,
  },
  homeNetBadgeText: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
  },
  categoryText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaItemText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  articleTitle: {
    color: colors.ink,
    fontFamily: fonts.headingExtraBold,
    fontSize: 34,
    lineHeight: 44,
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  articleTitlePhone: {
    fontSize: 23,
    lineHeight: 31,
    letterSpacing: -0.4,
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  authorCopy: {
    gap: 2,
  },
  authorName: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  authorRole: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },

  /* Cinematic Cover Banner Image */
  coverBannerWrap: {
    width: "100%",
    height: 440,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.soft,
    marginVertical: 20,
    ...shadow,
  },
  coverBannerWrapMobile: {
    height: 240,
    marginVertical: 14,
  },
  coverBannerImage: {
    width: "100%",
    height: "100%",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 20,
  },
  markdownWrapper: {
    width: "100%",
    marginBottom: 28,
  },
  tagWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginBottom: 32,
  },
  tagWrapLabel: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
  },
  tagPillText: {
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 12,
  },

  /* Sidebar Styles */
  sidebarCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    gap: 16,
    ...shadow,
  },
  sidebarCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sidebarCardTitle: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 16,
  },
  factList: {
    gap: 12,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  factLabel: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
  },
  factValue: {
    color: colors.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
  },

  /* Related Guides List in Sidebar */
  relatedList: {
    gap: 14,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: "#FAFBFB",
  },
  relatedItemHovered: {
    backgroundColor: colors.soft,
  },
  relatedThumb: {
    width: 68,
    height: 52,
    borderRadius: radius.xs,
    overflow: "hidden",
    backgroundColor: colors.soft,
    flexShrink: 0,
  },
  relatedThumbImg: {
    width: "100%",
    height: "100%",
  },
  relatedContent: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  relatedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  relatedCategory: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  relatedDot: {
    color: colors.muted,
    fontSize: 10,
  },
  relatedReadTime: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  relatedTitle: {
    color: colors.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Sidebar Action Card */
  sidebarActionCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    padding: 24,
    gap: 12,
    ...shadow,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardTitle: {
    color: colors.white,
    fontFamily: fonts.headingBold,
    fontSize: 16,
  },
  actionCardCopy: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  actionBtnText: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 13,
  },

  /* Syndicated / RSS Styles */
  syndicationBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  syndicationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  syndicationPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "rgba(34,81,214,0.16)",
  },
  syndicationPillText: {
    color: "#1D4ED8",
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  syndicationNotice: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  publisherHighlight: {
    color: colors.ink,
    fontFamily: fonts.bold,
  },
  categoryBadge: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  rssExcerptBox: {
    backgroundColor: colors.soft,
    borderRadius: radius.md,
    padding: 20,
    marginVertical: 12,
    gap: 8,
  },
  rssExcerptHeading: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  rssExcerptCopy: {
    color: "#2C3E38",
    fontFamily: fonts.regular,
    fontSize: 15.5,
    lineHeight: 25,
  },
  externalCtaBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 24,
    gap: 16,
    marginVertical: 16,
    alignItems: "flex-start",
  },
  externalCtaNotice: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  readExternalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: radius.sm,
    backgroundColor: "#1D4ED8",
  },
  readExternalBtnHovered: {
    backgroundColor: "#1E40AF",
  },
  readExternalBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },

  /* Verified Properties Bottom Banner */
  verifiedCtaBanner: {
    marginTop: 24,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  verifiedCtaCopy: {
    flex: 1,
    minWidth: 260,
    gap: 4,
  },
  verifiedCtaTitle: {
    color: colors.white,
    fontFamily: fonts.headingBold,
    fontSize: 17,
  },
  verifiedCtaSub: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  ctaButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  verifiedCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
  },
  verifiedCtaBtnText: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  secondaryCtaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  secondaryCtaBtnText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  /* States */
  stateBox: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  notFoundPanel: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 48,
    alignItems: "center",
    gap: 12,
  },
  notFoundTitle: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 20,
  },
  notFoundCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 400,
  },
  primaryActionBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
  },
  primaryActionBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});

