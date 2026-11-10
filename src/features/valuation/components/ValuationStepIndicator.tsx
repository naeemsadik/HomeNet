import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "@/components/icons";
import { colorTokens, fonts } from "@/theme";
import { useTranslation, type TranslationKey } from "@/i18n";
import type { ValuationStep } from "../types/valuationTypes";

interface ValuationStepIndicatorProps {
  currentStep: ValuationStep;
  /** On a phone only the current step is named, with a progress bar. */
  compact?: boolean;
}

const STEPS: { step: ValuationStep; label: TranslationKey }[] = [
  { step: 1, label: "valuation.wizard.steps.location" },
  { step: 2, label: "valuation.wizard.steps.property" },
  { step: 3, label: "valuation.wizard.steps.features" },
  { step: 4, label: "valuation.wizard.steps.estimate" },
];

/** Where you are in the four steps. Numbers and words, not icons: done steps get a tick, the current one is filled. */
export function ValuationStepIndicator({ currentStep, compact = false }: ValuationStepIndicatorProps) {
  const { t } = useTranslation();
  const current = STEPS.find((s) => s.step === currentStep) ?? STEPS[0];

  if (compact) {
    return (
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: STEPS.length, now: currentStep }}>
        <Text style={styles.compactText}>
          {t("valuation.wizard.stepOf", { current: currentStep, total: STEPS.length })} · {t(current.label)}
        </Text>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${(currentStep / STEPS.length) * 100}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={t("valuation.wizard.stepOf", { current: currentStep, total: STEPS.length })}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: STEPS.length, now: currentStep }}
      style={styles.row}
    >
      {STEPS.map((item, index) => {
        const done = currentStep > item.step;
        const isCurrent = currentStep === item.step;
        return (
          <React.Fragment key={item.step}>
            <View style={styles.item}>
              <View style={[styles.circle, done && styles.circleDone, isCurrent && styles.circleCurrent]}>
                {done ? (
                  <Check color={colorTokens.onInk} size={14} strokeWidth={3} />
                ) : (
                  <Text style={[styles.number, isCurrent && styles.numberCurrent]}>{item.step}</Text>
                )}
              </View>
              <Text style={[styles.label, (isCurrent || done) && styles.labelOn]}>{t(item.label)}</Text>
            </View>
            {index < STEPS.length - 1 ? <View style={[styles.line, done && styles.lineDone]} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  item: { flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colorTokens.muted,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.surface,
  },
  circleDone: { backgroundColor: colorTokens.ink, borderColor: colorTokens.ink },
  circleCurrent: { backgroundColor: colorTokens.ink, borderColor: colorTokens.ink },
  number: { fontSize: 13, fontFamily: fonts.semiBold, color: colorTokens.muted },
  numberCurrent: { color: colorTokens.onInk },
  label: { fontSize: 14, fontFamily: fonts.medium, color: colorTokens.muted },
  labelOn: { color: colorTokens.ink },
  line: { flex: 1, height: 1.5, marginHorizontal: 12, backgroundColor: colorTokens.divider },
  lineDone: { backgroundColor: colorTokens.ink },

  compactText: { fontSize: 13, fontFamily: fonts.semiBold, color: colorTokens.ink },
  bar: { height: 4, marginTop: 8, marginBottom: 20, borderRadius: 2, backgroundColor: colorTokens.divider },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colorTokens.ink },
});
