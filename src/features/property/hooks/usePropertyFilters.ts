import { usePropertyFilterStore } from "../stores/propertyFilterStore";

export function usePropertyFilters() {
  const store = usePropertyFilterStore();
  return {
    filters: store.filters,
    selectedAreaName: store.selectedAreaName,
    viewMode: store.viewMode,
    isAreaPickerOpen: store.isAreaPickerOpen,
    isFilterModalOpen: store.isFilterModalOpen,
    activeFilterCount: store.getActiveFilterCount(),
    setSearch: store.setSearch,
    setCity: store.setCity,
    setArea: store.setArea,
    setType: store.setType,
    setListingType: store.setListingType,
    setBedrooms: store.setBedrooms,
    setBathrooms: store.setBathrooms,
    setIsVerified: store.setIsVerified,
    setPriceRange: store.setPriceRange,
    resetFilters: store.resetFilters,
    toggleViewMode: store.toggleViewMode,
    setAreaPickerOpen: store.setAreaPickerOpen,
    setFilterModalOpen: store.setFilterModalOpen,
  };
}
