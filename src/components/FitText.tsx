import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent, type TextProps, type TextStyle } from "react-native";

/** The size the hidden copy is set at. Large, so rounding barely moves the result. */
const MEASURE_SIZE = 100;
/** Kept back from the edge so a rounding difference never pushes the line to an ellipsis. */
const SAFETY = 0.998;

/**
 * One line of text, sized so it runs exactly from its box's left edge to its
 * right edge on any screen. A fixed font size left a different gap on the right
 * on every phone (and in each font the app or a browser happened to use), so a
 * left-aligned headline never lined up with the card under it.
 *
 * It lays out a hidden copy at a known size, reads its width, and scales the
 * visible text by the box width over that width. Letter spacing and line height
 * scale with it, so the proportions stay those of the given style. Until both
 * widths are known (the first frame, a server render) the style's own size shows.
 */
export function FitText({
  children,
  style,
  minFontSize = 16,
  maxFontSize = 96,
  noTranslate = false,
  ...textProps
}: Omit<TextProps, "numberOfLines"> & {
  minFontSize?: number;
  maxFontSize?: number;
  /** Keep browser translation off this text (and its measuring copy), as NoTranslateText does. */
  noTranslate?: boolean;
}) {
  const boxRef = useRef<View>(null);
  useEffect(() => {
    if (!noTranslate || Platform.OS !== "web" || !boxRef.current) return;
    const el = boxRef.current as unknown as HTMLElement;
    el.setAttribute("translate", "no");
    el.classList.add("notranslate");
  }, [noTranslate]);

  const [boxWidth, setBoxWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const baseSize = flat.fontSize ?? 16;
  const lineRatio = flat.lineHeight ? flat.lineHeight / baseSize : undefined;
  const spacingRatio = (flat.letterSpacing ?? 0) / baseSize;

  const scaled = (size: number): TextStyle => ({
    fontSize: size,
    lineHeight: lineRatio ? Math.round(size * lineRatio) : undefined,
    letterSpacing: spacingRatio * size,
  });

  const fitted =
    boxWidth > 0 && textWidth > 0
      ? Math.min(maxFontSize, Math.max(minFontSize, ((MEASURE_SIZE * boxWidth) / textWidth) * SAFETY))
      : baseSize;

  const onBox = (e: LayoutChangeEvent) => setBoxWidth(e.nativeEvent.layout.width);
  const onMeasure = (e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onBox} ref={boxRef} style={styles.box}>
      <Text {...textProps} numberOfLines={1} style={[style, scaled(fitted), styles.visible]}>
        {children}
      </Text>
      {/* The measuring copy: clipped to nothing so it never shows or scrolls,
          and hidden from screen readers so the line is read once. */}
      <View
        accessibilityElementsHidden
        aria-hidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={styles.measureClip}
      >
        <View style={styles.measureRoom}>
          <Text onLayout={onMeasure} style={[style, scaled(MEASURE_SIZE), styles.measured]}>
            {children}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignSelf: "stretch" },
  visible: { textAlign: "left" },
  measureClip: { position: "absolute", top: 0, left: 0, width: 0, height: 0, overflow: "hidden", opacity: 0 },
  // Room for the copy to run to its natural width without wrapping.
  measureRoom: { width: 10000, alignItems: "flex-start" },
  measured: { textAlign: "left" },
});
