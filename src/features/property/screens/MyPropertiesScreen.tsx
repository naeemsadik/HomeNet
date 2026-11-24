import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import { BedDouble, Plus, RotateCcw } from "@/components/icons";
import { LiveText } from "@/components/LiveText";
import { AppButton, AppLink } from "@/components/ui";
import { DemoNotice } from "@/features/mess/components/DemoNotice";
import { seatFreshness } from "@/features/mess/components/SeatListingTools";
import { useMyMessListings } from "@/features/mess/hooks/useMessQueries";
import { SellerShell } from "@/features/seller/components/SellerShell";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { pressedState } from "@/lib/a11yState";
import { MESS_ENABLED } from "@/lib/features";
import { LIST_PROPERTY_PATH, LIST_SEAT_PATH } from "@/lib/startListing";
import { toApiError } from "@/services/apiClient";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { ListingActionsMenu, MENU_ITEM_HEIGHT, type OpenMenu } from "../components/myListings/ListingActionsMenu";
import { ListingCard } from "../components/myListings/ListingCard";
import { ListingsEmpty, SourceNotice, type EmptyKind } from "../components/myListings/ListingParts";
import { ListingTableHeader, ListingTableRow } from "../components/myListings/ListingTableRow";
import { useListingViews, type ListingView } from "../components/myListings/listingView";
import { useListingActions } from "../components/myListings/useListingActions";
import { useMyProperties } from "../hooks/useMyProperties";
import { countByFilter, LISTING_FILTERS, matchesFilter, mergeMyListings, type ListingFilter } from "../utils/myListings";

/** Below this the table scrolls sideways rather than squeezing its columns. */
const TABLE_MIN_WIDTH = 920;

const FILTER_LABELS: Record<ListingFilter, TranslationKey> = {
  all: "seller.filters.all",
  active: "seller.filters.active",
  draft: "seller.filters.draft",
  pending: "seller.inReview",
  rejected: "seller.filters.rejected",
  sold: "seller.filters.sold",
  archived: "seller.filters.archived",
};

/**
 * My listings: every listing the seller owns, properties and shared-living seat
 * listings in one list, with one place to edit, publish, archive or delete them
 * and see where each stands. A seat listing also carries its seats and the
 * two-week "Still available" reminder.
 */
export function MyPropertiesScreen() {
  const { isPhone } = useResponsive();
  const { t, language } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<ListingFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menu, setMenu] = useState<OpenMenu | null>(null);
  /** Seats opened or closed by hand. */
  const [seatToggles, setSeatToggles] = useState<Record<string, boolean>>({});
  /**
   * Seat listings that opened by themselves because they needed confirming. They
   * stay open once confirmed, so the panel does not shut under the lister's hand.
   */
  const [autoOpened, setAutoOpened] = useState<ReadonlySet<string>>(() => new Set());
  /**
   * The table's width, measured: inside a sideways ScrollView a percentage width
   * has nothing to resolve against, and the table grew to fit its longest title,
   * pushing the actions column out of sight.
   */
  const [tableWidth, setTableWidth] = useState(0);
  const onTableLayout = (event: LayoutChangeEvent) => setTableWidth(event.nativeEvent.layout.width);

  const properties = useMyProperties();
  const seats = useMyMessListings();
  const { actionsFor } = useListingActions();

  const propertyItems = useMemo(() => properties.data?.pages.flatMap((page) => page.data?.items ?? []) ?? [], [properties.data]);
  const seatItems = useMemo(() => seats.data?.pages.flatMap((page) => page.items) ?? [], [seats.data]);
  const rows = useMemo(() => mergeMyListings(propertyItems, seatItems), [propertyItems, seatItems]);
  const views = useListingViews(rows);
  const counts = useMemo(() => countByFilter(rows), [rows]);

  const query = searchQuery.trim().toLowerCase();
  const visible = useMemo(
    () =>
      views.filter(
        (view) =>
          matchesFilter(view.row, activeFilter) &&
          (!query || view.title.toLowerCase().includes(query) || view.location.toLowerCase().includes(query)),
      ),
    [views, activeFilter, query],
  );

  const propertiesFailed = Boolean(properties.error);
  const seatsFailed = MESS_ENABLED && Boolean(seats.error);
  // A disabled query (mess off, or signed out) stays "pending" forever; isLoading does not.
  const loading = properties.isLoading || seats.isLoading;
  const nothingLoaded = rows.length === 0 && (propertiesFailed || seatsFailed);
  const hasMore = Boolean(properties.hasNextPage || seats.hasNextPage);
  const fetchingMore = properties.isFetchingNextPage || seats.isFetchingNextPage;
  const hasSeatRows = rows.some((row) => row.kind === "seat");

  const retryFailed = () => {
    if (propertiesFailed) void properties.refetch();
    if (seatsFailed) void seats.refetch();
  };
  /**
   * A source that failed after rows of it showed (Load more, or a refresh while one
   * is in review) still has those rows on screen: say some did not load, not all,
   * and retry the fetch that failed.
   */
  const sourceNotice = (source: typeof properties | typeof seats, noneLoaded: TranslationKey) => (
    <SourceNotice
      message={t(source.data ? "seller.someLoadFailed" : noneLoaded)}
      onRetry={() => void (source.isFetchNextPageError ? source.fetchNextPage() : source.refetch())}
    />
  );
  const loadMore = () => {
    if (properties.hasNextPage) void properties.fetchNextPage();
    if (seats.hasNextPage) void seats.fetchNextPage();
  };

  // Adjusting state while rendering (not in an effect), so the first paint is already open.
  const due = views.filter((view) => view.seat && (seatFreshness(view.seat).remind || seatFreshness(view.seat).hidden));
  if (due.some((view) => !autoOpened.has(view.id))) {
    setAutoOpened(new Set([...autoOpened, ...due.map((view) => view.id)]));
  }

  const isExpanded = (view: ListingView) => seatToggles[view.id] ?? autoOpened.has(view.id);
  const toggleSeats = (view: ListingView) => setSeatToggles((current) => ({ ...current, [view.id]: !isExpanded(view) }));

  const openMenu = (event: GestureResponderEvent, view: ListingView) => {
    const actions = actionsFor(view);
    const menuHeight = actions.length * MENU_ITEM_HEIGHT + 17;
    if (Platform.OS === "web") {
      const rect = (event?.currentTarget as unknown as HTMLElement | null)?.getBoundingClientRect?.();
      if (rect && typeof window !== "undefined") {
        // To the left of the button, centred on it, and kept inside the window.
        const top = Math.max(16, Math.min(rect.top + rect.height / 2 - menuHeight / 2, window.innerHeight - menuHeight - 16));
        setMenu({ title: view.title, actions, top, right: Math.max(16, window.innerWidth - rect.left + 8) });
        return;
      }
    }
    setMenu({ title: view.title, actions, top: (event?.nativeEvent?.pageY || 100) - 40, right: 60 });
  };

  const emptyKind: EmptyKind = rows.length === 0 ? "none" : query ? "search" : "filter";
  const empty = (
    <ListingsEmpty kind={emptyKind} filterLabel={t(FILTER_LABELS[activeFilter])} query={searchQuery.trim()} seatsOn={MESS_ENABLED} />
  );

  return (
    <SellerShell activeNav="listings" onSearchQueryChange={setSearchQuery} searchQuery={searchQuery} title={t("seller.myListings")}>
      <View style={[styles.body, isPhone && styles.bodyPhone]}>
        <View style={[styles.toolbar, isPhone && styles.toolbarPhone]}>
          <View style={[styles.pills, !isPhone && styles.pillsBeside]}>
            {LISTING_FILTERS.map((key) => {
              const selected = activeFilter === key;
              const label = t(FILTER_LABELS[key]);
              const count = formatLocalizedNumber(counts[key], language);
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={t("seller.filterCount", { label, count })}
                  {...pressedState(selected)}
                  hitSlop={{ top: 3, bottom: 3 }}
                  onPress={() => setActiveFilter(key)}
                  style={({ pressed }) => [styles.pill, selected && styles.pillSelected, webPointer, pressed && styles.pressed]}
                >
                  <Text style={[styles.pillLabel, selected && styles.pillTextSelected]}>{label}</Text>
                  <LiveText style={[styles.pillCount, selected && styles.pillTextSelected]}>{count}</LiveText>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.addActions, isPhone && styles.addActionsPhone]}>
            <AppLink href={LIST_PROPERTY_PATH} style={[styles.addButton, styles.addPrimary, isPhone && styles.addButtonPhone]}>
              <Plus color={colorTokens.onBrand} size={16} />
              <Text style={[styles.addText, styles.addTextPrimary]}>{t("seller.addNewProperty")}</Text>
            </AppLink>
            {MESS_ENABLED ? (
              <AppLink href={LIST_SEAT_PATH} style={[styles.addButton, styles.addSecondary, isPhone && styles.addButtonPhone]}>
                <BedDouble color={colorTokens.ink} size={16} />
                <Text style={styles.addText}>{t("mess.my.create")}</Text>
              </AppLink>
            ) : null}
          </View>
        </View>

        {hasSeatRows ? <DemoNotice embedded /> : null}
        {!loading && !nothingLoaded && seatsFailed ? sourceNotice(seats, "seller.seatsLoadFailed") : null}
        {!loading && !nothingLoaded && propertiesFailed ? sourceNotice(properties, "seller.propertiesLoadFailed") : null}

        <View style={isPhone ? null : styles.listCard}>
          {loading ? (
            <View style={styles.state}>
              <ActivityIndicator color={colorTokens.brand} size="large" />
              <Text style={styles.stateBody}>{t("dashboard.loadingListings")}</Text>
            </View>
          ) : nothingLoaded ? (
            <View accessibilityRole="alert" style={styles.state}>
              <Text style={styles.stateTitle}>{t("dashboard.couldNotLoadListings")}</Text>
              <Text style={styles.stateBody}>{toApiError(properties.error ?? seats.error).message}</Text>
              <Pressable accessibilityRole="button" onPress={retryFailed} style={({ pressed }) => [styles.retry, webPointer, pressed && styles.pressed]}>
                <RotateCcw color={colorTokens.onBrand} size={16} />
                <Text style={styles.retryText}>{t("dashboard.retry")}</Text>
              </Pressable>
            </View>
          ) : !isPhone ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} onLayout={onTableLayout}>
              <View role="table" aria-label={t("seller.myListings")} style={{ width: Math.max(tableWidth, TABLE_MIN_WIDTH) }}>
                <ListingTableHeader />
                {visible.length === 0
                  ? empty
                  : visible.map((view) => (
                      <ListingTableRow
                        key={view.id}
                        view={view}
                        expanded={isExpanded(view)}
                        onToggle={() => toggleSeats(view)}
                        onOpenMenu={openMenu}
                      />
                    ))}
              </View>
            </ScrollView>
          ) : visible.length === 0 ? (
            empty
          ) : (
            <View role="list" style={styles.cards}>
              {visible.map((view) => (
                <ListingCard key={view.id} view={view} actions={actionsFor(view)} expanded={isExpanded(view)} onToggle={() => toggleSeats(view)} />
              ))}
            </View>
          )}

          {hasMore && !loading && !nothingLoaded ? (
            <View style={styles.loadMore}>
              <AppButton label={t("dashboard.loadMore")} loading={fetchingMore} onPress={loadMore} variant="ghost" />
            </View>
          ) : null}
        </View>
      </View>

      <ListingActionsMenu menu={menu} onClose={() => setMenu(null)} />
    </SellerShell>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  body: { padding: 24, gap: 20 },
  bodyPhone: { padding: 16, gap: 16 },
  toolbar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  toolbarPhone: { flexDirection: "column", alignItems: "stretch" },
  // The pills wrap, so every count shows at every width.
  pills: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, paddingVertical: 3 },
  pillsBeside: { flex: 1 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  pillSelected: { backgroundColor: colorTokens.brand, borderColor: colorTokens.brand },
  pillLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  pillCount: { fontFamily: fonts.semiBold, fontSize: 12, color: colorTokens.muted },
  pillTextSelected: { color: colorTokens.onBrand },
  addActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  // No wrap here: in a wrapping column, stretch reaches only the width of each wrapped line.
  addActionsPhone: { flexDirection: "column", flexWrap: "nowrap", alignItems: "stretch" },
  addButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
  },
  addButtonPhone: { alignSelf: "stretch" },
  addPrimary: { backgroundColor: colorTokens.brand },
  addSecondary: { backgroundColor: colorTokens.surface, borderWidth: 1, borderColor: colorTokens.border },
  addText: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  addTextPrimary: { color: colorTokens.onBrand },
  listCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
    overflow: "hidden",
  },
  cards: { gap: 16 },
  state: { padding: 48, alignItems: "center", justifyContent: "center", gap: 8 },
  stateTitle: { marginTop: 8, fontFamily: fonts.bold, fontSize: 16, color: colorTokens.ink, textAlign: "center" },
  stateBody: { fontFamily: fonts.regular, fontSize: 13, color: colorTokens.muted, textAlign: "center" },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    marginTop: 8,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.brand,
  },
  retryText: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.onBrand },
  loadMore: { alignItems: "center", paddingVertical: 8 },
});
