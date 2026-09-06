import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronDown, Edit3, HelpCircle, Search, Sparkles } from "lucide-react-native";
import { fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export interface RightmoveFilters {
  radius: string; // "0", "1", "3", "5", "10", "20"
  propertyType: string; // "all", "apartment", "house", "commercial", "land"
  addedToSite: string; // "", "24h", "3d", "7d", "14d"
  includeSold: boolean;
  verifiedOnly: boolean;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  query: string;
  purpose: "all" | "sale" | "rent";
}

interface RightmoveFilterCardProps {
  filters: RightmoveFilters;
  onFilterChange: (newFilters: RightmoveFilters) => void;
  onSearch: (filters: RightmoveFilters) => void;
  locationName?: string;
  totalResults?: number;
}

const RADIUS_OPTIONS = [
  { label: "This area only", value: "" },
  { label: "+ 1 km", value: "1" },
  { label: "+ 3 km", value: "3" },
  { label: "+ 5 km", value: "5" },
  { label: "+ 10 km", value: "10" },
  { label: "+ 20 km", value: "20" },
];

const PROPERTY_TYPE_OPTIONS = [
  { label: "Any", value: "all" },
  { label: "Apartment / Flat", value: "apartment" },
  { label: "House / Villa", value: "house" },
  { label: "Commercial", value: "commercial" },
  { label: "Land / Plot", value: "land" },
];

const ADDED_TO_SITE_OPTIONS = [
  { label: "Anytime", value: "" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 3 days", value: "3d" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
];

const MIN_PRICE_OPTIONS = [
  { label: "No min", value: "" },
  { label: "৳10,000", value: "10000" },
  { label: "৳25,000", value: "25000" },
  { label: "৳50,000", value: "50000" },
  { label: "৳1 Lakh", value: "100000" },
  { label: "৳25 Lakh", value: "2500000" },
  { label: "৳50 Lakh", value: "5000000" },
  { label: "৳1 Crore", value: "10000000" },
  { label: "৳2.5 Crore", value: "25000000" },
  { label: "৳5 Crore", value: "50000000" },
];

const MAX_PRICE_OPTIONS = [
  { label: "No max", value: "" },
  { label: "৳25,000", value: "25000" },
  { label: "৳50,000", value: "50000" },
  { label: "৳1 Lakh", value: "100000" },
  { label: "৳25 Lakh", value: "2500000" },
  { label: "৳50 Lakh", value: "5000000" },
  { label: "৳1 Crore", value: "10000000" },
  { label: "৳2.5 Crore", value: "25000000" },
  { label: "৳5 Crore", value: "50000000" },
  { label: "৳10 Crore+", value: "100000000" },
];

const MIN_BED_OPTIONS = [
  { label: "No min", value: "" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
];

const MAX_BED_OPTIONS = [
  { label: "No max", value: "" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5" },
];

function NativeSelect({
  value,
  options,
  onChange,
  style,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  style?: any;
}) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.selectWrapper, style]}>
        {/* @ts-ignore Web-only select element for native browser dropdown support */}
        <select
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 42,
            padding: "0 34px 0 14px",
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #D0D5DD",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: fonts.regular,
            color: "#0B1A17",
            fontWeight: "500",
            appearance: "none",
            WebkitAppearance: "none",
            outline: "none",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <View style={styles.chevronOverlay} pointerEvents="none">
          <ChevronDown color="#0B1A17" size={16} strokeWidth={2.2} />
        </View>
      </View>
    );
  }

  // Fallback for native Android/iOS
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <View style={[styles.nativeSelectWrap, style]}>
      <Text style={styles.nativeSelectText} numberOfLines={1}>
        {current.label}
      </Text>
      <ChevronDown color="#0B1A17" size={16} strokeWidth={2.2} />
    </View>
  );
}

export function RightmoveFilterCard({
  filters,
  onFilterChange,
  onSearch,
  locationName = "Dhaka",
  totalResults,
}: RightmoveFilterCardProps) {
  const { isPhone, isTablet, width } = useResponsive();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customLocation, setCustomLocation] = useState(filters.query || locationName);
  const isDesktop = !isPhone && !isTablet;

  const handleUpdate = (patch: Partial<RightmoveFilters>) => {
    const updated = { ...filters, ...patch };
    onFilterChange(updated);
  };

  const handleLocationSubmit = () => {
    setIsEditingTitle(false);
    handleUpdate({ query: customLocation });
    onSearch({ ...filters, query: customLocation });
  };

  const getHeading = () => {
    const purposeText =
      filters.purpose === "rent"
        ? "to rent"
        : filters.purpose === "sale"
        ? "for sale"
        : "for sale & rent";
    const place = filters.query?.trim() || locationName || "Bangladesh";
    return `Find property ${purposeText} in ${place}`;
  };

  return (
    <View style={styles.card}>
      {/* ─── Header: Find property for sale in [Location] ───────────────── */}
      <View style={styles.headerRow}>
        {isEditingTitle ? (
          <View style={styles.editTitleRow}>
            <TextInput
              value={customLocation}
              onChangeText={setCustomLocation}
              onSubmitEditing={handleLocationSubmit}
              placeholder="Enter location, area or project..."
              placeholderTextColor="#5C6B66"
              style={styles.editTitleInput}
              autoFocus
            />
            <Pressable
              onPress={handleLocationSubmit}
              style={[styles.saveTitleBtn, webPointer]}
            >
              <Text style={styles.saveTitleBtnText}>Update</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsEditingTitle(true)}
            style={[styles.titlePressable, webPointer]}
            accessibilityRole="button"
            accessibilityLabel="Click to edit location"
          >
            <Text style={styles.headingText}>{getHeading()}</Text>
            <Edit3 color="#5C6B66" size={16} style={styles.editIcon} />
          </Pressable>
        )}
      </View>

      {/* ─── Grid Controls (3 columns x 2 rows on desktop) ─────────────── */}
      <View style={[styles.grid, isDesktop && styles.gridDesktop, isPhone && styles.gridPhone]}>
        {/* ROW 1, COL 1: Search radius */}
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Search radius</Text>
          <NativeSelect
            value={filters.radius}
            options={RADIUS_OPTIONS}
            onChange={(val) => handleUpdate({ radius: val })}
          />
        </View>

        {/* ROW 1, COL 2: Property types */}
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Property types</Text>
          <NativeSelect
            value={filters.propertyType}
            options={PROPERTY_TYPE_OPTIONS}
            onChange={(val) => handleUpdate({ propertyType: val })}
          />
        </View>

        {/* ROW 1, COL 3: Added to site & Checkbox */}
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Added to site</Text>
          <NativeSelect
            value={filters.addedToSite}
            options={ADDED_TO_SITE_OPTIONS}
            onChange={(val) => handleUpdate({ addedToSite: val })}
          />

          {/* Include Under Offer, Sold STC Checkbox */}
          <View style={styles.checkboxRowContainer}>
            <Pressable
              onPress={() => handleUpdate({ includeSold: !filters.includeSold })}
              style={[styles.checkboxRow, webPointer]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: filters.includeSold }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  filters.includeSold && styles.checkboxBoxChecked,
                ]}
              >
                {filters.includeSold ? (
                  <Check color="#FFFFFF" size={13} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>
                Include Under Offer, Sold STC
              </Text>
              <Text style={styles.helpBadge}>(?)</Text>
            </Pressable>
          </View>
        </View>

        {/* ROW 2, COL 1: Price range (৳) */}
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Price range (৳)</Text>
          <View style={styles.rangeRow}>
            <NativeSelect
              value={filters.minPrice}
              options={MIN_PRICE_OPTIONS}
              onChange={(val) => handleUpdate({ minPrice: val })}
              style={styles.rangeSelect}
            />
            <Text style={styles.rangeDash}>-</Text>
            <NativeSelect
              value={filters.maxPrice}
              options={MAX_PRICE_OPTIONS}
              onChange={(val) => handleUpdate({ maxPrice: val })}
              style={styles.rangeSelect}
            />
          </View>
        </View>

        {/* ROW 2, COL 2: No. of bedrooms */}
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>No. of bedrooms</Text>
          <View style={styles.rangeRow}>
            <NativeSelect
              value={filters.minBedrooms}
              options={MIN_BED_OPTIONS}
              onChange={(val) => handleUpdate({ minBedrooms: val })}
              style={styles.rangeSelect}
            />
            <Text style={styles.rangeDash}>-</Text>
            <NativeSelect
              value={filters.maxBedrooms}
              options={MAX_BED_OPTIONS}
              onChange={(val) => handleUpdate({ maxBedrooms: val })}
              style={styles.rangeSelect}
            />
          </View>
        </View>

        {/* ROW 2, COL 3: Search properties button */}
        <View style={[styles.col, styles.actionCol]}>
          <Pressable
            onPress={() => onSearch(filters)}
            style={({ pressed }) => [
              styles.searchBtn,
              webPointer,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Search properties"
          >
            <Text style={styles.searchBtnText}>Search properties</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F4F5F8",
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    width: "100%",
  },
  headerRow: {
    marginBottom: 20,
  },
  titlePressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  headingText: {
    fontFamily: fonts.semiBold,
    fontSize: 23,
    fontWeight: "700",
    color: "#0B1A17",
    letterSpacing: -0.3,
  },
  editIcon: {
    opacity: 0.6,
  },
  editTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 600,
  },
  editTitleInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#0F6D55",
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: "#0B1A17",
  },
  saveTitleBtn: {
    backgroundColor: "#0F6D55",
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveTitleBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    columnGap: 24,
  },
  gridDesktop: {
    display: "flex",
  },
  gridPhone: {
    flexDirection: "column",
    gap: 14,
  },
  col: {
    flex: 1,
    minWidth: 260,
    maxWidth: "100%",
  },
  actionCol: {
    justifyContent: "flex-end",
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E38",
    marginBottom: 7,
  },
  selectWrapper: {
    position: "relative",
    width: "100%",
  },
  chevronOverlay: {
    position: "absolute",
    right: 12,
    top: 13,
  },
  nativeSelectWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
    paddingHorizontal: 14,
  },
  nativeSelectText: {
    fontSize: 14,
    color: "#0B1A17",
    fontFamily: fonts.regular,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  rangeSelect: {
    flex: 1,
  },
  rangeDash: {
    fontSize: 15,
    color: "#5C6B66",
    fontWeight: "600",
    paddingHorizontal: 2,
  },
  checkboxRowContainer: {
    marginTop: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxBox: {
    width: 19,
    height: 19,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#0F6D55",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  checkboxLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#2C3E38",
    fontWeight: "500",
  },
  helpBadge: {
    fontSize: 12,
    color: "#0F6D55",
    fontWeight: "600",
  },
  searchBtn: {
    height: 44,
    backgroundColor: "#00CF92", // Rightmove vibrant emerald green
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "rgba(0, 207, 146, 0.4)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBtnText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "700",
  },
});
