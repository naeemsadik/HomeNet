import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Bookmark,
  Calculator,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
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
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

type MobileTab = "buy" | "rent" | "sold";

export function MobileHeroSearchCard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<MobileTab>("buy");
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const hasActiveFilters = activeFilterCount > 0;

  const purposeForTab = (tab: MobileTab): SearchPurpose => {
    switch (tab) {
      case "sold":
        return "sold";
      case "rent":
        return "rent";
      case "buy":
      default:
        return "sale";
    }
  };

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      includeSold: tab === "sold" ? prev.includeSold : false,
    }));
  };

  const handleSearch = () => {
    const target = activeTab === "sold" ? "/sold" : activeTab === "buy" ? "/buy" : "/rent";
    const params = new URLSearchParams(
      filtersToParams({
        ...filters,
        purpose: purposeForTab(activeTab),
        query: "",
        area: "",
      })
    );

    if (selectedArea) {
      if (selectedArea.city) params.set("city", selectedArea.city);
      params.set("location", selectedArea.name);
    }

    const qs = params.toString();
    router.push((qs ? `${target}?${qs}` : target) as never);
  };

  const primaryButtonLabel =
    activeTab === "sold"
      ? t("search.searchHomesSold")
      : activeTab === "rent"
      ? t("search.searchHomesForRent")
      : t("search.searchHomesForSale");

  const locationDisplayText = selectedArea
    ? selectedArea.city
      ? `${selectedArea.name}, ${selectedArea.city}`
      : selectedArea.name
    : null;

  return (
    <View style={styles.container}>
      {/* 1. Transaction Type Tabs */}
      <View style={styles.tabsContainer} accessibilityRole="tablist">
        {(["buy", "rent", "sold"] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const tabLabel =
            tab === "buy"
              ? t("search.tabs.buy")
              : tab === "rent"
              ? t("search.tabs.rent")
              : t("search.tabs.sold");

          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={tabLabel}
              onPress={() => handleTabChange(tab)}
              style={[
                styles.tabPill,
                isSelected && styles.tabPillActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isSelected && styles.tabPillTextActive,
                ]}
              >
                {tabLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Hero Search Card Box */}
      <View style={styles.card}>
        <View style={styles.searchBox}>
          {/* Tapping search box triggers location overlay / autocomplete modal */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              selectedArea
                ? t("hero.filterByAreaWithLocation", { location: selectedArea.name })
                : t("hero.filterByArea")
            }
            onPress={() => setAreaPickerOpen(true)}
            style={[styles.searchBoxInputTrigger, webPointer]}
          >
            <Search color={colorTokens.brandText} size={20} strokeWidth={2.2} />
            <Text
              numberOfLines={1}
              style={[
                styles.searchBoxText,
                !locationDisplayText && styles.searchBoxPlaceholder,
              ]}
            >
              {locationDisplayText || t("search.placeholder")}
            </Text>
          </Pressable>

          {/* Clear location button if selected */}
          {selectedArea ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("hero.clearLocation")}
              onPress={(e) => {
                e.stopPropagation?.();
                setSelectedArea(null);
              }}
              style={[styles.clearBtn, webPointer]}
            >
              <X color={colorTokens.subtle} size={16} />
            </Pressable>
          ) : null}

          {/* Filter button with active filter counter pill */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasActiveFilters
                ? t("hero.openFiltersWithCount", { count: activeFilterCount })
                : t("hero.openFilters")
            }
            onPress={() => setFilterModalOpen(true)}
            style={({ pressed }) => [
              styles.filterBtn,
              hasActiveFilters && styles.filterBtnActive,
              webPointer,
              pressed && { opacity: 0.8 },
            ]}
          >
            <SlidersHorizontal
              color={hasActiveFilters ? colorTokens.brandText : colorTokens.muted}
              size={18}
              strokeWidth={2}
            />
            {hasActiveFilters ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Primary Action Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={primaryButtonLabel}
          onPress={handleSearch}
          style={({ pressed }) => [
            styles.primaryButton,
            webPointer,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Search color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
        </Pressable>
      </View>

      {/* 3. Quick Navigation List (Clean Action Rows) */}
      <View style={styles.quickNavCard}>
        {/* Row 1: Request property valuation */}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("home.requestValuation")}
          onPress={() => router.push("/valuation" as never)}
          style={({ pressed }) => [
            styles.quickNavRow,
            webPointer,
            pressed && { backgroundColor: colorTokens.surfaceSunken },
          ]}
        >
          <View style={styles.quickNavRowLeft}>
            <View style={styles.quickNavIconWrap}>
              <Calculator color={colorTokens.brandText} size={18} strokeWidth={2} />
            </View>
            <Text style={styles.quickNavText}>{t("home.requestValuation")}</Text>
          </View>
          <ChevronRight color={colorTokens.subtle} size={18} />
        </Pressable>

        <View style={styles.quickNavDivider} />

        {/* Row 2: Saved searches & alerts */}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("home.savedSearches")}
          onPress={() => {
            if (!user) {
              useAuthModalStore.getState().open(() => router.push("/saved" as never));
            } else {
              router.push("/saved" as never);
            }
          }}
          style={({ pressed }) => [
            styles.quickNavRow,
            webPointer,
            pressed && { backgroundColor: colorTokens.surfaceSunken },
          ]}
        >
          <View style={styles.quickNavRowLeft}>
            <View style={styles.quickNavIconWrap}>
              <Bookmark color={colorTokens.brandText} size={18} strokeWidth={2} />
            </View>
            <Text style={styles.quickNavText}>{t("home.savedSearches")}</Text>
          </View>
          <ChevronRight color={colorTokens.subtle} size={18} />
        </Pressable>
      </View>

      {/* Location Picker Modal */}
      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedArea={selectedArea}
        onSelect={(area) => {
          setSelectedArea(area);
          setAreaPickerOpen(false);
        }}
      />

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        visible={filterModalOpen}
        filters={filters}
        onClose={() => setFilterModalOpen(false)}
        onApply={(updated) => setFilters(updated)}
        onReset={() => setFilters(defaultSearchFilters)}
        fixedLocation={selectedArea?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabPillActive: {
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  tabPillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colorTokens.muted,
  },
  tabPillTextActive: {
    fontFamily: fonts.bold,
    color: colorTokens.ink,
  },
  card: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 14,
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    height: 52,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchBoxInputTrigger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: "100%",
  },
  searchBoxText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    color: colorTokens.ink,
  },
  searchBoxPlaceholder: {
    fontFamily: fonts.regular,
    color: colorTokens.muted,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
    height: 36,
    gap: 6,
    borderLeftWidth: 1,
    borderLeftColor: colorTokens.divider,
  },
  filterBtnActive: {
    borderLeftColor: colorTokens.divider,
  },
  filterBadge: {
    backgroundColor: colorTokens.brand,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colorTokens.onBrand,
  },
  primaryButton: {
    backgroundColor: colorTokens.brand,
    borderRadius: radius.pill,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  primaryButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15.5,
    color: colorTokens.onBrand,
    letterSpacing: -0.2,
  },
  quickNavCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    marginTop: 14,
    overflow: "hidden",
  },
  quickNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  quickNavRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickNavIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
  },
  quickNavText: {
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    color: colorTokens.ink,
  },
  quickNavDivider: {
    height: 1,
    backgroundColor: colorTokens.divider,
    marginLeft: 60,
  },
});
