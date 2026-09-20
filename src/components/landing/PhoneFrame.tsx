import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

interface PhoneFrameProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function PhoneFrame({ children, style, contentStyle }: PhoneFrameProps) {
  return (
    <View style={[styles.phone, style]}>
      {/* Notch / Speaker Island */}
      <View style={styles.notchWrap}>
        <View style={styles.island}>
          <View style={styles.speaker} />
          <View style={styles.lens} />
        </View>
      </View>

      {/* Screen Content */}
      <View style={[styles.screen, contentStyle]}>{children}</View>

      {/* Home Indicator Bar */}
      <View style={styles.homeIndicatorWrap}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    backgroundColor: "#0B1A17",
    borderRadius: 36,
    padding: 8,
    borderWidth: 2.5,
    borderColor: "rgba(11, 26, 23, 0.2)",
    shadowColor: "rgba(11, 26, 23, 0.2)",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
  },
  notchWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  island: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0B1A17",
    width: 90,
    height: 18,
    borderRadius: 9,
  },
  speaker: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  lens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  screen: {
    backgroundColor: "#F8FAF9",
    overflow: "hidden",
  },
  homeIndicatorWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 16,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  homeIndicator: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(11, 26, 23, 0.3)",
  },
});
