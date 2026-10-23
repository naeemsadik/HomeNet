import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  LineChart,
  PlusCircle,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "@/components/icons";
import { colorTokens, colors, fonts, radius, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { notify } from "@/lib/alert";
import { useInstantValuation } from "../hooks/useInstantValuation";

export function Step4ResultDashboard() {
  const { t } = useTranslation();
  const {
    form,
    result,
    isLoading,
    loadingStage,
    error,
    setCurrentStep,
    prefillPropertyWizard,
    executeValuation,
  } = useInstantValuation();
  const { isPhone } = useResponsive();

  // If page loaded directly on step 4 without result or loading, trigger calculation
  useEffect(() => {
    if (!result && !isLoading && !error) {
      void executeValuation();
    }
  }, [result, isLoading, error, executeValuation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.spinnerWrap}>
            <ActivityIndicator color={colorTokens.brand} size="large" />
          </View>
          <Text style={styles.loadingHeading}>{t("valuation.step4.loadingHeading")}</Text>
          <Text style={styles.loadingStageText}>{loadingStage}</Text>

          <View style={styles.progressChecklist}>
            <View style={styles.checkItem}>
              <CheckCircle2 color={colors.greenOnLight} size={16} strokeWidth={2.4} />
              <Text style={styles.checkItemText}>{t("valuation.step4.checkStep1")}</Text>
            </View>
            <View style={styles.checkItem}>
              <CheckCircle2 color={colors.greenOnLight} size={16} strokeWidth={2.4} />
              <Text style={styles.checkItemText}>
                {t("valuation.step4.checkStep2", { area: form.areaName })}
              </Text>
            </View>
            <View style={styles.checkItem}>
              <CheckCircle2 color={colors.greenOnLight} size={16} strokeWidth={2.4} />
              <Text style={styles.checkItemText}>{t("valuation.step4.checkStep3")}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t("valuation.step4.errorTitle")}</Text>
        <Text style={styles.errorMessage}>{error || t("valuation.step4.errorMessageFallback")}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => executeValuation()}
          style={[styles.retryBtn, webPointer]}
        >
          <RotateCcw color={colorTokens.onBrand} size={16} strokeWidth={2.2} />
          <Text style={styles.retryBtnText}>{t("valuation.step4.retryBtn")}</Text>
        </Pressable>
      </View>
    );
  }

  const handleShare = () => {
    notify(
      t("valuation.step4.shareCopiedTitle"),
      t("valuation.step4.shareCopiedMsg")
    );
  };

  return (
    <View style={styles.container}>
      {/* Report Header */}
      <View style={[styles.reportHeader, isPhone && styles.reportHeaderPhone]}>
        <View style={styles.headerLeft}>
          <View style={styles.verifiedBadgeRow}>
            <View style={styles.verifiedBadge}>
              <ShieldCheck color={colorTokens.info} size={14} strokeWidth={2.4} />
              <Text style={styles.verifiedBadgeText}>{t("valuation.step4.badgeText")}</Text>
            </View>
            <Text style={styles.reportTimestamp}>{t("valuation.step4.today")}</Text>
          </View>

          <Text style={styles.propertyAddressTitle}>{result.addressFormatted}</Text>
          <Text style={styles.propertyMetaSubtitle}>
            {result.sizeSqft.toLocaleString()} Sqft · {form.bedrooms} Beds · {form.bathrooms} Baths · {form.facing.toUpperCase()}-Facing
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleShare}
          style={({ hovered }: any) => [
            styles.shareBtn,
            hovered && styles.shareBtnHovered,
            webPointer,
          ]}
        >
          <Share2 color={colorTokens.ink} size={16} strokeWidth={2} />
          <Text style={styles.shareBtnText}>{t("valuation.step4.shareReport")}</Text>
        </Pressable>
      </View>

      {/* Main Valuation Payoff Hero Banner */}
      <View style={styles.valuationHeroCard}>
        <View style={styles.heroGlow} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.estimateLabel}>
              {result.purpose === "rent"
                ? t("valuation.step4.estimatedMonthlyRent")
                : t("valuation.step4.estimatedMarketValue")}
            </Text>
            <Text style={styles.heroEstimatedValue}>{result.estimatedValueFormatted}</Text>
          </View>

          <View style={styles.confidencePill}>
            <BadgeCheck color={colors.greenOnLight} size={16} strokeWidth={2.4} />
            <Text style={styles.confidencePillText}>
              {result.confidenceScore === "high"
                ? t("valuation.step4.highConfidence")
                : t("valuation.step4.mediumConfidence")}{" "}
              ({result.confidencePct}%)
            </Text>
          </View>
        </View>

        {/* Range Bar: Low | Mid | High */}
        <View style={styles.rangeSection}>
          <View style={styles.rangeLabelsRow}>
            <View>
              <Text style={styles.rangeSubLabel}>{t("valuation.step4.lowEstimate")}</Text>
              <Text style={styles.rangeValueText}>{result.lowEstimateFormatted}</Text>
            </View>

            <View style={styles.midPointIndicator}>
              <Text style={styles.rangeMidLabel}>{t("valuation.step4.midMarket")}</Text>
              <Text style={styles.rangeMidValueText}>{result.estimatedValueFormatted}</Text>
            </View>

            <View style={styles.rangeHighAlign}>
              <Text style={styles.rangeSubLabel}>{t("valuation.step4.highEstimate")}</Text>
              <Text style={styles.rangeValueText}>{result.highEstimateFormatted}</Text>
            </View>
          </View>

          {/* Graphical Range Bar */}
          <View style={styles.rangeBarTrack}>
            <View style={styles.rangeBarFill} />
            <View style={styles.rangeBarPin} />
          </View>
        </View>

        <Text style={styles.confidenceExplanation}>{result.confidenceReason}</Text>
      </View>

      {/* Metrics Grid: Rate per Sqft, Rental Yield, YoY Growth */}
      <View style={[styles.metricsGrid, isPhone && styles.metricsGridPhone]}>
        {/* Metric 1: Rate Per Sqft */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>{t("valuation.step4.ratePerSqft")}</Text>
            <View style={styles.deltaChip}>
              <TrendingUp color={colorTokens.brandText} size={12} strokeWidth={2.4} />
              <Text style={styles.deltaChipText}>
                {result.pricePerSqftDeltaPct >= 0 ? "+" : ""}{result.pricePerSqftDeltaPct}%
              </Text>
            </View>
          </View>
          <Text style={styles.metricMainValue}>{result.pricePerSqftFormatted}</Text>
          <Text style={styles.metricFootnote}>
            {t("valuation.step4.areaAvgFootnote", {
              area: result.areaName,
              avg: result.areaAveragePricePerSqftFormatted,
            })}
          </Text>
        </View>

        {/* Metric 2: Estimated Rental Yield */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>{t("valuation.step4.rentalYield")}</Text>
            <WalletCards color={colorTokens.brandText} size={16} strokeWidth={2} />
          </View>
          <Text style={styles.metricMainValue}>{result.estimatedMonthlyRentFormatted}</Text>
          <Text style={styles.metricFootnote}>
            {t("valuation.step4.grossYield", { yield: String(result.grossRentalYieldPct) })}
          </Text>
        </View>

        {/* Metric 3: Market Demand */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>
              {t("valuation.step4.marketDemand", { area: result.areaName })}
            </Text>
            <LineChart color={colorTokens.info} size={16} strokeWidth={2} />
          </View>
          <Text style={[styles.metricMainValue, { color: colorTokens.info }]}>
            {result.marketMetric.marketDemand}
          </Text>
          <Text style={styles.metricFootnote}>
            {t("valuation.step4.appreciationYoY", {
              growth: String(result.marketMetric.yearOverYearGrowthPct),
            })}
          </Text>
        </View>
      </View>

      {/* Value Drivers Section */}
      {result.valueDrivers.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Sparkles color={colors.greenOnLight} size={18} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>{t("valuation.step4.driversTitle")}</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {t("valuation.step4.driversSubtitle")}
          </Text>

          <View style={styles.driversList}>
            {result.valueDrivers.map((driver) => (
              <View key={driver.id} style={styles.driverRow}>
                <View style={styles.driverLeft}>
                  <View style={styles.driverCheckCircle}>
                    <Check color={colorTokens.onBrand} size={12} strokeWidth={3} />
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverDesc}>{driver.description}</Text>
                  </View>
                </View>
                <View style={styles.driverDeltaBadge}>
                  <Text style={styles.driverDeltaText}>{driver.formattedDelta}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Comparable Verified Properties */}
      {result.comparables.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Building2 color={colors.greenOnLight} size={18} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>
              {t("valuation.step4.comparablesTitle", { area: result.areaName })}
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {t("valuation.step4.comparablesSubtitle")}
          </Text>

          <View style={[styles.comparablesGrid, isPhone && styles.comparablesGridPhone]}>
            {result.comparables.map((comp) => (
              <View key={comp.id} style={[styles.compCard, isPhone && styles.compCardPhone]}>
                <Image source={{ uri: comp.imageUrl }} style={styles.compImage} />
                <View style={styles.compBody}>
                  <View style={styles.compHeaderRow}>
                    <Text style={styles.compPrice}>{comp.priceFormatted}</Text>
                    <View style={styles.similarityBadge}>
                      <Text style={styles.similarityText}>
                        {t("valuation.step4.matchPercent", { score: String(comp.similarityScore) })}
                      </Text>
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.compTitle}>
                    {comp.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.compAddress}>
                    {comp.address}
                  </Text>
                  <View style={styles.compMetaRow}>
                    <Text style={styles.compMetaText}>
                      {comp.bedrooms} Beds · {comp.bathrooms} Baths · {comp.sizeSqft} Sqft
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Next Step Action Cards */}
      <View style={styles.actionsContainer}>
        {/* Primary CTA: List on HomeNet */}
        <View style={styles.listCtaCard}>
          <View style={styles.listCtaLeft}>
            <View style={styles.listCtaIconBox}>
              <PlusCircle color={colorTokens.onBrand} size={24} strokeWidth={2.2} />
            </View>
            <View style={styles.listCtaContent}>
              <Text style={styles.listCtaTitle}>{t("valuation.step4.readyToSell")}</Text>
              <Text style={styles.listCtaSubtitle}>
                {t("valuation.step4.readyToSellSub")}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={prefillPropertyWizard}
            style={({ pressed, hovered }: any) => [
              styles.primaryListBtn,
              isPhone && styles.primaryListBtnPhone,
              hovered && styles.primaryListBtnHovered,
              pressed && { opacity: 0.9 },
              webPointer,
            ]}
          >
            <Text style={styles.primaryListBtnText}>{t("valuation.step4.listPropertyCTA")}</Text>
            <ArrowUpRight color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Recalculate / Edit CTA */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setCurrentStep(2)}
          style={({ hovered }: any) => [
            styles.recalcBtn,
            hovered && styles.recalcBtnHovered,
            webPointer,
          ]}
        >
          <RotateCcw color={colorTokens.ink} size={16} strokeWidth={2} />
          <Text style={styles.recalcBtnText}>{t("valuation.step4.recalcCTA")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    padding: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...shadow,
  },
  spinnerWrap: {
    marginBottom: 20,
  },
  loadingHeading: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingStageText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colorTokens.brandText,
    marginBottom: 24,
    textAlign: "center",
  },
  progressChecklist: {
    width: "100%",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    paddingTop: 18,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkItemText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colorTokens.errorText,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginBottom: 20,
    textAlign: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brand,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    gap: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colorTokens.onBrand,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 16,
  },
  reportHeaderPhone: {
    flexDirection: "column",
  },
  headerLeft: {
    flex: 1,
  },
  verifiedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.infoSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 6,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colorTokens.info,
  },
  reportTimestamp: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  propertyAddressTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  propertyMetaSubtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.12)",
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  shareBtnHovered: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  shareBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  valuationHeroCard: {
    backgroundColor: colorTokens.ink,
    borderRadius: radius.xl,
    padding: 28,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
    ...shadow,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(141, 92, 18, 0.18)",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  estimateLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colorTokens.brand,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroEstimatedValue: {
    fontSize: 38,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  confidencePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 6,
  },
  confidencePillText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.brand,
  },
  rangeSection: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
  },
  rangeLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  rangeSubLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "rgba(255, 255, 255, 0.65)",
    marginBottom: 2,
  },
  rangeValueText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  midPointIndicator: {
    alignItems: "center",
  },
  rangeMidLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.brand,
    marginBottom: 2,
  },
  rangeMidValueText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colorTokens.brand,
  },
  rangeHighAlign: {
    alignItems: "flex-end",
  },
  rangeBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    position: "relative",
    justifyContent: "center",
  },
  rangeBarFill: {
    position: "absolute",
    left: "15%",
    right: "15%",
    height: 8,
    borderRadius: 4,
    backgroundColor: colorTokens.brand,
  },
  rangeBarPin: {
    position: "absolute",
    left: "50%",
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colorTokens.brand,
  },
  confidenceExplanation: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "rgba(255, 255, 255, 0.70)",
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  metricsGridPhone: {
    flexDirection: "column",
  },
  metricCard: {
    flex: 1,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: radius.lg,
    padding: 16,
    ...shadow,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  deltaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  deltaChipText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  metricMainValue: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  metricFootnote: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  boldText: {
    fontFamily: fonts.bold,
    color: colorTokens.ink,
  },
  sectionCard: {
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
    ...shadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginBottom: 16,
  },
  driversList: {
    gap: 12,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.06)",
    gap: 12,
  },
  driverLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  driverCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  driverDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
  },
  driverDeltaBadge: {
    backgroundColor: colorTokens.brandSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  driverDeltaText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  comparablesGrid: {
    flexDirection: "row",
    gap: 14,
  },
  comparablesGridPhone: {
    flexDirection: "column",
  },
  compCard: {
    flex: 1,
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  compCardPhone: {
    width: "100%",
  },
  compImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E2E8F0",
  },
  compBody: {
    padding: 12,
  },
  compHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  compPrice: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
  },
  similarityBadge: {
    backgroundColor: "rgba(141, 92, 18, 0.20)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  similarityText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  compTitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.ink,
    marginBottom: 2,
  },
  compAddress: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginBottom: 6,
  },
  compMetaRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.06)",
    paddingTop: 6,
  },
  compMetaText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 10,
  },
  listCtaCard: {
    backgroundColor: colorTokens.surface,
    borderWidth: 2,
    borderColor: colorTokens.brand,
    borderRadius: radius.xl,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    ...shadow,
  },
  listCtaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 280,
  },
  listCtaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  listCtaContent: {
    flex: 1,
  },
  listCtaTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  listCtaSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 18,
  },
  primaryListBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brand,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    gap: 8,
  },
  primaryListBtnPhone: {
    width: "100%",
    justifyContent: "center",
  },
  primaryListBtnHovered: {
    backgroundColor: colorTokens.brandHover,
  },
  primaryListBtnText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colorTokens.onBrand,
  },
  recalcBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surfaceSunken,
    gap: 8,
  },
  recalcBtnHovered: {
    backgroundColor: "rgba(11, 26, 23, 0.08)",
  },
  recalcBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
});
