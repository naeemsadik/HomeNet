import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { UserAdminList } from "../components/UserAdminList";
import { RoleAssignmentModal } from "../components/RoleAssignmentModal";
import type { UserWithRoles } from "../types/admin";

export function AdminUsersScreen() {
  const [search, setSearch] = useState("");
  const [roleModalUser, setRoleModalUser] = useState<UserWithRoles | null>(null);

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    page: 1,
    limit: 50,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  function handleView(userId: string) {
    router.push(`/users/${userId}` as never);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>Manage platform users and their roles.</Text>
      </View>

      <UserAdminList
        users={users}
        total={total}
        isLoading={isLoading}
        searchQuery={search}
        onSearchChange={setSearch}
        onManageRoles={setRoleModalUser}
        onView={handleView}
      />

      <RoleAssignmentModal
        visible={!!roleModalUser}
        user={roleModalUser}
        onClose={() => setRoleModalUser(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  header: { gap: 4 },
  title: {
    fontSize: 22,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
  },
});
