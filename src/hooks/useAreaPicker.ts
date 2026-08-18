import { useState, useEffect, useCallback, useRef } from "react";
import type { Area } from "@/types/api";
import { fetchAreas, fetchAreaChildren } from "@/services/areaApi";
import { BANGLADESH_AREAS } from "@/data/bangladeshAreas";

export interface UseAreaPickerOptions {
  initialCity?: string;
  limit?: number;
}

export function useAreaPicker(options: UseAreaPickerOptions = {}) {
  const { initialCity, limit = 100 } = options;

  // Selected city filter chip
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);
  // Navigation drill-down path (stack of parents)
  const [navPath, setNavPath] = useState<Area[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available major cities of Bangladesh
  const availableCities = [
    "Dhaka",
    "Chottogram",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Rangpur",
    "Maymensingh",
    "Sylhet",
    "Cumilla",
    "Gazipur",
  ];

  // Helper to get current parent ID
  const currentParentId = navPath.length > 0 ? navPath[navPath.length - 1].id : null;

  // Helper to filter fallback areas locally
  const getFallbackAreas = useCallback(() => {
    let result = BANGLADESH_AREAS;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.city && a.city.toLowerCase().includes(q))
      );
      if (selectedCity) {
        result = result.filter((a) => a.city?.toLowerCase() === selectedCity.toLowerCase());
      }
      return result;
    }

    if (currentParentId) {
      return result.filter((a) => a.parent_area_id === currentParentId);
    }

    if (selectedCity) {
      return result.filter(
        (a) =>
          a.city?.toLowerCase() === selectedCity.toLowerCase() &&
          (!a.parent_area_id || a.type === "DISTRICT" || a.type === "CITY")
      );
    }

    // Root level: return all top-level areas
    return result.filter((a) => !a.parent_area_id || a.type === "DISTRICT" || a.type === "CITY");
  }, [selectedCity, currentParentId, searchQuery]);

  // Fetch areas based on current path, selected city, and search
  const loadAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim().length > 0) {
        const res = await fetchAreas({
          search: searchQuery.trim(),
          city: selectedCity || undefined,
          limit,
        });
        const items = res.data?.items || [];
        setAreas(items.length > 0 ? items : getFallbackAreas());
      } else if (currentParentId) {
        const res = await fetchAreaChildren(currentParentId);
        const items = res.data?.items || [];
        setAreas(items.length > 0 ? items : getFallbackAreas());
      } else {
        const res = await fetchAreas({
          city: selectedCity || undefined,
          parent_area_id: null,
          limit,
        });
        const items = res.data?.items || [];
        setAreas(items.length > 0 ? items : getFallbackAreas());
      }
    } catch {
      // Fallback seamlessly to built-in comprehensive Bangladesh area dataset
      setAreas(getFallbackAreas());
    } finally {
      setLoading(false);
    }
  }, [selectedCity, currentParentId, searchQuery, limit, getFallbackAreas]);

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
