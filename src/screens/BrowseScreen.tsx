import React, { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Grid2X2,
  List,
  RotateCcw,
  Search,
} from "@/components/icons";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard, CARD_HEIGHT } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton } from "@/components/ui";
import { AdvancedFiltersModal } from "@/components/AdvancedFiltersModal";
import { RightmoveFilterCard } from "@/components/RightmoveFilterCard";
import { PropertySkeletonFeed } from "@/features/property/components/PropertySkeleton";
import { useAreas } from "@/features/property/hooks/useAreas";
import { useBrowseFeed } from "@/features/property/hooks/useBrowseFeed";
import {
  areaOptions as buildAreaOptions,
  fallbackAreaOptions,
  isCityName,
  resolveScope,
} from "@/features/property/utils/areaScope";
import { getProperties } from "@/services/propertyApi";
import {
  applyClientFilters,
  countActiveFilters,
  FILTER_PARAM_KEYS,
  filtersFromParams,
  filtersToParamPatch,
  hasClientFilters,
  isFiltersModalRequested,
  resetSearchFilters,
  toApiFilters,
  type SearchFilters,
} from "@/features/property/utils/searchFilters";
import { useResponsive } from "@/hooks/useResponsive";
import { useSavedStore } from "@/stores/savedStore";
import { colorTokens, fonts, webPointer } from "@/theme";
import { LiveText } from "@/components/LiveText";
import { useTranslation, formatLocalizedNumber } from "@/i18n";

export function BrowseScreen({
  mode,
  location: fixedLocation,
}: {
  mode?: "buy" | "rent" | "sold";
  /** Pins the area filter, for the /buy/<area> and /rent/<area> landing pages. */
  location?: string;
}) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const params = useLocalSearchParams();

  // A partial area list (see useAreas) is worse than none: it would offer two
  // places and treat every other one as unknown.
  const { areas: fetchedAreas, ready: areasReady, complete: areasComplete } = useAreas();
  const areas = areasComplete ? fetchedAreas : [];
  const areaOptions = React.useMemo(() => {
    if (fixedLocation) return undefined;
    return areasComplete
      ? buildAreaOptions(areas, t("filters.allAreas"))
      : fallbackAreaOptions(t("filters.allAreas"));
  }, [areas, areasComplete, fixedLocation, t]);

  /**
   * The URL is the only filter state. Refresh, Back and a shared link all land
   * on the same search, and nothing has to be kept in sync with anything else.
   */
  // Memoised on the params themselves: a fresh object every render would
  // re-key the feed query and re-seed the modal on each one.
  const paramKey = JSON.stringify(
    FILTER_PARAM_KEYS.map((key) => (params as Record<string, unknown>)[key] ?? "")
  );
  const filters = React.useMemo(
    () => filtersFromParams(params, { mode, fixedLocation }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramKey, mode, fixedLocation]
  );
  const locationParam = filters.area || undefined;
  const activeFilterCount = countActiveFilters(filters);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(() =>
    isFiltersModalRequested(params)
  );
  const [previewFilters, setPreviewFilters] = useState<SearchFilters | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { savedIds, toggleSaved, isSaved } = useSavedStore();

  const applyFilters = useCallback(
    (next: SearchFilters) => {
      router.setParams(filtersToParamPatch(next, { fixedLocation, current: params }));
    },
    [fixedLocation, params]
  );

  const closeFilterModal = useCallback(() => {
    setIsFilterModalOpen(false);
    setPreviewFilters(null);
    // Otherwise ?filters=open reopens the modal on the next render.
    if (isFiltersModalRequested(params)) {
      router.setParams({ filters: "", modal: "" });
    }
  }, [params]);

  const handleResetFilters = useCallback(() => {
    applyFilters(resetSearchFilters(filters, { fixedLocation }));
  }, [applyFilters, filters, fixedLocation]);

  const apiFilters = toApiFilters(filters);

  const { scope, radiusAvailable } = React.useMemo(
    () =>
      resolveScope({
        name: filters.area,
        radiusKm: filters.radius ? parseInt(filters.radius, 10) : 0,
        areas,
      }),
    [filters.area, filters.radius, areas]
  );
  // A city needs no area list; any other place waits for it, so the page never
  // shows results for the wrong place first.
  const feedReady = !filters.area || isCityName(filters.area) || areasReady;

  const {
    properties: apiProperties,
    total,
    loading,
    isError,
    hasMore,
    fetchingNextPage,
    loadMore,
    refresh,
  } = useBrowseFeed(apiFilters, scope, feedReady);

  // PropertyCard consumes the API shape directly — no adapter needed.
  const feed = apiProperties ?? [];
  const isSoldView = filters.purpose === "sold";

  // Everything the API cannot filter: the sold re-check, the added-to-site
  // window, amenities and the room ceilings.
  const results = applyClientFilters(feed, filters);

  // A client-side pass has narrowed the list, so the API's total is no longer
  // the number on screen. Count what is actually shown.
  const totalCount = hasClientFilters(filters) || isSoldView
    ? results.length
    : (total ?? results.length);

  /**
   * The count the modal's pending filters would return, for its apply button.
   * `limit: 1` keeps it to a count — the listings themselves are not needed.
   */
  const previewQuery = useQuery({
    queryKey: ["properties", "preview", previewFilters && toApiFilters(previewFilters)],
    queryFn: () => getProperties({ ...toApiFilters(previewFilters as SearchFilters), limit: 1 }),
    enabled: Boolean(previewFilters) && isFilterModalOpen,
  });
  const previewCount = previewFilters
    ? previewQuery.data?.data?.total
    : totalCount;

  // The area list feeds both the bar and the modal, from the app-wide areas
  // cache the picker already fills. A /buy/<area> page pins its area in the
  // route, so it offers no chooser.
  const handleToggleSaved = useCallback(
    (property: (typeof results)[number] | string) => {
      void toggleSaved(property);
    },
    [toggleSaved]
  );

  const renderPropertyItem = useCallback(
    ({ item }: { item: (typeof results)[number] }) => (
      <View style={styles.listItemWrap}>
        <PropertyCard
          imageHeight={isPhone ? 180 : 210}
          onSave={handleToggleSaved}
          property={item}
          saved={isSaved(item.id)}
        />
      </View>
    ),
    [isPhone, handleToggleSaved, isSaved, savedIds]
  );

  const keyExtractor = useCallback((item: (typeof results)[number]) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <AppChrome active={mode || "buy"}>
      <View style={styles.container}>
        {/* ─── Rightmove Search Filter Card ─────────────────────────────────── */}
        <RightmoveFilterCard
          areaOptions={areaOptions}
          filters={filters}
          radiusAvailable={radiusAvailable}
          radiusHint={
            scope.kind === "areas"
              ? t("search.rightmove.radiusUnavailable")
              : t("search.rightmove.pickNeighbourhood")
          }
          locationName={locationParam || (filters.query ? filters.query : "Dhaka")}
          onFilterChange={applyFilters}
          onOpenMoreFilters={() => setIsFilterModalOpen(true)}
          onSearch={(applied) => {
            applyFilters(applied);
            void refresh();
          }}
          totalResults={totalCount}
        />

        {/* ─── 4. Results Count & View Toggle Toolbar ─────────────────────── */}
        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <LiveText style={styles.resultCountText}>
              {totalCount === 1
                ? t("browse.propertyFound", {
                    count: formatLocalizedNumber(totalCount, language),
                  })
                : t("browse.propertiesFound", {
                    count: formatLocalizedNumber(totalCount, language),
                  })}
            </LiveText>

            {activeFilterCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleResetFilters}
                style={[styles.resetFiltersBtn, webPointer]}
              >
                <Text style={styles.resetFiltersText}>{t("browse.resetFilters")}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.viewToggleWrap}>
            <Pressable
              accessibilityLabel={t("browse.gridView")}
              onPress={() => setViewMode("grid")}
              style={[
                styles.viewToggleBtn,
                viewMode === "grid" && styles.viewToggleBtnActive,
                webPointer,
              ]}
            >
              <Grid2X2
                color={viewMode === "grid" ? colorTokens.onBrand : colorTokens.muted}
                size={16}
              />
            </Pressable>

            <Pressable
              accessibilityLabel={t("browse.listView")}
              onPress={() => setViewMode("list")}
              style={[
                styles.viewToggleBtn,
                viewMode === "list" && styles.viewToggleBtnActive,
                webPointer,
              ]}
            >
              <List
                color={viewMode === "list" ? colorTokens.onBrand : colorTokens.muted}
                size={16}
              />
            </Pressable>
          </View>
        </View>

        {/* ─── 5. Properties Grid / List ──────────────────────────────────── */}
        {loading ? (
          <PropertySkeletonFeed />
        ) : isError && results.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>{t("browse.loadErrorTitle")}</Text>
            <Text style={styles.emptySubtitle}>{t("browse.loadErrorSubtitle")}</Text>
            <AppButton icon={RotateCcw} label={t("browse.retry")} onPress={() => void refresh()} />
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
                    imageHeight={isPhone ? 180 : 210}
                    key={prop.id}
                    onSave={handleToggleSaved}
                    property={prop}
                    saved={isSaved(prop.id)}
                  />
                ))}
              </PropertyGrid>
            ) : (
              <FlatList
                data={results}
                renderItem={renderPropertyItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                initialNumToRender={6}
                maxToRenderPerBatch={8}
                windowSize={5}
                scrollEnabled={false}
                contentContainerStyle={styles.listLayout}
              />
            )}

            {hasMore ? (
              <View style={styles.loadMoreWrap}>
                <AppButton
                  disabled={fetchingNextPage}
                  label={fetchingNextPage ? t("browse.loadingMore") : t("browse.loadMore")}
                  onPress={() => void loadMore()}
                  style={styles.loadMoreBtn}
                />
              </View>
            ) : null}
          </View>
        ) : isSoldView ? (
          <View style={styles.emptyContainer}>
            <Search color={colorTokens.brand} size={32} />
            <Text style={styles.emptyTitle}>{t("browse.noSoldTitle")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("browse.noSoldSubtitle")}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Search color={colorTokens.brand} size={32} />
            <Text style={styles.emptyTitle}>{t("browse.noMatchingTitle")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("browse.noMatchingSubtitle")}
            </Text>
            <Pressable
              onPress={handleResetFilters}
              style={[styles.clearAllBtn, webPointer]}
            >
              <Text style={styles.clearAllBtnText}>{t("browse.resetAllFilters")}</Text>
            </Pressable>
          </View>
        )}

        {/* ─── 6. Advanced Filters Modal ───────────────────────────────────── */}
        <AdvancedFiltersModal
          areaOptions={areaOptions}
          filters={filters}
          fixedLocation={fixedLocation}
          onApply={applyFilters}
          onClose={closeFilterModal}
          onPreviewCount={setPreviewFilters}
          resultCount={previewCount}
          showLocation
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
    gap: 12,
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexShrink: 1,
  },
  resultCountText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
  },
  resetFiltersBtn: {
    paddingVertical: 2,
  },
  resetFiltersText: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
  },
  viewToggleWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: 10,
    padding: 3,
    gap: 3,
    borderWidth: 1.2,
    borderColor: colorTokens.divider,
  },
  viewToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleBtnActive: {
    backgroundColor: colorTokens.brand,
  },

  /* 5. Properties Grid */
  resultsContainer: {
    gap: 24,
  },
  listLayout: {
    gap: 16,
  },
  listItemWrap: {
    width: "100%",
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
  emptyContainer: {
    minHeight: 340,
    backgroundColor: colorTokens.surface,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: colorTokens.divider,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 20,
  },
  clearAllBtn: {
    marginTop: 8,
    backgroundColor: colorTokens.brand,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearAllBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
});
