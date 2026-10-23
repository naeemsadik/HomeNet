import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Check, X } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export function ContrastColumns() {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();

  const withoutItems = useMemo(() => [
    t("landing.contrast.without1"),
    t("landing.contrast.without2"),
    t("landing.contrast.without3"),
  ], [t]);

  const withItems = useMemo(() => [
    t("landing.contrast.with1"),
    t("landing.contrast.with2"),
    t("landing.contrast.with3"),
  ], [t]);

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {/* Left Column: Without HomeNet */}
      <View style={[styles.column, styles.columnWithout]}>
        <View style={styles.colHeader}>
          <Text style={styles.colTitleWithout}>{t("landing.contrast.withoutTitle")}</Text>
        </View>

        <View style={styles.itemsList}>
          {withoutItems.map((text, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemIconWithout}>
                <X color="#D96A24" size={14} strokeWidth={2.5} />
              </View>
              <Text style={styles.itemTextWithout}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Right Column: With HomeNet */}
      <View style={[styles.column, styles.columnWith]}>
        <View style={styles.colHeader}>
          <Text style={styles.colTitleWith}>{t("landing.contrast.withTitle")}</Text>
        </View>

        <View style={styles.itemsList}>
          {withItems.map((text, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemIconWith}>
                <Check color="#75480B" size={14} strokeWidth={2.5} />
              </View>
              <Text style={styles.itemTextWith}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 24,
    width: "100%",
  },
  containerTablet: {
    flexDirection: "column",
    gap: 20,
  },
  column: {
    flex: 1,
    borderRadius: 20,
    padding: 28,
  },
  // Recessed: sits back on the canvas. Elevation via surface tone, no shadow.
  columnWithout: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  // Raised: elevation declared ONCE, as shadow. No border, no colour bar.
  columnWith: {
    backgroundColor: colorTokens.surface,
    ...(Platform.select({
      web: { boxShadow: "0 12px 32px -12px rgba(11, 26, 23, 0.18)" },
      default: {
        shadowColor: colorTokens.ink,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 5,
      },
    }) as any),
  },
  colHeader: {
    marginBottom: 20,
    gap: 8,
  },
  colTitleWithout: {
    color: "#1A1612",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
  },
  colTitleWith: {
    color: "#1A1612",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
  },
  itemsList: {
    gap: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  itemIconWithout: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(244, 130, 58, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  itemTextWithout: {
    color: "#6E6458",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  itemIconWith: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F9F4EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  itemTextWith: {
    color: "#1A1612",
    fontFamily: fonts.medium,
    fontSize: 14.5,
    lineHeight: 22,
    flex: 1,
  },
});
