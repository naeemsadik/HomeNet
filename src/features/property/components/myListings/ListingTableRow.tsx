import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { MoreVertical } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { AppLink } from "@/components/ui";
import { ConfirmAvailableButton, FreshnessLine, RevealsLine, SeatList } from "@/features/mess/components/SeatListingTools";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { KindBadge, ListingMetrics, ListingThumb, SeatsToggle, StatusChip, VerifiedMark } from "./ListingParts";
import type { ListingView } from "./listingView";

/** The desktop table's column headings. */
export function ListingTableHeader() {
  const { t } = useTranslation();
  const heading = (label: string, style: object, last = false) => (
    <View role="columnheader" style={[style, !last && cols.border]}>
      <Text style={styles.th} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
  return (
    <View role="row" style={styles.headerRow}>
      {heading(t("admin.columns.property"), cols.property)}
      {heading(t("admin.columns.type"), cols.type)}
      {heading(t("admin.columns.price"), cols.price)}
      {heading(t("admin.columns.status"), cols.status)}
      {heading(t("admin.columns.performance"), cols.performance)}
      {heading(t("admin.columns.actions"), cols.actions, true)}
    </View>
  );
}

/**
 * One listing on the desktop table. A seat listing can open its seats in a
 * full-width panel under the row: the seats with their buttons, how many
 * students asked for the number, and "Still available".
 */
export function ListingTableRow({
  view,
  expanded,
  onToggle,
  onOpenMenu,
}: {
  view: ListingView;
  expanded: boolean;
  onToggle: () => void;
  onOpenMenu: (event: GestureResponderEvent, view: ListingView) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.rowWrap}>
      <View role="row" style={styles.row}>
        <View role="cell" style={[cols.property, cols.border, styles.propertyCell]}>
          <ListingThumb view={view} size="row" />
          <View style={styles.titleBlock}>
            <View style={styles.titleLine}>
              <AppLink href={view.href} style={styles.titleLink}>
                <Text style={styles.title} numberOfLines={1}>
                  {view.title}
                </Text>
              </AppLink>
              <VerifiedMark view={view} />
            </View>
            <Text style={styles.location} numberOfLines={1}>
              {view.location}
            </Text>
            <SeatsToggle view={view} expanded={expanded} onToggle={onToggle} />
          </View>
        </View>

        <View role="cell" style={[cols.type, cols.border, styles.stack]}>
          {view.typeLabel ? (
            <Text style={styles.type} numberOfLines={1}>
              {view.typeLabel}
            </Text>
          ) : null}
          <KindBadge view={view} />
        </View>

        <View role="cell" style={[cols.price, cols.border, styles.stack]}>
          <NoTranslateText style={styles.price} numberOfLines={2}>
            {view.price}
          </NoTranslateText>
          {view.priceSuffix ? <Text style={styles.priceSuffix}>{view.priceSuffix}</Text> : null}
        </View>

        <View role="cell" style={[cols.status, cols.border, styles.stack]}>
          <StatusChip view={view} />
          {view.seat ? <FreshnessLine listing={view.seat} /> : null}
        </View>

        <View role="cell" style={[cols.performance, cols.border]}>
          <ListingMetrics view={view} layout="row" />
        </View>

        <View role="cell" style={cols.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("seller.actionsFor", { title: view.title })}
            aria-haspopup="menu"
            hitSlop={4}
            onPress={(event) => onOpenMenu(event, view)}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              styles.menuButton,
              hovered && styles.menuButtonHovered,
              webPointer,
              pressed && styles.pressed,
            ]}
          >
            <MoreVertical color={colorTokens.muted} size={18} />
          </Pressable>
        </View>
      </View>

      {expanded && view.seat ? (
        <View role="row" style={styles.seatPanel}>
          <View role="cell" style={styles.seatPanelInner}>
            <View style={styles.seatPanelSide}>
              <RevealsLine listing={view.seat} />
              <ConfirmAvailableButton listing={view.seat} />
            </View>
            <View style={styles.seatPanelMain}>
              <SeatList listing={view.seat} />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const cell = { paddingHorizontal: 14, paddingVertical: 14, justifyContent: "center" } as const;

export const cols = StyleSheet.create({
  border: { borderRightWidth: 1, borderRightColor: colorTokens.divider },
  property: { ...cell, flex: 2.5, minWidth: 240, paddingHorizontal: 16 },
  type: { ...cell, flex: 1.3, minWidth: 140 },
  price: { ...cell, flex: 1.4, minWidth: 150 },
  status: { ...cell, flex: 1.3, minWidth: 140 },
  performance: { ...cell, flex: 1.3, minWidth: 130 },
  actions: { ...cell, width: 88, minWidth: 88, paddingHorizontal: 8, alignItems: "center" },
});

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  headerRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colorTokens.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.border,
  },
  th: { fontFamily: fonts.bold, fontSize: 12, color: colorTokens.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  rowWrap: { borderBottomWidth: 1, borderBottomColor: colorTokens.divider },
  row: { flexDirection: "row", alignItems: "stretch" },
  propertyCell: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleBlock: { flex: 1, minWidth: 0, gap: 2 },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleLink: { flexShrink: 1 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colorTokens.ink },
  location: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  stack: { gap: 4 },
  type: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  price: { fontFamily: fonts.bold, fontSize: 15, color: colorTokens.ink },
  priceSuffix: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonHovered: { backgroundColor: colorTokens.surfaceSunken },
  seatPanel: { backgroundColor: colorTokens.canvas, borderTopWidth: 1, borderTopColor: colorTokens.divider },
  seatPanelInner: { flexDirection: "row", flexWrap: "wrap", gap: 20, paddingHorizontal: 16, paddingVertical: 16 },
  seatPanelSide: { width: 260, gap: 12, alignItems: "flex-start" },
  seatPanelMain: { flex: 1, minWidth: 320 },
});
