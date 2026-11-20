import { StyleSheet, Text, View } from "react-native";
import { NoTranslateText } from "@/components/NoTranslateText";
import { ConfirmAvailableButton, FreshnessLine, RevealsLine, SeatList } from "@/features/mess/components/SeatListingTools";
import { colorTokens, fonts, radius } from "@/theme";
import { CardAction, KindBadge, ListingMetrics, ListingThumb, SeatsToggle, StatusChip, VerifiedMark } from "./ListingParts";
import type { ListingAction } from "./useListingActions";
import type { ListingView } from "./listingView";

/**
 * One listing on a phone. A live seat listing leads with "Still available",
 * its one primary action; the seats open below it, and the rest of the
 * actions sit along the bottom.
 */
export function ListingCard({
  view,
  actions,
  expanded,
  onToggle,
}: {
  view: ListingView;
  actions: ListingAction[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View role="listitem" style={styles.card}>
      <View style={styles.head}>
        <ListingThumb view={view} size="card" />
        <View style={styles.headText}>
          <View style={styles.titleLine}>
            <Text style={styles.title}>{view.title}</Text>
            <VerifiedMark view={view} />
          </View>
          <Text style={styles.location}>{view.location}</Text>
          <View style={styles.badges}>
            <KindBadge view={view} />
            <StatusChip view={view} />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <NoTranslateText style={styles.price}>
          {view.price}
          {view.priceSuffix ? <Text style={styles.priceSuffix}> {view.priceSuffix}</Text> : null}
        </NoTranslateText>
        <ListingMetrics view={view} layout="card" />

        {view.seat ? (
          <>
            <View style={styles.seatStats}>
              <RevealsLine listing={view.seat} />
              <FreshnessLine listing={view.seat} />
            </View>
            <ConfirmAvailableButton listing={view.seat} />
            <SeatsToggle view={view} expanded={expanded} onToggle={onToggle} />
            {expanded ? <SeatList listing={view.seat} /> : null}
          </>
        ) : null}

        <View style={styles.actions}>
          {actions
            // "Still available" is the button above, not a second copy here.
            .filter((action) => action.key !== "confirm")
            .map((action) => (
              <CardAction key={action.key} action={action} />
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  head: { flexDirection: "row", gap: 12 },
  headText: { flex: 1, gap: 4 },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { flexShrink: 1, fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colorTokens.ink },
  location: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  body: { gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colorTokens.divider },
  price: { fontFamily: fonts.bold, fontSize: 15, color: colorTokens.ink },
  priceSuffix: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  seatStats: { gap: 6 },
  // Pulled out by the actions' own padding, so the first icon lines up with the text above.
  actions: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 },
});
