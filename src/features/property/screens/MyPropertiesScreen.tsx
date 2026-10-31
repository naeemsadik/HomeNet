import { router } from "expo-router";
import {
  Archive,
  ArchiveRestore,
  Building2,
  CheckCircle2,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  MoreVertical,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Zap,
} from "@/components/icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { confirmAction, notify } from "@/lib/alert";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts, webPointer } from "@/theme";
import { SellerShell } from "@/features/seller/components/SellerShell";
import { displaySubtype } from "../constants/holidayStay";
import { listingTypeLabel, pricePeriodFor } from "../utils/listingType";
import { useMyProperties } from "../hooks/useMyProperties";
import { useArchiveProperty, useDeleteProperty, useUnarchiveProperty } from "../hooks/usePropertyMutations";
import { toApiError } from "@/services/apiClient";
import { cdnImage } from "@/lib/cloudinaryImage";

import { LiveText } from "@/components/LiveText";
import { NoTranslateText } from "@/components/NoTranslateText";
import { formatLocalizedNumber, isPriceOnRequest, priceOnRequestLabel, translateListingStatus, useTranslation } from "@/i18n";

export type ListingFilter = "all" | "active" | "draft" | "pending" | "sold" | "archived";

interface ListingItemData {
  id: string;
  title: string;
  location: string;
  imageUrl?: string;
  type: string;
  listingType: string;
  price: string;
  status: "active" | "draft" | "pending" | "sold" | "archived";
  boostText?: string;
  isVerified?: boolean;
  isBoosted?: boolean;
  aiValue: string;
  views: string;
  likes: string;
  inquiries: string;
}

export function MyPropertiesScreen() {
  const { isPhone } = useResponsive();
  const { t, language } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<ListingFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deleteMutation = useDeleteProperty();
  const archiveMutation = useArchiveProperty();
  const unarchiveMutation = useUnarchiveProperty();
  const [activeMenu, setActiveMenu] = useState<{
    id: string;
    title: string;
    status: ListingItemData["status"];
    right: number;
    top: number;
  } | null>(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useMyProperties();
  const apiProperties = useMemo(() => data?.pages.flatMap((p) => p.data?.items ?? []) ?? [], [data]);

  const allListings = useMemo(() => {
    return apiProperties.map((p): ListingItemData => ({
      id: p.id,
      title: p.title || "Untitled Property",
      location: [p.area?.name, (p.area as any)?.city].filter(Boolean).join(", ") || p.address || "Location unavailable",
      imageUrl: cdnImage(
        p.media?.find((media) => media.media_type === "image")?.url || p.media?.[0]?.url,
        700,
        460,
      ),
      type: displaySubtype(p.subtype) || p.type || "Apartment",
      listingType: listingTypeLabel(p.listing_type),
      price: isPriceOnRequest(p.price)
        ? priceOnRequestLabel(language)
        : `${p.price_currency === "BDT" ? "৳" : (p.price_currency || "৳")} ${typeof p.price === "number" ? p.price.toLocaleString("en-BD") : p.price}${pricePeriodFor(p.listing_type)}`,
      status: p.status,
      isVerified: p.is_verified,
      isBoosted: false,
      boostText: undefined,
      aiValue: typeof p.price === "number" ? `৳ ${((p.price * 1.05) / 10000000).toFixed(2)}Cr` : "—",
      views: (p.view_count || 0).toLocaleString(),
      likes: "0",
      inquiries: "0",
    }));
  }, [apiProperties]);

  // Filter listings based on active filter and search query
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.status === activeFilter;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allListings, activeFilter, searchQuery]);

  // Filter count calculations
  const counts = useMemo(() => {
    return {
      all: allListings.length,
      active: allListings.filter((i) => i.status === "active").length,
      draft: allListings.filter((i) => i.status === "draft").length,
      pending: allListings.filter((i) => i.status === "pending").length,
      sold: allListings.filter((i) => i.status === "sold").length,
      archived: allListings.filter((i) => i.status === "archived").length,
    };
  }, [allListings]);

  // Delete listing
  const handleDelete = async (id: string, title: string) => {
    setActiveMenu(null);
    const confirmed = await confirmAction(
      t("seller.deleteConfirmTitle"),
      t("seller.deleteConfirmMessage", { title }),
      {
        confirmLabel: t("seller.actions.delete"),
        destructive: true,
      }
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (deleteError) {
      notify(t("seller.deleteFailed"), toApiError(deleteError).message);
    }
  };

  // The API archives only active or sold listings; anything else can only be deleted.
  const canArchive = (status: ListingItemData["status"]) => status === "active" || status === "sold";

  const handleArchive = async (id: string, title: string) => {
    setActiveMenu(null);
    const confirmed = await confirmAction(
      t("seller.archiveConfirmTitle"),
      t("seller.archiveConfirmMessage", { title }),
      { confirmLabel: t("seller.actions.archive") }
    );
    if (!confirmed) return;
    try {
      await archiveMutation.mutateAsync(id);
    } catch (archiveError) {
      notify(t("seller.archiveFailed"), toApiError(archiveError).message);
    }
  };

  const handleUnarchive = async (id: string, title: string) => {
    setActiveMenu(null);
    const confirmed = await confirmAction(
      t("seller.unarchiveConfirmTitle"),
      t("seller.unarchiveConfirmMessage", { title }),
      { confirmLabel: t("seller.actions.unarchive") }
    );
    if (!confirmed) return;
    try {
      await unarchiveMutation.mutateAsync(id);
    } catch (unarchiveError) {
      notify(t("seller.unarchiveFailed"), toApiError(unarchiveError).message);
    }
  };

  const handleOpenMenu = (event: any, item: ListingItemData) => {
    if (Platform.OS === "web") {
      const rect = (event?.currentTarget as HTMLElement)?.getBoundingClientRect?.();
      if (rect) {
        const windowWidth = typeof window !== "undefined" ? window.innerWidth : 800;
        const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
        const menuHeight = 120;
        // Position menu to the LEFT of the 3-dots button:
        const right = Math.max(16, windowWidth - rect.left + 8);
        // Vertically center with the 3-dots button:
        const centerY = rect.top + rect.height / 2;
        let top = centerY - menuHeight / 2;
        top = Math.max(16, Math.min(top, windowHeight - menuHeight - 16));
        setActiveMenu({
          id: item.id,
          title: item.title,
          status: item.status,
          right,
          top,
        });
        return;
      }
    }
    const pageX = event?.nativeEvent?.pageX || 200;
    const pageY = event?.nativeEvent?.pageY || 100;
    setActiveMenu({
      id: item.id,
      title: item.title,
      status: item.status,
      right: 60,
      top: pageY - 40,
    });
  };

  return (
    <SellerShell
      activeNav="listings"
      onSearchQueryChange={setSearchQuery}
      searchQuery={searchQuery}
      title={t("seller.myListings")}
    >
      <View style={[styles.scrollBody, isPhone && styles.scrollBodyPhone]}>
        {/* Top Filter Bar + Add New Property */}
        <View style={[styles.filterBarRow, isPhone && styles.filterBarRowPhone]}>
          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            <View style={styles.pillsRow}>
              {(
                [
                  ["all", t("seller.filters.all"), counts.all],
                  ["active", t("seller.filters.active"), counts.active],
                  ["draft", t("seller.filters.draft"), counts.draft],
                  ["pending", t("seller.filters.pending"), counts.pending],
                  ["sold", t("seller.filters.sold"), counts.sold],
                  ["archived", t("seller.filters.archived"), counts.archived],
                ] as const
              ).map(([key, label, count]) => {
                const isSelected = activeFilter === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setActiveFilter(key as ListingFilter)}
                    style={({ pressed }) => [
                      styles.filterPill,
                      isSelected && styles.filterPillActive,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.pillLabel, isSelected && styles.pillLabelActive]}>
                      {label}
                    </Text>
                    <View style={[styles.pillCountBg, isSelected && styles.pillCountBgActive]}>
                      <LiveText style={[styles.pillCountText, isSelected && styles.pillCountTextActive]}>
                        {formatLocalizedNumber(count, language)}
                      </LiveText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Add Property Primary Button */}
          <AppLink href="/property/create" style={styles.addPropertyBtn}>
            <Plus color={colorTokens.onBrand} size={16} />
            <Text style={styles.addPropertyBtnText}>{t("seller.addNewProperty")}</Text>
          </AppLink>
        </View>

        {/* Listings Table / Card View */}
        <View style={styles.tableCard}>
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color="#04cf92" size="large" />
              <Text style={styles.emptySub}>{t("dashboard.loadingListings")}</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>{t("dashboard.couldNotLoadListings")}</Text>
              <Text style={styles.emptySub}>{toApiError(error).message}</Text>
              <Pressable onPress={() => void refetch()} style={styles.retryButton}>
                <RotateCcw color={colorTokens.onBrand} size={16} />
                <Text style={styles.retryText}>{t("dashboard.retry")}</Text>
              </Pressable>
            </View>
          ) : !isPhone ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContent}>
              <View style={styles.table}>
                {/* Table Header with Column-wise Borders */}
                <View style={styles.tableHeaderRow}>
                  <View style={[styles.colProperty, styles.colBorder]}>
                    <Text style={styles.thCell} numberOfLines={1}>{t("admin.columns.property")}</Text>
                  </View>
                  <View style={[styles.colType, styles.colBorder]}>
                    <Text style={styles.thCell} numberOfLines={1}>{t("admin.columns.type")}</Text>
                  </View>
                  <View style={[styles.colPrice, styles.colBorder]}>
                    <Text style={styles.thCell} numberOfLines={1}>{t("admin.columns.price")}</Text>
                  </View>
                  <View style={[styles.colStatus, styles.colBorder]}>
                    <Text style={styles.thCell} numberOfLines={1}>{t("admin.columns.status")}</Text>
                  </View>
                  <View style={[styles.colAiValue, styles.colBorder]}>
                    <Text style={styles.thCell} numberOfLines={1}>{t("admin.columns.aiValue")}</Text>
                  </View>
                  <View style={[styles.colPerformance, styles.colBorder]}>
                    <Text style={styles.thCell} numberOfLines={1}>{t("admin.columns.performance")}</Text>
                  </View>
                  <View style={styles.colActions}>
                    <Text style={[styles.thCell, { textAlign: "center" }]} numberOfLines={1}>{t("admin.columns.actions")}</Text>
                  </View>
                </View>

                {/* Table Data Rows with Column-wise Borders */}
                {filteredListings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Building2 color="#5C6B66" size={40} />
                    <Text style={styles.emptyTitle}>{t("dashboard.noListingsFound")}</Text>
                    <Text style={styles.emptySub}>{t("dashboard.noListingsMatchFilter")}</Text>
                  </View>
                ) : (
                  filteredListings.map((item) => (
                    <View key={item.id} style={styles.tableDataRow}>
                      {/* Property Info (Thumbnail, Title, Verified, Boost, Location) */}
                      <View style={[styles.colProperty, styles.colBorder, { flexDirection: "row", gap: 12, alignItems: "center" }]}>
                        <AppLink href={`/property/${item.id}`} style={styles.propThumb}>
                          {item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} accessibilityLabel={item.title} style={styles.propThumb} />
                          ) : (
                            <View style={[styles.propThumb, styles.imagePlaceholder]}>
                              <Building2 color="#6B7D78" size={20} />
                            </View>
                          )}
                        </AppLink>
                        <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <AppLink href={`/property/${item.id}`} style={{ flexShrink: 1 }}>
                              <Text style={styles.propTitle} numberOfLines={1}>{item.title}</Text>
                            </AppLink>
                            {item.isVerified ? <CheckCircle2 color="#04cf92" size={16} /> : null}
                            {item.isBoosted ? <Zap color="#F4823A" size={14} /> : null}
                          </View>
                          <Text style={styles.propLocation} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>

                      {/* Type Column */}
                      <View style={[styles.colType, styles.colBorder, { gap: 4, justifyContent: "center" }]}>
                        <Text style={styles.typeText} numberOfLines={1}>{item.type}</Text>
                        <View style={styles.forSaleBadge}>
                          <Text style={styles.forSaleBadgeText}>{item.listingType}</Text>
                        </View>
                      </View>

                      {/* Price Column */}
                      <View style={[styles.colPrice, styles.colBorder, { justifyContent: "center" }]}>
                        <NoTranslateText style={styles.priceText} numberOfLines={1}>{item.price}</NoTranslateText>
                      </View>

                      {/* Status Column */}
                      <View style={[styles.colStatus, styles.colBorder, { gap: 4, justifyContent: "center" }]}>
                        <View style={[styles.statusBadge, getStatusStyle(item.status).bgStyle]}>
                          <Text style={[styles.statusBadgeText, getStatusStyle(item.status).textStyle]}>
                            {translateListingStatus(item.status, language)}
                          </Text>
                        </View>
                        {item.boostText ? (
                          <Text style={styles.boostCountdown} numberOfLines={1}>{item.boostText}</Text>
                        ) : null}
                      </View>

                      {/* AI Value Column */}
                      <View style={[styles.colAiValue, styles.colBorder, { flexDirection: "row", alignItems: "center", gap: 4 }]}>
                        <Sparkles color="#04cf92" size={14} />
                        <Text style={styles.aiValueText} numberOfLines={1}>{item.aiValue}</Text>
                      </View>

                      {/* Performance Column (Views, Likes, Inquiries) */}
                      <View style={[styles.colPerformance, styles.colBorder, { flexDirection: "row", alignItems: "center", gap: 10 }]}>
                        <View style={styles.metricItem}>
                          <Eye color="#5C6B66" size={14} />
                          <Text style={styles.metricValue}>{item.views}</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <Heart color="#5C6B66" size={14} />
                          <Text style={styles.metricValue}>{item.likes}</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <MessageSquare color="#5C6B66" size={14} />
                          <Text style={styles.metricValue}>{item.inquiries}</Text>
                        </View>
                      </View>

                      {/* Actions Column - 3 dot menu only */}
                      <View style={styles.colActions}>
                        <Pressable
                          accessibilityLabel={t("admin.columns.actions")}
                          onPress={(e) => handleOpenMenu(e, item)}
                          style={({ pressed }) => [styles.actionIconButton, webPointer, pressed && styles.pressed]}
                        >
                          <MoreVertical color="#5C6B66" size={16} />
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          ) : (
            /* Mobile Card View */
            <View style={styles.mobileCardList}>
              {filteredListings.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Building2 color="#5C6B66" size={40} />
                  <Text style={styles.emptyTitle}>{t("dashboard.noListingsFound")}</Text>
                  <Text style={styles.emptySub}>{t("dashboard.noListingsMatchFilter")}</Text>
                </View>
              ) : (
                filteredListings.map((item) => (
                  <View key={item.id} style={styles.mobileCard}>
                    <View style={styles.mobileCardHead}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} accessibilityLabel={item.title} style={styles.mobileThumb} />
                      ) : (
                        <View style={[styles.mobileThumb, styles.imagePlaceholder]}>
                          <Building2 color="#6B7D78" size={20} />
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.propTitle}>{item.title}</Text>
                        <Text style={styles.propLocation}>{item.location}</Text>
                        <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                          <View style={styles.forSaleBadge}>
                            <Text style={styles.forSaleBadgeText}>{item.listingType}</Text>
                          </View>
                          <View style={[styles.statusBadge, getStatusStyle(item.status).bgStyle]}>
                            <Text style={[styles.statusBadgeText, getStatusStyle(item.status).textStyle]}>
                              {translateListingStatus(item.status, language)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.mobileCardBody}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                        <NoTranslateText style={styles.priceText}>{item.price}</NoTranslateText>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Sparkles color="#04cf92" size={14} />
                          <Text style={styles.aiValueText}>{item.aiValue}</Text>
                        </View>
                      </View>

                      <View style={styles.mobileMetricsRow}>
                        <View style={styles.metricItem}>
                          <Eye color="#5C6B66" size={14} />
                          <Text style={styles.metricValue}>{item.views}</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <Heart color="#5C6B66" size={14} />
                          <Text style={styles.metricValue}>{item.likes}</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <MessageSquare color="#5C6B66" size={14} />
                          <Text style={styles.metricValue}>{item.inquiries}</Text>
                        </View>
                      </View>

                      <View style={styles.mobileActionsRow}>
                        <AppLink href={`/property/${item.id}`} style={styles.mobileActionBtn}>
                          <Eye color="#5C6B66" size={14} />
                          <Text style={styles.mobileActionText}>{t("seller.actions.view")}</Text>
                        </AppLink>
                        <AppLink href={`/property/edit?id=${item.id}`} style={styles.mobileActionBtn}>
                          <Edit color="#04cf92" size={14} />
                          <Text style={[styles.mobileActionText, { color: "#04cf92" }]}>{t("seller.actions.edit")}</Text>
                        </AppLink>
                        {item.status === "archived" ? (
                          <Pressable onPress={() => handleUnarchive(item.id, item.title)} style={styles.mobileActionBtn}>
                            <ArchiveRestore color="#04cf92" size={14} />
                            <Text style={[styles.mobileActionText, { color: "#04cf92" }]}>{t("seller.actions.unarchive")}</Text>
                          </Pressable>
                        ) : canArchive(item.status) ? (
                          <Pressable onPress={() => handleArchive(item.id, item.title)} style={styles.mobileActionBtn}>
                            <Archive color="#5C6B66" size={14} />
                            <Text style={styles.mobileActionText}>{t("seller.actions.archive")}</Text>
                          </Pressable>
                        ) : null}
                        <Pressable onPress={() => handleDelete(item.id, item.title)} style={styles.mobileActionBtn}>
                          <Trash2 color="#D4183D" size={14} />
                          <Text style={[styles.mobileActionText, { color: "#D4183D" }]}>{t("seller.actions.delete")}</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          {hasNextPage && !isLoading && !error ? (
            <Pressable
              disabled={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
              style={styles.loadMoreButton}
            >
              {isFetchingNextPage ? <ActivityIndicator color="#04cf92" size="small" /> : null}
              <Text style={styles.loadMoreText}>{isFetchingNextPage ? t("dashboard.loading") : t("dashboard.loadMore")}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* 3-Dot Actions Dropdown Modal with Blurred Background */}
      <Modal
        animationType="fade"
        onRequestClose={() => setActiveMenu(null)}
        transparent
        visible={!!activeMenu}
      >
        <Pressable
          accessibilityLabel={t("common.close") || "Close"}
          onPress={() => setActiveMenu(null)}
          style={styles.menuOverlay}
        >
          {activeMenu && (
            <View
              style={[
                styles.menuDropdown,
                {
                  top: activeMenu.top,
                  right: activeMenu.right,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <Pressable
                style={({ pressed }) => [styles.menuItem, webPointer, pressed && styles.menuItemPressed]}
                onPress={() => {
                  const id = activeMenu.id;
                  setActiveMenu(null);
                  router.push(`/property/edit?id=${id}` as any);
                }}
              >
                <Edit color="#04cf92" size={15} />
                <Text style={[styles.menuItemText, { color: "#04cf92" }]}>{t("seller.actions.edit")}</Text>
              </Pressable>

              {activeMenu.status === "archived" ? (
                <Pressable
                  style={({ pressed }) => [styles.menuItem, webPointer, pressed && styles.menuItemPressed]}
                  onPress={() => handleUnarchive(activeMenu.id, activeMenu.title)}
                >
                  <ArchiveRestore color="#04cf92" size={15} />
                  <Text style={[styles.menuItemText, { color: "#04cf92" }]}>{t("seller.actions.unarchive")}</Text>
                </Pressable>
              ) : canArchive(activeMenu.status) ? (
                <Pressable
                  style={({ pressed }) => [styles.menuItem, webPointer, pressed && styles.menuItemPressed]}
                  onPress={() => handleArchive(activeMenu.id, activeMenu.title)}
                >
                  <Archive color="#5C6B66" size={15} />
                  <Text style={styles.menuItemText}>{t("seller.actions.archive")}</Text>
                </Pressable>
              ) : null}

              <View style={styles.menuDivider} />

              <Pressable
                style={({ pressed }) => [styles.menuItem, webPointer, pressed && styles.menuItemPressed]}
                onPress={() => handleDelete(activeMenu.id, activeMenu.title)}
              >
                <Trash2 color="#D4183D" size={15} />
                <Text style={[styles.menuItemText, { color: "#D4183D" }]}>{t("seller.actions.delete")}</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>
    </SellerShell>
  );
}

// Helper to style status badges
function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return { bgStyle: { backgroundColor: "#E6FAF4" }, textStyle: { color: "#04cf92" } };
    case "pending":
      return { bgStyle: { backgroundColor: "#FDEEE2" }, textStyle: { color: "#F4823A" } };
    case "sold":
      return { bgStyle: { backgroundColor: "#E8EEFC" }, textStyle: { color: "#2251D6" } };
    case "draft":
      return { bgStyle: { backgroundColor: "#F4F6F5" }, textStyle: { color: "#5C6B66" } };
    case "archived":
      return { bgStyle: { backgroundColor: "#F4F6F5" }, textStyle: { color: "#899790" } };
    default:
      return { bgStyle: { backgroundColor: "#E6FAF4" }, textStyle: { color: "#04cf92" } };
  }
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  scrollBody: {
    padding: 24,
    gap: 20,
  },
  scrollBodyPhone: {
    padding: 16,
  },
  filterBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  filterBarRowPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  pillsScroll: {
    flex: 1,
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
  },
  filterPillActive: {
    backgroundColor: "#04cf92",
    borderColor: "#04cf92",
  },
  pillLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  pillLabelActive: {
    color: colorTokens.onBrand,
  },
  pillCountBg: {
    backgroundColor: "transparent",
  },
  pillCountBgActive: {},
  pillCountText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  pillCountTextActive: {
    color: "rgba(255,255,255,0.75)",
  },
  addPropertyBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#04cf92",
    borderRadius: 999,
    paddingHorizontal: 18,
  },
  addPropertyBtnText: {
    color: colorTokens.onBrand,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    overflow: "hidden",
  },
  tableScrollContent: {
    minWidth: "100%",
  },
  table: {
    width: "100%",
    minWidth: 840,
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#F8FAF9",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.08)",
  },
  thCell: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: "#5C6B66",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.06)",
  },
  // Column border for vertical column separators
  colBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(11,26,23,0.08)",
  },
  // Column sizing & padding
  colProperty: {
    flex: 2.8,
    minWidth: 220,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },
  colType: {
    flex: 1.1,
    minWidth: 100,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  colPrice: {
    flex: 1.3,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  colStatus: {
    flex: 1.0,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  colAiValue: {
    flex: 1.0,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  colPerformance: {
    flex: 1.4,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  colActions: {
    width: 88,
    minWidth: 88,
    paddingHorizontal: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  propThumb: {
    width: 60,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F4F6F5",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  propTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  propLocation: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  typeText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  forSaleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8EEFC",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  forSaleBadgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#2251D6",
  },
  priceText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  boostCountdown: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F4823A",
  },
  aiValueText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#04cf92",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#0B1A17",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    textAlign: "center",
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: "#04cf92",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: { color: colorTokens.onBrand, fontFamily: fonts.semiBold, fontSize: 14 },
  loadMoreButton: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadMoreText: { color: "#04cf92", fontFamily: fonts.semiBold, fontSize: 13 },
  mobileCardList: {
    padding: 16,
    gap: 16,
  },
  mobileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 16,
    gap: 12,
  },
  mobileCardHead: {
    flexDirection: "row",
    gap: 12,
  },
  mobileThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F4F6F5",
  },
  mobileCardBody: {
    gap: 10,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11,26,23,0.08)",
    paddingTop: 10,
  },
  mobileMetricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  mobileActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  mobileActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mobileActionText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  // Blurred Backdrop & Dropdown menu styles
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.22)",
    ...Platform.select({
      web: {
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      },
      default: {},
    }),
  },
  menuDropdown: {
    position: "absolute",
    zIndex: 9999,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.10)",
    paddingVertical: 4,
    minWidth: 150,
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(11,26,23,0.18)",
      },
      default: {
        elevation: 10,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  menuItemPressed: {
    backgroundColor: "#F4F6F5",
  },
  menuItemText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  menuDivider: {
    height: 0.8,
    backgroundColor: "rgba(11,26,23,0.06)",
    marginVertical: 4,
  },
});
