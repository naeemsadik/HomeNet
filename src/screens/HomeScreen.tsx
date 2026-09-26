import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  LandPlot,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import { PropertyCard } from "@/components/PropertyCard";
import { OwnerListPropertySection } from "@/components/OwnerListPropertySection";
import { AppButton, AppLink } from "@/components/ui";
import { AiFlagshipSection } from "@/components/landing/AiFlagshipSection";
import { ContrastColumns } from "@/components/landing/ContrastColumns";
import { HeroProductVisual } from "@/components/landing/HeroProductVisual";
import { JourneyTrack } from "@/components/landing/JourneyTrack";
import { PropertyGuidesSection } from "@/features/news/components/PropertyGuidesSection";
import type { Property as ApiProperty } from "@/features/property/types/property";
import { useResponsive } from "@/hooks/useResponsive";
import { toApiError } from "@/services/apiClient";
import { getProperties } from "@/services/propertyApi";
import { colors, fonts, layout, webPointer } from "@/theme";
import { HERO_IMAGE_URL } from "@/lib/heroImage";



/**
 * Hero photograph — placeholder until real imagery is shot.
 *
 * Replace with a HomeNet-owned photo of a Bangladeshi interior. Spec: landscape,
 * min 2400×1400, a lived-in room (not an exterior tower), natural daylight, with
 * the left-to-centre area uncluttered so the headline sits on calm pixels.
 */
const HERO_IMAGE = { uri: HERO_IMAGE_URL };

function PropertyResult({
  children,
  empty,
  error,
  loading,
  onRetry,
}: {
  children: ReactNode;
  empty: boolean;
  error: string | null;
  loading: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.requestState}>
        <ActivityIndicator color={colors.green} size="large" />
        <Text style={styles.requestStateCopy}>Loading properties...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.requestState}>
        <Text style={styles.requestStateTitle}>Could not load properties</Text>
        <Text style={styles.requestStateCopy}>Something went wrong while loading listings. Please try again.</Text>
        <AppButton icon={RotateCcw} label="Retry" onPress={onRetry} />
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.requestState}>
        <LandPlot color={colors.green} size={26} />
        <Text style={styles.requestStateTitle}>No properties available</Text>
        <Text style={styles.requestStateCopy}>Check again when new listings are published.</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export function HomeScreen() {
  const {
    isPhone,
    isTablet,
    isCompact,
    isDesktop,
    isWide,
    isUltrawide,
    isLargeScreen,
    isTall,
    width,
    height,
  } = useResponsive();

  // Hero scales seamlessly across mobile, tablet, laptop, large desktop, and ultrawide:
  const heroType = isPhone
    ? { fontSize: 34, lineHeight: 39, letterSpacing: -0.7 }
    : isTablet
      ? { fontSize: 42, lineHeight: 47, letterSpacing: -1.0 }
      : isCompact
        ? { fontSize: 50, lineHeight: 56, letterSpacing: -1.3 }
        : isUltrawide
          ? { fontSize: 72, lineHeight: 80, letterSpacing: -2.0 }
          : isWide
            ? { fontSize: 66, lineHeight: 74, letterSpacing: -1.8 }
            : { fontSize: 60, lineHeight: 68, letterSpacing: -1.6 };

  // Viewport-aware hero metrics that scale with screen height and width:
  // On laptops (height ~750), minHeight ~600 keeps the search dock right at the fold.
  // On large 1080p/1440p monitors (height 900-1200+), minHeight scales proportionally to maintain
  // the architectural photo's aspect ratio without squishing and prevents the next section from peeking halfway.
  const heroMetrics = isPhone
    ? { minHeight: 416, dockOffset: -56, copyPad: 64, topPad: 60 }
    : isTablet
      ? { minHeight: 494, dockOffset: -64, copyPad: 78, topPad: 68 }
      : isCompact
        ? { minHeight: 560, dockOffset: -80, copyPad: 88, topPad: 72 }
        : isLargeScreen || isTall
          ? {
              minHeight: Math.max(680, Math.min(840, Math.round(height * 0.72))),
              dockOffset: -104,
              copyPad: 110,
              topPad: 88,
            }
          : {
              minHeight: Math.max(580, Math.min(640, Math.round(height * 0.68))),
              dockOffset: -88,
              copyPad: 96,
              topPad: 76,
            };
  const popularQuery = useQuery({
    queryKey: ["properties", "home", "popular"],
    queryFn: () =>
      getProperties({ status: "active", sort_by: "view_count_desc", page: 1, limit: 10 }),
  });

  const popularProperties = popularQuery.data?.data?.items ?? [];
  const featuredProperties = popularProperties.slice(0, 6);
  const popularError = popularQuery.error ? toApiError(popularQuery.error).message : null;

  const featuredScrollRef = useRef<ScrollView>(null);
  const featuredWrapperRef = useRef<View>(null);
  const [featuredScrollX, setFeaturedScrollX] = useState(0);
  const [maxFeaturedScroll, setMaxFeaturedScroll] = useState(200);
  const [trackWidth, setTrackWidth] = useState(200);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const currentScrollXRef = useRef(0);
  const maxScrollRef = useRef(200);
  const isWheelScrollingRef = useRef(false);

  const cardStep = isPhone ? Math.min(width - 32, 340) + 20 : isTablet ? 440 : 540;

  const handleFeaturedScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const max = Math.max(1, contentSize.width - layoutMeasurement.width);
    setMaxFeaturedScroll(max);
    maxScrollRef.current = max;
    setFeaturedScrollX(contentOffset.x);
    currentScrollXRef.current = contentOffset.x;
    setContainerWidth(layoutMeasurement.width);
    setContentWidth(contentSize.width);
  };

  const featuredProgress = Math.max(
    0,
    Math.min(1, maxFeaturedScroll > 0 ? featuredScrollX / maxFeaturedScroll : 0)
  );
  const canScrollLeft = featuredScrollX > 6;
  const canScrollRight = featuredScrollX < maxFeaturedScroll - 6;
  const calculatedThumb =
    contentWidth > 0 && containerWidth > 0
      ? (containerWidth / contentWidth) * 100
      : 30;
  const thumbPercent = Math.max(22, Math.min(42, calculatedThumb));

  const scrollFeatured = (direction: "left" | "right") => {
    const currentX = currentScrollXRef.current;
    const targetX =
      direction === "left"
        ? Math.max(0, currentX - cardStep)
        : Math.min(maxFeaturedScroll, currentX + cardStep);
    currentScrollXRef.current = targetX;
    featuredScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleTrackPress = (e: any) => {
    if (maxFeaturedScroll <= 0 || trackWidth <= 0) return;
    const clickX = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, clickX / trackWidth));
    const targetX = ratio * maxFeaturedScroll;
    currentScrollXRef.current = targetX;
    featuredScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const getDomNode = (refObj: any) => {
      if (!refObj) return null;
      if (refObj instanceof HTMLElement) return refObj;
      if (typeof refObj.getScrollableNode === "function") return refObj.getScrollableNode();
      if (typeof refObj.getInnerViewNode === "function") return refObj.getInnerViewNode();
      if (refObj._node instanceof HTMLElement) return refObj._node;
      return null;
    };

    const targetNode = getDomNode(featuredWrapperRef.current);
    if (!targetNode || typeof targetNode.addEventListener !== "function") return;

    let wheelTimer: any = null;

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 8) return;

      const direction = delta > 0 ? "right" : "left";
      const currentX = currentScrollXRef.current;
      const maxScroll = maxScrollRef.current;

      // Allow natural page vertical scroll if user has reached boundary:
      if (direction === "left" && currentX <= 6) return;
      if (direction === "right" && currentX >= maxScroll - 6) return;

      // Intercept scroll wheel over featured section
      e.preventDefault();

      if (isWheelScrollingRef.current) return;
      isWheelScrollingRef.current = true;

      const nextTarget =
        direction === "right"
          ? Math.min(maxScroll, Math.floor((currentX + 30) / cardStep + 1) * cardStep)
          : Math.max(0, Math.ceil((currentX - 30) / cardStep - 1) * cardStep);

      currentScrollXRef.current = nextTarget;
      featuredScrollRef.current?.scrollTo({ x: nextTarget, animated: true });

      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        isWheelScrollingRef.current = false;
      }, 320);
    };

    targetNode.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      targetNode.removeEventListener("wheel", onWheel);
      clearTimeout(wheelTimer);
    };
  }, [cardStep, featuredProperties.length]);

  const hero = (
      <View style={styles.heroBlock}>
        <View style={[styles.heroPhoto, { minHeight: heroMetrics.minHeight }]}>
          <ImageBackground
            source={HERO_IMAGE}
            style={[
              styles.heroBg,
              { minHeight: heroMetrics.minHeight, paddingTop: heroMetrics.topPad },
            ]}
            resizeMode="cover"
          >
            {/* Scrim only deep enough to carry white type — the room stays visible. */}
            <LinearGradient
              colors={[
                "rgba(6, 22, 18, 0.58)",
                "rgba(6, 22, 18, 0.20)",
                "rgba(6, 22, 18, 0.34)",
              ]}
              locations={[0, 0.52, 1]}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                styles.heroCopy,
                isPhone && styles.heroCopyPhone,
                isLargeScreen && styles.heroCopyLarge,
                { paddingBottom: heroMetrics.copyPad },
              ]}
            >
              <Text style={[styles.heroHeading, heroType]}>
                Find a home you can trust
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={[styles.dockGutter, isPhone && styles.dockGutterPhone]}>
        <View
          style={[
            styles.searchDock,
            isPhone && styles.searchDockPhone,
            isLargeScreen && styles.searchDockLarge,
            { marginTop: heroMetrics.dockOffset },
          ]}
        >
          <HeroSearchWidget docked />

          <View style={[styles.ownerBand, isPhone && styles.ownerBandPhone]}>
            <View style={styles.ownerCopy}>
              <Text style={styles.ownerTitle}>Listing your own property?</Text>
              <Text style={styles.ownerSub}>
                Describe it in one sentence — HomeNet fills in the rest.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="List your property"
              onPress={() => router.push("/property/create" as never)}
              style={({ hovered, pressed }: any) => [
                styles.ownerCta,
                isPhone && styles.ownerCtaPhone,
                hovered && styles.ownerCtaHovered,
                pressed && { opacity: 0.9 },
                webPointer,
              ]}
            >
              <Text style={styles.ownerCtaText}>List your property</Text>
            </Pressable>
          </View>
        </View>
        </View>
      </View>


  );

  const renderFeaturedItem = useCallback(
    ({ item }: { item: ApiProperty }) => (
      <PropertyCard
        property={item}
        variant="feature"
        width={isPhone ? Math.min(width - 32, 340) : isTablet ? 420 : 500}
      />
    ),
    [isPhone, isTablet, width]
  );

  const featuredKeyExtractor = useCallback((item: ApiProperty) => item.id, []);

  const getFeaturedItemLayout = useCallback(
    (_: any, index: number) => {
      const cardWidth = isPhone ? Math.min(width - 32, 340) : isTablet ? 420 : 500;
      const step = cardWidth + 20;
      return {
        length: step,
        offset: step * index,
        index,
      };
    },
    [isPhone, isTablet, width]
  );

  return (
    <AppChrome active="home" bleed={hero}>
      {/* ─────────────────────────────────────────────────────────────
          2. PRODUCT VISUAL — browser + phone preview of real listings
      ───────────────────────────────────────────────────────────── */}
      <HeroProductVisual />

      {/* ─────────────────────────────────────────────────────────────
          3. FEATURED PROPERTIES (live API)
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured properties</Text>
            <Text style={styles.sectionSubtitle}>Most viewed active listings</Text>
          </View>
          <AppLink href="/buy" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color={colors.greenOnLight} size={16} />
          </AppLink>
        </View>

        <PropertyResult
          empty={!featuredProperties.length}
          error={popularError}
          loading={popularQuery.isLoading}
          onRetry={() => void popularQuery.refetch()}
        >
          <View ref={featuredWrapperRef} style={styles.featuredWrapper}>
            <FlatList
              ref={featuredScrollRef as any}
              horizontal
              data={featuredProperties}
              renderItem={renderFeaturedItem}
              keyExtractor={featuredKeyExtractor}
              getItemLayout={getFeaturedItemLayout}
              initialNumToRender={6}
              maxToRenderPerBatch={8}
              windowSize={5}
              showsHorizontalScrollIndicator={false}
              onScroll={handleFeaturedScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.featuredCardsRow}
            />

            {/* Position Bar for Left-Right Move (Both Mobile & PC) */}
            {featuredProperties.length > 1 && (
              <View style={styles.featuredPositionBarWrap}>
                <Pressable
                  onPress={() => scrollFeatured("left")}
                  disabled={!canScrollLeft}
                  style={({ pressed }) => [
                    styles.scrollArrowBtn,
                    !canScrollLeft && styles.scrollArrowBtnDisabled,
                    pressed && canScrollLeft && styles.scrollArrowBtnPressed,
                    webPointer,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Previous featured property"
                >
                  <ChevronLeft size={16} color={canScrollLeft ? colors.green : "#94A3B8"} strokeWidth={2.5} />
                </Pressable>

                <Pressable
                  onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                  onPress={handleTrackPress}
                  style={[styles.featuredPositionTrack, isPhone && styles.featuredPositionTrackPhone, webPointer]}
                  accessibilityRole="progressbar"
                  accessibilityLabel="Featured properties position bar"
                >
                  <View
                    style={[
                      styles.featuredPositionThumb,
                      {
                        left: `${featuredProgress * (100 - thumbPercent)}%`,
                        width: `${thumbPercent}%`,
                      },
                    ]}
                  />
                </Pressable>

                <Pressable
                  onPress={() => scrollFeatured("right")}
                  disabled={!canScrollRight}
                  style={({ pressed }) => [
                    styles.scrollArrowBtn,
                    !canScrollRight && styles.scrollArrowBtnDisabled,
                    pressed && canScrollRight && styles.scrollArrowBtnPressed,
                    webPointer,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Next featured property"
                >
                  <ChevronRight size={16} color={canScrollRight ? colors.green : "#94A3B8"} strokeWidth={2.5} />
                </Pressable>
              </View>
            )}
          </View>
        </PropertyResult>
      </View>



      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS — dual seeker / owner track
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>A clear path for both sides</Text>
        </View>
        <JourneyTrack />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          5. TRUST — the problem (Why HomeNet listings are different)
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Why HomeNet listings are different</Text>
        </View>
        <ContrastColumns />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          6. AI LISTING — describe it, HomeNet fills the fields
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <AiFlagshipSection />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          7. OWNER CTA — list your property
      ───────────────────────────────────────────────────────────── */}
      <OwnerListPropertySection />

      {/* ─────────────────────────────────────────────────────────────
          8. GUIDES & INSIGHTS — editorial, API-ready
      ───────────────────────────────────────────────────────────── */}
      <PropertyGuidesSection />


    </AppChrome>
  );
}

const styles = StyleSheet.create({
  sectionSpacing: {
    marginTop: 40,
    width: "100%",
  },
  sectionGap: {
    height: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeaderInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },

  seeAllLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  /* 1. Hero Section */
  heroBlock: {
    width: "100%",
  },
  // Full-bleed: the photograph runs edge to edge, outside the page container.
  heroPhoto: {
    width: "100%",
    overflow: "hidden",
    minHeight: 520,
  },
  heroBg: {
    width: "100%",
    minHeight: 520,
    justifyContent: "center",
  },
  heroCopy: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  heroCopyLarge: {
    maxWidth: 1100,
  },
  heroCopyPhone: {
    paddingHorizontal: 16,
    paddingBottom: 72,
  },
  // Display weight is light on purpose: the photograph carries the volume.
  heroHeading: {
    color: "#FFFFFF",
    fontFamily: fonts.headingSemiBold,
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -1.6,
    textAlign: "center",
  },

  // The dock sits back inside the page gutter even though the photo does not.
  dockGutter: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: layout.gutter,
  },
  dockGutterPhone: {
    paddingHorizontal: layout.gutterPhone,
  },

  // The dock owns radius + shadow; the widget inside runs flush.
  searchDock: {
    width: "100%",
    maxWidth: 940,
    marginTop: -88,
    borderRadius: 16,
    overflow: "hidden",
    ...(Platform.select({
      web: { boxShadow: "0 28px 64px -24px rgba(11, 26, 23, 0.34)" },
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 22 },
        shadowOpacity: 0.26,
        shadowRadius: 48,
        elevation: 16,
      },
    }) as any),
  },
  searchDockLarge: {
    maxWidth: 1060,
    borderRadius: 20,
  },
  searchDockPhone: {
    marginTop: -56,
    borderRadius: 12,
  },

  ownerBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    paddingHorizontal: 28,
    paddingVertical: 20,
    backgroundColor: colors.ink,
  },
  ownerBandPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  ownerCopy: { flexShrink: 1, gap: 3 },
  ownerTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 17,
  },
  ownerSub: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  ownerCta: {
    flexShrink: 0,
    height: 46,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  ownerCtaPhone: { height: 44 },
  ownerCtaHovered: { backgroundColor: "rgba(255, 255, 255, 0.88)" },
  ownerCtaText: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 15,
  },




  /* 3. Featured Properties */
  featuredWrapper: {
    width: "100%",
  },
  featuredCardsRow: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  featuredCard: {
    width: 520,
    height: 325,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#EEF3F1",
    ...(Platform.OS === "web" ? {
      transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease",
    } : {}),
  },
  featuredCardInner: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  featuredCardHovered: {
    transform: [{ translateY: -4 }, { scale: 1.01 }],
    shadowColor: "rgba(4, 207, 146, 0.3)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  featuredCardBg: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    padding: 16,
    ...(Platform.OS === "web" ? {
      transition: "transform 0.35s ease",
    } : {}),
  },
  featuredCardBgHovered: {
    transform: [{ scale: 1.035 }],
  },
  featuredCardPlaceholder: {
    backgroundColor: "#EEF3F1",
  },
  featuredPlaceholderIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTopBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredVerifiedText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredInvestmentBadge: {
    backgroundColor: "#FDEEE2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredInvestmentText: {
    color: "#F4823A",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredBottomDetails: {
    gap: 2,
  },
  featuredLocation: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
  },
  featuredPrice: {
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginTop: 2,
  },
  featuredTextDark: {
    color: "#0B1A17",
  },

  /* Position Bar for Featured Properties (Both Mobile & PC) */
  featuredPositionBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  featuredPositionTrack: {
    flex: 1,
    maxWidth: 220,
    height: 6,
    backgroundColor: "#DFEAE4",
    borderRadius: 999,
    position: "relative",
    overflow: "hidden",
  },
  featuredPositionTrackPhone: {
    maxWidth: 160,
  },
  featuredPositionThumb: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: colors.green,
    borderRadius: 999,
  },
  scrollArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D3DFD8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollArrowBtnDisabled: {
    opacity: 0.35,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  scrollArrowBtnPressed: {
    backgroundColor: "#EAF7F1",
    transform: [{ scale: 0.93 }],
  },


  requestState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 28,
    borderRadius: 16,
    backgroundColor: "#F8FBF9",
    borderWidth: 1,
    borderColor: "#DDE8E3",
  },
  requestStateTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 16,
    textAlign: "center",
  },
  requestStateCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },



  /* 10. Market Insights & Trusted Partners */
  twoColSection: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  twoColSectionTablet: {
    flexDirection: "column",
  },
  marketInsightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24.8,
  },
  chartWrapper: {
    marginTop: 16,
    width: "100%",
  },

  trustedPartnersCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24.8,
  },
  partnersList: {
    gap: 12,
    marginTop: 8,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 12,
  },
  partnerInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  partnerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerAvatarText: {
    color: "#2251D6",
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  partnerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partnerNameText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  partnerDealsText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  partnerViewBtn: {
    paddingHorizontal: 12.8,
    paddingVertical: 6.8,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    backgroundColor: "#FFFFFF",
  },
  partnerViewBtnText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },

  /* 11. Latest Property News */
  newsGrid: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    alignItems: "flex-start",
  },
  newsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  newsGridPhone: {
    flexDirection: "column",
    gap: 14,
    alignItems: "stretch",
  },
  newsCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    padding: 0.8,
  },
  newsCardTablet: {
    flex: 0,
    flexBasis: "48.5%",
    minWidth: "48.5%",
    maxWidth: "48.5%",
  },
  newsCardPhone: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    borderRadius: 16,
  },
  newsImageWrap: {
    height: 157,
    backgroundColor: "#F4F6F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsBody: {
    padding: 16,
    gap: 8,
  },
  newsTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newsTagPill: {
    backgroundColor: "#E8EEFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newsTagPillText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  newsTimeText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  newsTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
