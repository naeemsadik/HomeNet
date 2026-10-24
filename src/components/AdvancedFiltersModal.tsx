import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, MapPin, Sparkles, X } from "@/components/icons";
import { colorTokens, fonts, webPointer } from "@/theme";
import { LiveText } from "@/components/LiveText";
import { OverlayHost } from "@/components/OverlayModal";
import { SelectField } from "@/components/SelectField";
import { useResponsive } from "@/hooks/useResponsive";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTranslation, formatLocalizedNumber, type TranslationKey } from "@/i18n";
import {
  ADDED_TO_SITE_OPTIONS,
  AMENITY_FILTER_OPTIONS,
  MAX_BATH_OPTIONS,
  MAX_BED_OPTIONS,
  MAX_PRICE_OPTIONS,
  MAX_SIZE_OPTIONS,
  MIN_PRICE_OPTIONS,
  MIN_SIZE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
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
  hasClientFilters,
  resetSearchFilters,
  type SearchFilters,
} from "@/features/property/utils/searchFilters";

/**
 * @deprecated Kept for one release so older imports keep compiling.
 * Use `SearchFilters` from features/property/utils/searchFilters.
 */
export type FilterState = SearchFilters;

/**
 * @deprecated Use `defaultSearchFilters`. The old default pinned every search
 * to "Gulshan, Dhaka", which silently narrowed a search nobody had narrowed.
 */
export { defaultSearchFilters as defaultFilterState } from "@/features/property/utils/searchFilters";

/** Bedrooms and bathrooms read as minimums: "2+" is what the API applies. */
const BEDROOM_MIN_VALUES = ["1", "2", "3", "4"];
const BATHROOM_MIN_VALUES = ["1", "2", "3"];

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

export function AdvancedFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  resultCount,
  showLocation = false,
  areaOptions,
  fixedLocation,
  onPreviewCount,
}: {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (newFilters: SearchFilters) => void;
  /**
   * Fires in addition to clearing the form. Hosts normally leave this out:
   * Reset empties the pending filters and nothing reaches the search until
   * "Show results", which is what every other control in here does, and it
   * means a mistaken Reset can be undone by closing the sheet.
   */
  onReset?: () => void;
  /** Omitted when the count is unknown, the button then reads "Show results". */
  resultCount?: number;
  /** The hero has its own area button, so it hides this. Browse shows it. */
  showLocation?: boolean;
  areaOptions?: { label: string; value: string }[];
  fixedLocation?: string;
  /** Asks the host for the count the pending filters would return. */
  onPreviewCount?: (filters: SearchFilters) => void;
}) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Seeded when the sheet opens, and only then: the host re-renders while the
  // sheet is up (its own result count changes), and reacting to that would
  // throw away edits the person has not applied yet.
  const wasVisible = useRef(visible);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setLocalFilters(filters);
    }
    wasVisible.current = visible;
  }, [visible, filters]);

  // 400 ms: long enough that dragging a dropdown does not fire a request per
  // step, short enough that the number lands before the thumb leaves the glass.
  const previewFilters = useDebouncedValue(localFilters, 400);
  useEffect(() => {
    if (!visible || !onPreviewCount) return;
    onPreviewCount(previewFilters);
  }, [visible, previewFilters, onPreviewCount]);

  const patch = (next: Partial<SearchFilters>) =>
    setLocalFilters((prev) => ({ ...prev, ...next }));

  /** A range end never lands past its opposite end. */
  const patchRange = (
    minKey: keyof SearchFilters,
    maxKey: keyof SearchFilters,
    changed: "min" | "max",
    value: string,
  ) => {
    setLocalFilters((prev) => {
      const next = clampRange(
        changed === "min" ? value : (prev[minKey] as string),
        changed === "max" ? value : (prev[maxKey] as string),
        changed,
      );
      return { ...prev, [minKey]: next.min, [maxKey]: next.max };
    });
  };

  const toggleAmenity = (key: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  };

  // Clears the pending filters only. The apply button's count updates with
  // them, so what Reset would give you is visible before you commit to it.
  const handleReset = () => {
    setLocalFilters(resetSearchFilters(localFilters, { fixedLocation }));
    if (onReset) {
      onReset();
    }
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const propertyTypeOptions = useMemo(() => translateOptions(PROPERTY_TYPE_OPTIONS, t), [t]);
  const addedToSiteOptions = useMemo(() => translateOptions(ADDED_TO_SITE_OPTIONS, t), [t]);

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

  const areaChoices = withCurrentArea(areaOptions ?? [], localFilters.area);

  // A count that ignores the pending client-side filters would be wrong, and a
  // wrong number is worse than no number.
  const showCount = typeof resultCount === "number" && !hasClientFilters(localFilters);

  // Land is sold by the katha, not the square foot, so the sqft pair would be
  // the wrong question.
  const showSize = localFilters.propertyType !== "land";

  const minPill = (
    group: "minBedrooms" | "minBathrooms",
    maxKey: "maxBedrooms" | "maxBathrooms",
    values: string[],
  ) => (
    <View style={styles.optionsRow}>
      {["", ...values].map((value) => {
        const isSelected = localFilters[group] === value;
        const label =
          value === "" ? t("filters.any") : `${formatLocalizedNumber(Number(value), language)}+`;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={`${group}-${value || "any"}`}
            onPress={() => patchRange(group, maxKey, "min", value)}
            style={[
              styles.pillOptionButton,
              isSelected && styles.pillOptionButtonActive,
              webPointer,
            ]}
          >
            <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal
      animationType={isPhone ? "slide" : "fade"}
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {/* The drop-downs open inside this window; a second Modal opened from
          here can fail to appear on Android. */}
      <OverlayHost>
      <View style={[styles.backdrop, isPhone && styles.backdropPhone]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("filters.close")}
          style={styles.backdropTouch}
          onPress={onClose}
        />

        <View style={[styles.modalCard, isPhone && styles.modalCardPhone]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("filters.title")}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("filters.close")}
              onPress={onClose}
              style={[styles.closeButton, webPointer]}
            >
              <X color={colorTokens.muted} size={20} />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
          >
            {/* Location: Browse only; the hero has its own area button. */}
            {showLocation && !fixedLocation && areaOptions?.length ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <MapPin color={colorTokens.ink} size={16} />
                  <Text style={styles.sectionLabel}>{t("filters.location")}</Text>
                </View>
                {/* Seeded from the same `area` the bar wrote, so an area
                    already chosen out there is already chosen in here. */}
                <SelectField
                  accessibilityLabel={t("filters.location")}
                  value={localFilters.area}
                  options={areaChoices}
                  // A new place starts with "this area only".
                  onChange={(value) => patch({ area: value, radius: "" })}
                />
              </View>
            ) : null}

            {/* Property type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("filters.propertyType")}</Text>
              <SelectField
                accessibilityLabel={t("filters.propertyType")}
                value={localFilters.propertyType}
                options={propertyTypeOptions}
                onChange={(value) => patch({ propertyType: value })}
              />
            </View>

            {/* Price range (৳): the same ladder the inline bar uses, so a
                price set here survives a trip through the URL. */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("filters.priceRange")}</Text>
              <View style={styles.rangeRow}>
                <SelectField
                  accessibilityLabel={t("filters.minPrice")}
                  value={localFilters.minPrice}
                  options={rangeOptions(
                    MIN_PRICE_OPTIONS,
                    localFilters.minPrice,
                    localFilters.maxPrice,
                    "min",
                    "price",
                  )}
                  onChange={(value) => patchRange("minPrice", "maxPrice", "min", value)}
                  style={styles.rangeField}
                />
                <Text style={styles.dashText}>–</Text>
                <SelectField
                  accessibilityLabel={t("filters.maxPrice")}
                  value={localFilters.maxPrice}
                  options={rangeOptions(
                    MAX_PRICE_OPTIONS,
                    localFilters.maxPrice,
                    localFilters.minPrice,
                    "max",
                    "price",
                  )}
                  onChange={(value) => patchRange("minPrice", "maxPrice", "max", value)}
                  style={styles.rangeField}
                />
              </View>
            </View>

            {/* Bedrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("filters.bedrooms")}</Text>
              {minPill("minBedrooms", "maxBedrooms", BEDROOM_MIN_VALUES)}
              <SelectField
                accessibilityLabel={t("filters.maxBedrooms")}
                value={localFilters.maxBedrooms}
                options={rangeOptions(
                  MAX_BED_OPTIONS,
                  localFilters.maxBedrooms,
                  localFilters.minBedrooms,
                  "max",
                  "count",
                )}
                onChange={(value) => patchRange("minBedrooms", "maxBedrooms", "max", value)}
              />
            </View>

            {/* Bathrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("filters.bathrooms")}</Text>
              {minPill("minBathrooms", "maxBathrooms", BATHROOM_MIN_VALUES)}
              <SelectField
                accessibilityLabel={t("filters.maxBathrooms")}
                value={localFilters.maxBathrooms}
                options={rangeOptions(
                  MAX_BATH_OPTIONS,
                  localFilters.maxBathrooms,
                  localFilters.minBathrooms,
                  "max",
                  "count",
                )}
                onChange={(value) => patchRange("minBathrooms", "maxBathrooms", "max", value)}
              />
            </View>

            {/* Size (sqft) */}
            {showSize ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t("filters.size")}</Text>
                <View style={styles.rangeRow}>
                  <SelectField
                    accessibilityLabel={t("filters.minSize")}
                    value={localFilters.minSize}
                    options={rangeOptions(
                      MIN_SIZE_OPTIONS,
                      localFilters.minSize,
                      localFilters.maxSize,
                      "min",
                      "count",
                    )}
                    onChange={(value) => patchRange("minSize", "maxSize", "min", value)}
                    style={styles.rangeField}
                  />
                  <Text style={styles.dashText}>–</Text>
                  <SelectField
                    accessibilityLabel={t("filters.maxSize")}
                    value={localFilters.maxSize}
                    options={rangeOptions(
                      MAX_SIZE_OPTIONS,
                      localFilters.maxSize,
                      localFilters.minSize,
                      "max",
                      "count",
                    )}
                    onChange={(value) => patchRange("minSize", "maxSize", "max", value)}
                    style={styles.rangeField}
                  />
                </View>
              </View>
            ) : null}

            {/* Added to site */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("filters.addedToSite")}</Text>
              <SelectField
                accessibilityLabel={t("filters.addedToSite")}
                value={localFilters.addedToSite}
                options={addedToSiteOptions}
                onChange={(value) => patch({ addedToSite: value })}
              />
            </View>

            {/* Amenities: keyed as listings store them, so a tick matches. */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("filters.amenities")}</Text>
              <View style={styles.amenitiesWrap}>
                {AMENITY_FILTER_OPTIONS.map((option) => {
                  const isSelected = localFilters.amenities.includes(option.value);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={option.value}
                      onPress={() => toggleAmenity(option.value)}
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
                        {t(option.labelKey as TranslationKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Verified listings only */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ checked: localFilters.verifiedOnly }}
              onPress={() => patch({ verifiedOnly: !localFilters.verifiedOnly })}
              style={[styles.verifiedRowCard, webPointer]}
            >
              <View style={styles.verifiedRowLeft}>
                <Sparkles color={colorTokens.brandText} size={16} />
                <Text style={styles.verifiedRowLabel}>{t("filters.verifiedOnly")}</Text>
              </View>
              <View
                style={[
                  styles.checkboxBox,
                  localFilters.verifiedOnly && styles.checkboxBoxChecked,
                ]}
              >
                {localFilters.verifiedOnly ? (
                  <Check color={colorTokens.onBrand} size={14} strokeWidth={2.5} />
                ) : null}
              </View>
            </Pressable>
          </ScrollView>

          {/* Footer Actions: outside the ScrollView, so it stays reachable. */}
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={handleReset}
              style={[styles.resetButton, webPointer]}
            >
              <Text style={styles.resetButtonText}>{t("filters.reset")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleApply}
              style={[styles.applyButton, webPointer]}
            >
              <LiveText style={styles.applyButtonText}>
                {showCount
                  ? t("filters.showResults", {
                      count: formatLocalizedNumber(resultCount as number, language),
                    })
                  : t("filters.showResultsNoCount")}
              </LiveText>
            </Pressable>
          </View>
        </View>
      </View>
      </OverlayHost>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backdropPhone: {
    padding: 0,
    justifyContent: "flex-end",
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
    backgroundColor: colorTokens.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  // A phone gets the whole screen: the filter set is long and a centred card
  // would scroll inside a scroll.
  modalCardPhone: {
    maxWidth: "100%",
    height: "96%",
    maxHeight: "96%",
    borderRadius: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  headerTitle: {
    color: colorTokens.ink,
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
    backgroundColor: colorTokens.surfaceSunken,
  },
  scrollArea: {
    flexShrink: 1,
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
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeField: {
    flex: 1,
    minWidth: 0,
  },
  dashText: {
    color: colorTokens.muted,
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
    borderColor: colorTokens.divider,
    borderRadius: 20,
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pillOptionButtonActive: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  pillOptionText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  pillOptionTextActive: {
    color: colorTokens.onBrand,
  },
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    borderWidth: 1.2,
    borderColor: colorTokens.divider,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colorTokens.surface,
  },
  amenityChipActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brand,
  },
  amenityChipText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  amenityChipTextActive: {
    color: colorTokens.brandText,
  },
  verifiedRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colorTokens.canvas,
    borderRadius: 16,
    padding: 16,
  },
  verifiedRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedRowLabel: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colorTokens.muted,
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  resetButton: {
    flex: 1,
    height: 46.4,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: colorTokens.divider,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.surface,
  },
  resetButtonText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    height: 46.4,
    borderRadius: 999,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
});
