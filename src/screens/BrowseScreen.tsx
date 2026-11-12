import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
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
  Bell,
  ChevronDown,
  ChevronRight,
  List,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "@/components/icons";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { RightmoveFilterCard } from "@/components/RightmoveFilterCard";
import { ResultListingCard } from "@/components/ResultListingCard";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { SelectField } from "@/components/SelectField";
import { AppButton } from "@/components/ui";
import { AdvancedFiltersModal } from "@/components/AdvancedFiltersModal";
import { PropertyResultsMap } from "@/features/property/components/PropertyResultsMap";
import { PropertySkeletonFeed } from "@/features/property/components/PropertySkeleton";
import { useAreas } from "@/features/property/hooks/useAreas";
import { fetchBrowseTotal, useBrowseFeed } from "@/features/property/hooks/useBrowseFeed";
import type { PropertyFilters } from "@/features/property/types/property";
import type { BrowseSnapshot } from "@/lib/browseSnapshot";
import {
  areaOptionsForCity,
  cityOptions as buildCityOptions,
  fallbackAreaOptionsForCity,
  isCityName,
  resolveScope,
} from "@/features/property/utils/areaScope";
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
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";
import { LiveText } from "@/components/LiveText";
import { useTranslation, formatLocalizedNumber, type TranslationKey } from "@/i18n";
import { showToast } from "@/lib/toast";

/**
 * Save search and Create alert need an API to store them and send the alerts,
 * which the backend does not have yet (there is no saved-search or alert
 * endpoint). Until it does, the buttons stay hidden rather than showing a
 * "saved" toast for something nothing keeps.
 */
const SAVED_SEARCHES_ENABLED = false;

type SortKey = "newest" | "priceAsc" | "priceDesc" | "nearest" | "popular";

export function BrowseScreen({
  mode,
  location: fixedLocation,
  initialResults,
  onTotalChange,
}: {
  mode?: "buy" | "rent" | "sold";
  /** Pins the area filter, for the /buy/<area> and /rent/<area> landing pages. */
  location?: string;
  /** The first page as the build saw it (route loader), shown until the feed answers. */
  initialResults?: BrowseSnapshot;
  /** Called with the result count once the feed has loaded; not called while loading or after an error. */
  onTotalChange?: (total: number) => void;
}) {
  const { t, language } = useTranslation();
  const { isPhone, width, height } = useResponsive();
  const isMobile = isPhone || width < 768;
  // The mini map and cross-links sit beside the results only when the cards
  // still get a comfortable width.
  const showSidebar = width >= 1100;
  const params = useLocalSearchParams();

  // A partial area list (see useAreas) is worse than none: it would offer two
  // places and treat every other one as unknown.
  const { areas: fetchedAreas, ready: areasReady, complete: areasComplete } = useAreas();
  const areas = areasComplete ? fetchedAreas : [];
  const cityChoices = React.useMemo(() => {
    if (fixedLocation) return undefined;
    return buildCityOptions(areas, t("search.rightmove.allCities"));
  }, [areas, fixedLocation, t]);

  const getAreaOptionsForCity = React.useCallback(
    (city: string) => {
      if (fixedLocation) return [];
      return areasComplete
        ? areaOptionsForCity(areas, city, t("filters.allAreas"))
        : fallbackAreaOptionsForCity(city, t("filters.allAreas"));
    },
    [areas, areasComplete, fixedLocation, t]
  );

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
  const areaOptions = React.useMemo(() => {
    if (fixedLocation) return undefined;
    return getAreaOptionsForCity(filters.city);
  }, [fixedLocation, getAreaOptionsForCity, filters.city]);

  const locationParam = filters.area || undefined;
  const activeLocationTitle =
    (locationParam && filters.city
      ? `${locationParam}, ${filters.city}`
      : locationParam || filters.city) ||
    filters.query ||
    t("search.allBangladesh");
  const activeFilterCount = countActiveFilters(filters);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(() =>
    isFiltersModalRequested(params)
  );
  const [previewFilters, setPreviewFilters] = useState<SearchFilters | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isSearchSaved, setIsSearchSaved] = useState(false);
  const [isAlertOn, setIsAlertOn] = useState(false);

  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  // Subscribing to the ids is what re-renders the hearts when one is toggled.
  const savedIds = useSavedStore((state) => state.savedIds);
  const savedSet = React.useMemo(() => new Set(savedIds.map(String)), [savedIds]);
  const isSaved = useCallback((id: string) => savedSet.has(String(id)), [savedSet]);

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
      showToast(next ? t("search.results.searchSaved") : t("search.searchRemoved"));
      return next;
    });
  }, [t]);

  const handleToggleAlert = useCallback(() => {
    setIsAlertOn((prev) => {
      const next = !prev;
      showToast(next ? t("search.searchSaved") : t("search.searchRemoved"));
      return next;
    });
  }, [t]);

  // What the card holds before Search is pressed. Nothing reaches the URL (and
  // so the API) until then.
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(filters);
  const startSearch = useCallback(
    (next: SearchFilters) => {
      setSearchStarted(true);
      router.setParams({
        ...filtersToParamPatch(next, { fixedLocation, current: params }),
        searched: "1",
      });
    },
    [fixedLocation, params]
  );

  const apiFilters = toApiFilters(filters);

  const parsedLat = filters.lat ? Number(filters.lat) : null;
  const parsedLng = filters.lng ? Number(filters.lng) : null;
  const { scope, radiusAvailable } = React.useMemo(
    () =>
      resolveScope({
        name: filters.area,
        city: filters.city,
        lat: parsedLat,
        lng: parsedLng,
        radiusKm: filters.radius ? parseInt(filters.radius, 10) : 0,
        areas,
      }),
    [filters.area, filters.city, parsedLat, parsedLng, filters.radius, areas]
  );
  // The page opens on the search card, as Rightmove's does, and only turns
  // into results once a search has been made. A shared link, an area page or
  // any filter in the URL counts as a search already. Once a search has been
  // made it stays one, so Reset filters does not bounce back to the card.
  const searchedParam = [params.searched].flat()[0] === "1";
  const hasSearchedNow =
    searchedParam ||
    Boolean(fixedLocation) ||
    Boolean(filters.city) ||
    Boolean(filters.area) ||
    Boolean(filters.lat && filters.lng) ||
    Boolean(filters.query) ||
    activeFilterCount > 0;
  const [searchStarted, setSearchStarted] = useState(false);
  if (hasSearchedNow && !searchStarted) setSearchStarted(true);
  const hasSearched = hasSearchedNow || searchStarted;
  const feedReady = hasSearched && (!filters.area || isCityName(filters.area) || areasReady);

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

  // The build-time first page (see browseSnapshot), shown until the live feed
  // answers, so the exported HTML lists real listings with the real count
  // rather than a skeleton and "0 found". Only for the page as exported: with
  // filters in the URL it would show the wrong listings.
  const hasUrlFilters = FILTER_PARAM_KEYS.some((key) => {
    const value = (params as Record<string, unknown>)[key];
    return value !== undefined && value !== "";
  });
  const snapshot = loading && !hasUrlFilters ? initialResults : undefined;
  const feedLoading = loading && !snapshot;
  const feed = snapshot ? snapshot.items : apiProperties ?? [];
  const isSoldView = filters.purpose === "sold";

  // Memoised so the sort below, and every card under it, only recompute when
  // the feed or the filters actually change rather than on each render.
  const results = React.useMemo(() => applyClientFilters(feed, filters), [feed, filters]);

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
        return list.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
      case "nearest":
      default:
        return list;
    }
  }, [results, sortBy]);

  const totalCount = hasClientFilters(filters) || isSoldView
    ? results.length
    : ((snapshot ? snapshot.total : total) ?? results.length);

  // Only a total from a load that worked: a failed feed has no total, and reporting 0 would mark
  // a page with listings noindex whenever the API is down.
  useEffect(() => {
    if (feedLoading || isError || typeof onTotalChange !== "function") return;
    onTotalChange(totalCount);
  }, [feedLoading, isError, totalCount, onTotalChange]);

  // The results line is the page's <h1>: what is listed and where, which is
  // what a search for "flat rent gulshan" should land on. Until the feed has
  // answered it names the page without a count, never "0 found".
  const headingPurpose = t(
    filters.purpose === "sale"
      ? "browse.purposeSale"
      : filters.purpose === "rent"
      ? "browse.purposeRent"
      : filters.purpose === "short-let"
      ? "browse.purposeShortLet"
      : filters.purpose === "sold"
      ? "browse.purposeSold"
      : "browse.purposeAll"
  );
  const headingPlace =
    (locationParam && filters.city
      ? `${locationParam}, ${filters.city}`
      : locationParam || filters.city) || t("browse.everywhere");
  const resultsHeading = feedLoading
    ? t("browse.heading", { purpose: headingPurpose, place: headingPlace })
    : t(totalCount === 1 ? "browse.headingOne" : "browse.headingCount", {
        count: formatLocalizedNumber(totalCount, language),
        purpose: headingPurpose,
        place: headingPlace,
      });

  // The sheet's count has to be asked for the way the feed is: the area and
  // distance are not part of toApiFilters, they become the scope. Asking with
  // toApiFilters alone ignored the area, so picking Mohammadpur still read
  // "Show all 18 results", and the right number only flashed up as the sheet
  // closed and the feed behind it reloaded.
  const previewArea = previewFilters?.area ?? "";
  const previewCity = previewFilters?.city ?? "";
  const previewLat = previewFilters?.lat ? Number(previewFilters.lat) : null;
  const previewLng = previewFilters?.lng ? Number(previewFilters.lng) : null;
  const previewRadius = previewFilters?.radius ?? "";
  const previewScope = React.useMemo(
    () =>
      resolveScope({
        name: previewArea,
        city: previewCity,
        lat: previewLat,
        lng: previewLng,
        radiusKm: previewRadius ? parseInt(previewRadius, 10) : 0,
        areas,
      }).scope,
    [previewArea, previewCity, previewLat, previewLng, previewRadius, areas]
  );
  const previewReady = !previewArea || isCityName(previewArea) || areasReady;
  const previewApiFilters = previewFilters ? toApiFilters(previewFilters) : null;
  const previewQuery = useQuery({
    queryKey: ["properties", "preview", previewApiFilters, previewScope],
    queryFn: () => fetchBrowseTotal(previewApiFilters as PropertyFilters, previewScope),
    enabled: Boolean(previewFilters) && isFilterModalOpen && previewReady,
  });
  // Before a search there is no feed to count, so the sheet has no number to
  // show until it has asked for one.
  const previewCount = previewFilters
    ? previewQuery.data
    : hasSearched
    ? totalCount
    : undefined;

  const handleToggleSaved = useCallback(
    (property: (typeof results)[number] | string) => {
      void toggleSaved(property);
    },
    [toggleSaved]
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

  /** "Properties for Sale in Gulshan", the line the results start under. */
  const heading = useMemo(() => {
    const key: TranslationKey =
      filters.purpose === "sold"
        ? "search.rightmove.headingSold"
        : filters.purpose === "short-let"
        ? "search.rightmove.headingShortLet"
        : filters.purpose === "rent"
        ? "search.rightmove.headingRent"
        : filters.purpose === "sale"
        ? "search.rightmove.headingSale"
        : "search.rightmove.headingAll";
    return t(key, { location: activeLocationTitle });
  }, [filters.purpose, activeLocationTitle, t]);

  // Sale and rent link to each other for the same place, as the sidebar's
  // last card. Sold and holiday stays have no counterpart.
  const crossLink =
    mode === "buy" || (mode === "rent" && filters.purpose === "rent")
      ? {
          label:
            mode === "buy"
              ? t("search.results.crossLinkRent", { location: activeLocationTitle })
              : t("search.results.crossLinkBuy", { location: activeLocationTitle }),
          href: {
            pathname: mode === "buy" ? "/rent" : "/buy",
            params: {
              ...(filters.city ? { city: filters.city } : {}),
              ...(locationParam ? { location: locationParam } : {}),
            },
          },
        }
      : null;

  // ── Mobile Search Results Top App Bar ────────────────────────────────────
  const mobileTopBar = isMobile ? (
    <SafeAreaView edges={["top"]} style={styles.mobileTopBarSafe}>
      <View style={styles.mobileTopBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={() => router.push("/")}
          style={[styles.mobileTopBarBtn, webPointer]}
        >
          <ArrowLeft color={colorTokens.onInk} size={20} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.mobileTopBarCenter}>
          <Text numberOfLines={1} style={styles.mobileTopBarTitle}>
            {activeLocationTitle}
          </Text>
        </View>

        <View style={styles.mobileTopBarActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("filters.title")}
            onPress={() => setIsFilterModalOpen(true)}
            style={[styles.mobileTopBarBtn, webPointer]}
          >
            <SlidersHorizontal color={colorTokens.onInk} size={19} strokeWidth={2} />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadgePill}>
                <Text style={styles.filterBadgeText}>
                  {formatLocalizedNumber(activeFilterCount, language)}
                </Text>
              </View>
            ) : null}
          </Pressable>

          {SAVED_SEARCHES_ENABLED ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSearchSaved ? t("search.searchRemoved") : t("search.results.saveSearch")}
            onPress={handleToggleSaveSearch}
            style={[styles.mobileTopBarBtn, webPointer]}
          >
            <Star
              color={isSearchSaved ? colorTokens.brand : colorTokens.onInk}
              fill={isSearchSaved ? colorTokens.brand : "transparent"}
              size={20}
              strokeWidth={2}
            />
          </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  ) : undefined;

  // On phones, on the website and in the app (which runs the same map in a
  // WebView): one link to the other view, "Map" with a pin as on Rightmove's
  // phone results, "List" from the map. It sits in the results row, in the
  // page flow, so it never covers a listing card.
  const viewToggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={view === "list" ? t("search.results.mapView") : t("search.results.listView")}
      onPress={() => setView(view === "list" ? "map" : "list")}
      style={[styles.mobileViewLink, webPointer]}
    >
      {view === "list" ? (
        <MapPin size={17} color={colorTokens.ink} strokeWidth={2.2} />
      ) : (
        <List size={17} color={colorTokens.ink} strokeWidth={2.2} />
      )}
      <Text style={styles.mobileViewLinkText}>{view === "list" ? t("search.mapView") : t("search.listView")}</Text>
    </Pressable>
  );

  /** Save search and Create alert: by the heading on the list, over the map on the map. */
  const searchActions = (onMap: boolean) =>
    SAVED_SEARCHES_ENABLED ? (
    <View style={styles.searchActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isSearchSaved }}
        onPress={handleToggleSaveSearch}
        style={[styles.linkBtn, onMap && styles.mapChip, webPointer]}
      >
        <Star
          color={isSearchSaved ? colorTokens.brandText : colorTokens.ink}
          fill={isSearchSaved ? colorTokens.brand : "transparent"}
          size={16}
          strokeWidth={2}
        />
        <Text style={styles.linkBtnText}>
          {isSearchSaved ? t("search.results.searchSaved") : t("search.results.saveSearch")}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isAlertOn }}
        onPress={handleToggleAlert}
        style={[styles.linkBtn, onMap && styles.mapChip, webPointer]}
      >
        <Bell
          color={isAlertOn ? colorTokens.brandText : colorTokens.ink}
          fill={isAlertOn ? colorTokens.brand : "transparent"}
          size={16}
          strokeWidth={2}
        />
        <Text style={styles.linkBtnText}>
          {isAlertOn ? t("search.results.alertOn") : t("search.results.createAlert")}
        </Text>
      </Pressable>
    </View>
    ) : null;

  const loadMoreButton = hasMore ? (
    <View style={styles.loadMoreWrap}>
      <AppButton
        disabled={fetchingNextPage}
        label={fetchingNextPage ? t("browse.loadingMore") : t("browse.loadMore")}
        onPress={() => void loadMore()}
        style={styles.loadMoreBtn}
      />
    </View>
  ) : null;

  const resultsBody = feedLoading ? (
    <PropertySkeletonFeed />
  ) : isError && results.length === 0 ? (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyTitle}>{t("browse.loadErrorTitle")}</Text>
      <Text style={styles.emptySubtitle}>{t("browse.loadErrorSubtitle")}</Text>
      <AppButton icon={RotateCcw} label={t("browse.retry")} onPress={() => void refresh()} />
    </View>
  ) : results.length > 0 ? (
    <View style={styles.resultsList}>
      {sortedResults.map((prop) =>
        isMobile ? (
          <PropertyCard
            key={prop.id}
            onSave={handleToggleSaved}
            property={prop}
            saved={isSaved(prop.id)}
          />
        ) : (
          <ResultListingCard
            key={prop.id}
            compact={width < 1000}
            onSave={handleToggleSaved}
            property={prop}
            saved={isSaved(prop.id)}
          />
        )
      )}
      {loadMoreButton}
    </View>
  ) : isSoldView ? (
    <View style={styles.emptyContainer}>
      <Search color={colorTokens.brand} size={32} />
      <Text style={styles.emptyTitle}>{t("browse.noSoldTitle")}</Text>
      <Text style={styles.emptySubtitle}>{t("browse.noSoldSubtitle")}</Text>
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <Search color={colorTokens.brand} size={32} />
      <Text style={styles.emptyTitle}>{t("browse.noMatchingTitle")}</Text>
      <Text style={styles.emptySubtitle}>{t("browse.noMatchingSubtitle")}</Text>
      <Pressable onPress={handleResetFilters} style={[styles.clearAllBtn, webPointer]}>
        <Text style={styles.clearAllBtnText}>{t("browse.resetAllFilters")}</Text>
      </Pressable>
    </View>
  );

  // Only listings with real coordinates get a pin, so that is what the pill counts.
  const pinnedCount = React.useMemo(
    () =>
      sortedResults.filter(
        (p) => typeof p.location_lat === "number" && typeof p.location_lng === "number"
      ).length,
    [sortedResults]
  );

  const showingPill = (
    <View style={styles.showingPill} pointerEvents="none">
      <Text style={styles.showingText}>
        {t("search.results.showingOf", {
          shown: formatLocalizedNumber(pinnedCount, language),
          total: formatLocalizedNumber(totalCount, language),
        })}
      </Text>
    </View>
  );

  // ── Search card, before any search ───────────────────────────────────────
  const landingContent = (
    <View style={[styles.landing, isMobile && styles.landingMobile]}>
      <RightmoveFilterCard
        areaOptions={areaOptions}
        cityOptions={cityChoices}
        filters={draftFilters}
        getAreaOptionsForCity={getAreaOptionsForCity}
        locationName={activeLocationTitle}
        onFilterChange={setDraftFilters}
        onOpenMoreFilters={() => setIsFilterModalOpen(true)}
        onSearch={startSearch}
        radiusAvailable={radiusAvailable}
      />
    </View>
  );

  // ── Desktop ──────────────────────────────────────────────────────────────
  const desktopContent = (
    <>
      <SearchFilterBar
        areaOptions={areaOptions}
        cityOptions={cityChoices}
        filters={filters}
        locationName={activeLocationTitle}
        onFilterChange={applyFilters}
        onOpenMoreFilters={() => setIsFilterModalOpen(true)}
        radiusAvailable={radiusAvailable}
      />

      {view === "map" ? (
        <PropertyResultsMap
          activeLocation={activeLocationTitle}
          peek="bottom"
          properties={sortedResults}
          style={[styles.desktopMap, { height: Math.max(560, height - 220) }]}
        >
          <View pointerEvents="box-none" style={styles.mapTopBar}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView("list")}
              style={[styles.linkBtn, styles.mapChip, webPointer]}
            >
              <ArrowLeft color={colorTokens.ink} size={16} strokeWidth={2.4} />
              <Text style={styles.linkBtnText}>{t("search.results.listView")}</Text>
            </Pressable>
            {showingPill}
            <View style={styles.mapTopRight}>
              {searchActions(true)}
              {activeFilterCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleResetFilters}
                  style={[styles.linkBtn, styles.mapChip, webPointer]}
                >
                  <X color={colorTokens.ink} size={16} strokeWidth={2.2} />
                  <Text style={styles.linkBtnText}>{t("search.results.clearFilters")}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </PropertyResultsMap>
      ) : (
        <>
          <View style={styles.breadcrumbRow}>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText} numberOfLines={1}>
                {heading}
              </Text>
              <ChevronRight color={colorTokens.muted} size={15} strokeWidth={2.2} />
            </View>
            {searchActions(false)}
          </View>

          <View style={styles.columns}>
            <View style={styles.mainCol}>
              <View style={styles.toolbar}>
                <View style={styles.toolbarLeft}>
                  <LiveText accessibilityRole="header" aria-level={1} style={styles.resultCountText}>
                    {resultsHeading}
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

                <View style={styles.toolbarRight}>
                  <Text style={styles.sortLabel}>{t("search.results.sortLabel")}</Text>
                  <SelectField
                    accessibilityLabel={t("search.sort.label")}
                    value={sortBy}
                    options={sortOptions.map((o) => ({ value: o.key, label: o.label }))}
                    onChange={(val) => setSortBy(val as SortKey)}
                    style={styles.sortSelect}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setView("map")}
                    style={({ hovered }: any) => [styles.linkBtn, hovered && styles.linkBtnHover, webPointer]}
                  >
                    <MapPin color={colorTokens.ink} size={16} strokeWidth={2.2} />
                    <Text style={styles.linkBtnText}>{t("search.results.mapView")}</Text>
                  </Pressable>
                </View>
              </View>

              {resultsBody}
            </View>

            {showSidebar ? (
              <View style={styles.sidebar}>
                <View style={styles.sideCard}>
                  <View style={styles.miniMap}>
                    <PropertyResultsMap
                      activeLocation={activeLocationTitle}
                      onSelectProperty={() => setView("map")}
                      peek="none"
                      properties={sortedResults}
                      style={styles.miniMapInner}
                    >
                      <View style={styles.miniMapTag} pointerEvents="none">
                        <Text style={styles.miniMapTagText}>{t("search.results.approxLocation")}</Text>
                      </View>
                    </PropertyResultsMap>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setView("map")}
                    style={({ hovered }: any) => [styles.sideLink, hovered && styles.linkBtnHover, webPointer]}
                  >
                    <MapPin color={colorTokens.ink} size={17} strokeWidth={2.2} />
                    <Text style={styles.sideLinkText}>{t("search.results.showOnMap")}</Text>
                  </Pressable>
                </View>

                {crossLink ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => router.push(crossLink.href as never)}
                    style={({ hovered }: any) => [styles.sideCard, styles.crossLink, hovered && styles.linkBtnHover, webPointer]}
                  >
                    <Text style={styles.crossLinkText}>{crossLink.label}</Text>
                    <ChevronRight color={colorTokens.ink} size={16} strokeWidth={2.2} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </>
      )}
    </>
  );

  // ── Phone ────────────────────────────────────────────────────────────────
  const mobileContent = (
    <>
      {/* The page's heading on its own line (Rightmove's "Properties For Sale
          in M6"), so the row under it has room for the count, sort and Map. */}
      <LiveText accessibilityRole="header" aria-level={1} numberOfLines={2} style={styles.mobileHeading}>
        {resultsHeading}
      </LiveText>

      <View style={styles.mobileSubHeader}>
        <LiveText numberOfLines={1} style={styles.mobileResultCount}>
          {feedLoading ? "" : t("search.resultsCount", { count: formatLocalizedNumber(totalCount, language) })}
        </LiveText>

        <View style={styles.mobileSubHeaderRight}>
          {view === "list" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t("search.sort.label")}: ${activeSortLabel}`}
              onPress={() => setIsSortMenuOpen(true)}
              style={[styles.mobileSortBtn, webPointer]}
            >
              <Text numberOfLines={1} style={styles.mobileSortBtnText}>
                {activeSortLabel}
              </Text>
              <ChevronDown color={colorTokens.ink} size={16} strokeWidth={2.2} />
            </Pressable>
          ) : null}
          {viewToggle}
        </View>
      </View>

      {view === "map" ? (
        <PropertyResultsMap
          activeLocation={activeLocationTitle}
          peek="carousel"
          properties={sortedResults}
          // The map fills the screen between the results row and the bottom tabs.
          style={[styles.mobileMap, { height: Math.max(420, height - 190) }]}
        >
          <View pointerEvents="box-none" style={styles.mobileMapTop}>
            {showingPill}
          </View>
        </PropertyResultsMap>
      ) : (
        resultsBody
      )}
    </>
  );

  return (
    <AppChrome
      active={mode === "rent" && filters.purpose === "short-let" ? "holiday" : mode || "buy"}
      customTopBar={mobileTopBar}
    >
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        {!hasSearched ? landingContent : isMobile ? mobileContent : desktopContent}

        <AdvancedFiltersModal
          areaOptions={areaOptions}
          cityOptions={cityChoices}
          filters={hasSearched ? filters : draftFilters}
          fixedLocation={fixedLocation}
          getAreaOptionsForCity={getAreaOptionsForCity}
          onApply={hasSearched ? applyFilters : startSearch}
          onClose={closeFilterModal}
          onPreviewCount={setPreviewFilters}
          resultCount={previewCount}
          showLocation
          visible={isFilterModalOpen}
        />
      </View>

      {/* ── Mobile: Sort Dropdown Sheet Modal ────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={isSortMenuOpen}
        onRequestClose={() => setIsSortMenuOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsSortMenuOpen(false)}>
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
                    style={[styles.sortOptionItem, isSelected && styles.sortOptionItemActive, webPointer]}
                  >
                    <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextActive]}>
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
  landing: {
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
    paddingTop: 8,
    paddingBottom: 48,
  },
  landingMobile: {
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  container: {
    width: "100%",
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  containerMobile: {
    paddingTop: 0,
    paddingBottom: 80,
    gap: 8,
  },

  /* ── Mobile Top App Bar (ink, like the desktop filter bar) ─────────────── */
  mobileTopBarSafe: {
    backgroundColor: colorTokens.ink,
  },
  mobileTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    height: 56,
    backgroundColor: colorTokens.ink,
  },
  mobileTopBarBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    position: "relative",
  },
  mobileTopBarCenter: {
    flex: 1,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  mobileTopBarTitle: {
    color: colorTokens.onInk,
    fontFamily: fonts.headingBold,
    fontSize: 17,
  },
  mobileTopBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  filterBadgePill: {
    position: "absolute",
    top: 3,
    right: 2,
    minWidth: 17,
    height: 17,
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
  },
  mobileSubHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  mobileHeading: {
    color: colorTokens.ink,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  mobileResultCount: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    flexShrink: 1,
    marginRight: 8,
  },
  mobileViewLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: layout.touchTarget,
    paddingHorizontal: 4,
  },
  mobileViewLinkText: { color: colorTokens.ink, fontFamily: fonts.semiBold, fontSize: 14 },
  mobileSortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: layout.touchTarget,
    paddingHorizontal: 4,
    flexShrink: 1,
  },
  mobileSortBtnText: {
    flexShrink: 1,
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  mobileMap: {
    borderRadius: 0,
    marginHorizontal: -14,
    width: "auto",
  },
  mobileMapTop: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },

  /* ── Desktop: heading row ──────────────────────────────────────────────── */
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  breadcrumbText: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 19,
    flexShrink: 1,
  },
  searchActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  linkBtnHover: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  linkBtnText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  mapChip: {
    backgroundColor: colorTokens.surface,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  /* ── Desktop: two columns ──────────────────────────────────────────────── */
  columns: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  sidebar: {
    width: 300,
    gap: 14,
    paddingTop: 54,
  },
  sideCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#DDE3E1",
    overflow: "hidden",
  },
  miniMap: {
    height: 190,
  },
  miniMapInner: {
    height: 190,
    borderRadius: 0,
  },
  miniMapTag: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 20,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniMapTagText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  sideLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  sideLinkText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  crossLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  crossLinkText: {
    flex: 1,
    color: colorTokens.ink,
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  /* ── Desktop: results toolbar ──────────────────────────────────────────── */
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexShrink: 1,
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  sortLabel: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  sortSelect: {
    width: 190,
  },

  /* ── Desktop: map view ─────────────────────────────────────────────────── */
  desktopMap: {
    borderRadius: radius.md,
  },
  mapTopBar: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    zIndex: 20,
  },
  mapTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  showingPill: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  showingText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  /* ── Results list ──────────────────────────────────────────────────────── */
  resultsList: {
    gap: 18,
  },
  loadMoreWrap: {
    alignItems: "center",
    paddingTop: 6,
  },
  loadMoreBtn: {
    minWidth: 180,
  },

  /* ── Mobile List | Map switch (in the results row) ─────────────────────── */

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
