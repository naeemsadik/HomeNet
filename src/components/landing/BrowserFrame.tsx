import React, { type ReactNode } from "react";
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Lock } from "@/components/icons";
import { colorTokens, fonts, radius } from "@/theme";
import { useTranslation } from "@/i18n";

interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function BrowserFrame({
  children,
  url,
  style,
  contentStyle,
}: BrowserFrameProps) {
  const { t } = useTranslation();
  const displayUrl = url ?? t("landing.browserFrame.url");

  return (
    <View style={[styles.browser, style]}>
      {/* Chrome Top Bar */}
      <View style={styles.chromeBar}>
        <View style={styles.windowControls}>
          <View style={[styles.dot, styles.dotClose]} />
          <View style={[styles.dot, styles.dotMinimize]} />
          <View style={[styles.dot, styles.dotMaximize]} />
        </View>

        <View style={styles.addressBar}>
          <Lock color={colorTokens.muted} size={11} strokeWidth={2.5} />
          <Text numberOfLines={1} style={styles.addressText}>
            {displayUrl}
          </Text>
        </View>

        <View style={styles.chromePlaceholder} />
      </View>

      {/* Browser Body / Viewport */}
      <View style={[styles.body, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  browser: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colorTokens.border,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 14px 28px rgba(11, 26, 23, 0.12)" },
      default: {
        shadowColor: colorTokens.shadow,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 1,
        shadowRadius: 28,
        elevation: 8,
      },
    }),
  },
  chromeBar: {
    height: 38,
    backgroundColor: colorTokens.surfaceSunken,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  windowControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 60,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotClose: {
    backgroundColor: "#F87171",
  },
  dotMinimize: {
    backgroundColor: "#FBBF24",
  },
  dotMaximize: {
    backgroundColor: colorTokens.brand,
  },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorTokens.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    maxWidth: 260,
    width: "100%",
    justifyContent: "center",
  },
  addressText: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: "500",
  },
  chromePlaceholder: {
    width: 60,
  },
  body: {
    backgroundColor: colorTokens.canvas,
    overflow: "hidden",
  },
});
