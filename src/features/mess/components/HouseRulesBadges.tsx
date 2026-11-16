import { StyleSheet, Text, View } from "react-native";
import { BookOpen, CigaretteOff, DoorOpen, UserCheck, Utensils, VolumeX, type LucideIcon } from "@/components/icons";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import type { RuleKey } from "../types/mess";
import { describeRule, sortRules, type RuleGroup } from "../utils/rules";
import { formatClock } from "../utils/time";

const ICONS: Record<RuleGroup, LucideIcon> = {
  quiet: VolumeX,
  smoking: CigaretteOff,
  meal: Utensils,
  gate: DoorOpen,
  guests: UserCheck,
  study: BookOpen,
};

export interface HouseRulesBadgesProps {
  rules: RuleKey[];
  /** How many to show before "+N". Omit to show all. */
  max?: number;
  /** Rules matching an active filter: shown first and highlighted. */
  highlight?: RuleKey[];
  size?: "sm" | "md";
}

/**
 * House rules as badges, phrased as what the house is (PRD D4). Survey order
 * of dealbreakers: noise, smoking, meals, gate.
 */
export function HouseRulesBadges({ rules, max, highlight = [], size = "sm" }: HouseRulesBadgesProps) {
  const { t, language } = useTranslation();
  const sorted = sortRules(rules, (key) => highlight.includes(key));
  const shown = max === undefined ? sorted : sorted.slice(0, max);
  const hidden = sorted.length - shown.length;
  if (sorted.length === 0) return null;

  return (
    <View style={styles.row} role="list">
      {shown.map((key) => {
        const description = describeRule(key)!;
        const Icon = ICONS[description.group];
        const on = highlight.includes(key);
        const label = t(description.labelKey, description.time ? { time: formatClock(description.time, language) } : undefined);
        return (
          <View key={key} role="listitem" style={[styles.badge, size === "md" && styles.badgeMd, on && styles.on]}>
            <Icon size={size === "sm" ? 12 : 14} color={on ? colorTokens.brandText : colorTokens.muted} />
            <Text style={[styles.text, size === "md" && styles.textMd, on && styles.textOn]}>{label}</Text>
          </View>
        );
      })}
      {hidden > 0 ? (
        <View style={styles.badge} role="listitem" accessibilityLabel={t("mess.rules.moreLabel", { count: hidden })}>
          <Text style={styles.text}>{t("mess.rules.more", { count: formatLocalizedNumber(hidden, language) })}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
  },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 6 },
  on: { backgroundColor: colorTokens.brandSurface },
  text: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colorTokens.body },
  textMd: { fontSize: 13, lineHeight: 18 },
  textOn: { color: colorTokens.brandText },
});
