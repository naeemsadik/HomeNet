import { useCallback, useEffect, useState } from "react";
import type { Area } from "@/types/api";
import { fetchAreaChildren, fetchAreas } from "@/services/areaApi";
import { toApiError } from "@/services/apiClient";

export interface UseAreaPickerOptions {
  initialCity?: string;
  limit?: number;
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

export function useAreaPicker(options: UseAreaPickerOptions = {}) {
  const { initialCity, limit = 100 } = options;
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);
  const [navPath, setNavPath] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentParentId = navPath.at(-1)?.id;

  const loadAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (currentParentId && !searchQuery.trim()) {
        const response = await fetchAreaChildren(currentParentId);
        setAreas(response.data ?? []);
      } else {
        const response = await fetchAreas({
          city: selectedCity || undefined,
          search: searchQuery.trim() || undefined,
          limit,
        });
        const items = response.data?.items ?? [];
        setAreas(searchQuery.trim() ? items : items.filter((area) => !area.parent_area_id));
      }
    } catch (requestError) {
      setAreas([]);
      setError(toApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [currentParentId, limit, searchQuery, selectedCity]);

  useEffect(() => {
    const timer = setTimeout(loadAreas, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadAreas, searchQuery]);

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
    loading,
    error,
    refresh: loadAreas,
  };
}
