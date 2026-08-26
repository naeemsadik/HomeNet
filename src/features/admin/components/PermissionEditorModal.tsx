import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useRoleDetail } from "../hooks/useRoles";
import { usePermissionMutations } from "../hooks/useRoleMutations";
import type { RoleWithPermissions } from "../types/admin";
import { toApiError } from "@/services/apiClient";

interface PermissionEditorModalProps {
  visible: boolean;
  role: RoleWithPermissions | null;
  onClose: () => void;
}

const ALL_PERMISSIONS = [
  { id: "perm-001", name: "view_roles", label: "View Roles" },
  { id: "perm-002", name: "manage_roles", label: "Manage Roles" },
  { id: "perm-003", name: "create_listing", label: "Create Listing" },
  { id: "perm-004", name: "moderate_listing", label: "Moderate Listing" },
  { id: "perm-005", name: "manage_users", label: "Manage Users" },
  { id: "perm-006", name: "review_verification", label: "Review Verification" },
  { id: "perm-007", name: "manage_content", label: "Manage Content" },
  { id: "perm-008", name: "manage_areas", label: "Manage Areas" },
  { id: "perm-009", name: "manage_properties", label: "Manage Properties" },
];

export function PermissionEditorModal({ visible, role, onClose }: PermissionEditorModalProps) {
  const { data: roleDetail, isLoading } = useRoleDetail(role?.id ?? "");
  const { assignPermission, revokePermission } = usePermissionMutations(role?.id);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setProcessing(null);
      setError(null);
    }
  }, [visible]);

  function isAssigned(permissionName: string): boolean {
    return (
      roleDetail?.role_permissions?.some((rp) => rp.permission.name === permissionName) ?? false
    );
  }

  async function togglePermission(permission: { id: string; name: string }) {
    setProcessing(permission.id);
    setError(null);
    try {
      if (isAssigned(permission.name)) {
        const rp = roleDetail?.role_permissions?.find(
          (p) => p.permission.name === permission.name,
        );
        if (rp) {
          await revokePermission.mutateAsync(rp.permission.id);
        }
      } else {
        await assignPermission.mutateAsync({ permissionId: permission.id });
      }
    } catch (requestError) {
      setError(toApiError(requestError).message);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Permissions</Text>
              {role ? (
                <Text style={styles.subtitle}>{role.name}</Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
              <X color={colorTokens.textSecondary} size={18} />
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colorTokens.primary} size="large" />
            </View>
          ) : (
            <FlatList
              data={ALL_PERMISSIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const assigned = isAssigned(item.name);
                const isProcessing = processing === item.id;
                return (
                  <Pressable
                    onPress={() => togglePermission(item)}
                    style={[styles.permRow, assigned && styles.permRowActive]}
                    accessibilityLabel={`${assigned ? "Remove" : "Assign"} ${item.label} permission`}
                    disabled={isProcessing}
                  >
                    <Text style={[styles.permName, assigned && styles.permNameActive]}>
                      {item.label}
                    </Text>
                    {isProcessing ? (
                      <ActivityIndicator color={colorTokens.primary} size="small" />
                    ) : assigned ? (
                      <View style={styles.checkChip}>
                        <Check color={colorTokens.textInverse} size={12} />
                        <Text style={styles.checkText}>Assigned</Text>
                      </View>
                    ) : (
                      <View style={styles.addChip}>
                        <Text style={styles.addText}>Add</Text>
                      </View>
                    )}
                  </Pressable>
                );
              }}
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.overlay,
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "70%",
    borderRadius: 20,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    marginTop: 2,
  },
  errorText: { color: colorTokens.error, fontFamily: fontTokens.regular, fontSize: 12, paddingHorizontal: 20 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  list: {
    padding: 12,
  },
  separator: {
    height: 6,
  },
  permRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  permRowActive: {
    backgroundColor: colorTokens.primaryLight,
    borderColor: colorTokens.primary,
  },
  permName: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
  permNameActive: {
    color: colorTokens.primaryDark,
  },
  checkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colorTokens.primary,
  },
  checkText: {
    fontSize: 11,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
  addChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  addText: {
    fontSize: 11,
    fontFamily: fontTokens.bold,
    color: colorTokens.textSecondary,
  },
});
