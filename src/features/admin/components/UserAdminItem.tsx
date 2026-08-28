import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Settings, Trash2, UserRound } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { RoleBadge } from "./StatusBadge";
import type { UserWithRoles } from "../types/admin";

interface UserAdminItemProps {
  item: UserWithRoles;
  onManageRoles: (user: UserWithRoles) => void;
  onView: (userId: string) => void;
  onDelete: (user: UserWithRoles) => void;
}

export function UserAdminItemRow({ item, onManageRoles, onView, onDelete }: UserAdminItemProps) {
  const email = item.auth_identities?.[0]?.email;
  const primaryRole = item.user_roles?.[0]?.role?.name ?? "buyer_seller";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <UserRound color={colorTokens.textMuted} size={20} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
          <Text style={styles.email} numberOfLines={1}>{email ?? "No email"}</Text>
        </View>
        <RoleBadge role={primaryRole} />
      </View>

      <Text style={styles.date}>
        Joined {new Date(item.created_at).toLocaleDateString()}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onManageRoles(item)}
          style={[styles.actionBtn, { backgroundColor: colorTokens.primaryLight }]}
          accessibilityLabel="Manage roles"
        >
          <Settings color={colorTokens.primary} size={14} />
          <Text style={[styles.actionText, { color: colorTokens.primary }]}>Roles</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(item)}
          style={[styles.actionBtn, { backgroundColor: colorTokens.errorLight }]}
          accessibilityLabel={`Delete ${item.full_name}`}
        >
          <Trash2 color={colorTokens.error} size={14} />
          <Text style={[styles.actionText, { color: colorTokens.error }]}>Delete</Text>
        </Pressable>
        <Pressable
          onPress={() => onView(item.id)}
          style={[styles.actionBtn, { backgroundColor: colorTokens.verifiedLight }]}
          accessibilityLabel="View user"
        >
          <Text style={[styles.actionText, { color: colorTokens.verified }]}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colorTokens.backgroundAlt,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  email: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  date: {
    fontSize: 11,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
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
    fontFamily: fontTokens.semiBold,
  },
});
