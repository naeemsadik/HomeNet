import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, PlusCircle, ChevronRight, Sparkles } from 'lucide-react-native';
import { colors, radius, fonts } from '../theme';
import { useResponsive } from '../hooks/useResponsive';
import { landingCopy, HERO_HEADLINE } from '../content/landingCopy';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useLandingMetrics } from '../hooks/useLandingMetrics';

// Landing Components
import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingSection } from '../components/landing/LandingSection';
import { HeroProductVisual } from '../components/landing/HeroProductVisual';
import { ScaleBand } from '../components/landing/ScaleBand';
import { ContrastColumns } from '../components/landing/ContrastColumns';
import { JourneyTrack } from '../components/landing/JourneyTrack';
import { FeatureBlock } from '../components/landing/FeatureBlock';
import { ShowcaseTabs } from '../components/landing/ShowcaseTabs';
import { VerificationPipeline } from '../components/landing/VerificationPipeline';
import { TechBlock } from '../components/landing/TechBlock';
import { EcosystemDiagram } from '../components/landing/EcosystemDiagram';
import { FinalCta } from '../components/landing/FinalCta';
import { AiFlagshipSection } from '../components/landing/AiFlagshipSection';

export const LandingScreen: React.FC = () => {
  const router = useRouter();
  const { isTablet, isPhone } = useResponsive();
  const requireAuth = useRequireAuth();
  const metrics = useLandingMetrics();
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'HomeNet — Real Estate Marketplace with Verified Listings';
    }
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 30 && !scrolled) {
      setScrolled(true);
    } else if (offsetY <= 30 && scrolled) {
      setScrolled(false);
    }
  };

  const handleNavigateSection = (sectionKey: string) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.getElementById(sectionKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  const handleListProperty = () => {
    requireAuth(() => router.push('/property/create'));
  };

  return (
    <View style={styles.rootContainer}>
      <LandingHeader scrolled={scrolled} onNavigateSection={handleNavigateSection} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            SECTION 1: HERO (Introduces HomeNet, shows decorative product preview)
            ========================================================================= */}
        <View
          {...(Platform.OS === 'web' ? { id: 'hero' } : {})}
          style={[styles.heroSection, isTablet && styles.heroSectionTablet, isPhone && styles.heroSectionPhone]}
        >
          {/* Subtle decorative radial glow */}
          <View style={styles.heroGlow} pointerEvents="none" />

          <View style={styles.heroInner}>
            {/* Trust Pill */}
            <View style={styles.heroPill}>
              <View style={styles.heroPillDot} />
              <Text style={styles.heroPillText}>{landingCopy.hero.eyebrow}</Text>
            </View>

            {/* Main Headline */}
            <Text style={[styles.heroHeadline, isPhone && styles.heroHeadlinePhone]}>
              {HERO_HEADLINE}
            </Text>

            {/* Subheadline */}
            <Text style={[styles.heroSubheadline, isPhone && styles.heroSubheadlinePhone]}>
              {landingCopy.hero.subtitle}
            </Text>

            {/* Primary Action Buttons */}
            <View style={[styles.heroActionsRow, isPhone && styles.heroActionsRowPhone]}>
              <Pressable
                style={({ hovered }: any) => [
                  styles.heroPrimaryBtn,
                  hovered && styles.heroBtnHovered,
                ]}
                onPress={() => router.push('/buy')}
                accessibilityRole="button"
                accessibilityLabel={landingCopy.hero.primaryCta}
              >
                <Text style={styles.heroPrimaryBtnText}>{landingCopy.hero.primaryCta}</Text>
                <ArrowRight size={17} color="#0B1A17" style={{ marginLeft: 8 }} />
              </Pressable>

              <Pressable
                style={({ hovered }: any) => [
                  styles.heroSecondaryBtn,
                  hovered && styles.heroSecondaryBtnHovered,
                ]}
                onPress={handleListProperty}
                accessibilityRole="button"
                accessibilityLabel={landingCopy.hero.secondaryCta}
              >
                <PlusCircle size={18} color="#0F6D55" style={{ marginRight: 8 }} />
                <Text style={styles.heroSecondaryBtnText}>{landingCopy.hero.secondaryCta}</Text>
              </Pressable>
            </View>

            {/* Mirror line: AI Instant Listing benefit */}
            <Pressable
              style={({ hovered }: any) => [
                styles.heroAiPill,
                hovered && styles.heroAiPillHovered,
              ]}
              onPress={() => handleNavigateSection('ai')}
            >
              <Sparkles size={14} color="#0F6D55" style={{ marginRight: 6 }} />
              <Text style={styles.heroAiPillText}>
                List in 60s: Paste a plain description — HomeNet translates crore, lakh & amenities into 14 fields
              </Text>
              <ChevronRight size={13} color="#0F6D55" style={{ marginLeft: 4 }} />
            </Pressable>

            {/* Open existing app link */}
            <View style={styles.heroAppLinkRow}>
              <Text style={styles.heroAppLinkPrefix}>Looking for the full web application?</Text>
              <Pressable
                style={({ hovered }: any) => [
                  styles.heroAppLink,
                  hovered && { opacity: 0.75 },
                ]}
                onPress={() => router.push('/home')}
              >
                <Text style={styles.heroAppLinkText}>Launch HomeNet app</Text>
                <ChevronRight size={14} color="#0F6D55" />
              </Pressable>
            </View>

            {/* Interactive Product Visual Showcase */}
            <View style={styles.heroVisualWrapper}>
              <HeroProductVisual />
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 2: SCALE BAND (Live API counts with graceful fallbacks)
            ========================================================================= */}
        <LandingSection
          id="scale"
          background="white"
          eyebrow="Market Scale"
          title="Direct From The Live Platform"
          subtitle="Real figures synchronized with active listings and validated owner submissions."
        >
          <ScaleBand metrics={metrics} />
        </LandingSection>

        {/* =========================================================================
            SECTION 3: CONTRAST (Problem vs Solution)
            ========================================================================= */}
        <LandingSection
          id="contrast"
          background="tint"
          eyebrow="The Paradigm Shift"
          title="Real Estate Without The Noise"
          subtitle="HomeNet eliminates broker markups, duplicate syndicated records, and opaque communication."
        >
          <ContrastColumns />
        </LandingSection>

        {/* =========================================================================
            SECTION 4: CORE JOURNEY (Dual-Track: Seeker & Owner)
            ========================================================================= */}
        <LandingSection
          id="journey"
          background="white"
          eyebrow="How It Works"
          title="A Frictionless Path For Both Sides"
          subtitle="Explore the intuitive workflow whether you are searching for your next home or listing your asset."
        >
          <JourneyTrack />
        </LandingSection>

        {/* =========================================================================
            SECTION 5: CAPABILITIES (6 Verified Features)
            ========================================================================= */}
        <LandingSection
          id="features"
          background="tint"
          eyebrow="Platform Capabilities"
          title="Built For Complete Transparency"
          subtitle="Every feature is designed to reduce transaction friction and protect buyers and sellers alike."
        >
          <FeatureBlock />
        </LandingSection>

        {/* =========================================================================
            SECTION 6: INTERFACE SHOWCASE (Interactive Tabs)
            ========================================================================= */}
        <LandingSection
          id="showcase"
          background="white"
          eyebrow="Experience The Product"
          title="Designed For Speed, Built For Clarity"
          subtitle="Inspect actual HomeNet modules before you even create an account."
        >
          <ShowcaseTabs />
        </LandingSection>

        {/* =========================================================================
            SECTION 7: AI FLAGSHIP (Bangladeshi Property Intelligence)
            ========================================================================= */}
        <View {...(Platform.OS === 'web' ? { id: 'ai' } : {})}>
          <AiFlagshipSection />
        </View>

        {/* =========================================================================
            SECTION 8: VERIFICATION PIPELINE (Trust Lifecycle)
            ========================================================================= */}
        <LandingSection
          id="verification"
          background="white"
          eyebrow="Trust & Safety"
          title="Rigorous 4-Stage Listing Validation"
          subtitle="Our systematic pipeline validates identity and property credentials before any listing gains verified status."
        >
          <VerificationPipeline />
        </LandingSection>

        {/* =========================================================================
            SECTION 8: TECHNOLOGY & ARCHITECTURE (Direct API Engine)
            ========================================================================= */}
        <LandingSection
          id="tech"
          background="white"
          eyebrow="Engineering"
          title="Modern Architecture, Real-Time Performance"
          subtitle="Powered by intelligent natural-language parsing, fast Prisma data pipelines, and sub-second querying."
        >
          <TechBlock />
        </LandingSection>

        {/* =========================================================================
            SECTION 9: PLATFORM ECOSYSTEM
            ========================================================================= */}
        <LandingSection
          id="ecosystem"
          background="tint"
          eyebrow="Ecosystem"
          title="The Connected Real Estate Network"
          subtitle="Connecting property seekers and verified owners directly, with no broker in between."
        >
          <EcosystemDiagram />
        </LandingSection>

        {/* =========================================================================
            SECTION 10: FINAL CONVERSION CTA
            ========================================================================= */}
        <LandingSection id="cta" background="white">
          <FinalCta />
        </LandingSection>

        {/* =========================================================================
            FOOTER
            ========================================================================= */}
        <LandingFooter />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingTop: 48,
    paddingBottom: 72,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  heroSectionTablet: {
    paddingTop: 36,
    paddingBottom: 56,
  },
  heroSectionPhone: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroGlow: {
    position: 'absolute',
    top: -120,
    left: '50%',
    marginLeft: -400,
    width: 800,
    height: 480,
    borderRadius: 400,
    backgroundColor: 'rgba(4, 207, 146, 0.07)',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(100px)',
        }
      : {}),
  },
  heroInner: {
    maxWidth: 1240,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    alignItems: 'center',
    textAlign: 'center',
    zIndex: 2,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 109, 85, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
    marginBottom: 20,
  },
  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0F6D55',
    marginRight: 8,
  },
  heroPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#0F6D55',
    letterSpacing: 0.3,
  },
  heroHeadline: {
    fontFamily: fonts.bold,
    fontSize: 52,
    lineHeight: 62,
    color: '#0B1A17',
    textAlign: 'center',
    letterSpacing: -1.4,
    maxWidth: 880,
    marginBottom: 20,
  },
  heroHeadlinePhone: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  heroSubheadline: {
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 28,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 720,
    marginBottom: 36,
  },
  heroSubheadlinePhone: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  heroActionsRowPhone: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04CF92',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
    shadowColor: '#04CF92',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'transform 0.15s ease, background-color 0.15s ease',
        }
      : {}),
  },
  heroBtnHovered: {
    backgroundColor: '#04BD84',
    transform: [{ translateY: -2 }],
  },
  heroPrimaryBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#0B1A17',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(15, 109, 85, 0.3)',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }
      : {}),
  },
  heroSecondaryBtnHovered: {
    borderColor: '#0F6D55',
    backgroundColor: 'rgba(15, 109, 85, 0.04)',
    transform: [{ translateY: -2 }],
  },
  heroSecondaryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#0F6D55',
  },
  heroAiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 109, 85, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    marginBottom: 16,
    maxWidth: 720,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }
      : {}),
  },
  heroAiPillHovered: {
    backgroundColor: 'rgba(15, 109, 85, 0.1)',
    borderColor: '#0F6D55',
    transform: [{ translateY: -1 }],
  },
  heroAiPillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#0F6D55',
    textAlign: 'center',
  },
  heroAppLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 44,
  },
  heroAppLinkPrefix: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  heroAppLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  heroAppLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#0F6D55',
    textDecorationLine: 'underline',
  },
  heroVisualWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});
