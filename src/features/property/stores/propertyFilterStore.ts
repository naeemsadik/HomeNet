import { create } from "zustand";
import type { PropertyFilters } from "../types/property";

export interface PropertyFilterState {
  filters: PropertyFilters;
  selectedAreaName: string;
  viewMode: "list" | "map";
  isAreaPickerOpen: boolean;
  isFilterModalOpen: boolean;

  // Actions
  setSearch: (search: string) => void;
  setCity: (city?: string) => void;
  setArea: (areaId?: string, areaName?: string) => void;
  setType: (type?: PropertyFilters["type"]) => void;
  setListingType: (listingType?: PropertyFilters["listing_type"]) => void;
  setBedrooms: (bedrooms?: number) => void;
  setBathrooms: (bathrooms?: number) => void;
  setIsVerified: (isVerified?: boolean) => void;
  setPriceRange: (min_price?: number, max_price?: number) => void;
  resetFilters: () => void;
  toggleViewMode: () => void;
  setAreaPickerOpen: (open: boolean) => void;
  setFilterModalOpen: (open: boolean) => void;

  // Computed badge counter
  getActiveFilterCount: () => number;
}

const initialFilters: PropertyFilters = {
  city: "Dhaka",
  type: undefined,
  listing_type: undefined,
  min_price: undefined,
  max_price: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  search: "",
  is_verified: undefined,
  page: 1,
  limit: 20,
};

export const usePropertyFilterStore = create<PropertyFilterState>((set, get) => ({
  filters: { ...initialFilters },
  selectedAreaName: "Dhaka",
  viewMode: "list",
  isAreaPickerOpen: false,
  isFilterModalOpen: false,

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search, page: 1 },
    })),

  setCity: (city) =>
    set((state) => ({
      filters: { ...state.filters, city, area_id: undefined, page: 1 },
      selectedAreaName: city || "All Areas",
    })),

  setArea: (areaId, areaName) =>
    set((state) => ({
      filters: { ...state.filters, area_id: areaId, page: 1 },
      selectedAreaName: areaName || state.selectedAreaName,
    })),

  setType: (type) =>
    set((state) => ({
      filters: { ...state.filters, type, page: 1 },
    })),

  setListingType: (listing_type) =>
    set((state) => ({
      filters: { ...state.filters, listing_type, page: 1 },
    })),

  setBedrooms: (bedrooms) =>
    set((state) => ({
      filters: { ...state.filters, bedrooms, page: 1 },
    })),

  setBathrooms: (bathrooms) =>
    set((state) => ({
      filters: { ...state.filters, bathrooms, page: 1 },
    })),

  setIsVerified: (is_verified) =>
    set((state) => ({
      filters: { ...state.filters, is_verified, page: 1 },
    })),

  setPriceRange: (min_price, max_price) =>
    set((state) => ({
      filters: { ...state.filters, min_price, max_price, page: 1 },
    })),

  resetFilters: () =>
    set({
      filters: { ...initialFilters },
      selectedAreaName: "Dhaka",
    }),

  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "list" ? "map" : "list",
    })),

  setAreaPickerOpen: (isAreaPickerOpen) => set({ isAreaPickerOpen }),
  setFilterModalOpen: (isFilterModalOpen) => set({ isFilterModalOpen }),

  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.type) count++;
    if (filters.listing_type) count++;
    if (filters.min_price || filters.max_price) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.is_verified) count++;
    if (filters.area_id) count++;
    return count;
  },
}));
