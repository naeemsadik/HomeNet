import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  RotateCcw,
  Check,
  Building2,
} from "lucide-react-native";
import { AreaPicker } from "@/components/AreaPicker";
import type { Area } from "@/types/api";
import { usePropertyFilters } from "../hooks/usePropertyFilters";
import { usePropertyFeed } from "../hooks/usePropertyFeed";
import { PropertyCard } from "./PropertyCard";
import { PropertySkeletonFeed } from "./PropertySkeleton";
import { MapListToggle } from "./MapListToggle";
import { feedColors } from "./PropertyBadge";

export function PropertyFeed() {
  const {
    filters,
    selectedAreaName,
    viewMode,
    isAreaPickerOpen,
    isFilterModalOpen,
    activeFilterCount,
    setSearch,
    setCity,
    setArea,
    setType,
    setListingType,
    setBedrooms,
    resetFilters,
    toggleViewMode,
    setAreaPickerOpen,
    setFilterModalOpen,
  } = usePropertyFilters();

  const {
    properties,
    loading,
    refreshing,
    fetchingNextPage,
    error,
    hasMore,
    loadMore,
    refresh,
  } = usePropertyFeed(filters);

  // Handle Area Selection from AreaPicker modal
  const handleSelectArea = (area: Area | null, path: Area[]) => {
    if (!area) {
      setArea(undefined, "All Areas");
    } else {
      setArea(area.id, area.name);
    }
    setAreaPickerOpen(false);
  };

  return (
    <View style={styles.screenContainer}>
      {/* ─── 1. Header Bar (Sticky) ───────────────────────────────────────── */}
      <View style={styles.headerContainer}>
        {/* Top Search Input Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Search color={feedColors.textMuted} size={18} style={styles.searchIcon} />
            <TextInput
              value={filters.search || ""}
              onChangeText={setSearch}
              placeholder="Search properties..."
              placeholderTextColor={feedColors.textMuted}
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {filters.search ? (
              <Pressable onPress={() => setSearch("")} style={styles.searchClearBtn}>
                <X color={feedColors.textMuted} size={16} />
              </Pressable>
            ) : null}
          </View>

          {/* Filter Button with Badge */}
          <Pressable
            onPress={() => setFilterModalOpen(true)}
            style={styles.filterBtn}
            accessibilityRole="button"
            accessibilityLabel="Open filters modal"
          >
            <SlidersHorizontal color={feedColors.text} size={20} />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Sub-Header: Area Selector Pill & Type Chips */}
        <View style={styles.areaPillRow}>
          {/* Area Selector Pill */}
          <Pressable
            onPress={() => setAreaPickerOpen(true)}
            style={styles.areaPill}
            accessibilityRole="button"
            accessibilityLabel={`Selected area: ${selectedAreaName}`}
          >
            <MapPin color={feedColors.primary} size={14} />
            <Text style={styles.areaPillText} numberOfLines={1}>
              {selectedAreaName}
            </Text>
          </Pressable>

          {/* Quick Listing Type Chips (All, Rent, Sale) */}
          <View style={styles.quickChipsWrap}>
            {(["all", "rent", "sale"] as const).map((typeKey) => {
              const isActive =
                typeKey === "all"
                  ? !filters.listing_type
                  : filters.listing_type === typeKey;

              return (
                <Pressable
                  key={typeKey}
                  onPress={() =>
                    setListingType(typeKey === "all" ? undefined : typeKey)
                  }
                  style={[styles.quickChip, isActive && styles.quickChipActive]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      isActive && styles.quickChipTextActive,
                    ]}
                  >
                    {typeKey === "all"
                      ? "All"
                      : typeKey === "rent"
                      ? "Rent"
                      : "Sale"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* ─── 2. Main Feed Content ────────────────────────────────────────── */}
      {viewMode === "list" ? (
        loading && properties.length === 0 ? (
          <PropertySkeletonFeed />
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={refresh} style={styles.retryBtn}>
              <RotateCcw color={feedColors.primary} size={16} />
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : properties.length === 0 ? (
          <View style={styles.centerContainer}>
            <Building2 color={feedColors.border} size={56} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query, location, or filter preferences.
            </Text>
            <Pressable onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={feedColors.primary}
                colors={[feedColors.primary]}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => <PropertyCard property={item} />}
            ListFooterComponent={
              fetchingNextPage ? (
                <View style={styles.footerSpinner}>
                  <ActivityIndicator color={feedColors.primary} size="small" />
                </View>
              ) : null
            }
          />
        )
      ) : (
        /* Map View Fallback / Representation */
        <View style={styles.mapViewContainer}>
          <Text style={styles.mapTitle}>Property Map View</Text>
          <Text style={styles.mapSubtitle}>
            Showing {properties.length} properties around {selectedAreaName}
          </Text>
          <FlatList
            data={properties}
            keyExtractor={(item) => `map-${item.id}`}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => <PropertyCard property={item} />}
          />
        </View>
      )}

      {/* ─── 3. Floating Action Button (Map/List Toggle) ────────────────── */}
      <MapListToggle viewMode={viewMode} onToggle={toggleViewMode} />

      {/* ─── 4. Modals ───────────────────────────────────────────────────── */}
      {/* Area Picker Modal */}
      <AreaPicker
        visible={isAreaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        onSelect={handleSelectArea}
        selectedArea={null}
      />

      {/* Filter Drawer Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.backdropPressable}
            onPress={() => setFilterModalOpen(false)}
          />
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Properties</Text>
              <Pressable
                onPress={() => setFilterModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X color={feedColors.textMuted} size={20} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Category Type */}
              <Text style={styles.filterLabel}>Property Type</Text>
              <View style={styles.filterChipGrid}>
                {["residential", "commercial", "land", "parking"].map((t) => {
                  const active = filters.type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setType(active ? undefined : (t as any))}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                    >
                      <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Bedrooms */}
              <Text style={styles.filterLabel}>Minimum Bedrooms</Text>
              <View style={styles.filterChipGrid}>
                {[1, 2, 3, 4, 5].map((b) => {
                  const active = filters.bedrooms === b;
                  return (
                    <Pressable
                      key={b}
                      onPress={() => setBedrooms(active ? undefined : b)}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                    >
                      <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                        {b}+ Beds
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable onPress={resetFilters} style={styles.resetModalBtn}>
                <Text style={styles.resetModalBtnText}>Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterModalOpen(false)}
                style={styles.applyModalBtn}
              >
                <Text style={styles.applyModalBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: feedColors.background,
  },

  // Sticky Header
  headerContainer: {
    backgroundColor: feedColors.white,
    borderBottomWidth: 1,
    borderBottomColor: feedColors.border,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInputWrap: {
    flex: 1,
    height: 44,
    backgroundColor: feedColors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: feedColors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: feedColors.text,
  },
  searchClearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: feedColors.background,
    borderWidth: 1,
    borderColor: feedColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e53935",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: feedColors.white,
    fontSize: 10,
    fontWeight: "800",
  },

  // Area Pill & Chips
  areaPillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  areaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: feedColors.primaryLight,
    borderWidth: 1,
    borderColor: feedColors.primary,
    maxWidth: 160,
  },
  areaPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: feedColors.primaryDark,
  },
  quickChipsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: feedColors.background,
    borderWidth: 1,
    borderColor: feedColors.border,
  },
  quickChipActive: {
    backgroundColor: feedColors.primary,
    borderColor: feedColors.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: feedColors.textSecondary,
  },
  quickChipTextActive: {
    color: feedColors.white,
  },

  // List Layout
  listPadding: {
    padding: 16,
    paddingBottom: 80,
  },
  footerSpinner: {
    paddingVertical: 20,
    alignItems: "center",
  },

  // Center States
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: feedColors.primaryLight,
    borderWidth: 1,
    borderColor: feedColors.primary,
  },
  retryBtnText: {
    color: feedColors.primaryDark,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: feedColors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: feedColors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: feedColors.primary,
  },
  resetBtnText: {
    color: feedColors.white,
    fontWeight: "700",
    fontSize: 13,
  },

  // Map View Container
  mapViewContainer: {
    flex: 1,
    paddingTop: 10,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: feedColors.text,
    paddingHorizontal: 16,
  },
  mapSubtitle: {
    fontSize: 12,
    color: feedColors.textMuted,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  filterModalContent: {
    backgroundColor: feedColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: feedColors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: feedColors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    gap: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: feedColors.text,
    marginBottom: 8,
  },
  filterChipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: feedColors.background,
    borderWidth: 1,
    borderColor: feedColors.border,
  },
  modalChipActive: {
    backgroundColor: feedColors.primaryLight,
    borderColor: feedColors.primary,
  },
  modalChipText: {
    fontSize: 13,
    color: feedColors.textSecondary,
    fontWeight: "500",
  },
  modalChipTextActive: {
    color: feedColors.primaryDark,
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: feedColors.border,
  },
  resetModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: feedColors.border,
  },
  resetModalBtnText: {
    color: feedColors.textSecondary,
    fontWeight: "700",
  },
  applyModalBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    backgroundColor: feedColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyModalBtnText: {
    color: feedColors.white,
    fontWeight: "700",
  },
});
