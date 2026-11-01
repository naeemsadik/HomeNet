import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import { MobileHeroSearchCard } from "@/components/MobileHeroSearchCard";
import { MobileHomeSections } from "@/components/MobileHomeSections";
import { FitText } from "@/components/FitText";
import { NoTranslateText } from "@/components/NoTranslateText";
import { AiFlagshipSection } from "@/components/landing/AiFlagshipSection";
import { HomeNetExplainerSection } from "@/components/landing/HomeNetExplainerSection";
import { HeroProductVisual } from "@/components/landing/HeroProductVisual";
import { PropertyGuidesSection } from "@/features/news/components/PropertyGuidesSection";
import { HomeMapExplorer } from "@/features/property/components/HomeMapExplorer";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout, webPointer } from "@/theme";
import { HERO_IMAGE_URL } from "@/lib/heroImage";
import { styles } from "./HomeScreen.styles";

/**
 * Hero photograph: placeholder until real imagery is shot.
 *
 * Replace with a HomeNet-owned photo of a Bangladeshi interior. Spec: landscape,
 * min 2400×1400, a lived-in room (not an exterior tower), natural daylight, with
 * the left-to-centre area uncluttered so the headline sits on calm pixels.
 */
const HERO_IMAGE = { uri: HERO_IMAGE_URL };

export function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    isPhone,
    isTablet,
    isCompact,
    isWide,
    isUltrawide,
    isLargeScreen,
    isTall,
    height,
    width,
  } = useResponsive();

  const isMobile = isPhone || width < 768;

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
  // Phone: the same photograph as the website, cut to a short banner.
  const mobileHero = (
    // The frame grows with the photo. At a fixed 236 it clipped the photo's last
    // inset-worth of height on a phone (the status bar adds ~36 there, 0 on the
    // web), which is where the headline sits, so the app hid it under the card.
    <View style={[styles.mobileHeroPhoto, { height: 236 + insets.top }]}>
      <ImageBackground
        source={HERO_IMAGE}
        style={[styles.mobileHeroBg, { height: 236 + insets.top, paddingTop: insets.top }]}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(6, 22, 18, 0.55)", "rgba(6, 22, 18, 0.18)", "rgba(6, 22, 18, 0.5)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Same side margins as the search card below, and the headline sized to
            fill them, so it lines up with the card on the left and the right. */}
        <View style={[styles.mobileHeroCopy, { paddingHorizontal: isPhone ? layout.gutterPhone : layout.gutter }]}>
          {/* The page's one <h1>: the homepage had none, so crawlers had no heading to read. */}
          <FitText accessibilityRole="header" aria-level={1} noTranslate style={styles.mobileHeroHeading}>
            {t("home.heroHeadline")}
          </FitText>
        </View>
      </ImageBackground>
    </View>
  );

  const hero = (
      <View style={styles.heroBlock}>
        <View style={[styles.heroPhoto, { minHeight: heroMetrics.minHeight }]}>
          <ImageBackground
            source={HERO_IMAGE}
            style={[
              styles.heroBg,
              {
                minHeight: heroMetrics.minHeight,
                // Clears the pinned bar and, on Android edge-to-edge, the status bar.
                paddingTop: heroMetrics.topPad + insets.top,
              },
            ]}
            resizeMode="cover"
          >
            {/* Scrim only deep enough to carry white type, the room stays visible. */}
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
              <NoTranslateText accessibilityRole="header" aria-level={1} style={[styles.heroHeading, heroType]}>
                {t("home.heroHeadline")}
              </NoTranslateText>
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
              <Text style={styles.ownerTitle}>{t("home.listingYourOwnTitle")}</Text>
              <Text style={styles.ownerSub}>
                {t("home.listingYourOwnSub")}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.listYourPropertyCTA")}
              onPress={() => router.push("/property/create" as never)}
              style={({ hovered, pressed }: { hovered?: boolean; pressed?: boolean }) => [
                styles.ownerCta,
                isPhone && styles.ownerCtaPhone,
                hovered && styles.ownerCtaHovered,
                pressed && { opacity: 0.9 },
                webPointer,
              ]}
            >
              <Text style={styles.ownerCtaText}>{t("home.listYourPropertyCTA")}</Text>
            </Pressable>
          </View>
        </View>
        </View>
      </View>
  );

  return (
    <AppChrome active="home" bleed={isMobile ? mobileHero : hero} compactFooter={isMobile}>
      {isMobile ? (
        <View style={styles.mobileSearchOverlap}>
          <MobileHeroSearchCard />
        </View>
      ) : null}

      {isMobile ? (
        <MobileHomeSections />
      ) : (
        <>
      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE LISTINGS MAP EXPLORER: interactive map explorer
          showing verified listings for sale and rent across Dhaka
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <HomeMapExplorer />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          3. EXPLAINER VIDEO, 30s auto-preview + full walkthrough video
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <HomeNetExplainerSection />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          5. PRODUCT VISUAL, browser + phone preview of real listings
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <HeroProductVisual />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          6. AI LISTING, describe it, HomeNet fills the fields
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <AiFlagshipSection />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          8. GUIDES & INSIGHTS, editorial, API-ready
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <PropertyGuidesSection />
      </View>
        </>
      )}
    </AppChrome>
  );
}
