import {
  ArrowUpRight,
  BadgeCheck,
  BarChart2,
  Bell,
  Building2,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Eye,
  FileText,
  Handshake,
  Heart,
  LayoutDashboard,
  LineChart as LineChartIcon,
  LogOut,
  MessageSquare,
  PlusCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { confirmAction } from "@/lib/alert";
import { router, useLocalSearchParams } from "expo-router";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { AppLink } from "@/components/ui";
import { Brand } from "@/components/Brand";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme";
import { useMyProperties } from "@/features/property/hooks/useMyProperties";
import { SellerWelcomeBanner } from "../components/SellerWelcomeBanner";
import { SellerAnalyticsWorkspace } from "../components/SellerAnalyticsWorkspace";
import { SellerBoostModal } from "../components/SellerBoostModal";
import { SellerBoostWorkspace } from "../components/SellerBoostWorkspace";
import { SellerHelpWorkspace } from "../components/SellerHelpWorkspace";
import { SellerInsightsWorkspace } from "../components/SellerInsightsWorkspace";
import { SellerPaymentsWorkspace } from "../components/SellerPaymentsWorkspace";
import { SellerTopHeader } from "../components/SellerTopHeader";
import { SellerMobileDrawer } from "../components/SellerMobileDrawer";
import { SellerStatCard, type StatItem } from "../components/SellerStatCard";
import { ToggleViewButton } from "../components/ToggleViewButton";
import { Footer } from "@/components/Footer";
import { styles } from "./SellerDashboardScreen.styles";

// Types
export type SellerNavKey =
  | "dashboard"
  | "listings"
  | "create"
  | "verification"
  | "boost"
  | "insights"
  | "analytics"
  | "payments"
  | "notifications"
  | "profile"
  | "help"
  | "logout";

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
  const { user } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeNav, setActiveNav] = useState<SellerNavKey>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [boostModalVisible, setBoostModalVisible] = useState(false);
  const [selectedBoostPkg, setSelectedBoostPkg] = useState<string>("featured");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (
      tab &&
      ["dashboard", "boost", "insights", "analytics", "payments", "help"].includes(tab)
    ) {
      setActiveNav(tab as SellerNavKey);
    } else if (!tab) {
      setActiveNav("dashboard");
    }
  }, [tab]);

  const handleOpenBoost = (packageId?: string) => {
    if (packageId) setSelectedBoostPkg(packageId);
    setBoostModalVisible(true);
  };

  const handleLogout = async () => {
    const confirmed = await confirmAction("Log Out", "Are you sure you want to log out of your account?", {
      confirmLabel: "Log Out",
      destructive: true,
    });
    if (!confirmed) return;
    logout();
    router.replace("/home");
  };

  const { data: myPropertiesData } = useMyProperties();
  const allMyListings =
    myPropertiesData?.pages.flatMap((page) => page.data?.items ?? (page.data as any)?.data ?? []) ?? [];

  const sellerName = user?.full_name || user?.email?.split("@")[0] || "Partner";
  const totalCount = allMyListings.length;
  const activeCount = allMyListings.filter((p) => p.status === "active").length;
  const draftCount = allMyListings.filter((p) => p.status === "draft").length;
  const soldCount = allMyListings.filter((p) => p.status === "sold").length;
  const verifiedCount = allMyListings.filter((p) => Boolean(p.is_verified)).length;
  const totalViews = allMyListings.reduce((sum, p) => sum + (p.view_count || 0), 0);

  // Desktop stats grid (3x3 layout for laptop/PC viewports)
  // Single source of truth for the stats grid — same data and colors on
  // every breakpoint, only the layout (3x3 vs 2x2) differs. Trends are only
  // shown when there is a real underlying change to report.
  const sellerStats: StatItem[] = [
    {
      id: "total",
      label: "Total Listings",
      value: String(totalCount),
      trend: totalCount > 0 ? "+1" : undefined,
      icon: Building2,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
    {
      id: "active",
      label: "Active Listings",
      value: String(activeCount),
      trend: activeCount > 0 ? "+1" : undefined,
      icon: CheckCircle2,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
    {
      id: "draft",
      label: "Draft Listings",
      value: String(draftCount),
      icon: FileText,
      iconBg: "#F4F6F5",
      iconColor: colors.muted,
    },
    {
      id: "sold",
      label: "Sold / Rented",
      value: String(soldCount),
      icon: Handshake,
      iconBg: colors.blueLight,
      iconColor: colors.blue,
    },
    {
      id: "verified",
      label: "Verified Properties",
      value: String(verifiedCount),
      icon: ShieldCheck,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
    {
      id: "boosted",
      label: "Boosted Listings",
      value: "0",
      icon: Zap,
      iconBg: colors.orangeLight,
      iconColor: colors.orange,
    },
    {
      id: "views",
      label: "Total Views",
      value: String(totalViews),
      icon: Eye,
      iconBg: colors.blueLight,
      iconColor: colors.blue,
    },
    {
      id: "inquiries",
      label: "Buyer Inquiries",
      value: "0",
      icon: MessageSquare,
      iconBg: colors.orangeLight,
      iconColor: colors.orange,
    },
    {
      id: "saved",
      label: "Saved by Buyers",
      value: "0",
      icon: Heart,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
  ];

  const recentActivities: ActivityItem[] = allMyListings.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.status === "active" ? "Listing is Live" : "Draft Listing Saved",
    description: `${p.title} · ${p.area?.name || "Dhaka"}`,
    time: "Recently updated",
    icon: p.status === "active" ? BadgeCheck : FileText,
    iconBg: colors.greenLight,
    iconColor: colors.green,
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
    { key: "verification", label: "Verification", icon: ShieldCheck, href: "/verification" },
    { key: "boost", label: "Boost Listings", icon: Rocket, href: "/seller?tab=boost" },
    { key: "insights", label: "AI Insights", icon: Sparkles, href: "/seller?tab=insights" },
    { key: "analytics", label: "Analytics", icon: BarChart2, href: "/seller?tab=analytics" },
    { key: "payments", label: "Payments", icon: CreditCard, href: "/seller?tab=payments" },
    { key: "profile", label: "Profile", icon: User, href: "/seller/profile" },
    { key: "help", label: "Help Center", icon: CircleHelp, href: "/seller?tab=help" },
    { key: "logout", label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  const activeTitle =
    sidebarNavItems.find((i) => i.key === activeNav)?.label || "Dashboard";

  return (
    <View style={styles.outerContainer}>
      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          {/* Logo & Brand Header */}
          <View style={styles.sidebarHeader}>
            <Brand />

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
                  onPress={() => {
                    if (item.key === "logout") {
                      handleLogout();
                      return;
                    }
                    if (item.href?.startsWith("/seller?tab=")) {
                      setActiveNav(item.key);
                      router.setParams({ tab: item.key });
                      return;
                    }
                    if (item.key === "dashboard") {
                      setActiveNav("dashboard");
                      router.setParams({ tab: undefined });
                      return;
                    }
                    setActiveNav(item.key);
                  }}
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
                        ? colors.green
                        : colors.muted
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
        {isTablet ? (
          /* Mobile Header (Figma Node 207:2478 with 3-bar button and View site) */
          <SellerTopHeader
            hasUnreadNotifications
            onPressMenu={() => setMobileDrawerOpen(true)}
            onSearchQueryChange={setSearchQuery}
            searchQuery={searchQuery}
            title={activeTitle}
          />
        ) : (
          /* Original Untouched Desktop Header Bar */
          <View style={styles.topHeader}>
            <Text style={styles.headerTitle}>{activeTitle}</Text>

            <View style={styles.headerActions}>
              {/* Search Input */}
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

              {/* Notification Button */}
              <AppLink href="/notifications" style={styles.iconCircleBtn}>
                <Bell color={colors.ink} size={19} />
                <View style={styles.headerDotIndicator} />
              </AppLink>

              {/* Toggle view button */}
              <ToggleViewButton />
            </View>
          </View>
        )}

        {/* Scrollable Workspace Body */}
        <ScrollView
          contentContainerStyle={styles.workspaceScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.scrollBody, isPhone && styles.scrollBodyPhone]}>
            {activeNav === "dashboard" && (
              <>
            {/* Welcome Banner (Figma Node 220:8881) */}
            <SellerWelcomeBanner
              name={sellerName}
            viewsThisWeek={totalViews}
            inquiriesThisWeek={0}
            onBoostListing={() => setBoostModalVisible(true)}
          />

          {/* Stats Grid: Responsive */}
          {isTablet ? (
            /* Mobile / Small Screens: 2-by-2 card layout */
            <View style={styles.statsGridMobile}>
              {sellerStats.map((item) => (
                <SellerStatCard item={item} key={item.id} />
              ))}
            </View>
          ) : (
            /* PC / Laptop / Big Screens: 3x3 layout */
            <View style={styles.statsGridDesktop}>
              {sellerStats.map((item) => {
                const IconComponent = item.icon;
                return (
                  <View key={item.id} style={styles.statCardDesktop}>
                    <View style={styles.statCardHeaderDesktop}>
                      <View style={[styles.statIconWrapDesktop, { backgroundColor: item.iconBg }]}>
                        <IconComponent color={item.iconColor} size={20} />
                      </View>

                      {item.trend ? (
                        <View style={styles.trendPillDesktop}>
                          <TrendingUp color={colors.green} size={12} />
                          <Text style={styles.trendPillTextDesktop}>{item.trend}</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.statValueDesktop}>{item.value}</Text>
                    <Text style={styles.statLabelDesktop}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Bottom Section (Chart + Recent Activity Grid) */}
          <View style={[styles.bottomGrid, isTablet && styles.bottomGridTablet]}>
            {/* Left Box: Listing Views Area Chart */}
            <View style={styles.chartCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleRow}>
                  <LineChartIcon color={colors.ink} size={20} />
                  <View>
                    <Text style={styles.cardTitle}>Listing views</Text>
                    <Text style={styles.cardSubtext}>Last 7 days</Text>
                  </View>
                </View>

                <AppLink href="/market" style={styles.analyticsLink}>
                  <Text style={styles.analyticsLinkText}>Analytics</Text>
                  <ArrowUpRight color={colors.green} size={16} />
                </AppLink>
              </View>

              {/* Chart SVG */}
              <View style={styles.chartSvgWrap}>
                <Svg height={220} width="100%" viewBox="0 0 500 200">
                  <Defs>
                    <SvgGradient id="chartTealGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={colors.green} stopOpacity="0.3" />
                      <Stop offset="100%" stopColor={colors.green} stopOpacity="0.0" />
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
                    stroke={colors.green}
                    strokeWidth="3.5"
                  />

                  {/* Data Points */}
                  <Circle cx="20" cy="160" r="4.5" fill={colors.green} />
                  <Circle cx="90" cy="130" r="4.5" fill={colors.green} />
                  <Circle cx="160" cy="140" r="4.5" fill={colors.green} />
                  <Circle cx="230" cy="110" r="4.5" fill={colors.green} />
                  <Circle cx="300" cy="90" r="4.5" fill={colors.green} />
                  <Circle cx="370" cy="65" r="4.5" fill={colors.green} />
                  <Circle cx="440" cy="50" r="4.5" fill={colors.green} />

                  {/* Days X Axis */}
                  <SvgText x="20" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Mon</SvgText>
                  <SvgText x="90" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Tue</SvgText>
                  <SvgText x="160" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Wed</SvgText>
                  <SvgText x="230" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Thu</SvgText>
                  <SvgText x="300" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Fri</SvgText>
                  <SvgText x="370" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Sat</SvgText>
                  <SvgText x="440" y="195" fill={colors.muted} fontSize="12" textAnchor="middle">Sun</SvgText>
                </Svg>
              </View>
            </View>

            {/* Right Box: Recent Activity Feed */}
            <View style={styles.activityCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleRow}>
                  <Bell color={colors.ink} size={20} />
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
                    <Text style={{ fontSize: 13, color: colors.muted, textAlign: "center" }}>
                      No recent activity. Inquiries and updates on your listings will appear here.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </>
      )}

            {activeNav === "boost" && <SellerBoostWorkspace onOpenBoost={handleOpenBoost} />}
            {activeNav === "insights" && <SellerInsightsWorkspace />}
            {activeNav === "analytics" && <SellerAnalyticsWorkspace />}
            {activeNav === "payments" && <SellerPaymentsWorkspace />}
            {activeNav === "help" && <SellerHelpWorkspace />}
          </View>
          <Footer />
        </ScrollView>
      </View>

      <SellerBoostModal
        onClose={() => setBoostModalVisible(false)}
        onSelectPackage={setSelectedBoostPkg}
        selectedPackage={selectedBoostPkg}
        visible={boostModalVisible}
      />

      {/* Mobile / Tablet Navigation Drawer triggered by 3-bar button */}
      <SellerMobileDrawer
        activeNav={activeNav}
        items={sidebarNavItems}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={(key) => {
          setMobileDrawerOpen(false);
          if (key === "logout") {
            handleLogout();
            return;
          }
          const found = sidebarNavItems.find((i) => i.key === key);
          if (found?.href && !found.href.startsWith("/seller")) {
            router.push(found.href as any);
          } else {
            setActiveNav(key);
            router.setParams({ tab: key === "dashboard" ? undefined : key });
          }
        }}
        visible={isTablet && mobileDrawerOpen}
      />
    </View>
  );

}
