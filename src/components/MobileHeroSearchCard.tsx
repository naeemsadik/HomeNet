import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Bookmark,
  Calculator,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "@/components/icons";
import { colorTokens, fonts, radius, webPointer, brandButtonState } from "@/theme";
import { useTranslation } from "@/i18n";
import { AreaPicker, type AreaLocationSelection } from "./AreaPicker";
import { AdvancedFiltersModal } from "./AdvancedFiltersModal";
import type { GeoPoint } from "@/lib/areaMatcher";
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
import { MESS_ENABLED } from "@/lib/features";

/** "mess" opens Mess & Seat Share (/mess), its own search. */
type MobileTab = "buy" | "rent" | "holiday" | "sold" | "mess";

const MOBILE_TABS: MobileTab[] = ["buy", "rent", "holiday", "sold", ...(MESS_ENABLED ? (["mess"] as const) : [])];

export function MobileHeroSearchCard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<MobileTab>("buy");
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [customAreaName, setCustomAreaName] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<GeoPoint | null>(null);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const hasActiveFilters = activeFilterCount > 0;

  const purposeForTab = (tab: MobileTab): SearchPurpose => {
    switch (tab) {
      case "sold":
        return "sold";
      case "holiday":
        return "short-let";
      case "rent":
        return "rent";
      case "buy":
      default:
        return "sale";
    }
  };

  const handleTabChange = (tab: MobileTab) => {
    if (tab === "mess") {
      router.push("/mess" as never);
      return;
    }
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      includeSold: tab === "sold" ? prev.includeSold : false,
    }));
  };

  const clearLocationSelection = () => {
    setSelectedArea(null);
    setSelectedCity(null);
    setCustomAreaName(null);
    setSelectedCoords(null);
  };

  const applyLocationSelection = (loc: AreaLocationSelection) => {
    setSelectedArea(loc.area);
    setSelectedCity(loc.city);
    setCustomAreaName(loc.area ? null : (loc.areaName ?? null));
    setSelectedCoords(loc.coordinates ?? null);
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

    const city = selectedCity || selectedArea?.city || null;
    const areaName = selectedArea?.name || customAreaName || null;
    if (city) params.set("city", city);
    if (areaName) params.set("location", areaName);
    if (selectedCoords) {
      params.set("lat", String(selectedCoords.lat));
      params.set("lng", String(selectedCoords.lng));
    }

    const qs = params.toString();
    router.push((qs ? `${target}?${qs}` : target) as never);
  };

  const primaryButtonLabel =
    activeTab === "sold"
      ? t("search.searchHomesSold")
      : activeTab === "holiday"
      ? t("search.searchHolidayStays")
      : activeTab === "rent"
      ? t("search.searchHomesForRent")
      : t("search.searchHomesForSale");

  const locationDisplayText = selectedArea
    ? selectedCity
      ? `${selectedArea.name}, ${selectedCity}`
      : selectedArea.name
    : customAreaName
    ? selectedCity
      ? `${customAreaName}, ${selectedCity}`
      : customAreaName
    : selectedCity;

  const searchLabel =
    activeTab === "sold"
      ? t("search.mobileHero.labelSold")
      : activeTab === "holiday"
      ? t("search.mobileHero.labelHoliday")
      : activeTab === "rent"
      ? t("search.mobileHero.labelRent")
      : t("search.mobileHero.labelBuy");

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* 1. Transaction type: underlined tabs */}
        <View style={styles.tabsRow} accessibilityRole="tablist">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {MOBILE_TABS.map((tab) => {
              const isSelected = activeTab === tab;
              const tabLabel =
                tab === "buy"
                  ? t("search.tabs.buy")
                  : tab === "rent"
                  ? t("search.tabs.rent")
                  : tab === "holiday"
                  ? t("search.tabs.holidayStay")
                  : tab === "mess"
                  ? t("mess.tab")
                  : t("search.tabs.sold");

              return (
                <Pressable
                  key={tab}
                  accessibilityRole="tab"
                  aria-selected={isSelected}
                  accessibilityLabel={tabLabel}
                  onPress={() => handleTabChange(tab)}
                  style={[styles.tab, webPointer]}
                >
                  <Text
                    style={[styles.tabText, isSelected && styles.tabTextActive]}
                    numberOfLines={1}
                  >
                    {tabLabel}
                  </Text>
                  {isSelected ? <View style={styles.tabUnderline} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.panelBody}>
          <Text style={styles.panelLabel}>{searchLabel}</Text>

          {/* 3. Where: opens the area picker; filters sit beside it */}
          <View style={styles.searchBox}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                locationDisplayText
                  ? t("hero.filterByAreaWithLocation", { location: locationDisplayText })
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

            {locationDisplayText ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("hero.clearLocation")}
                onPress={(e) => {
                  e.stopPropagation?.();
                  clearLocationSelection();
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
            style={({ hovered, pressed }: any) => [
              styles.primaryButton,
              webPointer,
              hovered && brandButtonState.hovered,
              pressed && brandButtonState.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>{t("hero.search")}</Text>
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
          onPress={() => router.push("/instant-valuation" as never)}
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
        allowCitySelection
        enableGooglePlaces
        initialCity={selectedCity ?? undefined}
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedArea={selectedArea}
        onSelect={(area) => {
          setSelectedArea(area);
          setSelectedCity(area?.city ?? null);
          setCustomAreaName(null);
          setSelectedCoords(null);
          setAreaPickerOpen(false);
        }}
        onSelectLocation={(loc) => {
          applyLocationSelection(loc);
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
  // A white sheet over the lower edge of the hero photo, like the website's search card.
  panel: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...(Platform.select({
      web: { boxShadow: "0 18px 40px -18px rgba(11, 26, 23, 0.35)" },
      default: {
        shadowColor: colorTokens.ink,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 8,
      },
    }) ?? {}),
  },
  tabsRow: {
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
    paddingHorizontal: 16,
    width: "100%",
  },
  tabsScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "100%",
    gap: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    overflow: "visible",
  },
  tabText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colorTokens.muted,
    textAlign: "center",
  },
  tabTextActive: {
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    height: 3,
    width: "70%",
    maxWidth: 48,
    borderRadius: 2,
    backgroundColor: colorTokens.brand,
  },
  panelBody: {
    padding: 16,
    gap: 14,
  },
  panelLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surfaceSunken,
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
