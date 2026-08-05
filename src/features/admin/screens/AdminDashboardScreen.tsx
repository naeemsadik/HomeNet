import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Eyebrow } from "@/components/ui";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens, fontTokens } from "@/theme";
import { AdminTabNav } from "../components/AdminTabNav";
import { AdminPropertiesScreen } from "./AdminPropertiesScreen";
import { AdminUsersScreen } from "./AdminUsersScreen";
import { AdminRolesScreen } from "./AdminRolesScreen";
import { hasAnyAdminPermission } from "@/lib/permissions";

type AdminTab = "properties" | "users" | "roles" | "settings";

export function AdminDashboardScreen() {
  const { isPhone, contentPadding } = useResponsive();
  const userRoles = useAuthStore((s) => s.userRoles);
  const [activeTab, setActiveTab] = useState<AdminTab>("properties");

  const hasAccess = hasAnyAdminPermission(userRoles);

  if (!hasAccess) {
    return (
      <AppChrome active="home">
        <View style={styles.denied}>
          <Text style={styles.deniedTitle}>Access Denied</Text>
          <Text style={styles.deniedText}>
            You don't have permission to access the admin dashboard.
          </Text>
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome active="home">
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: contentPadding }, isPhone && styles.containerPhone]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Eyebrow>Admin</Eyebrow>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage properties, users, and roles.</Text>
        </View>

        <AdminTabNav active={activeTab} onChange={setActiveTab} userRoles={userRoles} />

        <View style={styles.tabContent}>
          {activeTab === "properties" && <AdminPropertiesScreen />}
          {activeTab === "users" && <AdminUsersScreen />}
          {activeTab === "roles" && <AdminRolesScreen />}
          {activeTab === "settings" && (
            <View style={styles.settingsPlaceholder}>
              <Text style={styles.settingsText}>Settings coming soon.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 30 },
  containerPhone: { gap: 14 },
  headerSection: { gap: 6 },
  title: {
    fontSize: 28,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  tabContent: {
    marginTop: 4,
  },
  denied: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  deniedTitle: {
    fontSize: 20,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  deniedText: {
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    maxWidth: 300,
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
