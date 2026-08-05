import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Building2, Search } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { PropertyAdminItemRow } from "./PropertyAdminItem";
import type { PropertyAdminItem } from "../types/admin";

const STATUS_FILTERS = ["all", "draft", "pending", "active", "sold", "archived"] as const;

interface PropertyAdminListProps {
  properties: PropertyAdminItem[];
  total: number;
  isLoading: boolean;
  isMutating: boolean;
  activeStatus: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function PropertyAdminList({
  properties,
  total,
  isLoading,
  isMutating,
  activeStatus,
  searchQuery,
  onStatusChange,
  onSearchChange,
  onApprove,
  onReject,
  onDelete,
  onView,
  onLoadMore,
  hasMore = false,
}: PropertyAdminListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((status) => (
          <Pressable
            key={status}
            onPress={() => onStatusChange(status)}
            style={[styles.filterChip, activeStatus === status && styles.filterChipActive]}
            accessibilityLabel={`Filter by ${status}`}
          >
            <Text style={[styles.filterText, activeStatus === status && styles.filterTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchRow}>
        <Search color={colorTokens.textMuted} size={16} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search properties..."
          placeholderTextColor={colorTokens.textMuted}
          style={styles.searchInput}
          accessibilityLabel="Search properties"
        />
      </View>

      <Text style={styles.count}>Showing {properties.length} of {total} properties</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyAdminItemRow
              item={item}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
              onView={onView}
              isMutating={isMutating}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Building2 color={colorTokens.textMuted} size={40} />
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <Pressable onPress={onLoadMore} style={styles.loadMore} accessibilityLabel="Load more properties">
                <Text style={styles.loadMoreText}>Load More</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  filterChipActive: {
    backgroundColor: colorTokens.primary,
    borderColor: colorTokens.primary,
  },
  filterText: {
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  filterTextActive: {
    color: colorTokens.textInverse,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  searchInput: {
    flex: 1,
    color: colorTokens.textPrimary,
    fontFamily: fontTokens.regular,
    fontSize: 13,
  },
  count: {
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textMuted,
  },
  list: { gap: 0, paddingBottom: 20 },
  separator: { height: 8 },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textMuted,
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  loadMoreText: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },
});
