import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  LandPlot,
  RotateCcw,
} from "lucide-react-native";
import { memo, useMemo, useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
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
import { colors, webPointer } from "@/theme";
import { HERO_IMAGE_URL } from "@/lib/heroImage";
import { styles } from "./HomeScreen.styles";



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

  const popularItems = popularQuery.data?.data?.items;
  // Stable reference so the memoized rail skips unrelated re-renders.
  const featuredProperties = useMemo(() => (popularItems ?? []).slice(0, 6), [popularItems]);
  const popularError = popularQuery.error ? toApiError(popularQuery.error).message : null;


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
          <FeaturedRail properties={featuredProperties} />
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

/**
 * The featured carousel owns its scroll state so scrolling re-renders only
 * the rail, not the whole home page.
 */
const FeaturedRail = memo(function FeaturedRail({ properties }: { properties: ApiProperty[] }) {
  const { isPhone, isTablet, width } = useResponsive();
  const featuredScrollRef = useRef<FlatList<ApiProperty>>(null);
  const featuredWrapperRef = useRef<View>(null);
  const [featuredScrollX, setFeaturedScrollX] = useState(0);
  const [trackWidth, setTrackWidth] = useState(200);
  // Sizes change on layout, not on scroll, so they are measured there.
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const maxFeaturedScroll =
    containerWidth > 0 && contentWidth > 0
      ? Math.max(1, contentWidth - containerWidth)
      : 200;

  const currentScrollXRef = useRef(0);
  const maxScrollRef = useRef(maxFeaturedScroll);
  maxScrollRef.current = maxFeaturedScroll;
  const isWheelScrollingRef = useRef(false);

  const cardStep = isPhone ? Math.min(width - 32, 340) + 20 : isTablet ? 440 : 540;

  const handleFeaturedScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    currentScrollXRef.current = x;
    setFeaturedScrollX(x);
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
    featuredScrollRef.current?.scrollToOffset({ offset: targetX, animated: true });
  };

  const handleTrackPress = (e: any) => {
    if (maxFeaturedScroll <= 0 || trackWidth <= 0) return;
    const clickX = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, clickX / trackWidth));
    const targetX = ratio * maxFeaturedScroll;
    currentScrollXRef.current = targetX;
    featuredScrollRef.current?.scrollToOffset({ offset: targetX, animated: true });
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
      featuredScrollRef.current?.scrollToOffset({ offset: nextTarget, animated: true });

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
  }, [cardStep, properties.length]);

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
    <View ref={featuredWrapperRef} style={styles.featuredWrapper}>
      <FlatList
        ref={featuredScrollRef}
        horizontal
        data={properties}
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
      {properties.length > 1 && (
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
  );
});
