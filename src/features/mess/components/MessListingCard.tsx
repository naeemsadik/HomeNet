import { pressedState } from "@/lib/a11yState";
import { memo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Building, Heart } from "@/components/icons";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { FRESHNESS_CARD_DAYS } from "../constants/vocabulary";
import type { MessCard, RuleKey, VibeTag } from "../types/mess";
import { formatDistance, formatTakaRange } from "../utils/format";
import { AllInCostTag } from "./AllInCostTag";
import { HouseRulesBadges } from "./HouseRulesBadges";
import {
  CampusDistanceChip,
  CostsDeclaredBadge,
  FreshnessStamp,
  GenderBadge,
  OccupancySnapshot,
  VerifiedBadge,
} from "./ListingFacts";

export interface MessListingCardProps {
  item: MessCard;
  onPress: (id: string) => void;
  /** Warms the detail page's data when a press starts. */
  onPressIn?: (id: string) => void;
  /** Opens the cost breakdown. Without it the price is not a button. */
  onPressPrice?: (id: string) => void;
  activeRuleFilters?: RuleKey[];
  /** P1: the seeker's lifestyle tags, for the match summary. */
  myTags?: VibeTag[];
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * A search result, information layered in the order students decide (PRD
 * 1.5, card anatomy): photo, title, all-in price, trust row, occupancy, rules.
 *
 * The price and the heart are their own buttons, so they sit beside the
 * card's links rather than inside them (a button inside a link is announced
 * wrongly and cannot be reached by keyboard). The lower link repeats the
 * upper one for pointer users and is hidden from screen readers, whose link
 * label already says everything the card shows.
 */
function MessListingCardComponent({
  item,
  onPress,
  onPressIn,
  onPressPrice,
  activeRuleFilters = [],
  saved = false,
  onToggleSave,
  style,
}: MessListingCardProps) {
  const { t, language } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const cover = item.cover && !imageFailed ? item.cover.url : null;
  const highlight = item.rules.filter((key) => activeRuleFilters.includes(key));

  const summary = [
    item.title,
    item.cost.all_in_min > 0 ? `${formatTakaRange(item.cost.all_in_min, item.cost.all_in_max, language, t)} ${t("mess.cost.perMonth")}` : t("mess.cost.noOpenSeat"),
    item.walk
      ? item.walk.approximate
        ? t("mess.walk.approx", { distance: formatDistance(item.walk.walking_m, language, t), campus: item.walk.campus_short })
        : t("mess.walk.minutes", { minutes: formatLocalizedNumber(item.walk.walking_min, language), campus: item.walk.campus_short })
      : null,
    t(`mess.gender.${item.gender_policy}`),
    item.occupancy.available_seats === 1
      ? t("mess.occupancy.openOne")
      : t("mess.occupancy.open", { count: formatLocalizedNumber(item.occupancy.available_seats, language) }),
  ]
    .filter(Boolean)
    .join(", ");

  const open = () => onPress(item.id);
  const pressIn = () => onPressIn?.(item.id);

  return (
    <View style={[styles.card, style]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={summary}
        onPress={open}
        onPressIn={pressIn}
        style={({ hovered }: { hovered?: boolean }) => [styles.top, webPointer, hovered && styles.hovered]}
      >
        <View style={styles.media}>
          {cover ? (
            <Image
              source={{ uri: cdnImage(cover, 640) }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              onError={() => setImageFailed(true)}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={styles.placeholder}>
              <Building size={32} color={colorTokens.subtle} />
              <Text style={styles.placeholderText}>{t("mess.card.noPhoto")}</Text>
            </View>
          )}
          <GenderBadge gender={item.gender_policy} style={styles.genderBadge} />
        </View>
        <View style={styles.head}>
          <Text style={styles.kicker} numberOfLines={1}>
            {[t(`mess.subtype.${item.subtype}`), item.area?.name].filter(Boolean).join(" · ")}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Pressable>

      <View style={styles.price}>
        <AllInCostTag
          min={item.cost.all_in_min}
          max={item.cost.all_in_max}
          rent={item.cost.rent_from}
          onPress={onPressPrice ? () => onPressPrice(item.id) : undefined}
        />
      </View>

      <Pressable
        aria-hidden
        accessibilityElementsHidden
        focusable={false}
        importantForAccessibility="no-hide-descendants"
        onPress={open}
        onPressIn={pressIn}
        style={[styles.bottom, webPointer]}
        tabIndex={-1}
      >
        {item.walk || item.is_verified || item.cost.costs_complete ? (
          <View style={styles.trustRow}>
            <CampusDistanceChip walk={item.walk} />
            {item.is_verified ? <VerifiedBadge /> : null}
            {item.cost.costs_complete ? <CostsDeclaredBadge /> : null}
          </View>
        ) : null}
        <OccupancySnapshot occupancy={item.occupancy} />
        <HouseRulesBadges rules={item.rules} max={3} highlight={highlight} />
        <FreshnessStamp confirmedAt={item.last_confirmed_at} hideUnderDays={FRESHNESS_CARD_DAYS} />
      </Pressable>

      {onToggleSave ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? t("mess.card.unsave") : t("mess.card.save")}
          {...pressedState(saved)}
          hitSlop={8}
          onPress={() => onToggleSave(item.id)}
          style={({ pressed }) => [styles.save, webPointer, pressed && styles.savePressed]}
        >
          <Heart size={20} color={saved ? colorTokens.saved : colorTokens.ink} fill={saved ? colorTokens.saved : "transparent"} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

export const MessListingCard = memo(MessListingCardComponent);

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    overflow: "hidden",
    ...Platform.select({ web: { boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)" } as ViewStyle, default: { elevation: 1 } }),
  },
  top: {},
  hovered: { opacity: 0.96 },
  media: { aspectRatio: 16 / 10, backgroundColor: colorTokens.surfaceSunken },
  placeholder: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 6 },
  placeholderText: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  genderBadge: { position: "absolute", top: 10, left: 10 },
  head: { paddingHorizontal: 14, paddingTop: 12, gap: 4 },
  kicker: { fontFamily: fonts.medium, fontSize: 12, color: colorTokens.muted },
  title: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22, color: colorTokens.ink },
  price: { paddingHorizontal: 14, paddingTop: 8 },
  bottom: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, gap: 10 },
  trustRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  save: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  savePressed: { opacity: 0.8 },
});
