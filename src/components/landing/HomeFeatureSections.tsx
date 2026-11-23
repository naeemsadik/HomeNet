import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { layout } from "@/theme";
import {
  PHOTO_FEATURE_CARDS,
  UTILITY_FEATURE_CARDS,
} from "@/content/homeFeatureSections";
import { AccountPromptBanner } from "./AccountPromptBanner";
import { FeaturePhotoCard } from "./FeaturePhotoCard";
import { UtilityLinkCard } from "./UtilityLinkCard";

export const HomeFeatureSections = memo(function HomeFeatureSections() {
  const { t } = useTranslation();
  const { isPhone, isTablet, containerMaxWidth } = useResponsive();

  const padHorizontal = isPhone
    ? layout.gutterPhone
    : isTablet
      ? layout.gutterTablet
      : layout.gutter;

  const maxWidth = Math.min(containerMaxWidth ?? 1200, 1200);

  return (
    <View style={[styles.container, { maxWidth, paddingHorizontal: padHorizontal }]}>
      {/* ─────────────────────────────────────────────────────────────
          Tier 1 — Account & Alerts Banner
      ───────────────────────────────────────────────────────────── */}
      <View
        role="region"
        accessibilityLabel={t("home.featureSections.accountBanner.ariaLabel")}
        style={styles.section}
      >
        <AccountPromptBanner />
      </View>

      {/* ─────────────────────────────────────────────────────────────
          Tier 2 — 3-Column Core Action Photo Cards
      ───────────────────────────────────────────────────────────── */}
      <View
        role="region"
        accessibilityLabel={t("home.featureSections.photoCards.regionLabel")}
        style={styles.section}
      >
        <View style={styles.grid}>
          {PHOTO_FEATURE_CARDS.map((item) => (
            <FeaturePhotoCard item={item} key={item.id} />
          ))}
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          Tier 3 — 3-Column Utility Cards
      ───────────────────────────────────────────────────────────── */}
      <View
        role="region"
        accessibilityLabel={t("home.featureSections.utilityCards.regionLabel")}
        style={styles.section}
      >
        <View style={styles.grid}>
          {UTILITY_FEATURE_CARDS.map((item) => (
            <UtilityLinkCard item={item} key={item.id} />
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    gap: 32,
  },
  section: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    width: "100%",
  },
});
