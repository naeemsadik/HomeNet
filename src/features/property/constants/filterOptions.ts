/**
 * The option ladders every filter control shares.
 *
 * These lived inside RightmoveFilterCard, which meant the modal invented its
 * own values and the two disagreed about what "min price" meant. One ladder per
 * range keeps a URL written by the hero readable by Browse and back again.
 *
 * Values are strings because that is what the URL and the <select> elements
 * carry; `toApiFilters` is the single place they become numbers. Labels are not
 * stored here — components build them with `t()` so both languages work.
 */
import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  type SupportedLanguage,
  type TranslationKey,
} from "@/i18n";

export interface FilterOption {
  value: string;
  /** A key under `filters.*` / `search.rightmove.*`; resolved by the component. */
  labelKey: string;
}

export interface RangeOption {
  value: string;
  /** null is the "No min" / "No max" row. */
  amount: number | null;
  /** Renders the top of the ladder as "5+", "৳10 Crore+". */
  plus?: boolean;
}

export const RADIUS_OPTIONS: FilterOption[] = [
  { value: "", labelKey: "filters.radiusOptions.thisArea" },
  { value: "1", labelKey: "filters.radiusOptions.km1" },
  { value: "3", labelKey: "filters.radiusOptions.km3" },
  { value: "5", labelKey: "filters.radiusOptions.km5" },
  { value: "10", labelKey: "filters.radiusOptions.km10" },
  { value: "20", labelKey: "filters.radiusOptions.km20" },
];

// Values are the API's `PropertyType` enum. "Apartment" and "house" are
// subtypes, not types: sending them as `type` makes the API reject the whole
// search with a 400. They come back as their own options once the API can
// filter by subtype (docs/BACKEND_REQUIREMENTS.md).
export const PROPERTY_TYPE_OPTIONS: FilterOption[] = [
  { value: "all", labelKey: "filters.typeOptions.any" },
  { value: "residential", labelKey: "filters.typeOptions.residential" },
  { value: "commercial", labelKey: "filters.typeOptions.commercial" },
  { value: "land", labelKey: "filters.typeOptions.land" },
  { value: "parking", labelKey: "filters.typeOptions.parking" },
];

export const ADDED_TO_SITE_OPTIONS: FilterOption[] = [
  { value: "", labelKey: "filters.addedOptions.anytime" },
  { value: "24h", labelKey: "filters.addedOptions.last24h" },
  { value: "3d", labelKey: "filters.addedOptions.last3d" },
  { value: "7d", labelKey: "filters.addedOptions.last7d" },
  { value: "14d", labelKey: "filters.addedOptions.last14d" },
];

/**
 * Amenity keys as listings actually store them in `property.amenities`
 * (see propertyCategories.ts). The modal used to show display labels like
 * "Smart Home", which matched nothing on any listing.
 */
export const AMENITY_FILTER_OPTIONS: FilterOption[] = [
  { value: "lift", labelKey: "filters.amenityOptions.lift" },
  { value: "parking", labelKey: "filters.amenityOptions.parking" },
  { value: "generator", labelKey: "filters.amenityOptions.generator" },
  { value: "gas", labelKey: "filters.amenityOptions.gas" },
  { value: "security", labelKey: "filters.amenityOptions.security" },
  { value: "gym", labelKey: "filters.amenityOptions.gym" },
  { value: "pool", labelKey: "filters.amenityOptions.pool" },
  { value: "rooftop", labelKey: "filters.amenityOptions.rooftop" },
];

const PRICE_LADDER = [10000, 25000, 50000, 100000, 2500000, 5000000, 10000000, 25000000, 50000000];

export const MIN_PRICE_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...PRICE_LADDER.map((amount) => ({ value: String(amount), amount })),
];

// The max ladder starts one rung up and tops out with an open-ended row: a
// "no max" search and a "৳10 Crore+" search are different intents.
export const MAX_PRICE_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...PRICE_LADDER.slice(1).map((amount) => ({ value: String(amount), amount })),
  { value: "100000000", amount: 100000000, plus: true },
];

export const MIN_BED_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...[1, 2, 3, 4, 5].map((amount) => ({ value: String(amount), amount })),
];

export const MAX_BED_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...[1, 2, 3, 4].map((amount) => ({ value: String(amount), amount })),
  { value: "5", amount: 5, plus: true },
];

export const MIN_BATH_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...[1, 2, 3, 4, 5, 6].map((amount) => ({ value: String(amount), amount })),
];

export const MAX_BATH_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...[1, 2, 3, 4, 5].map((amount) => ({ value: String(amount), amount })),
  { value: "6", amount: 6, plus: true },
];

const SIZE_LADDER = [500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000];

export const MIN_SIZE_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...SIZE_LADDER.map((amount) => ({ value: String(amount), amount })),
  { value: "5000", amount: 5000, plus: true },
];

export const MAX_SIZE_OPTIONS: RangeOption[] = [
  { value: "", amount: null },
  ...SIZE_LADDER.slice(1).map((amount) => ({ value: String(amount), amount })),
  { value: "5000", amount: 5000, plus: true },
];

/** Minimal shape of `t` from useTranslation, so this file needs no React. */
type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/**
 * The label for one price rung. `formatLocalizedPrice` already speaks lakh and
 * কোটি, so an off-ladder amount from a hand-edited URL gets a real label
 * instead of silently falling back to "No min".
 */
export function priceOptionLabel(
  option: RangeOption,
  language: SupportedLanguage,
  t: Translate,
  kind: "min" | "max",
): string {
  if (option.amount === null) {
    return kind === "min" ? t("filters.noMin") : t("filters.noMax");
  }
  return `${formatLocalizedPrice(option.amount, "BDT", language)}${option.plus ? "+" : ""}`;
}

/** The label for a bedroom, bathroom or square-foot rung. */
export function countOptionLabel(
  option: RangeOption,
  language: SupportedLanguage,
  t: Translate,
  kind: "min" | "max",
): string {
  if (option.amount === null) {
    return kind === "min" ? t("filters.noMin") : t("filters.noMax");
  }
  return `${formatLocalizedNumber(option.amount, language)}${option.plus ? "+" : ""}`;
}

/**
 * The ladder plus, when the current value is not on it, that value as a
 * selected row. Keeps `/buy?min_price=4500000` showing "৳45 Lakh".
 */
export function withCurrentValue(options: RangeOption[], value: string): RangeOption[] {
  if (!value || options.some((option) => option.value === value)) return options;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return options;
  const extended = [...options, { value, amount }];
  // Keep the "no min/max" row first and the rest ascending.
  return extended.sort((a, b) => (a.amount ?? -1) - (b.amount ?? -1));
}

/**
 * Keeps an area that is not in the list — one carried by an older link — as a
 * real, selected choice rather than letting the control fall back to "All
 * areas" and quietly widen the search.
 */
export function withCurrentArea(
  options: { label: string; value: string }[],
  value: string,
  label?: string,
): { label: string; value: string }[] {
  if (!value || options.some((option) => option.value === value)) return options;
  return [...options, { value, label: label || value }];
}

/**
 * Hides options that would make min exceed max. The pair is also run through
 * `clampRange` on change, so an invalid pair cannot survive a round trip.
 */
export function limitRangeOptions(
  options: RangeOption[],
  bound: string,
  side: "min" | "max",
): RangeOption[] {
  const limit = Number(bound);
  if (!bound || !Number.isFinite(limit)) return options;
  return options.filter((option) => {
    if (option.amount === null) return true;
    return side === "min" ? option.amount <= limit : option.amount >= limit;
  });
}
