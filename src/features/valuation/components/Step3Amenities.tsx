import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fonts } from "@/theme";
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { CheckRow, ChoiceChips, FieldBlock, StepActions, StepHeader, type Option } from "./FormKit";
import type { LegalPapers, RoadAccess, ValuationAmenities, Waterlogging } from "../types/valuationTypes";

/** Step 3: the building and the site. Everything starts unticked: unticked changes nothing. */
export function Step3Amenities() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { form, setFormField, toggleAmenity, prevStep, executeValuation } = useInstantValuation();

  const features: { key: keyof ValuationAmenities; label: string }[] = [
    { key: "lift", label: t("valuation.wizard.features.lift") },
    { key: "generator", label: t("valuation.wizard.features.generator") },
    { key: "parking", label: t("valuation.wizard.features.parking") },
    { key: "gas", label: t("valuation.wizard.features.gas") },
    { key: "cctv", label: t("valuation.wizard.features.cctv") },
    { key: "rooftop", label: t("valuation.wizard.features.rooftop") },
    { key: "lakeParkView", label: t("valuation.wizard.features.lakeView") },
  ];

  const roads: Option<RoadAccess>[] = [
    { value: "main_road", label: t("valuation.wizard.features.mainRoad") },
    { value: "wide_road", label: t("valuation.wizard.features.wideRoad") },
    { value: "narrow_lane", label: t("valuation.wizard.features.narrowLane") },
  ];
  const papers: Option<LegalPapers>[] = [
    { value: "complete", label: t("valuation.wizard.features.papersComplete") },
    { value: "unsure", label: t("valuation.wizard.features.papersUnsure") },
  ];
  const water: Option<Waterlogging>[] = [
    { value: "never", label: t("valuation.wizard.features.waterNever") },
    { value: "sometimes", label: t("valuation.wizard.features.waterSometimes") },
  ];

  // A plot has no lift or generator to tick.
  const showBuilding = form.propertyType !== "land";

  return (
    <View>
      <StepHeader title={t("valuation.wizard.features.title")} subtitle={t("valuation.wizard.features.subtitle")} />

      {showBuilding ? (
        <FieldBlock label={t("valuation.wizard.features.buildingTitle")}>
          <View style={styles.checkList}>
            {features.map((feature) => (
              <View key={feature.key} style={isPhone ? styles.cellFull : styles.cellHalf}>
                <CheckRow
                  checked={form.amenities[feature.key]}
                  label={feature.label}
                  onToggle={() => toggleAmenity(feature.key)}
                />
              </View>
            ))}
          </View>
        </FieldBlock>
      ) : null}

      <Text accessibilityRole="header" style={styles.groupTitle}>
        {t("valuation.wizard.features.siteTitle")}
      </Text>

      <FieldBlock label={t("valuation.wizard.features.roadLabel")}>
        <ChoiceChips
          accessibilityLabel={t("valuation.wizard.features.roadLabel")}
          onChange={(value) => value && setFormField("roadAccess", value as RoadAccess)}
          options={roads}
          value={form.roadAccess}
        />
      </FieldBlock>

      <FieldBlock label={t("valuation.wizard.features.papersLabel")}>
        <ChoiceChips
          accessibilityLabel={t("valuation.wizard.features.papersLabel")}
          onChange={(value) => value && setFormField("legalPapers", value as LegalPapers)}
          options={papers}
          value={form.legalPapers}
        />
      </FieldBlock>

      <FieldBlock label={t("valuation.wizard.features.waterLabel")}>
        <ChoiceChips
          accessibilityLabel={t("valuation.wizard.features.waterLabel")}
          onChange={(value) => value && setFormField("waterlogging", value as Waterlogging)}
          options={water}
          value={form.waterlogging}
        />
      </FieldBlock>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>{t("valuation.wizard.features.noteTitle")}</Text>
        <Text style={styles.noteBody}>{t("valuation.wizard.features.noteBody")}</Text>
      </View>

      <StepActions
        backLabel={t("valuation.wizard.back")}
        nextLabel={t("valuation.wizard.features.calculate")}
        onBack={prevStep}
        onNext={() => void executeValuation()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  checkList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cellFull: { width: "100%" },
  cellHalf: { width: "49%", flexGrow: 1 },
  groupTitle: { marginBottom: 16, fontSize: 16, fontFamily: fonts.bold, color: colorTokens.ink },
  note: { marginBottom: 16, paddingTop: 4 },
  noteTitle: { fontSize: 13, fontFamily: fonts.semiBold, color: colorTokens.ink },
  noteBody: { marginTop: 4, fontSize: 13, lineHeight: 19, fontFamily: fonts.regular, color: colorTokens.muted },
});
