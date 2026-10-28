import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export interface FlagProps {
  size?: number;
}

/**
 * Scalable circular Bangladesh flag primitive.
 * Green background #006a4e with offset red sun #f42a41.
 */
export function BdFlagCircle({ size = 24 }: FlagProps) {
  return (
    <View
      style={[
        styles.circleContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityRole="image"
      accessibilityLabel="Bangladesh flag"
    >
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        <Rect width="24" height="24" fill="#006a4e" />
        <Circle cx="10.8" cy="12" r="5" fill="#f42a41" />
      </Svg>
    </View>
  );
}

/**
 * Scalable circular UK flag primitive (Union Jack).
 * Blue field, red cross, and diagonal white/red stripes.
 */
export function UkFlagCircle({ size = 24 }: FlagProps) {
  return (
    <View
      style={[
        styles.circleContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityRole="image"
      accessibilityLabel="UK flag"
    >
      <Svg viewBox="0 0 60 60" width={size} height={size}>
        <Rect width="60" height="60" fill="#012169" />
        <Path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" strokeWidth="10" />
        <Path
          d="M0,0 L25,25 M60,0 L35,25 M60,60 L35,35 M0,60 L25,35"
          stroke="#C8102E"
          strokeWidth="3.5"
        />
        <Path d="M30,0 V60 M0,30 H60" stroke="#FFFFFF" strokeWidth="12" />
        <Path d="M30,0 V60 M0,30 H60" stroke="#C8102E" strokeWidth="7" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  circleContainer: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
