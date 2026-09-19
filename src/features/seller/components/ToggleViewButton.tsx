import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { RefreshCw } from "lucide-react-native";
import { router, type Href } from "expo-router";
import { colors, fonts, radius, webPointer } from "@/theme";

export interface ToggleViewButtonProps {
  href?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md";
}

/**
 * Interactive button to toggle between seller portal and the public site view.
 * Features a rotating RefreshCw icon that spins on hover/press.
 */
export function ToggleViewButton({
  href = "/",
  onPress,
  style,
  size = "md",
}: ToggleViewButtonProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  const triggerSpin = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handlePress = () => {
    triggerSpin();
    onPress?.();
    if (href) {
      router.push(href as Href);
    }
  };

  return (
    <Pressable
      accessibilityLabel="Toggle view to live site"
      accessibilityRole="link"
      onHoverIn={() => {
        setIsHovered(true);
        triggerSpin();
      }}
      onHoverOut={() => setIsHovered(false)}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.btn,
        size === "sm" && styles.btnSm,
        isHovered && styles.btnHovered,
        pressed && styles.btnPressed,
        webPointer,
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <RefreshCw
          color={colors.ink}
          size={size === "sm" ? 14 : 15}
          strokeWidth={2}
        />
      </Animated.View>
      <Text style={[styles.text, size === "sm" && styles.textSm]}>
        Toggle view
      </Text>
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
