/**
 * The removable chips above search results, one per active filter (a chip per
 * value for multi-choice filters, so each can be removed on its own).
 */
import type { SupportedLanguage, TranslationKey } from "@/i18n";
import type { MessFilters } from "../types/mess";
import { formatDate, formatTaka } from "./format";
import { formatClock } from "./time";

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

export interface FilterChip {
  key: string;
  label: string;
  remove: (filters: MessFilters) => MessFilters;
}

function without<K extends keyof MessFilters>(key: K) {
  return (filters: MessFilters): MessFilters => {
    const next = { ...filters };
    delete next[key];
    return next;
  };
}

export function activeFilterChips(filters: MessFilters, t: Translate, lang: SupportedLanguage): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.max_walk_min && filters.campus_id) {
    chips.push({ key: "walk", label: t("mess.chips.walk", { count: filters.max_walk_min }), remove: without("max_walk_min") });
  }
  if (filters.gender) chips.push({ key: "gender", label: t(`mess.gender.${filters.gender}`), remove: without("gender") });
  if (filters.min_all_in || filters.max_all_in) {
    const min = filters.min_all_in ? formatTaka(filters.min_all_in, lang) : null;
    const max = filters.max_all_in ? formatTaka(filters.max_all_in, lang) : null;
    const label = min && max ? t("mess.chips.budgetRange", { min, max }) : max ? t("mess.chips.budgetMax", { amount: max }) : t("mess.chips.budgetMin", { amount: min! });
    chips.push({
      key: "budget",
      label,
      remove: (current) => without("max_all_in")(without("min_all_in")(current)),
    });
  }
  if (filters.seat_type) chips.push({ key: "seat_type", label: t(`mess.seatType.${filters.seat_type}`), remove: without("seat_type") });
  if (filters.washroom) chips.push({ key: "washroom", label: t(`mess.washroom.${filters.washroom}`), remove: without("washroom") });
  if (filters.no_smoking) chips.push({ key: "no_smoking", label: t("mess.filters.noSmoking"), remove: without("no_smoking") });
  if (filters.study_friendly) chips.push({ key: "study_friendly", label: t("mess.filters.studyFriendly"), remove: without("study_friendly") });
  if (filters.has_lift) chips.push({ key: "has_lift", label: t("mess.filters.lift"), remove: without("has_lift") });
  if (filters.has_balcony) chips.push({ key: "has_balcony", label: t("mess.filters.balcony"), remove: without("has_balcony") });
  for (const meal of filters.meal_system ?? []) {
    chips.push({
      key: `meal:${meal}`,
      label: t(`mess.meal.${meal}`),
      remove: (current) => {
        const rest = (current.meal_system ?? []).filter((value) => value !== meal);
        return rest.length ? { ...current, meal_system: rest } : without("meal_system")(current);
      },
    });
  }
  for (const policy of filters.guest_policy ?? []) {
    chips.push({
      key: `guests:${policy}`,
      label: t(`mess.guests.${policy}`),
      remove: (current) => {
        const rest = (current.guest_policy ?? []).filter((value) => value !== policy);
        return rest.length ? { ...current, guest_policy: rest } : without("guest_policy")(current);
      },
    });
  }
  if (filters.gate_open_by) {
    chips.push({ key: "gate", label: t("mess.chips.gate", { time: formatClock(filters.gate_open_by, lang) }), remove: without("gate_open_by") });
  }
  if (filters.available_by) {
    chips.push({ key: "available_by", label: t("mess.chips.availableBy", { date: formatDate(filters.available_by, lang) }), remove: without("available_by") });
  }
  if (filters.costs_complete) chips.push({ key: "costs_complete", label: t("mess.trust.costsDeclared"), remove: without("costs_complete") });
  if (filters.is_verified) chips.push({ key: "is_verified", label: t("mess.filters.verified"), remove: without("is_verified") });
  return chips;
}
