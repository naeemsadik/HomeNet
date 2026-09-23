import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  RotateCcw,
  Share2,
  ShieldCheck,
  User,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, radius, shadow, webPointer } from "@/theme";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { usePropertyGuide } from "../hooks/usePropertyGuides";

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

export function GuideDetailScreen({ slug }: GuideDetailScreenProps) {
  const { isPhone, isTablet } = useResponsive();
  const { data: guide, isLoading, isError, refetch } = usePropertyGuide(slug);

  const isRss = guide?.sourceType === "rss";

  const handleExternalRead = () => {
    if (!guide?.sourceUrl && !guide?.href) return;
    const url = guide.sourceUrl || guide.href;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      void Linking.openURL(url);
    }
  };

  const handleShare = () => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <AppChrome active="home">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
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
        ) : isRss ? (
          /* ============================================================
             EXTERNAL RSS ARTICLE VIEW
             Displays verified excerpt, metadata, publisher disclaimer,
             and prominent outbound link. Never claims ownership.
          ============================================================ */
          <View style={styles.articleCard}>
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
            <Text style={[styles.articleTitle, isPhone && styles.articleTitlePhone]}>
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

            {/* HomeNet Verified Listing CTA */}
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
          /* ============================================================
             HOMENET IN-HOUSE GUIDE VIEW
             Full markdown article reader, author metadata, and local CTAs.
          ============================================================ */
          <View style={styles.articleCard}>
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
            <Text style={[styles.articleTitle, isPhone && styles.articleTitlePhone]}>
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
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    paddingTop: 28,
    paddingBottom: 80,
  },
  containerPhone: {
    paddingTop: 16,
    paddingBottom: 48,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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

  /* Article Wrapper */
  articleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 36,
    ...shadow,
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
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  articleTitlePhone: {
    fontSize: 24,
    lineHeight: 32,
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
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
    marginTop: 20,
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
