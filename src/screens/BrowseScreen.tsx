import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  Grid2X2,
  List,
  MapIcon,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "@/components/icons";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard, CARD_HEIGHT } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton } from "@/components/ui";
import { AdvancedFiltersModal } from "@/components/AdvancedFiltersModal";
import { RightmoveFilterCard } from "@/components/RightmoveFilterCard";
import { PropertyResultsMap } from "@/features/property/components/PropertyResultsMap";
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
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { LiveText } from "@/components/LiveText";
import { useTranslation, formatLocalizedNumber } from "@/i18n";
import { showToast } from "@/lib/toast";

type SortKey = "newest" | "priceAsc" | "priceDesc" | "nearest" | "popular";

export function BrowseScreen({
  mode,
  location: fixedLocation,
}: {
  mode?: "buy" | "rent" | "sold";
  /** Pins the area filter, for the /buy/<area> and /rent/<area> landing pages. */
  location?: string;
}) {
  const { t, language } = useTranslation();
  const { isPhone, width } = useResponsive();
  const isMobile = isPhone || width < 768;
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
  const paramKey = JSON.stringify(
    FILTER_PARAM_KEYS.map((key) => (params as Record<string, unknown>)[key] ?? "")
  );
  const filters = React.useMemo(
    () => filtersFromParams(params, { mode, fixedLocation }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramKey, mode, fixedLocation]
  );
  const locationParam = filters.area || undefined;
  const activeLocationTitle = locationParam || filters.query || t("search.allDhaka");
  const activeFilterCount = countActiveFilters(filters);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(() =>
    isFiltersModalRequested(params)
  );
  const [previewFilters, setPreviewFilters] = useState<SearchFilters | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileTabMode, setMobileTabMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isSearchSaved, setIsSearchSaved] = useState(false);

  const { savedIds, toggleSaved, isSaved } = useSavedStore();

  const applyFilters = useCallback(
    (next: SearchFilters) => {
      router.setParams(filtersToParamPatch(next, { fixedLocation, current: params }));
    },
    [fixedLocation, params]
  );

  // Depends on the one fact it reads, so the memo survives unrelated param changes.
  const filtersModalRequested = isFiltersModalRequested(params);
  const closeFilterModal = useCallback(() => {
    setIsFilterModalOpen(false);
    setPreviewFilters(null);
    if (filtersModalRequested) {
      router.setParams({ filters: "", modal: "" });
    }
  }, [filtersModalRequested, setIsFilterModalOpen, setPreviewFilters]);

  const handleResetFilters = useCallback(() => {
    applyFilters(resetSearchFilters(filters, { fixedLocation }));
  }, [applyFilters, filters, fixedLocation]);

  const handleToggleSaveSearch = useCallback(() => {
    setIsSearchSaved((prev) => {
      const next = !prev;
      showToast(next ? t("search.searchSaved") : t("search.searchRemoved"));
      return next;
    });
  }, [t]);

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

  const feed = apiProperties ?? [];
  const isSoldView = filters.purpose === "sold";

  const results = applyClientFilters(feed, filters);

  const sortedResults = React.useMemo(() => {
    const list = [...results];
    switch (sortBy) {
      case "priceAsc":
        return list.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
        return list.sort((a, b) => {
          const timeA = new Date(a.published_at || a.created_at || 0).getTime();
          const timeB = new Date(b.published_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
      case "popular":
        return list.sort((a, b) => ((b as any).view_count ?? 0) - ((a as any).view_count ?? 0));
      case "nearest":
      default:
        return list;
    }
  }, [results, sortBy]);

  const totalCount = hasClientFilters(filters) || isSoldView
    ? results.length
    : (total ?? results.length);

  const previewQuery = useQuery({
    queryKey: ["properties", "preview", previewFilters && toApiFilters(previewFilters)],
    queryFn: () => getProperties({ ...toApiFilters(previewFilters as SearchFilters), limit: 1 }),
    enabled: Boolean(previewFilters) && isFilterModalOpen,
  });
  const previewCount = previewFilters
    ? previewQuery.data?.data?.total
    : totalCount;

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

  const sortOptions = [
    { key: "newest", label: t("search.sort.newest") },
    { key: "priceAsc", label: t("search.sort.priceAsc") },
    { key: "priceDesc", label: t("search.sort.priceDesc") },
    { key: "nearest", label: t("search.sort.nearest") },
    { key: "popular", label: t("search.sort.popular") },
  ] as const;

  const activeSortLabel =
    sortOptions.find((o) => o.key === sortBy)?.label ?? t("search.sort.newest");

  // ── Mobile Search Results Top App Bar ────────────────────────────────────
  const mobileTopBar = isMobile ? (
    <SafeAreaView edges={["top"]} style={styles.mobileTopBarSafe}>
      <View style={styles.mobileTopBar}>
        {/* Back arrow */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={() => router.push("/")}
          style={[styles.mobileTopBarBtn, webPointer]}
        >
          <ArrowLeft color={colorTokens.ink} size={20} strokeWidth={2.4} />
        </Pressable>

        {/* Center title */}
        <View style={styles.mobileTopBarCenter}>
          <Text numberOfLines={1} style={styles.mobileTopBarTitle}>
            {activeLocationTitle}
          </Text>
        </View>

        {/* Right action items */}
        <View style={styles.mobileTopBarActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSearchSaved ? t("search.searchRemoved") : t("search.searchSaved")}
            onPress={handleToggleSaveSearch}
            style={[styles.mobileTopBarBtn, webPointer]}
          >
            <Star
              color={isSearchSaved ? colorTokens.warningText : colorTokens.ink}
              fill={isSearchSaved ? colorTokens.warningText : "transparent"}
              size={20}
              strokeWidth={2}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("filters.title")}
            onPress={() => setIsFilterModalOpen(true)}
            style={[styles.mobileTopBarFilterBtn, webPointer]}
          >
            <SlidersHorizontal color={colorTokens.ink} size={18} strokeWidth={2} />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadgePill}>
                <Text style={styles.filterBadgeText}>
                  {formatLocalizedNumber(activeFilterCount, language)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  ) : undefined;

  // On the web the pill is position: fixed over the page. The app has no
  // fixed positioning, so it goes in AppChrome's floating slot instead, which
  // keeps it above the bottom tabs rather than at the end of the results.
  const viewSwitcher = (
    <View style={styles.floatingPill}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("search.listView")}
        onPress={() => setMobileTabMode("list")}
        style={[
          styles.floatingPillBtn,
          mobileTabMode === "list" && styles.floatingPillBtnActive,
          webPointer,
        ]}
      >
        <List
          size={16}
          color={mobileTabMode === "list" ? colorTokens.onBrand : colorTokens.ink}
          strokeWidth={2.4}
        />
        <Text
          style={[
            styles.floatingPillText,
            mobileTabMode === "list" && styles.floatingPillTextActive,
          ]}
        >
          {t("search.listView")}
        </Text>
      </Pressable>

      <View style={styles.floatingPillDivider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("search.mapView")}
        onPress={() => setMobileTabMode("map")}
        style={[
          styles.floatingPillBtn,
          mobileTabMode === "map" && styles.floatingPillBtnActive,
          webPointer,
        ]}
      >
        <MapIcon
          size={16}
          color={mobileTabMode === "map" ? colorTokens.onBrand : colorTokens.ink}
          strokeWidth={2.4}
        />
        <Text
          style={[
            styles.floatingPillText,
            mobileTabMode === "map" && styles.floatingPillTextActive,
          ]}
        >
          {t("search.mapView")}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <AppChrome
      floating={isMobile && Platform.OS !== "web" ? viewSwitcher : undefined}
      active={mode === "rent" && filters.purpose === "short-let" ? "holiday" : mode || "buy"}
      customTopBar={mobileTopBar}
    >
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        {/* ── Desktop: Rightmove Search Filter Card ────────────────────────── */}
        {!isMobile ? (
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
        ) : null}

        {/* ── Mobile: Results Sub-Header Bar ──────────────────────────────── */}
        {isMobile ? (
          <View style={styles.mobileSubHeader}>
            <LiveText style={styles.mobileResultCount}>
              {t("search.resultsCount", {
                count: formatLocalizedNumber(totalCount, language),
              })}
            </LiveText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t("search.sort.label")}: ${activeSortLabel}`}
              onPress={() => setIsSortMenuOpen(true)}
              style={[styles.mobileSortBtn, webPointer]}
            >
              <Text numberOfLines={1} style={styles.mobileSortBtnText}>
                {activeSortLabel}
              </Text>
              <ChevronDown color={colorTokens.muted} size={14} strokeWidth={2.2} />
            </Pressable>
          </View>
        ) : (
          /* Desktop Results Count & View Toggle Toolbar */
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
        )}

        {/* ── Mobile Map View Mode ────────────────────────────────────────── */}
        {isMobile && mobileTabMode === "map" ? (
          <View style={styles.mobileMapContainer}>
            <PropertyResultsMap
              properties={sortedResults}
              activeLocation={activeLocationTitle}
            />
          </View>
        ) : (
          /* ── Properties Grid / List ─────────────────────────────────────── */
          loading ? (
            <PropertySkeletonFeed />
          ) : isError && results.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyTitle}>{t("browse.loadErrorTitle")}</Text>
              <Text style={styles.emptySubtitle}>{t("browse.loadErrorSubtitle")}</Text>
              <AppButton icon={RotateCcw} label={t("browse.retry")} onPress={() => void refresh()} />
            </View>
          ) : results.length > 0 ? (
            <View style={styles.resultsContainer}>
              {isMobile ? (
                <View style={styles.mobileListLayout}>
                  {sortedResults.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      onSave={handleToggleSaved}
                      property={prop}
                      saved={isSaved(prop.id)}
                    />
                  ))}
                </View>
              ) : viewMode === "grid" ? (
                <PropertyGrid
                  desktopColumns={2}
                  gap={16}
                  horizontalOnPhone={false}
                  tabletColumns={2}
                >
                  {sortedResults.map((prop) => (
                    <PropertyCard
                      imageHeight={210}
                      key={prop.id}
                      onSave={handleToggleSaved}
                      property={prop}
                      saved={isSaved(prop.id)}
                    />
                  ))}
                </PropertyGrid>
              ) : (
                <FlatList
                  data={sortedResults}
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
          )
        )}

        {/* ── Advanced Filters Modal ─────────────────────────────────────── */}
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

      {/* ── Mobile: Floating View Switcher Pill (List | Map) ─────────────── */}
      {isMobile && Platform.OS === "web" ? (
        <View style={styles.floatingPillContainer} pointerEvents="box-none">
          {viewSwitcher}
        </View>
      ) : null}

      {/* ── Mobile: Sort Dropdown Sheet Modal ────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={isSortMenuOpen}
        onRequestClose={() => setIsSortMenuOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsSortMenuOpen(false)}
        >
          <View style={styles.sortModalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>{t("search.sort.label")}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.close")}
                onPress={() => setIsSortMenuOpen(false)}
                style={webPointer}
              >
                <X size={18} color={colorTokens.muted} />
              </Pressable>
            </View>
            <View style={styles.sortOptionsList}>
              {sortOptions.map((opt) => {
                const isSelected = sortBy === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => {
                      setSortBy(opt.key);
                      setIsSortMenuOpen(false);
                    }}
                    style={[
                      styles.sortOptionItem,
                      isSelected && styles.sortOptionItemActive,
                      webPointer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        isSelected && styles.sortOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
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
  containerMobile: {
    paddingTop: 8,
    paddingBottom: 80,
    gap: 8,
  },

  /* ── Mobile Top App Bar ─────────────────────────────────────────────────── */
  mobileTopBarSafe: {
    backgroundColor: colorTokens.surface,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  mobileTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 52,
    backgroundColor: colorTokens.surface,
  },
  mobileTopBarBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  mobileTopBarCenter: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileTopBarTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 16,
    textAlign: "center",
  },
  mobileTopBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  mobileTopBarFilterBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterBadgePill: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 10,
  },

  /* ── Mobile Sub-Header ──────────────────────────────────────────────────── */
  mobileSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
    marginBottom: 8,
  },
  mobileResultCount: {
    color: colorTokens.muted,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  mobileSortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.xs,
    backgroundColor: colorTokens.surfaceSunken,
  },
  mobileSortBtnText: {
    color: colorTokens.ink,
    fontFamily: fonts.medium,
    fontSize: 13,
  },

  /* ── Desktop Results Toolbar ────────────────────────────────────────────── */
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

  /* ── Results Container & Lists ─────────────────────────────────────────── */
  resultsContainer: {
    gap: 20,
  },
  mobileListLayout: {
    width: "100%",
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

  /* ── Mobile Map View ────────────────────────────────────────────────────── */
  mobileMapContainer: {
    width: "100%",
    height: 520,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },

  /* ── Mobile Floating View Switcher Pill (List | Map) ───────────────────── */
  floatingPillContainer: {
    ...(Platform.select({
      web: {
        position: "fixed",
      },
      default: {
        position: "absolute",
      },
    }) as any),
    bottom: 74,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99,
  },
  floatingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    shadowColor: colorTokens.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  floatingPillBtnActive: {
    backgroundColor: colorTokens.brand,
  },
  floatingPillText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  floatingPillTextActive: {
    color: colorTokens.onBrand,
  },
  floatingPillDivider: {
    width: 1,
    height: 16,
    backgroundColor: colorTokens.divider,
    marginHorizontal: 2,
  },

  /* ── Sort Modal Sheet ──────────────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
    justifyContent: "flex-end",
  },
  sortModalSheet: {
    backgroundColor: colorTokens.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  sortModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  sortModalTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 17,
  },
  sortOptionsList: {
    gap: 4,
  },
  sortOptionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  sortOptionItemActive: {
    backgroundColor: colorTokens.brandSurface,
  },
  sortOptionText: {
    color: colorTokens.body,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  sortOptionTextActive: {
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
  },

  /* ── Center / Empty States ─────────────────────────────────────────────── */
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
    borderRadius: radius.pill,
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
