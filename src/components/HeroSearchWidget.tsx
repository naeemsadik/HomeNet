import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import {
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  X,
} from "@/components/icons";
import { colorTokens, colors, fonts, radius, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useAiFinderModalStore } from "@/stores/useAiFinderModalStore";
import { useInstantValuationStore } from "@/features/valuation/stores/useInstantValuationStore";
import type { ValuationPropertyType, ValuationPurpose } from "@/features/valuation/types/valuationTypes";
import { useTranslation } from "@/i18n";
import { SearchTabs, type SearchTabType } from "./SearchTabs";
import { AreaPicker } from "./AreaPicker";
import { AdvancedFiltersModal } from "./AdvancedFiltersModal";
import {
  countActiveFilters,
  defaultSearchFilters,
  filtersToParams,
  type SearchFilters,
  type SearchPurpose,
} from "@/features/property/utils/searchFilters";
import type { Area } from "@/types/api";

export type HeroSearchTab = SearchTabType;

interface HeroSearchWidgetProps {
  initialTab?: HeroSearchTab;
  onSearch?: (query: string, tab: HeroSearchTab, area?: Area | null) => void;
  /** Inside a shell that already owns the radius and shadow (the hero dock). */
  docked?: boolean;
}

export function HeroSearchWidget({
  initialTab = "buy",
  onSearch,
  docked = false,
}: HeroSearchWidgetProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const [activeTab, setActiveTab] = useState<HeroSearchTab>(initialTab);
  const [query, setQuery] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);

  // Instant Valuation Morph State
  const [valuationPurpose, setValuationPurpose] = useState<ValuationPurpose>("sale");
  const [valuationType, setValuationType] = useState<ValuationPropertyType>("apartment");

  const isValuationMode = activeTab === "instant-valuation";

  // The one shared count, so the badge can no longer claim four filters while
  // the search applies one.
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const hasActiveFilters = activeFilterCount > 0;

  /** The tab is the search's intent; the filters carry it into the URL. */
  const purposeForTab = (tab: HeroSearchTab): SearchPurpose =>
    tab === "sold"
      ? "sold"
      : tab === "short-let"
      ? "short-let"
      : tab === "rent"
      ? "rent"
      : "sale";

  // Switching tabs keeps the query, the area and every filter that still
  // applies. "Include sold" only means something while looking at Sold.
  const handleTabChange = (tab: HeroSearchTab) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      includeSold: tab === "sold" ? prev.includeSold : false,
    }));
  };

  const openAiModal = useAiFinderModalStore((state) => state.open);

  const locationParams = (params: URLSearchParams) => {
    if (!selectedArea) return;
    if (selectedArea.city) params.set("city", selectedArea.city);
    params.set("location", selectedArea.name);
  };

  const handleAiSearch = () => {
    if (!isPhone) {
      openAiModal(query.trim());
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set("prompt", query.trim());
    locationParams(params);
    const qs = params.toString();
    router.push((qs ? `/ai-finder?${qs}` : "/ai-finder") as never);
  };

  const handleValuationSubmit = () => {
    const areaName = selectedArea?.name || "Gulshan";
    const areaId = selectedArea?.id || "gulshan-2-dhaka";
    const road = query.trim();

    useInstantValuationStore.getState().setInitialFromHero({
      areaName,
      areaId,
      purpose: valuationPurpose,
      propertyType: valuationType,
    });

    if (road) {
      useInstantValuationStore.getState().setFormField("roadOrBlock", road);
    }

    const params = new URLSearchParams();
    params.set("area", areaName);
    params.set("areaId", areaId);
    params.set("purpose", valuationPurpose);
    params.set("type", valuationType);
    if (road) params.set("query", road);

    router.push(`/instant-valuation?${params.toString()}` as never);
  };

  const handleSearch = () => {
    if (isValuationMode) {
      handleValuationSubmit();
      return;
    }

    if (onSearch) {
      onSearch(query, activeTab, selectedArea);
      return;
    }
    const target =
      activeTab === "sold" ? "/sold" : activeTab === "buy" ? "/buy" : "/rent";
    // Bug 2: the hero used to write only price, beds, baths and verified, so
    // amenities and size were counted on the badge and then dropped. One
    // serializer now writes every filter Browse knows how to read.
    const params = new URLSearchParams(
      filtersToParams({
        ...filters,
        purpose: purposeForTab(activeTab),
        query: query.trim(),
        // The area goes in as city + location below, which is the pair Browse
        // has always read.
        area: "",
      })
    );
    locationParams(params);
    const qs = params.toString();
    router.push((qs ? `${target}?${qs}` : target) as never);
  };

  const placeholder = isValuationMode
    ? "Enter road, block, sector, or building name (e.g. Road 92)..."
    : activeTab === "short-let"
      ? t("hero.placeholders.shortLet")
      : activeTab === "sold"
        ? t("hero.placeholders.sold")
        : t("hero.placeholders.buyRent");

  return (
    <View style={[styles.card, isPhone && styles.cardPhone, docked && styles.cardDocked]}>
      <SearchTabs activeTab={activeTab} compact={isPhone} onChange={handleTabChange} />

      <View style={styles.rule} />

      {isValuationMode && (
        <View style={[styles.valuationBar, isPhone && styles.valuationBarPhone]}>
          {/* Quick Purpose Toggle */}
          <View style={styles.valuationToggle}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setValuationPurpose("sale")}
              style={[
                styles.valuationTab,
                valuationPurpose === "sale" && styles.valuationTabActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.valuationTabText,
                  valuationPurpose === "sale" && styles.valuationTabTextActive,
                ]}
              >
                Sale Valuation
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setValuationPurpose("rent")}
              style={[
                styles.valuationTab,
                valuationPurpose === "rent" && styles.valuationTabActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.valuationTabText,
                  valuationPurpose === "rent" && styles.valuationTabTextActive,
                ]}
              >
                Rental Valuation
              </Text>
            </Pressable>
          </View>

          {/* Quick Property Type Chips */}
          <View style={styles.valuationTypeGroup}>
            {[
              { key: "apartment" as const, label: "Apartment" },
              { key: "house" as const, label: "Duplex / House" },
              { key: "commercial" as const, label: "Commercial" },
              { key: "land" as const, label: "Plot / Land" },
            ].map((pt) => {
              const isSelected = valuationType === pt.key;
              return (
                <Pressable
                  key={pt.key}
                  accessibilityRole="button"
                  onPress={() => setValuationType(pt.key)}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipSelected,
                    webPointer,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextSelected,
                    ]}
                  >
                    {pt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={[styles.inputRow, isPhone && styles.inputRowPhone]}>
        {/* The query and the area are one control group: one fill, one height,
            a divider between them on desktop and stacked on a phone. */}
        <View style={[styles.group, isPhone && styles.groupPhone]}>
          <View style={[styles.field, isPhone && styles.fieldPhone]}>
            {isValuationMode ? (
              <MapPin color={colors.greenOnLight} size={19} strokeWidth={2.2} />
            ) : (
              <Search color={colors.muted} size={19} strokeWidth={2} />
            )}
            <TextInput
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              returnKeyType={isValuationMode ? "go" : "search"}
              style={[styles.input, isPhone && styles.inputPhone]}
              value={query}
            />
            {query ? (
              <Pressable
                accessibilityLabel={t("hero.clearSearch")}
                onPress={() => setQuery("")}
                style={[styles.clear, webPointer]}
              >
                <X color={colors.muted} size={16} />
              </Pressable>
            ) : null}
            {!isValuationMode && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  hasActiveFilters
                    ? t("hero.openFiltersWithCount", { count: activeFilterCount })
                    : t("hero.openFilters")
                }
                onPress={() => setFilterModalOpen(true)}
                style={({ hovered }: any) => [
                  styles.filterButton,
                  hasActiveFilters && styles.filterButtonActive,
                  hovered && styles.filterButtonHovered,
                  webPointer,
                ]}
              >
                <SlidersHorizontal
                  color={hasActiveFilters ? colorTokens.brandText : colors.muted}
                  size={18}
                  strokeWidth={2}
                />
                {hasActiveFilters ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            )}
          </View>

          {!isPhone ? <View style={styles.groupDivider} /> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              selectedArea
                ? t("hero.filterByAreaWithLocation", { location: selectedArea.name })
                : t("hero.filterByArea")
            }
            onPress={() => setAreaPickerOpen(true)}
            style={({ hovered }: any) => [
              styles.areaButton,
              isPhone && styles.areaButtonPhone,
              selectedArea && styles.areaButtonActive,
              hovered && styles.areaButtonHovered,
              webPointer,
            ]}
          >
            <MapPin
              color={selectedArea ? colors.greenOnLight : colors.muted}
              size={16}
              strokeWidth={2}
            />
            <Text
              numberOfLines={1}
              style={[styles.areaLabel, selectedArea && styles.areaLabelActive]}
            >
              {selectedArea ? selectedArea.name : isValuationMode ? "Dhaka (Select Area)" : t("hero.allLocations")}
            </Text>
            {selectedArea ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("hero.clearLocation")}
                // The glyph is 14px; the target has to be a thumb's width.
                hitSlop={10}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedArea(null);
                }}
                style={[styles.areaClear, webPointer]}
              >
                <X color={colors.greenOnLight} size={14} />
              </Pressable>
            ) : (
              <ChevronDown color={colors.muted} size={15} strokeWidth={2} />
            )}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isValuationMode ? "Get instant valuation" : t("hero.searchProperties")}
          onPress={handleSearch}
          style={({ hovered, pressed }: any) => [
            styles.searchButton,
            isValuationMode && styles.valuationButton,
            isPhone && styles.searchButtonPhone,
            hovered && styles.searchButtonHovered,
            pressed && styles.searchButtonPressed,
            webPointer,
          ]}
        >
          {isValuationMode ? (
            <TrendingUp color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
          ) : (
            <Search color={colorTokens.onBrand} size={17} strokeWidth={2.4} />
          )}
          <Text style={styles.searchLabel}>
            {isValuationMode ? "Get instant valuation" : t("hero.search")}
          </Text>
        </Pressable>
      </View>

      {isValuationMode ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Learn about instant valuation"
          onPress={handleValuationSubmit}
          style={({ hovered }: any) => [styles.aiLink, hovered && styles.aiLinkHovered, webPointer]}
        >
          <Sparkles color={colors.greenOnLight} size={15} strokeWidth={2.2} />
          <Text style={styles.aiText}>
            Data-backed Dhaka property valuation · 100% Free · No broker commissions
          </Text>
        </Pressable>
      ) : (
        <View style={styles.linkRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search with AI"
            onPress={handleAiSearch}
            style={({ hovered }: any) => [styles.aiLink, hovered && styles.aiLinkHovered, webPointer]}
          >
            <Sparkles color={colors.greenOnLight} size={15} strokeWidth={2.2} />
            <Text style={styles.aiText}>
              {t("hero.aiPrompt")}
            </Text>
          </Pressable>

          {hasActiveFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("hero.clearFilters")}
              onPress={() => setFilters(defaultSearchFilters)}
              style={({ hovered }: any) => [
                styles.clearFiltersLink,
                hovered && styles.aiLinkHovered,
                webPointer,
              ]}
            >
              <Text style={styles.clearFiltersText}>{t("hero.clearFilters")}</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedArea={selectedArea}
        onSelect={(area) => {
          setSelectedArea(area);
          setAreaPickerOpen(false);
        }}
      />

      <AdvancedFiltersModal
        filters={filters}
        onApply={(updated) => setFilters(updated)}
        onClose={() => setFilterModalOpen(false)}
        visible={filterModalOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Elevation is declared once — shadow, no border.
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 24,
    ...(Platform.select({
      web: { boxShadow: "0 24px 60px -20px rgba(11, 26, 23, 0.28)" },
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.22,
        shadowRadius: 44,
        elevation: 14,
      },
    }) as any),
  },
  cardPhone: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderRadius: radius.sm,
  },
  cardDocked: {
    borderRadius: 0,
    ...(Platform.select({
      web: { boxShadow: "none" },
      default: { shadowOpacity: 0, elevation: 0 },
    }) as any),
  },

  rule: {
    height: 1,
    marginTop: -1,
    marginBottom: 20,
    backgroundColor: colors.line,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputRowPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
  },

  // One fill behind the query and the area, so they read as a single control.
  group: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
    overflow: "hidden",
  },
  groupPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    height: "auto",
    gap: 8,
    backgroundColor: "transparent",
    overflow: "visible",
  },
  groupDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.line,
  },

  field: {
    flex: 1,
    minWidth: 0,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
  },
  fieldPhone: { height: 50, paddingHorizontal: 14 },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  } as any,
  inputPhone: { fontSize: 15 },
  clear: { padding: 4 },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
  },
  filterButtonActive: {
    backgroundColor: colorTokens.brandSurface,
  },
  filterButtonHovered: {
    backgroundColor: "rgba(11, 26, 23, 0.05)",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 12,
  },

  areaButton: {
    height: 56,
    maxWidth: 210,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
  },
  areaButtonPhone: { height: 48, maxWidth: "100%", justifyContent: "center" },
  areaButtonActive: { backgroundColor: colors.greenLight },
  areaButtonHovered: { opacity: 0.85 },
  areaLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 15,
    flexShrink: 1,
  },
  areaLabelActive: { color: colors.greenOnLight, fontFamily: fonts.semiBold },
  areaClear: { padding: 2 },

  searchButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.green,
  },
  searchButtonPhone: { height: 50, paddingHorizontal: 20 },
  searchButtonHovered: { backgroundColor: colors.greenOnLight },
  searchButtonPressed: { opacity: 0.9 },
  searchLabel: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  aiLink: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 2,
  },
  clearFiltersLink: {
    alignSelf: "flex-start",
    marginTop: 16,
    paddingVertical: 2,
  },
  clearFiltersText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  aiLinkHovered: { opacity: 0.75 },
  aiText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textDecorationLine: "underline",
    ...(Platform.OS === "web" ? { textUnderlineOffset: 3 } : {}),
  } as any,

  // ─── Instant Valuation Morph Bar Styles ─────────────────────────────
  valuationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  valuationBarPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  valuationToggle: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  valuationTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  valuationTabActive: {
    backgroundColor: colorTokens.brand,
    ...shadow,
  },
  valuationTabText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  valuationTabTextActive: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
  },
  valuationTypeGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  typeChipSelected: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brand,
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  typeChipTextSelected: {
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
  },
  valuationButton: {
    backgroundColor: colorTokens.brand,
    paddingHorizontal: 24,
  },
});
