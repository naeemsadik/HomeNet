import React from "react";
import { View, Text, FlatList, RefreshControl, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Plus, Building2, Edit, Eye, Trash2, Send, MoreVertical } from "lucide-react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow, AppButton } from "@/components/ui";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useMyProperties } from "../hooks/useMyProperties";
import { useDeleteProperty, useSubmitForVerification } from "../hooks/usePropertyMutations";
import type { Property } from "../types/property";
import { useResponsive } from "@/hooks/useResponsive";
import { Alert, Platform } from "react-native";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: colorTokens.backgroundAlt, text: colorTokens.textSecondary, label: "Draft" },
  active: { bg: colorTokens.primaryLight, text: colorTokens.primary, label: "Active" },
  pending: { bg: colorTokens.warningLight, text: colorTokens.warning, label: "Pending" },
  sold: { bg: colorTokens.verifiedLight, text: colorTokens.verified, label: "Sold" },
  archived: { bg: colorTokens.backgroundAlt, text: colorTokens.textMuted, label: "Archived" },
};

function PropertyListItem({ property }: { property: Property }) {
  const deleteProp = useDeleteProperty();
  const submitVerification = useSubmitForVerification();
  const status = statusColors[property.status] ?? statusColors.draft;

  const handleDelete = () => {
    Alert.alert("Delete Property", `Are you sure you want to delete "${property.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteProp.mutateAsync(property.id) },
    ]);
  };

  const handleSubmit = () => {
    Alert.alert("Submit for Verification", "Submit this property for admin review?", [
      { text: "Cancel", style: "cancel" },
      { text: "Submit", onPress: () => submitVerification.mutateAsync(property.id) },
    ]);
  };

  return (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemTitle} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.listItemPrice}>
            {property.price_currency || "BDT"} {property.price.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.listItemMeta}>
        <Text style={styles.metaText}>{property.listing_type === "sale" ? "For Sale" : "For Rent"}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{property.area?.name || property.address || "—"}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => router.push(`/property/${property.id}`)}
          style={[styles.actionBtn, webPointer]}
          accessibilityLabel="View property"
        >
          <Eye color={colorTokens.textMuted} size={15} />
          <Text style={styles.actionText}>View</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/property/edit?id=${property.id}`)}
          style={[styles.actionBtn, webPointer]}
          accessibilityLabel="Edit property"
        >
          <Edit color={colorTokens.primary} size={15} />
          <Text style={[styles.actionText, { color: colorTokens.primary }]}>Edit</Text>
        </Pressable>
        {(property.status === "draft" || (property as any).status === "rejected") ? (
          <Pressable
            onPress={handleSubmit}
            style={[styles.actionBtn, webPointer]}
            accessibilityLabel="Submit for verification"
          >
            <Send color={colorTokens.verified} size={15} />
            <Text style={[styles.actionText, { color: colorTokens.verified }]}>Submit</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleDelete}
          style={[styles.actionBtn, webPointer]}
          accessibilityLabel="Delete property"
        >
          <Trash2 color={colorTokens.error} size={15} />
          <Text style={[styles.actionText, { color: colorTokens.error }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function MyPropertiesScreen() {
  const { isPhone } = useResponsive();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isRefetching, refetch } = useMyProperties();
  const properties = data?.pages.flatMap((p) => p.data?.items ?? []) ?? [];

  return (
    <AppChrome active="sell">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <View style={styles.headerRow}>
          <View style={styles.headerSection}>
            <Eyebrow>Listings</Eyebrow>
            <Text style={styles.title}>My Properties</Text>
          </View>
          <AppButton
            label="New Property"
            onPress={() => router.push("/property/create")}
            icon={Plus}
          />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colorTokens.primary} size="large" />
          </View>
        ) : properties.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIconWrap}>
              <Building2 color={colorTokens.textMuted} size={40} />
            </View>
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptySubtitle}>List your first property to get started.</Text>
            <AppButton label="Create Property" onPress={() => router.push("/property/create")} icon={Plus} />
          </View>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PropertyListItem property={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colorTokens.primary}
                colors={[colorTokens.primary]}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={colorTokens.primary} size="small" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 18 },
  containerPhone: { gap: 14 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSection: { gap: 4 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: colorTokens.textPrimary, letterSpacing: -1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  listContent: { paddingBottom: 20 },
  separator: { height: 10 },
  footer: { paddingVertical: 16, alignItems: "center" },
  listItem: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 10,
  },
  listItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  listItemInfo: { flex: 1, gap: 4 },
  listItemTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  listItemPrice: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  listItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
  },
  metaDot: {
    fontSize: 12,
    color: colorTokens.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colorTokens.textSecondary,
  },
});
