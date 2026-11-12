import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { AlertCircle, ArrowRight, Building2, Check, ChevronDown, CircleHelp, Clock, Compass, FileCheck, Sparkles } from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function PropertyValuationGuideScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPhone, isTablet } = useResponsive();

  // FAQ Accordion State
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({ 0: true });

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const factors = [
    {
      title: t("propertyValuationGuide.factor1Title"),
      desc: t("propertyValuationGuide.factor1Desc"),
      icon: Compass,
    },
    {
      title: t("propertyValuationGuide.factor2Title"),
      desc: t("propertyValuationGuide.factor2Desc"),
      icon: FileCheck,
    },
    {
      title: t("propertyValuationGuide.factor3Title"),
      desc: t("propertyValuationGuide.factor3Desc"),
      icon: Building2,
    },
    {
      title: t("propertyValuationGuide.factor4Title"),
      desc: t("propertyValuationGuide.factor4Desc"),
      icon: Clock,
    },
    {
      title: t("propertyValuationGuide.factor5Title"),
      desc: t("propertyValuationGuide.factor5Desc"),
      icon: Sparkles,
    },
  ];

  const surveySteps = [
    {
      num: "01",
      title: t("propertyValuationGuide.step1Title"),
      desc: t("propertyValuationGuide.step1Desc"),
    },
    {
      num: "02",
      title: t("propertyValuationGuide.step2Title"),
      desc: t("propertyValuationGuide.step2Desc"),
    },
    {
      num: "03",
      title: t("propertyValuationGuide.step3Title"),
      desc: t("propertyValuationGuide.step3Desc"),
    },
    {
      num: "04",
      title: t("propertyValuationGuide.step4Title"),
      desc: t("propertyValuationGuide.step4Desc"),
    },
    {
      num: "05",
      title: t("propertyValuationGuide.step5Title"),
      desc: t("propertyValuationGuide.step5Desc"),
    },
  ];

  const faqs = [
    {
      q: t("propertyValuationGuide.faq1Q"),
      a: t("propertyValuationGuide.faq1A"),
    },
    {
      q: t("propertyValuationGuide.faq2Q"),
      a: t("propertyValuationGuide.faq2A"),
    },
    {
      q: t("propertyValuationGuide.faq3Q"),
      a: t("propertyValuationGuide.faq3A"),
    },
    {
      q: t("propertyValuationGuide.faq4Q"),
      a: t("propertyValuationGuide.faq4A"),
    },
  ];

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>
            {t("propertyValuationGuide.eyebrow")}
          </Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("propertyValuationGuide.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("propertyValuationGuide.subheading")}
          </Text>
        </View>

        {/* 5 Core Factors Driving Value */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.factorsTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.factorsSubtitle")}
            </Text>
          </View>

          <View style={styles.factorsGrid}>
            {factors.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <View
                  key={idx}
                  style={[
                    styles.factorCard,
                    isPhone && styles.factorCardPhone,
                  ]}
                >
                  <View style={styles.factorIconWrap}>
                    <IconComp color={colorTokens.brandText} size={22} />
                  </View>
                  <View style={styles.factorTextWrap}>
                    <Text style={styles.factorTitle}>{item.title}</Text>
                    <Text style={styles.factorDesc}>{item.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mouza Rate vs Real Market Value Comparison */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.mouzaVsMarketTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.mouzaVsMarketSubtitle")}
            </Text>
          </View>

          <View
            style={[
              styles.comparisonGrid,
              isPhone && styles.comparisonGridPhone,
            ]}
          >
            {/* Mouza Rate Card */}
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonBadgeMuted}>
                <Text style={styles.comparisonBadgeTextMuted}>
                  Official Baseline
                </Text>
              </View>
              <Text style={styles.comparisonCardTitle}>
                {t("propertyValuationGuide.mouzaCardTitle")}
              </Text>
              <View style={styles.comparisonPointsList}>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.muted} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.mouzaCardPoint1")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.muted} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.mouzaCardPoint2")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.muted} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.mouzaCardPoint3")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fair Market Value Card */}
            <View
              style={[
                styles.comparisonCard,
                styles.comparisonCardFeatured,
              ]}
            >
              <View style={styles.comparisonBadgeBrand}>
                <Text style={styles.comparisonBadgeTextBrand}>
                  Commercial Standard
                </Text>
              </View>
              <Text style={styles.comparisonCardTitle}>
                {t("propertyValuationGuide.marketCardTitle")}
              </Text>
              <View style={styles.comparisonPointsList}>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.brandText} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.marketCardPoint1")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.brandText} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.marketCardPoint2")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.brandText} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.marketCardPoint3")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Step-by-Step Surveyor Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.checklistTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.checklistSubtitle")}
            </Text>
          </View>

          <View style={styles.workflowList}>
            {surveySteps.map((step, idx) => (
              <View
                key={idx}
                style={[styles.stepCard, isPhone && styles.stepCardPhone]}
              >
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>{step.num}</Text>
                </View>
                <View style={styles.stepContentWrap}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Accordion Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.faqTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.faqSubtitle")}
            </Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => {
              const isExpanded = !!expandedFaqs[index];
              return (
                <View key={index} style={styles.faqCard}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => toggleFaq(index)}
                    style={[styles.faqQuestionRow, webPointer]}
                  >
                    <View style={styles.faqQuestionTextWrap}>
                      <CircleHelp
                        color={colorTokens.brandText}
                        size={20}
                        style={styles.faqQuestionIcon}
                      />
                      <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    </View>
                    <View
                      style={[
                        styles.faqChevronWrap,
                        isExpanded && styles.faqChevronWrapRotated,
                      ]}
                    >
                      <ChevronDown color={colorTokens.body} size={20} />
                    </View>
                  </Pressable>
                  {isExpanded ? (
                    <View style={styles.faqAnswerWrap}>
                      <Text style={styles.faqAnswerText}>{faq.a}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* CTA Card to Instant Valuation */}
        <View style={styles.section}>
          <View style={[styles.ctaCard, isPhone && styles.ctaCardPhone]}>
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>
                {t("propertyValuationGuide.ctaTitle")}
              </Text>
              <Text style={styles.ctaDesc}>
                {t("propertyValuationGuide.ctaDesc")}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/instant-valuation")}
              style={[styles.ctaButton, webPointer]}
            >
              <Text style={styles.ctaButtonText}>
                {t("propertyValuationGuide.ctaButton")}
              </Text>
              <ArrowRight color={colorTokens.brandText} size={18} />
            </Pressable>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <AlertCircle color={colorTokens.warningText} size={22} />
              <Text style={styles.disclaimerTitle}>
                {t("propertyValuationGuide.disclaimerTitle")}
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              {t("propertyValuationGuide.disclaimerDesc")}
            </Text>
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 40,
    paddingBottom: 64,
  },
  containerPhone: {
    paddingHorizontal: layout.gutterPhone,
    paddingTop: 24,
    paddingBottom: 48,
  },
  // ─── Hero ──────────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 44,
  },
  heroPhone: {
    marginBottom: 28,
    alignItems: "flex-start",
    textAlign: "left",
  },
  eyebrow: {
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 14,
    maxWidth: 760,
  },
  heroTitlePhone: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: "left",
  },
  heroCopy: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colorTokens.muted,
    textAlign: "center",
    maxWidth: 680,
    marginBottom: 24,
  },
  heroCopyPhone: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 20,
  },
  // ─── Common Sections ───────────────────────────────────────────────────
  section: {
    marginBottom: 48,
  },
  sectionHeaderWrap: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  sectionTitlePhone: {
    fontSize: 20,
    lineHeight: 26,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.muted,
    maxWidth: 720,
  },
  // ─── Results Card ──────────────────────────────────────────────────────
  // ─── 5 Factors Grid ────────────────────────────────────────────────────
  factorsGrid: {
    gap: 16,
  },
  factorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
    ...shadow,
  },
  factorCardPhone: {
    flexDirection: "column",
    gap: 12,
    padding: 16,
  },
  factorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  factorTextWrap: {
    flex: 1,
  },
  factorTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  factorDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },
  // ─── Mouza vs Market Cards ─────────────────────────────────────────────
  comparisonGrid: {
    flexDirection: "row",
    gap: 20,
  },
  comparisonGridPhone: {
    flexDirection: "column",
    gap: 16,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 24,
    ...shadow,
  },
  comparisonCardFeatured: {
    borderColor: colorTokens.brandBorder,
    backgroundColor: colorTokens.surfaceSunken,
  },
  comparisonBadgeMuted: {
    alignSelf: "flex-start",
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  comparisonBadgeTextMuted: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonBadgeBrand: {
    alignSelf: "flex-start",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  comparisonBadgeTextBrand: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.brandText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonCardTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colorTokens.ink,
    marginBottom: 16,
  },
  comparisonPointsList: {
    gap: 12,
  },
  comparisonPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  comparisonPointText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.body,
    flex: 1,
  },
  // ─── Step-by-Step Surveyor Checklist ───────────────────────────────────
  workflowList: {
    gap: 14,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
    ...shadow,
  },
  stepCardPhone: {
    flexDirection: "column",
    gap: 10,
    padding: 16,
  },
  stepNumWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontFamily: fonts.headingBold,
    fontSize: 15,
    color: colorTokens.brandText,
  },
  stepContentWrap: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },
  // ─── FAQ Accordion ─────────────────────────────────────────────────────
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    overflow: "hidden",
    ...shadow,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 56,
  },
  faqQuestionTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
    gap: 12,
  },
  faqQuestionIcon: {
    flexShrink: 0,
  },
  faqQuestionText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.ink,
    flex: 1,
  },
  faqChevronWrap: {
    transform: [{ rotate: "0deg" }],
  },
  faqChevronWrapRotated: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  faqAnswerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 24,
    color: colorTokens.body,
  },
  // ─── CTA Card ──────────────────────────────────────────────────────────
  ctaCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    ...shadow,
  },
  ctaCardPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  ctaDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: 22,
    minHeight: 48,
    gap: 8,
  },
  ctaButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.brandText,
  },
  // ─── Disclaimer ────────────────────────────────────────────────────────
  disclaimerSection: {
    marginTop: 8,
  },
  disclaimerCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.muted,
  },
});
