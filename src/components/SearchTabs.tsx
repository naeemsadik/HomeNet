import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, webPointer } from "@/theme";

export type SearchTabType = "buy" | "rent" | "short-let";

interface SearchTabsProps {
  activeTab: SearchTabType;
  onChange: (tab: SearchTabType) => void;
  compact?: boolean;
}

const TABS: { key: SearchTabType; label: string }[] = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "short-let", label: "Short-let" },
];

export function SearchTabs({ activeTab, onChange, compact = false }: SearchTabsProps) {
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
            style={[styles.tabButton, compact && styles.tabButtonCompact, webPointer]}
          >
            <Text
              style={[
                styles.tabText,
                compact && styles.tabTextCompact,
                isActive ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive ? <View style={styles.activeIndicator} /> : null}
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
    height: 44,
  },
  containerCompact: {
    height: 40,
  },
  tabButton: {
    position: "relative",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    backgroundColor: "transparent",
  },
  tabButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    height: 40,
  },
  tabText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  tabTextCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  tabTextActive: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  tabTextInactive: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#0F6D55",
    borderRadius: 999,
  },
});
