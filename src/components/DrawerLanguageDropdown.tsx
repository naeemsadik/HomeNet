import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { BdFlagCircle, UkFlagCircle } from "./flags";

export function DrawerLanguageDropdown() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const isBangla = language === "bn";
  const activeCode = isBangla ? "BEN" : "ENG";

  const handleSelect = (lang: "en" | "bn") => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Trigger Card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Language selector: ${activeCode}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.trigger, webPointer]}
      >
        <View style={styles.leftGroup}>
          {isBangla ? <BdFlagCircle size={24} /> : <UkFlagCircle size={24} />}
          <Text style={styles.triggerLabel}>{activeCode}</Text>
        </View>
        <ChevronDown
          size={18}
          color={colorTokens.muted}
          style={open ? styles.chevronOpen : undefined}
        />
      </Pressable>

      {/* Expanded Dropdown Menu */}
      {open ? (
        <View style={styles.dropdownMenu}>
          {/* Option 1: ENG */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="English"
            onPress={() => handleSelect("en")}
            style={[
              styles.optionItem,
              styles.optionDivider,
              !isBangla && styles.optionItemActive,
              webPointer,
            ]}
          >
            <View style={styles.leftGroup}>
              <UkFlagCircle size={24} />
              <Text
                style={[
                  styles.optionLabel,
                  !isBangla && styles.optionLabelActive,
                ]}
              >
                ENG
              </Text>
            </View>
          </Pressable>

          {/* Option 2: BEN */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bengali"
            onPress={() => handleSelect("bn")}
            style={[
              styles.optionItem,
              isBangla && styles.optionItemActive,
              webPointer,
            ]}
          >
            <View style={styles.leftGroup}>
              <BdFlagCircle size={24} />
              <Text
                style={[
                  styles.optionLabel,
                  isBangla && styles.optionLabelActive,
                ]}
              >
                BEN
              </Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  trigger: {
    borderWidth: 1,
    borderColor: colorTokens.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colorTokens.surface,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colorTokens.ink,
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colorTokens.border,
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: colorTokens.surface,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colorTokens.surface,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.border,
  },
  optionItemActive: {
    backgroundColor: colorTokens.brandSurface,
  },
  optionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colorTokens.ink,
  },
  optionLabelActive: {
    color: colorTokens.brandText,
  },
});
