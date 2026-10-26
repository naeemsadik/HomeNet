import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Bookmark,
  Calculator,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
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

  const openAiFinder = () => {
    const params = new URLSearchParams();
    if (selectedArea) {
      if (selectedArea.city) params.set("city", selectedArea.city);
      params.set("location", selectedArea.name);
    }
    const qs = params.toString();
    router.push((qs ? `/ai-finder?${qs}` : "/ai-finder") as never);
  };

  const searchLabel =
    activeTab === "sold"
      ? t("search.mobileHero.labelSold")
      : activeTab === "rent"
      ? t("search.mobileHero.labelRent")
      : t("search.mobileHero.labelBuy");

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* 1. Transaction type: underlined tabs */}
        <View style={styles.tabsRow} accessibilityRole="tablist">
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
                style={[styles.tab, webPointer]}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{tabLabel}</Text>
                {isSelected ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panelBody}>
          {/* 2. Classic search, or the guided AI finder */}
          <View style={styles.modeToggle}>
            <View
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              style={[styles.modeOption, styles.modeOptionActive]}
            >
              <Search color={colorTokens.surface} size={16} strokeWidth={2.4} />
              <Text style={[styles.modeText, styles.modeTextActive]}>{t("search.mobileHero.classic")}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("search.mobileHero.aiSearch")}
              onPress={openAiFinder}
              style={[styles.modeOption, webPointer]}
            >
              <Sparkles color={colorTokens.ink} size={16} strokeWidth={2.2} />
              <Text style={styles.modeText}>{t("search.mobileHero.aiSearch")}</Text>
            </Pressable>
          </View>

          <Text style={styles.panelLabel}>{searchLabel}</Text>

          {/* 3. Where: opens the area picker; filters sit beside it */}
          <View style={styles.searchBox}>
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
              <Search color={colorTokens.ink} size={20} strokeWidth={2.2} />
              <Text
                numberOfLines={1}
                style={[styles.searchBoxText, !locationDisplayText && styles.searchBoxPlaceholder]}
              >
                {locationDisplayText || t("search.placeholder")}
              </Text>
            </Pressable>

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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryButtonLabel}
            onPress={handleSearch}
            style={({ pressed }) => [styles.primaryButton, webPointer, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
          </Pressable>
        </View>
      </View>

      {/* 4. Signed out: invite to sign in, as a quiet card */}
      {!user ? (
        <View style={styles.signInCard}>
          <Text style={styles.signInTitle}>{t("search.mobileHero.signInTitle")}</Text>
          <Text style={styles.signInCopy}>{t("search.mobileHero.signInCopy")}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("search.mobileHero.signInButton")}
            onPress={() => useAuthModalStore.getState().open()}
            style={({ pressed }) => [styles.signInButton, webPointer, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.signInButtonText}>{t("search.mobileHero.signInButton")}</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 5. Quick navigation list (clean action rows) */}
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
    paddingBottom: 20,
  },
  // A dark sheet that sits over the lower edge of the hero photo.
  panel: {
    backgroundColor: colorTokens.ink,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.16)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  tabText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "rgba(255,255,255,0.62)",
  },
  tabTextActive: {
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    height: 3,
    width: 56,
    borderRadius: 2,
    backgroundColor: colorTokens.brand,
  },
  panelBody: {
    padding: 16,
    gap: 14,
  },
  modeToggle: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.pill,
    padding: 3,
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  modeOptionActive: {
    backgroundColor: colorTokens.ink,
  },
  modeText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.ink,
  },
  modeTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
  },
  panelLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    height: 54,
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
    borderRadius: radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colorTokens.onBrand,
    letterSpacing: -0.2,
  },
  signInCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.lg,
    padding: 20,
    marginTop: 16,
    gap: 8,
  },
  signInTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colorTokens.ink,
  },
  signInCopy: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: colorTokens.muted,
  },
  signInButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colorTokens.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colorTokens.ink,
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
