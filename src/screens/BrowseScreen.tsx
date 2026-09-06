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
import { RightmoveFilterCard, type RightmoveFilters } from "@/components/RightmoveFilterCard";
import { toPropertyCard } from "@/features/property/adapters/toPropertyCard";
import { usePropertyFeed } from "@/features/property/hooks/usePropertyFeed";
import { useResponsive } from "@/hooks/useResponsive";
import { useSavedStore } from "@/stores/savedStore";
import { fonts, webPointer } from "@/theme";
import type { PropertyType } from "@/types/api";

export function BrowseScreen({ mode }: { mode?: "buy" | "rent" }) {
  const { isPhone, isTablet } = useResponsive();
  const params = useLocalSearchParams<{
    query?: string;
    search?: string;
    type?: string;
    subtype?: string;
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

  const initialPurpose =
    params.subtype === "short-let"
      ? "short-let"
      : params.listing_type === "rent" || mode === "rent"
      ? "rent"
      : params.listing_type === "sale" || mode === "buy"
      ? "sale"
      : "all";

  // Rightmove Filter state
  const [rightmoveFilters, setRightmoveFilters] = useState<RightmoveFilters>({
    radius: "",
    propertyType:
      params.type && ["apartment", "house", "commercial", "land"].includes(params.type.toLowerCase())
        ? params.type.toLowerCase()
        : "all",
    addedToSite: "",
    includeSold: params.status === "sold",
    verifiedOnly: params.is_verified === "true",
    minPrice: params.min_price || "",
    maxPrice: params.max_price || "",
    minBedrooms: params.bedrooms || "",
    maxBedrooms: "",
    query: params.query || params.search || "",
    purpose: initialPurpose,
  });

  // Advanced modal state (for deep granular attributes if triggered)
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

  // Sync params when URL changes (e.g. from hero search widget)
  useEffect(() => {
    const q = params.query || params.search;
    if (q !== undefined) {
      setRightmoveFilters((prev) => ({
        ...prev,
        query: q,
      }));
    }
    if (params.subtype === "short-let") {
      setRightmoveFilters((prev) => ({
        ...prev,
        purpose: "short-let",
      }));
    } else if (params.listing_type || mode) {
      setRightmoveFilters((prev) => ({
        ...prev,
        purpose:
          params.listing_type === "rent" || mode === "rent"
            ? "rent"
            : params.listing_type === "sale" || mode === "buy"
            ? "sale"
            : "all",
      }));
    }
  }, [params.query, params.search, params.listing_type, params.subtype, mode]);

  // Helper to parse price string to number
  const parsePriceToNumber = (val: string): number | undefined => {
    if (!val || !val.trim()) return undefined;
    const clean = val.toLowerCase().replace(/[,৳\s]/g, "");
    if (clean.endsWith("cr") || clean.endsWith("crore")) {
      const num = parseFloat(clean.replace(/cr|crore/, ""));
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
    const minP = parsePriceToNumber(rightmoveFilters.minPrice);
    const maxP = parsePriceToNumber(rightmoveFilters.maxPrice);
    const bedrooms = rightmoveFilters.minBedrooms ? parseInt(rightmoveFilters.minBedrooms, 10) : undefined;
    const isShortLet = rightmoveFilters.purpose === "short-let";

    return {
      listing_type:
        rightmoveFilters.purpose === "sale"
          ? ("sale" as const)
          : rightmoveFilters.purpose === "rent" || isShortLet
          ? ("rent" as const)
          : undefined,
      search: rightmoveFilters.query.trim() || (isShortLet ? "short-let" : undefined),
      type:
        rightmoveFilters.propertyType === "all"
          ? undefined
          : (rightmoveFilters.propertyType.toLowerCase() as PropertyType),
      bedrooms,
      min_price: minP,
      max_price: maxP,
      city:
        params.city || params.location
          ? (params.city || params.location)
          : undefined,
      status: rightmoveFilters.includeSold ? undefined : ("active" as const),
      is_verified: rightmoveFilters.verifiedOnly ? true : undefined,
      limit: 20,
    };
  }, [rightmoveFilters, params.city, params.location]);

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

  const handleResetFilters = () => {
    setRightmoveFilters({
      radius: "",
      propertyType: "all",
      addedToSite: "",
      includeSold: false,
      verifiedOnly: false,
      minPrice: "",
      maxPrice: "",
      minBedrooms: "",
      maxBedrooms: "",
      query: "",
      purpose: "all",
    });
  };

  return (
    <AppChrome active={mode || "buy"}>
      <View style={styles.container}>
        {/* ─── Rightmove Search Filter Card ─────────────────────────────────── */}
        <RightmoveFilterCard
          filters={rightmoveFilters}
          locationName={params.city || params.location || (rightmoveFilters.query ? rightmoveFilters.query : "Dhaka")}
          onFilterChange={(updated) => setRightmoveFilters(updated)}
          onSearch={(applied) => {
            setRightmoveFilters(applied);
            void refresh();
          }}
          totalResults={results.length}
        />

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
                    imageHeight={isPhone ? 180 : 220}
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
                    imageHeight={isPhone ? 180 : undefined}
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
              onPress={handleResetFilters}
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

  /* Results Toolbar */
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
