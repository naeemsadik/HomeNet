import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { UserRound } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { colorTokens, fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";

interface AdminUserItem {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export function AdminUsersScreen() {
  const { isPhone } = useResponsive();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AdminUserItem[]>>("/v1/admin/users");
      return data.data ?? [];
    },
  });

  const users = data ?? [];

  return (
    <AppChrome active="home">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <View style={styles.headerSection}>
          <Eyebrow>Admin</Eyebrow>
          <Text style={styles.title}>Users</Text>
          <Text style={styles.subtitle}>Manage platform users.</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colorTokens.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                {item.avatar_url ? (
                  <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <UserRound color={colorTokens.textMuted} size={20} />
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>{item.full_name}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 18 },
  containerPhone: { gap: 14 },
  headerSection: { gap: 6 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: colorTokens.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 13, fontFamily: fonts.regular, color: colorTokens.textSecondary, lineHeight: 18 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  listContent: { paddingBottom: 20 },
  separator: { height: 8 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colorTokens.verifiedLight,
  },
  roleText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.verified,
    textTransform: "uppercase",
  },
});
