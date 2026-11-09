import { StyleSheet, Text, View } from "react-native";
import { BedDouble } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import type { Seat, UtilityCharge } from "../types/mess";
import { allInCost } from "../utils/allInCost";
import { formatDate, formatTaka, formatTakaRange, todayIso } from "../utils/format";

/** Every seat: room, single or shared, washroom, balcony, rent, all-in and when it is free. Open seats first. */
export function SeatAvailabilityList({ seats, charges }: { seats: Seat[]; charges: UtilityCharge[] }) {
  const { t, language } = useTranslation();
  const today = todayIso();
  const order = { available: 0, reserved: 1, filled: 2 } as const;
  const sorted = [...seats].sort((a, b) => order[a.status] - order[b.status] || a.rent - b.rent);

  return (
    <View style={styles.list} role="list">
      {sorted.map((seat) => {
        const cost = allInCost(seat.rent, charges);
        const open = seat.status === "available";
        const details = [
          t(`mess.seatType.${seat.seat_type}`),
          seat.seat_type === "shared" ? t("mess.seat.beds", { count: formatLocalizedNumber(seat.beds_in_room, language) }) : null,
          t(`mess.washroom.${seat.washroom}`),
          seat.has_balcony ? t("mess.seat.balcony") : null,
        ].filter(Boolean);
        return (
          <View key={seat.id} role="listitem" style={[styles.row, !open && styles.rowClosed]}>
            <BedDouble size={20} color={open ? colorTokens.brandText : colorTokens.subtle} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.room}>{seat.room_label}</Text>
                <View style={[styles.status, open ? styles.statusOpen : styles.statusClosed]}>
                  <Text style={[styles.statusText, open && styles.statusTextOpen]}>{t(`mess.seatStatus.${seat.status}`)}</Text>
                </View>
              </View>
              <Text style={styles.details}>{details.join(" · ")}</Text>
              {open ? (
                <Text style={styles.details}>
                  {seat.available_from <= today ? t("mess.seat.availableNow") : t("mess.seat.availableFrom", { date: formatDate(seat.available_from, language) })}
                </Text>
              ) : null}
            </View>
            <View style={styles.prices}>
              <NoTranslateText style={styles.rent}>{formatTaka(seat.rent, language)}</NoTranslateText>
              <NoTranslateText style={styles.allIn}>
                {t("mess.seat.allIn", { price: formatTakaRange(cost.min, cost.max, language, t) })}
              </NoTranslateText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  rowClosed: { backgroundColor: colorTokens.surfaceSunken },
  body: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  room: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  status: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  statusOpen: { backgroundColor: colorTokens.brandSurface },
  statusClosed: { backgroundColor: colorTokens.surface },
  statusText: { fontFamily: fonts.semiBold, fontSize: 11, color: colorTokens.muted },
  statusTextOpen: { color: colorTokens.brandText },
  details: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted },
  prices: { alignItems: "flex-end", gap: 2 },
  rent: { fontFamily: fonts.bold, fontSize: 15, color: colorTokens.ink },
  allIn: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted, textAlign: "right" },
});
