import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, webPointer } from "@/theme";

export type SearchTabType = "buy" | "rent" | "short-let";

interface SearchTabsProps {
  activeTab: SearchTabType;
  onChange: (tab: SearchTabType) => void;
  compact?: boolean;
  variant?: "light" | "dark";
}

const TABS: { key: SearchTabType; label: string }[] = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "short-let", label: "Short-let" },
];

export function SearchTabs({
  activeTab,
  onChange,
  compact = false,
  variant = "dark",
}: SearchTabsProps) {
  const isDark = variant === "dark";

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tabButton,
              compact && styles.tabButtonCompact,
              webPointer,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                compact && styles.tabTextCompact,
                isDark
                  ? isActive
                    ? styles.tabTextActiveDark
                    : styles.tabTextInactiveDark
                  : isActive
                  ? styles.tabTextActiveLight
                  : styles.tabTextInactiveLight,
              ]}
            >
              {tab.label}
            </Text>
            {isActive ? (
              <View
                style={[
                  styles.activeIndicator,
                  isDark ? styles.activeIndicatorDark : styles.activeIndicatorLight,
                  compact && styles.activeIndicatorCompact,
                ]}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    flexShrink: 1,
  },
  containerCompact: {
    height: 40,
  },
  tabButton: {
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "transparent",
    flexShrink: 0,
  },
  tabButtonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    fontFamily: fonts.medium,
  },
  tabTextCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  tabTextActiveDark: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  tabTextInactiveDark: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
  tabTextActiveLight: {
    color: "#04cf92",
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  tabTextInactiveLight: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 999,
  },
  activeIndicatorDark: {
    backgroundColor: "#04cf92",
  },
  activeIndicatorLight: {
    backgroundColor: "#04cf92",
  },
  activeIndicatorCompact: {
    left: 8,
    right: 8,
    height: 2.5,
  },
});
