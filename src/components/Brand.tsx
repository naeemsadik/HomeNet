import { useEffect, useRef } from "react";
import { Home } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";
import { AppLink } from "./ui";

/**
 * Mark a DOM node (and all its descendants) as untranslatable.
 *
 * React Native Web strips unknown HTML props like `translate` and `className`,
 * so the only reliable way to shield text from Google Translate is to set
 * `translate="no"` and add the `notranslate` class directly on the DOM node
 * via a ref after mount.
 */
function useNoTranslate<T extends HTMLElement>() {
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
  href = "/home",
  onPress,
  variant = "dark",
}: {
  compact?: boolean;
  size?: "compact" | "default" | "large";
  href?: string;
  onPress?: () => void;
  variant?: "dark" | "light";
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
      <View ref={brandRef}>
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
      </View>
    </AppLink>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 9 },
  linkCompact: { gap: 6 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#04cf92",
  },
  markCompact: { width: 28, height: 28, borderRadius: 14 },
  markLarge: { width: 40, height: 40, borderRadius: 20 },
  text: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 18,
    letterSpacing: -0.4,
    fontWeight: "800",
  },
  textCompact: { fontSize: 14.5 },
  textLarge: { fontSize: 20.5, letterSpacing: -0.4 },
});
