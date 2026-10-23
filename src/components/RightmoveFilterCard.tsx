import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, Edit3, SlidersHorizontal } from "@/components/icons";
import { SelectField } from "@/components/SelectField";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, formatLocalizedNumber, type TranslationKey } from "@/i18n";
import {
  ADDED_TO_SITE_OPTIONS,
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
  type FilterOption,
  type RangeOption,
} from "@/features/property/constants/filterOptions";
import {
  clampRange,
  countActiveFilters,
  type SearchFilters,
} from "@/features/property/utils/searchFilters";

/**
 * The inline filter bar. Its filters are now the shared `SearchFilters`, so a
 * search built in the hero arrives here intact instead of being re-parsed into
 * a private shape that dropped half of it.
 */
export type RightmoveFilters = SearchFilters;

interface RightmoveFilterCardProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
  onSearch: (filters: SearchFilters) => void;
  /** Opens the filters modal — the superset of this bar. */
  onOpenMoreFilters?: () => void;
  /** Places to choose from. Without them the Area dropdown is not shown. */
  areaOptions?: { label: string; value: string }[];
  /** False when the place has no known centre, so "+ N km" cannot apply. */
  radiusAvailable?: boolean;
  /** Why distance is off, shown under the radius dropdown. */
  radiusHint?: string;
  locationName?: string;
  totalResults?: number;
}

// The card sits on its own light panel; neither shade has a token equivalent.
const CARD_SURFACE = "#F4F5F8";
const CARD_BORDER = "#E5E7EB";

/** Resolves a ladder's label keys. Module scope, so the memos below depend
 *  only on `t`. */
function translateOptions(
  options: FilterOption[],
  t: (key: TranslationKey) => string,
): { value: string; label: string }[] {
  return options.map((option) => ({
    value: option.value,
    label: t(option.labelKey as TranslationKey),
  }));
}

export function RightmoveFilterCard({
  filters,
  onFilterChange,
  onSearch,
  onOpenMoreFilters,
  areaOptions,
  radiusAvailable = true,
  radiusHint,
  locationName = "Dhaka",
  totalResults,
}: RightmoveFilterCardProps) {
  const { t, language } = useTranslation();
  const { isPhone, isTablet, isCompact } = useResponsive();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customLocation, setCustomLocation] = useState(filters.query || locationName);
  const isDesktop = !isPhone && !isTablet;
  // Between tablet and full desktop (821–1100px) four columns squeeze the
  // min/max pairs until "No min" reads as "No mi…", so that band gets two.
  const colStyle = isDesktop
    ? [styles.colDesktop, isCompact && styles.colCompact]
    : styles.colResponsive;
  const actionStyle = isDesktop
    ? [styles.actionCol, isCompact && styles.actionColCompact]
    : styles.actionColResponsive;

  const activeCount = countActiveFilters(filters);

  const handleUpdate = (patch: Partial<SearchFilters>) => {
    onFilterChange({ ...filters, ...patch });
  };

  /** A range end never lands past its opposite end. */
  const handleRangeUpdate = (
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
    handleUpdate({ [minKey]: next.min, [maxKey]: next.max } as Partial<SearchFilters>);
  };

  const handleLocationSubmit = () => {
    setIsEditingTitle(false);
    onSearch({ ...filters, query: customLocation });
  };

  /** The heading text is part of the search, so Search commits a pending edit. */
  const handleSearchPress = () => {
    if (isEditingTitle) {
      handleLocationSubmit();
      return;
    }
    onSearch(filters);
  };

  const radiusOptions = useMemo(() => translateOptions(RADIUS_OPTIONS, t), [t]);
  const propertyTypeOptions = useMemo(() => translateOptions(PROPERTY_TYPE_OPTIONS, t), [t]);
  const addedToSiteOptions = useMemo(() => translateOptions(ADDED_TO_SITE_OPTIONS, t), [t]);

  /** A ladder, plus the current value when a URL carried an off-ladder one. */
  const rangeOptions = (
    base: RangeOption[],
    value: string,
    bound: string,
    side: "min" | "max",
    kind: "price" | "count",
  ) =>
    limitRangeOptions(withCurrentValue(base, value), bound, side).map((option) => ({
      value: option.value,
      label:
        kind === "price"
          ? priceOptionLabel(option, language, t, side)
          : countOptionLabel(option, language, t, side),
    }));

  const minPriceOptions = rangeOptions(
    MIN_PRICE_OPTIONS,
    filters.minPrice,
    filters.maxPrice,
    "min",
    "price",
  );
  const maxPriceOptions = rangeOptions(
    MAX_PRICE_OPTIONS,
    filters.maxPrice,
    filters.minPrice,
    "max",
    "price",
  );
  const minBedOptions = rangeOptions(
    MIN_BED_OPTIONS,
    filters.minBedrooms,
    filters.maxBedrooms,
    "min",
    "count",
  );
  const maxBedOptions = rangeOptions(
    MAX_BED_OPTIONS,
    filters.maxBedrooms,
    filters.minBedrooms,
    "max",
    "count",
  );

  // Area leads the bar: it is the first thing a search narrows, and digging it
  // out of the filters modal made the commonest choice the hardest one.
  const showArea = Boolean(areaOptions?.length);
  // The card is used without an area chooser too (a pinned /buy/<area> page).
  const resolvedAreaOptions = withCurrentArea(areaOptions ?? [], filters.area);
  const areaSelect = showArea ? (
    <SelectField
      accessibilityLabel={t("search.rightmove.area")}
      // The value is the area's id, which is what the API filters on; the name
      // rides along for the heading above.
      value={filters.area}
      options={resolvedAreaOptions}
      // A new place starts with "this area only": a distance chosen for the
      // last place says nothing about this one.
      onChange={(val) => handleUpdate({ area: val, radius: "" })}
    />
  ) : null;

  const heading = useMemo(() => {
    const place = filters.query?.trim() || locationName || "Bangladesh";
    // Sold is a lookup, not a search — the verb changes with it.
    const key: TranslationKey =
      filters.purpose === "sold"
        ? "search.rightmove.headingSold"
        : filters.purpose === "short-let"
        ? "search.rightmove.headingShortLet"
        : filters.purpose === "rent"
        ? "search.rightmove.headingRent"
        : filters.purpose === "sale"
        ? "search.rightmove.headingSale"
        : "search.rightmove.headingAll";
    return t(key, { location: place });
  }, [filters.purpose, filters.query, locationName, t]);

  /** What the collapsed phone bar shows in place of the whole grid. */
  const activeSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice
        ? priceOptionLabel({ value: filters.minPrice, amount: Number(filters.minPrice) }, language, t, "min")
        : t("filters.noMin");
      const max = filters.maxPrice
        ? priceOptionLabel({ value: filters.maxPrice, amount: Number(filters.maxPrice) }, language, t, "max")
        : t("filters.noMax");
      parts.push(`${min} – ${max}`);
    }
    if (filters.minBedrooms) {
      parts.push(`${formatLocalizedNumber(Number(filters.minBedrooms), language)}+ ${t("filters.bedrooms")}`);
    }
    if (filters.minBathrooms) {
      parts.push(`${formatLocalizedNumber(Number(filters.minBathrooms), language)}+ ${t("filters.bathrooms")}`);
    }
    if (filters.propertyType && filters.propertyType !== "all") {
      const option = PROPERTY_TYPE_OPTIONS.find((o) => o.value === filters.propertyType);
      if (option) parts.push(t(option.labelKey as TranslationKey));
    }
    if (filters.amenities.length) {
      parts.push(`${t("filters.amenities")} (${formatLocalizedNumber(filters.amenities.length, language)})`);
    }
    return parts.length ? parts.join(" · ") : t("search.rightmove.noFiltersApplied");
  }, [filters, language, t]);

  const searchLabel =
    typeof totalResults === "number"
      ? t("search.rightmove.searchCountedProperties", {
          count: formatLocalizedNumber(totalResults, language),
        })
      : t("search.rightmove.searchProperties");

  const titleBlock = (
    <View style={styles.headerRow}>
      {isEditingTitle ? (
        <View style={styles.editTitleRow}>
          <TextInput
            value={customLocation}
            onChangeText={setCustomLocation}
            onSubmitEditing={handleLocationSubmit}
            placeholder={t("search.rightmove.locationPlaceholder")}
            placeholderTextColor={colorTokens.muted}
            style={styles.editTitleInput}
            autoFocus
          />
          <Pressable onPress={handleLocationSubmit} style={[styles.saveTitleBtn, webPointer]}>
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
          <Text style={[styles.headingText, isPhone && styles.headingTextPhone]}>{heading}</Text>
          <Edit3 color={colorTokens.muted} size={16} style={styles.editIcon} />
        </Pressable>
      )}
    </View>
  );

  // On a phone the six-control grid is taller than the screen and buries the
  // results. The modal is the full set, so the bar collapses to a summary.
  if (isPhone) {
    return (
      <View style={[styles.card, styles.cardPhone]}>
        {titleBlock}
        {showArea ? (
          <View style={styles.phoneAreaField}>
            <Text style={styles.fieldLabel}>{t("search.rightmove.area")}</Text>
            {areaSelect}
          </View>
        ) : null}
        <Text style={styles.summaryText} numberOfLines={2}>
          {activeSummary}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenMoreFilters}
          style={[styles.phoneFiltersBtn, activeCount > 0 && styles.phoneFiltersBtnActive, webPointer]}
        >
          <SlidersHorizontal
            color={activeCount > 0 ? colorTokens.brandText : colorTokens.body}
            size={17}
            strokeWidth={2.2}
          />
          <Text style={[styles.phoneFiltersText, activeCount > 0 && styles.phoneFiltersTextActive]}>
            {activeCount > 0
              ? t("search.rightmove.filtersWithCount", {
                  count: formatLocalizedNumber(activeCount, language),
                })
              : t("filters.title")}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSearchPress}
          style={({ pressed }) => [
            styles.searchBtn,
            styles.searchBtnPhone,
            webPointer,
            pressed && styles.searchBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("search.rightmove.searchProperties")}
        >
          <Text style={styles.searchBtnText}>{searchLabel}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {titleBlock}

      {/* ─── Grid Controls (3 columns x 2 rows on desktop) ─────────────── */}
      <View style={[styles.grid, isDesktop && styles.gridDesktop, !isDesktop && styles.gridResponsive]}>
        {/* ROW 1, COL 1: Area */}
        {showArea ? (
          <View style={[styles.col, colStyle]}>
            <Text style={styles.fieldLabel}>{t("search.rightmove.area")}</Text>
            {areaSelect}
          </View>
        ) : null}

        {/* ROW 1, COL 2: Property types */}
        <View style={[styles.col, colStyle]}>
          <Text style={styles.fieldLabel}>{t("filters.propertyType")}</Text>
          <SelectField
            accessibilityLabel={t("filters.propertyType")}
            value={filters.propertyType}
            options={propertyTypeOptions}
            onChange={(val) => handleUpdate({ propertyType: val })}
          />
        </View>

        {/* ROW 1, COL 3: Added to site & Checkbox */}
        <View style={[styles.col, colStyle]}>
          <Text style={styles.fieldLabel}>{t("filters.addedToSite")}</Text>
          <SelectField
            accessibilityLabel={t("filters.addedToSite")}
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
              accessibilityHint={t("search.rightmove.includeSoldHelp")}
              // The (?) was decoration until it carried the explanation.
              {...(Platform.OS === "web"
                ? ({ title: t("search.rightmove.includeSoldHelp") } as any)
                : null)}
            >
              <View style={[styles.checkboxBox, filters.includeSold && styles.checkboxBoxChecked]}>
                {filters.includeSold ? (
                  <Check color={colorTokens.onBrand} size={13} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>{t("search.rightmove.includeSold")}</Text>
              <Text style={styles.helpBadge}>(?)</Text>
            </Pressable>
          </View>
        </View>

        {/* ROW 1, COL 4: Price range (৳) */}
        <View style={[styles.col, colStyle]}>
          <Text style={styles.fieldLabel}>{t("filters.priceRange")}</Text>
          <View style={styles.rangeRow}>
            <SelectField
              accessibilityLabel={t("filters.minPrice")}
              value={filters.minPrice}
              options={minPriceOptions}
              onChange={(val) => handleRangeUpdate("minPrice", "maxPrice", "min", val)}
              style={styles.rangeSelect}
            />
            <Text style={styles.rangeDash}>-</Text>
            <SelectField
              accessibilityLabel={t("filters.maxPrice")}
              value={filters.maxPrice}
              options={maxPriceOptions}
              onChange={(val) => handleRangeUpdate("minPrice", "maxPrice", "max", val)}
              style={styles.rangeSelect}
            />
          </View>
        </View>

        {/* ROW 2, COL 1: Search radius — reads as "around the area above", so it
            follows the area rather than leading the bar. */}
        <View style={[styles.col, colStyle]}>
          <Text style={styles.fieldLabel}>{t("search.rightmove.searchRadius")}</Text>
          <SelectField
            accessibilityLabel={t("search.rightmove.searchRadius")}
            value={radiusAvailable ? filters.radius : ""}
            options={radiusOptions}
            disabled={!radiusAvailable}
            onChange={(val) => handleUpdate({ radius: val })}
          />
          <Text style={styles.fieldHint}>
            {!radiusAvailable && radiusHint ? radiusHint : t("search.rightmove.pickNeighbourhood")}
          </Text>
        </View>

        {/* ROW 2, COL 2: No. of bedrooms */}
        <View style={[styles.col, colStyle]}>
          <Text style={styles.fieldLabel}>{t("filters.bedrooms")}</Text>
          <View style={styles.rangeRow}>
            <SelectField
              accessibilityLabel={t("filters.bedrooms")}
              value={filters.minBedrooms}
              options={minBedOptions}
              onChange={(val) => handleRangeUpdate("minBedrooms", "maxBedrooms", "min", val)}
              style={styles.rangeSelect}
            />
            <Text style={styles.rangeDash}>-</Text>
            <SelectField
              accessibilityLabel={t("filters.maxBedrooms")}
              value={filters.maxBedrooms}
              options={maxBedOptions}
              onChange={(val) => handleRangeUpdate("minBedrooms", "maxBedrooms", "max", val)}
              style={styles.rangeSelect}
            />
          </View>
        </View>

        {/* ROW 2, COL 3: More filters + Search */}
        <View style={[styles.col, colStyle, actionStyle]}>
          {/* Stands in for the labels above the other controls, so the buttons
              line up with the selects rather than with their labels. */}
          {isDesktop ? (
            <Text aria-hidden style={[styles.fieldLabel, styles.labelSpacer]}>
              {" "}
            </Text>
          ) : null}
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                activeCount > 0
                  ? t("hero.openFiltersWithCount", { count: activeCount })
                  : t("hero.openFilters")
              }
              onPress={onOpenMoreFilters}
              style={({ hovered }: any) => [
                styles.moreFiltersBtn,
                activeCount > 0 && styles.moreFiltersBtnActive,
                hovered && styles.moreFiltersBtnHovered,
                webPointer,
              ]}
            >
              <SlidersHorizontal
                color={activeCount > 0 ? colorTokens.brandText : colorTokens.body}
                size={16}
                strokeWidth={2.2}
              />
              <Text
                style={[styles.moreFiltersText, activeCount > 0 && styles.moreFiltersTextActive]}
                numberOfLines={1}
              >
                {t("search.rightmove.moreFilters")}
              </Text>
              {activeCount > 0 ? (
                <View style={styles.moreFiltersBadge}>
                  <Text style={styles.moreFiltersBadgeText}>
                    {formatLocalizedNumber(activeCount, language)}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              onPress={handleSearchPress}
              style={({ pressed }) => [
                styles.searchBtn,
                webPointer,
                pressed && styles.searchBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("search.rightmove.searchProperties")}
            >
              <Text style={styles.searchBtnText} numberOfLines={1}>
                {searchLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 20,
    width: "100%",
  },
  cardPhone: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
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
    color: colorTokens.ink,
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
    backgroundColor: colorTokens.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colorTokens.brand,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colorTokens.ink,
  },
  saveTitleBtn: {
    backgroundColor: colorTokens.brand,
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

  fieldHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colorTokens.muted,
    marginTop: 6,
  },

  /* Collapsed phone bar */
  phoneAreaField: {
    width: "100%",
  },
  summaryText: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -8,
  },
  phoneFiltersBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    backgroundColor: colorTokens.surface,
  },
  phoneFiltersBtnActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brand,
  },
  phoneFiltersText: {
    color: colorTokens.body,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  phoneFiltersTextActive: {
    color: colorTokens.brandText,
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
  // A fixed four-column basis rather than flex:1, so the second row's fields
  // line up under the first row's instead of stretching to fill the gap.
  colDesktop: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "23%",
    minWidth: 200,
    maxWidth: "100%",
  },
  colResponsive: {
    width: "100%",
    minWidth: "100%",
  },
  // The pair of buttons spans the last two columns.
  // Top-aligned, not bottom: the radius field's hint makes its column taller,
  // and flex-end dropped the buttons below every other control in the row.
  actionCol: {
    justifyContent: "flex-start",
    flexBasis: "48%",
  },
  colCompact: {
    flexBasis: "48%",
  },
  actionColCompact: {
    flexBasis: "100%",
  },
  actionColResponsive: {
    justifyContent: "flex-start",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: "600",
    color: colorTokens.body,
    marginBottom: 7,
  },
  labelSpacer: {
    // Same box as a real label; it just has nothing to say.
    opacity: 0,
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
    color: colorTokens.muted,
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
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  checkboxLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.body,
    fontWeight: "500",
  },
  helpBadge: {
    fontSize: 12,
    color: colorTokens.brandText,
    fontWeight: "600",
  },

  moreFiltersBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    backgroundColor: colorTokens.surface,
  },
  moreFiltersBtnActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brand,
  },
  moreFiltersBtnHovered: {
    opacity: 0.88,
  },
  moreFiltersText: {
    color: colorTokens.body,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  moreFiltersTextActive: {
    color: colorTokens.brandText,
  },
  moreFiltersBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  moreFiltersBadgeText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 13,
  },

  searchBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colorTokens.brand,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    shadowColor: "rgba(4, 207, 146, 0.4)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  // `flex: 0` resolves to a 0% basis, which collapses the button to no height
  // in the card's column layout and throws away the 44 above.
  searchBtnPhone: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
  },
  searchBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  searchBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "700",
  },
});
