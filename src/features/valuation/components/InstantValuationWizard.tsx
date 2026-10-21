import React from "react";
import { StyleSheet, View } from "react-native";
import { colorTokens, radius, shadow } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { ValuationStepIndicator } from "./ValuationStepIndicator";
import { Step1LocationDetails } from "./Step1LocationDetails";
import { Step2PropertySpecs } from "./Step2PropertySpecs";
import { Step3Amenities } from "./Step3Amenities";
import { Step4ResultDashboard } from "./Step4ResultDashboard";

export function InstantValuationWizard() {
  const { currentStep } = useInstantValuation();
  const { isPhone } = useResponsive();

  return (
    <View style={[styles.card, isPhone && styles.cardPhone]}>
      <ValuationStepIndicator currentStep={currentStep} compact={isPhone} />

      <View style={styles.contentWrap}>
        {currentStep === 1 && <Step1LocationDetails />}
        {currentStep === 2 && <Step2PropertySpecs />}
        {currentStep === 3 && <Step3Amenities />}
        {currentStep === 4 && <Step4ResultDashboard />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 28,
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    ...shadow,
  },
  cardPhone: {
    padding: 16,
    borderRadius: radius.lg,
  },
  contentWrap: {
    marginTop: 12,
  },
});
