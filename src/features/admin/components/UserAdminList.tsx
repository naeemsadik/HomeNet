import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Search, Users } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { UserAdminItemRow } from "./UserAdminItem";
import type { UserWithRoles } from "../types/admin";

interface UserAdminListProps {
  users: UserWithRoles[];
  total: number;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onManageRoles: (user: UserWithRoles) => void;
  onView: (userId: string) => void;
  onDelete: (user: UserWithRoles) => void;
}

export function UserAdminList({
  users,
  total,
  isLoading,
  searchQuery,
  onSearchChange,
  onManageRoles,
  onView,
  onDelete,
}: UserAdminListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Search color={colorTokens.textMuted} size={16} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search users by name or email..."
          placeholderTextColor={colorTokens.textMuted}
          style={styles.searchInput}
          accessibilityLabel="Search users"
        />
      </View>

      <Text style={styles.count}>Showing {users.length} of {total} users</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserAdminItemRow
              item={item}
              onManageRoles={onManageRoles}
              onView={onView}
              onDelete={onDelete}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users color={colorTokens.textMuted} size={40} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
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
});
