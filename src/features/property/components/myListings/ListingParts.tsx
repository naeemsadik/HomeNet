import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { BedDouble, Building2, CheckCircle2, ChevronDown, Eye, Heart, MessageSquare, Phone } from "@/components/icons";
import { AppButton, AppLink } from "@/components/ui";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { ListingAction } from "./useListingActions";
import type { ListingView, StatusTone } from "./listingView";

const TONES: Record<StatusTone, { backgroundColor: string; color: string }> = {
  positive: { backgroundColor: colorTokens.brandSurface, color: colorTokens.brandText },
  review: { backgroundColor: colorTokens.warningSurface, color: colorTokens.warningText },
  negative: { backgroundColor: colorTokens.errorSurface, color: colorTokens.errorText },
  neutral: { backgroundColor: colorTokens.surfaceSunken, color: colorTokens.body },
  quiet: { backgroundColor: colorTokens.surfaceSunken, color: colorTokens.muted },
};

export function StatusChip({ view }: { view: ListingView }) {
  const tone = TONES[view.statusTone];
  return (
    <View style={[styles.chip, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.chipText, { color: tone.color }]}>{view.statusLabel}</Text>
    </View>
  );
}

/** For Sale / For Rent, or Shared living with a bed, so a seat listing reads apart at a glance. */
export function KindBadge({ view }: { view: ListingView }) {
  if (!view.badge) return null;
  return (
    <View style={[styles.badge, view.sharedLiving && styles.badgeShared]}>
      {view.sharedLiving ? <BedDouble size={12} color={colorTokens.brandText} /> : null}
      <Text numberOfLines={1} style={[styles.badgeText, view.sharedLiving && styles.badgeTextShared]}>
        {view.badge}
      </Text>
    </View>
  );
}

export function ListingThumb({ view, size }: { view: ListingView; size: "row" | "card" }) {
  const box = size === "row" ? styles.thumbRow : styles.thumbCard;
  if (!view.imageUrl) {
    return (
      <View style={[box, styles.thumbEmpty]}>
        {view.sharedLiving ? <BedDouble color={colorTokens.subtle} size={20} /> : <Building2 color={colorTokens.subtle} size={20} />}
      </View>
    );
  }
  return <Image source={{ uri: view.imageUrl }} accessibilityLabel={view.title} style={box} />;
}

export function VerifiedMark({ view }: { view: ListingView }) {
  const { t } = useTranslation();
  if (!view.isVerified) return null;
  return (
    <View accessibilityLabel={t("seller.verified")} accessibilityRole="image">
      <CheckCircle2 color={colorTokens.brandText} size={16} />
    </View>
  );
}

/** Views, saves and enquiries for a property; seats open and number requests for a seat listing. */
export function ListingMetrics({ view, layout }: { view: ListingView; layout: "row" | "card" }) {
  const { t, language } = useTranslation();
  const n = (value: number) => formatLocalizedNumber(value, language);
  if (view.seat) {
    const seat = view.seat;
    const live = view.status === "active";
    const reveals =
      seat.reveals_7d === 0
        ? t("mess.my.revealsNone")
        : seat.reveals_7d === 1
          ? t("mess.my.revealsOne")
          : t("mess.my.reveals", { count: n(seat.reveals_7d) });
    return (
      <View style={[styles.metrics, layout === "row" && styles.metricsStacked]}>
        <Text style={styles.metricText}>{t("mess.my.seatsOpen", { open: n(seat.available_seats), total: n(seat.seats.length) })}</Text>
        {live && layout === "row" ? (
          <View style={styles.metric} accessible accessibilityLabel={reveals}>
            <Phone color={colorTokens.muted} size={14} />
            <Text style={styles.metricText}>{t("seller.revealsThisWeek", { count: n(seat.reveals_7d) })}</Text>
          </View>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.metrics}>
      <Metric icon={<Eye color={colorTokens.muted} size={14} />} value={view.views ?? n(0)} label={t("seller.metrics.views")} />
      <Metric icon={<Heart color={colorTokens.muted} size={14} />} value={n(0)} label={t("seller.metrics.saves")} />
      <Metric icon={<MessageSquare color={colorTokens.muted} size={14} />} value={n(0)} label={t("seller.metrics.enquiries")} />
    </View>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <View style={styles.metric} accessible accessibilityLabel={`${label}: ${value}`}>
      {icon}
      <Text style={styles.metricText}>{value}</Text>
    </View>
  );
}

/** Shows or hides a seat listing's seats. Says whether it is open. */
export function SeatsToggle({ view, expanded, onToggle }: { view: ListingView; expanded: boolean; onToggle: () => void }) {
  const { t, language } = useTranslation();
  if (!view.seat?.seats.length) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("seller.seatsFor", { title: view.title })}
      aria-expanded={expanded}
      hitSlop={6}
      onPress={onToggle}
      style={({ pressed }) => [styles.toggle, webPointer, pressed && styles.pressed]}
    >
      <Text style={styles.toggleText}>{t("seller.seatsToggle", { count: formatLocalizedNumber(view.seat.seats.length, language) })}</Text>
      <ChevronDown color={colorTokens.brandText} size={16} style={expanded ? styles.chevronOpen : undefined} />
    </Pressable>
  );
}

const ACTION_COLOR: Record<ListingAction["tone"], string> = {
  default: colorTokens.body,
  brand: colorTokens.brandText,
  danger: colorTokens.errorText,
};

/** One action on a phone card: a link for Edit and View, a button for the rest. */
export function CardAction({ action }: { action: ListingAction }) {
  const Icon = action.icon;
  const color = ACTION_COLOR[action.tone];
  const content = (
    <>
      <Icon color={color} size={15} />
      <Text style={[styles.cardActionText, { color }]}>{action.label}</Text>
    </>
  );
  if (action.href) {
    return (
      <AppLink href={action.href} accessibilityLabel={action.accessibilityLabel} style={styles.cardAction}>
        {content}
      </AppLink>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      onPress={() => void action.run()}
      style={({ pressed }) => [styles.cardAction, webPointer, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export type EmptyKind = "none" | "filter" | "search";

/** No listings at all, none under this filter, or none matching the search. */
export function ListingsEmpty({ kind, filterLabel, query, seatsOn }: { kind: EmptyKind; filterLabel: string; query: string; seatsOn: boolean }) {
  const { t } = useTranslation();
  const title = kind === "none" ? t("seller.empty.noneTitle") : t("dashboard.noListingsFound");
  const body =
    kind === "none"
      ? t(seatsOn ? "seller.empty.noneBodySeats" : "seller.empty.noneBody")
      : kind === "search"
        ? t("seller.empty.searchBody", { query })
        : t("seller.empty.filterBody", { filter: filterLabel });
  return (
    <View style={styles.empty}>
      <Building2 color={colorTokens.muted} size={40} />
      <Text accessibilityRole="header" aria-level={2} style={styles.emptyTitle}>
        {title}
      </Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

/** One kind of listing did not load; the others still show. */
export function SourceNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View accessibilityRole="alert" style={styles.notice}>
      <Text style={styles.noticeText}>{message}</Text>
      <AppButton label={t("dashboard.retry")} onPress={onRetry} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  chip: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  chipText: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 16 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colorTokens.surfaceSunken,
  },
  badgeShared: { backgroundColor: colorTokens.surface, borderWidth: 1, borderColor: colorTokens.brandBorder },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 11, lineHeight: 16, color: colorTokens.body },
  badgeTextShared: { color: colorTokens.brandText },
  thumbRow: { width: 60, height: 48, borderRadius: radius.md, backgroundColor: colorTokens.surfaceSunken },
  thumbCard: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colorTokens.surfaceSunken },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  metrics: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 12, rowGap: 4 },
  metricsStacked: { flexDirection: "column", alignItems: "flex-start" },
  metric: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colorTokens.muted },
  toggle: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, minHeight: 32, paddingVertical: 4 },
  toggleText: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.brandText },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  cardAction: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 8 },
  cardActionText: { fontFamily: fonts.semiBold, fontSize: 13 },
  empty: { padding: 48, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyTitle: { marginTop: 8, fontFamily: fonts.bold, fontSize: 16, color: colorTokens.ink, textAlign: "center" },
  emptyBody: { maxWidth: 420, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colorTokens.muted, textAlign: "center" },
  notice: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colorTokens.warningSurface,
  },
  noticeText: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colorTokens.warningText },
});
