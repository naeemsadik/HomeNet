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
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  Calculator,
  Layers,
  Search,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export type ZoneFilter = "all" | "prime" | "high_demand" | "emerging";

export interface AreaBenchmark {
  id: string;
  nameKey: TranslationKey;
  zoneKey: TranslationKey;
  category: "prime" | "high_demand" | "emerging";
  minRate: number;
  maxRate: number;
  avgRate: number;
  yoyTrend: string;
  typical3BedMin: number;
  typical3BedMax: number;
}

export const DHAKA_BENCHMARKS: AreaBenchmark[] = [
  {
    id: "gulshan",
    nameKey: "propertyPriceIndex.gulshanName",
    zoneKey: "propertyPriceIndex.gulshanZone",
    category: "prime",
    minRate: 16500,
    maxRate: 26000,
    avgRate: 21250,
    yoyTrend: "+8.4%",
    typical3BedMin: 24750000,
    typical3BedMax: 39000000,
  },
  {
    id: "banani",
    nameKey: "propertyPriceIndex.bananiName",
    zoneKey: "propertyPriceIndex.bananiZone",
    category: "prime",
    minRate: 15000,
    maxRate: 22500,
    avgRate: 18750,
    yoyTrend: "+7.2%",
    typical3BedMin: 22500000,
    typical3BedMax: 33750000,
  },
  {
    id: "baridhara",
    nameKey: "propertyPriceIndex.baridharaName",
    zoneKey: "propertyPriceIndex.baridharaZone",
    category: "prime",
    minRate: 18000,
    maxRate: 30000,
    avgRate: 24000,
    yoyTrend: "+9.1%",
    typical3BedMin: 27000000,
    typical3BedMax: 45000000,
  },
  {
    id: "dhanmondi",
    nameKey: "propertyPriceIndex.dhanmondiName",
    zoneKey: "propertyPriceIndex.dhanmondiZone",
    category: "prime",
    minRate: 11000,
    maxRate: 17500,
    avgRate: 14250,
    yoyTrend: "+6.5%",
    typical3BedMin: 16500000,
    typical3BedMax: 26250000,
  },
  {
    id: "bashundhara",
    nameKey: "propertyPriceIndex.bashundharaName",
    zoneKey: "propertyPriceIndex.bashundharaZone",
    category: "high_demand",
    minRate: 7500,
    maxRate: 12000,
    avgRate: 9750,
    yoyTrend: "+11.2%",
    typical3BedMin: 11250000,
    typical3BedMax: 18000000,
  },
  {
    id: "uttara",
    nameKey: "propertyPriceIndex.uttaraName",
    zoneKey: "propertyPriceIndex.uttaraZone",
    category: "high_demand",
    minRate: 6800,
    maxRate: 11500,
    avgRate: 9150,
    yoyTrend: "+10.5%",
    typical3BedMin: 10200000,
    typical3BedMax: 17250000,
  },
  {
    id: "mirpur",
    nameKey: "propertyPriceIndex.mirpurName",
    zoneKey: "propertyPriceIndex.mirpurZone",
    category: "high_demand",
    minRate: 5500,
    maxRate: 9200,
    avgRate: 7350,
    yoyTrend: "+8.8%",
    typical3BedMin: 8250000,
    typical3BedMax: 13800000,
  },
  {
    id: "mohammadpur",
    nameKey: "propertyPriceIndex.mohammadpurName",
    zoneKey: "propertyPriceIndex.mohammadpurZone",
    category: "high_demand",
    minRate: 6000,
    maxRate: 9500,
    avgRate: 7750,
    yoyTrend: "+5.4%",
    typical3BedMin: 9000000,
    typical3BedMax: 14250000,
  },
  {
    id: "aftabnagar",
    nameKey: "propertyPriceIndex.aftabnagarName",
    zoneKey: "propertyPriceIndex.aftabnagarZone",
    category: "emerging",
    minRate: 5200,
    maxRate: 8000,
    avgRate: 6600,
    yoyTrend: "+12.0%",
    typical3BedMin: 7800000,
    typical3BedMax: 12000000,
  },
  {
    id: "purbachal",
    nameKey: "propertyPriceIndex.purbachalName",
    zoneKey: "propertyPriceIndex.purbachalZone",
    category: "emerging",
    minRate: 4500,
    maxRate: 7200,
    avgRate: 5850,
    yoyTrend: "+14.6%",
    typical3BedMin: 6750000,
    typical3BedMax: 10800000,
  },
];

const PRESET_SIZES = [1000, 1250, 1500, 2000] as const;
const PRESET_SIZE_KEYS: Record<(typeof PRESET_SIZES)[number], TranslationKey> = {
  1000: "propertyPriceIndex.preset1000",
  1250: "propertyPriceIndex.preset1250",
  1500: "propertyPriceIndex.preset1500",
  2000: "propertyPriceIndex.preset2000",
};

function formatBDT(amount: number): string {
  return `৳ ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function PropertyPriceIndexScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();

  const [activeZone, setActiveZone] = useState<ZoneFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("dhanmondi");
  const [flatSizeInput, setFlatSizeInput] = useState<string>("1500");

  const filteredBenchmarks = useMemo(() => {
    return DHAKA_BENCHMARKS.filter((item) => {
      const matchesZone = activeZone === "all" || item.category === activeZone;
      const localizedName = t(item.nameKey).toLowerCase();
      const rawId = item.id.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || localizedName.includes(query) || rawId.includes(query);
      return matchesZone && matchesSearch;
    });
  }, [activeZone, searchQuery, t]);

  const selectedBenchmark = useMemo(() => {
    return DHAKA_BENCHMARKS.find((b) => b.id === selectedAreaId) ?? DHAKA_BENCHMARKS[0];
  }, [selectedAreaId]);

  const flatSize = useMemo(() => {
    const cleaned = flatSizeInput.replace(/[^0-9]/g, "");
    const parsed = parseInt(cleaned, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [flatSizeInput]);

  const estimatedValue = useMemo(() => {
    if (!selectedBenchmark || flatSize <= 0) return { avg: 0, min: 0, max: 0 };
    return {
      avg: flatSize * selectedBenchmark.avgRate,
      min: flatSize * selectedBenchmark.minRate,
      max: flatSize * selectedBenchmark.maxRate,
    };
  }, [selectedBenchmark, flatSize]);

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("propertyPriceIndex.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("propertyPriceIndex.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("propertyPriceIndex.subheading")}
          </Text>

          <View style={[styles.heroBadges, isPhone && styles.heroBadgesPhone]}>
            <View style={styles.badgeItem}>
              <Calendar color={colorTokens.brandText} size={16} />
              <Text style={styles.badgeText}>{t("propertyPriceIndex.lastUpdated")}</Text>
            </View>
            <View style={styles.badgeItem}>
              <ShieldCheck color={colorTokens.brandText} size={16} />
              <Text style={styles.badgeText}>Verified Transaction Data</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Area Price Explorer */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyPriceIndex.explorerTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyPriceIndex.explorerSubtitle")}
            </Text>
          </View>

          {/* Controls: Zone Filters & Search */}
          <View style={[styles.filterBar, (isPhone || isTablet) && styles.filterBarStack]}>
            <View style={styles.zoneTabsWrap}>
              {(
                [
                  { id: "all", key: "filterAll" },
                  { id: "prime", key: "filterPrime" },
                  { id: "high_demand", key: "filterHighDemand" },
                  { id: "emerging", key: "filterEmerging" },
                ] as const
              ).map((tab) => {
                const isSelected = activeZone === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="button"
                    onPress={() => setActiveZone(tab.id)}
                    style={[
                      styles.zoneTab,
                      webPointer,
                      isSelected && styles.zoneTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.zoneTabText,
                        isSelected && styles.zoneTabTextActive,
                      ]}
                    >
                      {t(`propertyPriceIndex.${tab.key}` as TranslationKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.searchBox, isPhone && styles.searchBoxPhone]}>
              <Search color={colorTokens.muted} size={16} />
              <TextInput
                accessibilityLabel={t("propertyPriceIndex.searchPlaceholder")}
                onChangeText={setSearchQuery}
                placeholder={t("propertyPriceIndex.searchPlaceholder")}
                placeholderTextColor={colorTokens.subtle}
                style={styles.searchInput}
                value={searchQuery}
              />
            </View>
          </View>

          {/* Benchmark Grid */}
          <View style={[styles.benchmarkGrid, isPhone && styles.benchmarkGridPhone]}>
            {filteredBenchmarks.map((item) => {
              const isSelected = selectedAreaId === item.id;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.benchmarkCard,
                    isPhone && styles.benchmarkCardPhone,
                    isSelected && styles.benchmarkCardSelected,
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardAreaWrap}>
                      <Text style={styles.areaName}>{t(item.nameKey)}</Text>
                      <Text style={styles.zoneTag}>{t(item.zoneKey)}</Text>
                    </View>
                    <View style={styles.trendBadge}>
                      <TrendingUp color={colorTokens.brandText} size={14} />
                      <Text style={styles.trendBadgeText}>{item.yoyTrend}</Text>
                    </View>
                  </View>

                  <View style={styles.cardRateRow}>
                    <View>
                      <Text style={styles.statLabel}>{t("propertyPriceIndex.colAvgRate")}</Text>
                      <Text style={styles.statValueAvg}>
                        {formatBDT(item.avgRate)} <Text style={styles.statUnit}>/ sqft</Text>
                      </Text>
                    </View>
                    <View style={styles.statAlignRight}>
                      <Text style={styles.statLabel}>{t("propertyPriceIndex.colRange")}</Text>
                      <Text style={styles.statValueRange}>
                        {formatBDT(item.minRate)} – {formatBDT(item.maxRate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooterRow}>
                    <View>
                      <Text style={styles.statLabel}>{t("propertyPriceIndex.colTypical3Bed")}</Text>
                      <Text style={styles.typicalBedValue}>
                        {formatPrice(item.typical3BedMin, "BDT")} – {formatPrice(item.typical3BedMax, "BDT")}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setSelectedAreaId(item.id)}
                      style={[styles.selectCalcButton, webPointer]}
                    >
                      <Text style={styles.selectCalcButtonText}>Estimate</Text>
                      <ArrowUpRight color={colorTokens.brandText} size={14} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 2: Interactive Size & Cost Estimator */}
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
                  {t("propertyPriceIndex.calculatorTitle")}
                </Text>
                <Text style={styles.calcSubtitle}>
                  {t("propertyPriceIndex.calculatorSubtitle")}
                </Text>
              </View>
            </View>

            <View style={[styles.calcGrid, (isPhone || isTablet) && styles.calcGridStack]}>
              {/* Controls Column */}
              <View style={styles.calcInputsColumn}>
                {/* Area Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t("propertyPriceIndex.selectAreaLabel")}</Text>
                  <View style={styles.areaChipsWrap}>
                    {DHAKA_BENCHMARKS.map((benchmark) => {
                      const isSelected = selectedAreaId === benchmark.id;
                      return (
                        <Pressable
                          key={benchmark.id}
                          accessibilityRole="button"
                          onPress={() => setSelectedAreaId(benchmark.id)}
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
                            {t(benchmark.nameKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Size Input & Presets */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t("propertyPriceIndex.flatSizeLabel")}</Text>
                  <View style={styles.textInputWrap}>
                    <TextInput
                      accessibilityLabel={t("propertyPriceIndex.flatSizeLabel")}
                      keyboardType="number-pad"
                      onChangeText={setFlatSizeInput}
                      placeholder={t("propertyPriceIndex.flatSizePlaceholder")}
                      placeholderTextColor={colorTokens.subtle}
                      style={styles.textInput}
                      value={flatSizeInput}
                    />
                    <Text style={styles.inputUnit}>SQFT</Text>
                  </View>

                  <View style={styles.presetWrap}>
                    {PRESET_SIZES.map((size) => {
                      const isSelected = flatSize === size;
                      return (
                        <Pressable
                          key={size}
                          accessibilityRole="button"
                          onPress={() => setFlatSizeInput(size.toString())}
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
                            {t(PRESET_SIZE_KEYS[size])}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Estimation Results Column */}
              <View style={styles.calcResultsColumn}>
                <View style={styles.resultsCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultAreaTitle}>{t(selectedBenchmark.nameKey)}</Text>
                    <Text style={styles.resultAreaSubtitle}>
                      {t("propertyPriceIndex.avgRateAt")}: {formatBDT(selectedBenchmark.avgRate)}/sqft
                    </Text>
                  </View>

                  <View style={styles.resultHighlightBlock}>
                    <Text style={styles.resultHighlightLabel}>
                      {t("propertyPriceIndex.estimatedValue")} ({flatSize} sqft)
                    </Text>
                    <Text style={styles.resultHighlightValue}>
                      {formatBDT(estimatedValue.avg)}
                    </Text>
                    <Text style={styles.resultHighlightCompact}>
                      {formatPrice(estimatedValue.avg, "BDT")}
                    </Text>
                  </View>

                  <View style={styles.resultRangeRow}>
                    <Text style={styles.resultRangeLabel}>
                      {t("propertyPriceIndex.estimatedRange")}
                    </Text>
                    <Text style={styles.resultRangeValue}>
                      {formatPrice(estimatedValue.min, "BDT")} – {formatPrice(estimatedValue.max, "BDT")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Key Market Drivers */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("propertyPriceIndex.driversTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("propertyPriceIndex.driversSubtitle")}
            </Text>
          </View>

          <View style={[styles.driversGrid, isPhone && styles.driversGridPhone]}>
            <View style={[styles.driverCard, isPhone && styles.driverCardPhone]}>
              <View style={styles.driverIconWrap}>
                <Zap color={colorTokens.brandText} size={22} />
              </View>
              <Text style={styles.driverTitle}>{t("propertyPriceIndex.driver1Title")}</Text>
              <Text style={styles.driverDesc}>{t("propertyPriceIndex.driver1Desc")}</Text>
            </View>

            <View style={[styles.driverCard, isPhone && styles.driverCardPhone]}>
              <View style={styles.driverIconWrap}>
                <Building2 color={colorTokens.brandText} size={22} />
              </View>
              <Text style={styles.driverTitle}>{t("propertyPriceIndex.driver2Title")}</Text>
              <Text style={styles.driverDesc}>{t("propertyPriceIndex.driver2Desc")}</Text>
            </View>

            <View style={[styles.driverCard, isPhone && styles.driverCardPhone]}>
              <View style={styles.driverIconWrap}>
                <Layers color={colorTokens.brandText} size={22} />
              </View>
              <Text style={styles.driverTitle}>{t("propertyPriceIndex.driver3Title")}</Text>
              <Text style={styles.driverDesc}>{t("propertyPriceIndex.driver3Desc")}</Text>
            </View>
          </View>
        </View>

        {/* Section 4: Methodology & PropTech Standard */}
        <View style={styles.methodologySection}>
          <View style={styles.methodologyCard}>
            <View style={styles.methodologyHeader}>
              <BarChart3 color={colorTokens.brandText} size={20} />
              <Text style={styles.methodologyTitle}>
                {t("propertyPriceIndex.methodologyTitle")}
              </Text>
            </View>
            <Text style={styles.methodologyText}>
              {t("propertyPriceIndex.methodologyDesc")}
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

  // ─── Explorer Controls ────────────────────────────────────────────────
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  filterBarStack: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
  },
  zoneTabsWrap: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: colorTokens.border,
    flexWrap: "wrap",
    gap: 4,
  },
  zoneTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.xs,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  zoneTabActive: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    ...shadow,
  },
  zoneTabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
  },
  zoneTabTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    minHeight: 44,
    minWidth: 260,
    gap: 8,
  },
  searchBoxPhone: {
    minWidth: "100%",
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colorTokens.ink,
    minHeight: 44,
  },

  // ─── Benchmark Grid ───────────────────────────────────────────────────
  benchmarkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  benchmarkGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  benchmarkCard: {
    width: "48.8%",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    padding: 18,
    ...shadow,
  },
  benchmarkCardPhone: {
    width: "100%",
    padding: 16,
  },
  benchmarkCardSelected: {
    borderColor: colorTokens.brandText,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardAreaWrap: {
    flex: 1,
  },
  areaName: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colorTokens.ink,
  },
  zoneTag: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  trendBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colorTokens.brandText,
  },
  cardRateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colorTokens.divider,
    marginBottom: 12,
  },
  statAlignRight: {
    alignItems: "flex-end",
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
    marginBottom: 3,
  },
  statValueAvg: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colorTokens.brandText,
  },
  statUnit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
  },
  statValueRange: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typicalBedValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colorTokens.ink,
  },
  selectCalcButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colorTokens.brandSurface,
    borderRadius: radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
  },
  selectCalcButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colorTokens.brandText,
  },

  // ─── Calculator Card ──────────────────────────────────────────────────
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
  areaChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  areaChip: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
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
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colorTokens.ink,
    minHeight: 44,
  },
  inputUnit: {
    fontFamily: fonts.bold,
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
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
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

  // ─── Calculator Results ───────────────────────────────────────────────
  resultsCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    padding: 20,
  },
  resultHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
    paddingBottom: 12,
    marginBottom: 16,
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
  resultHighlightBlock: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
    padding: 16,
    marginBottom: 14,
  },
  resultHighlightLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  resultHighlightValue: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    lineHeight: 30,
    color: colorTokens.brandText,
    marginBottom: 2,
  },
  resultHighlightCompact: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colorTokens.muted,
  },
  resultRangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  resultRangeLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.muted,
  },
  resultRangeValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.ink,
  },

  // ─── Drivers Section ──────────────────────────────────────────────────
  driversGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  driversGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  driverCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    padding: 20,
    ...shadow,
  },
  driverCardPhone: {
    minWidth: "100%",
    padding: 16,
  },
  driverIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  driverTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  driverDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.muted,
  },

  // ─── Methodology Section ──────────────────────────────────────────────
  methodologySection: {
    marginTop: 10,
  },
  methodologyCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  methodologyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  methodologyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.ink,
  },
  methodologyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.body,
  },
});
