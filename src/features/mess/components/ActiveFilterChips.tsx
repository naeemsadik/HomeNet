import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { X } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { MessFilters } from "../types/mess";
import { activeFilterChips } from "../utils/filterChips";
import { clearedFilters } from "../utils/filterParams";

/** One removable chip per active filter, and "Clear all". Nothing when no filter is set. */
export function ActiveFilterChips({ filters, onChange }: { filters: MessFilters; onChange: (next: MessFilters) => void }) {
  const { t, language } = useTranslation();
  const chips = activeFilterChips(filters, t, language);
  if (chips.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          accessibilityRole="button"
          accessibilityLabel={t("mess.chips.remove", { label: chip.label })}
          onPress={() => onChange(chip.remove(filters))}
          style={({ hovered }: { hovered?: boolean }) => [styles.chip, hovered && styles.chipHovered, webPointer]}
        >
          <Text style={styles.chipText}>{chip.label}</Text>
          <X size={14} color={colorTokens.brandText} />
        </Pressable>
      ))}
      <Pressable accessibilityRole="button" onPress={() => onChange(clearedFilters(filters))} style={[styles.clear, webPointer]}>
        <Text style={styles.clearText}>{t("mess.filters.clearAll")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 34,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
  },
  chipHovered: { backgroundColor: colorTokens.surface },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.brandText },
  clear: { minHeight: 34, justifyContent: "center", paddingHorizontal: 8 },
  clearText: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.body, textDecorationLine: "underline" },
});
