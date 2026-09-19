import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { MetricTile } from "./MetricTile";
import type { ResolvedLandingMetrics } from "@/hooks/useLandingMetrics";
import { landingCopy } from "@/content/landingCopy";

interface ScaleBandProps {
  metrics: ResolvedLandingMetrics;
  inView?: boolean;
}

export function ScaleBand({ metrics, inView = true }: ScaleBandProps) {
  const { isPhone, isTablet } = useResponsive();
  const { activeListings, forSale, forRent, areasCovered, categories, isLoading } =
    metrics;

  // Low-volume guard (< 10 listings): render qualitative trust row only
  const showNumeric = !isLoading && activeListings >= 10;

  return (
    <View style={styles.container}>
      {showNumeric ? (
        <View style={styles.gridWrap}>
          <View style={[styles.grid, isTablet && styles.gridTablet, isPhone && styles.gridPhone]}>
            <MetricTile
              label="Active listings"
              value={activeListings}
              trigger={inView}
            />
            <MetricTile label="For sale" value={forSale} trigger={inView} />
            <MetricTile label="To rent" value={forRent} trigger={inView} />
            <MetricTile label="Dhaka areas" value={areasCovered} trigger={inView} />
            <MetricTile label="Property types" value={categories} trigger={inView} />
          </View>

          {/* Qualitative row beneath */}
          <View style={styles.qualitativeRow}>
            <ShieldCheck color="#0F6D55" size={16} strokeWidth={2.2} />
            <Text style={styles.qualitativeText}>
              {landingCopy.scale.qualitativeFallback}
            </Text>
          </View>
        </View>
      ) : (
        /* Standalone qualitative trust card for low-volume or loading */
        <View style={styles.standaloneCard}>
          <View style={styles.trustIconWell}>
            <ShieldCheck color="#0F6D55" size={24} strokeWidth={2.2} />
          </View>
          <Text style={styles.standaloneTitle}>Verified & Direct Marketplace</Text>
          <Text style={styles.standaloneCopy}>
            {landingCopy.scale.qualitativeFallback}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  gridWrap: {
    width: "100%",
    gap: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
  },
  gridTablet: {
    gap: 12,
  },
  gridPhone: {
    gap: 10,
  },
  qualitativeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(4, 207, 146, 0.2)",
    flexWrap: "wrap",
  },
  qualitativeText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  standaloneCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  trustIconWell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  standaloneTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 18,
    fontWeight: "700",
  },
  standaloneCopy: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 600,
    lineHeight: 20,
  },
});
