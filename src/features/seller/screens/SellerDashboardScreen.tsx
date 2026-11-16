import {
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Handshake,
  Heart,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { colors, webPointer } from "@/theme";
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
import { isSellerSectionOn } from "@/lib/features";

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
      ["dashboard", "boost", "insights", "analytics", "payments", "help"].includes(tab) &&
      // A section that is switched off opens the dashboard, even from an old link.
      isSellerSectionOn(tab)
    ) {
      setActiveNav(tab as SellerNavKey);
    } else if (!tab || !isSellerSectionOn(tab)) {
      setActiveNav("dashboard");
    }
  }, [tab]);

  const handleOpenBoost = (packageId?: string) => {
    if (packageId) setSelectedBoostPkg(packageId);
    setBoostModalVisible(true);
  };

  const {
    data: myPropertiesData,
    isLoading: listingsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMyProperties();
  // The counts and the views ranking need every listing, not the first page of 20.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  // One array per fetch, not per render, so the memos below can hold.
  const allMyListings = useMemo(
    () => myPropertiesData?.pages.flatMap((page) => page.data?.items ?? (page.data as any)?.data ?? []) ?? [],
    [myPropertiesData],
  );

  const sellerName = user?.full_name || user?.email?.split("@")[0] || "Partner";
  const totalCount = allMyListings.length;
  const activeCount = allMyListings.filter((p) => p.status === "active").length;
  const draftCount = allMyListings.filter((p) => p.status === "draft").length;
  const soldCount = allMyListings.filter((p) => p.status === "sold").length;
  const verifiedCount = allMyListings.filter((p) => Boolean(p.is_verified)).length;
  const totalViews = allMyListings.reduce((sum, p) => sum + (p.view_count || 0), 0);

  // The five most-viewed listings, from each listing's real view count.
  const topListings = useMemo(
    () => [...allMyListings].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5),
    [allMyListings],
  );
  const maxListingViews = Math.max(topListings[0]?.view_count || 0, 1);
  // Drafts and listings waiting for review are not public, so they cannot be viewed yet.
  const publishedCount = allMyListings.filter((p) => p.status !== "draft" && p.status !== "pending").length;
  const averageViewsPerListing = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;

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
  ].filter((s) => s.id !== "boosted" || isSellerSectionOn("boost"));

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
    seats: t("mess.my.title"),
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
              activeListingsCount={activeCount}
              loading={listingsLoading}
              totalListingsCount={totalCount}
              onBoostListing={isSellerSectionOn("boost") ? () => setBoostModalVisible(true) : undefined}
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
              {/* Left Box: Listing Views Breakdown */}
              <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderTitleRow}>
                    <BarChart3 color={colors.ink} size={18} />
                    <View>
                      <Text style={styles.cardTitle}>{t("seller.dashboard.viewsByListing")}</Text>
                      <Text style={styles.cardSubtext}>{t("seller.dashboard.viewsByListingSub")}</Text>
                    </View>
                  </View>

                  <View style={styles.chartHeaderStats}>
                    <View style={styles.chartHeaderStatItem}>
                      <Text style={styles.chartHeaderStatVal}>
                        {formatLocalizedNumber(totalViews, language)}
                      </Text>
                      <Text style={styles.chartHeaderStatLbl}>{t("dashboard.totalViews")}</Text>
                    </View>
                    <View style={styles.chartHeaderStatDivider} />
                    <View style={styles.chartHeaderStatItem}>
                      <Text style={styles.chartHeaderStatVal}>
                        {formatLocalizedNumber(averageViewsPerListing, language)}
                      </Text>
                      <Text style={styles.chartHeaderStatLbl}>{t("seller.dashboard.avgViewsPerListing")}</Text>
                    </View>
                  </View>
                </View>

                {listingsLoading ? (
                  <View style={styles.chartEmptyNotice}>
                    <ActivityIndicator color={colors.muted} />
                  </View>
                ) : allMyListings.length === 0 ? (
                  <View style={styles.chartEmptyNotice}>
                    <Building2 color={colors.muted} size={36} />
                    <Text style={styles.chartEmptyTitle}>{t("seller.dashboard.noListingsYet")}</Text>
                    <Text style={styles.chartEmptySub}>{t("seller.dashboard.noListingsSub")}</Text>
                    <AppLink href="/property/create" style={[styles.createListingBtn, webPointer]}>
                      <Text style={styles.createListingBtnText}>{t("dashboard.addNewProperty")}</Text>
                    </AppLink>
                  </View>
                ) : totalViews === 0 ? (
                  <View style={styles.chartEmptyNotice}>
                    <Eye color={colors.muted} size={36} />
                    <Text style={styles.chartEmptyTitle}>{t("seller.dashboard.noViewsYet")}</Text>
                    <Text style={styles.chartEmptySub}>
                      {/* Drafts and listings in review are not public yet, so "live" would be untrue. */}
                      {publishedCount > 0 ? t("seller.dashboard.noViewsSub") : t("seller.dashboard.noViewsUnpublishedSub")}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.listingViewsList}>
                    {topListings.map((item) => {
                      const count = item.view_count || 0;
                      // A floor keeps a small count visible; no views means no bar.
                      const percent = count === 0 ? 0 : Math.max(6, Math.min(100, Math.round((count / maxListingViews) * 100)));
                      return (
                        <View key={item.id} style={styles.listingViewRow}>
                          <View style={styles.listingViewHeaderRow}>
                            <View style={styles.listingViewMeta}>
                              <Text numberOfLines={1} style={styles.listingViewTitle}>
                                {item.title}
                              </Text>
                              <Text numberOfLines={1} style={styles.listingViewArea}>
                                {[item.area?.name, item.status ? t(`seller.filters.${item.status}` as any) : null]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </Text>
                            </View>
                            <View style={styles.listingViewCountBadge}>
                              <Eye color={colors.greenOnLight} size={12} />
                              <Text style={styles.listingViewCountText}>
                                {formatLocalizedNumber(count, language)}{" "}
                                {count === 1 ? t("seller.dashboard.viewOne") : t("seller.dashboard.views")}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                          </View>
                        </View>
                      );
                    })}

                    {allMyListings.length > 5 && (
                      <AppLink href="/my-properties" style={[styles.viewAllListingsLink, webPointer]}>
                        <Text style={styles.viewAllListingsText}>
                          {t("seller.dashboard.viewAllListings")} →
                        </Text>
                      </AppLink>
                    )}
                  </View>
                )}
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
