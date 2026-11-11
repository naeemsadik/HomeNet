import React, { useEffect } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Building2, ArrowUpRight, RotateCcw } from "@/components/icons";
import { AppButton } from "@/components/ui";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { confidenceReasonText } from "../utils/confidenceText";
import type { ValuationPropertyType } from "../types/valuationTypes";

const CONFIDENCE_KEY = {
  high: "valuation.result.confidence.high",
  medium: "valuation.result.confidence.medium",
  low: "valuation.result.confidence.low",
} as const satisfies Record<string, TranslationKey>;

const TYPE_KEY: Record<ValuationPropertyType, TranslationKey> = {
  apartment: "valuation.wizard.location.apartment",
  house: "valuation.wizard.location.house",
  commercial: "valuation.wizard.location.commercial",
  land: "valuation.wizard.location.land",
};

/** Step 4: the estimate. One headline figure and its range, how much to trust it, what moved it, and what to do next. */
export function Step4ResultDashboard() {
  const { t, language } = useTranslation();
  const { form, result, isLoading, error, setCurrentStep, prefillPropertyWizard, executeValuation } =
    useInstantValuation();
  const { isPhone } = useResponsive();

  // If the page loaded straight on this step without a result, work one out.
  useEffect(() => {
    if (!result && !isLoading && !error) void executeValuation();
  }, [result, isLoading, error, executeValuation]);

  if (isLoading) {
    return (
      <View accessibilityLiveRegion="polite" style={styles.center}>
        <ActivityIndicator color={colorTokens.ink} size="large" />
        <Text style={styles.centerTitle}>{t("valuation.result.loading")}</Text>
        <Text style={styles.centerBody}>{t("valuation.result.loadingBody", { area: form.areaName })}</Text>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View accessibilityRole="alert" style={styles.center}>
        <Text style={styles.centerTitle}>{t("valuation.result.errorTitle")}</Text>
        <Text style={styles.centerBody}>{error || t("valuation.result.errorFallback")}</Text>
        <AppButton icon={RotateCcw} label={t("valuation.result.retry")} onPress={() => void executeValuation()} />
      </View>
    );
  }

  const isRent = result.purpose === "rent";
  const headline = isRent ? result.estimatedMonthlyRentFormatted : result.estimatedValueFormatted;
  const lowLabel = isRent ? result.lowMonthlyRentFormatted : result.lowEstimateFormatted;
  const highLabel = isRent ? result.highMonthlyRentFormatted : result.highEstimateFormatted;
  const low = isRent ? result.lowMonthlyRent : result.lowEstimate;
  const high = isRent ? result.highMonthlyRent : result.highEstimate;
  const mid = isRent ? result.estimatedMonthlyRent : result.estimatedValue;
  const markerAt = high > low ? Math.min(100, Math.max(0, ((mid - low) / (high - low)) * 100)) : 50;

  const rentPerSqft = result.sizeSqft > 0 ? Math.round(result.estimatedMonthlyRent / result.sizeSqft) : 0;
  const reason = result.confidenceBasis
    ? confidenceReasonText(
        result.confidenceBasis,
        { areaName: result.areaName, purpose: result.purpose, language },
        t,
      )
    : result.confidenceReason;

  const summary = t("valuation.result.summary", {
    type: t(TYPE_KEY[result.propertyType]),
    area: result.areaName,
    size: result.sizeSqft.toLocaleString("en-IN"),
  });

  return (
    <View>
      <Text style={styles.summary}>{summary}</Text>

      <Text style={styles.kicker}>{isRent ? t("valuation.result.forRent") : t("valuation.result.forSale")}</Text>
      <Text accessibilityRole="header" style={styles.headline}>
        {headline}
      </Text>

      <View style={styles.range}>
        <View style={styles.rangeTrack}>
          <View style={[styles.rangeMarker, { left: `${markerAt}%` }]} />
        </View>
        <View style={styles.rangeLabels}>
          <View>
            <Text style={styles.rangeCaption}>{t("valuation.result.low")}</Text>
            <Text style={styles.rangeValue}>{lowLabel}</Text>
          </View>
          <View style={styles.rangeRight}>
            <Text style={styles.rangeCaption}>{t("valuation.result.high")}</Text>
            <Text style={styles.rangeValue}>{highLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.trust}>
        <View style={styles.trustHeader}>
          <View style={styles.meter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.meterBar,
                  i < (result.confidenceScore === "high" ? 3 : result.confidenceScore === "medium" ? 2 : 1) &&
                    styles.meterBarOn,
                ]}
              />
            ))}
          </View>
          <Text style={styles.trustLabel}>{t(CONFIDENCE_KEY[result.confidenceScore])}</Text>
        </View>
        <Text style={styles.trustBody}>{reason}</Text>
        <Text style={styles.trustBody}>{t("valuation.result.disclaimer")}</Text>
      </View>

      <View style={[styles.stats, isPhone && styles.statsPhone]}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            {isRent ? t("valuation.result.perSqftRent") : t("valuation.result.perSqftSale")}
          </Text>
          <Text style={styles.statValue}>
            {isRent ? `BDT ${rentPerSqft.toLocaleString("en-IN")}` : result.pricePerSqftFormatted}
          </Text>
          {!isRent ? (
            <Text style={styles.statNote}>
              {t("valuation.result.vsArea", {
                area: result.areaName,
                avg: result.areaAveragePricePerSqftFormatted,
              })}
            </Text>
          ) : null}
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            {isRent ? t("valuation.result.forSale") : t("valuation.result.forRent")}
          </Text>
          <Text style={styles.statValue}>
            {isRent ? result.estimatedValueFormatted : result.estimatedMonthlyRentFormatted}
          </Text>
          <Text style={styles.statNote}>
            {t("valuation.result.yield", { yield: String(result.grossRentalYieldPct) })}
          </Text>
        </View>
      </View>

      {result.valueDrivers.length > 0 ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t("valuation.result.driversTitle")}
          </Text>
          <Text style={styles.sectionNote}>{t("valuation.result.driversNote", { area: result.areaName })}</Text>
          {result.valueDrivers.map((driver) => (
            <View key={driver.id} style={styles.driverRow}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={[styles.driverDelta, driver.deltaBdtPerSqft < 0 && styles.driverDeltaDown]}>
                {driver.formattedDelta}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.comparables.length > 0 ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t("valuation.result.comparablesTitle", { area: result.areaName })}
          </Text>
          <Text style={styles.sectionNote}>{t("valuation.result.comparablesNote")}</Text>
          {result.comparables.map((comp) => {
            // Only what the listing says: a missing size or room count is left out, not shown as 0.
            const meta = [
              comp.bedrooms ? t("valuation.result.beds", { count: String(comp.bedrooms) }) : null,
              comp.bathrooms ? t("valuation.result.baths", { count: String(comp.bathrooms) }) : null,
              comp.sizeSqft ? `${comp.sizeSqft.toLocaleString("en-IN")} sqft` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <Pressable
                accessibilityLabel={`${comp.title}, ${comp.priceFormatted}`}
                accessibilityRole="link"
                key={comp.id}
                onPress={() => router.push(`/property/${comp.id}` as never)}
                style={({ hovered }: { hovered?: boolean }) => [styles.comp, hovered && styles.compHovered, webPointer]}
              >
                {comp.imageUrl ? (
                  <Image accessibilityLabel={comp.title} source={{ uri: comp.imageUrl }} style={styles.compImage} />
                ) : (
                  <View style={[styles.compImage, styles.compImageEmpty]}>
                    <Building2 color={colorTokens.muted} size={24} strokeWidth={1.8} />
                  </View>
                )}
                <View style={styles.compBody}>
                  <Text style={styles.compPrice}>{comp.priceFormatted}</Text>
                  <Text numberOfLines={1} style={styles.compTitle}>
                    {comp.title}
                  </Text>
                  {meta ? <Text style={styles.compMeta}>{meta}</Text> : null}
                </View>
                {comp.isVerified ? <Text style={styles.compVerified}>{t("valuation.result.verified")}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={[styles.actions, isPhone && styles.actionsPhone]}>
        <AppButton variant="ghost" label={t("valuation.result.edit")} onPress={() => setCurrentStep(2)} />
        <View style={styles.listBlock}>
          <AppButton
            label={t("valuation.result.listCta")}
            onPress={prefillPropertyWizard}
            style={isPhone ? styles.listPhone : undefined}
            trailingIcon={ArrowUpRight}
          />
          <Text style={styles.listNote}>{t("valuation.result.listNote")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 12, paddingVertical: 56, paddingHorizontal: 8 },
  centerTitle: { fontSize: 20, fontFamily: fonts.bold, color: colorTokens.ink, textAlign: "center" },
  centerBody: { maxWidth: 420, fontSize: 14, lineHeight: 21, fontFamily: fonts.regular, color: colorTokens.muted, textAlign: "center" },

  summary: { fontSize: 14, fontFamily: fonts.medium, color: colorTokens.muted },
  kicker: { marginTop: 16, fontSize: 14, fontFamily: fonts.semiBold, color: colorTokens.body },
  headline: { marginTop: 4, fontSize: 40, lineHeight: 48, fontFamily: fonts.extraBold, color: colorTokens.ink },

  range: { marginTop: 16 },
  rangeTrack: { height: 6, borderRadius: 3, backgroundColor: colorTokens.surfaceSunken, borderWidth: 1, borderColor: colorTokens.divider, justifyContent: "center" },
  rangeMarker: { position: "absolute", width: 14, height: 14, marginLeft: -7, borderRadius: 7, backgroundColor: colorTokens.ink },
  rangeLabels: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  rangeRight: { alignItems: "flex-end" },
  rangeCaption: { fontSize: 13, fontFamily: fonts.regular, color: colorTokens.muted },
  rangeValue: { fontSize: 16, fontFamily: fonts.semiBold, color: colorTokens.ink },

  trust: { marginTop: 24, padding: 16, borderRadius: radius.card, backgroundColor: colorTokens.surfaceSunken, gap: 8 },
  trustHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  meter: { flexDirection: "row", gap: 3 },
  meterBar: { width: 18, height: 6, borderRadius: 3, backgroundColor: colorTokens.divider },
  meterBarOn: { backgroundColor: colorTokens.ink },
  trustLabel: { fontSize: 14, fontFamily: fonts.semiBold, color: colorTokens.ink },
  trustBody: { fontSize: 13, lineHeight: 19, fontFamily: fonts.regular, color: colorTokens.body },

  stats: { marginTop: 16, flexDirection: "row", gap: 12 },
  statsPhone: { flexDirection: "column" },
  stat: { flex: 1, padding: 16, borderRadius: radius.card, borderWidth: 1, borderColor: colorTokens.divider, backgroundColor: colorTokens.surface },
  statLabel: { fontSize: 13, fontFamily: fonts.medium, color: colorTokens.muted },
  statValue: { marginTop: 4, fontSize: 20, fontFamily: fonts.bold, color: colorTokens.ink },
  statNote: { marginTop: 4, fontSize: 13, fontFamily: fonts.regular, color: colorTokens.muted },

  section: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontFamily: fonts.bold, color: colorTokens.ink },
  sectionNote: { marginTop: 4, marginBottom: 12, fontSize: 13, lineHeight: 19, fontFamily: fonts.regular, color: colorTokens.muted },
  driverRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: colorTokens.divider },
  driverName: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colorTokens.body },
  driverDelta: { fontSize: 14, fontFamily: fonts.semiBold, color: colorTokens.brandText },
  driverDeltaDown: { color: colorTokens.errorText },

  comp: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colorTokens.divider },
  compHovered: { backgroundColor: colorTokens.surfaceSunken },
  compImage: { width: 72, height: 72, borderRadius: radius.card },
  compImageEmpty: { alignItems: "center", justifyContent: "center", backgroundColor: colorTokens.surfaceSunken },
  compBody: { flex: 1, minWidth: 0 },
  compPrice: { fontSize: 16, fontFamily: fonts.bold, color: colorTokens.ink },
  compTitle: { marginTop: 2, fontSize: 14, fontFamily: fonts.regular, color: colorTokens.body },
  compMeta: { marginTop: 2, fontSize: 13, fontFamily: fonts.regular, color: colorTokens.muted },
  compVerified: { fontSize: 13, fontFamily: fonts.semiBold, color: colorTokens.brandText },

  actions: { marginTop: 32, paddingTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colorTokens.divider },
  actionsPhone: { flexDirection: "column-reverse", alignItems: "stretch", gap: 12 },
  listBlock: { alignItems: "flex-end", gap: 6 },
  listPhone: { alignSelf: "stretch" },
  listNote: { fontSize: 13, fontFamily: fonts.regular, color: colorTokens.muted },
});
