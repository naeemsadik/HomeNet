import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart2,
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Eye,
  FileText,
  Globe,
  Handshake,
  Heart,
  Home,
  LayoutDashboard,
  LineChart as LineChartIcon,
  LogOut,
  MessageCircle,
  MessageSquare,
  MessageSquareText,
  Plus,
  PlusCircle,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { useMyProperties } from "@/features/property/hooks/useMyProperties";

// Types
export type SellerNavKey =
  | "dashboard"
  | "listings"
  | "create"
  | "verification"
  | "boost"
  | "insights"
  | "messages"
  | "analytics"
  | "payments"
  | "notifications"
  | "profile"
  | "settings"
  | "help"
  | "logout";

interface StatItem {
  id: string;
  label: string;
  value: string;
  trend?: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  hasUnreadDot?: boolean;
}

export function SellerDashboardScreen() {
  const { isPhone, isTablet, width } = useResponsive();
  const [activeNav, setActiveNav] = useState<SellerNavKey>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuthStore();
  const { data: myPropertiesData } = useMyProperties();
  const allMyListings =
    myPropertiesData?.pages.flatMap((page) => page.data?.items ?? (page.data as any)?.data ?? []) ?? [];

  const sellerName = user?.full_name || user?.email?.split("@")[0] || "Partner";
  const totalCount = allMyListings.length;
  const activeCount = allMyListings.filter((p) => p.status === "active").length;
  const draftCount = allMyListings.filter((p) => p.status === "draft").length;
  const soldCount = allMyListings.filter((p) => p.status === "sold").length;
  const verifiedCount = allMyListings.filter((p) => Boolean(p.is_verified)).length;

  const stats: StatItem[] = [
    {
      id: "total",
      label: "Total Listings",
      value: String(totalCount),
      trend: totalCount > 0 ? "+1" : undefined,
      icon: Building2,
      iconBg: "#E7F2EE",
      iconColor: "#0F6D55",
    },
    {
      id: "active",
      label: "Active Listings",
      value: String(activeCount),
      trend: activeCount > 0 ? "+1" : undefined,
      icon: CheckCircle2,
      iconBg: "#E7F2EE",
      iconColor: "#0F6D55",
    },
    {
      id: "draft",
      label: "Draft Listings",
      value: String(draftCount),
      icon: FileText,
      iconBg: "#F4F6F5",
      iconColor: "#5C6B66",
    },
    {
      id: "sold",
      label: "Sold / Rented",
      value: String(soldCount),
      icon: Handshake,
      iconBg: "#E8EEFC",
      iconColor: "#2251D6",
    },
    {
      id: "verified",
      label: "Verified Properties",
      value: String(verifiedCount),
      icon: ShieldCheck,
      iconBg: "#E7F2EE",
      iconColor: "#0F6D55",
    },
    {
      id: "boosted",
      label: "Boosted Listings",
      value: "0",
      icon: Zap,
      iconBg: "#FDEEE2",
      iconColor: "#F4823A",
    },
    {
      id: "views",
      label: "Total Views",
      value: totalCount > 0 ? `${totalCount * 14}` : "0",
      icon: Eye,
      iconBg: "#E8EEFC",
      iconColor: "#2251D6",
    },
    {
      id: "inquiries",
      label: "Buyer Inquiries",
      value: "0",
      icon: MessageSquare,
      iconBg: "#FDEEE2",
      iconColor: "#F4823A",
    },
    {
      id: "saved",
      label: "Saved by Buyers",
      value: "0",
      icon: Heart,
      iconBg: "#E7F2EE",
      iconColor: "#0F6D55",
    },
  ];

  const recentActivities: ActivityItem[] = allMyListings.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.status === "active" ? "Listing is Live" : "Draft Listing Saved",
    description: `${p.title} · ${p.area?.name || "Dhaka"}`,
    time: "Recently updated",
    icon: p.status === "active" ? BadgeCheck : FileText,
    iconBg: "#E7F2EE",
    iconColor: "#0F6D55",
    hasUnreadDot: false,
  }));

  // Sidebar Items list
  const sidebarNavItems: {
    key: SellerNavKey;
    label: string;
    icon: any;
    badgeCount?: number;
    danger?: boolean;
    href?: string;
  }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
    { key: "listings", label: "My Listings", icon: Building2, href: "/my-properties" },
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

  return (
    <View style={styles.outerContainer}>
      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          {/* Logo & Brand Header */}
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

          {/* Navigation Links */}
          <ScrollView
            contentContainerStyle={styles.sidebarNavScroll}
            showsVerticalScrollIndicator={false}
          >
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.key;

              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
                  onPress={() => setActiveNav(item.key)}
                  style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                    item.danger && styles.navItemDanger,
                  ]}
                >
                  <IconComp
                    color={
                      item.danger
                        ? "#D4183D"
                        : isActive
                        ? "#0F6D55"
                        : "#5C6B66"
                    }
                    size={20}
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      isActive && styles.navItemTextActive,
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

      {/* Main Content Workspace */}
      <View style={styles.mainContent}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Dashboard</Text>

          <View style={styles.headerActions}>
            {/* Search Input */}
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

            {/* Notification Button */}
            <AppLink href="/notifications" style={styles.iconCircleBtn}>
              <Bell color="#0B1A17" size={19} />
              <View style={styles.headerDotIndicator} />
            </AppLink>

            {/* View site button */}
            <AppLink href="/" style={styles.viewSiteBtn}>
              <Globe color="#0B1A17" size={16} />
              <Text style={styles.viewSiteText}>View site</Text>
            </AppLink>
          </View>
        </View>

        {/* Scrollable Dashboard Body */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollBody,
            isPhone && styles.scrollBodyPhone,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Banner */}
          <LinearGradient
            colors={["#0F6D55", "#2251D6"]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContentLeft}>
              <Text style={styles.heroSubtitle}>Welcome back,</Text>
              <Text style={styles.heroTitle}>{sellerName}</Text>
              <Text style={styles.heroDescription}>
                {totalCount > 0 ? (
                  <>
                    You have <Text style={styles.boldSpan}>{activeCount} active</Text> listings live. Track views and buyer inquiries below.
                  </>
                ) : (
                  "Welcome to your seller dashboard. Add your first property to reach verified buyers across Bangladesh."
                )}
              </Text>

              <View style={styles.heroButtonRow}>
                <AppLink href="/property/create" style={styles.heroBtnPrimary}>
                  <Plus color="#0F6D55" size={16} />
                  <Text style={styles.heroBtnPrimaryText}>Add new property</Text>
                </AppLink>

                <Pressable style={({ pressed }) => [styles.heroBtnSecondary, pressed && styles.pressed]}>
                  <Sparkles color="#FFFFFF" size={16} />
                  <Text style={styles.heroBtnSecondaryText}>Boost a listing</Text>
                </Pressable>
              </View>
            </View>

            {!isPhone && (
              <View style={styles.heroDecorationIcon}>
                <Rocket color="rgba(255,255,255,0.25)" size={140} />
              </View>
            )}
          </LinearGradient>

          {/* Stats Grid (3x3 Cards) */}
          <View style={[styles.statsGrid, isPhone && styles.statsGridPhone]}>
            {stats.map((item) => {
              const IconComponent = item.icon;
              return (
                <View key={item.id} style={[styles.statCard, isPhone && styles.statCardPhone]}>
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconWrap, { backgroundColor: item.iconBg }]}>
                      <IconComponent color={item.iconColor} size={20} />
                    </View>

                    {item.trend ? (
                      <View style={styles.trendPill}>
                        <TrendingUp color="#0F6D55" size={12} />
                        <Text style={styles.trendPillText}>{item.trend}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Bottom Section (Chart + Recent Activity Grid) */}
          <View style={[styles.bottomGrid, isTablet && styles.bottomGridTablet]}>
            {/* Left Box: Listing Views Area Chart */}
            <View style={styles.chartCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleRow}>
                  <LineChartIcon color="#0B1A17" size={20} />
                  <View>
                    <Text style={styles.cardTitle}>Listing views</Text>
                    <Text style={styles.cardSubtext}>Last 7 days</Text>
                  </View>
                </View>

                <AppLink href="/market" style={styles.analyticsLink}>
                  <Text style={styles.analyticsLinkText}>Analytics</Text>
                  <ArrowUpRight color="#0F6D55" size={16} />
                </AppLink>
              </View>

              {/* Chart SVG */}
              <View style={styles.chartSvgWrap}>
                <Svg height={220} width="100%" viewBox="0 0 500 200">
                  <Defs>
                    <SvgGradient id="chartTealGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#0F6D55" stopOpacity="0.3" />
                      <Stop offset="100%" stopColor="#0F6D55" stopOpacity="0.0" />
                    </SvgGradient>
                  </Defs>

                  {/* Gradient Area Fill */}
                  <Path
                    d="M 20 160 Q 90 130 160 140 T 300 90 T 440 50 L 440 180 L 20 180 Z"
                    fill="url(#chartTealGrad)"
                  />

                  {/* Trend Line */}
                  <Path
                    d="M 20 160 Q 90 130 160 140 T 300 90 T 440 50"
                    fill="none"
                    stroke="#0F6D55"
                    strokeWidth="3.5"
                  />

                  {/* Data Points */}
                  <Circle cx="20" cy="160" r="4.5" fill="#0F6D55" />
                  <Circle cx="90" cy="130" r="4.5" fill="#0F6D55" />
                  <Circle cx="160" cy="140" r="4.5" fill="#0F6D55" />
                  <Circle cx="230" cy="110" r="4.5" fill="#0F6D55" />
                  <Circle cx="300" cy="90" r="4.5" fill="#0F6D55" />
                  <Circle cx="370" cy="65" r="4.5" fill="#0F6D55" />
                  <Circle cx="440" cy="50" r="4.5" fill="#0F6D55" />

                  {/* Days X Axis */}
                  <SvgText x="20" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Mon</SvgText>
                  <SvgText x="90" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Tue</SvgText>
                  <SvgText x="160" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Wed</SvgText>
                  <SvgText x="230" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Thu</SvgText>
                  <SvgText x="300" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Fri</SvgText>
                  <SvgText x="370" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Sat</SvgText>
                  <SvgText x="440" y="195" fill="#5C6B66" fontSize="12" textAnchor="middle">Sun</SvgText>
                </Svg>
              </View>
            </View>

            {/* Right Box: Recent Activity Feed */}
            <View style={styles.activityCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleRow}>
                  <Bell color="#0B1A17" size={20} />
                  <Text style={styles.cardTitle}>Recent activity</Text>
                </View>

                <AppLink href="/notifications">
                  <Text style={styles.analyticsLinkText}>See all</Text>
                </AppLink>
              </View>

              <View style={styles.activityList}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => {
                    const ActIcon = act.icon;
                    return (
                      <View key={act.id} style={styles.activityItem}>
                        <View style={[styles.activityIconWrap, { backgroundColor: act.iconBg }]}>
                          <ActIcon color={act.iconColor} size={16} />
                        </View>

                        <View style={styles.activityContent}>
                          <View style={styles.activityTitleRow}>
                            <Text style={styles.activityTitle}>{act.title}</Text>
                            {act.hasUnreadDot ? <View style={styles.unreadOrangeDot} /> : null}
                          </View>
                          <Text numberOfLines={1} style={styles.activityDesc}>
                            {act.description}
                          </Text>
                        </View>

                        <Text style={styles.activityTime}>{act.time}</Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ paddingVertical: 24, alignItems: "center" }}>
                    <Text style={{ fontSize: 13, color: "#5C6B66", textAlign: "center" }}>
                      No recent activity. Inquiries and updates on your listings will appear here.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
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
    gap: 24,
  },
  scrollBodyPhone: {
    padding: 16,
    gap: 16,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  heroContentLeft: {
    flex: 1,
    maxWidth: 580,
    gap: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: fonts.regular,
  },
  heroTitle: {
    fontSize: 26,
    color: "#FFFFFF",
    fontFamily: fonts.extraBold,
    letterSpacing: -0.5,
  },
  heroDescription: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  boldSpan: {
    fontFamily: fonts.bold,
  },
  heroButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  heroBtnPrimary: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 18,
  },
  heroBtnPrimaryText: {
    color: "#0F6D55",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  heroBtnSecondary: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 18,
  },
  heroBtnSecondaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  heroDecorationIcon: {
    marginRight: 10,
    opacity: 0.85,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statsGridPhone: {
    flexDirection: "column",
  },
  statCard: {
    width: "32.3%",
    minWidth: 220,
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 18,
    gap: 10,
  },
  statCardPhone: {
    width: "100%",
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trendPillText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  bottomGrid: {
    flexDirection: "row",
    gap: 24,
  },
  bottomGridTablet: {
    flexDirection: "column",
  },
  chartCard: {
    flex: 1.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
  },
  activityCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  cardSubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  analyticsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  analyticsLinkText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  chartSvgWrap: {
    marginTop: 10,
    width: "100%",
  },
  activityList: {
    gap: 12,
    marginTop: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FAFBFB",
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  unreadOrangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F4823A",
  },
  activityDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  activityTime: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
});
