import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Info } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, webPointer } from "@/theme";
import { formatTaka, formatTakaRange } from "../utils/format";

/**
 * The headline price: the all-in monthly cost for one seat, with rent and bills
 * split underneath (PRD D1). With `onPress` it is a button that opens the
 * cost breakdown.
 */
export function AllInCostTag({
  min,
  max,
  rent,
  onPress,
  size = "md",
  style,
}: {
  min: number;
  max: number;
  rent: number;
  onPress?: () => void;
  size?: "md" | "lg";
  style?: StyleProp<ViewStyle>;
}) {
  const { t, language } = useTranslation();

  if (min <= 0) {
    return (
      <View style={style}>
        <Text style={styles.none}>{t("mess.cost.noOpenSeat")}</Text>
      </View>
    );
  }

  const price = formatTakaRange(min, max, language, t);
  const billsMin = Math.max(0, min - rent);
  const billsMax = Math.max(0, max - rent);
  const subLine =
    billsMax === 0
      ? t("mess.cost.billsIncluded", { rent: formatTaka(rent, language) })
      : t("mess.cost.rentPlusBills", { rent: formatTaka(rent, language), bills: formatTakaRange(billsMin, billsMax, language, t) });

  const body = (
    <>
      <View style={styles.priceRow}>
        <NoTranslateText style={[styles.price, size === "lg" && styles.priceLarge]}>{price}</NoTranslateText>
        <Text style={styles.perMonth}>{t("mess.cost.perMonth")}</Text>
        {onPress ? <Info size={15} color={colorTokens.brandText} /> : null}
      </View>
      <NoTranslateText style={styles.subLine}>{subLine}</NoTranslateText>
    </>
  );

  if (!onPress) return <View style={[styles.wrap, style]}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("mess.cost.openBreakdown", { price })}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, styles.pressable, webPointer, pressed && styles.pressed, style]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  pressable: { alignSelf: "flex-start" },
  pressed: { opacity: 0.75 },
  priceRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6 },
  price: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 24, color: colorTokens.ink },
  priceLarge: { fontSize: 26, lineHeight: 32 },
  perMonth: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.muted },
  subLine: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted },
  none: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.muted },
});
