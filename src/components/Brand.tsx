import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { colorTokens, fonts } from "@/theme";
import { BrandMark, BrandWordmark } from "./BrandArt";
import { FitText } from "./FitText";
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
  const wordmarkHeight = isCompact ? 15 : isLarge ? 19 : 17;

  return (
    <AppLink
      href={href as any}
      accessibilityLabel="HomeNet home"
      onPress={onPress}
      style={[styles.link, isCompact && styles.linkCompact, subtitle ? styles.linkFill : null]}
    >
      <View style={styles.mark}>
        <BrandMark size={isCompact ? 30 : isLarge ? 40 : 36} tone={tone} />
      </View>
      <View ref={brandRef} style={[styles.textWrap, subtitle ? styles.textWrapFill : null]}>
        <View style={[styles.wordmark, { height: wordmarkHeight }]}>
          <BrandWordmark height={wordmarkHeight} tone={tone} />
        </View>
        {subtitle ? (
          // On a phone the line can be wider than the room beside the logo, and it was cut to
          // "property mark…". It shrinks to fit (down to 85%), and where even that is too wide
          // (signed out, the Sign in button takes the room) it wraps onto a second line, which the
          // bar has height for. Website and app alike; with room to spare it keeps its own size.
          <FitText
            maxFontSize={SUBTITLE_SIZE}
            minFontSize={SUBTITLE_SIZE * 0.85}
            wrapWhenTooLong
            style={[styles.subtitle, isLight && styles.subtitleLight]}
          >
            {subtitle}
          </FitText>
        ) : null}
      </View>
    </AppLink>
  );
}

const SUBTITLE_SIZE = 10.5;

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 9, flexShrink: 1, minWidth: 0, overflow: "hidden" },
  linkCompact: { gap: 6, flexShrink: 1, minWidth: 0, overflow: "hidden" },
  mark: { flexShrink: 0 },
  // The wordmark keeps its own height (flexShrink 0), and the padding stops "overflow: hidden", which
  // is only here to hold the tagline to the room beside the logo, from shaving the top of the letters.
  wordmark: { flexShrink: 0 },
  textWrap: { justifyContent: "center", gap: 2, flexShrink: 1, minWidth: 0, overflow: "hidden", paddingVertical: 2 },
  // With a tagline, the brand takes the room up to the bar's right-hand buttons, so the tagline's
  // width comes from the bar, not from the text (FitText sizes the text to that width).
  linkFill: { flexGrow: 1 },
  textWrapFill: { flexGrow: 1 },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: SUBTITLE_SIZE,
    lineHeight: 13,
    color: colorTokens.muted,
    letterSpacing: -0.1,
  },
  subtitleLight: {
    color: "rgba(255, 255, 255, 0.75)",
  },
});
