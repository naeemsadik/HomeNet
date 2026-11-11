import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Field } from "@/components/ui";
import { colorTokens, fonts } from "@/theme";
import { useTranslation } from "@/i18n";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { ChoiceChips, FieldBlock, StepActions, StepHeader, textInputStyle, type Option } from "./FormKit";
import type { PropertyCondition, PropertyFacing } from "../types/valuationTypes";

/** Step 2: how big it is. Only the size is needed; everything else is optional and left unset until chosen. */
export function Step2PropertySpecs() {
  const { t } = useTranslation();
  const { form, setFormField, nextStep, prevStep, isStep2Valid } = useInstantValuation();
  const [sizeTouched, setSizeTouched] = useState(false);

  const isLand = form.propertyType === "land";
  const hasRooms = form.propertyType === "apartment" || form.propertyType === "house";
  const isApartment = form.propertyType === "apartment";

  const units: Option<"sqft" | "katha">[] = [
    { value: "sqft", label: t("valuation.wizard.property.unitSqft") },
    { value: "katha", label: t("valuation.wizard.property.unitKatha") },
  ];

  const bedrooms: Option<number>[] = [
    { value: 0, label: t("valuation.wizard.property.studio") },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5+" },
  ];
  const bathrooms: Option<number>[] = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5+" },
  ];

  // The numbers are the floor the estimate uses for that band.
  const floors: Option<string>[] = [
    { value: "1", label: t("valuation.wizard.property.floors.ground") },
    { value: "2", label: t("valuation.wizard.property.floors.low") },
    { value: "6", label: t("valuation.wizard.property.floors.mid") },
    { value: "11", label: t("valuation.wizard.property.floors.high") },
    { value: "16", label: t("valuation.wizard.property.floors.top") },
  ];

  const facings: Option<PropertyFacing>[] = [
    { value: "north", label: t("valuation.wizard.property.facing.north") },
    { value: "east", label: t("valuation.wizard.property.facing.east") },
    { value: "south", label: t("valuation.wizard.property.facing.south") },
    { value: "west", label: t("valuation.wizard.property.facing.west") },
  ];

  const conditions: Option<PropertyCondition>[] = [
    { value: "brand_new", label: t("valuation.wizard.property.conditions.ready") },
    { value: "under_construction", label: t("valuation.wizard.property.conditions.underConstruction") },
    { value: "resale", label: t("valuation.wizard.property.conditions.resale") },
  ];

  const sizeMissing = sizeTouched && !isStep2Valid;

  return (
    <View>
      <StepHeader title={t("valuation.wizard.property.title")} subtitle={t("valuation.wizard.property.subtitle")} />

      <FieldBlock
        hint={form.sizeUnit === "katha" ? t("valuation.wizard.property.kathaHint") : undefined}
        label={t("valuation.wizard.property.sizeLabel")}
      >
        <View style={styles.sizeRow}>
          <View style={styles.sizeInput}>
            <Field
              accessibilityLabel={t("valuation.wizard.property.sizeLabel")}
              keyboardType="decimal-pad"
              onBlur={() => setSizeTouched(true)}
              onChangeText={(value) => setFormField("sizeInput", value.replace(/[^0-9.]/g, ""))}
              placeholder={t("valuation.wizard.property.sizePlaceholder")}
              style={textInputStyle}
              value={form.sizeInput}
            />
          </View>
          <ChoiceChips
            accessibilityLabel={t("valuation.wizard.property.sizeLabel")}
            onChange={(value) => value && setFormField("sizeUnit", value as "sqft" | "katha")}
            options={units}
            value={form.sizeUnit}
          />
        </View>
        {sizeMissing ? <Text style={styles.error}>{t("valuation.wizard.property.sizeRequired")}</Text> : null}
      </FieldBlock>

      {hasRooms ? (
        <>
          <FieldBlock label={t("valuation.wizard.property.bedrooms")} optional optionalLabel={t("valuation.wizard.optional")}>
            <ChoiceChips
              accessibilityLabel={t("valuation.wizard.property.bedrooms")}
              clearable
              onChange={(value) => setFormField("bedrooms", value === "" ? null : (value as number | null))}
              options={bedrooms}
              value={form.bedrooms}
            />
          </FieldBlock>
          <FieldBlock
            hint={t("valuation.wizard.property.layoutHint")}
            label={t("valuation.wizard.property.bathrooms")}
            optional
            optionalLabel={t("valuation.wizard.optional")}
          >
            <ChoiceChips
              accessibilityLabel={t("valuation.wizard.property.bathrooms")}
              clearable
              onChange={(value) => setFormField("bathrooms", value === "" ? null : (value as number | null))}
              options={bathrooms}
              value={form.bathrooms}
            />
          </FieldBlock>
        </>
      ) : null}

      {isApartment ? (
        <FieldBlock label={t("valuation.wizard.property.floorLabel")} optional optionalLabel={t("valuation.wizard.optional")}>
          <ChoiceChips
            accessibilityLabel={t("valuation.wizard.property.floorLabel")}
            clearable
            onChange={(value) => setFormField("floorLevel", String(value ?? ""))}
            options={floors}
            value={form.floorLevel}
          />
        </FieldBlock>
      ) : null}

      {hasRooms ? (
        <FieldBlock label={t("valuation.wizard.property.facingLabel")} optional optionalLabel={t("valuation.wizard.optional")}>
          <ChoiceChips
            accessibilityLabel={t("valuation.wizard.property.facingLabel")}
            clearable
            onChange={(value) => setFormField("facing", (value ?? "") as PropertyFacing | "")}
            options={facings}
            value={form.facing}
          />
        </FieldBlock>
      ) : null}

      {!isLand ? (
        <FieldBlock label={t("valuation.wizard.property.conditionLabel")} optional optionalLabel={t("valuation.wizard.optional")}>
          <ChoiceChips
            accessibilityLabel={t("valuation.wizard.property.conditionLabel")}
            clearable
            onChange={(value) => setFormField("propertyAge", (value ?? "") as PropertyCondition | "")}
            options={conditions}
            value={form.propertyAge}
          />
        </FieldBlock>
      ) : null}

      <StepActions
        backLabel={t("valuation.wizard.back")}
        nextDisabled={!isStep2Valid}
        nextLabel={t("valuation.wizard.property.next")}
        onBack={prevStep}
        onNext={nextStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sizeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  sizeInput: { flexGrow: 1, flexBasis: 160, maxWidth: 280 },
  error: { marginTop: 8, fontSize: 13, fontFamily: fonts.medium, color: colorTokens.errorText },
});
