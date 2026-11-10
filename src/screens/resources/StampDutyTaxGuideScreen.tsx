import { useState, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import {
  AlertCircle,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileCheck,
  FileText,
  LandPlot,
  Receipt,
  RotateCcw,
  ShieldCheck,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export type LocationType = "dhaka_ctg" | "other_city" | "municipality" | "rural";
export type PropertyType = "secondary" | "developer";
export type FlatSizeType = "under_1600" | "over_1600";

const PRESET_VALUES = [
  { key: "preset50L", value: 5_000_000 },
  { key: "preset1C", value: 10_000_000 },
  { key: "preset2C", value: 20_000_000 },
  { key: "preset5C", value: 50_000_000 },
] as const;

function formatBDT(amount: number): string {
  return `৳ ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function StampDutyTaxGuideScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();

  const [deedValueInput, setDeedValueInput] = useState<string>("10000000");
  const [location, setLocation] = useState<LocationType>("dhaka_ctg");
  const [propertyType, setPropertyType] = useState<PropertyType>("secondary");
  const [flatSize, setFlatSize] = useState<FlatSizeType>("under_1600");
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({
    0: true,
  });

  const deedValue = useMemo(() => {
    const cleaned = deedValueInput.replace(/[^0-9]/g, "");
    const parsed = parseInt(cleaned, 10);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [deedValueInput]);

  const calculations = useMemo(() => {
    const stampDutyRate = 0.015;
    const regFeeRate = 0.01;
    const lgtRate = location === "rural" ? 0.01 : 0.02;

    let aitRate = 0.04;
    if (location === "other_city") aitRate = 0.03;
    else if (location === "municipality") aitRate = 0.02;
    else if (location === "rural") aitRate = 0.01;

    let vatRate = 0;
    if (propertyType === "developer") {
      vatRate = flatSize === "over_1600" ? 0.045 : 0.02;
    }

    const stampDuty = deedValue * stampDutyRate;
    const regFee = deedValue * regFeeRate;
    const localGovtTax = deedValue * lgtRate;
    const ait = deedValue * aitRate;
    const vat = deedValue * vatRate;
    const totalStatutory = stampDuty + regFee + localGovtTax + ait + vat;
    const effectiveRate = deedValue > 0 ? (totalStatutory / deedValue) * 100 : 0;

    return {
      stampDutyRate,
      regFeeRate,
      lgtRate,
      aitRate,
      vatRate,
      stampDuty,
      regFee,
      localGovtTax,
      ait,
      vat,
      totalStatutory,
      effectiveRate,
    };
  }, [deedValue, location, propertyType, flatSize]);

  const handleReset = () => {
    setDeedValueInput("10000000");
    setLocation("dhaka_ctg");
    setPropertyType("secondary");
    setFlatSize("under_1600");
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const workflowSteps = [
    {
      num: "01",
      title: t("stampDutyGuide.step1Title"),
      desc: t("stampDutyGuide.step1Desc"),
      icon: FileCheck,
    },
    {
      num: "02",
      title: t("stampDutyGuide.step2Title"),
      desc: t("stampDutyGuide.step2Desc"),
      icon: ShieldCheck,
    },
    {
      num: "03",
      title: t("stampDutyGuide.step3Title"),
      desc: t("stampDutyGuide.step3Desc"),
      icon: FileText,
    },
    {
      num: "04",
      title: t("stampDutyGuide.step4Title"),
      desc: t("stampDutyGuide.step4Desc"),
      icon: Receipt,
    },
    {
      num: "05",
      title: t("stampDutyGuide.step5Title"),
      desc: t("stampDutyGuide.step5Desc"),
      icon: Building2,
    },
    {
      num: "06",
      title: t("stampDutyGuide.step6Title"),
      desc: t("stampDutyGuide.step6Desc"),
      icon: CheckCircle2,
    },
  ];

  const legalDocuments = [
    { title: t("stampDutyGuide.doc1Title"), desc: t("stampDutyGuide.doc1Desc") },
    { title: t("stampDutyGuide.doc2Title"), desc: t("stampDutyGuide.doc2Desc") },
    { title: t("stampDutyGuide.doc3Title"), desc: t("stampDutyGuide.doc3Desc") },
    { title: t("stampDutyGuide.doc4Title"), desc: t("stampDutyGuide.doc4Desc") },
    { title: t("stampDutyGuide.doc5Title"), desc: t("stampDutyGuide.doc5Desc") },
    { title: t("stampDutyGuide.doc6Title"), desc: t("stampDutyGuide.doc6Desc") },
    { title: t("stampDutyGuide.doc7Title"), desc: t("stampDutyGuide.doc7Desc") },
  ];

  const faqs = [
    { q: t("stampDutyGuide.faq1Q"), a: t("stampDutyGuide.faq1A") },
    { q: t("stampDutyGuide.faq2Q"), a: t("stampDutyGuide.faq2A") },
    { q: t("stampDutyGuide.faq3Q"), a: t("stampDutyGuide.faq3A") },
    { q: t("stampDutyGuide.faq4Q"), a: t("stampDutyGuide.faq4A") },
    { q: t("stampDutyGuide.faq5Q"), a: t("stampDutyGuide.faq5A") },
  ];

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("stampDutyGuide.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("stampDutyGuide.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("stampDutyGuide.subheading")}
          </Text>

          <View style={[styles.heroBadges, isPhone && styles.heroBadgesPhone]}>
            <View style={styles.badgeItem}>
              <ShieldCheck color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>Stamp Act 1899 Compliant</Text>
            </View>
            <View style={styles.badgeItem}>
              <Receipt color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>Income Tax Act 2023 Aligned</Text>
            </View>
            <View style={styles.badgeItem}>
              <LandPlot color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>Registration Act 1908 Rates</Text>
            </View>
          </View>
        </View>

        {/* Calculator Section */}
        <View style={styles.section}>
          <View style={[styles.calculatorCard, isPhone && styles.calculatorCardPhone]}>
            <View style={styles.calcHeader}>
              <View style={styles.calcIconWrap}>
                <Calculator color={colorTokens.brandText} size={24} />
              </View>
              <View style={styles.calcHeaderTextWrap}>
                <Text
                  accessibilityRole="header"
                  aria-level={2}
                  style={[styles.calcTitle, isPhone && styles.calcTitlePhone]}
                >
                  {t("stampDutyGuide.calculatorTitle")}
                </Text>
                <Text style={styles.calcSubtitle}>
                  {t("stampDutyGuide.calculatorSubtitle")}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={[styles.calcGrid, (isPhone || isTablet) && styles.calcGridStack]}>
              <View style={styles.calcInputsColumn}>
                {/* Deed Value Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("stampDutyGuide.deedValueLabel")}
                  </Text>
                  <View style={styles.textInputWrap}>
                    <Text style={styles.currencySymbol}>৳</Text>
                    <TextInput
                      accessibilityLabel={t("stampDutyGuide.deedValueLabel")}
                      keyboardType="number-pad"
                      onChangeText={setDeedValueInput}
                      placeholder={t("stampDutyGuide.deedValuePlaceholder")}
                      placeholderTextColor={colorTokens.subtle}
                      style={styles.textInput}
                      value={deedValueInput}
                    />
                  </View>
                  {deedValue > 0 ? (
                    <Text style={styles.inputFormattedHint}>
                      {formatBDT(deedValue)} ({formatPrice(deedValue, "BDT")})
                    </Text>
                  ) : null}

                  {/* Preset Chips */}
                  <View style={styles.presetWrap}>
                    {PRESET_VALUES.map((preset) => {
                      const isSelected = deedValue === preset.value;
                      return (
                        <Pressable
                          key={preset.key}
                          accessibilityRole="button"
                          onPress={() => setDeedValueInput(preset.value.toString())}
                          style={[
                            styles.presetChip,
                            webPointer,
                            isSelected && styles.presetChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              isSelected && styles.presetChipTextActive,
                            ]}
                          >
                            {t(`stampDutyGuide.${preset.key}` as TranslationKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Location Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("stampDutyGuide.locationLabel")}
                  </Text>
                  <View style={styles.optionColumn}>
                    {(
                      [
                        { id: "dhaka_ctg", key: "locDhakaCtg" },
                        { id: "other_city", key: "locOtherCity" },
                        { id: "municipality", key: "locMunicipality" },
                        { id: "rural", key: "locRural" },
                      ] as const
                    ).map((item) => {
                      const isSelected = location === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => setLocation(item.id)}
                          style={[
                            styles.optionRow,
                            webPointer,
                            isSelected && styles.optionRowActive,
                          ]}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleActive,
                            ]}
                          >
                            {isSelected ? <View style={styles.radioDot} /> : null}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextActive,
                            ]}
                          >
                            {t(`stampDutyGuide.${item.key}` as TranslationKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Property Type Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("stampDutyGuide.propertyTypeLabel")}
                  </Text>
                  <View style={styles.segmentedRow}>
                    {(
                      [
                        { id: "secondary", key: "typeSecondary" },
                        { id: "developer", key: "typeDeveloper" },
                      ] as const
                    ).map((typeItem) => {
                      const isSelected = propertyType === typeItem.id;
                      return (
                        <Pressable
                          key={typeItem.id}
                          accessibilityRole="button"
                          onPress={() => setPropertyType(typeItem.id)}
                          style={[
                            styles.segmentedItem,
                            webPointer,
                            isSelected && styles.segmentedItemActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.segmentedItemText,
                              isSelected && styles.segmentedItemTextActive,
                            ]}
                          >
                            {t(`stampDutyGuide.${typeItem.key}` as TranslationKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Flat Size Selection (Visible for Developer) */}
                {propertyType === "developer" ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {t("stampDutyGuide.flatSizeLabel")}
                    </Text>
                    <View style={styles.segmentedRow}>
                      {(
                        [
                          { id: "under_1600", key: "sizeUnder1600" },
                          { id: "over_1600", key: "sizeOver1600" },
                        ] as const
                      ).map((sizeItem) => {
                        const isSelected = flatSize === sizeItem.id;
                        return (
                          <Pressable
                            key={sizeItem.id}
                            accessibilityRole="button"
                            onPress={() => setFlatSize(sizeItem.id)}
                            style={[
                              styles.segmentedItem,
                              webPointer,
                              isSelected && styles.segmentedItemActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.segmentedItemText,
                                isSelected && styles.segmentedItemTextActive,
                              ]}
                            >
                              {t(`stampDutyGuide.${sizeItem.key}` as TranslationKey)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {/* Reset Button */}
                <Pressable
                  accessibilityRole="button"
                  onPress={handleReset}
                  style={[styles.resetButton, webPointer]}
                >
                  <RotateCcw color={colorTokens.muted} size={16} />
                  <Text style={styles.resetButtonText}>
                    {t("stampDutyGuide.resetBtn")}
                  </Text>
                </Pressable>
              </View>

              {/* Breakdown Output Column */}
              <View style={styles.calcResultsColumn}>
                <View style={styles.resultsCard}>
                  <Text style={styles.breakdownHeaderTitle}>
                    {t("stampDutyGuide.breakdownTitle")}
                  </Text>

                  {/* Stamp Duty */}
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelGroup}>
                      <Text style={styles.breakdownItemLabel}>
                        {t("stampDutyGuide.stampDutyLabel")}
                      </Text>
                      <View style={styles.payerTagBuyer}>
                        <Text style={styles.payerTagTextBuyer}>
                          {t("stampDutyGuide.whoPaysBuyer")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownItemValue}>
                      {formatBDT(calculations.stampDuty)}
                    </Text>
                  </View>

                  {/* Registration Fee */}
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelGroup}>
                      <Text style={styles.breakdownItemLabel}>
                        {t("stampDutyGuide.regFeeLabel")}
                      </Text>
                      <View style={styles.payerTagBuyer}>
                        <Text style={styles.payerTagTextBuyer}>
                          {t("stampDutyGuide.whoPaysBuyer")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownItemValue}>
                      {formatBDT(calculations.regFee)}
                    </Text>
                  </View>

                  {/* Local Govt Tax */}
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelGroup}>
                      <Text style={styles.breakdownItemLabel}>
                        {`${t("stampDutyGuide.localGovtTaxLabel")} (${(calculations.lgtRate * 100).toFixed(1)}%)`}
                      </Text>
                      <View style={styles.payerTagBuyer}>
                        <Text style={styles.payerTagTextBuyer}>
                          {t("stampDutyGuide.whoPaysBuyer")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownItemValue}>
                      {formatBDT(calculations.localGovtTax)}
                    </Text>
                  </View>

                  {/* Advance Income Tax (AIT) */}
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelGroup}>
                      <Text style={styles.breakdownItemLabel}>
                        {`${t("stampDutyGuide.aitLabel")} (${(calculations.aitRate * 100).toFixed(1)}%)`}
                      </Text>
                      <View style={styles.payerTagSeller}>
                        <Text style={styles.payerTagTextSeller}>
                          {t("stampDutyGuide.whoPaysSeller")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownItemValue}>
                      {formatBDT(calculations.ait)}
                    </Text>
                  </View>

                  {/* VAT */}
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelGroup}>
                      <Text style={styles.breakdownItemLabel}>
                        {`${t("stampDutyGuide.vatLabel")} (${(calculations.vatRate * 100).toFixed(1)}%)`}
                      </Text>
                      {propertyType === "developer" ? (
                        <View style={styles.payerTagDeveloper}>
                          <Text style={styles.payerTagTextDeveloper}>
                            {t("stampDutyGuide.whoPaysDeveloper")}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.payerTagExempt}>
                          <Text style={styles.payerTagTextExempt}>
                            {t("stampDutyGuide.vatExempt")}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.breakdownItemValue}>
                      {formatBDT(calculations.vat)}
                    </Text>
                  </View>

                  {/* Total Summary */}
                  <View style={styles.totalBlock}>
                    <View style={styles.totalHeaderRow}>
                      <Text style={styles.totalBlockLabel}>
                        {t("stampDutyGuide.totalGovtCost")}
                      </Text>
                      <View style={styles.effectiveRateBadge}>
                        <Text style={styles.effectiveRateBadgeText}>
                          {`${t("stampDutyGuide.effectiveRateLabel")}: ${calculations.effectiveRate.toFixed(2)}%`}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.totalBlockValue}>
                      {formatBDT(calculations.totalStatutory)}
                    </Text>
                    <Text style={styles.totalCompactValue}>
                      {formatPrice(calculations.totalStatutory, "BDT")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6-Step Registration Workflow Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.workflowTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("stampDutyGuide.workflowSubtitle")}
            </Text>
          </View>

          <View style={[styles.workflowGrid, isPhone && styles.workflowGridPhone]}>
            {workflowSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <View
                  key={step.num}
                  style={[styles.workflowCard, isPhone && styles.workflowCardPhone]}
                >
                  <View style={styles.workflowCardTop}>
                    <Text style={styles.workflowStepNumber}>{step.num}</Text>
                    <View style={styles.workflowIconWrap}>
                      <StepIcon color={colorTokens.brandText} size={20} />
                    </View>
                  </View>
                  <Text style={styles.workflowCardTitle}>{step.title}</Text>
                  <Text style={styles.workflowCardDesc}>{step.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Legal Documents Checklist Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.documentsTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("stampDutyGuide.documentsSubtitle")}
            </Text>
          </View>

          <View style={[styles.documentsGrid, isPhone && styles.documentsGridPhone]}>
            {legalDocuments.map((doc, idx) => (
              <View
                key={idx}
                style={[styles.docCard, isPhone && styles.docCardPhone]}
              >
                <View style={styles.docIconWrap}>
                  <Check color={colorTokens.brandText} size={18} />
                </View>
                <View style={styles.docTextWrap}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docDesc}>{doc.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section with Accordions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.faqTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("stampDutyGuide.faqSubtitle")}
            </Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => {
              const isExpanded = !!expandedFaqs[index];
              return (
                <View key={index} style={styles.faqCard}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => toggleFaq(index)}
                    style={[styles.faqQuestionRow, webPointer]}
                  >
                    <View style={styles.faqQuestionTextWrap}>
                      <CircleHelp
                        color={colorTokens.brandText}
                        size={20}
                        style={styles.faqQuestionIcon}
                      />
                      <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    </View>
                    <View
                      style={[
                        styles.faqChevronWrap,
                        isExpanded && styles.faqChevronWrapRotated,
                      ]}
                    >
                      <ChevronDown color={colorTokens.body} size={20} />
                    </View>
                  </Pressable>
                  {isExpanded ? (
                    <View style={styles.faqAnswerWrap}>
                      <Text style={styles.faqAnswerText}>{faq.a}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Statutory Legal Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <AlertCircle color={colorTokens.warningText} size={22} />
              <Text style={styles.disclaimerTitle}>
                {t("stampDutyGuide.disclaimerTitle")}
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              {t("stampDutyGuide.disclaimerBody")}
            </Text>
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 40,
    paddingBottom: 64,
  },
  containerPhone: {
    paddingHorizontal: layout.gutterPhone,
    paddingTop: 24,
    paddingBottom: 48,
  },
  // ─── Hero ──────────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 44,
  },
  heroPhone: {
    marginBottom: 28,
    alignItems: "flex-start",
    textAlign: "left",
  },
  eyebrow: {
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 14,
    maxWidth: 760,
  },
  heroTitlePhone: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: "left",
  },
  heroCopy: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colorTokens.muted,
    textAlign: "center",
    maxWidth: 680,
    marginBottom: 24,
  },
  heroCopyPhone: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 20,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  heroBadgesPhone: {
    justifyContent: "flex-start",
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    minHeight: 38,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.brandText,
  },

  // ─── Sections Common ──────────────────────────────────────────────────
  section: {
    marginBottom: 48,
  },
  sectionHeaderWrap: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  sectionTitlePhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },

  // ─── Calculator ────────────────────────────────────────────────────────
  calculatorCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    padding: 28,
    ...shadow,
  },
  calculatorCardPhone: {
    padding: 16,
  },
  calcHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  calcIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  calcHeaderTextWrap: {
    flex: 1,
  },
  calcTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
    marginBottom: 3,
  },
  calcTitlePhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  calcSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.muted,
  },
  calcGrid: {
    flexDirection: "row",
    gap: 28,
  },
  calcGridStack: {
    flexDirection: "column",
    gap: 20,
  },
  calcInputsColumn: {
    flex: 1.1,
  },
  calcResultsColumn: {
    flex: 0.9,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  textInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  currencySymbol: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colorTokens.brandText,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colorTokens.ink,
    minHeight: 44,
  },
  inputFormattedHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.brandText,
    marginTop: 4,
  },
  presetWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  presetChipActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  presetChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  presetChipTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  optionColumn: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    gap: 12,
  },
  optionRowActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colorTokens.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: colorTokens.brandText,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colorTokens.brandText,
  },
  optionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colorTokens.body,
    flex: 1,
  },
  optionTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  segmentedRow: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: colorTokens.border,
    gap: 3,
  },
  segmentedItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.xs,
    minHeight: 44,
  },
  segmentedItemActive: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    ...shadow,
  },
  segmentedItemText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
    textAlign: "center",
  },
  segmentedItemTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    minHeight: 44,
  },
  resetButtonText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
  },

  // ─── Calculator Results Column ─────────────────────────────────────────
  resultsCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    padding: 20,
  },
  breakdownHeaderTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.ink,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  breakdownLabelGroup: {
    flex: 1,
    marginRight: 12,
  },
  breakdownItemLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.ink,
    marginBottom: 3,
  },
  breakdownItemValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colorTokens.ink,
  },
  payerTagBuyer: {
    alignSelf: "flex-start",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  payerTagTextBuyer: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.brandText,
  },
  payerTagSeller: {
    alignSelf: "flex-start",
    backgroundColor: "#F3E8FF",
    borderColor: "#E9D5FF",
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  payerTagTextSeller: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "#6B21A8",
  },
  payerTagDeveloper: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  payerTagTextDeveloper: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "#1D4ED8",
  },
  payerTagExempt: {
    alignSelf: "flex-start",
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  payerTagTextExempt: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colorTokens.muted,
  },
  totalBlock: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
    padding: 16,
    marginTop: 16,
  },
  totalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  totalBlockLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colorTokens.ink,
  },
  effectiveRateBadge: {
    backgroundColor: colorTokens.brandSurface,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  effectiveRateBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colorTokens.brandText,
  },
  totalBlockValue: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    lineHeight: 30,
    color: colorTokens.brandText,
    marginBottom: 2,
  },
  totalCompactValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
  },

  // ─── 6-Step Workflow ──────────────────────────────────────────────────
  workflowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  workflowGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  workflowCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    padding: 20,
    ...shadow,
  },
  workflowCardPhone: {
    minWidth: "100%",
    padding: 16,
  },
  workflowCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  workflowStepNumber: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colorTokens.brandText,
  },
  workflowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  workflowCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  workflowCardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.muted,
  },

  // ─── Documents Checklist ──────────────────────────────────────────────
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  documentsGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  docCard: {
    width: "48.5%",
    flexDirection: "row",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  docCardPhone: {
    width: "100%",
    padding: 14,
  },
  docIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  docTextWrap: {
    flex: 1,
  },
  docTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  docDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colorTokens.muted,
  },

  // ─── FAQ Accordions ───────────────────────────────────────────────────
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 10,
  },
  faqQuestionTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  faqQuestionIcon: {
    marginTop: 1,
  },
  faqQuestionText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.ink,
    flex: 1,
  },
  faqChevronWrap: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  faqChevronWrapRotated: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  faqAnswerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 22,
    color: colorTokens.body,
  },

  // ─── Disclaimer ───────────────────────────────────────────────────────
  disclaimerSection: {
    marginTop: 10,
  },
  disclaimerCard: {
    backgroundColor: colorTokens.warningSurface,
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.warningText,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.body,
  },
});
