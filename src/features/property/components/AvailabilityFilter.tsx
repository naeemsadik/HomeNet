import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";
import { pressedState } from "@/lib/a11yState";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { Availability, SearchPurpose } from "../utils/searchFilters";

/**
 * Open listings or closed ones, on /buy and /rent.
 *
 * The second segment is named for what the reader is looking at — "Sold" when
 * browsing sales, "Rented" when browsing lets — because the backend's one
 * closed status is "sold" and calling a let that on screen would be wrong.
 *
 * Geometry does not move between states: both segments keep the same font and
 * the same padding, and only the fill and the text colour change. A weight
 * change here would reflow the toolbar on every press.
 */
export function AvailabilityFilter({
  purpose,
  value,
  onChange,
}: {
  purpose: SearchPurpose;
  value: Availability;
  onChange: (next: Availability) => void;
}) {
  const { t } = useTranslation();
  const rentLike = purpose === "rent" || purpose === "short-let";

  const segments: { key: Availability; label: string; hint: string }[] = [
    {
      key: "available",
      label: t("availability.available"),
      hint: t("availability.showAvailable"),
    },
    {
      key: "closed",
      label: rentLike ? t("availability.rented") : t("availability.sold"),
      hint: rentLike ? t("availability.showRented") : t("availability.showSold"),
    },
  ];

  return (
    <View
      accessibilityRole="radiogroup"
      aria-label={t("availability.legend")}
      style={styles.group}
    >
      {segments.map((segment) => {
        // "any" is a legacy URL state with no segment of its own; it reads as
        // neither, which is honest — nothing is highlighted.
        const selected = value === segment.key;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="radio"
            accessibilityLabel={segment.hint}
            {...pressedState(selected)}
            onPress={() => onChange(segment.key)}
            style={({ hovered }: { hovered?: boolean }) => [
              styles.segment,
              hovered && !selected && styles.segmentHovered,
              selected && styles.segmentSelected,
              webPointer,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{segment.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: 2,
    gap: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  segment: {
    // 40 + 2px of container padding on each side clears the 44px target.
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  segmentHovered: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  segmentSelected: {
    // Ink rather than brand: this reports what you are looking at, it is not
    // the page's primary action.
    backgroundColor: colorTokens.ink,
  },
  label: {
    color: colorTokens.body,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    lineHeight: 20,
  },
  labelSelected: {
    color: colorTokens.onInk,
  },
});
