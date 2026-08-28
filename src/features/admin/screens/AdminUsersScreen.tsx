import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { UserAdminList } from "../components/UserAdminList";
import { RoleAssignmentModal } from "../components/RoleAssignmentModal";
import type { UserWithRoles } from "../types/admin";
import { deleteUser } from "@/services/userApi";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toApiError } from "@/services/apiClient";

export function AdminUsersScreen() {
  const [search, setSearch] = useState("");
  const [roleModalUser, setRoleModalUser] = useState<UserWithRoles | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserWithRoles | null>(null);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setDeleteTarget(null);
    },
  });

  const { data, error, isLoading, refetch } = useAdminUsers({
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
        onDelete={setDeleteTarget}
      />

      <RoleAssignmentModal
        visible={!!roleModalUser}
        user={roleModalUser}
        onClose={() => setRoleModalUser(null)}
      />
      {error ? (
        <Text onPress={() => void refetch()} style={styles.errorText}>
          {toApiError(error).message} Press to retry.
        </Text>
      ) : null}
      {deleteMutation.error ? <Text style={styles.errorText}>{toApiError(deleteMutation.error).message}</Text> : null}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete User"
        message={`Delete ${deleteTarget?.full_name ?? "this user"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
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
  errorText: { color: colorTokens.error, fontFamily: fontTokens.regular, fontSize: 12 },
});
