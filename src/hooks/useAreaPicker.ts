import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Area } from "@/types/api";
import { fetchAreaChildren } from "@/services/areaApi";
import { toApiError } from "@/services/apiClient";
import { filterAreas, useAllAreas } from "@/hooks/useAllAreas";

export interface UseAreaPickerOptions {
  initialCity?: string;
  /** Fetch only while the picker is open; cached lists still show at once. */
  enabled?: boolean;
}

const availableCities = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Sylhet",
  "Cumilla",
  "Gazipur",
];

/**
 * City, search and top-level filtering happen on the shared all-areas list
 * (see useAllAreas for why the API is not asked to filter). Drilling into an
 * area uses its children endpoint, which the API caches per area.
 */
export function useAreaPicker(options: UseAreaPickerOptions = {}) {
  const { initialCity, enabled = true } = options;
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);
  const [navPath, setNavPath] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const currentParentId = navPath.at(-1)?.id;
  const search = searchQuery.trim();
  const showingChildren = Boolean(currentParentId) && !search;

  const allAreas = useAllAreas({ enabled });
  const children = useQuery({
    queryKey: ["areas", "children", currentParentId],
    queryFn: async () => (await fetchAreaChildren(currentParentId as string)).data ?? [],
    enabled: enabled && showingChildren,
  });

  const areas = useMemo(
    () =>
      showingChildren
        ? children.data ?? []
        : filterAreas(allAreas.data?.items ?? [], {
            city: selectedCity,
            search,
            topLevelOnly: !search,
          }),
    [showingChildren, children.data, allAreas.data, selectedCity, search],
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
    navPath,
    drillDown,
    drillUp,
    navigateToBreadcrumb,
    resetNav,
    searchQuery,
    setSearchQuery,
    areas,
    loading: active.isLoading,
    error: active.error ? toApiError(active.error).message : null,
    refresh: () => void active.refetch(),
  };
}
