import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Area } from "@/types/api";
import { fetchAreaChildren } from "@/services/areaApi";
import { toApiError } from "@/services/apiClient";
import { filterAreas, useAllAreas } from "@/hooks/useAllAreas";
import { useDebouncedValue, SEARCH_DEBOUNCE_MS } from "@/hooks/useDebouncedValue";
import { collectAvailableCities, isNationwideValue, normalizeCityName } from "@/lib/areaMatcher";

export interface UseAreaPickerOptions {
  initialCity?: string;
  /** Fetch only while the picker is open; cached lists still show at once. */
  enabled?: boolean;
}

/**
 * City, search and top-level filtering happen on the shared all-areas list
 * (see useAllAreas for why the API is not asked to filter). Drilling into an
 * area uses its children endpoint, which the API caches per area.
 */
export function useAreaPicker(options: UseAreaPickerOptions = {}) {
  const { initialCity, enabled = true } = options;
  const resolvedInitialCity =
    initialCity && !isNationwideValue(initialCity) ? normalizeCityName(initialCity) ?? initialCity : null;
  const [selectedCity, setSelectedCity] = useState<string | null>(resolvedInitialCity);
  const [navPath, setNavPath] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const wasEnabled = useRef(enabled);

  useEffect(() => {
    if (enabled && !wasEnabled.current) {
      setSelectedCity(
        initialCity && !isNationwideValue(initialCity) ? normalizeCityName(initialCity) ?? initialCity : null,
      );
      setNavPath([]);
    }
    wasEnabled.current = enabled;
  }, [enabled, initialCity]);

  const currentParentId = navPath.at(-1)?.id;
  // The input stays immediate; only the filtering waits, so typing in a list of
  // every area does not re-filter on each keystroke.
  const search = useDebouncedValue(searchQuery.trim(), SEARCH_DEBOUNCE_MS);
  const showingChildren = Boolean(currentParentId) && !search;

  const allAreas = useAllAreas({ enabled });
  const allAreaItems = allAreas.data?.items ?? [];
  const availableCities = useMemo(() => collectAvailableCities(allAreaItems), [allAreaItems]);

  const children = useQuery({
    queryKey: ["areas", "children", currentParentId],
    queryFn: async () => (await fetchAreaChildren(currentParentId as string)).data ?? [],
    enabled: enabled && showingChildren,
  });

  const areas = useMemo(
    () =>
      showingChildren
        ? children.data ?? []
        : filterAreas(allAreaItems, {
            city: selectedCity,
            search,
            topLevelOnly: !search,
          }),
    [showingChildren, children.data, allAreaItems, selectedCity, search],
  );

  const active = showingChildren ? children : allAreas;

  const drillDown = useCallback((area: Area) => {
    setSearchQuery("");
    setNavPath((path) => [...path, area]);
  }, []);

  const drillUp = useCallback(() => setNavPath((path) => path.slice(0, -1)), []);
  const navigateToBreadcrumb = useCallback(
    (index: number) => setNavPath((path) => path.slice(0, index + 1)),
    [],
  );
  const resetNav = useCallback(() => {
    setNavPath([]);
    setSearchQuery("");
  }, []);

  const selectCity = useCallback((city: string | null) => {
    setSelectedCity(city);
    setNavPath([]);
    setSearchQuery("");
  }, []);

  return {
    selectedCity,
    selectCity,
    availableCities,
    allAreas: allAreaItems,
    navPath,
    drillDown,
    drillUp,
    navigateToBreadcrumb,
    resetNav,
    searchQuery,
    setSearchQuery,
    /** True while a search term is narrowing the list. */
    isSearching: Boolean(search),
    areas,
    loading: active.isLoading,
    error: active.error ? toApiError(active.error).message : null,
    refresh: () => void active.refetch(),
  };
}
