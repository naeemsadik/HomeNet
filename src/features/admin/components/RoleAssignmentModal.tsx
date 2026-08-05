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
import { useUserRoles } from "../hooks/useUserRoles";
import { useRoleMutations } from "../hooks/useRoleMutations";
import { useRoles } from "../hooks/useRoles";
import type { UserWithRoles, RoleWithPermissions } from "../types/admin";

interface RoleAssignmentModalProps {
  visible: boolean;
  user: UserWithRoles | null;
  onClose: () => void;
}

export function RoleAssignmentModal({ visible, user, onClose }: RoleAssignmentModalProps) {
  const { data: allRoles = [], isLoading: rolesLoading } = useRoles();
  const { data: userRoles = [], isLoading: userRolesLoading } = useUserRoles(user?.id ?? "");
  const { assignRole, revokeRole } = useRoleMutations(user?.id);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) setProcessing(null);
  }, [visible]);

  function isAssigned(role: RoleWithPermissions): boolean {
    return userRoles.some((ur) => ur.role_id === role.id);
  }

  async function toggleRole(role: RoleWithPermissions) {
    if (!user) return;
    setProcessing(role.id);
    try {
      if (isAssigned(role)) {
        await revokeRole.mutateAsync({ userId: user.id, roleId: role.id });
      } else {
        await assignRole.mutateAsync({ userId: user.id, roleId: role.id });
      }
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
              <Text style={styles.title}>Manage Roles</Text>
              {user ? (
                <Text style={styles.subtitle}>{user.full_name}</Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
              <X color={colorTokens.textSecondary} size={18} />
            </Pressable>
          </View>

          {rolesLoading || userRolesLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colorTokens.primary} size="large" />
            </View>
          ) : (
            <FlatList
              data={allRoles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const assigned = isAssigned(item);
                const isProcessing = processing === item.id;
                return (
                  <Pressable
                    onPress={() => toggleRole(item)}
                    style={[styles.roleRow, assigned && styles.roleRowActive]}
                    accessibilityLabel={`${assigned ? "Remove" : "Assign"} ${item.name} role`}
                    disabled={isProcessing}
                  >
                    <View style={styles.roleInfo}>
                      <Text style={styles.roleName}>{item.name}</Text>
                      {item.description ? (
                        <Text style={styles.roleDesc} numberOfLines={1}>{item.description}</Text>
                      ) : null}
                    </View>
                    {isProcessing ? (
                      <ActivityIndicator color={colorTokens.primary} size="small" />
                    ) : assigned ? (
                      <View style={styles.checkCircle}>
                        <Check color={colorTokens.textInverse} size={14} />
                      </View>
                    ) : (
                      <View style={styles.emptyCircle} />
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
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  roleRowActive: {
    backgroundColor: colorTokens.primaryLight,
    borderColor: colorTokens.primary,
  },
  roleInfo: {
    flex: 1,
    gap: 2,
  },
  roleName: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
  roleDesc: {
    fontSize: 11,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primary,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorTokens.divider,
  },
});
