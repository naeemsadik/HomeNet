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
import { colorTokens, colors, fonts, radius, shadow } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { InstantValuationWizard } from "../components/InstantValuationWizard";
import type { ValuationPropertyType, ValuationPurpose } from "../types/valuationTypes";

export function InstantValuationScreen() {
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
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Title Section */}
        <View style={styles.heroIntro}>
          <View style={styles.eyebrow}>
            <Sparkles color={colors.greenOnLight} size={15} strokeWidth={2.4} />
            <Text style={styles.eyebrowText}>DHAKA REAL ESTATE VALUATION ENGINE</Text>
          </View>
          <Text style={[styles.mainHeading, isPhone && styles.mainHeadingPhone]}>
            Instant Property Valuation
          </Text>
          <Text style={styles.subHeading}>
            Get a verified, data-backed estimate of your property’s sale price and rental yield in under a minute — powered by verified transactions across 26 Dhaka wards.
          </Text>

          {/* Trust Value Badges */}
          <View style={[styles.trustBadgeRow, isPhone && styles.trustBadgeRowPhone]}>
            <View style={styles.trustBadge}>
              <ShieldCheck color={colorTokens.brandText} size={16} strokeWidth={2.2} />
              <Text style={styles.trustBadgeText}>100% Free · No Broker Inquiries</Text>
            </View>
            <View style={styles.trustBadge}>
              <TrendingUp color={colorTokens.brandText} size={16} strokeWidth={2.2} />
              <Text style={styles.trustBadgeText}>Dhaka Market Dynamics Included</Text>
            </View>
            <View style={styles.trustBadge}>
              <FileCheck2 color={colorTokens.brandText} size={16} strokeWidth={2.2} />
              <Text style={styles.trustBadgeText}>Verified Comparable Listings</Text>
            </View>
          </View>
        </View>

        {/* Wizard Card Container */}
        <View style={styles.wizardSection}>
          <InstantValuationWizard />
        </View>

        {/* Informational Guidance Section: How Valuation Works in Dhaka */}
        <View style={[styles.infoSection, isPhone && styles.infoSectionPhone]}>
          <Text style={styles.infoSectionTitle}>How HomeNet Calculates Property Valuations</Text>
          <View style={[styles.infoGrid, isPhone && styles.infoGridPhone]}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardNumber}>01</Text>
              <Text style={styles.infoCardTitle}>Ward & Subzone Baselines</Text>
              <Text style={styles.infoCardDesc}>
                We track price-per-sqft data across Gulshan, Banani, Dhanmondi, Uttara, Bashundhara, and 21 other zones, adjusted for road width and sector access.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardNumber}>02</Text>
              <Text style={styles.infoCardTitle}>Micro-Factors & Utilities</Text>
              <Text style={styles.infoCardDesc}>
                South-facing orientation (+6%), sweet-spot floors (4th–8th), dedicated parking bays, and standby backup generators are mathematically accounted for.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardNumber}>03</Text>
              <Text style={styles.infoCardTitle}>Active Inventory Benchmark</Text>
              <Text style={styles.infoCardDesc}>
                Your valuation is cross-checked against actively listed and recently sold verified properties on HomeNet to generate high-confidence estimates.
              </Text>
            </View>
          </View>
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
});
