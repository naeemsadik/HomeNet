import React, { type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Lock } from "lucide-react-native";
import { fonts } from "@/theme";

interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function BrowserFrame({
  children,
  url = "homenet.com.bd/buy",
  style,
  contentStyle,
}: BrowserFrameProps) {
  return (
    <View style={[styles.browser, style]}>
      {/* Chrome Top Bar */}
      <View style={styles.chromeBar}>
        <View style={styles.windowControls}>
          <View style={[styles.dot, styles.dotClose]} />
          <View style={[styles.dot, styles.dotMinimize]} />
          <View style={[styles.dot, styles.dotMaximize]} />
        </View>

        <View style={styles.addressBar}>
          <Lock color="#5C6B66" size={11} strokeWidth={2.5} />
          <Text numberOfLines={1} style={styles.addressText}>
            {url}
          </Text>
        </View>

        <View style={styles.chromePlaceholder} />
      </View>

      {/* Browser Body / Viewport */}
      <View style={[styles.body, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  browser: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.1)",
    overflow: "hidden",
    shadowColor: "rgba(11, 26, 23, 0.12)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
  chromeBar: {
    height: 38,
    backgroundColor: "#F4F6F5",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  windowControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 60,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotClose: {
    backgroundColor: "#F87171",
  },
  dotMinimize: {
    backgroundColor: "#FBBF24",
  },
  dotMaximize: {
    backgroundColor: "#34D399",
  },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
    maxWidth: 260,
    width: "100%",
    justifyContent: "center",
  },
  addressText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: "500",
  },
  chromePlaceholder: {
    width: 60,
  },
  body: {
    backgroundColor: "#F8FAF9",
    overflow: "hidden",
  },
});
