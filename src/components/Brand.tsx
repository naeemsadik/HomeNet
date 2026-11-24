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
          // "property mark…". It shrinks to fit (down to 85%). Where even that is too wide (a 320 to
          // 360 dp phone, or the Sign in button taking the room), the compact bar drops it: a second
          // line is taller than the bar's fixed height and the squeeze cut the top off the wordmark,
          // as seen on the Android app. Elsewhere, with a taller box, it wraps onto a second line.
          <FitText
            maxFontSize={SUBTITLE_SIZE}
            minFontSize={SUBTITLE_SIZE * 0.85}
            wrapWhenTooLong={!isCompact}
            hideWhenTooLong={isCompact}
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
  // No overflow: hidden on the brand or its text block. It was there to hold the tagline to the room
  // beside the logo, but FitText already sizes or wraps the tagline to its box, and on a phone with a
  // two-line tagline (a 360 dp screen, a larger system font) it cut the top off the wordmark.
  link: { flexDirection: "row", alignItems: "center", gap: 9, flexShrink: 1, minWidth: 0 },
  linkCompact: { gap: 6, flexShrink: 1, minWidth: 0 },
  mark: { flexShrink: 0 },
  // The wordmark keeps its own height (flexShrink 0). The padding below keeps the letters off the edge.
  wordmark: { flexShrink: 0 },
  textWrap: { justifyContent: "center", gap: 2, flexShrink: 1, minWidth: 0, paddingVertical: 2 },
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
