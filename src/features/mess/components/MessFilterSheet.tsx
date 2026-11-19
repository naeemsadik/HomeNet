import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/ui";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { BUDGET_PRESETS, GATE_OPEN_PRESETS, MEAL_SYSTEMS, WALK_PRESETS } from "../constants/vocabulary";
import type { MealSystem, MessFilters } from "../types/mess";
import { clearedFilters } from "../utils/filterParams";
import { formatTaka } from "../utils/format";
import { formatClock } from "../utils/time";
import { MessChip } from "./MessChip";
import { MessSheet } from "./MessSheet";

type BooleanFilter = "no_smoking" | "study_friendly" | "has_lift" | "has_balcony" | "costs_complete" | "is_verified";

/** Digits only, as a positive whole number; undefined when empty. */
function parseAmount(text: string): number | undefined {
  const digits = text.replace(/[^\d]/g, "");
  const value = digits ? Number(digits) : NaN;
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/**
 * Every search filter. Changes edit a draft; "Show results" commits it, so the
 * page behind does not reload on each tap.
 */
export function MessFilterSheet(props: MessFilterSheetProps) {
  // Mounted only while open, so the draft starts from the committed filters each time.
  return props.visible ? <FilterSheetPanel {...props} /> : null;
}

interface MessFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: MessFilters;
  onApply: (next: MessFilters) => void;
  /** The chosen campus's short name, or null when none is chosen. */
  campusName: string | null;
  onPickCampus: () => void;
}

function FilterSheetPanel({ visible, onClose, filters, onApply, campusName, onPickCampus }: MessFilterSheetProps) {
  const { t, language } = useTranslation();
  const [draft, setDraft] = useState<MessFilters>(filters);
  const [minText, setMinText] = useState(filters.min_all_in ? String(filters.min_all_in) : "");
  const [maxText, setMaxText] = useState(filters.max_all_in ? String(filters.max_all_in) : "");

  const set = <K extends keyof MessFilters>(key: K, value: MessFilters[K] | undefined) =>
    setDraft((current) => {
      const next = { ...current };
      if (value === undefined || value === false || (Array.isArray(value) && value.length === 0)) delete next[key];
      else next[key] = value;
      return next;
    });

  const toggle = (key: BooleanFilter) => set(key, !draft[key] || undefined);

  const toggleMeal = (meal: MealSystem) => {
    const current = draft.meal_system ?? [];
    set("meal_system", current.includes(meal) ? current.filter((value) => value !== meal) : [...current, meal]);
  };

  const setBudget = (min: number | undefined, max: number | undefined) => {
    set("min_all_in", min);
    set("max_all_in", max);
    setMinText(min ? String(min) : "");
    setMaxText(max ? String(max) : "");
  };

  const apply = () => {
    let min = parseAmount(minText);
    let max = parseAmount(maxText);
    if (min && max && min > max) [min, max] = [max, min];
    const next = { ...draft };
    if (min) next.min_all_in = min;
    else delete next.min_all_in;
    if (max) next.max_all_in = max;
    else delete next.max_all_in;
    onApply(next);
    onClose();
  };

  const clear = () => {
    const kept = clearedFilters(draft);
    setDraft(kept);
    setMinText("");
    setMaxText("");
  };

  return (
    <MessSheet
      visible={visible}
      onClose={onClose}
      title={t("mess.filters.title")}
      closeLabel={t("mess.filters.close")}
      width={600}
      footer={
        <>
          <AppButton label={t("mess.filters.clearAll")} onPress={clear} variant="secondary" style={styles.footerButton} />
          <AppButton label={t("mess.filters.apply")} onPress={apply} style={styles.footerButton} />
        </>
      }
    >
      <Section title={campusName ? t("mess.filters.walk", { campus: campusName }) : t("mess.filters.walkNoCampus")}>
        {campusName ? (
          <View style={styles.chips}>
            <MessChip role="radio" label={t("mess.filters.any")} selected={!draft.max_walk_min} onPress={() => set("max_walk_min", undefined)} />
            {WALK_PRESETS.map((minutes) => (
              <MessChip
                key={minutes}
                role="radio"
                label={t("mess.filters.walkOption", { count: minutes })}
                selected={draft.max_walk_min === minutes}
                onPress={() => set("max_walk_min", minutes)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.inline}>
            <Text style={styles.hint}>{t("mess.filters.walkNeedsCampus")}</Text>
            <Pressable accessibilityRole="button" onPress={onPickCampus} style={webPointer}>
              <Text style={styles.link}>{t("mess.campus.choose")}</Text>
            </Pressable>
          </View>
        )}
      </Section>

      <Section title={t("mess.filters.budget")} hint={t("mess.filters.budgetHint")}>
        <View style={styles.chips}>
          <MessChip role="radio" label={t("mess.filters.any")} selected={!minText && !maxText} onPress={() => setBudget(undefined, undefined)} />
          {BUDGET_PRESETS.map((amount) => (
            <MessChip
              key={amount}
              role="radio"
              label={t("mess.filters.budgetUpTo", { amount: formatTaka(amount, language) })}
              selected={!minText && parseAmount(maxText) === amount}
              onPress={() => setBudget(undefined, amount)}
            />
          ))}
        </View>
        <View style={styles.amounts}>
          <AmountInput label={t("mess.filters.budgetMin")} value={minText} onChange={setMinText} />
          <Text style={styles.dash}>–</Text>
          <AmountInput label={t("mess.filters.budgetMax")} value={maxText} onChange={setMaxText} />
        </View>
      </Section>

      <Section title={t("mess.filters.gender")}>
        <View style={styles.chips}>
          <MessChip role="radio" label={t("mess.gender.any")} selected={!draft.gender} onPress={() => set("gender", undefined)} />
          {(["male", "female"] as const).map((gender) => (
            <MessChip key={gender} role="radio" label={t(`mess.gender.${gender}`)} selected={draft.gender === gender} onPress={() => set("gender", gender)} />
          ))}
        </View>
      </Section>

      <Section title={t("mess.filters.seatType")}>
        <View style={styles.chips}>
          <MessChip role="radio" label={t("mess.filters.any")} selected={!draft.seat_type} onPress={() => set("seat_type", undefined)} />
          {(["single", "shared"] as const).map((type) => (
            <MessChip key={type} role="radio" label={t(`mess.seatType.${type}`)} selected={draft.seat_type === type} onPress={() => set("seat_type", type)} />
          ))}
        </View>
      </Section>

      <Section title={t("mess.filters.washroom")}>
        <View style={styles.chips}>
          <MessChip role="radio" label={t("mess.filters.any")} selected={!draft.washroom} onPress={() => set("washroom", undefined)} />
          {(["attached", "common"] as const).map((kind) => (
            <MessChip key={kind} role="radio" label={t(`mess.washroomShort.${kind}`)} selected={draft.washroom === kind} onPress={() => set("washroom", kind)} />
          ))}
        </View>
      </Section>

      <Section title={t("mess.filters.rules")}>
        <View style={styles.chips}>
          <MessChip label={t("mess.filters.noSmoking")} selected={Boolean(draft.no_smoking)} onPress={() => toggle("no_smoking")} />
          <MessChip label={t("mess.filters.studyFriendly")} selected={Boolean(draft.study_friendly)} onPress={() => toggle("study_friendly")} />
          <MessChip label={t("mess.filters.lift")} selected={Boolean(draft.has_lift)} onPress={() => toggle("has_lift")} />
          <MessChip label={t("mess.filters.balcony")} selected={Boolean(draft.has_balcony)} onPress={() => toggle("has_balcony")} />
        </View>
      </Section>

      <Section title={t("mess.filters.gate")} hint={t("mess.filters.gateHint")}>
        <View style={styles.chips}>
          <MessChip role="radio" label={t("mess.filters.any")} selected={!draft.gate_open_by} onPress={() => set("gate_open_by", undefined)} />
          {GATE_OPEN_PRESETS.map((time) => (
            <MessChip key={time} role="radio" label={formatClock(time, language)} selected={draft.gate_open_by === time} onPress={() => set("gate_open_by", time)} />
          ))}
        </View>
      </Section>

      <Section title={t("mess.filters.meal")}>
        <View style={styles.chips}>
          {MEAL_SYSTEMS.map((meal) => (
            <MessChip key={meal} label={t(`mess.meal.${meal}`)} selected={Boolean(draft.meal_system?.includes(meal))} onPress={() => toggleMeal(meal)} />
          ))}
        </View>
      </Section>

      <Section title={t("mess.filters.trust")}>
        <View style={styles.chips}>
          <MessChip label={t("mess.filters.costsComplete")} selected={Boolean(draft.costs_complete)} onPress={() => toggle("costs_complete")} />
          <MessChip label={t("mess.filters.verified")} selected={Boolean(draft.is_verified)} onPress={() => toggle("is_verified")} />
        </View>
      </Section>
    </MessSheet>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header" aria-level={3}>
        {title}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

function AmountInput({ label, value, onChange }: { label: string; value: string; onChange: (text: string) => void }) {
  return (
    <View style={styles.amountBox}>
      <Text style={styles.amountPrefix}>৳</Text>
      <TextInput
        accessibilityLabel={label}
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={(text) => onChange(text.replace(/[^\d]/g, ""))}
        placeholder={label}
        placeholderTextColor={colorTokens.subtle}
        style={styles.amountInput}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  inline: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  link: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText, textDecorationLine: "underline" },
  amounts: { flexDirection: "row", alignItems: "center", gap: 8 },
  dash: { fontFamily: fonts.regular, color: colorTokens.muted },
  amountBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surfaceSunken,
  },
  amountPrefix: { fontFamily: fonts.medium, color: colorTokens.muted },
  amountInput: { flex: 1, minWidth: 0, minHeight: 42, fontFamily: fonts.regular, fontSize: 15, color: colorTokens.ink },
  footerButton: { flex: 1 },
});
