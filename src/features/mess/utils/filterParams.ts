/**
 * Mess search filters ⇄ URL params ⇄ API query.
 *
 * The URL carries the committed filters, so a search can be shared and the
 * back button undoes a change. URL params use the API's own names (PRD 2.3.1),
 * so there is one vocabulary to keep in step. Anything unreadable in a
 * hand-edited URL is dropped rather than sent.
 */
import { GUEST_POLICIES, MEAL_SYSTEMS } from "../constants/vocabulary";
import type { GuestPolicy, MealSystem, MessFilters, MessSort } from "../types/mess";
import { toClockTime } from "./time";

type ParamValue = string | string[] | undefined;
export type MessSearchParams = Record<string, ParamValue>;

/** Every URL param this module owns, so a patch can blank the ones a change removed. */
export const MESS_PARAM_KEYS = [
  "campus_id",
  "max_walk_min",
  "gender",
  "min_all_in",
  "max_all_in",
  "seat_type",
  "washroom",
  "no_smoking",
  "study_friendly",
  "has_lift",
  "has_balcony",
  "meal_system",
  "guest_policy",
  "gate_open_by",
  "available_by",
  "costs_complete",
  "is_verified",
  "sort_by",
] as const;

const SORTS: readonly MessSort[] = ["walk_asc", "all_in_asc", "newest", "recently_confirmed"];
const BOOLEAN_KEYS = ["no_smoking", "study_friendly", "has_lift", "has_balcony", "costs_complete", "is_verified"] as const;

function one(value: ParamValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function oneOf<T extends string>(value: ParamValue, allowed: readonly T[]): T | undefined {
  const raw = one(value);
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

function positiveInt(value: ParamValue, max: number): number | undefined {
  const raw = one(value);
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const parsed = Number(raw);
  return parsed > 0 && parsed <= max ? parsed : undefined;
}

function csvOf<T extends string>(value: ParamValue, allowed: readonly T[]): T[] | undefined {
  const raw = one(value);
  if (!raw) return undefined;
  const picked = [...new Set(raw.split(","))].filter((part): part is T => (allowed as readonly string[]).includes(part));
  return picked.length ? picked : undefined;
}

function isoDate(value: ParamValue): string | undefined {
  const raw = one(value);
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw)) ? raw : undefined;
}

export function filtersFromParams(params: MessSearchParams): MessFilters {
  const filters: MessFilters = {};
  const campus = one(params.campus_id);
  if (campus) filters.campus_id = campus;
  const walk = positiveInt(params.max_walk_min, 60);
  if (walk !== undefined && walk >= 5) filters.max_walk_min = walk;
  const gender = oneOf(params.gender, ["male", "female"] as const);
  if (gender) filters.gender = gender;

  let min = positiveInt(params.min_all_in, 500_000);
  let max = positiveInt(params.max_all_in, 500_000);
  // A min above its max matches nothing; a hand-edited URL meant the swap.
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  if (min !== undefined) filters.min_all_in = min;
  if (max !== undefined) filters.max_all_in = max;

  const seat = oneOf(params.seat_type, ["single", "shared"] as const);
  if (seat) filters.seat_type = seat;
  const washroom = oneOf(params.washroom, ["attached", "common"] as const);
  if (washroom) filters.washroom = washroom;
  for (const key of BOOLEAN_KEYS) {
    const raw = one(params[key]);
    if (raw === "1" || raw === "true") filters[key] = true;
  }
  const meals = csvOf<MealSystem>(params.meal_system, MEAL_SYSTEMS);
  if (meals) filters.meal_system = meals;
  const guests = csvOf<GuestPolicy>(params.guest_policy, GUEST_POLICIES);
  if (guests) filters.guest_policy = guests;
  const gate = one(params.gate_open_by);
  const gateClock = gate ? toClockTime(gate) : null;
  if (gateClock) filters.gate_open_by = gateClock;
  const availableBy = isoDate(params.available_by);
  if (availableBy) filters.available_by = availableBy;
  const sort = oneOf(params.sort_by, SORTS);
  if (sort) filters.sort_by = sort;
  return filters;
}

/** The URL params for a set of filters: only the ones in use. */
export function filtersToParams(filters: MessFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.campus_id) params.campus_id = filters.campus_id;
  if (filters.max_walk_min) params.max_walk_min = String(filters.max_walk_min);
  if (filters.gender) params.gender = filters.gender;
  if (filters.min_all_in) params.min_all_in = String(filters.min_all_in);
  if (filters.max_all_in) params.max_all_in = String(filters.max_all_in);
  if (filters.seat_type) params.seat_type = filters.seat_type;
  if (filters.washroom) params.washroom = filters.washroom;
  for (const key of BOOLEAN_KEYS) if (filters[key]) params[key] = "1";
  if (filters.meal_system?.length) params.meal_system = filters.meal_system.join(",");
  if (filters.guest_policy?.length) params.guest_policy = filters.guest_policy.join(",");
  if (filters.gate_open_by) params.gate_open_by = filters.gate_open_by;
  if (filters.available_by) params.available_by = filters.available_by;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  return params;
}

/**
 * filtersToParams, plus a blank for each owned param that is in the URL now and
 * should not be after, for router.setParams.
 */
export function filtersToParamPatch(filters: MessFilters, current: MessSearchParams): Record<string, string> {
  const patch = filtersToParams(filters);
  for (const key of MESS_PARAM_KEYS) {
    if (patch[key] === undefined && one(current[key]) !== undefined) patch[key] = "";
  }
  return patch;
}

/**
 * The GET /v1/mess query. Lists go as CSV, booleans only when true, and the walk
 * filter only with a campus (the API requires one).
 */
export function toApiParams(filters: MessFilters, page: number, limit: number): Record<string, string | number | boolean> {
  const { meal_system, guest_policy, max_walk_min, ...rest } = filters;
  const query: Record<string, string | number | boolean> = { page, limit };
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === false || value === "") continue;
    query[key] = value as string | number | boolean;
  }
  if (max_walk_min && filters.campus_id) query.max_walk_min = max_walk_min;
  if (meal_system?.length) query.meal_system = meal_system.join(",");
  if (guest_policy?.length) query.guest_policy = guest_policy.join(",");
  // Nearest first only means something with a campus to be near.
  if (query.sort_by === "walk_asc" && !filters.campus_id) delete query.sort_by;
  return query;
}

/** How many filters the person set, for the Filters button. Campus and sort are not filters. */
export function countActiveFilters(filters: MessFilters): number {
  let count = 0;
  // The walk limit is not applied without a campus, so it does not count either.
  if (filters.max_walk_min && filters.campus_id) count += 1;
  if (filters.gender) count += 1;
  if (filters.min_all_in || filters.max_all_in) count += 1;
  if (filters.seat_type) count += 1;
  if (filters.washroom) count += 1;
  for (const key of BOOLEAN_KEYS) if (filters[key]) count += 1;
  if (filters.meal_system?.length) count += 1;
  if (filters.guest_policy?.length) count += 1;
  if (filters.gate_open_by) count += 1;
  if (filters.available_by) count += 1;
  return count;
}

/** The filters with everything but the campus and sort cleared. */
export function clearedFilters(filters: MessFilters): MessFilters {
  const kept: MessFilters = {};
  if (filters.campus_id) kept.campus_id = filters.campus_id;
  if (filters.sort_by) kept.sort_by = filters.sort_by;
  return kept;
}
