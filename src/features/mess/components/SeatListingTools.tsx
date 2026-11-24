import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertCircle, CheckCircle2, Phone } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { AppButton } from "@/components/ui";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { showToast } from "@/lib/toast";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { FRESHNESS_HIDE_DAYS } from "../constants/vocabulary";
import { useConfirmAvailable, useSetSeatStatus } from "../hooks/useMessMutations";
import type { MyMessListing, Seat, SeatStatus } from "../types/mess";
import { daysSince, formatTaka } from "../utils/format";

/**
 * The seat-listing tools on My listings (PRD 1.4, 2.5): confirm a listing is still
 * available, mark seats filled, see how many students asked for the number.
 */

/** Confirmations older than this get the reminder styling, ahead of the 30-day cut-off. */
export const CONFIRM_REMINDER_DAYS = 14;

export interface SeatFreshness {
  /** Only a live listing is confirmed; the rest show no freshness at all. */
  live: boolean;
  /** Whole days since the lister last confirmed. */
  age: number;
  /** Two weeks or more: time to confirm again. */
  remind: boolean;
  /** Past the cut-off: search no longer shows it. */
  hidden: boolean;
}

export function seatFreshness(listing: Pick<MyMessListing, "status" | "last_confirmed_at">, now = Date.now()): SeatFreshness {
  const live = listing.status === "active";
  const age = daysSince(listing.last_confirmed_at, now);
  // Search drops a listing once its unrounded age passes the cut-off (30.2 days is
  // out), so test the exact age: the whole-day count would still say 30 and not hidden.
  const exactAge = (now - Date.parse(listing.last_confirmed_at)) / 86_400_000;
  return { live, age, remind: live && age >= CONFIRM_REMINDER_DAYS, hidden: live && exactAge > FRESHNESS_HIDE_DAYS };
}

/** "Last confirmed 3 days ago", amber from two weeks, red once search has hidden it. */
export function FreshnessLine({ listing }: { listing: MyMessListing }) {
  const { t, language } = useTranslation();
  const { live, age, remind, hidden } = seatFreshness(listing);
  if (!live) return null;
  const n = (value: number) => formatLocalizedNumber(value, language);
  const when = age === 0 ? t("mess.my.today") : age === 1 ? t("mess.my.yesterday") : t("mess.my.daysAgo", { count: n(age) });
  return (
    <View style={styles.stat}>
      {hidden ? (
        <AlertCircle size={14} color={colorTokens.errorText} />
      ) : (
        <CheckCircle2 size={14} color={remind ? colorTokens.warningText : colorTokens.brandText} />
      )}
      <Text style={[styles.statText, remind && styles.statWarn, hidden && styles.statHidden]}>
        {hidden ? t("mess.my.hidden", { count: n(age) }) : t("mess.my.lastConfirmed", { when })}
      </Text>
    </View>
  );
}

/** How many students asked for the number this week. Live listings only. */
export function RevealsLine({ listing }: { listing: MyMessListing }) {
  const { t, language } = useTranslation();
  if (listing.status !== "active") return null;
  const count = listing.reveals_7d;
  return (
    <View style={styles.stat}>
      <Phone size={14} color={colorTokens.muted} />
      <Text style={styles.statText}>
        {count === 0
          ? t("mess.my.revealsNone")
          : count === 1
            ? t("mess.my.revealsOne")
            : t("mess.my.reveals", { count: formatLocalizedNumber(count, language) })}
      </Text>
    </View>
  );
}

/** "Still available": resets the two-week reminder and keeps the listing in search. Says how it went. */
export function useConfirmSeatListing() {
  const { t } = useTranslation();
  const confirm = useConfirmAvailable();
  const run = async (id: string) => {
    try {
      await confirm.mutateAsync(id);
      showToast(t("mess.my.confirmed"));
    } catch {
      showToast(t("mess.my.confirmFailed"));
    }
  };
  return { confirm: run, pendingId: confirm.isPending ? confirm.variables : undefined };
}

export function ConfirmAvailableButton({ listing }: { listing: MyMessListing }) {
  const { t } = useTranslation();
  const { confirm, pendingId } = useConfirmSeatListing();
  if (listing.status !== "active") return null;
  return (
    <AppButton
      label={t("mess.my.confirm")}
      accessibilityLabel={t("seller.actionOn", { action: t("mess.my.confirm"), title: listingTitle(listing, t) })}
      icon={CheckCircle2}
      loading={pendingId === listing.id}
      onPress={() => void confirm(listing.id)}
    />
  );
}

/** Each seat with its rent and state, and, while the listing is live, the buttons that change it. */
export function SeatList({ listing }: { listing: MyMessListing }) {
  const { t, language } = useTranslation();
  const setSeat = useSetSeatStatus();
  const live = listing.status === "active";
  if (!listing.seats.length) return null;

  const onSeat = async (seat: Seat, status: SeatStatus) => {
    const lastOpen = status !== "available" && seat.status === "available" && listing.available_seats === 1;
    if (lastOpen && !(await confirmAction(t("mess.my.lastSeatTitle"), t("mess.my.lastSeatBody")))) return;
    try {
      await setSeat.mutateAsync({ id: listing.id, seatId: seat.id, status });
      showToast(t("mess.my.seatUpdated"));
    } catch {
      showToast(t("mess.my.seatFailed"));
    }
  };

  return (
    <View style={styles.seats} role="list">
      {listing.seats.map((seat) => {
        const name = `${seat.room_label} · ${t(`mess.seatType.${seat.seat_type}`)}`;
        const button = (action: string, status: SeatStatus) => (
          <SeatButton
            key={status}
            label={action}
            accessibilityLabel={t("mess.my.seatAction", { action, seat: name })}
            onPress={() => void onSeat(seat, status)}
            disabled={setSeat.isPending}
          />
        );
        return (
          <View key={seat.id} role="listitem" style={styles.seat}>
            <View style={styles.seatText}>
              <Text style={styles.seatTitle}>{name}</Text>
              <NoTranslateText style={styles.seatMeta}>
                {formatTaka(seat.rent, language)} · {t(`mess.seatStatus.${seat.status}`)}
              </NoTranslateText>
            </View>
            {live ? (
              <View style={styles.seatActions}>
                {seat.status !== "filled" ? button(t("mess.my.markFilled"), "filled") : null}
                {seat.status === "available" ? button(t("mess.my.markReserved"), "reserved") : button(t("mess.my.markOpen"), "available")}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function SeatButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ hovered, pressed }: { hovered?: boolean; pressed?: boolean }) => [
        styles.seatButton,
        hovered && styles.seatButtonHovered,
        pressed && styles.seatButtonPressed,
        disabled && styles.seatButtonOff,
        webPointer,
      ]}
    >
      <Text style={styles.seatButtonText}>{label}</Text>
    </Pressable>
  );
}

/** The listing's title, or a name for a draft that has none yet. */
export function listingTitle(listing: Pick<MyMessListing, "title">, t: ReturnType<typeof useTranslation>["t"]) {
  return listing.title || t("seller.untitledSeat");
}

const styles = StyleSheet.create({
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colorTokens.body },
  statWarn: { color: colorTokens.warningText },
  statHidden: { color: colorTokens.errorText },
  seats: { gap: 8 },
  seat: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surfaceSunken,
  },
  seatText: { flexGrow: 1, flexShrink: 1, gap: 2 },
  seatTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  seatMeta: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  seatActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seatButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
    backgroundColor: colorTokens.surface,
  },
  seatButtonHovered: { backgroundColor: colorTokens.brandSurface },
  seatButtonPressed: { opacity: 0.85 },
  seatButtonOff: { opacity: 0.5 },
  seatButtonText: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.brandText },
});
