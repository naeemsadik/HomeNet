/**
 * House-rule keys: derived from the structured mess fields, shown as badges and
 * matched against filters, so what a student filters on is exactly what they
 * see (PRD D4). The server derives the same keys for search results; the
 * wizard's preview and the dev fixtures derive them here.
 */
import type { TranslationKey } from "@/i18n";
import type { MessDetailsInput, MessFilters, RuleKey } from "../types/mess";
import { toClockTime, toCompactTime } from "./time";

export type RuleGroup = "quiet" | "smoking" | "meal" | "gate" | "guests" | "study";

/** Survey order of dealbreakers: noise, smoking, meals, gate; then guests and study. */
export const RULE_GROUP_ORDER: Record<RuleGroup, number> = {
  quiet: 0,
  smoking: 1,
  meal: 2,
  gate: 3,
  guests: 4,
  study: 5,
};

export interface RuleDescription {
  group: RuleGroup;
  labelKey: TranslationKey;
  /** "HH:mm", for keys that carry a time. */
  time?: string;
}

const FIXED_RULES: Record<string, Omit<RuleDescription, "time">> = {
  no_smoking_indoors: { group: "smoking", labelKey: "mess.rules.noSmokingIndoors" },
  smoking_balcony_only: { group: "smoking", labelKey: "mess.rules.smokingBalconyOnly" },
  smoking_allowed: { group: "smoking", labelKey: "mess.rules.smokingAllowed" },
  study_friendly: { group: "study", labelKey: "mess.rules.studyFriendly" },
  no_meal_system: { group: "meal", labelKey: "mess.rules.noMealSystem" },
  shared_bazar: { group: "meal", labelKey: "mess.rules.sharedBazar" },
  meal_manager: { group: "meal", labelKey: "mess.rules.mealManager" },
  cook_provided: { group: "meal", labelKey: "mess.rules.cookProvided" },
  self_cook: { group: "meal", labelKey: "mess.rules.selfCook" },
  guests_not_allowed: { group: "guests", labelKey: "mess.rules.guestsNotAllowed" },
  guests_day_only: { group: "guests", labelKey: "mess.rules.guestsDayOnly" },
  guests_overnight_with_notice: { group: "guests", labelKey: "mess.rules.guestsOvernightWithNotice" },
  guests_allowed: { group: "guests", labelKey: "mess.rules.guestsAllowed" },
};

const TIMED_RULES: { prefix: string; group: RuleGroup; labelKey: TranslationKey }[] = [
  { prefix: "quiet_after_", group: "quiet", labelKey: "mess.rules.quietAfter" },
  { prefix: "gate_opens_", group: "gate", labelKey: "mess.rules.gateOpens" },
  { prefix: "gate_closes_", group: "gate", labelKey: "mess.rules.gateCloses" },
];

/** What a rule key means, or null for a key this app version does not know (it is then not shown). */
export function describeRule(key: string): RuleDescription | null {
  const fixed = FIXED_RULES[key];
  if (fixed) return fixed;
  for (const timed of TIMED_RULES) {
    if (!key.startsWith(timed.prefix)) continue;
    const time = toClockTime(key.slice(timed.prefix.length));
    return time ? { group: timed.group, labelKey: timed.labelKey, time } : null;
  }
  return null;
}

const MEAL_RULE: Record<MessDetailsInput["meal_system"], RuleKey> = {
  none: "no_meal_system",
  shared_bazar: "shared_bazar",
  meal_manager: "meal_manager",
  cook_provided: "cook_provided",
  self_cook: "self_cook",
};

const SMOKING_RULE: Record<MessDetailsInput["smoking_policy"], RuleKey> = {
  not_allowed: "no_smoking_indoors",
  balcony_only: "smoking_balcony_only",
  allowed: "smoking_allowed",
};

type RuleSource = Partial<
  Pick<
    MessDetailsInput,
    "smoking_policy" | "quiet_hours_start" | "gate_open_time" | "gate_close_time" | "study_friendly" | "meal_system" | "guest_policy"
  >
>;

/** The rule keys a mess's structured fields produce. Missing fields produce no key. */
export function deriveRuleKeys(mess: RuleSource): RuleKey[] {
  const keys: RuleKey[] = [];
  if (mess.quiet_hours_start && toClockTime(mess.quiet_hours_start)) {
    keys.push(`quiet_after_${toCompactTime(toClockTime(mess.quiet_hours_start)!)}`);
  }
  if (mess.smoking_policy) keys.push(SMOKING_RULE[mess.smoking_policy]);
  if (mess.meal_system) keys.push(MEAL_RULE[mess.meal_system]);
  if (mess.gate_open_time && toClockTime(mess.gate_open_time)) {
    keys.push(`gate_opens_${toCompactTime(toClockTime(mess.gate_open_time)!)}`);
  }
  if (mess.gate_close_time && toClockTime(mess.gate_close_time)) {
    keys.push(`gate_closes_${toCompactTime(toClockTime(mess.gate_close_time)!)}`);
  }
  if (mess.guest_policy) keys.push(`guests_${mess.guest_policy}` as RuleKey);
  if (mess.study_friendly) keys.push("study_friendly");
  return keys;
}

/** Whether an active filter asked for this rule, so its badge is highlighted. */
export function ruleMatchesFilters(key: RuleKey, filters: MessFilters): boolean {
  if (filters.no_smoking && key === "no_smoking_indoors") return true;
  if (filters.study_friendly && key === "study_friendly") return true;
  if (filters.gate_open_by && key.startsWith("gate_opens_")) return true;
  if (filters.meal_system?.some((meal) => MEAL_RULE[meal] === key)) return true;
  if (filters.guest_policy?.some((policy) => `guests_${policy}` === key)) return true;
  return false;
}

/**
 * Known keys in display order: rules matching an active filter first, then by
 * survey order of dealbreakers. Unknown keys are dropped.
 */
export function sortRules(rules: readonly RuleKey[], highlighted: (key: RuleKey) => boolean = () => false): RuleKey[] {
  return rules
    .map((key) => ({ key, description: describeRule(key) }))
    .filter((entry): entry is { key: RuleKey; description: RuleDescription } => entry.description !== null)
    .sort(
      (a, b) =>
        Number(highlighted(b.key)) - Number(highlighted(a.key)) ||
        RULE_GROUP_ORDER[a.description.group] - RULE_GROUP_ORDER[b.description.group],
    )
    .map((entry) => entry.key);
}
