import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, webPointer } from "@/theme";
import { useTranslation, type TranslationKey } from "@/i18n";

export type SearchTabType = "buy" | "rent" | "short-let" | "sold";

interface SearchTabsProps {
  activeTab: SearchTabType;
  onChange: (tab: SearchTabType) => void;
  compact?: boolean;
}

const TABS: { key: SearchTabType; translationKey: TranslationKey }[] = [
  { key: "buy", translationKey: "hero.tabs.buy" },
  { key: "rent", translationKey: "hero.tabs.rent" },
  { key: "short-let", translationKey: "hero.tabs.shortLet" },
  // Sold is a research intent, not a buying one — it trails the live tabs.
  { key: "sold", translationKey: "hero.tabs.sold" },
];

export function SearchTabs({ activeTab, onChange, compact = false }: SearchTabsProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const label = t(tab.translationKey);
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${label} properties`}
            onPress={() => onChange(tab.key)}
            style={({ hovered }: any) => [
              styles.tab,
              compact && styles.tabCompact,
              webPointer,
              hovered && !isActive && styles.tabHovered,
            ]}
          >
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                isActive && styles.labelActive,
              ]}
            >
              {label}
            </Text>
            <View style={[styles.rule, isActive && styles.ruleActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tab: {
    paddingTop: 4,
    paddingBottom: 0,
    marginRight: 32,
  },
  tabCompact: {
    marginRight: 22,
  },
  tabHovered: {
    opacity: 0.7,
  },
  label: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
  },
  labelCompact: {
    fontSize: 15,
    lineHeight: 21,
  },
  // Weight carries the state; the rule only reinforces it.
  labelActive: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
  },
  rule: {
    height: 2,
    marginTop: 7,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  ruleActive: {
    backgroundColor: colors.greenOnLight,
  },
});
