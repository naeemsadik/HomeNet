import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, MapPin } from "@/components/icons";
import { AreaPicker } from "@/components/AreaPicker";
import { Field } from "@/components/ui";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { FieldBlock, OptionCards, StepActions, StepHeader, textInputStyle } from "./FormKit";
import type { ValuationPropertyType, ValuationPurpose } from "../types/valuationTypes";
import type { Area } from "@/types/api";

/** Step 1: what it is and where. The area is the only thing asked that the price cannot do without. */
export function Step1LocationDetails() {
  const { t } = useTranslation();
  const { form, setFormField, updateForm, nextStep, isStep1Valid } = useInstantValuation();
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  const purposes: { value: ValuationPurpose; label: string }[] = [
    { value: "sale", label: t("valuation.wizard.location.saleValue") },
    { value: "rent", label: t("valuation.wizard.location.monthlyRent") },
  ];

  const propertyTypes: { value: ValuationPropertyType; label: string }[] = [
    { value: "apartment", label: t("valuation.wizard.location.apartment") },
    { value: "house", label: t("valuation.wizard.location.house") },
    { value: "commercial", label: t("valuation.wizard.location.commercial") },
    { value: "land", label: t("valuation.wizard.location.land") },
  ];

  /** The address line on the report: the road or block if given, then the area. */
  const addressFor = (road: string, area: string) => [road.trim(), area, "Dhaka"].filter(Boolean).join(", ");

  const handleSelectArea = (area: Area | null) => {
    if (!area) return;
    updateForm({ areaId: area.id, areaName: area.name, address: addressFor(form.roadOrBlock, area.name) });
  };

  return (
    <View>
      <StepHeader title={t("valuation.wizard.location.title")} subtitle={t("valuation.wizard.location.subtitle")} />

      <FieldBlock label={t("valuation.wizard.location.purposeLabel")}>
        <OptionCards
          accessibilityLabel={t("valuation.wizard.location.purposeLabel")}
          onChange={(value) => setFormField("purpose", value)}
          options={purposes}
          value={form.purpose}
        />
      </FieldBlock>

      <FieldBlock label={t("valuation.wizard.location.typeLabel")}>
        <OptionCards
          accessibilityLabel={t("valuation.wizard.location.typeLabel")}
          onChange={(value) => setFormField("propertyType", value)}
          options={propertyTypes}
          value={form.propertyType}
        />
      </FieldBlock>

      <FieldBlock label={t("valuation.wizard.location.areaLabel")}>
        <Pressable
          accessibilityHint={t("valuation.wizard.location.areaPlaceholder")}
          accessibilityLabel={`${t("valuation.wizard.location.areaLabel")}: ${
            form.areaName || t("valuation.wizard.location.areaPlaceholder")
          }`}
          accessibilityRole="button"
          onPress={() => setAreaPickerOpen(true)}
          style={({ hovered }: { hovered?: boolean }) => [
            styles.picker,
            hovered && styles.pickerHovered,
            webPointer,
          ]}
        >
          <MapPin color={colorTokens.brandText} size={18} strokeWidth={2.2} />
          <Text style={[styles.pickerText, !form.areaName && styles.pickerPlaceholder]}>
            {form.areaName || t("valuation.wizard.location.areaPlaceholder")}
          </Text>
          <ChevronDown color={colorTokens.muted} size={18} strokeWidth={2} />
        </Pressable>
      </FieldBlock>

      <FieldBlock
        hint={t("valuation.wizard.location.addressHint")}
        label={t("valuation.wizard.location.roadLabel")}
        optional
        optionalLabel={t("valuation.wizard.optional")}
      >
        <Field
          accessibilityLabel={t("valuation.wizard.location.roadLabel")}
          onChangeText={(road) => updateForm({ roadOrBlock: road, address: addressFor(road, form.areaName) })}
          placeholder={t("valuation.wizard.location.roadPlaceholder")}
          style={textInputStyle}
          value={form.roadOrBlock}
        />
      </FieldBlock>

      <FieldBlock
        label={t("valuation.wizard.location.buildingLabel")}
        optional
        optionalLabel={t("valuation.wizard.optional")}
      >
        <Field
          accessibilityLabel={t("valuation.wizard.location.buildingLabel")}
          onChangeText={(name) => setFormField("buildingName", name)}
          placeholder={t("valuation.wizard.location.buildingPlaceholder")}
          style={textInputStyle}
          value={form.buildingName}
        />
      </FieldBlock>

      <StepActions nextDisabled={!isStep1Valid} nextLabel={t("valuation.wizard.location.next")} onNext={nextStep} />

      <AreaPicker
        onClose={() => setAreaPickerOpen(false)}
        onSelect={(area) => {
          handleSelectArea(area);
          setAreaPickerOpen(false);
        }}
        selectedArea={null}
        visible={areaPickerOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colorTokens.muted,
    backgroundColor: colorTokens.surface,
  },
  pickerHovered: { backgroundColor: colorTokens.surfaceSunken },
  pickerText: { flex: 1, fontSize: 15, fontFamily: fonts.medium, color: colorTokens.ink },
  pickerPlaceholder: { fontFamily: fonts.regular, color: colorTokens.muted },
});
