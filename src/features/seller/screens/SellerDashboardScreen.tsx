import {
  ArrowUpRight,
  BadgeCheck,
  BarChart2,
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  Check,
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
  Mail,
  MessageSquare,
  Phone,
  Plus,
  PlusCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AiFinderWorkflow } from "@/components/AiFinderWorkflow";
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
import { colors, fonts, radius, shadow, webPointer } from "@/theme";
import { useMyProperties } from "@/features/property/hooks/useMyProperties";
import { SellerWelcomeBanner } from "../components/SellerWelcomeBanner";
import { SellerTopHeader } from "../components/SellerTopHeader";
import { SellerMobileDrawer } from "../components/SellerMobileDrawer";
import { SellerStatCard, type StatItem } from "../components/SellerStatCard";
import { ToggleViewButton } from "../components/ToggleViewButton";
import { Footer } from "@/components/Footer";

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

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        logout();
        router.replace("/");
      }
      return;
    }

    Alert.alert("Log Out", "Are you sure you want to log out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
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

            {activeNav === "boost" && renderBoostWorkspace()}
            {activeNav === "insights" && renderInsightsWorkspace()}
            {activeNav === "analytics" && renderAnalyticsWorkspace()}
            {activeNav === "payments" && renderPaymentsWorkspace()}
            {activeNav === "help" && renderHelpWorkspace()}
          </View>
          <Footer />
        </ScrollView>
      </View>

      {/* Boost Listings Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setBoostModalVisible(false)}
        transparent
        visible={boostModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            onPress={() => setBoostModalVisible(false)}
            style={styles.modalBackdropTouch}
          />
          <View style={styles.boostModalCard}>
            <View style={styles.boostModalHeader}>
              <View style={styles.boostHeaderIconWrap}>
                <Rocket color={colors.green} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.boostModalTitle}>Boost a listing</Text>
                <Text style={styles.boostModalSub}>
                  Get up to 10x more buyer views and inquiries.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close modal"
                onPress={() => setBoostModalVisible(false)}
                style={[styles.modalCloseBtn, webPointer]}
              >
                <X color={colors.muted} size={18} />
              </Pressable>
            </View>

            {/* Boost Packages */}
            <View style={styles.packagesList}>
              {[
                {
                  id: "featured",
                  name: "Featured Spotlight",
                  price: "৳ 1,500 / 7 days",
                  highlight: "3x More Views",
                  desc: "Top placement in search results and category landing pages.",
                },
                {
                  id: "ai_priority",
                  name: "AI Recommendation Priority",
                  price: "৳ 2,500 / 14 days",
                  highlight: "5x More Inquiries",
                  desc: "Ranked #1 in Homenet's AI Matchmaker search algorithm.",
                },
                {
                  id: "omni_blast",
                  name: "VIP Omni-Channel Blast",
                  price: "৳ 4,500 / 30 days",
                  highlight: "10x Reach",
                  desc: "Included in weekly buyer newsletter and verified partner badges.",
                },
              ].map((pkg) => {
                const isSelected = selectedBoostPkg === pkg.id;
                return (
                  <Pressable
                    key={pkg.id}
                    onPress={() => setSelectedBoostPkg(pkg.id)}
                    style={[
                      styles.pkgCard,
                      isSelected && styles.pkgCardSelected,
                      webPointer,
                    ]}
                  >
                    <View
                      style={[
                        styles.pkgRadio,
                        isSelected && styles.pkgRadioSelected,
                      ]}
                    >
                      {isSelected ? (
                        <Check color={colors.white} size={12} strokeWidth={3} />
                      ) : null}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.pkgTitleRow}>
                        <Text style={styles.pkgName}>{pkg.name}</Text>
                        <View style={styles.pkgBadge}>
                          <Text style={styles.pkgBadgeText}>{pkg.highlight}</Text>
                        </View>
                      </View>
                      <Text style={styles.pkgDesc}>{pkg.desc}</Text>
                      <Text style={styles.pkgPrice}>{pkg.price}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Modal Actions */}
            <View style={styles.boostModalActions}>
              <Pressable
                onPress={() => setBoostModalVisible(false)}
                style={[styles.boostCancelBtn, webPointer]}
              >
                <Text style={styles.boostCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => setBoostModalVisible(false)}
                style={[styles.boostConfirmBtn, webPointer]}
              >
                <Rocket color={colors.white} size={16} />
                <Text style={styles.boostConfirmBtnText}>Activate Boost</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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

  function renderBoostWorkspace() {
    return (
      <>
        <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
          <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
            <View style={styles.tabHeroIconWrap}>
              <Rocket color={colors.green} size={24} />
            </View>
            <View style={styles.tabHeroTextWrap}>
              <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
                Boost Listings & Maximize Reach
              </Text>
              <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
                Promote your properties to reach up to 10x more verified buyers across Dhaka with top search placement.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setBoostModalVisible(true)}
            style={[
              styles.tabHeroActionBtn,
              isPhone && styles.tabHeroActionBtnPhone,
              webPointer,
            ]}
          >
            <Rocket color={colors.ink} size={16} />
            <Text style={styles.tabHeroActionText}>Boost a Property</Text>
          </Pressable>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
            <Text style={[styles.kpiValue, { color: colors.green }]}>0</Text>
            <Text style={styles.kpiLabel}>Active Boosts</Text>
            <Text style={styles.kpiSub}>Currently promoted</Text>
          </View>
        </View>

        <View style={styles.boostBenchmarkRow}>
          {[
            { label: "Typical impression lift", value: "up to 3x", icon: TrendingUp },
            { label: "Typical inquiry lift", value: "up to 5x", icon: MessageSquare },
          ].map((item) => (
            <View key={item.label} style={styles.boostBenchmarkItem}>
              <item.icon color={colors.muted} size={14} />
              <Text style={styles.boostBenchmarkText}>
                <Text style={styles.boostBenchmarkValue}>{item.value}</Text> {item.label} reported across boosted listings
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Available Boost Packages</Text>
            <Text style={styles.tabCardSub}>Choose a tailored tier to supercharge visibility for your listings</Text>
          </View>

          <View style={styles.boostPackagesGrid}>
            {[
              {
                id: "featured",
                name: "Featured Spotlight",
                price: "৳ 1,500 / 7 days",
                badge: "Quick Sales",
                popular: false,
                bullets: [
                  "Top placement in search results",
                  "Featured badge on property card",
                  "Priority indexing for 7 days",
                ],
              },
              {
                id: "ai_priority",
                name: "AI Recommendation Priority",
                price: "৳ 2,500 / 14 days",
                badge: "Most Popular",
                popular: true,
                bullets: [
                  "Ranked #1 in Homenet AI Matchmaker",
                  "Instant SMS alerts to active buyers",
                  "Featured across area landing pages",
                ],
              },
              {
                id: "omni_blast",
                name: "VIP Omni-Channel Blast",
                price: "৳ 4,500 / 30 days",
                badge: "Maximum Visibility",
                popular: false,
                bullets: [
                  "Homepage hero showcase banner",
                  "Weekly buyer newsletter highlight",
                  "Dedicated WhatsApp partner advisor",
                ],
              },
            ].map((pkg) => (
              <View
                key={pkg.id}
                style={[
                  styles.boostPkgCard,
                  pkg.popular && styles.boostPkgCardPopular,
                ]}
              >
                {pkg.popular ? (
                  <View style={styles.popularTag}>
                    <Sparkles color={colors.ink} size={12} />
                    <Text style={styles.popularTagText}>{pkg.badge}</Text>
                  </View>
                ) : (
                  <View style={styles.standardTag}>
                    <Text style={styles.standardTagText}>{pkg.badge}</Text>
                  </View>
                )}
                <Text style={styles.boostPkgName}>{pkg.name}</Text>
                <Text style={styles.boostPkgPrice}>{pkg.price}</Text>

                <View style={styles.pkgBulletsList}>
                  {pkg.bullets.map((b, i) => (
                    <View key={i} style={styles.pkgBulletRow}>
                      <CheckCircle2 color={colors.green} size={15} />
                      <Text style={styles.pkgBulletText}>{b}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => {
                    setSelectedBoostPkg(pkg.id);
                    setBoostModalVisible(true);
                  }}
                  style={[
                    styles.selectPkgBtn,
                    pkg.popular && styles.selectPkgBtnPopular,
                    webPointer,
                  ]}
                >
                  <Rocket color={pkg.popular ? colors.ink : colors.green} size={15} />
                  <Text
                    style={[
                      styles.selectPkgBtnText,
                      pkg.popular && styles.selectPkgBtnTextPopular,
                    ]}
                  >
                    Select Plan
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Your Boosted Properties</Text>
            <Text style={styles.tabCardSub}>Track live promotions, impressions, and expiry schedules</Text>
          </View>

          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconWrap}>
              <Rocket color={colors.green} size={26} />
            </View>
            <Text style={styles.emptyTitle}>No Active Boosts</Text>
            <Text style={styles.emptyDesc}>
              None of your properties are currently boosted. Select a listing from your inventory to launch a campaign.
            </Text>
            <AppLink href="/my-properties" style={styles.emptyActionBtn}>
              <Text style={styles.emptyActionBtnText}>Manage My Listings</Text>
            </AppLink>
          </View>
        </View>
      </>
    );
  }

  function renderInsightsWorkspace() {
    return (
      <>
        <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
          <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
            <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.blueLight }]}>
              <Sparkles color={colors.blue} size={24} />
            </View>
            <View style={styles.tabHeroTextWrap}>
              <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
                AI Market & Property Match Insights
              </Text>
              <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
                Intelligent AI algorithms connecting your listings with high-intent buyers, optimizing pricing, and suggesting listing improvements.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Live Portfolio Intelligence</Text>
            <Text style={styles.tabCardSub}>Sample insights illustrating what HomeNet's AI matching engine surfaces once it has enough activity on your listings</Text>
          </View>

          <View style={styles.insightsCardsGrid}>
            <View style={styles.insightCard}>
              <View style={[styles.insightCardIcon, { backgroundColor: colors.greenLight }]}>
                <TrendingUp color={colors.green} size={20} />
              </View>
              <Text style={styles.insightCardTitle}>High Buyer Demand in Gulshan</Text>
              <Text style={styles.insightCardDesc}>
                Over 48 verified buyers searched for 3-4 bedroom apartments in Gulshan and Banani in the past 7 days. Listings in this range receive 3x more contact requests.
              </Text>
              <View style={styles.insightPill}>
                <Text style={styles.insightPillText}>Demand Surge: +34%</Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightCardIcon, { backgroundColor: colors.blueLight }]}>
                <BarChart2 color={colors.blue} size={20} />
              </View>
              <Text style={styles.insightCardTitle}>Competitive Price Guidance</Text>
              <Text style={styles.insightCardDesc}>
                Properties priced between BDT 1.6 Cr – 2.2 Cr in central Dhaka have closed 2.4x faster than above-market peers this quarter. Review your listing pricing.
              </Text>
              <View style={[styles.insightPill, { backgroundColor: colors.blueLight }]}>
                <Text style={[styles.insightPillText, { color: colors.blue }]}>Optimal Closing Range</Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightCardIcon, { backgroundColor: colors.orangeLight }]}>
                <CheckCircle2 color={colors.orange} size={20} />
              </View>
              <Text style={styles.insightCardTitle}>Listing Quality Score</Text>
              <Text style={styles.insightCardDesc}>
                Listings with verified floorplans, high-res photos, and complete amenity tags retain buyers 42% longer on page. Submit documents in Verification Center.
              </Text>
              <View style={[styles.insightPill, { backgroundColor: colors.orangeLight }]}>
                <Text style={[styles.insightPillText, { color: colors.orange }]}>Verification Priority</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Interactive AI Property Matcher</Text>
            <Text style={styles.tabCardSub}>Explore buyer preferences or match properties live</Text>
          </View>
          <AiFinderWorkflow />
        </View>
      </>
    );
  }

  function renderAnalyticsWorkspace() {
    return (
      <>
        <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
          <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
            <View style={styles.tabHeroIconWrap}>
              <BarChart2 color={colors.green} size={24} />
            </View>
            <View style={styles.tabHeroTextWrap}>
              <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
                Dhaka Real Estate Market Analytics
              </Text>
              <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
                Illustrative price-per-square-foot trends and buyer demand indexing to help you price and time your listing.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          {[
            { label: "Dhaka Avg Sq Ft", value: "৳ 16,840", sub: "+4.8% YoY", color: colors.green },
            { label: "Avg Days on Market", value: "32 Days", sub: "3 days faster than '25", color: colors.blue },
            { label: "Avg Rental Yield", value: "5.6%", sub: "Annualized gross", color: colors.orange },
            { label: "Market Health Score", value: "88 / 100", sub: "Strong seller market", color: "#0F6D55" },
          ].map((kpi, idx) => (
            <View key={idx} style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiSub}>{kpi.sub}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Area Price Trends & Demand Index</Text>
            <Text style={styles.tabCardSub}>Illustrative Dhaka market benchmarks — connect a live market-data feed for figures specific to today</Text>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColHeader, { flex: 2 }]}>Area</Text>
              <Text style={[styles.tableColHeader, { flex: 2 }]}>Avg Price / Sq Ft</Text>
              <Text style={[styles.tableColHeader, { flex: 1.5 }]}>6M Trend</Text>
              <Text style={[styles.tableColHeader, { flex: 1.5 }]}>Buyer Demand</Text>
            </View>

            {[
              { area: "Gulshan", price: "BDT 19,800", trend: "+6.2%", demand: "Very High" },
              { area: "Banani", price: "BDT 17,450", trend: "+4.8%", demand: "High" },
              { area: "Baridhara", price: "BDT 18,900", trend: "+5.1%", demand: "High" },
              { area: "Dhanmondi", price: "BDT 14,200", trend: "+3.7%", demand: "Moderate" },
              { area: "Uttara", price: "BDT 10,850", trend: "+2.9%", demand: "Growing" },
              { area: "Bashundhara", price: "BDT 11,200", trend: "+4.1%", demand: "High" },
              { area: "Mirpur", price: "BDT 8,400", trend: "+2.2%", demand: "Moderate" },
            ].map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowEven]}>
                <Text style={[styles.tableCellTextBold, { flex: 2 }]}>{row.area}</Text>
                <Text style={[styles.tableCellText, { flex: 2 }]}>{row.price}</Text>
                <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <TrendingUp color={colors.green} size={14} />
                  <Text style={{ fontSize: 13, fontFamily: fonts.semiBold, color: colors.green }}>{row.trend}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <View style={styles.demandBadge}>
                    <Text style={styles.demandBadgeText}>{row.demand}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </>
    );
  }

  function renderPaymentsWorkspace() {
    return (
      <>
        <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
          <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
            <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.blueLight }]}>
              <CreditCard color={colors.blue} size={24} />
            </View>
            <View style={styles.tabHeroTextWrap}>
              <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
                Seller Payments, Invoices & Payouts
              </Text>
              <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
                Manage your payout accounts, download receipts for boosting packages, and view transaction history.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
            <Text style={[styles.kpiValue, { color: colors.green }]}>৳ 0.00</Text>
            <Text style={styles.kpiLabel}>Available Balance</Text>
            <Text style={styles.kpiSub}>Ready for withdrawal</Text>
          </View>
          <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
            <Text style={[styles.kpiValue, { color: colors.blue }]}>৳ 0.00</Text>
            <Text style={styles.kpiLabel}>Pending Clearance</Text>
            <Text style={styles.kpiSub}>Processing settlements</Text>
          </View>
          <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
            <Text style={[styles.kpiValue, { color: "#0F6D55" }]}>৳ 0.00</Text>
            <Text style={styles.kpiLabel}>Lifetime Earnings</Text>
            <Text style={styles.kpiSub}>Total volume processed</Text>
          </View>
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Payout Methods</Text>
            <Text style={styles.tabCardSub}>Configure automated or manual payouts directly to your local bank or MFS account</Text>
          </View>

          <View style={styles.payoutMethodsRow}>
            <View style={[styles.payoutMethodCard, { borderStyle: "dashed" }]}>
              <View style={styles.payoutCardTop}>
                <Text style={styles.payoutMethodName}>bKash Commercial</Text>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Not connected</Text>
                </View>
              </View>
              <Text style={styles.payoutAccountNo}>Link a bKash merchant account</Text>
              <Pressable style={styles.connectPayoutBtn}>
                <Text style={styles.connectPayoutBtnText}>Connect</Text>
              </Pressable>
            </View>

            <View style={[styles.payoutMethodCard, { borderStyle: "dashed" }]}>
              <View style={styles.payoutCardTop}>
                <Text style={styles.payoutMethodName}>Bank Transfer (EFTN)</Text>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Not connected</Text>
                </View>
              </View>
              <Text style={styles.payoutAccountNo}>Local bank account in Bangladesh</Text>
              <Pressable style={styles.connectPayoutBtn}>
                <Text style={styles.connectPayoutBtnText}>Connect</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Billing History & Invoices</Text>
            <Text style={styles.tabCardSub}>Receipts for boost packages, listing verifications, and subscriptions</Text>
          </View>

          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconWrap}>
              <CreditCard color={colors.green} size={26} />
            </View>
            <Text style={styles.emptyTitle}>No Invoices Generated Yet</Text>
            <Text style={styles.emptyDesc}>
              All official VAT invoices and payment receipts will be archived here for instant PDF download.
            </Text>
          </View>
        </View>
      </>
    );
  }

  function renderHelpWorkspace() {
    return (
      <>
        <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
          <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
            <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.orangeLight }]}>
              <CircleHelp color={colors.orange} size={24} />
            </View>
            <View style={styles.tabHeroTextWrap}>
              <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
                Seller Help Center & Support Desk
              </Text>
              <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
                Have questions about listing, verification, or boosting? We're here to help you close deals faster.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.supportChannelsGrid}>
          <View style={styles.supportChannelCard}>
            <View style={[styles.supportChannelIcon, { backgroundColor: colors.greenLight }]}>
              <Phone color={colors.green} size={20} />
            </View>
            <Text style={styles.supportChannelTitle}>Phone Support</Text>
            <Text style={styles.supportChannelValue}>+880 1700-000000</Text>
            <Text style={styles.supportChannelSub}>Mon – Sat, 9:00 AM – 8:00 PM</Text>
          </View>

          <View style={styles.supportChannelCard}>
            <View style={[styles.supportChannelIcon, { backgroundColor: colors.blueLight }]}>
              <Mail color={colors.blue} size={20} />
            </View>
            <Text style={styles.supportChannelTitle}>Partner Desk Email</Text>
            <Text style={styles.supportChannelValue}>partner@homenet.com.bd</Text>
            <Text style={styles.supportChannelSub}>Average reply within 2 hours</Text>
          </View>

          <View style={styles.supportChannelCard}>
            <View style={[styles.supportChannelIcon, { backgroundColor: colors.greenLight }]}>
              <MessageSquare color={colors.green} size={20} />
            </View>
            <Text style={styles.supportChannelTitle}>WhatsApp Desk</Text>
            <Text style={styles.supportChannelValue}>+880 1700-000000</Text>
            <Text style={styles.supportChannelSub}>Instant chat with partner advisor</Text>
          </View>
        </View>

        <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
          <View style={styles.tabCardHeader}>
            <Text style={styles.tabCardTitle}>Frequently Asked Questions</Text>
            <Text style={styles.tabCardSub}>Everything you need to know about selling properties on HomeNet</Text>
          </View>

          <View style={styles.faqList}>
            {[
              {
                q: "How do I get my property listings verified?",
                a: "Navigate to the Verification tab in the sidebar. Submit clear digital copies of your property title deed, mutation certificate, or tax receipts. Our compliance team verifies documents within 24 business hours.",
              },
              {
                q: "How does property boosting work?",
                a: "Boosting promotes your listings to the top of buyer search results, features them in weekly newsletters, and highlights them with verified badges. Boosted listings receive up to 10x more buyer views.",
              },
              {
                q: "How will buyers contact me?",
                a: "Buyer inquiries are routed immediately to your verified phone number via SMS and WhatsApp, as well as to your email address. You can view all activity directly on your dashboard.",
              },
              {
                q: "Can I edit my property listings after publishing?",
                a: "Yes. From the sidebar, open 'My Listings', find the property card, and click 'Edit' to update photos, pricing, amenities, or descriptions at any time.",
              },
            ].map((faq, i) => (
              <View key={i} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            ))}
          </View>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  workspaceScroll: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  outerContainer: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
  },
  sidebar: {
    width: 256,
    backgroundColor: colors.white,
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
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  brandTextAccent: {
    color: colors.green,
  },
  sellerRolePill: {
    backgroundColor: colors.blueLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sellerRoleText: {
    color: colors.blue,
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
    backgroundColor: colors.greenLight,
  },
  navItemDanger: {
    marginTop: 8,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  navItemTextActive: {
    color: colors.green,
    fontFamily: fonts.bold,
  },
  navItemTextDanger: {
    color: "#D4183D",
  },
  badgeCountPill: {
    backgroundColor: colors.orange,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: colors.white,
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
    color: colors.ink,
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
    color: colors.ink,
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
    backgroundColor: colors.orange,
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
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
  },
  heroBtnPrimaryText: {
    color: colors.green,
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
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  heroDecorationIcon: {
    marginRight: 10,
    opacity: 0.85,
  },
  statsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statsGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCardDesktop: {
    width: "32.3%",
    minWidth: 220,
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 18,
    gap: 10,
  },
  statCardHeaderDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statIconWrapDesktop: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  trendPillDesktop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.greenLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trendPillTextDesktop: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.green,
  },
  statValueDesktop: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.ink,
    marginTop: 4,
  },
  statLabelDesktop: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
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
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
  },
  activityCard: {
    flex: 1,
    backgroundColor: colors.white,
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
    color: colors.ink,
  },
  cardSubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  analyticsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  analyticsLinkText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.green,
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
    color: colors.ink,
  },
  unreadOrangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
  activityDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBackdropTouch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  boostModalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  boostModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  boostHeaderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  boostModalTitle: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colors.ink,
  },
  boostModalSub: {
    fontSize: 13,
    color: colors.muted,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4F6F5",
    alignItems: "center",
    justifyContent: "center",
  },
  packagesList: {
    gap: 12,
  },
  pkgCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    backgroundColor: colors.white,
  },
  pkgCardSelected: {
    borderColor: colors.green,
    backgroundColor: "#F4F9F7",
  },
  pkgRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#767676",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  pkgRadioSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  pkgTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pkgName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: colors.ink,
  },
  pkgBadge: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pkgBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  pkgDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 18,
  },
  pkgPrice: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.green,
    marginTop: 4,
  },
  boostModalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  boostCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  boostCancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  boostConfirmBtn: {
    flex: 2,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  boostConfirmBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  tabHeroBanner: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  tabHeroBannerPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  tabHeroHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tabHeroHeaderPhone: {
    flex: 0,
    alignItems: "flex-start",
    gap: 12,
  },
  tabHeroTextWrap: {
    flex: 1,
    gap: 4,
  },
  tabHeroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tabHeroTitle: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  tabHeroTitlePhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  tabHeroSubtitle: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 20,
    maxWidth: 680,
  },
  tabHeroSubtitlePhone: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  tabHeroActionBtn: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabHeroActionBtnPhone: {
    alignSelf: "flex-start",
  },
  tabHeroActionText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  kpiCardPhone: {
    minWidth: "46%",
    padding: 14,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
  },
  kpiLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.ink,
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
  },
  boostBenchmarkRow: {
    gap: 8,
  },
  boostBenchmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boostBenchmarkText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  boostBenchmarkValue: {
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  tabCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  tabCardPhone: {
    padding: 16,
    borderRadius: 16,
  },
  tabCardHeader: {
    marginBottom: 16,
  },
  tabCardTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  tabCardSub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
  },
  boostPackagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  boostPkgCard: {
    flex: 1,
    minWidth: 250,
    backgroundColor: "#F9FAF9",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    justifyContent: "space-between",
  },
  boostPkgCardPopular: {
    backgroundColor: colors.white,
    borderColor: colors.green,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  popularTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.green,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  popularTagText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  standardTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.blueLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  standardTagText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.blue,
  },
  boostPkgName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  boostPkgPrice: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.green,
    marginTop: 4,
    marginBottom: 14,
  },
  pkgBulletsList: {
    gap: 8,
    marginBottom: 18,
  },
  pkgBulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pkgBulletText: {
    fontSize: 12.5,
    fontFamily: fonts.regular,
    color: colors.muted,
    flex: 1,
  },
  selectPkgBtn: {
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectPkgBtnPopular: {
    backgroundColor: colors.green,
  },
  selectPkgBtnText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  selectPkgBtnTextPopular: {
    color: colors.ink,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 19,
  },
  emptyActionBtn: {
    marginTop: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  insightsCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  insightCard: {
    flex: 1,
    minWidth: 250,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    gap: 8,
  },
  insightCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  insightCardTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  insightCardDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 18,
  },
  insightPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },
  insightPillText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.green,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableColHeader: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.muted,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.06)",
    backgroundColor: colors.white,
  },
  tableRowEven: {
    backgroundColor: "#FBFDFB",
  },
  tableCellTextBold: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  tableCellText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.ink,
  },
  demandBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  demandBadgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.green,
  },
  payoutMethodsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  payoutMethodCard: {
    flex: 1,
    minWidth: 250,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    gap: 6,
  },
  payoutCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutMethodName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  availableBadge: {
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  availableBadgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  connectPayoutBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.greenLight,
  },
  connectPayoutBtnText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  payoutAccountNo: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  payoutSchedule: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  supportChannelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  supportChannelCard: {
    flex: 1,
    minWidth: 230,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    gap: 4,
  },
  supportChannelIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  supportChannelTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  supportChannelValue: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    color: colors.green,
  },
  supportChannelSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  faqList: {
    gap: 14,
  },
  faqItem: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.06)",
    gap: 4,
  },
  faqQuestion: {
    fontSize: 14.5,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 19,
  },
});
