import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Store } from "@/components/icons";
import { router, type Href } from "expo-router";
import { colors, fonts, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";

export interface ToggleViewButtonProps {
  href?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md";
  /** Icon only, for narrow phone headers where the label pushed the page title to "Creat…". */
  iconOnly?: boolean;
}

/**
 * Leaves the seller portal for the public site. The storefront icon reads as
 * "the buyer site" even when the label is hidden on narrow phones, where the
 * seller menu also has a "Switch to buyer" row with the full label.
 */
export function ToggleViewButton({
  href = "/",
  onPress,
  style,
  size = "md",
  iconOnly = false,
}: ToggleViewButtonProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    onPress?.();
    if (href) {
      router.push(href as Href);
    }
  };

  return (
    <Pressable
      accessibilityLabel={t("seller.toggleView.aria")}
      accessibilityRole="link"
      // The icon-only button is 34-38px; this brings the tap area past 44px.
      hitSlop={iconOnly ? 6 : undefined}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.btn,
        size === "sm" && styles.btnSm,
        iconOnly && (size === "sm" ? styles.btnIconOnlySm : styles.btnIconOnly),
        isHovered && styles.btnHovered,
        pressed && styles.btnPressed,
        webPointer,
        style,
      ]}
    >
      <Store color={colors.ink} size={size === "sm" ? 14 : 15} strokeWidth={2} />
      {iconOnly ? null : (
        <Text style={[styles.text, size === "sm" && styles.textSm]}>
          {t("seller.toggleView.label")}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.OS === "web"
      ? ({
          transition: "all 0.15s ease",
          userSelect: "none",
        } as any)
      : {}),
  },
  btnSm: {
    height: 34,
    paddingHorizontal: 12,
    gap: 6,
  },
  btnIconOnly: {
    width: 38,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  btnIconOnlySm: {
    width: 34,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  btnHovered: {
    backgroundColor: colors.soft,
    borderColor: "rgba(11, 26, 23, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  textSm: {
    fontSize: 12.5,
  },
});
