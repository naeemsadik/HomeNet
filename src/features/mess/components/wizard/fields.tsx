/**
 * The listing wizard's controls. Chips, steppers and switches rather than free
 * text wherever the answer is a choice or a count (PRD 3.3.1). Each control
 * reads its error from the form and clears it as soon as it is changed.
 */
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useController, useFormContext, type FieldPath, type FieldPathValue } from "react-hook-form";
import { Minus, Plus } from "@/components/icons";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { MessListingForm } from "../../utils/wizardForm";
import { toClockTime } from "../../utils/time";
import { MessChip } from "../MessChip";

type Path = FieldPath<MessListingForm>;

/** A form field's value, a change handler that clears its error, and the error in words. */
export function useWizardField<P extends Path>(name: P) {
  const { control, clearErrors } = useFormContext<MessListingForm>();
  const { field, fieldState } = useController({ control, name });
  const { t } = useTranslation();
  return {
    value: field.value as FieldPathValue<MessListingForm, P>,
    onChange: (next: FieldPathValue<MessListingForm, P>) => {
      field.onChange(next);
      if (fieldState.error) clearErrors(name);
    },
    error: fieldState.error?.message ? t(fieldState.error.message as TranslationKey) : undefined,
  };
}

export function FieldBlock({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <View style={styles.block}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <View role="radiogroup" aria-label={label} style={styles.chips}>
      {options.map((option) => (
        <MessChip key={option.value} role="radio" label={option.label} selected={value === option.value} onPress={() => onChange(option.value)} />
      ))}
    </View>
  );
}

export function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (next: number) => void; min: number; max: number }) {
  const { t, language } = useTranslation();
  const safe = Number.isFinite(value) ? value : min;
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mess.wizard.seats.decrease", { label })}
          disabled={safe <= min}
          onPress={() => onChange(Math.max(min, safe - 1))}
          style={[styles.stepperButton, safe <= min && styles.stepperButtonOff, webPointer]}
        >
          <Minus size={16} color={safe <= min ? colorTokens.subtle : colorTokens.ink} />
        </Pressable>
        <Text accessibilityLabel={`${label}: ${safe}`} accessibilityLiveRegion="polite" style={styles.stepperValue}>
          {formatLocalizedNumber(safe, language)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mess.wizard.seats.increase", { label })}
          disabled={safe >= max}
          onPress={() => onChange(Math.min(max, safe + 1))}
          style={[styles.stepperButton, safe >= max && styles.stepperButtonOff, webPointer]}
        >
          <Plus size={16} color={safe >= max ? colorTokens.subtle : colorTokens.ink} />
        </Pressable>
      </View>
    </View>
  );
}

/** Digits only; empty is null. `prefix` is drawn in the box ("৳"). */
export function NumberInput({
  value,
  onChange,
  label,
  placeholder,
  prefix,
  editable = true,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  label: string;
  placeholder?: string;
  prefix?: string;
  editable?: boolean;
}) {
  return (
    <View style={[styles.inputBox, !editable && styles.inputBoxReadOnly]}>
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        editable={editable}
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={(text) => {
          const digits = text.replace(/[^\d]/g, "").slice(0, 7);
          onChange(digits ? Number(digits) : null);
        }}
        placeholder={placeholder ?? label}
        placeholderTextColor={colorTokens.subtle}
        style={styles.input}
        value={value === null || value === undefined ? "" : String(value)}
      />
    </View>
  );
}

/** "HH:MM", 24-hour. "530" or "5:30" becomes "05:30" when the field is left. */
export function TimeInput({ value, onChange, label }: { value: string; onChange: (next: string) => void; label: string }) {
  const { t } = useTranslation();
  const normalise = () => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return;
    const padded = digits.length <= 2 ? `${digits.padStart(2, "0")}00` : digits.padStart(4, "0");
    const clock = toClockTime(padded.slice(0, 4));
    if (clock && clock !== value) onChange(clock);
  };
  return (
    <View style={[styles.inputBox, styles.timeBox]}>
      <TextInput
        accessibilityLabel={label}
        inputMode="numeric"
        maxLength={5}
        onBlur={normalise}
        onChangeText={(text) => onChange(text.replace(/[^\d:]/g, ""))}
        placeholder={t("mess.wizard.rules.timePlaceholder")}
        placeholderTextColor={colorTokens.subtle}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export function TextField({
  value,
  onChange,
  label,
  placeholder,
  multiline = false,
  maxLength,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={[styles.inputBox, multiline && styles.multilineBox]}>
      <TextInput
        accessibilityLabel={label}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colorTokens.subtle}
        style={[styles.input, multiline && styles.multiline]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
    </View>
  );
}

export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onChange}
        thumbColor={colorTokens.surface}
        trackColor={{ false: colorTokens.divider, true: colorTokens.brand }}
        value={value}
      />
    </View>
  );
}

export function StepCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? (
        <Text accessibilityRole="header" aria-level={2} style={styles.cardTitle}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  half: { flexGrow: 1, flexBasis: 200 },
});

const styles = StyleSheet.create({
  block: { gap: 8 },
  label: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted },
  error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colorTokens.errorText },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 },
  stepperLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colorTokens.ink },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepperButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  stepperButtonOff: { opacity: 0.5 },
  stepperValue: { minWidth: 36, textAlign: "center", fontFamily: fonts.bold, fontSize: 17, color: colorTokens.ink },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surfaceSunken,
  },
  inputBoxReadOnly: { opacity: 0.6 },
  timeBox: { width: 110 },
  multilineBox: { alignItems: "flex-start", paddingVertical: 8 },
  prefix: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.muted },
  input: { flex: 1, minWidth: 0, minHeight: 44, fontFamily: fonts.regular, fontSize: 15, color: colorTokens.ink },
  multiline: { minHeight: 110 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.ink },
  card: {
    gap: 16,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  cardTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colorTokens.ink },
});
