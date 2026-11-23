import React, { memo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Link, router, type Href } from "expo-router";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

export interface AccountPromptBannerProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * "Stay organised. Sign in or create an account" Banner
 * - Desktop & Tablet (>= 768px): Horizontal flex layout with left text block and right crisp outlined button.
 * - Mobile (< 768px): Original stacked layout with self-aligned outlined button.
 */
export const AccountPromptBanner = memo(function AccountPromptBanner({
  style,
}: AccountPromptBannerProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { isPhone, width } = useResponsive();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  if (user) return null;

  const isMobile = isPhone || width < 768;

  const title = t("home.featureSections.accountBanner.title");
  const subtitle = t("home.featureSections.accountBanner.subtitle");
  const ctaText = t("home.featureSections.accountBanner.cta");

  const handleAuthAction = () => {
    if (user) {
      router.push("/saved" as Href);
    } else {
      useAuthModalStore.getState().open(() => router.push("/saved" as Href));
    }
  };

  const buttonStyle = isMobile ? styles.signInButtonMobile : styles.signInButtonDesktop;

  const buttonElement = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ctaText}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={(e) => {
        if (Platform.OS === "web") {
          e.preventDefault();
        }
        handleAuthAction();
      }}
      style={({ pressed }) => [
        buttonStyle,
        webPointer,
        hovered && styles.buttonHovered,
        focused && styles.buttonFocused,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={isMobile ? styles.buttonTextMobile : styles.buttonTextDesktop}>{ctaText}</Text>
    </Pressable>
  );

  if (isMobile) {
    return (
      <View style={[styles.cardMobile, style]}>
        <Text style={styles.titleMobile}>{title}</Text>
        <Text style={styles.subtitleMobile}>{subtitle}</Text>
        <Link
          asChild
          href="/saved"
          style={
            Platform.OS === "web"
              ? (StyleSheet.flatten([
                  styles.signInButtonMobile,
                  hovered && styles.buttonHovered,
                  focused && styles.buttonFocused,
                  webPointer,
                ]) as TextStyle)
              : undefined
          }
        >
          {buttonElement}
        </Link>
      </View>
    );
  }

  return (
    <View style={[styles.cardDesktop, style]}>
      <View style={styles.leftBlock}>
        <Text style={styles.titleDesktop}>{title}</Text>
        <Text style={styles.subtitleDesktop}>{subtitle}</Text>
      </View>
      <View style={styles.rightBlock}>
        <Link
          asChild
          href="/saved"
          style={
            Platform.OS === "web"
              ? (StyleSheet.flatten([
                  styles.signInButtonDesktop,
                  hovered && styles.buttonHovered,
                  focused && styles.buttonFocused,
                  webPointer,
                ]) as TextStyle)
              : undefined
          }
        >
          {buttonElement}
        </Link>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Mobile (< 768px): exact original stacked layout
  cardMobile: {
    width: "100%",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.lg,
    padding: 20,
    gap: 8,
  },
  titleMobile: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
  },
  subtitleMobile: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: colorTokens.muted,
  },
  signInButtonMobile: {
    alignSelf: "flex-start",
    marginTop: 8,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colorTokens.ink,
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextMobile: {
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    color: colorTokens.ink,
  },

  // Desktop & Tablet (>= 768px): horizontal flex layout inside maxWidth: 1200
  cardDesktop: {
    width: "100%",
    maxWidth: 1200,
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorTokens.border,
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftBlock: {
    flex: 1,
    paddingRight: 24,
    gap: 6,
  },
  titleDesktop: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
    letterSpacing: -0.3,
  },
  subtitleDesktop: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: colorTokens.muted,
  },
  rightBlock: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonDesktop: {
    borderWidth: 1.5,
    borderColor: colorTokens.ink,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colorTokens.surface,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonTextDesktop: {
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    lineHeight: 20,
    color: colorTokens.ink,
    textAlign: "center",
  },

  // Interactive states
  buttonHovered: {
    backgroundColor: "#F4F6F8",
  },
  buttonFocused: {
    outlineColor: colorTokens.brandText,
    outlineWidth: 2,
    outlineStyle: "solid",
    outlineOffset: 2,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
