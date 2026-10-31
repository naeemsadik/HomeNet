import {
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Handshake,
  Heart,
  LineChart as LineChartIcon,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "@/components/icons";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
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
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme";
import { useMyProperties } from "@/features/property/hooks/useMyProperties";
import { SellerWelcomeBanner } from "../components/SellerWelcomeBanner";
import { SellerBoostWorkspace } from "../components/SellerBoostWorkspace";
import { SellerInsightsWorkspace } from "../components/SellerInsightsWorkspace";
import { SellerAnalyticsWorkspace } from "../components/SellerAnalyticsWorkspace";
import { SellerPaymentsWorkspace } from "../components/SellerPaymentsWorkspace";
import { SellerHelpWorkspace } from "../components/SellerHelpWorkspace";
import { SellerBoostModal } from "../components/SellerBoostModal";
import { SellerShell, type SellerNavKey } from "../components/SellerShell";
import { SellerStatCard, type StatItem } from "../components/SellerStatCard";
import { styles } from "./SellerDashboardScreen.styles";

import { LiveText } from "@/components/LiveText";
import { useTranslation, formatLocalizedNumber } from "@/i18n";

export type { SellerNavKey };

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
  const { t, language } = useTranslation();
  const { isPhone, isTablet } = useResponsive();
  const { user } = useAuthStore();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeNav, setActiveNav] = useState<SellerNavKey>("dashboard");
  const [boostModalVisible, setBoostModalVisible] = useState(false);
  const [selectedBoostPkg, setSelectedBoostPkg] = useState<string>("featured");

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

  // Stats grid items
  const sellerStats: StatItem[] = [
    {
      id: "total",
      label: t("dashboard.totalListings"),
      value: formatLocalizedNumber(totalCount, language),
      trend: totalCount > 0 ? "+1" : undefined,
      icon: Building2,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
    {
      id: "active",
      label: t("dashboard.activeListings"),
      value: formatLocalizedNumber(activeCount, language),
      trend: activeCount > 0 ? "+1" : undefined,
      icon: CheckCircle2,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
    {
      id: "draft",
      label: t("dashboard.draftListings"),
      value: formatLocalizedNumber(draftCount, language),
      icon: FileText,
      iconBg: "#F4F6F5",
      iconColor: colors.muted,
    },
    {
      id: "sold",
      label: t("dashboard.soldRented"),
      value: formatLocalizedNumber(soldCount, language),
      icon: Handshake,
      iconBg: colors.blueLight,
      iconColor: colors.blue,
    },
    {
      id: "verified",
      label: t("dashboard.verifiedProperties"),
      value: formatLocalizedNumber(verifiedCount, language),
      icon: ShieldCheck,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
    {
      id: "boosted",
      label: t("dashboard.boostedListings"),
      value: formatLocalizedNumber(0, language),
      icon: Zap,
      iconBg: colors.orangeLight,
      iconColor: colors.orange,
    },
    {
      id: "views",
      label: t("dashboard.totalViews"),
      value: formatLocalizedNumber(totalViews, language),
      icon: Eye,
      iconBg: colors.blueLight,
      iconColor: colors.blue,
    },
    {
      id: "inquiries",
      label: t("dashboard.buyerInquiries"),
      value: formatLocalizedNumber(0, language),
      icon: MessageSquare,
      iconBg: colors.orangeLight,
      iconColor: colors.orange,
    },
    {
      id: "saved",
      label: t("dashboard.savedByBuyers"),
      value: formatLocalizedNumber(0, language),
      icon: Heart,
      iconBg: colors.greenLight,
      iconColor: colors.green,
    },
  ];

  const recentActivities: ActivityItem[] = allMyListings.slice(0, 5).map((p) => ({
    id: p.id,
    title:
      p.status === "active"
        ? t("seller.dashboard.activityListingLive")
        : t("seller.dashboard.activityDraftSaved"),
    description: `${p.title} · ${p.area?.name || "Dhaka"}`,
    time: t("seller.dashboard.activityRecentlyUpdated"),
    icon: p.status === "active" ? BadgeCheck : FileText,
    iconBg: colors.greenLight,
    iconColor: colors.green,
    hasUnreadDot: false,
  }));

  const titles: Record<SellerNavKey, string> = {
    dashboard: t("dashboard.tabs.dashboard"),
    listings: t("dashboard.tabs.myListings"),
    create: t("dashboard.tabs.createProperty"),
    boost: t("dashboard.tabs.boostListings"),
    insights: t("dashboard.tabs.aiInsights"),
    analytics: t("dashboard.tabs.analytics"),
    payments: t("dashboard.tabs.payments"),
    profile: t("dashboard.tabs.profile"),
    help: t("dashboard.tabs.helpCenter"),
    logout: t("dashboard.tabs.logout"),
  };

  const activeTitle = titles[activeNav] || t("dashboard.tabs.dashboard");

  return (
    <SellerShell
      activeNav={activeNav}
      title={activeTitle}
    >
      <View style={[styles.scrollBody, isPhone && styles.scrollBodyPhone]}>
        {activeNav === "dashboard" && (
          <>
            {/* Welcome Banner */}
            <SellerWelcomeBanner
              name={sellerName}
              viewsThisWeek={totalViews}
              inquiriesThisWeek={0}
              onBoostListing={() => setBoostModalVisible(true)}
            />

            {/* Stats Grid: Responsive */}
            {isTablet ? (
              /* Mobile / Small Screens: 2-column card layout */
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

                      <LiveText style={styles.statValueDesktop}>{item.value}</LiveText>
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
                      <Text style={styles.cardTitle}>{t("seller.dashboard.listingViews")}</Text>
                      <Text style={styles.cardSubtext}>{t("seller.dashboard.last7Days")}</Text>
                    </View>
                  </View>
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
                    <Text style={styles.cardTitle}>{t("seller.dashboard.recentActivity")}</Text>
                  </View>

                  <AppLink href="/notifications">
                    <Text style={styles.analyticsLinkText}>{t("seller.dashboard.seeAll")}</Text>
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
                        {t("seller.dashboard.noActivity")}
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

      <SellerBoostModal
        onClose={() => setBoostModalVisible(false)}
        onSelectPackage={setSelectedBoostPkg}
        selectedPackage={selectedBoostPkg}
        visible={boostModalVisible}
      />
    </SellerShell>
  );
}
