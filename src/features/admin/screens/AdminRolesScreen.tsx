import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useRoles } from "../hooks/useRoles";
import { PermissionEditorModal } from "../components/PermissionEditorModal";
import type { RoleWithPermissions } from "../types/admin";
import { toApiError } from "@/services/apiClient";

export function AdminRolesScreen() {
  const { data: roles = [], error, isLoading, refetch } = useRoles();
  const [editRole, setEditRole] = useState<RoleWithPermissions | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Role Management</Text>
        <Text style={styles.subtitle}>Manage roles and their permissions.</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.primary} size="large" />
        </View>
      ) : error ? (
        <Text onPress={() => void refetch()} style={styles.errorText}>
          {toApiError(error).message} Press to retry.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {roles.map((role) => (
            <View key={role.id} style={styles.roleCard}>
              <View style={styles.roleTop}>
                <View style={styles.roleIcon}>
                  <ShieldCheck color={colorTokens.primary} size={20} />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.name}</Text>
                  {role.description ? (
                    <Text style={styles.roleDesc}>{role.description}</Text>
                  ) : null}
                </View>
                <View style={styles.permCount}>
                  <Text style={styles.permCountText}>
                    {role.role_permissions?.length ?? 0} permissions
                  </Text>
                </View>
              </View>

              {role.role_permissions && role.role_permissions.length > 0 ? (
                <View style={styles.permChips}>
                  {role.role_permissions.slice(0, 6).map((rp) => (
                    <View key={rp.permission.id} style={styles.permChip}>
                      <Text style={styles.permChipText}>{rp.permission.name}</Text>
                    </View>
                  ))}
                  {role.role_permissions.length > 6 ? (
                    <View style={styles.permChip}>
                      <Text style={styles.permChipText}>+{role.role_permissions.length - 6} more</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <Pressable
                onPress={() => setEditRole(role)}
                style={styles.manageBtn}
                accessibilityLabel={`Manage permissions for ${role.name}`}
              >
                <Text style={styles.manageBtnText}>Manage Permissions</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <PermissionEditorModal
        visible={!!editRole}
        role={editRole}
        onClose={() => setEditRole(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, flex: 1 },
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
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorText: { color: colorTokens.error, fontFamily: fontTokens.regular, fontSize: 12 },
  list: { gap: 12, paddingBottom: 20 },
  roleCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 14,
  },
  roleTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primaryLight,
  },
  roleInfo: {
    flex: 1,
    gap: 2,
  },
  roleName: {
    fontSize: 16,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
    textTransform: "capitalize",
  },
  roleDesc: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  permCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colorTokens.backgroundAlt,
  },
  permCountText: {
    fontSize: 11,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  permChips: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  permChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colorTokens.primaryLight,
  },
  permChipText: {
    fontSize: 10,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.primary,
  },
  manageBtn: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  manageBtnText: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },
});
