import React from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import { Users, Building2, Clock, BarChart3, ChevronRight, type LucideIcon } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { colorTokens, fonts, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import apiClient from "@/services/apiClient";
import type { ApiResponse, AdminStats } from "@/types/api";

export function AdminDashboardScreen() {
  const { isPhone } = useResponsive();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AdminStats>>("/v1/admin/stats/overview");
      return data.data;
    },
  });

  const stats = statsData ?? { totalUsers: 0, totalProperties: 0, pendingVerifications: 0, activeListings: 0 };

  const statCards: { label: string; value: number; icon: LucideIcon; color: string; bgColor: string }[] = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: colorTokens.primary, bgColor: colorTokens.primaryLight },
    { label: "Total Properties", value: stats.totalProperties, icon: Building2, color: colorTokens.verified, bgColor: colorTokens.verifiedLight },
    { label: "Pending Reviews", value: stats.pendingVerifications, icon: Clock, color: colorTokens.warning, bgColor: colorTokens.warningLight },
    { label: "Active Listings", value: stats.activeListings, icon: BarChart3, color: colorTokens.primaryDark, bgColor: colorTokens.primaryLight },
  ];

  return (
    <AppChrome active="home">
      <ScrollView contentContainerStyle={[styles.container, isPhone && styles.containerPhone]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Eyebrow>Admin</Eyebrow>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform overview and management.</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colorTokens.primary} size="large" />
          </View>
        ) : (
          <>
            <View style={[styles.statsGrid, isPhone && styles.statsGridPhone]}>
              {statCards.map(({ label, value, icon: Icon, color, bgColor }) => (
                <View key={label} style={[styles.statCard, shadow]}>
                  <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
                    <Icon color={color} size={20} />
                  </View>
                  <Text style={styles.statValue}>{value.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Quick Actions</Text>
              <Pressable
                onPress={() => router.push("/admin/users" as any)}
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                accessibilityLabel="Manage users"
              >
                <View style={[styles.menuIcon, { backgroundColor: colorTokens.primaryLight }]}>
                  <Users color={colorTokens.primary} size={18} />
                </View>
                <Text style={styles.menuLabel}>Manage Users</Text>
                <ChevronRight color={colorTokens.textMuted} size={16} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/admin/properties" as any)}
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                accessibilityLabel="Manage properties"
              >
                <View style={[styles.menuIcon, { backgroundColor: colorTokens.verifiedLight }]}>
                  <Building2 color={colorTokens.verified} size={18} />
                </View>
                <Text style={styles.menuLabel}>Manage Properties</Text>
                <ChevronRight color={colorTokens.textMuted} size={16} />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 30 },
  containerPhone: { gap: 14 },
  headerSection: { gap: 6 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: colorTokens.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 13, fontFamily: fonts.regular, color: colorTokens.textSecondary, lineHeight: 18 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  statsGrid: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  statsGridPhone: { gap: 10 },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: 18,
    borderRadius: 14,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colorTokens.textMuted,
  },
  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: colorTokens.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pressed: { backgroundColor: colorTokens.backgroundAlt },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
  },
});
