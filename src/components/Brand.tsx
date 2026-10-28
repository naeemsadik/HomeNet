import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colorTokens, fonts } from "@/theme";
import { BrandMark, BrandWordmark } from "./BrandArt";
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
  const tone = isLight ? "light" : "dark";
  const brandRef = useNoTranslate<View>();

  return (
    <AppLink
      href={href as any}
      accessibilityLabel="HomeNet home"
      onPress={onPress}
      style={[styles.link, isCompact && styles.linkCompact]}
    >
      <View style={styles.mark}>
        <BrandMark size={isCompact ? 30 : isLarge ? 40 : 36} tone={tone} />
      </View>
      <View ref={brandRef} style={styles.textWrap}>
        <BrandWordmark height={isCompact ? 15 : isLarge ? 19 : 17} tone={tone} />
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
  mark: { flexShrink: 0 },
  textWrap: { justifyContent: "center", gap: 2, flexShrink: 1, minWidth: 0, overflow: "hidden" },
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
