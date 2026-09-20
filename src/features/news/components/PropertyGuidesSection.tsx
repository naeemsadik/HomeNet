import { ArrowRight, BookOpen, ImageOff } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, radius, webPointer } from "@/theme";
import { usePropertyGuides } from "../hooks/usePropertyGuides";
import type { PropertyGuide } from "../types/news";

/** Topics the section will carry once the guides source is connected. */
const PLANNED_TOPICS = [
  "Registering a property for the first time",
  "What to check before you buy",
  "What to check before you rent",
  "Understanding katha, bigha and sqft",
];

function GuideCard({ guide, featured }: { guide: PropertyGuide; featured?: boolean }) {
  const { isPhone } = useResponsive();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${guide.category}: ${guide.title}`}
      onPress={() => router.push(guide.href as never)}
      style={({ pressed, hovered }: any) => [
        styles.card,
        featured && !isPhone && styles.cardFeatured,
        hovered && styles.cardHovered,
        webPointer,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.thumb, featured && !isPhone && styles.thumbFeatured]}>
        {guide.imageUrl ? (
          <Image
            source={{ uri: guide.imageUrl }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <ImageOff color={colors.muted} size={20} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
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
          <Text numberOfLines={2} style={styles.cardExcerpt}>
            {guide.excerpt}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function PropertyGuidesSection() {
  const { isPhone, isTablet } = useResponsive();
  const { data, isLoading, isError } = usePropertyGuides(4);

  const items = data?.items ?? [];
  const [lead, ...rest] = items;

  return (
    <View style={styles.section}>
      <View style={[styles.header, isPhone && styles.headerPhone]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Guides & insights</Text>
          <Text style={[styles.title, isPhone && styles.titlePhone]}>
            Property advice for Bangladesh
          </Text>
        </View>

        {items.length > 0 ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/about" as never)}
            style={({ hovered }: any) => [styles.seeAll, hovered && { opacity: 0.7 }, webPointer]}
          >
            <Text style={styles.seeAllText}>See all guides</Text>
            <ArrowRight color={colors.greenOnLight} size={15} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.green} size="small" />
        </View>
      ) : isError || items.length === 0 ? (
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
    marginBottom: 20,
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
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.greenLight,
  },
  categoryText: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
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
