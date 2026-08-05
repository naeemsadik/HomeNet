import { useState, useEffect, useCallback, useRef } from "react";
import type { Area } from "@/types/api";
import { fetchAreas, fetchAreaChildren } from "@/services/areaApi";

export interface UseAreaPickerOptions {
  initialCity?: string;
  limit?: number;
}

export function useAreaPicker(options: UseAreaPickerOptions = {}) {
  const { initialCity, limit = 50 } = options;

  // Selected city filter chip
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);
  // Navigation drill-down path (stack of parents)
  const [navPath, setNavPath] = useState<Area[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available cities list (could be static or dynamic, we'll offer a set of primary ones and allow custom ones)
  const availableCities = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"];

  // Helper to get current parent ID
  const currentParentId = navPath.length > 0 ? navPath[navPath.length - 1].id : null;

  // Fetch areas based on current path, selected city, and search
  const loadAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim().length > 0) {
        // If searching, search globally or within chosen city
        const res = await fetchAreas({
          search: searchQuery.trim(),
          city: selectedCity || undefined,
          limit,
        });
        setAreas(res.data || []);
      } else if (currentParentId) {
        // If we have a drill down parent, get child areas
        const res = await fetchAreaChildren(currentParentId);
        setAreas(res.data || []);
      } else {
        // If we are at root, fetch root level areas (e.g. cities or main areas in the city)
        const res = await fetchAreas({
          city: selectedCity || undefined,
          parent_area_id: null,
          limit,
        });
        setAreas(res.data || []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, [selectedCity, currentParentId, searchQuery, limit]);

  // Debounced/Triggered loading
  useEffect(() => {
    const handler = setTimeout(() => {
      loadAreas();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(handler);
  }, [loadAreas, searchQuery]);

  // Navigate down to child area
  const drillDown = useCallback((area: Area) => {
    // Clear search query when drilling down to see the real hierarchy
    setSearchQuery("");
    setNavPath((prev) => [...prev, area]);
  }, []);

  // Navigate up the path stack
  const drillUp = useCallback(() => {
    setNavPath((prev) => prev.slice(0, prev.length - 1));
  }, []);

  // Navigate directly to a specific breadcrumb index
  const navigateToBreadcrumb = useCallback((index: number) => {
    setNavPath((prev) => prev.slice(0, index + 1));
  }, []);

  // Reset navigation to root
  const resetNav = useCallback(() => {
    setNavPath([]);
    setSearchQuery("");
  }, []);

  // Handle city chip selection
  const selectCity = useCallback((city: string | null) => {
    setSelectedCity(city);
    setNavPath([]); // Reset hierarchy drill down on city change
    setSearchQuery("");
  }, []);

  return {
    areas,
    loading,
    error,
    navPath,
    selectedCity,
    availableCities,
    searchQuery,
    setSearchQuery,
    drillDown,
    drillUp,
    navigateToBreadcrumb,
    resetNav,
    selectCity,
    refresh: loadAreas,
  };
}
