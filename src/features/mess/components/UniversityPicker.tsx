import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, ChevronLeft, ChevronRight, Search } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { AppButton } from "@/components/ui";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { findCampus, searchUniversities, useUniversities } from "../hooks/useUniversities";
import type { University } from "../types/mess";
import { MessSheet } from "./MessSheet";

/**
 * Pick a university, then a campus when it has more than one: distances are
 * measured to a campus gate, not to a university.
 */
export function UniversityPicker(props: UniversityPickerProps) {
  // Mounted only while open, so every opening starts from the list with an empty search.
  return props.visible ? <UniversityPickerPanel {...props} /> : null;
}

interface UniversityPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedCampusId: string | null | undefined;
  onSelect: (campusId: string | null) => void;
}

function UniversityPickerPanel({ visible, onClose, selectedCampusId, onSelect }: UniversityPickerProps) {
  const { t } = useTranslation();
  const universities = useUniversities();
  const [query, setQuery] = useState("");
  const [openUniversity, setOpenUniversity] = useState<University | null>(null);
  const selected = findCampus(universities.data, selectedCampusId);

  const matches = useMemo(() => searchUniversities(universities.data ?? [], query), [universities.data, query]);

  const choose = (campusId: string | null) => {
    onSelect(campusId);
    onClose();
  };

  const pickUniversity = (university: University) => {
    if (university.campuses.length === 1) choose(university.campuses[0].id);
    else setOpenUniversity(university);
  };

  const title = openUniversity ? t("mess.campus.campusTitle", { university: openUniversity.short_name }) : t("mess.campus.pickerTitle");

  return (
    <MessSheet visible={visible} onClose={onClose} title={title} closeLabel={t("common.close")} width={520}>
      {openUniversity ? (
        <View style={styles.list}>
          <Pressable accessibilityRole="button" onPress={() => setOpenUniversity(null)} style={[styles.back, webPointer]}>
            <ChevronLeft size={16} color={colorTokens.brandText} />
            <Text style={styles.backText}>{t("mess.campus.back")}</Text>
          </Pressable>
          {openUniversity.campuses.map((campus) => {
            const isSelected = campus.id === selectedCampusId;
            return (
              <Pressable
                key={campus.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => choose(campus.id)}
                style={({ hovered }: { hovered?: boolean }) => [styles.row, hovered && styles.rowHovered, isSelected && styles.rowSelected, webPointer]}
              >
                <Text style={[styles.rowTitle, isSelected && styles.rowTitleSelected]}>{campus.name}</Text>
                {isSelected ? <Check size={18} color={colorTokens.brandText} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.list}>
          <View style={styles.search}>
            <Search size={16} color={colorTokens.muted} />
            <TextInput
              accessibilityLabel={t("mess.campus.searchPlaceholder")}
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder={t("mess.campus.searchPlaceholder")}
              placeholderTextColor={colorTokens.subtle}
              style={styles.searchInput}
              value={query}
            />
          </View>

          {universities.isPending ? (
            <ActivityIndicator color={colorTokens.brand} style={styles.state} />
          ) : universities.isError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>{t("mess.campus.loadFailed")}</Text>
              <AppButton label={t("mess.browse.retry")} onPress={() => universities.refetch()} variant="secondary" />
            </View>
          ) : matches.length === 0 ? (
            <Text style={styles.stateText}>{t("mess.campus.noResults", { query: query.trim() })}</Text>
          ) : (
            matches.map((university) => {
              const isSelected = selected?.university.id === university.id;
              const many = university.campuses.length > 1;
              return (
                <Pressable
                  key={university.id}
                  accessibilityRole={many ? "button" : "radio"}
                  accessibilityState={many ? undefined : { checked: isSelected }}
                  accessibilityLabel={`${university.short_name}, ${university.name}`}
                  onPress={() => pickUniversity(university)}
                  style={({ hovered }: { hovered?: boolean }) => [styles.row, hovered && styles.rowHovered, isSelected && styles.rowSelected, webPointer]}
                >
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, isSelected && styles.rowTitleSelected]}>{university.short_name}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {university.name}
                    </Text>
                  </View>
                  {many ? <ChevronRight size={18} color={colorTokens.muted} /> : isSelected ? <Check size={18} color={colorTokens.brandText} /> : null}
                </Pressable>
              );
            })
          )}

          {selectedCampusId ? (
            <Pressable accessibilityRole="button" onPress={() => choose(null)} style={[styles.clear, webPointer]}>
              <Text style={styles.clearText}>{t("mess.campus.clear")}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </MessSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surfaceSunken,
  },
  searchInput: { flex: 1, minHeight: 42, fontFamily: fonts.regular, fontSize: 15, color: colorTokens.ink },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  rowHovered: { backgroundColor: colorTokens.surfaceSunken },
  rowSelected: { backgroundColor: colorTokens.brandSurface },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  rowTitleSelected: { color: colorTokens.brandText },
  rowSub: { fontFamily: fonts.regular, fontSize: 13, color: colorTokens.muted },
  back: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 40, alignSelf: "flex-start" },
  backText: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  clear: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, marginTop: 8 },
  clearText: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  state: { paddingVertical: 24 },
  stateBox: { alignItems: "center", gap: 12, paddingVertical: 16 },
  stateText: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted, textAlign: "center", paddingVertical: 12 },
});
