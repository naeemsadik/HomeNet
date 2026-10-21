import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronDown, Edit3 } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export interface RightmoveFilters {
  radius: string; // "0", "1", "3", "5", "10", "20"
  propertyType: string; // "all" or an API PropertyType: "residential", "commercial", "land", "parking"
  addedToSite: string; // "", "24h", "3d", "7d", "14d"
  includeSold: boolean;
  verifiedOnly: boolean;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  query: string;
  purpose: "all" | "sale" | "rent" | "short-let" | "sold";
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

// Values are the API's `PropertyType` enum. "Apartment" and "house" are
// subtypes, not types: sending them as `type` makes the API reject the whole
// search with a 400. They come back as their own options once the API can
// filter by subtype (docs/BACKEND_REQUIREMENTS.md).
const PROPERTY_TYPE_OPTIONS = [
  { label: "Any", value: "all" },
  { label: "Flats & houses", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Land / Plot", value: "land" },
  { label: "Parking / Garage", value: "parking" },
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
            display: "block",
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
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customLocation, setCustomLocation] = useState(filters.query || locationName);
  const isDesktop = !isPhone && !isTablet;

  const radiusOptions = useMemo(
    () => [
      { label: t("search.rightmove.radiusOptions.thisArea"), value: "" },
      { label: t("search.rightmove.radiusOptions.plus1"), value: "1" },
      { label: t("search.rightmove.radiusOptions.plus3"), value: "3" },
      { label: t("search.rightmove.radiusOptions.plus5"), value: "5" },
      { label: t("search.rightmove.radiusOptions.plus10"), value: "10" },
      { label: t("search.rightmove.radiusOptions.plus20"), value: "20" },
    ],
    [t],
  );

  const propertyTypeOptions = useMemo(
    () => [
      { label: t("search.rightmove.typeOptions.any"), value: "all" },
      { label: t("search.rightmove.typeOptions.residential"), value: "residential" },
      { label: t("search.rightmove.typeOptions.commercial"), value: "commercial" },
      { label: t("search.rightmove.typeOptions.land"), value: "land" },
      { label: t("search.rightmove.typeOptions.parking"), value: "parking" },
    ],
    [t],
  );

  const addedToSiteOptions = useMemo(
    () => [
      { label: t("search.rightmove.addedOptions.anytime"), value: "" },
      { label: t("search.rightmove.addedOptions.last24h"), value: "24h" },
      { label: t("search.rightmove.addedOptions.last3d"), value: "3d" },
      { label: t("search.rightmove.addedOptions.last7d"), value: "7d" },
      { label: t("search.rightmove.addedOptions.last14d"), value: "14d" },
    ],
    [t],
  );

  const minPriceOptions = useMemo(
    () => [
      { label: t("search.rightmove.noMin"), value: "" },
      ...MIN_PRICE_OPTIONS.slice(1),
    ],
    [t],
  );

  const maxPriceOptions = useMemo(
    () => [
      { label: t("search.rightmove.noMax"), value: "" },
      ...MAX_PRICE_OPTIONS.slice(1),
    ],
    [t],
  );

  const minBedOptions = useMemo(
    () => [
      { label: t("search.rightmove.noMin"), value: "" },
      ...MIN_BED_OPTIONS.slice(1),
    ],
    [t],
  );

  const maxBedOptions = useMemo(
    () => [
      { label: t("search.rightmove.noMax"), value: "" },
      ...MAX_BED_OPTIONS.slice(1),
    ],
    [t],
  );

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
    const place = filters.query?.trim() || locationName || "Bangladesh";
    // Sold is a lookup, not a search — the verb changes with it.
    if (filters.purpose === "sold") return t("search.rightmove.headingSold", { location: place });
    if (filters.purpose === "short-let") return t("search.rightmove.headingShortLet", { location: place });
    if (filters.purpose === "rent") return t("search.rightmove.headingRent", { location: place });
    if (filters.purpose === "sale") return t("search.rightmove.headingSale", { location: place });
    return t("search.rightmove.headingAll", { location: place });
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
              placeholder={t("search.rightmove.locationPlaceholder")}
              placeholderTextColor="#5C6B66"
              style={styles.editTitleInput}
              autoFocus
            />
            <Pressable
              onPress={handleLocationSubmit}
              style={[styles.saveTitleBtn, webPointer]}
            >
              <Text style={styles.saveTitleBtnText}>{t("search.rightmove.update")}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsEditingTitle(true)}
            style={[styles.titlePressable, webPointer]}
            accessibilityRole="button"
            accessibilityLabel={t("search.rightmove.editLocationAria")}
          >
            <Text style={[styles.headingText, isPhone && styles.headingTextPhone]}>
              {getHeading()}
            </Text>
            <Edit3 color="#5C6B66" size={16} style={styles.editIcon} />
          </Pressable>
        )}
      </View>

      {/* ─── Grid Controls (3 columns x 2 rows on desktop) ─────────────── */}
      <View style={[styles.grid, isDesktop && styles.gridDesktop, !isDesktop && styles.gridResponsive]}>
        {/* ROW 1, COL 1: Search radius */}
        <View style={[styles.col, isDesktop ? styles.colDesktop : styles.colResponsive]}>
          <Text style={styles.fieldLabel}>{t("search.rightmove.searchRadius")}</Text>
          <NativeSelect
            value={filters.radius}
            options={radiusOptions}
            onChange={(val) => handleUpdate({ radius: val })}
          />
        </View>

        {/* ROW 1, COL 2: Property types */}
        <View style={[styles.col, isDesktop ? styles.colDesktop : styles.colResponsive]}>
          <Text style={styles.fieldLabel}>{t("search.rightmove.propertyTypes")}</Text>
          <NativeSelect
            value={filters.propertyType}
            options={propertyTypeOptions}
            onChange={(val) => handleUpdate({ propertyType: val })}
          />
        </View>

        {/* ROW 1, COL 3: Added to site & Checkbox */}
        <View style={[styles.col, isDesktop ? styles.colDesktop : styles.colResponsive]}>
          <Text style={styles.fieldLabel}>{t("search.rightmove.addedToSite")}</Text>
          <NativeSelect
            value={filters.addedToSite}
            options={addedToSiteOptions}
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
                  <Check color={colorTokens.onBrand} size={13} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>
                {t("search.rightmove.includeSold")}
              </Text>
              <Text style={styles.helpBadge}>(?)</Text>
            </Pressable>
          </View>
        </View>

        {/* ROW 2, COL 1: Price range (৳) */}
        <View style={[styles.col, isDesktop ? styles.colDesktop : styles.colResponsive]}>
          <Text style={styles.fieldLabel}>{t("search.rightmove.priceRange")}</Text>
          <View style={styles.rangeRow}>
            <NativeSelect
              value={filters.minPrice}
              options={minPriceOptions}
              onChange={(val) => handleUpdate({ minPrice: val })}
              style={styles.rangeSelect}
            />
            <Text style={styles.rangeDash}>-</Text>
            <NativeSelect
              value={filters.maxPrice}
              options={maxPriceOptions}
              onChange={(val) => handleUpdate({ maxPrice: val })}
              style={styles.rangeSelect}
            />
          </View>
        </View>

        {/* ROW 2, COL 2: No. of bedrooms */}
        <View style={[styles.col, isDesktop ? styles.colDesktop : styles.colResponsive]}>
          <Text style={styles.fieldLabel}>{t("search.rightmove.bedrooms")}</Text>
          <View style={styles.rangeRow}>
            <NativeSelect
              value={filters.minBedrooms}
              options={minBedOptions}
              onChange={(val) => handleUpdate({ minBedrooms: val })}
              style={styles.rangeSelect}
            />
            <Text style={styles.rangeDash}>-</Text>
            <NativeSelect
              value={filters.maxBedrooms}
              options={maxBedOptions}
              onChange={(val) => handleUpdate({ maxBedrooms: val })}
              style={styles.rangeSelect}
            />
          </View>
        </View>

        {/* ROW 2, COL 3: Search properties button */}
        <View style={[styles.col, isDesktop ? [styles.colDesktop, styles.actionCol] : [styles.colResponsive, styles.actionColResponsive]]}>
          <Pressable
            onPress={() => onSearch(filters)}
            style={({ pressed }) => [
              styles.searchBtn,
              webPointer,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("search.rightmove.searchBtn")}
          >
            <Text style={styles.searchBtnText}>{t("search.rightmove.searchBtn")}</Text>
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
  cardPhone: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
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
    fontSize: 19,
    lineHeight: 25,
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
    borderColor: "#04cf92",
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: "#0B1A17",
  },
  saveTitleBtn: {
    backgroundColor: "#04cf92",
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveTitleBtnText: {
    color: colorTokens.onBrand,
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
  gridResponsive: {
    flexDirection: "column",
    gap: 16,
  },
  col: {
    width: "100%",
  },
  colDesktop: {
    flex: 1,
    minWidth: 260,
    maxWidth: "100%",
  },
  colResponsive: {
    width: "100%",
    minWidth: "100%",
  },
  actionCol: {
    justifyContent: "flex-end",
  },
  actionColResponsive: {
    justifyContent: "flex-start",
    marginTop: 4,
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
    height: 42,
  },
  rangeSelect: {
    flex: 1,
    minWidth: 0,
    height: 42,
  },
  rangeDash: {
    fontSize: 15,
    color: "#5C6B66",
    fontWeight: "600",
    paddingHorizontal: 2,
  },
  checkboxRowContainer: {
    marginTop: 10,
    paddingTop: 2,
    minHeight: 22,
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
    borderColor: "#04cf92",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#04cf92",
    borderColor: "#04cf92",
  },
  checkboxLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#2C3E38",
    fontWeight: "500",
  },
  helpBadge: {
    fontSize: 12,
    color: "#04cf92",
    fontWeight: "600",
  },
  searchBtn: {
    height: 44,
    backgroundColor: "#04cf92",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "rgba(4, 207, 146, 0.4)",
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
