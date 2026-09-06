import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, MapPin, Sparkles, X } from "lucide-react-native";
import { fonts, webPointer } from "@/theme";

export type FilterState = {
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null; // null = Any, 1, 2, 3, 4 (for 4+)
  bathrooms: number | null; // null = Any, 1, 2, 3 (for 3+)
  amenities: string[];
  verifiedOnly: boolean;
};

export const defaultFilterState: FilterState = {
  location: "Gulshan, Dhaka",
  minPrice: "",
  maxPrice: "",
  bedrooms: null,
  bathrooms: null,
  amenities: [],
  verifiedOnly: false,
};

const AMENITY_OPTIONS = [
  "Lift",
  "Parking",
  "Generator",
  "Gym",
  "Pool",
  "Security",
  "Garden",
  "Smart Home",
];

const BEDROOM_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const BATHROOM_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3+", value: 3 },
];

export function AdvancedFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  resultCount = 8,
}: {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset?: () => void;
  resultCount?: number;
}) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const toggleAmenity = (amenity: string) => {
    setLocalFilters((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleReset = () => {
    setLocalFilters(defaultFilterState);
    if (onReset) {
      onReset();
    }
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advanced filters</Text>
            <Pressable
              accessibilityLabel="Close advanced filters"
              onPress={onClose}
              style={[styles.closeButton, webPointer]}
            >
              <X color="#5C6B66" size={20} />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Location */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <MapPin color="#0B1A17" size={16} />
                <Text style={styles.sectionLabel}>Location</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={(text) =>
                    setLocalFilters((prev) => ({ ...prev, location: text }))
                  }
                  placeholder="Enter location (e.g. Gulshan, Dhaka)"
                  placeholderTextColor="rgba(11, 26, 23, 0.4)"
                  style={styles.textInput}
                  value={localFilters.location}
                />
              </View>
            </View>

            {/* Price range (৳) */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Price range (৳)</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputBox}>
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(val) =>
                      setLocalFilters((prev) => ({ ...prev, minPrice: val }))
                    }
                    placeholder="Min"
                    placeholderTextColor="rgba(11, 26, 23, 0.5)"
                    style={styles.priceInput}
                    value={localFilters.minPrice}
                  />
                </View>
                <Text style={styles.dashText}>–</Text>
                <View style={styles.priceInputBox}>
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(val) =>
                      setLocalFilters((prev) => ({ ...prev, maxPrice: val }))
                    }
                    placeholder="Max"
                    placeholderTextColor="rgba(11, 26, 23, 0.5)"
                    style={styles.priceInput}
                    value={localFilters.maxPrice}
                  />
                </View>
              </View>
            </View>

            {/* Bedrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bedrooms</Text>
              <View style={styles.optionsRow}>
                {BEDROOM_OPTIONS.map((opt) => {
                  const isSelected = localFilters.bedrooms === opt.value;
                  return (
                    <Pressable
                      key={`bed-${opt.label}`}
                      onPress={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          bedrooms: opt.value,
                        }))
                      }
                      style={[
                        styles.pillOptionButton,
                        isSelected && styles.pillOptionButtonActive,
                        webPointer,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillOptionText,
                          isSelected && styles.pillOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Bathrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bathrooms</Text>
              <View style={styles.optionsRow}>
                {BATHROOM_OPTIONS.map((opt) => {
                  const isSelected = localFilters.bathrooms === opt.value;
                  return (
                    <Pressable
                      key={`bath-${opt.label}`}
                      onPress={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          bathrooms: opt.value,
                        }))
                      }
                      style={[
                        styles.pillOptionButton,
                        isSelected && styles.pillOptionButtonActive,
                        webPointer,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillOptionText,
                          isSelected && styles.pillOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amenities</Text>
              <View style={styles.amenitiesWrap}>
                {AMENITY_OPTIONS.map((amenity) => {
                  const isSelected = localFilters.amenities.includes(amenity);
                  return (
                    <Pressable
                      key={amenity}
                      onPress={() => toggleAmenity(amenity)}
                      style={[
                        styles.amenityChip,
                        isSelected && styles.amenityChipActive,
                        webPointer,
                      ]}
                    >
                      <Text
                        style={[
                          styles.amenityChipText,
                          isSelected && styles.amenityChipTextActive,
                        ]}
                      >
                        {amenity}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Verified listings only */}
            <Pressable
              onPress={() =>
                setLocalFilters((prev) => ({
                  ...prev,
                  verifiedOnly: !prev.verifiedOnly,
                }))
              }
              style={[styles.verifiedRowCard, webPointer]}
            >
              <View style={styles.verifiedRowLeft}>
                <Sparkles color="#0F6D55" size={16} />
                <Text style={styles.verifiedRowLabel}>
                  Verified listings only
                </Text>
              </View>
              <View
                style={[
                  styles.checkboxBox,
                  localFilters.verifiedOnly && styles.checkboxBoxChecked,
                ]}
              >
                {localFilters.verifiedOnly ? (
                  <Check color="#FFFFFF" size={14} strokeWidth={2.5} />
                ) : null}
              </View>
            </Pressable>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleReset}
              style={[styles.resetButton, webPointer]}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              style={[styles.applyButton, webPointer]}
            >
              <Text style={styles.applyButtonText}>
                Show {resultCount} results
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backdropTouch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  modalCard: {
    width: "100%",
    maxWidth: 448,
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  headerTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.36,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F6F5",
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 16,
    height: 46.4,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  textInput: {
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 16,
    height: "100%",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputBox: {
    flex: 1,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 16,
    height: 46.4,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  priceInput: {
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 16,
    height: "100%",
  },
  dashText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pillOptionButton: {
    flex: 1,
    minHeight: 38.4,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pillOptionButtonActive: {
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  pillOptionText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  pillOptionTextActive: {
    color: "#FFFFFF",
  },
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  amenityChipActive: {
    backgroundColor: "#E7F2EE",
    borderColor: "#0F6D55",
  },
  amenityChipText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  amenityChipTextActive: {
    color: "#0F6D55",
  },
  verifiedRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 16,
  },
  verifiedRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedRowLabel: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#767676",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.05)",
  },
  resetButton: {
    flex: 1,
    height: 46.4,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  resetButtonText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    height: 46.4,
    borderRadius: 999,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
});
