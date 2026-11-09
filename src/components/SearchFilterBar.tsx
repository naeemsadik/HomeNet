import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin, SlidersHorizontal } from "@/components/icons";
import { SelectField } from "@/components/SelectField";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import {
  MAX_BED_OPTIONS,
  MAX_PRICE_OPTIONS,
  MIN_BED_OPTIONS,
  MIN_PRICE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RADIUS_OPTIONS,
  countOptionLabel,
  limitRangeOptions,
  priceOptionLabel,
  withCurrentArea,
  withCurrentValue,
  type RangeOption,
} from "@/features/property/constants/filterOptions";
import {
  clampRange,
  countActiveFilters,
  type SearchFilters,
} from "@/features/property/utils/searchFilters";

interface SearchFilterBarProps {
  filters: SearchFilters;
  /** Every change re-runs the search at once, the way the results page works. */
  onFilterChange: (next: SearchFilters) => void;
  /** Opens the full filters sheet (bathrooms, size, amenities, added to site…). */
  onOpenMoreFilters: () => void;
  /** Places to choose from. Without them the bar shows `locationName` as text. */
  areaOptions?: { label: string; value: string }[];
  /** False when the place has no known centre, so "+ N km" cannot apply. */
  radiusAvailable?: boolean;
  locationName: string;
}

/**
 * The results page's one-line filter bar: where, how far, price, bedrooms,
 * type and the rest behind Filters. It replaces the tall "find property" form
 * that used to sit above the results, so the listings start near the top.
 */
export function SearchFilterBar({
  filters,
  onFilterChange,
  onOpenMoreFilters,
  areaOptions,
  radiusAvailable = true,
  locationName,
}: SearchFilterBarProps) {
  const { t, language } = useTranslation();
  const activeCount = countActiveFilters(filters);

  const update = (patch: Partial<SearchFilters>) => onFilterChange({ ...filters, ...patch });

  /** A range end never lands past its opposite end. */
  const updateRange = (
    minKey: "minPrice" | "minBedrooms",
    maxKey: "maxPrice" | "maxBedrooms",
    changed: "min" | "max",
    value: string,
  ) => {
    const next = clampRange(
      changed === "min" ? value : filters[minKey],
      changed === "max" ? value : filters[maxKey],
      changed,
    );
    update({ [minKey]: next.min, [maxKey]: next.max } as Partial<SearchFilters>);
  };

  /** A ladder whose empty rung reads as the control's name ("Min price"). */
  const ladder = (
    base: RangeOption[],
    value: string,
    bound: string,
    side: "min" | "max",
    kind: "price" | "count",
    emptyLabel: string,
  ) =>
    limitRangeOptions(withCurrentValue(base, value), bound, side).map((option) => ({
      value: option.value,
      label:
        option.amount === null
          ? emptyLabel
          : kind === "price"
          ? priceOptionLabel(option, language, t, side)
          : countOptionLabel(option, language, t, side),
    }));

  const radiusOptions = useMemo(
    () => RADIUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey as TranslationKey) })),
    [t],
  );
  const typeOptions = useMemo(
    () =>
      PROPERTY_TYPE_OPTIONS.map((o) => ({
        value: o.value,
        label: o.value === "all" ? t("search.results.anyType") : t(o.labelKey as TranslationKey),
      })),
    [t],
  );

  const showArea = Boolean(areaOptions?.length);

  return (
    <View style={styles.bar}>
      {/* Where */}
      <View style={styles.whereGroup}>
        <View style={styles.locationBox}>
          <MapPin color={colorTokens.brandText} size={16} strokeWidth={2.2} />
          {showArea ? (
            <SelectField
              accessibilityLabel={t("search.rightmove.area")}
              value={filters.area}
              options={withCurrentArea(areaOptions ?? [], filters.area)}
              // A new place starts with "this area only".
              onChange={(val) => update({ area: val, radius: "" })}
              tone="plain"
              style={styles.locationSelect}
            />
          ) : (
            <Text numberOfLines={1} style={styles.locationText}>
              {locationName}
            </Text>
          )}
        </View>
        <SelectField
          accessibilityLabel={t("search.rightmove.searchRadius")}
          value={radiusAvailable ? filters.radius : ""}
          options={radiusOptions}
          disabled={!radiusAvailable}
          onChange={(val) => update({ radius: val })}
          tone="dark"
          style={styles.radiusSelect}
        />
      </View>

      <View style={styles.divider} />

      {/* Price */}
      <View style={styles.rangeGroup}>
        <SelectField
          accessibilityLabel={t("filters.minPrice")}
          value={filters.minPrice}
          options={ladder(MIN_PRICE_OPTIONS, filters.minPrice, filters.maxPrice, "min", "price", t("search.results.minPrice"))}
          onChange={(val) => updateRange("minPrice", "maxPrice", "min", val)}
          tone="dark"
          style={styles.rangeSelect}
        />
        <Text style={styles.to}>{t("search.results.to")}</Text>
        <SelectField
          accessibilityLabel={t("filters.maxPrice")}
          value={filters.maxPrice}
          options={ladder(MAX_PRICE_OPTIONS, filters.maxPrice, filters.minPrice, "max", "price", t("search.results.maxPrice"))}
          onChange={(val) => updateRange("minPrice", "maxPrice", "max", val)}
          tone="dark"
          style={styles.rangeSelect}
        />
      </View>

      <View style={styles.divider} />

      {/* Bedrooms */}
      <View style={styles.rangeGroup}>
        <SelectField
          accessibilityLabel={t("filters.bedrooms")}
          value={filters.minBedrooms}
          options={ladder(MIN_BED_OPTIONS, filters.minBedrooms, filters.maxBedrooms, "min", "count", t("search.results.minBeds"))}
          onChange={(val) => updateRange("minBedrooms", "maxBedrooms", "min", val)}
          tone="dark"
          style={styles.bedSelect}
        />
        <Text style={styles.to}>{t("search.results.to")}</Text>
        <SelectField
          accessibilityLabel={t("filters.maxBedrooms")}
          value={filters.maxBedrooms}
          options={ladder(MAX_BED_OPTIONS, filters.maxBedrooms, filters.minBedrooms, "max", "count", t("search.results.maxBeds"))}
          onChange={(val) => updateRange("minBedrooms", "maxBedrooms", "max", val)}
          tone="dark"
          style={styles.bedSelect}
        />
      </View>

      <View style={styles.divider} />

      <SelectField
        accessibilityLabel={t("filters.propertyType")}
        value={filters.propertyType}
        options={typeOptions}
        onChange={(val) => update({ propertyType: val })}
        tone="dark"
        style={styles.typeSelect}
      />

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          activeCount > 0
            ? t("hero.openFiltersWithCount", { count: activeCount })
            : t("hero.openFilters")
        }
        onPress={onOpenMoreFilters}
        style={({ hovered }: any) => [styles.filtersBtn, hovered && styles.filtersBtnHover, webPointer]}
      >
        <SlidersHorizontal color={colorTokens.onInk} size={16} strokeWidth={2.2} />
        <Text style={styles.filtersText}>{t("search.results.filters")}</Text>
        {activeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatLocalizedNumber(activeCount, language)}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: colorTokens.ink,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    rowGap: 8,
    columnGap: 6,
  },
  whereGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexGrow: 1,
    flexBasis: 300,
    minWidth: 280,
  },
  locationBox: {
    flex: 1,
    minWidth: 150,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 12,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  // The white box draws the frame, so the select inside it drops its own.
  locationSelect: {
    flex: 1,
    minWidth: 0,
    marginLeft: -6,
  },
  locationText: {
    flex: 1,
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    paddingRight: 12,
  },
  radiusSelect: {
    width: 150,
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  rangeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  rangeSelect: {
    width: 136,
  },
  bedSelect: {
    width: 116,
  },
  to: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: fonts.medium,
    fontSize: 13,
    paddingHorizontal: 2,
  },
  typeSelect: {
    width: 158,
  },
  filtersBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  filtersBtnHover: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  filtersText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
