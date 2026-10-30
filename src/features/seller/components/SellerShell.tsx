import {
  BarChart2,
  Building2,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Rocket,
  Sparkles,
  User,
} from "@/components/icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { Brand } from "@/components/Brand";
import { AppLink } from "@/components/ui";
import { Footer } from "@/components/Footer";
import { SellerTopHeader } from "./SellerTopHeader";
import { SellerMobileDrawer } from "./SellerMobileDrawer";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { confirmAction } from "@/lib/alert";
import { colors, colorTokens, fonts } from "@/theme";
import { useTranslation } from "@/i18n";

export type SellerNavKey =
  | "dashboard"
  | "listings"
  | "create"
  | "boost"
  | "insights"
  | "analytics"
  | "payments"
  | "profile"
  | "help"
  | "logout";

export interface SellerShellProps {
  activeNav: SellerNavKey;
  children: React.ReactNode;
  title?: string;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  showSearch?: boolean;
  /** If true, wraps children in a ScrollView with Footer at the bottom. Defaults to true. */
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  customHeader?: React.ReactNode;
}

export function SellerShell({
  activeNav,
  children,
  title,
  searchQuery,
  onSearchQueryChange,
  showSearch = true,
  scrollable = true,
  contentContainerStyle,
  customHeader,
}: SellerShellProps) {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const logout = useAuthStore((s) => s.logout);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const sidebarNavItems: {
    key: SellerNavKey;
    label: string;
    icon: any;
    badgeCount?: number;
    danger?: boolean;
    href?: string;
  }[] = [
    { key: "dashboard", label: t("dashboard.tabs.dashboard"), icon: LayoutDashboard, href: "/seller" },
    { key: "listings", label: t("dashboard.tabs.myListings"), icon: Building2, href: "/my-properties" },
    { key: "create", label: t("dashboard.tabs.createProperty"), icon: PlusCircle, href: "/property/create" },
    { key: "boost", label: t("dashboard.tabs.boostListings"), icon: Rocket, href: "/seller?tab=boost" },
    { key: "insights", label: t("dashboard.tabs.aiInsights"), icon: Sparkles, href: "/seller?tab=insights" },
    { key: "analytics", label: t("dashboard.tabs.analytics"), icon: BarChart2, href: "/seller?tab=analytics" },
    { key: "payments", label: t("dashboard.tabs.payments"), icon: CreditCard, href: "/seller?tab=payments" },
    { key: "profile", label: t("dashboard.tabs.profile"), icon: User, href: "/seller/profile" },
    { key: "help", label: t("dashboard.tabs.helpCenter"), icon: CircleHelp, href: "/seller?tab=help" },
    { key: "logout", label: t("dashboard.tabs.logout"), icon: LogOut, danger: true, href: "/" },
  ];

  const handleLogout = async () => {
    const confirmed = await confirmAction(
      t("seller.profile.logoutConfirmTitle"),
      t("seller.profile.logoutConfirmMessage"),
      {
        confirmLabel: t("seller.profile.logoutBtn"),
        destructive: true,
      }
    );
    if (!confirmed) return;
    logout();
    router.replace("/");
  };

  const handleNavPress = (item: (typeof sidebarNavItems)[number]) => {
    if (item.key === "logout") {
      handleLogout();
      return;
    }

    if (item.href) {
      router.push(item.href as any);
    }
  };

  const activeTitle =
    title ||
    sidebarNavItems.find((i) => i.key === activeNav)?.label ||
    t("dashboard.tabs.dashboard");

  return (
    <View style={styles.outerContainer}>
      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          {/* Logo & Brand Header */}
          <View style={styles.sidebarHeader}>
            <Brand />

            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>{t("seller.drawer.rolePill")}</Text>
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
                  onPress={() => handleNavPress(item)}
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
        {customHeader ? (
          customHeader
        ) : (
          <SellerTopHeader
            hasUnreadNotifications={false}
            onPressMenu={() => setMobileDrawerOpen(true)}
            onSearchQueryChange={onSearchQueryChange}
            searchQuery={searchQuery}
            showSearch={showSearch}
            title={activeTitle}
          />
        )}

        {/* Content Body */}
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.workspaceScroll, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentWrapper}>{children}</View>
            <Footer />
          </ScrollView>
        ) : (
          <View style={[styles.nonScrollContent, contentContainerStyle]}>
            {children}
          </View>
        )}
      </View>

      {/* Mobile / Tablet Navigation Drawer */}
      <SellerMobileDrawer
        activeNav={activeNav}
        items={sidebarNavItems}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={(key) => {
          setMobileDrawerOpen(false);
          const found = sidebarNavItems.find((i) => i.key === key);
          if (found) handleNavPress(found);
        }}
        visible={isTablet && mobileDrawerOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colorTokens.onAccent,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
  },
  workspaceScroll: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  contentWrapper: {
    flex: 1,
  },
  nonScrollContent: {
    flex: 1,
  },
});
