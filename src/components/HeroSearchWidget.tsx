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
import {
  AdvancedFiltersModal,
  defaultFilterState,
  type FilterState,
} from "./AdvancedFiltersModal";
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
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  // Instant Valuation Morph State
  const [valuationPurpose, setValuationPurpose] = useState<ValuationPurpose>("sale");
  const [valuationType, setValuationType] = useState<ValuationPropertyType>("apartment");

  const isValuationMode = activeTab === "instant-valuation";

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms !== null) count++;
    if (filters.bathrooms !== null) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);
  const hasActiveFilters = activeFilterCount > 0;

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
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (activeTab === "short-let") params.set("subtype", "short-let");
    locationParams(params);
    if (filters.minPrice) params.set("min_price", filters.minPrice);
    if (filters.maxPrice) params.set("max_price", filters.maxPrice);
    if (filters.bedrooms !== null) params.set("bedrooms", String(filters.bedrooms));
    if (filters.bathrooms !== null) params.set("bathrooms", String(filters.bathrooms));
    if (filters.verifiedOnly) params.set("is_verified", "true");
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
      <SearchTabs activeTab={activeTab} compact={isPhone} onChange={setActiveTab} />

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
              accessibilityLabel={t("hero.clearLocation")}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedArea(null);
              }}
              style={styles.areaClear}
            >
              <X color={colors.greenOnLight} size={14} />
            </Pressable>
          ) : (
            <ChevronDown color={colors.muted} size={15} strokeWidth={2} />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isValuationMode ? "Get instant valuation" : "Search properties"}
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
        onReset={() => setFilters(defaultFilterState)}
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

  aiLink: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 2,
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
