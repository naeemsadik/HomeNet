import React, { memo, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { Link, type Href } from "expo-router";
import { ArrowRight } from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

export interface CardTitleLinkRowProps {
  title: string;
  href: Href;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  onHoverChange?: (isHovered: boolean) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

/**
 * Shared Card Title + Inline Arrow Link Primitive.
 * Implements inclusive stretched-link architecture:
 * - SEO Anchor Text Purity: Only the title and arrow are wrapped inside <Link href={href}> -> <Pressable>.
 * - Full-Card Hit Area (Fitts's Law): An absolute overlay expands across the parent card (position: relative).
 * - Trailing Arrow: Aligned to optical center, translating +3px on hover/focus (safely gated for reduced motion).
 * - Touch Safety: Guarded with (hover: hover) check to prevent touch devices getting stuck in hovered state.
 */
export const CardTitleLinkRow = memo(function CardTitleLinkRow({
  title,
  href,
  titleStyle,
  containerStyle,
  onHoverChange,
  onFocusChange,
}: CardTitleLinkRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const isPointerDownRef = useRef(false);
  const pointerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pointerTimeoutRef.current) {
        clearTimeout(pointerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mql.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mql.addEventListener?.("change", handler);
      return () => mql.removeEventListener?.("change", handler);
    } else if (Platform.OS !== "web") {
      AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
      const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
      return () => sub?.remove();
    }
  }, []);

  const isHoverSupported = () => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }
    return false;
  };

  const handleHoverIn = () => {
    if (isHoverSupported()) {
      setIsHovered(true);
      onHoverChange?.(true);
    }
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const handlePressIn = () => {
    isPointerDownRef.current = true;
  };

  const handlePressOut = () => {
    pointerTimeoutRef.current = setTimeout(() => {
      isPointerDownRef.current = false;
    }, 0);
  };

  const handleFocus = (e?: any) => {
    if (Platform.OS === "web") {
      const target = (e?.nativeEvent?.target ?? e?.target) as
        | { matches?: (selector: string) => boolean }
        | undefined;
      const isKeyboardFocus =
        !isPointerDownRef.current &&
        (typeof target?.matches === "function" ? target.matches(":focus-visible") : false);
      setIsFocused(isKeyboardFocus);
      onFocusChange?.(isKeyboardFocus);
    } else {
      setIsFocused(true);
      onFocusChange?.(true);
    }
  };

  const handleBlur = () => {
    if (pointerTimeoutRef.current) {
      clearTimeout(pointerTimeoutRef.current);
    }
    isPointerDownRef.current = false;
    setIsFocused(false);
    onFocusChange?.(false);
  };

  const isInteractiveActive = isHovered || isFocused;
  const translateX = isInteractiveActive && !reduceMotion ? 3 : 0;

  return (
    <View style={[styles.container, containerStyle]}>
      <Link asChild href={href}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={title}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ hovered }: { hovered?: boolean }) => [
            styles.pressable,
            hovered && styles.pressableHovered,
            webPointer,
          ]}
        >
          <View style={[styles.row, isFocused && styles.rowFocused]}>
            <Text numberOfLines={1} style={[styles.title, titleStyle]}>
              {title}
            </Text>
            <View style={[styles.arrowContainer, { transform: [{ translateX }] }]}>
              <ArrowRight color={colorTokens.brandText} size={18} strokeWidth={2.4} />
            </View>
          </View>
          <View
            aria-hidden={true}
            style={styles.stretchedOverlay}
          />
        </Pressable>
      </Link>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  pressable: {
    ...Platform.select({
      web: {
        position: "static" as any,
        outlineWidth: 0,
        outlineStyle: "none" as any,
        textDecorationLine: "none" as any,
      },
    }),
  },
  pressableHovered: {
    opacity: 0.9,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowFocused: {
    ...Platform.select({
      web: {
        outlineStyle: "solid",
        outlineWidth: 2,
        outlineColor: colorTokens.brand,
        outlineOffset: 2,
        borderRadius: radius.xs,
      },
    }),
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    letterSpacing: -0.2,
  },
  arrowContainer: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        transitionProperty: "transform",
        transitionDuration: "160ms",
        transitionTimingFunction: "ease-out",
      },
    }),
  },
  stretchedOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
    pointerEvents: "auto",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
});
