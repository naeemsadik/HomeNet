import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  FileCheck2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "@/components/icons";
import { AppChrome } from "@/components/AppChrome";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqPageSchema, valuationToolSchema, VALUATION_FAQ } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { colorTokens, colors, fonts, radius, shadow } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { InstantValuationWizard } from "../components/InstantValuationWizard";
import type { ValuationPropertyType, ValuationPurpose } from "../types/valuationTypes";

const PAGE_PATH = "/instant-valuation";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

/** Home › Instant Property Valuation. */
const PAGE_CRUMBS = [
  { name: "Home", url: `${SITE_URL}/` },
  { name: "Instant Property Valuation", url: PAGE_URL },
];

export function InstantValuationScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { setInitialFromHero } = useInstantValuation();
  const params = useLocalSearchParams<{
    area?: string;
    areaId?: string;
    purpose?: string;
    type?: string;
  }>();

  // If query params passed from Hero Search Widget, initialize valuation state
  useEffect(() => {
    if (params.area || params.purpose || params.type) {
      setInitialFromHero({
        areaName: params.area,
        areaId: params.areaId,
        purpose: (params.purpose as ValuationPurpose) || "sale",
        propertyType: (params.type as ValuationPropertyType) || "apartment",
      });
    }
  }, [params.area, params.areaId, params.purpose, params.type, setInitialFromHero]);

  return (
    <AppChrome active="search">
      <JsonLd
        nodes={[
          valuationToolSchema(PAGE_PATH),
          breadcrumbSchema(PAGE_CRUMBS),
          faqPageSchema(VALUATION_FAQ, PAGE_URL),
        ]}
      />
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Title Section */}
        <View style={styles.heroIntro}>
          <View style={styles.eyebrow}>
            <Sparkles color={colors.greenOnLight} size={15} strokeWidth={2.4} />
            <Text style={styles.eyebrowText}>{t("valuation.engineEyebrow")}</Text>
          </View>
          <Text style={[styles.mainHeading, isPhone && styles.mainHeadingPhone]}>
            {t("valuation.title")}
          </Text>
          <Text style={styles.subHeading}>
            {t("valuation.subtitle")}
          </Text>

          {/* Trust Value Badges */}
          <View style={[styles.trustBadgeRow, isPhone && styles.trustBadgeRowPhone]}>
            <View style={styles.trustBadge}>
              <ShieldCheck color={colorTokens.brandText} size={16} strokeWidth={2.2} />
              <Text style={styles.trustBadgeText}>{t("valuation.badges.free")}</Text>
            </View>
            <View style={styles.trustBadge}>
              <TrendingUp color={colorTokens.brandText} size={16} strokeWidth={2.2} />
              <Text style={styles.trustBadgeText}>{t("valuation.badges.dynamics")}</Text>
            </View>
            <View style={styles.trustBadge}>
              <FileCheck2 color={colorTokens.brandText} size={16} strokeWidth={2.2} />
              <Text style={styles.trustBadgeText}>{t("valuation.badges.comparable")}</Text>
            </View>
          </View>
        </View>

        {/* Wizard Card Container */}
        <View style={styles.wizardSection}>
          <InstantValuationWizard />
        </View>

        {/* Informational Guidance Section: How Valuation Works in Dhaka */}
        <View style={[styles.infoSection, isPhone && styles.infoSectionPhone]}>
          <Text style={styles.infoSectionTitle}>{t("valuation.howItWorksTitle")}</Text>
          <View style={[styles.infoGrid, isPhone && styles.infoGridPhone]}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardNumber}>01</Text>
              <Text style={styles.infoCardTitle}>{t("valuation.howItWorks1Title")}</Text>
              <Text style={styles.infoCardDesc}>
                {t("valuation.howItWorks1Desc")}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardNumber}>02</Text>
              <Text style={styles.infoCardTitle}>{t("valuation.howItWorks2Title")}</Text>
              <Text style={styles.infoCardDesc}>
                {t("valuation.howItWorks2Desc")}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardNumber}>03</Text>
              <Text style={styles.infoCardTitle}>{t("valuation.howItWorks3Title")}</Text>
              <Text style={styles.infoCardDesc}>
                {t("valuation.howItWorks3Desc")}
              </Text>
            </View>
          </View>
        </View>

        {/* The questions behind the FAQPage markup above. Google accepts that
            markup only while the same text is visible here. */}
        <View style={[styles.faqSection, isPhone && styles.faqSectionPhone]}>
          <Text style={styles.infoSectionTitle}>Dhaka Property Valuation: Common Questions</Text>
          {VALUATION_FAQ.map((entry) => (
            <View key={entry.question} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{entry.question}</Text>
              <Text style={styles.faqAnswer}>{entry.answer}</Text>
            </View>
          ))}
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 24,
  },
  containerPhone: {
    paddingVertical: 12,
  },
  heroIntro: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorTokens.brandSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: 14,
  },
  eyebrowText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
    letterSpacing: 0.8,
  },
  mainHeading: {
    fontSize: 36,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  mainHeadingPhone: {
    fontSize: 28,
  },
  subHeading: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  trustBadgeRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  trustBadgeRowPhone: {
    flexDirection: "column",
    alignItems: "center",
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 8,
    ...shadow,
  },
  trustBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  wizardSection: {
    width: "100%",
    marginBottom: 48,
  },
  infoSection: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    padding: 32,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...shadow,
  },
  infoSectionPhone: {
    padding: 20,
  },
  infoSectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 24,
    textAlign: "center",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 20,
  },
  infoGridPhone: {
    flexDirection: "column",
  },
  infoCard: {
    flex: 1,
    backgroundColor: colorTokens.surfaceSunken,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
  },
  infoCardNumber: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  infoCardDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 18,
  },
  faqSection: {
    marginTop: 24,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    padding: 32,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...shadow,
  },
  faqSectionPhone: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 20,
  },
});
