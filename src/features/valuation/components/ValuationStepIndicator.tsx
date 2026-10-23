import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, MapPin, SlidersHorizontal, Sparkles, TrendingUp } from "@/components/icons";
import { colorTokens, colors, fonts } from "@/theme";
import type { ValuationStep } from "../types/valuationTypes";

interface ValuationStepIndicatorProps {
  currentStep: ValuationStep;
  compact?: boolean;
}

const STEPS = [
  { step: 1 as ValuationStep, label: "Location", icon: MapPin },
  { step: 2 as ValuationStep, label: "Property Specs", icon: SlidersHorizontal },
  { step: 3 as ValuationStep, label: "Amenities", icon: Sparkles },
  { step: 4 as ValuationStep, label: "Valuation Report", icon: TrendingUp },
];

export function ValuationStepIndicator({
  currentStep,
  compact = false,
}: ValuationStepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((item, index) => {
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.step}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Check color={colorTokens.onBrand} size={14} strokeWidth={2.8} />
                  ) : (
                    <Icon
                      color={isCurrent ? colorTokens.onBrand : colors.muted}
                      size={14}
                      strokeWidth={2.2}
                    />
                  )}
                </View>

                {!compact && (
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelCurrent,
                      isCompleted && styles.stepLabelCompleted,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </View>

              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    currentStep > item.step && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.12)",
  },
  circleCompleted: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  circleCurrent: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
    shadowColor: colorTokens.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  stepLabelCurrent: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
  },
  stepLabelCompleted: {
    color: colorTokens.brandText,
    fontFamily: fonts.medium,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(11, 26, 23, 0.08)",
    marginHorizontal: 8,
  },
  connectorCompleted: {
    backgroundColor: colorTokens.brand,
  },
});
