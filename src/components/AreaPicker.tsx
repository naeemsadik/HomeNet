import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  MapPin,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Building,
  Navigation,
} from "lucide-react-native";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { useAreaPicker } from "@/hooks/useAreaPicker";
import type { Area } from "@/types/api";

export interface AreaPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (area: Area | null, path: Area[]) => void;
  selectedArea: Area | null;
  initialCity?: string;
}

// ─── Skeleton Loading Placeholder ──────────────────────────────────────────

function AreaSkeleton() {
  const [pulseAnim] = useState(new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Animated.View
          key={i}
          style={[styles.skeletonItem, { opacity: pulseAnim }]}
        >
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonTextWrap}>
            <View style={styles.skeletonLineLong} />
            <View style={styles.skeletonLineShort} />
          </View>
          <View style={styles.skeletonArrow} />
        </Animated.View>
      ))}
    </View>
  );
}

// ─── Main Area Picker Component ────────────────────────────────────────────

export function AreaPicker({
  visible,
  onClose,
  onSelect,
  selectedArea,
  initialCity,
}: AreaPickerProps) {
  const { width } = useWindowDimensions();
  const isPhone = width <= 600;

  const {
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
  } = useAreaPicker({ initialCity });

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const flatListRef = React.useRef<FlatList>(null);
  const touchStartY = React.useRef(0);

  // Helper to construct the full path list for a selected area
  const getPathForArea = (area: Area): Area[] => {
    // If we have an active navigation drill down
    if (navPath.length > 0) {
      const lastInPath = navPath[navPath.length - 1];
      if (area.id === lastInPath.id) {
        return navPath;
      }
      if (area.parent_area_id === lastInPath.id) {
        return [...navPath, area];
      }
    }
    
    return [area];
  };

  // Handle final selection of an area
  const handleSelectArea = (area: Area) => {
    const fullPath = getPathForArea(area);
    onSelect(area, fullPath);
    onClose();
  };

  // Clear current selection completely
  const handleClearSelection = () => {
    onSelect(null, []);
    onClose();
  };

  // Select the current path hierarchy level as a whole (e.g. Select entire City or Zone)
  const handleSelectCurrentLevel = () => {
    if (navPath.length > 0) {
      handleSelectArea(navPath[navPath.length - 1]);
    } else {
      handleClearSelection();
    }
  };

  // Reset focus index when items list changes
  useEffect(() => {
    setFocusedIndex(areas.length > 0 ? 0 : -1);
  }, [areas]);

  // Scroll to focused item on keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: focusedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (err) {
        // Safe catch for cases where the FlatList is not fully rendered
      }
    }
  }, [focusedIndex]);

  // Web keyboard event listener
  useEffect(() => {
    if (Platform.OS !== "web" || !visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (areas.length > 0 ? (prev + 1) % areas.length : -1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (areas.length > 0 ? (prev - 1 + areas.length) % areas.length : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < areas.length) {
          const selectedItem = areas[focusedIndex];
          const isLeaf = (selectedItem._count?.children ?? 0) === 0;
          if (isLeaf) {
            handleSelectArea(selectedItem);
          } else {
            drillDown(selectedItem);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, areas, focusedIndex, onClose, drillDown]);

  // Touch Swipe-down to close on mobile
  const handleTouchStart = (e: any) => {
    if (isPhone) {
      touchStartY.current = e.nativeEvent.pageY;
    }
  };

  const handleTouchEnd = (e: any) => {
    if (isPhone) {
      const deltaY = e.nativeEvent.pageY - touchStartY.current;
      if (deltaY > 60) {
        onClose();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, !isPhone && styles.modalOverlayDesktop]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        
        <View 
          style={[styles.sheetContent, isPhone ? styles.sheetPhone : styles.sheetTablet]}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe drag handle on mobile */}
          {isPhone ? (
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
          ) : null}
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MapPin size={20} color={colors.green} />
              <Text style={styles.headerTitle}>Select Location</Text>
            </View>
            <View style={styles.headerActions}>
              {selectedArea ? (
                <Pressable
                  onPress={handleClearSelection}
                  style={[styles.clearSelectBtn, webPointer]}
                >
                  <Text style={styles.clearSelectText}>Clear Selected</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={onClose}
                style={[styles.closeButton, webPointer]}
                accessibilityLabel="Close location picker"
              >
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>
          </View>

          {/* City Selection Chips */}
          <View style={styles.chipsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              <Pressable
                onPress={() => selectCity(null)}
                style={[
                  styles.chip,
                  selectedCity === null && styles.chipActive,
                  webPointer,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCity === null && styles.chipTextActive,
                  ]}
                >
                  All Cities
                </Text>
              </Pressable>

              {availableCities.map((city) => {
                const isActive = selectedCity === city;
                return (
                  <Pressable
                    key={city}
                    onPress={() => selectCity(city)}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                      webPointer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search size={18} color={colors.muted} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search zones, neighborhoods or areas..."
                placeholderTextColor="#8B9892"
                style={styles.searchInput}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={[styles.clearSearchBtn, webPointer]}
                >
                  <X size={16} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Breadcrumbs Navigation Stack */}
          {navPath.length > 0 || selectedCity ? (
            <View style={styles.breadcrumbBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.breadcrumbScroll}
              >
                <Pressable
                  onPress={resetNav}
                  style={[styles.breadcrumbBtn, webPointer]}
                >
                  <Text style={styles.breadcrumbTextHome}>Root</Text>
                </Pressable>

                {selectedCity ? (
                  <>
                    <ChevronRight size={12} color={colors.muted} style={styles.breadDivider} />
                    <Pressable
                      onPress={resetNav}
                      style={[styles.breadcrumbBtn, webPointer]}
                    >
                      <Text style={styles.breadcrumbText}>{selectedCity}</Text>
                    </Pressable>
                  </>
                ) : null}

                {navPath.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ChevronRight size={12} color={colors.muted} style={styles.breadDivider} />
                    <Pressable
                      onPress={() => navigateToBreadcrumb(index)}
                      disabled={index === navPath.length - 1}
                      style={[
                        styles.breadcrumbBtn,
                        index === navPath.length - 1 && styles.breadcrumbBtnDisabled,
                        webPointer,
                      ]}
                    >
                      <Text
                        style={[
                          styles.breadcrumbText,
                          index === navPath.length - 1 && styles.breadcrumbTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  </React.Fragment>
                ))}
              </ScrollView>

              {navPath.length > 0 ? (
                <Pressable
                  onPress={drillUp}
                  style={[styles.backStepBtn, webPointer]}
                >
                  <ChevronLeft size={16} color={colors.green} />
                  <Text style={styles.backStepText}>Back</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Current Selection / Action Banner */}
          {navPath.length > 0 && !searchQuery ? (
            <View style={styles.selectionBanner}>
              <Text style={styles.selectionBannerLabel}>
                Current level:{" "}
                <Text style={styles.selectionBannerValue}>
                  {navPath.length > 0
                    ? navPath[navPath.length - 1].name
                    : selectedCity}
                </Text>
              </Text>
              <Pressable
                onPress={handleSelectCurrentLevel}
                style={[styles.selectionBannerBtn, webPointer]}
              >
                <Check size={14} color="#FFFFFF" />
                <Text style={styles.selectionBannerBtnText}>Confirm This Level</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Main List */}
          <View style={styles.listContainer}>
            {loading ? (
              <AreaSkeleton />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={resetNav}
                  style={[styles.retryButton, webPointer]}
                >
                  <Text style={styles.retryButtonText}>Go to Root</Text>
                </Pressable>
              </View>
            ) : areas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Building size={40} color={colors.line} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No locations found</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your search or checking another city.
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={areas}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 32 }}
                onScrollToIndexFailed={(info) => {
                  flatListRef.current?.scrollToOffset({
                    offset: info.highestMeasuredFrameIndex * info.averageItemLength,
                    animated: false,
                  });
                }}
                renderItem={({ item, index }) => {
                  const isSelected = selectedArea?.id === item.id;
                  const isKeyboardFocused = index === focusedIndex;
                  const isLeaf = (item._count?.children ?? 0) === 0;

                  return (
                    <View 
                      style={[
                        styles.areaRow, 
                        isSelected && styles.areaRowSelected,
                        isKeyboardFocused && styles.areaRowFocused,
                      ]}
                    >
                      {/* Left: Tapping name/row selects it if leaf, or drills down if parent */}
                      <Pressable
                        style={[styles.areaInfoPressable, webPointer]}
                        onPress={() => {
                          if (searchQuery || isLeaf) {
                            // Leaf node or search result: direct select
                            handleSelectArea(item);
                          } else {
                            // Non-leaf node: drill down
                            drillDown(item);
                          }
                        }}
                      >
                        <MapPin
                          size={16}
                          color={isSelected ? colors.green : colors.muted}
                          style={styles.areaRowIcon}
                        />
                        <View style={styles.areaTextContainer}>
                          <Text
                            style={[
                              styles.areaName,
                              isSelected && styles.areaNameSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                          <Text style={styles.areaCity}>
                            {item.city || "Area"}
                          </Text>
                        </View>
                      </Pressable>

                      {/* Right: Actions */}
                      <View style={styles.actionCol}>
                        {/* If it is a parent node, offer a direct select button */}
                        {!isLeaf ? (
                          <Pressable
                            onPress={() => handleSelectArea(item)}
                            style={[
                              styles.directSelectBtn,
                              isSelected && styles.directSelectBtnActive,
                              webPointer,
                            ]}
                            accessibilityLabel={`Select ${item.name}`}
                          >
                            {isSelected ? (
                              <Check size={14} color="#FFFFFF" />
                            ) : (
                              <Text style={styles.directSelectText}>Select</Text>
                            )}
                          </Pressable>
                        ) : null}

                        {/* Drill Down arrow (if parent and not searching) */}
                        {!isLeaf && !searchQuery ? (
                          <Pressable
                            onPress={() => drillDown(item)}
                            style={[styles.drillBtn, webPointer]}
                            accessibilityLabel={`View child locations in ${item.name}`}
                          >
                            <ChevronRight size={16} color={colors.muted} />
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 40, 32, 0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalOverlayDesktop: {
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    maxHeight: "90%",
    ...shadow,
  },
  sheetPhone: {
    height: "85%",
  },
  sheetTablet: {
    height: 520,
    width: 480,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearSelectBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearSelectText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.coral,
  },
  closeButton: {
    padding: 6,
    borderRadius: 99,
    backgroundColor: colors.soft,
  },

  // City selection chips
  chipsSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.greenLight,
    borderColor: colors.green,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.greenDark,
    fontFamily: fonts.bold,
  },

  // Search input
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.soft,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.ink,
  },
  clearSearchBtn: {
    padding: 4,
  },

  // Breadcrumbs Navigation
  breadcrumbBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.soft,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  breadcrumbScroll: {
    alignItems: "center",
    gap: 4,
  },
  breadcrumbBtn: {
    paddingVertical: 4,
  },
  breadcrumbBtnDisabled: {
    opacity: 0.8,
  },
  breadcrumbTextHome: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  breadcrumbText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  breadcrumbTextActive: {
    color: colors.greenDark,
    fontFamily: fonts.bold,
  },
  breadDivider: {
    marginHorizontal: 2,
  },
  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
  },
  backStepText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.green,
  },

  // Selection Banner
  selectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.greenLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  selectionBannerLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.greenDark,
    flex: 1,
    marginRight: 10,
  },
  selectionBannerValue: {
    fontFamily: fonts.bold,
  },
  selectionBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.green,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectionBannerBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.bold,
  },

  // Main List Layout
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
    paddingLeft: 8,
  },
  areaRowSelected: {
    borderBottomColor: colors.green,
    backgroundColor: colors.greenLight + "30",
  },
  areaRowFocused: {
    backgroundColor: colors.soft,
    borderLeftColor: colors.green,
  },
  areaInfoPressable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
    paddingVertical: 4,
  },
  areaRowIcon: {
    marginRight: 12,
  },
  areaTextContainer: {
    flex: 1,
  },
  areaName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  areaNameSelected: {
    color: colors.green,
    fontFamily: fonts.bold,
  },
  areaCity: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 2,
    textTransform: "lowercase",
  },
  actionCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  directSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#FFFFFF",
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  directSelectBtnActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  directSelectText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  drillBtn: {
    padding: 4,
  },

  // Skeletons
  skeletonContainer: {
    paddingTop: 10,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.soft,
    marginRight: 12,
  },
  skeletonTextWrap: {
    flex: 1,
    gap: 6,
  },
  skeletonLineLong: {
    width: "60%",
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.soft,
  },
  skeletonLineShort: {
    width: "30%",
    height: 8,
    borderRadius: 3,
    backgroundColor: colors.soft,
  },
  skeletonArrow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.soft,
  },

  // Errors / Empty
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.coral,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

