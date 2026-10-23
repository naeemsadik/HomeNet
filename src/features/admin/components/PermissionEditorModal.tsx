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
import { Check, X } from "@/components/icons";
import { colorTokens, fontTokens } from "@/theme";
import { useRoleDetail } from "../hooks/useRoles";
import { usePermissionMutations } from "../hooks/useRoleMutations";
import type { RoleWithPermissions } from "../types/admin";
import { toApiError } from "@/services/apiClient";
import { useTranslation } from "@/i18n";

interface PermissionEditorModalProps {
  visible: boolean;
  role: RoleWithPermissions | null;
  onClose: () => void;
}

const ALL_PERMISSIONS = [
  { id: "perm-001", name: "view_roles", key: "viewRoles" },
  { id: "perm-002", name: "manage_roles", key: "manageRoles" },
  { id: "perm-003", name: "create_listing", key: "createListing" },
  { id: "perm-004", name: "moderate_listing", key: "moderateListing" },
  { id: "perm-005", name: "manage_users", key: "manageUsers" },
  { id: "perm-006", name: "review_verification", key: "reviewVerification" },
  { id: "perm-007", name: "manage_content", key: "manageContent" },
  { id: "perm-008", name: "manage_areas", key: "manageAreas" },
  { id: "perm-009", name: "manage_properties", key: "manageProperties" },
] as const;

export function PermissionEditorModal({ visible, role, onClose }: PermissionEditorModalProps) {
  const { t } = useTranslation();
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
              <Text style={styles.title}>{t("admin.permissions.title")}</Text>
              {role ? (
                <Text style={styles.subtitle}>{role.name}</Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")}>
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
                const label = t(`admin.permissions.${item.key}`);
                return (
                  <Pressable
                    onPress={() => togglePermission(item)}
                    style={[styles.permRow, assigned && styles.permRowActive]}
                    accessibilityLabel={
                      assigned
                        ? t("admin.permissions.removeAria", { name: label })
                        : t("admin.permissions.assignAria", { name: label })
                    }
                    disabled={isProcessing}
                  >
                    <Text style={[styles.permName, assigned && styles.permNameActive]}>
                      {label}
                    </Text>
                    {isProcessing ? (
                      <ActivityIndicator color={colorTokens.primary} size="small" />
                    ) : assigned ? (
                      <View style={styles.checkChip}>
                        <Check color={colorTokens.onBrand} size={12} />
                        <Text style={styles.checkText}>{t("admin.permissions.assigned")}</Text>
                      </View>
                    ) : (
                      <View style={styles.addChip}>
                        <Text style={styles.addText}>{t("admin.permissions.add")}</Text>
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
    color: colorTokens.onBrand,
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
