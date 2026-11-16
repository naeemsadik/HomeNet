import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AlertCircle, BedDouble, Building, CheckCircle2, Eye, Phone, Plus } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { PageMeta } from "@/components/PageMeta";
import { AppButton } from "@/components/ui";
import { SellerShell } from "@/features/seller/components/SellerShell";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { cdnImage } from "@/lib/cloudinaryImage";
import { startSeatListing } from "@/lib/startListing";
import { showToast } from "@/lib/toast";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { FRESHNESS_HIDE_DAYS } from "../constants/vocabulary";
import { useConfirmAvailable, useSetSeatStatus } from "../hooks/useMessMutations";
import { useMyMessListings } from "../hooks/useMessQueries";
import type { MyMessListing, Seat, SeatStatus } from "../types/mess";
import { daysSince, formatTaka, formatTakaRange } from "../utils/format";

/** Confirmations older than this get the reminder styling, ahead of the 30-day cut-off. */
const CONFIRM_REMINDER_DAYS = 14;

/**
 * The lister's seats: confirm a listing is still available, mark seats filled,
 * see how many students asked for the number (PRD 1.4, 2.5).
 */
export function MyMessListingsScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const listings = useMyMessListings();
  const items = listings.data?.items ?? [];

  return (
    <SellerShell activeNav="seats" title={t("mess.my.title")} showSearch={false}>
      <PageMeta title={t("mess.meta.myTitle")} noindex />
      <View style={[styles.page, isPhone && styles.pagePhone]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text accessibilityRole="header" aria-level={1} style={styles.h1}>
              {t("mess.my.title")}
            </Text>
            <Text style={styles.intro}>{t("mess.my.intro")}</Text>
          </View>
          <AppButton label={t("mess.my.create")} icon={Plus} onPress={startSeatListing} />
        </View>

        {listings.isPending ? (
          <ActivityIndicator color={colorTokens.brand} style={styles.loading} />
        ) : listings.isError ? (
          <View style={styles.state}>
            <Text style={styles.stateText}>{t("mess.my.loadFailed")}</Text>
            <AppButton label={t("mess.browse.retry")} onPress={() => void listings.refetch()} variant="secondary" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.state}>
            <BedDouble size={40} color={colorTokens.subtle} />
            <Text style={styles.stateText}>{t("mess.my.empty")}</Text>
            <AppButton label={t("mess.my.create")} icon={Plus} onPress={startSeatListing} />
          </View>
        ) : (
          <View style={styles.list} role="list">
            {items.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </View>
        )}
      </View>
    </SellerShell>
  );
}

function ListingRow({ listing }: { listing: MyMessListing }) {
  const { t, language } = useTranslation();
  const confirm = useConfirmAvailable();
  const setSeat = useSetSeatStatus();
  const n = (value: number) => formatLocalizedNumber(value, language);
  const age = daysSince(listing.last_confirmed_at);
  const isLive = listing.status === "active";
  const hidden = isLive && age > FRESHNESS_HIDE_DAYS;
  const remind = isLive && age >= CONFIRM_REMINDER_DAYS;
  const when = age === 0 ? t("mess.my.today") : age === 1 ? t("mess.my.yesterday") : t("mess.my.daysAgo", { count: n(age) });
  const editPath = `/mess/edit?id=${encodeURIComponent(listing.id)}`;

  const onConfirm = async () => {
    try {
      await confirm.mutateAsync(listing.id);
      showToast(t("mess.my.confirmed"));
    } catch {
      showToast(t("mess.my.confirmFailed"));
    }
  };

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
    <View role="listitem" style={styles.card}>
      <View style={styles.top}>
        <View style={styles.thumb}>
          {listing.cover ? (
            <Image source={{ uri: cdnImage(listing.cover.url, 240) }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
          ) : (
            <Building size={24} color={colorTokens.subtle} />
          )}
        </View>
        <View style={styles.summary}>
          <View style={styles.titleRow}>
            <View style={[styles.status, isLive ? styles.statusLive : styles.statusOther]}>
              <Text style={[styles.statusText, isLive && styles.statusTextLive]}>{t(`mess.my.status.${listing.status}`)}</Text>
            </View>
            {listing.area ? <Text style={styles.area}>{listing.area.name}</Text> : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title || t("mess.wizard.title")}
          </Text>
          {listing.all_in_min > 0 ? (
            <NoTranslateText style={styles.price}>
              {formatTakaRange(listing.all_in_min, listing.all_in_max, language, t)} <Text style={styles.perMonth}>{t("mess.cost.perMonth")}</Text>
            </NoTranslateText>
          ) : null}
          <Text style={styles.meta}>{t("mess.my.seatsOpen", { open: n(listing.available_seats), total: n(listing.seats.length) })}</Text>
        </View>
      </View>

      {isLive ? (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Phone size={14} color={colorTokens.muted} />
            <Text style={styles.statText}>
              {listing.reveals_7d === 0
                ? t("mess.my.revealsNone")
                : listing.reveals_7d === 1
                  ? t("mess.my.revealsOne")
                  : t("mess.my.reveals", { count: n(listing.reveals_7d) })}
            </Text>
          </View>
          <View style={styles.stat}>
            {hidden ? <AlertCircle size={14} color={colorTokens.errorText} /> : <CheckCircle2 size={14} color={remind ? colorTokens.warningText : colorTokens.brandText} />}
            <Text style={[styles.statText, remind && styles.statWarn, hidden && styles.statHidden]}>
              {hidden ? t("mess.my.hidden", { count: n(age) }) : t("mess.my.lastConfirmed", { when })}
            </Text>
          </View>
        </View>
      ) : null}

      {listing.seats.length ? (
        <View style={styles.seats}>
          {listing.seats.map((seat) => (
            <View key={seat.id} style={styles.seat}>
              <View style={styles.seatText}>
                <Text style={styles.seatTitle}>
                  {seat.room_label} · {t(`mess.seatType.${seat.seat_type}`)}
                </Text>
                <NoTranslateText style={styles.seatMeta}>
                  {formatTaka(seat.rent, language)} · {t(`mess.seatStatus.${seat.status}`)}
                </NoTranslateText>
              </View>
              {isLive ? (
                <View style={styles.seatActions}>
                  {seat.status !== "filled" ? (
                    <SeatButton label={t("mess.my.markFilled")} onPress={() => void onSeat(seat, "filled")} disabled={setSeat.isPending} />
                  ) : null}
                  {seat.status === "available" ? (
                    <SeatButton label={t("mess.my.markReserved")} onPress={() => void onSeat(seat, "reserved")} disabled={setSeat.isPending} />
                  ) : (
                    <SeatButton label={t("mess.my.markOpen")} onPress={() => void onSeat(seat, "available")} disabled={setSeat.isPending} />
                  )}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        {isLive ? (
          <AppButton label={t("mess.my.confirm")} icon={CheckCircle2} loading={confirm.isPending} onPress={() => void onConfirm()} />
        ) : null}
        <AppButton
          label={listing.status === "draft" ? t("mess.my.continue") : t("mess.my.edit")}
          onPress={() => router.push(editPath as never)}
          variant="secondary"
        />
        {isLive || listing.status === "pending" ? (
          <AppButton label={t("mess.my.view")} icon={Eye} onPress={() => router.push(`/mess/${listing.id}` as never)} variant="ghost" />
        ) : null}
      </View>
    </View>
  );
}

function SeatButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ hovered }: { hovered?: boolean }) => [styles.seatButton, hovered && styles.seatButtonHovered, disabled && styles.seatButtonOff, webPointer]}
    >
      <Text style={styles.seatButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 900, padding: 24, gap: 20 },
  pagePhone: { padding: 16 },
  header: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  headerText: { flex: 1, minWidth: 220, gap: 4 },
  h1: { fontFamily: fonts.headingExtraBold, fontSize: 26, lineHeight: 34, color: colorTokens.ink },
  intro: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colorTokens.muted },
  loading: { paddingVertical: 48 },
  state: { alignItems: "center", gap: 12, paddingVertical: 48 },
  stateText: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.muted, textAlign: "center" },
  list: { gap: 16 },
  card: { gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colorTokens.border, backgroundColor: colorTokens.surface },
  top: { flexDirection: "row", gap: 14 },
  thumb: { width: 96, height: 76, borderRadius: radius.md, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colorTokens.surfaceSunken },
  summary: { flex: 1, gap: 4 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  status: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  statusLive: { backgroundColor: colorTokens.brandSurface },
  statusOther: { backgroundColor: colorTokens.surfaceSunken },
  statusText: { fontFamily: fonts.semiBold, fontSize: 11, color: colorTokens.body },
  statusTextLive: { color: colorTokens.brandText },
  area: { fontFamily: fonts.medium, fontSize: 12, color: colorTokens.muted },
  title: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22, color: colorTokens.ink },
  price: { fontFamily: fonts.bold, fontSize: 15, color: colorTokens.ink },
  perMonth: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colorTokens.muted },
  stats: { gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: colorTokens.divider },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 13, color: colorTokens.body },
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
  seatActions: { flexDirection: "row", gap: 6 },
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
  seatButtonOff: { opacity: 0.5 },
  seatButtonText: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.brandText },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
