import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { ArrowLeft, ArrowRight, Check } from "@/components/icons";
import { AppButton } from "@/components/ui";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

/**
 * The few building blocks every valuation step is made of, so the steps look
 * and behave the same: one heading, labelled fields, single-choice cards and
 * chips, tick rows, and one row of actions with a single primary button.
 *
 * Selected is shown with the ink border and a tick or dot, not by colour alone,
 * and every control is at least 44 px tall.
 */

/** `aria-checked` is what react-native-web passes through to the DOM; accessibilityState.checked is ignored there. */
const checkedProps = (checked: boolean, role: "radio" | "checkbox") =>
  ({
    accessibilityRole: role,
    accessibilityState: { checked },
    ...(Platform.OS === "web" ? { "aria-checked": checked } : {}),
  }) as object;

export function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function FieldBlock({
  label,
  optional,
  optionalLabel,
  hint,
  children,
  style,
}: {
  label: string;
  optional?: boolean;
  /** The word for "optional", in the reader's language. */
  optionalLabel?: string;
  hint?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && optionalLabel ? <Text style={styles.optional}>{optionalLabel}</Text> : null}
      </View>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export interface Option<T extends string | number> {
  value: T;
  label: string;
  /** One short line under the label. */
  hint?: string;
}

/** A single choice shown as cards in a grid: the card you pick has an ink border and a filled dot. */
export function OptionCards<T extends string | number>({
  options,
  value,
  onChange,
  columns = 2,
  accessibilityLabel,
}: {
  options: Option<T>[];
  value: T | "" | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
  accessibilityLabel: string;
}) {
  const { isPhone } = useResponsive();
  const perRow = isPhone ? Math.min(columns, 1) : columns;
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" style={styles.cardGrid}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={String(option.value)}
            {...checkedProps(selected, "radio")}
            onPress={() => onChange(option.value)}
            style={({ hovered }: { hovered?: boolean }) => [
              styles.card,
              { width: `${100 / perRow - 1.5}%` },
              selected && styles.cardSelected,
              hovered && !selected && styles.cardHovered,
              webPointer,
            ]}
          >
            <View style={[styles.dot, selected && styles.dotSelected]}>
              {selected ? <View style={styles.dotCore} /> : null}
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{option.label}</Text>
              {option.hint ? <Text style={styles.cardHint}>{option.hint}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A single choice shown as a row of short buttons. Pick the chosen one again to clear it, for the questions that are optional. */
export function ChoiceChips<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
  clearable = false,
}: {
  options: Option<T>[];
  value: T | "" | null;
  onChange: (value: T | "" | null) => void;
  accessibilityLabel: string;
  clearable?: boolean;
}) {
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" style={styles.chipRow}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={String(option.value)}
            {...checkedProps(selected, "radio")}
            onPress={() => onChange(selected && clearable ? (typeof option.value === "number" ? null : "") : option.value)}
            style={({ hovered }: { hovered?: boolean }) => [
              styles.chip,
              selected && styles.chipSelected,
              hovered && !selected && styles.cardHovered,
              webPointer,
            ]}
          >
            {selected ? <Check color={colorTokens.onInk} size={14} strokeWidth={2.6} /> : null}
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A tick row for a yes-or-no feature. Unticked means "no" or "not sure", and changes nothing. */
export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      {...checkedProps(checked, "checkbox")}
      onPress={onToggle}
      style={({ hovered }: { hovered?: boolean }) => [
        styles.checkRow,
        checked && styles.checkRowChecked,
        hovered && !checked && styles.cardHovered,
        webPointer,
      ]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Check color={colorTokens.onInk} size={14} strokeWidth={3} /> : null}
      </View>
      <Text style={styles.cardLabel}>{label}</Text>
    </Pressable>
  );
}

/** The one row of actions: Back on the left, the single primary action on the right. */
export function StepActions({
  onBack,
  backLabel,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  const { isPhone } = useResponsive();
  return (
    <View style={[styles.actions, isPhone && styles.actionsPhone]}>
      {onBack && backLabel ? (
        <AppButton icon={ArrowLeft} label={backLabel} onPress={onBack} variant="ghost" />
      ) : (
        <View />
      )}
      <AppButton
        disabled={nextDisabled}
        label={nextLabel}
        onPress={onNext}
        style={isPhone ? styles.nextPhone : undefined}
        trailingIcon={ArrowRight}
      />
    </View>
  );
}

const CONTROL_BORDER = colorTokens.muted;

/** The look of every text box in the steps: a border you can see (muted is 5.9:1), the input radius, 48 px tall. */
export const textInputStyle = {
  minHeight: 48,
  paddingHorizontal: 14,
  borderRadius: radius.xl,
  borderWidth: 1.5,
  borderColor: CONTROL_BORDER,
  backgroundColor: colorTokens.surface,
  fontSize: 15,
  fontFamily: fonts.regular,
  color: colorTokens.ink,
} as const;

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 22, lineHeight: 28, fontFamily: fonts.bold, color: colorTokens.ink },
  subtitle: { marginTop: 6, fontSize: 14, lineHeight: 21, fontFamily: fonts.regular, color: colorTokens.muted },

  field: { marginBottom: 24 },
  labelRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 8 },
  label: { fontSize: 14, fontFamily: fonts.semiBold, color: colorTokens.ink },
  optional: { fontSize: 13, fontFamily: fonts.regular, color: colorTokens.muted },
  hint: { marginTop: 8, fontSize: 13, lineHeight: 19, fontFamily: fonts.regular, color: colorTokens.muted },

  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    backgroundColor: colorTokens.surface,
  },
  cardSelected: { borderColor: colorTokens.ink, backgroundColor: colorTokens.surfaceSunken },
  cardHovered: { backgroundColor: colorTokens.surfaceSunken },
  cardText: { flex: 1, minWidth: 0 },
  cardLabel: { fontSize: 14, lineHeight: 20, fontFamily: fonts.medium, color: colorTokens.ink },
  cardHint: { marginTop: 2, fontSize: 13, lineHeight: 18, fontFamily: fonts.regular, color: colorTokens.muted },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: CONTROL_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  dotSelected: { borderColor: colorTokens.ink },
  dotCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: colorTokens.ink },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    minWidth: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    backgroundColor: colorTokens.surface,
  },
  chipSelected: { backgroundColor: colorTokens.ink, borderColor: colorTokens.ink },
  chipText: { fontSize: 14, fontFamily: fonts.medium, color: colorTokens.ink },
  chipTextSelected: { color: colorTokens.onInk },

  checkRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    backgroundColor: colorTokens.surface,
  },
  checkRowChecked: { borderColor: colorTokens.ink, backgroundColor: colorTokens.surfaceSunken },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: CONTROL_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: { backgroundColor: colorTokens.ink, borderColor: colorTokens.ink },

  actions: {
    marginTop: 8,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  actionsPhone: { flexDirection: "column-reverse", alignItems: "stretch", gap: 8 },
  nextPhone: { alignSelf: "stretch" },
});
