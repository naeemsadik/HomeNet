import { useState, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  Compass,
  FileCheck,
  LandPlot,
  ShieldCheck,
  Sparkles,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export type PropertyType = "apartment" | "land";
export type BuildingAge = "new" | "medium" | "old";
export type RoadWidth = "narrow" | "standard" | "wide";

export interface ValuationBenchmark {
  id: string;
  nameKey: TranslationKey;
  apartmentMarketRate: number; // BDT/sqft
  apartmentMouzaRate: number; // BDT/sqft
  landMarketRate: number; // BDT/katha
  landMouzaRate: number; // BDT/katha
}

export const VALUATION_BENCHMARKS: ValuationBenchmark[] = [
  {
    id: "gulshan",
    nameKey: "propertyValuationGuide.gulshanName",
    apartmentMarketRate: 21250,
    apartmentMouzaRate: 8500,
    landMarketRate: 32000000,
    landMouzaRate: 9500000,
  },
  {
    id: "banani",
    nameKey: "propertyValuationGuide.bananiName",
    apartmentMarketRate: 18750,
    apartmentMouzaRate: 7500,
    landMarketRate: 26000000,
    landMouzaRate: 8000000,
  },
  {
    id: "dhanmondi",
    nameKey: "propertyValuationGuide.dhanmondiName",
    apartmentMarketRate: 14250,
    apartmentMouzaRate: 6200,
    landMarketRate: 21000000,
    landMouzaRate: 6500000,
  },
  {
    id: "bashundhara",
    nameKey: "propertyValuationGuide.bashundharaName",
    apartmentMarketRate: 9750,
    apartmentMouzaRate: 4000,
    landMarketRate: 12000000,
    landMouzaRate: 3500000,
  },
  {
    id: "uttara",
    nameKey: "propertyValuationGuide.uttaraName",
    apartmentMarketRate: 9150,
    apartmentMouzaRate: 3800,
    landMarketRate: 11000000,
    landMouzaRate: 3200000,
  },
  {
    id: "mirpur",
    nameKey: "propertyValuationGuide.mirpurName",
    apartmentMarketRate: 7350,
    apartmentMouzaRate: 3200,
    landMarketRate: 7500000,
    landMouzaRate: 2200000,
  },
  {
    id: "mohammadpur",
    nameKey: "propertyValuationGuide.mohammadpurName",
    apartmentMarketRate: 7750,
    apartmentMouzaRate: 3400,
    landMarketRate: 8500000,
    landMouzaRate: 2500000,
  },
];

const APARTMENT_PRESET_SIZES = [1000, 1250, 1500, 2000] as const;
const LAND_PRESET_SIZES = [3, 4, 5, 10] as const;

function formatBDT(amount: number): string {
  return `৳ ${Math.round(amount).toLocaleString("en-IN")}`;
}

function formatCompactBDT(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `৳ ${cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `৳ ${lakh.toFixed(1)} L`;
  }
  return formatBDT(amount);
}

export function PropertyValuationGuideScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPhone, isTablet } = useResponsive();

  // Calculator State
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("dhanmondi");
  const [sizeInput, setSizeInput] = useState<string>("1500");
  const [buildingAge, setBuildingAge] = useState<BuildingAge>("new");
  const [roadWidth, setRoadWidth] = useState<RoadWidth>("standard");

  // FAQ Accordion State
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({ 0: true });

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const selectedBenchmark = useMemo(
    () =>
      VALUATION_BENCHMARKS.find((b) => b.id === selectedAreaId) ||
      VALUATION_BENCHMARKS[2],
    [selectedAreaId],
  );

  const parsedSize = useMemo(() => {
    const n = parseFloat(sizeInput.replace(/,/g, ""));
    if (isNaN(n) || n <= 0) {
      return propertyType === "apartment" ? 1500 : 3;
    }
    return n;
  }, [sizeInput, propertyType]);

  const valuationCalculations = useMemo(() => {
    // Age multiplier
    const ageMultiplier =
      propertyType === "apartment"
        ? buildingAge === "new"
          ? 1.0
          : buildingAge === "medium"
          ? 0.82
          : 0.68
        : 1.0;

    // Road width multiplier
    const roadMultiplier =
      roadWidth === "narrow" ? 0.9 : roadWidth === "standard" ? 1.0 : 1.15;

    const baseRate =
      propertyType === "apartment"
        ? selectedBenchmark.apartmentMarketRate
        : selectedBenchmark.landMarketRate;

    const mouzaRate =
      propertyType === "apartment"
        ? selectedBenchmark.apartmentMouzaRate
        : selectedBenchmark.landMouzaRate;

    const marketBase = parsedSize * baseRate * ageMultiplier * roadMultiplier;
    const marketMin = marketBase * 0.92;
    const marketMax = marketBase * 1.08;
    const mouzaTotal = parsedSize * mouzaRate;
    // Bank mortgage ceiling: Conservative forced sale (~75%) x 70% max LTV
    const bankLoanCeiling = marketBase * 0.75 * 0.7;

    return {
      baseRate,
      mouzaRate,
      ageMultiplier,
      roadMultiplier,
      marketBase,
      marketMin,
      marketMax,
      mouzaTotal,
      bankLoanCeiling,
    };
  }, [propertyType, selectedBenchmark, parsedSize, buildingAge, roadWidth]);

  const factors = [
    {
      title: t("propertyValuationGuide.factor1Title"),
      desc: t("propertyValuationGuide.factor1Desc"),
      icon: Compass,
    },
    {
      title: t("propertyValuationGuide.factor2Title"),
      desc: t("propertyValuationGuide.factor2Desc"),
      icon: FileCheck,
    },
    {
      title: t("propertyValuationGuide.factor3Title"),
      desc: t("propertyValuationGuide.factor3Desc"),
      icon: Building2,
    },
    {
      title: t("propertyValuationGuide.factor4Title"),
      desc: t("propertyValuationGuide.factor4Desc"),
      icon: Clock,
    },
    {
      title: t("propertyValuationGuide.factor5Title"),
      desc: t("propertyValuationGuide.factor5Desc"),
      icon: Sparkles,
    },
  ];

  const surveySteps = [
    {
      num: "01",
      title: t("propertyValuationGuide.step1Title"),
      desc: t("propertyValuationGuide.step1Desc"),
    },
    {
      num: "02",
      title: t("propertyValuationGuide.step2Title"),
      desc: t("propertyValuationGuide.step2Desc"),
    },
    {
      num: "03",
      title: t("propertyValuationGuide.step3Title"),
      desc: t("propertyValuationGuide.step3Desc"),
    },
    {
      num: "04",
      title: t("propertyValuationGuide.step4Title"),
      desc: t("propertyValuationGuide.step4Desc"),
    },
    {
      num: "05",
      title: t("propertyValuationGuide.step5Title"),
      desc: t("propertyValuationGuide.step5Desc"),
    },
  ];

  const faqs = [
    {
      q: t("propertyValuationGuide.faq1Q"),
      a: t("propertyValuationGuide.faq1A"),
    },
    {
      q: t("propertyValuationGuide.faq2Q"),
      a: t("propertyValuationGuide.faq2A"),
    },
    {
      q: t("propertyValuationGuide.faq3Q"),
      a: t("propertyValuationGuide.faq3A"),
    },
    {
      q: t("propertyValuationGuide.faq4Q"),
      a: t("propertyValuationGuide.faq4A"),
    },
  ];

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>
            {t("propertyValuationGuide.eyebrow")}
          </Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("propertyValuationGuide.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("propertyValuationGuide.subheading")}
          </Text>

          <View style={[styles.heroBadges, isPhone && styles.heroBadgesPhone]}>
            <View style={styles.badgeItem}>
              <ShieldCheck color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>Surveyor Enlisted Methodology</Text>
            </View>
            <View style={styles.badgeItem}>
              <Building2 color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("propertyValuationGuide.lastUpdated")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <LandPlot color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>RAJUK & Mouza Aligned</Text>
            </View>
          </View>
        </View>

        {/* Interactive Valuation Estimator */}
        <View style={styles.section}>
          <View
            style={[
              styles.calculatorCard,
              isPhone && styles.calculatorCardPhone,
            ]}
          >
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
                  {t("propertyValuationGuide.calculatorTitle")}
                </Text>
                <Text style={styles.calcSubtitle}>
                  {t("propertyValuationGuide.calculatorSubtitle")}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.calcGrid,
                (isPhone || isTablet) && styles.calcGridStack,
              ]}
            >
              {/* Controls Column */}
              <View style={styles.calcInputsColumn}>
                {/* Property Type Toggle */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("propertyValuationGuide.typeLabel")}
                  </Text>
                  <View style={styles.toggleRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setPropertyType("apartment");
                        setSizeInput("1500");
                      }}
                      style={[
                        styles.toggleTab,
                        webPointer,
                        propertyType === "apartment" && styles.toggleTabActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleTabText,
                          propertyType === "apartment" &&
                            styles.toggleTabTextActive,
                        ]}
                      >
                        {t("propertyValuationGuide.typeApartment")}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setPropertyType("land");
                        setSizeInput("3");
                      }}
                      style={[
                        styles.toggleTab,
                        webPointer,
                        propertyType === "land" && styles.toggleTabActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleTabText,
                          propertyType === "land" &&
                            styles.toggleTabTextActive,
                        ]}
                      >
                        {t("propertyValuationGuide.typeLand")}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Location Selection Chips */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("propertyValuationGuide.locationLabel")}
                  </Text>
                  <View style={styles.chipWrap}>
                    {VALUATION_BENCHMARKS.map((area) => {
                      const isSelected = selectedAreaId === area.id;
                      return (
                        <Pressable
                          key={area.id}
                          accessibilityRole="button"
                          onPress={() => setSelectedAreaId(area.id)}
                          style={[
                            styles.areaChip,
                            webPointer,
                            isSelected && styles.areaChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.areaChipText,
                              isSelected && styles.areaChipTextActive,
                            ]}
                          >
                            {t(area.nameKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Size Input with Presets */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {propertyType === "apartment"
                      ? t("propertyValuationGuide.sizeLabelApartment")
                      : t("propertyValuationGuide.sizeLabelLand")}
                  </Text>
                  <View style={styles.textInputWrap}>
                    <TextInput
                      accessibilityLabel={
                        propertyType === "apartment"
                          ? t("propertyValuationGuide.sizeLabelApartment")
                          : t("propertyValuationGuide.sizeLabelLand")
                      }
                      keyboardType="number-pad"
                      onChangeText={setSizeInput}
                      placeholder={
                        propertyType === "apartment"
                          ? t("propertyValuationGuide.sizePlaceholderApartment")
                          : t("propertyValuationGuide.sizePlaceholderLand")
                      }
                      placeholderTextColor={colorTokens.subtle}
                      style={styles.textInput}
                      value={sizeInput}
                    />
                    <Text style={styles.inputUnit}>
                      {propertyType === "apartment" ? "SQFT" : "Katha"}
                    </Text>
                  </View>

                  <View style={styles.presetWrap}>
                    {(propertyType === "apartment"
                      ? APARTMENT_PRESET_SIZES
                      : LAND_PRESET_SIZES
                    ).map((size) => (
                      <Pressable
                        key={size}
                        accessibilityRole="button"
                        onPress={() => setSizeInput(size.toString())}
                        style={[
                          styles.presetChip,
                          webPointer,
                          parsedSize === size && styles.presetChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            parsedSize === size && styles.presetChipTextActive,
                          ]}
                        >
                          {size}{" "}
                          {propertyType === "apartment" ? "sqft" : "katha"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Building Age (Apartment only) */}
                {propertyType === "apartment" ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {t("propertyValuationGuide.buildingAgeLabel")}
                    </Text>
                    <View style={styles.toggleRow}>
                      {(["new", "medium", "old"] as const).map((age) => (
                        <Pressable
                          key={age}
                          accessibilityRole="button"
                          onPress={() => setBuildingAge(age)}
                          style={[
                            styles.toggleTab,
                            webPointer,
                            buildingAge === age && styles.toggleTabActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.toggleTabText,
                              buildingAge === age &&
                                styles.toggleTabTextActive,
                            ]}
                          >
                            {age === "new"
                              ? t("propertyValuationGuide.ageNew")
                              : age === "medium"
                              ? t("propertyValuationGuide.ageMedium")
                              : t("propertyValuationGuide.ageOld")}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Road Width Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("propertyValuationGuide.roadWidthLabel")}
                  </Text>
                  <View style={styles.toggleRow}>
                    {(["narrow", "standard", "wide"] as const).map((width) => (
                      <Pressable
                        key={width}
                        accessibilityRole="button"
                        onPress={() => setRoadWidth(width)}
                        style={[
                          styles.toggleTab,
                          webPointer,
                          roadWidth === width && styles.toggleTabActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleTabText,
                            roadWidth === width &&
                              styles.toggleTabTextActive,
                          ]}
                        >
                          {width === "narrow"
                            ? t("propertyValuationGuide.roadNarrow")
                            : width === "standard"
                            ? t("propertyValuationGuide.roadStandard")
                            : t("propertyValuationGuide.roadWide")}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Estimation Results Column */}
              <View style={styles.calcResultsColumn}>
                <View style={styles.resultsCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultAreaTitle}>
                      {t(selectedBenchmark.nameKey)}
                    </Text>
                    <Text style={styles.resultAreaSubtitle}>
                      {propertyType === "apartment"
                        ? `${parsedSize.toLocaleString("en-IN")} SQFT Apartment`
                        : `${parsedSize} Katha Land`}
                    </Text>
                  </View>

                  {/* Primary Market Estimate */}
                  <View style={styles.highlightBlock}>
                    <Text style={styles.highlightCaption}>
                      {t("propertyValuationGuide.estimatedMarketRange")}
                    </Text>
                    <Text style={styles.highlightPrimaryValue}>
                      {formatBDT(valuationCalculations.marketBase)}
                    </Text>
                    <Text style={styles.highlightSubValue}>
                      {formatCompactBDT(valuationCalculations.marketBase)} (
                      {formatBDT(valuationCalculations.marketMin)} –{" "}
                      {formatBDT(valuationCalculations.marketMax)})
                    </Text>
                  </View>

                  {/* Breakdown Row Items */}
                  <View style={styles.breakdownList}>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>
                        {t("propertyValuationGuide.mouzaBenchmark")}
                      </Text>
                      <Text style={styles.breakdownValue}>
                        {formatBDT(valuationCalculations.mouzaTotal)} (
                        {formatCompactBDT(valuationCalculations.mouzaTotal)})
                      </Text>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>
                        {t("propertyValuationGuide.bankLoanCeiling")}
                      </Text>
                      <Text style={styles.breakdownValueHighlight}>
                        {formatBDT(valuationCalculations.bankLoanCeiling)} (
                        {formatCompactBDT(valuationCalculations.bankLoanCeiling)})
                      </Text>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>
                        {t("propertyValuationGuide.marketRateApplied")}
                      </Text>
                      <Text style={styles.breakdownValue}>
                        {propertyType === "apartment"
                          ? `৳ ${valuationCalculations.baseRate.toLocaleString("en-IN")} / sqft`
                          : `৳ ${formatCompactBDT(valuationCalculations.baseRate)} / katha`}
                      </Text>
                    </View>

                    {propertyType === "apartment" ? (
                      <View style={styles.breakdownItem}>
                        <Text style={styles.breakdownLabel}>
                          {t("propertyValuationGuide.ageAdjustment")}
                        </Text>
                        <Text style={styles.breakdownValue}>
                          {valuationCalculations.ageMultiplier === 1.0
                            ? "100% (No depreciation)"
                            : `${Math.round(valuationCalculations.ageMultiplier * 100)}% structural factor`}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>
                        {t("propertyValuationGuide.roadAdjustment")}
                      </Text>
                      <Text style={styles.breakdownValue}>
                        {valuationCalculations.roadMultiplier === 1.0
                          ? "Standard (1.0x)"
                          : `${valuationCalculations.roadMultiplier}x factor`}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.estimatorDisclaimer}>
                    {t("propertyValuationGuide.disclaimerEstimator")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 5 Core Factors Driving Value */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.factorsTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.factorsSubtitle")}
            </Text>
          </View>

          <View style={styles.factorsGrid}>
            {factors.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <View
                  key={idx}
                  style={[
                    styles.factorCard,
                    isPhone && styles.factorCardPhone,
                  ]}
                >
                  <View style={styles.factorIconWrap}>
                    <IconComp color={colorTokens.brandText} size={22} />
                  </View>
                  <View style={styles.factorTextWrap}>
                    <Text style={styles.factorTitle}>{item.title}</Text>
                    <Text style={styles.factorDesc}>{item.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mouza Rate vs Real Market Value Comparison */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.mouzaVsMarketTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.mouzaVsMarketSubtitle")}
            </Text>
          </View>

          <View
            style={[
              styles.comparisonGrid,
              isPhone && styles.comparisonGridPhone,
            ]}
          >
            {/* Mouza Rate Card */}
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonBadgeMuted}>
                <Text style={styles.comparisonBadgeTextMuted}>
                  Official Baseline
                </Text>
              </View>
              <Text style={styles.comparisonCardTitle}>
                {t("propertyValuationGuide.mouzaCardTitle")}
              </Text>
              <View style={styles.comparisonPointsList}>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.muted} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.mouzaCardPoint1")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.muted} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.mouzaCardPoint2")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.muted} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.mouzaCardPoint3")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fair Market Value Card */}
            <View
              style={[
                styles.comparisonCard,
                styles.comparisonCardFeatured,
              ]}
            >
              <View style={styles.comparisonBadgeBrand}>
                <Text style={styles.comparisonBadgeTextBrand}>
                  Commercial Standard
                </Text>
              </View>
              <Text style={styles.comparisonCardTitle}>
                {t("propertyValuationGuide.marketCardTitle")}
              </Text>
              <View style={styles.comparisonPointsList}>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.brandText} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.marketCardPoint1")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.brandText} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.marketCardPoint2")}
                  </Text>
                </View>
                <View style={styles.comparisonPoint}>
                  <Check color={colorTokens.brandText} size={18} />
                  <Text style={styles.comparisonPointText}>
                    {t("propertyValuationGuide.marketCardPoint3")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Step-by-Step Surveyor Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.checklistTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.checklistSubtitle")}
            </Text>
          </View>

          <View style={styles.workflowList}>
            {surveySteps.map((step, idx) => (
              <View
                key={idx}
                style={[styles.stepCard, isPhone && styles.stepCardPhone]}
              >
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>{step.num}</Text>
                </View>
                <View style={styles.stepContentWrap}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Accordion Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyValuationGuide.faqTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyValuationGuide.faqSubtitle")}
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

        {/* CTA Card to Instant Valuation */}
        <View style={styles.section}>
          <View style={[styles.ctaCard, isPhone && styles.ctaCardPhone]}>
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>
                {t("propertyValuationGuide.ctaTitle")}
              </Text>
              <Text style={styles.ctaDesc}>
                {t("propertyValuationGuide.ctaDesc")}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/instant-valuation")}
              style={[styles.ctaButton, webPointer]}
            >
              <Text style={styles.ctaButtonText}>
                {t("propertyValuationGuide.ctaButton")}
              </Text>
              <ArrowRight color={colorTokens.brandText} size={18} />
            </Pressable>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <AlertCircle color={colorTokens.warningText} size={22} />
              <Text style={styles.disclaimerTitle}>
                {t("propertyValuationGuide.disclaimerTitle")}
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              {t("propertyValuationGuide.disclaimerDesc")}
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
  // ─── Common Sections ───────────────────────────────────────────────────
  section: {
    marginBottom: 48,
  },
  sectionHeaderWrap: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  sectionTitlePhone: {
    fontSize: 20,
    lineHeight: 26,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.muted,
    maxWidth: 720,
  },
  // ─── Calculator Card ───────────────────────────────────────────────────
  calculatorCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 32,
    ...shadow,
  },
  calculatorCardPhone: {
    padding: 16,
  },
  calcHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  calcIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  calcHeaderTextWrap: {
    flex: 1,
  },
  calcTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colorTokens.ink,
    marginBottom: 4,
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
    gap: 32,
  },
  calcGridStack: {
    flexDirection: "column",
    gap: 24,
  },
  calcInputsColumn: {
    flex: 1.1,
  },
  calcResultsColumn: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 4,
    gap: 4,
  },
  toggleTab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm - 2,
    paddingHorizontal: 8,
  },
  toggleTabActive: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    ...shadow,
  },
  toggleTabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
    textAlign: "center",
  },
  toggleTabTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  areaChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  areaChipActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  areaChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  areaChipTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  textInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colorTokens.ink,
  },
  inputUnit: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
    marginLeft: 8,
  },
  presetWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.divider,
    borderWidth: 1,
    justifyContent: "center",
  },
  presetChipActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  presetChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.muted,
  },
  presetChipTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  // ─── Results Card ──────────────────────────────────────────────────────
  resultsCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 24,
  },
  resultHeader: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  resultAreaTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colorTokens.ink,
    marginBottom: 2,
  },
  resultAreaSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.muted,
  },
  highlightBlock: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 18,
  },
  highlightCaption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.brandText,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  highlightPrimaryValue: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    lineHeight: 32,
    color: colorTokens.brandText,
    marginBottom: 4,
  },
  highlightSubValue: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.brandText,
    opacity: 0.85,
  },
  breakdownList: {
    gap: 12,
    marginBottom: 18,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  breakdownLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.muted,
    flex: 1,
    paddingRight: 8,
  },
  breakdownValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.ink,
    textAlign: "right",
  },
  breakdownValueHighlight: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colorTokens.brandText,
    textAlign: "right",
  },
  estimatorDisclaimer: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colorTokens.subtle,
    fontStyle: "italic",
  },
  // ─── 5 Factors Grid ────────────────────────────────────────────────────
  factorsGrid: {
    gap: 16,
  },
  factorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
    ...shadow,
  },
  factorCardPhone: {
    flexDirection: "column",
    gap: 12,
    padding: 16,
  },
  factorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  factorTextWrap: {
    flex: 1,
  },
  factorTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  factorDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },
  // ─── Mouza vs Market Cards ─────────────────────────────────────────────
  comparisonGrid: {
    flexDirection: "row",
    gap: 20,
  },
  comparisonGridPhone: {
    flexDirection: "column",
    gap: 16,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 24,
    ...shadow,
  },
  comparisonCardFeatured: {
    borderColor: colorTokens.brandBorder,
    backgroundColor: colorTokens.surfaceSunken,
  },
  comparisonBadgeMuted: {
    alignSelf: "flex-start",
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  comparisonBadgeTextMuted: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonBadgeBrand: {
    alignSelf: "flex-start",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  comparisonBadgeTextBrand: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.brandText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonCardTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colorTokens.ink,
    marginBottom: 16,
  },
  comparisonPointsList: {
    gap: 12,
  },
  comparisonPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  comparisonPointText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.body,
    flex: 1,
  },
  // ─── Step-by-Step Surveyor Checklist ───────────────────────────────────
  workflowList: {
    gap: 14,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
    ...shadow,
  },
  stepCardPhone: {
    flexDirection: "column",
    gap: 10,
    padding: 16,
  },
  stepNumWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontFamily: fonts.headingBold,
    fontSize: 15,
    color: colorTokens.brandText,
  },
  stepContentWrap: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },
  // ─── FAQ Accordion ─────────────────────────────────────────────────────
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    overflow: "hidden",
    ...shadow,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 56,
  },
  faqQuestionTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
    gap: 12,
  },
  faqQuestionIcon: {
    flexShrink: 0,
  },
  faqQuestionText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.ink,
    flex: 1,
  },
  faqChevronWrap: {
    transform: [{ rotate: "0deg" }],
  },
  faqChevronWrapRotated: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  faqAnswerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 24,
    color: colorTokens.body,
  },
  // ─── CTA Card ──────────────────────────────────────────────────────────
  ctaCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    ...shadow,
  },
  ctaCardPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  ctaDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.muted,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: 22,
    minHeight: 48,
    gap: 8,
  },
  ctaButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.brandText,
  },
  // ─── Disclaimer ────────────────────────────────────────────────────────
  disclaimerSection: {
    marginTop: 8,
  },
  disclaimerCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.muted,
  },
});
