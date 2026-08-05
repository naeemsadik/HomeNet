import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Building2, Check, X, Trash2 } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Property } from "@/features/property/types/property";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: colorTokens.backgroundAlt, text: colorTokens.textSecondary, label: "Draft" },
  active: { bg: colorTokens.primaryLight, text: colorTokens.primary, label: "Active" },
  pending: { bg: colorTokens.warningLight, text: colorTokens.warning, label: "Pending" },
  sold: { bg: colorTokens.verifiedLight, text: colorTokens.verified, label: "Sold" },
  archived: { bg: colorTokens.backgroundAlt, text: colorTokens.textMuted, label: "Archived" },
};

export function AdminPropertiesScreen() {
  const { isPhone } = useResponsive();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "properties"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ items: Property[]; total: number }>>("/v1/properties", {
        params: { limit: 50 },
      });
      return data.data?.items ?? [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/v1/properties/${id}/admin`, { status: "active", is_verified: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/v1/properties/${id}/admin`, { status: "archived" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/properties/${id}/admin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const properties = data ?? [];

  return (
    <AppChrome active="home">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <View style={styles.headerSection}>
          <Eyebrow>Admin</Eyebrow>
          <Text style={styles.title}>Properties</Text>
          <Text style={styles.subtitle}>Review and manage listings.</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colorTokens.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const status = statusColors[item.status] ?? statusColors.draft;
              return (
                <View style={styles.propertyItem}>
                  <View style={styles.propertyHeader}>
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.propertyPrice}>
                        {item.price_currency || "BDT"} {item.price.toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </View>

                  {item.status === "pending" ? (
                    <View style={styles.adminActions}>
                      <Pressable
                        onPress={() => approveMutation.mutateAsync(item.id)}
                        style={[styles.adminBtn, { backgroundColor: colorTokens.primaryLight }]}
                        accessibilityLabel="Approve property"
                      >
                        <Check color={colorTokens.primary} size={15} />
                        <Text style={[styles.adminBtnText, { color: colorTokens.primary }]}>Approve</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => rejectMutation.mutateAsync(item.id)}
                        style={[styles.adminBtn, { backgroundColor: colorTokens.warningLight }]}
                        accessibilityLabel="Reject property"
                      >
                        <X color={colorTokens.warning} size={15} />
                        <Text style={[styles.adminBtnText, { color: colorTokens.warning }]}>Reject</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Alert.alert("Delete", "Delete this property?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutateAsync(item.id) },
                          ]);
                        }}
                        style={[styles.adminBtn, { backgroundColor: colorTokens.errorLight }]}
                        accessibilityLabel="Delete property"
                      >
                        <Trash2 color={colorTokens.error} size={15} />
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.adminActions}>
                      <Pressable
                        onPress={() => {
                          Alert.alert("Delete", "Delete this property?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutateAsync(item.id) },
                          ]);
                        }}
                        style={[styles.adminBtn, { backgroundColor: colorTokens.errorLight }]}
                        accessibilityLabel="Delete property"
                      >
                        <Trash2 color={colorTokens.error} size={15} />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            }}
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
  propertyItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 10,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  propertyInfo: { flex: 1, gap: 4 },
  propertyTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  propertyPrice: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  adminActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  adminBtnText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
});
