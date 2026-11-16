/**
 * The small facts a listing card and detail header share: walking time,
 * occupancy, trust badges, freshness and who the mess is for.
 */
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { BadgeCheck, Clock, Footprints, Receipt, Users } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import type { MessCard, MessGenderPolicy } from "../types/mess";
import { daysSince, formatDistance } from "../utils/format";

/** "12 min walk to UIU", or "About 1.2 km to UIU" when routing fell back to a straight line. Nothing without a campus. */
export function CampusDistanceChip({ walk }: { walk: MessCard["walk"] }) {
  const { t, language } = useTranslation();
  if (!walk) return null;
  const label = walk.approximate
    ? t("mess.walk.approx", { distance: formatDistance(walk.walking_m, language, t), campus: walk.campus_short })
    : t("mess.walk.minutes", { minutes: formatLocalizedNumber(walk.walking_min, language), campus: walk.campus_short });
  return (
    <View
      style={[styles.pill, styles.walkPill]}
      accessibilityLabel={walk.approximate ? `${label}. ${t("mess.walk.approxNote")}` : label}
    >
      <Footprints size={13} color={colorTokens.brandText} />
      <NoTranslateText style={[styles.pillText, styles.walkText]}>{label}</NoTranslateText>
    </View>
  );
}

export function VerifiedBadge() {
  const { t } = useTranslation();
  return (
    <View style={[styles.pill, styles.verifiedPill]}>
      <BadgeCheck size={13} color={colorTokens.info} />
      <Text style={[styles.pillText, { color: colorTokens.info }]}>{t("mess.trust.verified")}</Text>
    </View>
  );
}

export function CostsDeclaredBadge() {
  const { t } = useTranslation();
  return (
    <View style={[styles.pill, styles.neutralPill]}>
      <Receipt size={13} color={colorTokens.body} />
      <Text style={styles.pillText}>{t("mess.trust.costsDeclared")}</Text>
    </View>
  );
}

/** "3 living here · 1 seat open · 4 per washroom · Common washroom" (PRD D3). */
export function OccupancySnapshot({ occupancy, style }: { occupancy: MessCard["occupancy"]; style?: StyleProp<ViewStyle> }) {
  const { t, language } = useTranslation();
  const n = (value: number) => formatLocalizedNumber(value, language);
  const parts = [
    occupancy.current_residents === 0
      ? t("mess.occupancy.livingNone")
      : occupancy.current_residents === 1
        ? t("mess.occupancy.livingOne")
        : t("mess.occupancy.living", { count: n(occupancy.current_residents) }),
    occupancy.available_seats === 1 ? t("mess.occupancy.openOne") : t("mess.occupancy.open", { count: n(occupancy.available_seats) }),
    t("mess.occupancy.perWashroom", { count: n(occupancy.per_washroom) }),
    ...occupancy.washrooms.map((kind) => t(`mess.washroom.${kind}`)),
  ];
  return (
    <View style={[styles.row, style]}>
      <Users size={14} color={colorTokens.muted} />
      <NoTranslateText style={styles.occupancy}>{parts.join(" · ")}</NoTranslateText>
    </View>
  );
}

/** "Confirmed available 2 days ago". Hidden while fresher than `hideUnderDays`. */
export function FreshnessStamp({ confirmedAt, hideUnderDays = 0 }: { confirmedAt: string; hideUnderDays?: number }) {
  const { t, language } = useTranslation();
  const days = daysSince(confirmedAt);
  if (days < hideUnderDays) return null;
  const label =
    days === 0 ? t("mess.freshness.today") : days === 1 ? t("mess.freshness.yesterday") : t("mess.freshness.days", { count: formatLocalizedNumber(days, language) });
  return (
    <View style={styles.row}>
      <Clock size={13} color={colorTokens.muted} />
      <Text style={styles.freshness}>{label}</Text>
    </View>
  );
}

/** Who the mess is for. Neutral styling: the words carry the meaning, not a colour. */
export function GenderBadge({ gender, style }: { gender: MessGenderPolicy; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.genderBadge, style]}>
      <Text style={styles.genderText}>{t(`mess.gender.${gender}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  pillText: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 16, color: colorTokens.body },
  walkPill: { backgroundColor: colorTokens.brandSurface },
  walkText: { color: colorTokens.brandText },
  verifiedPill: { backgroundColor: colorTokens.infoSurface },
  neutralPill: { backgroundColor: colorTokens.surfaceSunken },
  occupancy: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.body },
  freshness: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  genderBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
  },
  genderText: { fontFamily: fonts.semiBold, fontSize: 12, color: colorTokens.ink },
});
