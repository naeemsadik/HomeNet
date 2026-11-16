import { deriveRuleKeys, describeRule, ruleMatchesFilters, sortRules } from "../rules";
import { formatClock, minutesOfDay, toClockTime } from "../time";
import type { RuleKey } from "../../types/mess";

describe("deriveRuleKeys", () => {
  it("turns the structured fields into the keys the badges and filters share", () => {
    expect(
      deriveRuleKeys({
        smoking_policy: "not_allowed",
        quiet_hours_start: "23:00",
        gate_open_time: "05:00",
        gate_close_time: "23:30",
        study_friendly: true,
        meal_system: "meal_manager",
        guest_policy: "day_only",
      }),
    ).toEqual(["quiet_after_2300", "no_smoking_indoors", "meal_manager", "gate_opens_0500", "gate_closes_2330", "guests_day_only", "study_friendly"]);
  });

  it("leaves out what the lister did not give", () => {
    expect(deriveRuleKeys({ smoking_policy: "allowed", study_friendly: false, quiet_hours_start: null })).toEqual(["smoking_allowed"]);
  });
});

describe("describeRule", () => {
  it("reads the time out of a timed key", () => {
    expect(describeRule("gate_opens_0500")).toEqual({ group: "gate", labelKey: "mess.rules.gateOpens", time: "05:00" });
  });

  it("returns null for keys this app does not know, so they are not shown", () => {
    expect(describeRule("pets_allowed")).toBeNull();
    expect(describeRule("gate_opens_2599")).toBeNull();
  });
});

describe("sortRules", () => {
  const rules: RuleKey[] = ["guests_day_only", "meal_manager", "gate_opens_0500", "no_smoking_indoors", "quiet_after_2300", "study_friendly"];

  it("puts dealbreakers in survey order: noise, smoking, meals, gate", () => {
    expect(sortRules(rules).slice(0, 4)).toEqual(["quiet_after_2300", "no_smoking_indoors", "meal_manager", "gate_opens_0500"]);
  });

  it("puts rules that match an active filter first", () => {
    const sorted = sortRules(rules, (key) => ruleMatchesFilters(key, { study_friendly: true }));
    expect(sorted[0]).toBe("study_friendly");
  });

  it("drops unknown keys", () => {
    expect(sortRules(["pets_allowed" as RuleKey, "study_friendly"])).toEqual(["study_friendly"]);
  });
});

describe("ruleMatchesFilters", () => {
  it("matches each rule filter to its badge", () => {
    expect(ruleMatchesFilters("no_smoking_indoors", { no_smoking: true })).toBe(true);
    expect(ruleMatchesFilters("gate_opens_0500", { gate_open_by: "05:30" })).toBe(true);
    expect(ruleMatchesFilters("meal_manager", { meal_system: ["meal_manager", "self_cook"] })).toBe(true);
    expect(ruleMatchesFilters("guests_day_only", { guest_policy: ["day_only"] })).toBe(true);
    expect(ruleMatchesFilters("smoking_allowed", { no_smoking: true })).toBe(false);
  });
});

describe("time helpers", () => {
  it("normalises and compares 24-hour times", () => {
    expect(toClockTime("0530")).toBe("05:30");
    expect(toClockTime("24:00")).toBeNull();
    expect(minutesOfDay("05:30")).toBe(330);
  });

  it("formats a clock time for each language", () => {
    expect(formatClock("05:00", "en")).toBe("5:00 am");
    expect(formatClock("23:00", "en")).toBe("11:00 pm");
    expect(formatClock("00:30", "en")).toBe("12:30 am");
    expect(formatClock("05:00", "bn")).toBe("ভোর ৫:০০");
    expect(formatClock("23:00", "bn")).toBe("রাত ১১:০০");
  });
});
