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
  propertyType: string; // "all", "apartment", "house", "commercial", "land", "short-let"
  addedToSite: string; // "", "24h", "3d", "7d", "14d"
  includeSold: boolean;
  verifiedOnly: boolean;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  query: string;
  purpose: "all" | "sale" | "rent" | "short-let";
  subtype?: string;
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
            minHeight: 42,
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
            display: "block",
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
      filters.purpose === "short-let"
        ? "for short-let"
        : filters.purpose === "rent"
        ? "to rent"
        : filters.purpose === "sale"
        ? "for sale"
        : "for sale & rent";
    const place = filters.query?.trim() || locationName || "Bangladesh";
    return `Find property ${purposeText} in ${place}`;
  };

  return (
    <View style={[styles.card, isPhone && styles.cardPhone]}>
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
            <Text style={[styles.headingText, isPhone && styles.headingTextPhone]}>
              {getHeading()}
            </Text>
            <Edit3 color="#5C6B66" size={16} style={styles.editIcon} />
          </Pressable>
        )}
      </View>

      {/* ─── Grid Controls (Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col) ─────────────── */}
      {isPhone ? (
        /* Mobile Layout: 1 Column Stack */
        <View style={styles.gridPhone}>
          <View style={styles.colFull}>
            <Text style={styles.fieldLabel}>Search radius</Text>
            <NativeSelect
              value={filters.radius}
              options={RADIUS_OPTIONS}
              onChange={(val) => handleUpdate({ radius: val })}
            />
          </View>

          <View style={styles.colFull}>
            <Text style={styles.fieldLabel}>Property types</Text>
            <NativeSelect
              value={filters.propertyType}
              options={PROPERTY_TYPE_OPTIONS}
              onChange={(val) => handleUpdate({ propertyType: val })}
            />
          </View>

          {/* Added to site with Checkbox directly underneath */}
          <View style={styles.colFull}>
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

          <View style={styles.colFull}>
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

          <View style={styles.colFull}>
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

          {/* Search Button */}
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
      ) : isTablet ? (
        /* Tablet Layout: 2 Columns × 3 Rows */
        <View style={styles.gridTablet}>
          {/* Row 1 */}
          <View style={styles.rowTablet}>
            <View style={styles.colTabletHalf}>
              <Text style={styles.fieldLabel}>Search radius</Text>
              <NativeSelect
                value={filters.radius}
                options={RADIUS_OPTIONS}
                onChange={(val) => handleUpdate({ radius: val })}
              />
            </View>
            <View style={styles.colTabletHalf}>
              <Text style={styles.fieldLabel}>Property types</Text>
              <NativeSelect
                value={filters.propertyType}
                options={PROPERTY_TYPE_OPTIONS}
                onChange={(val) => handleUpdate({ propertyType: val })}
              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.rowTablet}>
            <View style={styles.colTabletHalf}>
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
            <View style={styles.colTabletHalf}>
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
          </View>

          {/* Row 3 */}
          <View style={styles.rowTablet}>
            <View style={styles.colTabletHalf}>
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
            <View style={[styles.colTabletHalf, styles.actionCol]}>
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
      ) : (
        /* Desktop Layout: 3 Columns × 2 Rows */
        <View style={styles.gridDesktop}>
          {/* Row 1 */}
          <View style={styles.rowDesktop}>
            <View style={styles.colDesktopThird}>
              <Text style={styles.fieldLabel}>Search radius</Text>
              <NativeSelect
                value={filters.radius}
                options={RADIUS_OPTIONS}
                onChange={(val) => handleUpdate({ radius: val })}
              />
            </View>
            <View style={styles.colDesktopThird}>
              <Text style={styles.fieldLabel}>Property types</Text>
              <NativeSelect
                value={filters.propertyType}
                options={PROPERTY_TYPE_OPTIONS}
                onChange={(val) => handleUpdate({ propertyType: val })}
              />
            </View>
            <View style={styles.colDesktopThird}>
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
          </View>

          {/* Row 2 */}
          <View style={styles.rowDesktop}>
            <View style={styles.colDesktopThird}>
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
            <View style={styles.colDesktopThird}>
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
            <View style={[styles.colDesktopThird, styles.actionCol]}>
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
      )}
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
  cardPhone: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 16,
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
  headingTextPhone: {
    fontSize: 18,
    lineHeight: 24,
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
  gridDesktop: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  rowDesktop: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  colDesktopThird: {
    flex: 1,
    minWidth: 0,
  },
  gridTablet: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  rowTablet: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  colTabletHalf: {
    flex: 1,
    minWidth: 0,
  },
  gridPhone: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  colFull: {
    width: "100%",
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
    height: 42,
    minHeight: 42,
  },
  chevronOverlay: {
    position: "absolute",
    right: 12,
    top: 13,
    height: 16,
    width: 16,
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: 0,
  },
  rangeDash: {
    fontSize: 15,
    color: "#5C6B66",
    fontWeight: "600",
    paddingHorizontal: 2,
  },
  checkboxRowContainer: {
    marginTop: 4,
    minHeight: 24,
    justifyContent: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
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
    height: 42,
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
