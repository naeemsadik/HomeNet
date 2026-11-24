import React, { memo, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Camera, Lock, Mail, ShieldCheck } from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { cdnImage } from "@/lib/cloudinaryImage";
import { previewProperties } from "@/data/landingPreview";

const PREVIEW_HREF = "/buy?listing_type=sale&city=Dhaka";
const PREVIEW_URL_DISPLAY = "homenetbd.com/buy?listing_type=sale&city=Dhaka&searched=1";

export const ProductPreviewShowcase = memo(function ProductPreviewShowcase() {
  const { width, isTablet, isPhone } = useResponsive();
  const isTabletViewport =
    (width != null && width >= 768 && width < 1024) || (isTablet && !isPhone);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const isPointerDownRef = useRef(false);
  const pointerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const p1 = previewProperties[0];

  useEffect(() => {
    return () => {
      if (pointerTimeoutRef.current) {
        clearTimeout(pointerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mediaQuery.matches);
      const listener = (event: MediaQueryListEvent) => {
        setReduceMotion(event.matches);
      };
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
      } else if (typeof (mediaQuery as any).addListener === "function") {
        (mediaQuery as any).addListener(listener);
        return () => (mediaQuery as any).removeListener(listener);
      }
    }
  }, []);

  const isHoverSupported = () => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }
    return false;
  };

  const handleHoverIn = () => {
    if (isHoverSupported()) {
      setIsHovered(true);
    }
  };

  const handleHoverOut = () => {
    setIsHovered(false);
  };

  const handlePressIn = () => {
    isPointerDownRef.current = true;
  };

  const handlePressOut = () => {
    pointerTimeoutRef.current = setTimeout(() => {
      isPointerDownRef.current = false;
    }, 0);
  };

  const handleFocus = (e?: any) => {
    if (Platform.OS === "web") {
      const target = (e?.nativeEvent?.target ?? e?.target) as
        | { matches?: (selector: string) => boolean }
        | undefined;
      const isKeyboardFocus =
        !isPointerDownRef.current &&
        (typeof target?.matches === "function" ? target.matches(":focus-visible") : false);
      setIsFocused(isKeyboardFocus);
    } else {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    if (pointerTimeoutRef.current) {
      clearTimeout(pointerTimeoutRef.current);
    }
    isPointerDownRef.current = false;
    setIsFocused(false);
  };

  return (
    <View style={styles.outerContainer}>
      <Link asChild href={PREVIEW_HREF}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Browse verified properties for sale in Dhaka"
          onBlur={handleBlur}
          onFocus={handleFocus}
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={StyleSheet.flatten([styles.pressable, webPointer])}
        >
          <View
            aria-hidden={true}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.stage,
              { paddingBottom: isTabletViewport ? 12 : 16 },
            ]}
          >
            {/* Desktop Browser Frame */}
            <View
              style={[
                styles.browserFrame,
                isHovered && !reduceMotion && styles.browserFrameHovered,
                isFocused && styles.browserFrameFocused,
              ]}
            >
              {/* Browser Chrome Header (height: 40) */}
              <View style={styles.chromeHeader}>
                <View style={styles.trafficLights}>
                  <View style={[styles.dot, styles.dotClose]} />
                  <View style={[styles.dot, styles.dotMinimize]} />
                  <View style={[styles.dot, styles.dotMaximize]} />
                </View>

                <View style={styles.addressBar}>
                  <Lock color={colorTokens.muted} size={11} strokeWidth={2.5} />
                  <Text numberOfLines={1} style={styles.addressText}>
                    {PREVIEW_URL_DISPLAY}
                  </Text>
                </View>

                <View style={styles.chromeSpacer} />
              </View>

              {/* Dark Forest / Charcoal Filter Bar */}
              <View style={styles.filterBar}>
                <View style={styles.filterPillCity}>
                  <Text style={styles.filterTextCity}>Dhaka</Text>
                </View>
                <View style={styles.filterPillActive}>
                  <Text style={styles.filterTextActive}>All areas</Text>
                </View>
                <View style={styles.filterPillMuted}>
                  <Text style={styles.filterTextMuted}>This area only</Text>
                </View>
                <View style={styles.filterPillMuted}>
                  <Text style={styles.filterTextMuted}>Min price to Max price</Text>
                </View>
                <View style={styles.filterPillMuted}>
                  <Text style={styles.filterTextMuted}>Min beds to Max beds</Text>
                </View>
                <View style={styles.filterPillMuted}>
                  <Text style={styles.filterTextMuted}>Property type</Text>
                </View>
                <View style={styles.filterPillMuted}>
                  <Text style={styles.filterTextMuted}>Filters</Text>
                </View>
              </View>

              {/* Listing Content Area */}
              <View style={styles.listingArea}>
                <Text style={styles.listingHeading}>Properties for Sale in Dhaka</Text>

                {/* Verified Listing Card */}
                <View style={styles.listingCard}>
                  {/* Full-width emerald banner */}
                  <View style={styles.verifiedBanner}>
                    <ShieldCheck color={colorTokens.onBrand} size={13} strokeWidth={2.5} />
                    <Text style={styles.verifiedBannerText}>VERIFIED LISTING</Text>
                  </View>

                  {/* Split 2-column body */}
                  <View style={styles.splitBody}>
                    {/* Left 52% property photo */}
                    <View style={styles.photoColumn}>
                      <Image
                        accessibilityLabel={p1.title}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                        source={{ uri: cdnImage(p1.media?.[0]?.url, 800, 500) }}
                        style={StyleSheet.absoluteFill}
                      />
                      {/* Photo count badge */}
                      <View style={styles.photoCountBadge}>
                        <Camera color="#FFFFFF" size={12} strokeWidth={2} />
                        <Text style={styles.photoCountText}>6</Text>
                      </View>
                      {/* Price pill */}
                      <View style={styles.pricePill}>
                        <Text style={styles.pricePillText}>৳ 4.85 Cr</Text>
                      </View>
                    </View>

                    {/* Right 48% details */}
                    <View
                      style={[
                        styles.detailsColumn,
                        { paddingRight: isTabletViewport ? 16 : 48 },
                      ]}
                    >
                      <View style={styles.detailsTop}>
                        <Text numberOfLines={1} style={styles.propertyAddress}>
                          Road 92, Gulshan-2, Dhaka
                        </Text>
                        <Text numberOfLines={1} style={styles.propertyTitle}>
                          {p1.title}
                        </Text>
                        <Text style={styles.propertySpecs}>
                          Penthouse · 4 · 5 · 4,200 sqft
                        </Text>
                        <Text numberOfLines={2} style={styles.propertyDescription}>
                          Exclusive 4-bedroom penthouse in Gulshan-2 with expansive terrace, Italian porcelain finishes, integrated smart automation, and private elevator access.
                        </Text>
                      </View>

                      {/* Agent row */}
                      <View style={styles.agentRow}>
                        <ShieldCheck color={colorTokens.info} size={13} strokeWidth={2.5} />
                        <Text style={styles.agentText}>
                          Tanvir Rahman · Verified listing
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Overlapping Smartphone Mockup */}
            <View
              style={[
                styles.phoneMockup,
                { width: isTabletViewport ? 208 : 248 },
              ]}
            >
              {/* Notch Bar */}
              <View style={styles.phoneNotchBar}>
                <View style={styles.phoneSpeaker} />
              </View>

              {/* Compact Property Photo */}
              <View
                style={[
                  styles.phonePhotoWrap,
                  { height: isTabletViewport ? 95 : 115 },
                ]}
              >
                <Image
                  accessibilityLabel={p1.title}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  source={{ uri: cdnImage(p1.media?.[0]?.url, 640, 360) }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.phoneVerifiedBadge}>
                  <ShieldCheck color={colorTokens.info} size={11} strokeWidth={2.5} />
                  <Text style={styles.phoneVerifiedBadgeText}>Verified</Text>
                </View>
              </View>

              {/* Phone Content Details */}
              <View style={styles.phoneBody}>
                <Text numberOfLines={1} style={styles.phoneLocation}>
                  Road 92, Gulshan-2
                </Text>
                <Text numberOfLines={1} style={styles.phoneTitle}>
                  {p1.title}
                </Text>
                <Text style={styles.phonePrice}>৳ 4.85 Cr</Text>

                <View style={styles.phoneCtaBtn} testID="hero-contact-cta">
                  <Mail color={colorTokens.onBrand} size={12} strokeWidth={2} />
                  <Text style={styles.phoneCtaBtnText} testID="hero-contact-cta-text">
                    Contact Owner Directly
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
  },
  pressable: {
    width: "100%",
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineStyle: "none" as any,
        textDecorationLine: "none" as any,
        cursor: "pointer",
      },
    }),
  },
  stage: {
    position: "relative",
    width: "100%",
    pointerEvents: "none" as any,
  },
  browserFrame: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
        transitionProperty: "transform, box-shadow",
        transitionDuration: "180ms",
        transitionTimingFunction: "ease-out",
      } as any,
      default: {
        shadowColor: "rgba(15, 23, 42, 0.08)",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 1,
        shadowRadius: 32,
        elevation: 8,
      },
    }),
  },
  browserFrameHovered: {
    transform: [{ translateY: -2 }],
    ...Platform.select({
      web: {
        boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
      } as any,
    }),
  },
  browserFrameFocused: {
    ...Platform.select({
      web: {
        outlineWidth: 2,
        outlineStyle: "solid" as any,
        outlineColor: colorTokens.brand,
        outlineOffset: 2,
      },
    }),
  },
  chromeHeader: {
    height: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  trafficLights: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 42,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotClose: {
    backgroundColor: "#FF5F56",
  },
  dotMinimize: {
    backgroundColor: "#FFBD2E",
  },
  dotMaximize: {
    backgroundColor: "#27C93F",
  },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
    maxWidth: "75%",
  },
  addressText: {
    fontSize: 12,
    color: colorTokens.muted,
    fontFamily: fonts.regular,
  },
  chromeSpacer: {
    width: 42,
  },
  filterBar: {
    backgroundColor: "#0B1A17",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  filterPillCity: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  filterTextCity: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  filterPillActive: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  filterTextActive: {
    color: "#0B1A17",
    fontSize: 12,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
  },
  filterPillMuted: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  filterTextMuted: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  listingArea: {
    padding: 20,
    backgroundColor: colorTokens.canvas,
  },
  listingHeading: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  listingCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
    overflow: "hidden",
  },
  verifiedBanner: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colorTokens.brand,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedBannerText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  splitBody: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  photoColumn: {
    width: "52%",
    aspectRatio: 16 / 10,
    position: "relative",
    overflow: "hidden",
    backgroundColor: colorTokens.surfaceSunken,
  },
  photoCountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(11, 26, 23, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
  },
  pricePill: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(11, 26, 23, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pricePillText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
  },
  detailsColumn: {
    width: "48%",
    padding: 16,
    justifyContent: "space-between",
  },
  detailsTop: {
    gap: 4,
  },
  propertyAddress: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  propertyTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  propertySpecs: {
    color: colorTokens.body,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  propertyDescription: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  agentText: {
    color: colorTokens.body,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  phoneMockup: {
    position: "absolute",
    right: 24,
    bottom: 0,
    borderRadius: 28,
    borderWidth: 8,
    borderColor: "#111827",
    backgroundColor: colorTokens.surface,
    overflow: "hidden",
    zIndex: 10,
    ...Platform.select({
      web: {
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)",
      } as any,
      default: {
        shadowColor: "rgba(15, 23, 42, 0.18)",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 12,
      },
    }),
  },
  phoneNotchBar: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: colorTokens.surface,
  },
  phoneSpeaker: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#111827",
  },
  phonePhotoWrap: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: colorTokens.surfaceSunken,
  },
  phoneVerifiedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colorTokens.infoSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  phoneVerifiedBadgeText: {
    color: colorTokens.info,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
  phoneBody: {
    padding: 10,
    gap: 2,
    backgroundColor: colorTokens.surface,
  },
  phoneLocation: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  phoneTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 12,
    fontWeight: "700",
  },
  phonePrice: {
    color: colorTokens.brandText,
    fontFamily: fonts.headingExtraBold,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  phoneCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colorTokens.brand,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 6,
  },
  phoneCtaBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: "700",
  },
});
