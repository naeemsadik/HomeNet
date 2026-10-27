import { useEffect, useRef } from "react";
import { Home } from "@/components/icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colorTokens, colors, fonts } from "@/theme";
import { AppLink } from "./ui";

/**
 * Mark a DOM node (and all its descendants) as untranslatable.
 *
 * React Native Web strips unknown HTML props like `translate` and `className`,
 * so the only reliable way to shield text from Google Translate is to set
 * `translate="no"` and add the `notranslate` class directly on the DOM node
 * via a ref after mount.
 */
function useNoTranslate<T = any>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    el.setAttribute("translate", "no");
    el.classList.add("notranslate");
  }, []);
  return ref;
}

export function Brand({
  compact = false,
  size = "default",
  href = "/",
  onPress,
  variant = "dark",
  subtitle,
}: {
  compact?: boolean;
  size?: "compact" | "default" | "large";
  href?: string;
  onPress?: () => void;
  variant?: "dark" | "light";
  subtitle?: string;
}) {
  const isLarge = size === "large";
  const isCompact = compact || size === "compact";
  const isLight = variant === "light";
  const brandRef = useNoTranslate<View>();

  return (
    <AppLink
      href={href as any}
      accessibilityLabel="HomeNet home"
      onPress={onPress}
      style={[styles.link, isCompact && styles.linkCompact]}
    >
      <View
        style={[
          styles.mark,
          isCompact && styles.markCompact,
          isLarge && styles.markLarge,
        ]}
      >
        <Home
          color={colors.white}
          size={isCompact ? 16 : isLarge ? 22 : 20}
          strokeWidth={2}
        />
      </View>
      <View ref={brandRef} style={styles.textWrap}>
        <Text
          style={[
            styles.text,
            isCompact && styles.textCompact,
            isLarge && styles.textLarge,
            isLight && { color: "#FFFFFF" },
          ]}
        >
          Home<Text style={{ color: "#04cf92" }}>net</Text>
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.subtitle,
              isLight && styles.subtitleLight,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </AppLink>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 9, flexShrink: 1, minWidth: 0, overflow: "hidden" },
  linkCompact: { gap: 6, flexShrink: 1, minWidth: 0, overflow: "hidden" },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#04cf92",
    flexShrink: 0,
  },
  markCompact: { width: 28, height: 28, borderRadius: 14, flexShrink: 0 },
  markLarge: { width: 40, height: 40, borderRadius: 20, flexShrink: 0 },
  text: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 18,
    letterSpacing: -0.4,
    fontWeight: "800",
  },
  textCompact: { fontSize: 14.5, lineHeight: 18 },
  textLarge: { fontSize: 20.5, letterSpacing: -0.4 },
  textWrap: { justifyContent: "center", flexShrink: 1, minWidth: 0, overflow: "hidden" },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 13,
    color: colorTokens.muted,
    letterSpacing: -0.1,
  },
  subtitleLight: {
    color: "rgba(255, 255, 255, 0.75)",
  },
});
