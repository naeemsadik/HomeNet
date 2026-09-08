import { LinearGradient } from "expo-linear-gradient";
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
import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  ActivityIndicator,
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
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { AppChrome } from "@/components/AppChrome";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import { AppButton, AppLink } from "@/components/ui";
import {
  latestNews,
  trustedPartners,
} from "@/data/properties";
import type { Property as ApiProperty } from "@/features/property/types/property";
import { useResponsive } from "@/hooks/useResponsive";
import { toApiError } from "@/services/apiClient";
import { getProperties } from "@/services/propertyApi";
import { colors, fonts, webPointer } from "@/theme";



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
        <Text style={styles.requestStateCopy}>{error}</Text>
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

function FeaturedPropertyCard({ property, width }: { property: ApiProperty; width?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const imageMedia = property.media?.find((media) => media.media_type === "image") ?? property.media?.[0];
  const image = imageMedia?.url;
  const location =
    [property.area?.name, property.area?.city].filter(Boolean).join(", ") ||
    property.address ||
    "Location unavailable";
  const contents = (
    <>
      {image ? (
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.0)", "rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.7)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.featuredPlaceholderIcon}>
          <LandPlot color="#6B7D78" size={40} />
        </View>
      )}
      <View style={styles.featuredTopBadges}>
        {property.is_verified ? (
          <View style={styles.featuredVerifiedBadge}>
            <ShieldCheck color="#04cf92" size={14} />
            <Text style={styles.featuredVerifiedText}>Verified</Text>
          </View>
        ) : <View />}
        {property.view_count > 0 ? (
          <View style={styles.featuredInvestmentBadge}>
            <Text style={styles.featuredInvestmentText}>{property.view_count} views</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.featuredBottomDetails}>
        <Text style={[styles.featuredLocation, !image && styles.featuredTextDark]}>{location}</Text>
        <Text style={[styles.featuredTitle, !image && styles.featuredTextDark]}>{property.title}</Text>
        <Text style={[styles.featuredPrice, !image && styles.featuredTextDark]}>
          {property.price_currency || "BDT"} {property.price.toLocaleString()}
          {property.listing_type === "rent" ? "/mo" : ""}
        </Text>
      </View>
    </>
  );

  return (
    <AppLink
      href={`/property/${property.id}`}
      style={[
        styles.featuredCard,
        width ? { width } : null,
        isHovered && styles.featuredCardHovered,
      ]}
    >
      <View
        style={styles.featuredCardInner}
        // @ts-ignore
        onMouseEnter={() => setIsHovered(true)}
        // @ts-ignore
        onMouseLeave={() => setIsHovered(false)}
      >
        {image ? (
          <ImageBackground
            source={{ uri: image }}
            style={[styles.featuredCardBg, isHovered && styles.featuredCardBgHovered]}
            resizeMode="cover"
          >
            {contents}
          </ImageBackground>
        ) : (
          <View style={[styles.featuredCardBg, styles.featuredCardPlaceholder]}>{contents}</View>
        )}
      </View>
    </AppLink>
  );
}

export function HomeScreen() {
  const { isPhone, isTablet, width } = useResponsive();
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

  return (
    <AppChrome active="home">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Figma data-node-id="1:92")
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.heroContainer, isPhone && styles.heroContainerPhone]}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
          }}
          style={styles.heroBg}
          resizeMode="cover"
        >
          {/* Exact Figma Hero Gradient Overlay: 136.17deg from rgba(15, 109, 85, 0.92) to rgba(34, 81, 214, 0.75) */}
          <LinearGradient
            colors={["rgba(15, 109, 85, 0.92)", "rgba(34, 81, 214, 0.75)"]}
            end={{ x: 1, y: 0.85 }}
            start={{ x: 0, y: 0.15 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.heroContent, isPhone && styles.heroContentPhone]}>
            {/* Tag Pill */}
            <View style={styles.heroTagPill}>
              <Sparkles color="#FFFFFF" size={14} />
              <Text style={styles.heroTagText}>
                Bangladesh's AI property marketplace
              </Text>
            </View>

            {/* Heading 1 */}
            <Text style={[styles.heroHeading, isPhone && styles.heroHeadingPhone]}>
              Find a home you can trust, priced by AI.
            </Text>

            {/* Subtitle Paragraph */}
            <Text style={[styles.heroSubtitle, isPhone && styles.heroSubtitlePhone]}>
              Verified listings, AI valuation and investment scores for apartments, houses, land and commercial spaces across Bangladesh.
            </Text>

            {/* Hero Search Widget (Figma node 214:4655) */}
            <HeroSearchWidget />
          </View>
        </ImageBackground>
      </View>



      {/* ─────────────────────────────────────────────────────────────
          3. FEATURED PROPERTIES (Figma data-node-id="1:194")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured properties</Text>
            <Text style={styles.sectionSubtitle}>Most viewed active listings</Text>
          </View>
          <AppLink href="/buy" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color="#04cf92" size={16} />
          </AppLink>
        </View>

        <PropertyResult
          empty={!featuredProperties.length}
          error={popularError}
          loading={popularQuery.isLoading}
          onRetry={() => void popularQuery.refetch()}
        >
          <View ref={featuredWrapperRef} style={styles.featuredWrapper}>
            <ScrollView
              ref={featuredScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleFeaturedScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.featuredCardsRow}
            >
              {featuredProperties.map((property) => (
                <FeaturedPropertyCard
                  key={property.id}
                  property={property}
                  width={isPhone ? Math.min(width - 32, 340) : isTablet ? 420 : undefined}
                />
              ))}
            </ScrollView>

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
          10. MARKET INSIGHTS & TRUSTED PARTNERS (Figma data-node-id="1:1156")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={[styles.twoColSection, isTablet && styles.twoColSectionTablet]}>
          {/* Left: Market insights */}
          <View style={styles.marketInsightCard}>
            <View style={styles.sectionHeaderInner}>
              <View>
                <Text style={styles.sectionTitle}>Market insights</Text>
                <Text style={styles.sectionSubtitle}>
                  Avg. price per sqft (in ৳ thousands)
                </Text>
              </View>
              <View style={styles.trendPill}>
                <TrendingUp color="#04cf92" size={12} />
                <Text style={styles.trendPillText}>+8.4%</Text>
              </View>
            </View>

            {/* SVG Area Chart */}
            <View style={styles.chartWrapper}>
              <Svg height="160" width="100%" viewBox="0 0 360 160">
                <Defs>
                  <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#04cf92" stopOpacity="0.35" />
                    <Stop offset="100%" stopColor="#04cf92" stopOpacity="0.0" />
                  </SvgGradient>
                </Defs>

                {/* Filled Area */}
                <Path
                  d="M 10 120 C 60 110, 110 95, 160 85 C 210 75, 260 55, 310 40 C 330 35, 345 32, 350 30 L 350 150 L 10 150 Z"
                  fill="url(#chartGradient)"
                />

                {/* Smooth Curve Line */}
                <Path
                  d="M 10 120 C 60 110, 110 95, 160 85 C 210 75, 260 55, 310 40 C 330 35, 345 32, 350 30"
                  fill="none"
                  stroke="#04cf92"
                  strokeWidth="2.5"
                />
              </Svg>

              {/* Month Labels */}
              <View style={styles.chartMonthsRow}>
                {["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
                  <Text key={month} style={styles.chartMonthText}>
                    {month}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Right: Trusted partners */}
          <View style={styles.trustedPartnersCard}>
            <View style={styles.sectionHeaderInner}>
              <View>
                <Text style={styles.sectionTitle}>Trusted partners</Text>
                <Text style={styles.sectionSubtitle}>Verified agencies on Homenet</Text>
              </View>
            </View>

            <View style={styles.partnersList}>
              {trustedPartners.map((partner) => (
                <View key={partner.name} style={styles.partnerRow}>
                  <View style={styles.partnerInfoWrap}>
                    <View style={styles.partnerAvatarCircle}>
                      <Text style={styles.partnerAvatarText}>{partner.initial}</Text>
                    </View>
                    <View>
                      <View style={styles.partnerNameRow}>
                        <Text style={styles.partnerNameText}>{partner.name}</Text>
                        <ShieldCheck color="#04cf92" size={16} />
                      </View>
                      <Text style={styles.partnerDealsText}>{partner.deals}</Text>
                    </View>
                  </View>

                  <AppLink href="/users" style={styles.partnerViewBtn}>
                    <Text style={styles.partnerViewBtnText}>View</Text>
                  </AppLink>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          11. LATEST PROPERTY NEWS (Figma data-node-id="1:1262")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest property news</Text>
          <AppLink href="/about" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
          </AppLink>
        </View>

        <View style={[styles.newsGrid, isTablet && styles.newsGridTablet, isPhone && styles.newsGridPhone]}>
          {latestNews.map((article) => (
            <AppLink
              href="/about"
              key={article.id}
              style={[styles.newsCard, isTablet && styles.newsCardTablet, isPhone && styles.newsCardPhone]}
            >
              <View style={styles.newsImageWrap}>
                <Image
                  source={{ uri: article.image }}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.newsBody}>
                <View style={styles.newsTagRow}>
                  <View style={styles.newsTagPill}>
                    <Text style={styles.newsTagPillText}>{article.tag}</Text>
                  </View>
                  <Text style={styles.newsTimeText}>{article.time}</Text>
                </View>
                <Text numberOfLines={2} style={styles.newsTitle}>
                  {article.title}
                </Text>
              </View>
            </AppLink>
          ))}
        </View>
      </View>


    </AppChrome>
  );
}

const styles = StyleSheet.create({
  sectionSpacing: {
    marginTop: 40,
    width: "100%",
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
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  /* 1. Hero Section */
  heroContainer: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    minHeight: 495,
  },
  heroContainerPhone: {
    borderRadius: 18,
    minHeight: 420,
  },
  heroBg: {
    width: "100%",
    minHeight: 495,
    justifyContent: "center",
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingVertical: 56,
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    alignItems: "center",
  },
  heroContentPhone: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    width: "100%",
    alignItems: "center",
  },
  heroTagPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroTagText: {
    color: "#FFFFFF",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  heroHeading: {
    color: "#FFFFFF",
    fontFamily: fonts.headingExtraBold,
    fontSize: 47.8,
    fontWeight: "800",
    lineHeight: 50.2,
    letterSpacing: -0.95,
    marginBottom: 12,
    maxWidth: 900,
    textAlign: "center",
    alignSelf: "center",
  },
  heroHeadingPhone: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.5,
    marginBottom: 10,
    maxWidth: "100%",
    textAlign: "center",
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 780,
    textAlign: "center",
    alignSelf: "center",
  },
  heroSubtitlePhone: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 16,
    textAlign: "center",
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
    color: "#04cf92",
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
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  trendPillText: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  chartWrapper: {
    marginTop: 16,
    width: "100%",
  },
  chartMonthsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  chartMonthText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
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
