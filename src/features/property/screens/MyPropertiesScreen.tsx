import { router } from "expo-router";
import {
  BadgeCheck,
  BarChart2,
  Bell,
  Building2,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Edit,
  Eye,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MessageSquareText,
  MoreVertical,
  Plus,
  PlusCircle,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";
import { useMyProperties } from "../hooks/useMyProperties";
import { useDeleteProperty } from "../hooks/usePropertyMutations";
import type { Property } from "../types/property";

export type ListingFilter = "all" | "active" | "draft" | "pending" | "sold" | "archived";

interface ListingItemData {
  id: string;
  title: string;
  location: string;
  imageUrl?: string;
  type: string;
  listingType: "For Sale" | "For Rent";
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
  const { isPhone, isTablet } = useResponsive();
  const [activeFilter, setActiveFilter] = useState<ListingFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deleteMutation = useDeleteProperty();

  // Fetch real API data
  const { data, isLoading } = useMyProperties();
  const apiProperties = data?.pages.flatMap((p) => p.data?.items ?? []) ?? [];

  // Mapped real API listings
  const allListings = useMemo(() => {
    return apiProperties.map((p) => ({
      id: p.id,
      title: p.title || "Untitled Property",
      location: p.area?.name ? `${p.area.name}, ${(p.area as any)?.city || "Dhaka"}` : p.address || "Dhaka",
      imageUrl: p.media?.find((m) => m.media_type === "image")?.url || p.media?.[0]?.url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
      type: p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : "Apartment",
      listingType: (p.listing_type === "rent" ? "For Rent" : "For Sale") as "For Rent" | "For Sale",
      price: `${p.price_currency === "BDT" ? "৳" : (p.price_currency || "৳")} ${typeof p.price === "number" ? p.price.toLocaleString("en-BD") : p.price}${p.listing_type === "rent" ? "/mo" : ""}`,
      status: (p.status as any) || "active",
      isVerified: p.is_verified ?? false,
      isBoosted: false,
      boostText: undefined as string | undefined,
      aiValue: typeof p.price === "number" ? `৳ ${((p.price * 1.05) / 10000000).toFixed(2)}Cr` : "—",
      views: String(p.view_count || 0),
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

  // Sidebar items
  const sidebarNavItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
    { key: "listings", label: "My Listings", icon: Building2, href: "/my-properties", active: true },
    { key: "create", label: "Create Property", icon: PlusCircle, href: "/property/create" },
    { key: "verification", label: "Verification", icon: ShieldCheck },
    { key: "boost", label: "Boost Listings", icon: Rocket },
    { key: "insights", label: "AI Insights", icon: Sparkles, href: "/ai-finder" },
    { key: "messages", label: "Messages", icon: MessageSquareText },
    { key: "analytics", label: "Analytics", icon: BarChart2, href: "/market" },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell, badgeCount: 3, href: "/notifications" },
    { key: "profile", label: "Profile", icon: User, href: "/profile" },
    { key: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { key: "help", label: "Help Center", icon: CircleHelp, href: "/about" },
    { key: "logout", label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Property", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutateAsync(id) },
    ]);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconBg}>
                <Building2 color="#FFFFFF" size={20} />
              </View>
              <Text style={styles.brandText}>
                Home<Text style={styles.brandTextAccent}>net</Text>
              </Text>
            </View>
            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>Seller Dashboard</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.sidebarNavScroll} showsVerticalScrollIndicator={false}>
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
                  style={[
                    styles.navItem,
                    item.active && styles.navItemActive,
                    item.danger && styles.navItemDanger,
                  ]}
                >
                  <IconComp
                    color={item.danger ? "#D4183D" : item.active ? "#0F6D55" : "#5C6B66"}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      item.active && styles.navItemTextActive,
                      item.danger && styles.navItemTextDanger,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badgeCount ? (
                    <View style={styles.badgeCountPill}>
                      <Text style={styles.badgeCountText}>{item.badgeCount}</Text>
                    </View>
                  ) : null}
                </AppLink>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Workspace */}
      <View style={styles.mainContent}>
        {/* Header Bar */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>My Listings</Text>

          <View style={styles.headerActions}>
            {!isPhone && (
              <View style={styles.searchContainer}>
                <Search color="rgba(11,26,23,0.5)" size={16} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Search listings…"
                  placeholderTextColor="rgba(11,26,23,0.5)"
                  style={styles.searchInput}
                  value={searchQuery}
                />
              </View>
            )}

            <AppLink href="/notifications" style={styles.iconCircleBtn}>
              <Bell color="#0B1A17" size={19} />
              <View style={styles.headerDotIndicator} />
            </AppLink>

            <AppLink href="/" style={styles.viewSiteBtn}>
              <Globe color="#0B1A17" size={16} />
              <Text style={styles.viewSiteText}>View site</Text>
            </AppLink>
          </View>
        </View>

        {/* Listings Body */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Top Filter Bar + Add New Property */}
          <View style={[styles.filterBarRow, isPhone && styles.filterBarRowPhone]}>
            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              <View style={styles.pillsRow}>
                {(
                  [
                    ["all", "All", counts.all],
                    ["active", "Active", counts.active],
                    ["draft", "Draft", counts.draft],
                    ["pending", "Pending", counts.pending],
                    ["sold", "Sold", counts.sold],
                    ["archived", "Archived", counts.archived],
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
                        <Text style={[styles.pillCountText, isSelected && styles.pillCountTextActive]}>
                          {count}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Add Property Primary Button */}
            <AppLink href="/property/create" style={styles.addPropertyBtn}>
              <Plus color="#FFFFFF" size={16} />
              <Text style={styles.addPropertyBtnText}>Add new property</Text>
            </AppLink>
          </View>

          {/* Listings Table / Card View */}
          <View style={styles.tableCard}>
            {/* Desktop Table View */}
            {!isPhone ? (
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { flex: 2.2 }]}>Property</Text>
                  <Text style={[styles.thCell, { flex: 1 }]}>Type</Text>
                  <Text style={[styles.thCell, { flex: 1.1 }]}>Price</Text>
                  <Text style={[styles.thCell, { flex: 1.1 }]}>Status</Text>
                  <Text style={[styles.thCell, { flex: 1 }]}>AI Value</Text>
                  <Text style={[styles.thCell, { flex: 1.5 }]}>Performance</Text>
                  <Text style={[styles.thCell, { width: 60, textAlign: "right" }]}>Actions</Text>
                </View>

                {/* Table Data Rows */}
                {filteredListings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Building2 color="#5C6B66" size={40} />
                    <Text style={styles.emptyTitle}>No listings found</Text>
                    <Text style={styles.emptySub}>No properties match the selected filter.</Text>
                  </View>
                ) : (
                  filteredListings.map((item) => (
                    <View key={item.id} style={styles.tableDataRow}>
                      {/* Property Info (Thumbnail, Title, Verified, Boost, Location) */}
                      <View style={[styles.tdCell, { flex: 2.2, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                        <Image source={{ uri: item.imageUrl }} style={styles.propThumb} />
                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text style={styles.propTitle} numberOfLines={1}>{item.title}</Text>
                            {item.isVerified ? <CheckCircle2 color="#0F6D55" size={16} /> : null}
                            {item.isBoosted ? <Zap color="#F4823A" size={14} /> : null}
                          </View>
                          <Text style={styles.propLocation}>{item.location}</Text>
                        </View>
                      </View>

                      {/* Type Column */}
                      <View style={[styles.tdCell, { flex: 1, gap: 4 }]}>
                        <Text style={styles.typeText}>{item.type}</Text>
                        <View style={styles.forSaleBadge}>
                          <Text style={styles.forSaleBadgeText}>{item.listingType}</Text>
                        </View>
                      </View>

                      {/* Price Column */}
                      <View style={[styles.tdCell, { flex: 1.1 }]}>
                        <Text style={styles.priceText}>{item.price}</Text>
                      </View>

                      {/* Status Column */}
                      <View style={[styles.tdCell, { flex: 1.1, gap: 4 }]}>
                        <View style={[styles.statusBadge, getStatusStyle(item.status).bgStyle]}>
                          <Text style={[styles.statusBadgeText, getStatusStyle(item.status).textStyle]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Text>
                        </View>
                        {item.boostText ? (
                          <Text style={styles.boostCountdown}>{item.boostText}</Text>
                        ) : null}
                      </View>

                      {/* AI Value Column */}
                      <View style={[styles.tdCell, { flex: 1, flexDirection: "row", alignItems: "center", gap: 4 }]}>
                        <Sparkles color="#0F6D55" size={14} />
                        <Text style={styles.aiValueText}>{item.aiValue}</Text>
                      </View>

                      {/* Performance Column (Views, Likes, Inquiries) */}
                      <View style={[styles.tdCell, { flex: 1.5, flexDirection: "row", alignItems: "center", gap: 12 }]}>
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

                      {/* Actions Column */}
                      <View style={[styles.tdCell, { width: 60, alignItems: "flex-end" }]}>
                        <Pressable
                          onPress={() => handleDelete(item.id, item.title)}
                          style={({ pressed }) => [styles.actionIconButton, webPointer, pressed && styles.pressed]}
                        >
                          <MoreVertical color="#5C6B66" size={16} />
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : (
              /* Mobile Card View */
              <View style={styles.mobileCardList}>
                {filteredListings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Building2 color="#5C6B66" size={40} />
                    <Text style={styles.emptyTitle}>No listings found</Text>
                    <Text style={styles.emptySub}>No properties match the selected filter.</Text>
                  </View>
                ) : (
                  filteredListings.map((item) => (
                    <View key={item.id} style={styles.mobileCard}>
                      <View style={styles.mobileCardHead}>
                        <Image source={{ uri: item.imageUrl }} style={styles.mobileThumb} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.propTitle}>{item.title}</Text>
                        <Text style={styles.propLocation}>{item.location}</Text>
                        <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                          <View style={styles.forSaleBadge}>
                            <Text style={styles.forSaleBadgeText}>{item.listingType}</Text>
                          </View>
                          <View style={[styles.statusBadge, getStatusStyle(item.status).bgStyle]}>
                            <Text style={[styles.statusBadgeText, getStatusStyle(item.status).textStyle]}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.mobileCardBody}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                        <Text style={styles.priceText}>{item.price}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Sparkles color="#0F6D55" size={14} />
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
                          <Text style={styles.mobileActionText}>View</Text>
                        </AppLink>
                        <AppLink href={`/property/edit?id=${item.id}`} style={styles.mobileActionBtn}>
                          <Edit color="#0F6D55" size={14} />
                          <Text style={[styles.mobileActionText, { color: "#0F6D55" }]}>Edit</Text>
                        </AppLink>
                        <Pressable onPress={() => handleDelete(item.id, item.title)} style={styles.mobileActionBtn}>
                          <Trash2 color="#D4183D" size={14} />
                          <Text style={[styles.mobileActionText, { color: "#D4183D" }]}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// Helper to style status badges
function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return { bgStyle: { backgroundColor: "#E7F2EE" }, textStyle: { color: "#0F6D55" } };
    case "pending":
      return { bgStyle: { backgroundColor: "#FDEEE2" }, textStyle: { color: "#F4823A" } };
    case "sold":
      return { bgStyle: { backgroundColor: "#E8EEFC" }, textStyle: { color: "#2251D6" } };
    case "draft":
      return { bgStyle: { backgroundColor: "#F4F6F5" }, textStyle: { color: "#5C6B66" } };
    case "archived":
      return { bgStyle: { backgroundColor: "#F4F6F5" }, textStyle: { color: "#899790" } };
    default:
      return { bgStyle: { backgroundColor: "#E7F2EE" }, textStyle: { color: "#0F6D55" } };
  }
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  outerContainer: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
  },
  sidebar: {
    width: 256,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 0.8,
    borderRightColor: "rgba(11,26,23,0.08)",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sidebarHeader: {
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  brandTextAccent: {
    color: "#0F6D55",
  },
  sellerRolePill: {
    backgroundColor: "#E8EEFC",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sellerRoleText: {
    color: "#2251D6",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  sidebarNavScroll: {
    gap: 2,
    paddingVertical: 8,
  },
  navItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "#E7F2EE",
  },
  navItemDanger: {
    marginTop: 8,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  navItemTextActive: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
  },
  navItemTextDanger: {
    color: "#D4183D",
  },
  badgeCountPill: {
    backgroundColor: "#F4823A",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
  },
  topHeader: {
    minHeight: 64,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11,26,23,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.38,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    width: 256,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerDotIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4823A",
  },
  viewSiteBtn: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  viewSiteText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  scrollBody: {
    padding: 24,
    gap: 20,
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
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  pillLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  pillLabelActive: {
    color: "#FFFFFF",
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
    backgroundColor: "#0F6D55",
    borderRadius: 999,
    paddingHorizontal: 18,
  },
  addPropertyBtnText: {
    color: "#FFFFFF",
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
  table: {
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11,26,23,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thCell: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  tableDataRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11,26,23,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tdCell: {
    justifyContent: "center",
  },
  propThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F4F6F5",
  },
  propTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  propLocation: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  typeText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  forSaleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8EEFC",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  forSaleBadgeText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#2251D6",
  },
  priceText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  boostCountdown: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F4823A",
  },
  aiValueText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0F6D55",
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
  },
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
});
