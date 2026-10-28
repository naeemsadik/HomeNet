import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colorTokens, colors, fonts, webPointer } from "@/theme";
import { useTranslation, type TranslationKey } from "@/i18n";

export type SearchTabType = "buy" | "rent" | "short-let" | "sold" | "instant-valuation";

interface SearchTabsProps {
  activeTab: SearchTabType;
  onChange: (tab: SearchTabType) => void;
  compact?: boolean;
}

const TABS: { key: SearchTabType; translationKey: TranslationKey }[] = [
  { key: "buy", translationKey: "hero.tabs.buy" },
  { key: "rent", translationKey: "hero.tabs.rent" },
  { key: "short-let", translationKey: "hero.tabs.shortLet" },
  // Sold is a research intent, not a buying one, it trails the live tabs.
  { key: "sold", translationKey: "hero.tabs.sold" },
  { key: "instant-valuation", translationKey: "hero.tabs.instantValuation" },
];

export function SearchTabs({ activeTab, onChange, compact = false }: SearchTabsProps) {
  const { t } = useTranslation();

  return (
    // Five tabs do not fit 360 px. They scroll sideways rather than wrapping
    // onto a second line that pushes the search field down the screen.
    <ScrollView
      accessibilityRole="tablist"
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollWrapper}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.row}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const label = t(tab.translationKey);
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t("hero.tabLabel", { label })}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tab: {
    paddingTop: 4,
    paddingBottom: 0,
    marginRight: 28,
  },
  tabCompact: {
    marginRight: 16,
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
  // The rule is a fill, not text, so it carries the brand green itself.
  ruleActive: {
    backgroundColor: colorTokens.brand,
  },
});
