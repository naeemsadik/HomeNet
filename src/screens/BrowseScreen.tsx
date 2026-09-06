import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Grid2X2,
  List,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react-native";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton } from "@/components/ui";
import {
  AdvancedFiltersModal,
  defaultFilterState,
  type FilterState,
} from "@/components/AdvancedFiltersModal";
import { toPropertyCard } from "@/features/property/adapters/toPropertyCard";
import { usePropertyFeed } from "@/features/property/hooks/usePropertyFeed";
import { useResponsive } from "@/hooks/useResponsive";
import { useSavedStore } from "@/stores/savedStore";
import { fonts, webPointer } from "@/theme";
import type { PropertyType } from "@/types/api";

type PurposeFilter = "any" | "sale" | "rent";
type TypeFilter = "all" | "apartment" | "house" | "commercial" | "land";

export function BrowseScreen({ mode }: { mode?: "buy" | "rent" }) {
  const { isPhone, isTablet } = useResponsive();
  const params = useLocalSearchParams<{
    query?: string;
    search?: string;
    type?: string;
    status?: string;
    listing_type?: string;
    city?: string;
    location?: string;
    min_price?: string;
    max_price?: string;
    bedrooms?: string;
    bathrooms?: string;
    is_verified?: string;
    filters?: string;
    modal?: string;
  }>();

  // Search input state
  const initialQuery = params.query || params.search || (mode ? "" : "3 bedroom apartment in Gulshan under 2 crore");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  // AI understood tags state
  const [aiTags, setAiTags] = useState<string[]>(
    initialQuery.includes("Gulshan")
      ? ["Apartment", "Gulshan", "3 beds", "< ৳2 Cr"]
      : initialQuery
      ? [initialQuery]
      : []
  );

  // Quick filter chips state
  const initialPurpose: PurposeFilter =
    params.listing_type === "rent" || mode === "rent"
      ? "rent"
      : params.listing_type === "sale" || mode === "buy"
      ? "sale"
      : "any";
  const [purpose, setPurpose] = useState<PurposeFilter>(initialPurpose);

  const initialType: TypeFilter =
    params.type && ["apartment", "house", "commercial", "land"].includes(params.type.toLowerCase())
      ? (params.type.toLowerCase() as TypeFilter)
      : "all";
  const [propertyType, setPropertyType] = useState<TypeFilter>(initialType);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(
    params.is_verified === "true" || false
  );

  // Advanced modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(
    params.filters === "open" || params.filters === "true" || params.modal === "filters"
  );
  const [modalFilters, setModalFilters] = useState<FilterState>({
    ...defaultFilterState,
    location: params.location || params.city || defaultFilterState.location,
    minPrice: params.min_price || "",
    maxPrice: params.max_price || "",
    bedrooms: params.bedrooms ? parseInt(params.bedrooms, 10) : null,
    bathrooms: params.bathrooms ? parseInt(params.bathrooms, 10) : null,
    verifiedOnly: params.is_verified === "true" || false,
  });

  // View mode & Saved properties store
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { savedIds, toggleSaved } = useSavedStore();

  // Sync params when URL changes
  useEffect(() => {
    if (params.query || params.search) {
      const q = params.query || params.search || "";
      setSearchQuery(q);
      setActiveQuery(q);
    }
  }, [params.query, params.search]);

  // Helper to parse price string to number (handles "1.5 Cr", "50 Lakh", "50000")
  const parsePriceToNumber = (val: string): number | undefined => {
    if (!val || !val.trim()) return undefined;
    const clean = val.toLowerCase().replace(/[,৳\s]/g, "");
    if (clean.endsWith("cr")) {
      const num = parseFloat(clean.replace("cr", ""));
      return !isNaN(num) ? num * 10000000 : undefined;
    }
    if (clean.endsWith("lakh") || clean.endsWith("lac") || clean.endsWith("l")) {
      const num = parseFloat(clean.replace(/lakh|lac|l/, ""));
      return !isNaN(num) ? num * 100000 : undefined;
    }
    const parsed = parseFloat(clean);
    return !isNaN(parsed) ? parsed : undefined;
  };

  // Prepare API filters
  const apiFilters = useMemo(() => {
    const minP = parsePriceToNumber(modalFilters.minPrice);
    const maxP = parsePriceToNumber(modalFilters.maxPrice);

    return {
      listing_type:
        purpose === "sale" ? ("sale" as const) : purpose === "rent" ? ("rent" as const) : undefined,
      search: activeQuery.trim() || undefined,
      type:
        propertyType === "all"
          ? undefined
          : (propertyType.toLowerCase() as PropertyType),
      bedrooms: modalFilters.bedrooms || undefined,
      bathrooms: modalFilters.bathrooms || undefined,
      min_price: minP,
      max_price: maxP,
      city:
        modalFilters.location && modalFilters.location !== defaultFilterState.location
          ? modalFilters.location.split(",")[0].trim()
          : undefined,
      status: "active" as const,
      is_verified: verifiedOnly || modalFilters.verifiedOnly ? true : undefined,
      limit: 18,
    };
  }, [activeQuery, modalFilters, propertyType, purpose, verifiedOnly]);

  const {
    properties: apiProperties,
    loading,
    error,
    hasMore,
    fetchingNextPage,
    loadMore,
    refresh,
  } = usePropertyFeed(apiFilters);

  // Return mapped API properties without fallback mock data
  const results = useMemo(() => {
    if (apiProperties && apiProperties.length > 0) {
      return apiProperties.map(toPropertyCard);
    }
    return [];
  }, [apiProperties]);

  function handleSearchSubmit() {
    setActiveQuery(searchQuery);
  }

  function removeAiTag(tagToRemove: string) {
    setAiTags((prev) => prev.filter((t) => t !== tagToRemove));
    if (tagToRemove === "Apartment") setPropertyType("all");
    if (tagToRemove === "3 beds")
      setModalFilters((prev) => ({ ...prev, bedrooms: null }));
  }

  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (modalFilters.bedrooms !== null) count++;
    if (modalFilters.bathrooms !== null) count++;
    if (modalFilters.minPrice || modalFilters.maxPrice) count++;
    if (modalFilters.amenities.length > 0) count += modalFilters.amenities.length;
    if (modalFilters.verifiedOnly) count++;
    return count;
  }, [modalFilters]);

  return (
    <AppChrome active={mode || "search"}>
      <View style={styles.container}>
        {/* ─── 1. AI Search Input Bar ──────────────────────────────────────── */}
        <View style={styles.searchBarCard}>
          <View style={styles.searchBarLeft}>
            <Sparkles color="#0F6D55" size={20} />
            <TextInput
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              placeholder="Search area, project or use AI…"
              placeholderTextColor="#5C6B66"
              returnKeyType="search"
              style={styles.searchBarInput}
              value={searchQuery}
            />
            {searchQuery ? (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setActiveQuery("");
                }}
                style={styles.clearSearchBtn}
              >
                <X color="#5C6B66" size={16} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={handleSearchSubmit}
            style={[styles.searchButton, webPointer]}
          >
            <Search color="#FFFFFF" size={16} />
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>

        {/* ─── 2. AI Understood Tags Row ──────────────────────────────────── */}
        {aiTags.length > 0 ? (
          <View style={styles.aiUnderstoodRow}>
            <View style={styles.aiUnderstoodLabelWrap}>
              <Sparkles color="#0F6D55" size={14} />
              <Text style={styles.aiUnderstoodLabel}>AI understood:</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiTagsScroll}
            >
              {aiTags.map((tag) => (
                <View key={tag} style={styles.aiTagPill}>
                  <Text style={styles.aiTagText}>{tag}</Text>
                  <Pressable
                    accessibilityLabel={`Remove ${tag} tag`}
                    onPress={() => removeAiTag(tag)}
                    style={styles.aiTagCloseBtn}
                  >
                    <X color="#5C6B66" size={12} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* ─── 3. Quick Filter Chips Bar ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {/* Filters modal trigger button */}
          <Pressable
            onPress={() => setIsFilterModalOpen(true)}
            style={[
              styles.filterTriggerChip,
              (isFilterModalOpen || activeAdvancedCount > 0) && styles.filterTriggerChipActive,
              webPointer,
            ]}
          >
            <SlidersHorizontal
              color={isFilterModalOpen || activeAdvancedCount > 0 ? "#FFFFFF" : "#0F6D55"}
              size={16}
            />
            <Text
              style={[
                styles.filterTriggerText,
                (isFilterModalOpen || activeAdvancedCount > 0) && styles.filterTriggerTextActive,
              ]}
            >
              Filters
            </Text>
            {activeAdvancedCount > 0 ? (
              <View style={styles.chipCountBadge}>
                <Text style={styles.chipCountBadgeText}>
                  {activeAdvancedCount}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.chipDivider} />

          {/* Purpose Chips */}
          <Pressable
            onPress={() => setPurpose("any")}
            style={[styles.chip, purpose === "any" && styles.chipActive, webPointer]}
          >
            <Text
              style={[
                styles.chipText,
                purpose === "any" && styles.chipTextActive,
              ]}
            >
              Any purpose
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPurpose("sale")}
            style={[styles.chip, purpose === "sale" && styles.chipActive, webPointer]}
          >
            <Text
              style={[
                styles.chipText,
                purpose === "sale" && styles.chipTextActive,
              ]}
            >
              For Sale
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPurpose("rent")}
            style={[styles.chip, purpose === "rent" && styles.chipActive, webPointer]}
          >
            <Text
              style={[
                styles.chipText,
                purpose === "rent" && styles.chipTextActive,
              ]}
            >
              For Rent
            </Text>
          </Pressable>

          <View style={styles.chipDivider} />

          {/* Type Chips */}
          <Pressable
            onPress={() => setPropertyType("all")}
            style={[
              styles.chip,
              propertyType === "all" && styles.chipActive,
              webPointer,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                propertyType === "all" && styles.chipTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPropertyType("apartment")}
            style={[
              styles.chip,
              propertyType === "apartment" && styles.chipActive,
              webPointer,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                propertyType === "apartment" && styles.chipTextActive,
              ]}
            >
              Apartment
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPropertyType("house")}
            style={[
              styles.chip,
              propertyType === "house" && styles.chipActive,
              webPointer,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                propertyType === "house" && styles.chipTextActive,
              ]}
            >
              House
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPropertyType("commercial")}
            style={[
              styles.chip,
              propertyType === "commercial" && styles.chipActive,
              webPointer,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                propertyType === "commercial" && styles.chipTextActive,
              ]}
            >
              Commercial
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPropertyType("land")}
            style={[
              styles.chip,
              propertyType === "land" && styles.chipActive,
              webPointer,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                propertyType === "land" && styles.chipTextActive,
              ]}
            >
              Land
            </Text>
          </Pressable>

          <View style={styles.chipDivider} />

          {/* Verified Only Chip */}
          <Pressable
            onPress={() => setVerifiedOnly((prev) => !prev)}
            style={[
              styles.chip,
              verifiedOnly && styles.chipActive,
              webPointer,
            ]}
          >
            <ShieldCheck
              color={verifiedOnly ? "#FFFFFF" : "#0F6D55"}
              size={14}
            />
            <Text
              style={[
                styles.chipText,
                verifiedOnly && styles.chipTextActive,
              ]}
            >
              Verified only
            </Text>
          </Pressable>
        </ScrollView>

        {/* ─── 4. Results Count & View Toggle Toolbar ─────────────────────── */}
        <View style={styles.toolbar}>
          <Text style={styles.resultCountText}>
            {results.length} properties found
          </Text>

          <View style={styles.viewToggleWrap}>
            <Pressable
              accessibilityLabel="Grid view"
              onPress={() => setViewMode("grid")}
              style={[
                styles.viewToggleBtn,
                viewMode === "grid" && styles.viewToggleBtnActive,
                webPointer,
              ]}
            >
              <Grid2X2
                color={viewMode === "grid" ? "#FFFFFF" : "#5C6B66"}
                size={16}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="List view"
              onPress={() => setViewMode("list")}
              style={[
                styles.viewToggleBtn,
                viewMode === "list" && styles.viewToggleBtnActive,
                webPointer,
              ]}
            >
              <List
                color={viewMode === "list" ? "#FFFFFF" : "#5C6B66"}
                size={16}
              />
            </Pressable>
          </View>
        </View>

        {/* ─── 5. Properties Grid / List ──────────────────────────────────── */}
        {loading && (!results || results.length === 0) ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#0F6D55" size="large" />
            <Text style={styles.loadingText}>Searching verified listings...</Text>
          </View>
        ) : error && results.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>Could not load live properties</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <AppButton icon={RotateCcw} label="Retry" onPress={() => void refresh()} />
          </View>
        ) : results.length > 0 ? (
          <View style={styles.resultsContainer}>
            {viewMode === "grid" ? (
              <PropertyGrid
                desktopColumns={2}
                gap={16}
                horizontalOnPhone={false}
                tabletColumns={2}
              >
                {results.map((prop) => (
                  <PropertyCard
                    imageHeight={isPhone ? 220 : 280}
                    key={prop.id}
                    mode={mode}
                    onSave={() => toggleSaved(prop.id)}
                    property={prop}
                    saved={savedIds.includes(prop.id)}
                  />
                ))}
              </PropertyGrid>
            ) : (
              <View style={styles.listLayout}>
                {results.map((prop) => (
                  <PropertyCard
                    imageHeight={isPhone ? 220 : undefined}
                    key={prop.id}
                    list={!isPhone}
                    mode={mode}
                    onSave={() => toggleSaved(prop.id)}
                    property={prop}
                    saved={savedIds.includes(prop.id)}
                  />
                ))}
              </View>
            )}

            {hasMore ? (
              <View style={styles.loadMoreWrap}>
                <AppButton
                  disabled={fetchingNextPage}
                  label={fetchingNextPage ? "Loading..." : "Load more listings"}
                  onPress={() => void loadMore()}
                  style={styles.loadMoreBtn}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Search color="#0F6D55" size={32} />
            <Text style={styles.emptyTitle}>No matching properties</Text>
            <Text style={styles.emptySubtitle}>
              Try broadening your search query, adjusting your budget, or clearing some filters.
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setActiveQuery("");
                setPurpose("any");
                setPropertyType("all");
                setVerifiedOnly(false);
                setModalFilters(defaultFilterState);
              }}
              style={[styles.clearAllBtn, webPointer]}
            >
              <Text style={styles.clearAllBtnText}>Reset all filters</Text>
            </Pressable>
          </View>
        )}

        {/* ─── 6. Advanced Filters Modal ───────────────────────────────────── */}
        <AdvancedFiltersModal
          filters={modalFilters}
          onApply={(updated) => setModalFilters(updated)}
          onClose={() => setIsFilterModalOpen(false)}
          onReset={() => setModalFilters(defaultFilterState)}
          resultCount={results.length}
          visible={isFilterModalOpen}
        />
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },

  /* 1. AI Search Bar */
  searchBarCard: {
    width: "100%",
    minHeight: 54.4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 17,
    paddingRight: 9.2,
    paddingVertical: 9.2,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchBarLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  searchBarInput: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    height: 36,
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 6,
  },
  searchButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F6D55",
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  /* 2. AI Understood */
  aiUnderstoodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    minHeight: 36,
  },
  aiUnderstoodLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiUnderstoodLabel: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  aiTagsScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  aiTagText: {
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  aiTagCloseBtn: {
    padding: 2,
  },

  /* 3. Filter Chips */
  filterChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  filterTriggerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#0F6D55",
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 38.4,
  },
  filterTriggerChipActive: {
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  filterTriggerText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTriggerTextActive: {
    color: "#FFFFFF",
  },
  chipCountBadge: {
    backgroundColor: "#F4823A",
    borderRadius: 999,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  chipCountBadgeText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(11, 26, 23, 0.12)",
    marginHorizontal: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 38.4,
  },
  chipActive: {
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  chipText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  /* 4. Toolbar */
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  resultCountText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
  },
  viewToggleWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 10,
    padding: 3,
    gap: 3,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  viewToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleBtnActive: {
    backgroundColor: "#0F6D55",
  },

  /* 5. Properties Grid */
  resultsContainer: {
    gap: 24,
  },
  listLayout: {
    gap: 16,
  },
  loadMoreWrap: {
    alignItems: "center",
    paddingTop: 12,
  },
  loadMoreBtn: {
    minWidth: 180,
  },

  /* Center / Empty States */
  centerContainer: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  emptyContainer: {
    minHeight: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 20,
  },
  clearAllBtn: {
    marginTop: 8,
    backgroundColor: "#0F6D55",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearAllBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
});
