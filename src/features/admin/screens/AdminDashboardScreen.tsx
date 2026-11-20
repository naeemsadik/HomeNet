import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens, fontTokens } from "@/theme";
import type { AdminTab } from "../components/AdminTabNav";
import { AdminShell } from "../components/AdminShell";
import { AdminPropertiesScreen } from "./AdminPropertiesScreen";
import { AdminUsersScreen } from "./AdminUsersScreen";
import { AdminRolesScreen } from "./AdminRolesScreen";
import { AdminAreasScreen } from "./AdminAreasScreen";
import { AdminUniversitiesScreen } from "./AdminUniversitiesScreen";
import { MESS_ENABLED } from "@/lib/features";
import { isAdmin } from "@/lib/permissions";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { useTranslation } from "@/i18n";
import type { Notification } from "@/types/api";

export function AdminSettingsTab() {
  const { t } = useTranslation();
  return (
    <View style={styles.settingsPlaceholder}>
      <Text style={styles.settingsText}>{t("admin.settingsComingSoon")}</Text>
    </View>
  );
}

export function AdminDashboardScreen() {
  const { t } = useTranslation();
  const userRoles = useAuthStore((s) => s.userRoles);
  const params = useLocalSearchParams<{
    tab?: AdminTab;
    from?: string;
    highlight?: string;
    status?: string;
  }>();

  const [localTab, setLocalTab] = useState<AdminTab>("properties");
  const activeTab = params.tab || localTab;

  const isFullAdmin = isAdmin(userRoles);
  const permissionNames = new Set(
    userRoles.flatMap((userRole) =>
      userRole.role.role_permissions?.map((rolePermission) => rolePermission.permission.name) ?? [],
    ),
  );
  const allowedTabs: AdminTab[] = isFullAdmin
    ? [
        "properties",
        "notifications",
        "users",
        "roles",
        "areas",
        ...(MESS_ENABLED ? (["universities"] as const) : []),
        "settings",
      ]
    : [
        ...( [
          "manage_properties",
          "moderate_listing",
          "review_verification",
        ].some((name) => permissionNames.has(name))
          ? (["properties"] as const)
          : []),
        ...(permissionNames.has("moderate_listing") ? (["notifications"] as const) : []),
        ...(permissionNames.has("manage_users") ? (["users"] as const) : []),
        ...([
          "view_roles",
          "manage_roles",
        ].some((name) => permissionNames.has(name))
          ? (["roles"] as const)
          : []),
        ...(permissionNames.has("manage_areas") ? (["areas"] as const) : []),
        ...(MESS_ENABLED && permissionNames.has("manage_areas")
          ? (["universities"] as const)
          : []),
        "settings" as const,
      ];
  const visibleTab = allowedTabs.includes(activeTab) ? activeTab : allowedTabs[0];

  function handleTabChange(tab: AdminTab) {
    setLocalTab(tab);
    router.replace({ pathname: "/admin", params: { tab } });
  }

  function handleNotificationPress(notification: Notification) {
    const meta = notification.metadata as Record<string, unknown> | null;
    let propertyId = (meta?.property_id || meta?.id || "") as string;
    if (!propertyId && notification.link) {
      const match =
        notification.link.match(/properties\/([a-zA-Z0-9-]+)/) ||
        notification.link.match(/property\/([a-zA-Z0-9-]+)/);
      if (match) propertyId = match[1];
    }

    if (
      notification.link?.includes("/admin/properties") ||
      notification.link?.includes("/property/") ||
      notification.type?.includes("property") ||
      propertyId
    ) {
      router.push({
        pathname: "/admin/properties",
        params: {
          from: "notifications",
          status: "pending",
          ...(propertyId ? { highlight: propertyId } : {}),
        },
      });
      return;
    }

    if (notification.link) {
      router.push(notification.link as never);
    }
  }

  const isFromNotifications = params.from === "notifications";

  return (
    <AdminShell
      activeTab={visibleTab}
      onTabChange={handleTabChange}
      backAction={
        isFromNotifications
          ? {
              label: t("admin.backToNotifications"),
              onPress: () => handleTabChange("notifications"),
            }
          : undefined
      }
    >
      <View style={styles.tabContent}>
        {visibleTab === "properties" && <AdminPropertiesScreen />}
        {visibleTab === "notifications" && (
          <NotificationList
            audience="admin"
            onPressItem={handleNotificationPress}
          />
        )}
        {visibleTab === "users" && <AdminUsersScreen />}
        {visibleTab === "roles" && <AdminRolesScreen />}
        {visibleTab === "areas" && <AdminAreasScreen />}
        {visibleTab === "universities" && <AdminUniversitiesScreen />}
        {visibleTab === "settings" && <AdminSettingsTab />}
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    marginTop: 4,
  },
  settingsPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  settingsText: {
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
});
