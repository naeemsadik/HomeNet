import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, Globe } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";

type LanguageCode = "en" | "bn";

/**
 * A language is named in its own script and shown the same way whichever language
 * is on, so a person who has landed in the wrong one can still find theirs. A flag
 * is a country, not a language, so there are none.
 */
const LANGUAGES: { code: LanguageCode; name: "common.english" | "common.bangla" }[] = [
  { code: "en", name: "common.english" },
  { code: "bn", name: "common.bangla" },
];

export function DrawerLanguageDropdown() {
  const { t, language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];
  const currentName = t(current.name);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.languageSelector", { code: currentName })}
        aria-expanded={open}
        onPress={() => setOpen((prev) => !prev)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed, webPointer]}
      >
        <View style={styles.leftGroup}>
          <Globe color={colorTokens.muted} size={18} strokeWidth={2} />
          <Text style={styles.triggerLabel}>{currentName}</Text>
        </View>
        <ChevronDown color={colorTokens.muted} size={18} style={open ? styles.chevronOpen : undefined} />
      </Pressable>

      {open ? (
        <View accessibilityRole="radiogroup" style={styles.dropdownMenu}>
          {LANGUAGES.map((item, index) => {
            const selected = item.code === language;
            const name = t(item.name);
            return (
              <Pressable
                key={item.code}
                accessibilityLabel={name}
                accessibilityRole="radio"
                aria-checked={selected}
                onPress={() => handleSelect(item.code)}
                style={({ pressed }) => [
                  styles.optionItem,
                  index < LANGUAGES.length - 1 && styles.optionDivider,
                  selected && styles.optionItemActive,
                  pressed && styles.pressed,
                  webPointer,
                ]}
              >
                <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>{name}</Text>
                {selected ? <Check color={colorTokens.brandText} size={18} strokeWidth={2.4} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  trigger: {
    minHeight: layout.touchTarget,
    borderWidth: 1,
    borderColor: colorTokens.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colorTokens.surface,
  },
  pressed: { opacity: 0.7 },
  leftGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  triggerLabel: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colorTokens.border,
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: colorTokens.surface,
  },
  optionItem: {
    minHeight: layout.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    backgroundColor: colorTokens.surface,
  },
  optionDivider: { borderBottomWidth: 1, borderBottomColor: colorTokens.border },
  optionItemActive: { backgroundColor: colorTokens.brandSurface },
  optionLabel: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.ink },
  optionLabelActive: { fontFamily: fonts.semiBold, color: colorTokens.brandText },
});
