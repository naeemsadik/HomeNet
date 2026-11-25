import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { layout } from "@/theme";
import { PHOTO_FEATURE_CARDS } from "@/content/homeFeatureSections";
import { AccountPromptBanner } from "./AccountPromptBanner";
import { FeaturePhotoCard } from "./FeaturePhotoCard";
import { ProductPreviewShowcase } from "./ProductPreviewShowcase";

export const HomeFeatureSections = memo(function HomeFeatureSections() {
  const { t } = useTranslation();
  const { isPhone, isTablet, width, containerMaxWidth } = useResponsive();

  const isTabletViewport =
    (width != null && width >= 768 && width < 1024) || (isTablet && !isPhone);
  const isPhoneViewport = (width != null && width < 768) || isPhone;

  const padHorizontal = isPhone
    ? layout.gutterPhone
    : isTablet
      ? layout.gutterTablet
      : layout.gutter;

  const maxWidth = Math.min(containerMaxWidth ?? 1200, 1200);
  const containerGap = isPhoneViewport ? 16 : isTabletViewport ? 20 : 24;

  return (
    <View style={[styles.container, { maxWidth, paddingHorizontal: padHorizontal, gap: containerGap }]}>
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
          Tier 2 — Product Preview Showcase (Desktop & Tablet >= 768px)
      ───────────────────────────────────────────────────────────── */}
      {!isPhoneViewport ? (
        <View
          role="region"
          accessibilityLabel={t("home.featureSections.showcase.regionLabel")}
          style={[
            styles.section,
            isTabletViewport
              ? styles.showcaseSectionTablet
              : styles.showcaseSectionDesktop,
          ]}
        >
          <ProductPreviewShowcase />
        </View>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          Tier 3 — 6-Card Photo Grid (3 cols x 2 rows on desktop, 2 cols x 3 rows on tablet)
      ───────────────────────────────────────────────────────────── */}
      <View
        role="region"
        accessibilityLabel={t("home.featureSections.photoCards.regionLabel")}
        style={styles.section}
      >
        <View
          style={[
            styles.grid,
            isPhoneViewport
              ? styles.gridPhone
              : isTabletViewport
                ? styles.gridTablet
                : styles.gridDesktop,
          ]}
        >
          {PHOTO_FEATURE_CARDS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.gridItem,
                isPhoneViewport
                  ? styles.gridItemPhone
                  : isTabletViewport
                    ? styles.gridItemTablet
                    : styles.gridItemDesktop,
              ]}
            >
              <FeaturePhotoCard item={item} />
            </View>
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
  showcaseSectionDesktop: {
    marginBottom: 16,
  },
  showcaseSectionTablet: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    width: "100%",
  },
  gridDesktop: {
    gap: 24,
  },
  gridTablet: {
    gap: 20,
  },
  gridPhone: {
    gap: 16,
  },
  gridItem: {
    flexGrow: 1,
    flexShrink: 0,
  },
  gridItemDesktop: {
    width: "calc((100% - 48px) / 3)" as any,
    minWidth: 280,
  },
  gridItemTablet: {
    width: "calc((100% - 20px) / 2)" as any,
    minWidth: 280,
  },
  gridItemPhone: {
    width: "100%",
  },
});
