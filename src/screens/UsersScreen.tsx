import { router } from "expo-router";
import {
  AtSign,
  Clock,
  LoaderCircle,
  Mail,
  Phone,
  Search,
  Settings,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import {
  listUsers,
  deleteUser,
  type UserProfile,
} from "@/services/userApi";
import { UserRoleBadges } from "@/features/admin/components/UserRoleBadges";
import { RoleAssignmentModal } from "@/features/admin/components/RoleAssignmentModal";
import { DeleteUserDialog } from "@/features/admin/components/DeleteUserDialog";
import { useUserRoles } from "@/features/admin/hooks/useUserRoles";
import type { UserRole } from "@/features/admin/types/admin";

function ProviderIcon({ provider }: { provider: string }) {
  switch (provider) {
    case "GOOGLE":
      return <AtSign color="#DB4437" size={12} />;
    case "PHONE":
      return <Phone color={colors.blue} size={12} />;
    case "LOCAL":
    default:
      return <Mail color={colors.green} size={12} />;
  }
}

function UserRolesLoader({ userId }: { userId: string }) {
  const { data: roles } = useUserRoles(userId);
  if (!roles || roles.length === 0) return null;
  return <UserRoleBadges roles={roles} />;
}

export function UsersScreen() {
  const { isPhone } = useResponsive();
  const userRoles = useAuthStore((s) => s.userRoles);
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManageRoles = userRoles.some(
    (ur) =>
      ur.role.name === "admin" ||
      ur.role.name === "superadmin" ||
      ur.role.role_permissions?.some(
        (rp) => rp.permission.name === "manage_roles" || rp.permission.name === "manage_users",
      ),
  );

  useEffect(() => {
    if (currentUser) void loadUsers();
  }, [currentUser?.id]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      if (!useAuthStore.getState().user) {
        setError("You must be logged in to view users.");
        return;
      }
      const result = await listUsers();
      const data = result.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(text: string) {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredUsers(users);
      return;
    }
    const q = text.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.auth_identities.some((i) => i.email?.toLowerCase().includes(q)),
      ),
    );
  }

  function handleUserPress(user: UserProfile) {
    router.push(`/users/${user.id}` as never);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  const renderUser = useCallback(
    ({ item }: { item: UserProfile }) => {
      const primaryIdentity = item.auth_identities?.[0];
      const isVerified = !!primaryIdentity?.verified_at;

      return (
        <View style={styles.userCard}>
          <Pressable
            onPress={() => handleUserPress(item)}
            style={({ pressed }) => [styles.userRow, pressed && styles.userRowPressed, webPointer]}
            accessibilityLabel={`View ${item.full_name}`}
          >
            <View style={styles.userAvatar}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.userAvatarImage} />
              ) : (
                <UserRound color={colors.muted} size={20} />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.full_name}</Text>
              <View style={styles.emailRow}>
                {primaryIdentity?.provider ? (
                  <ProviderIcon provider={primaryIdentity.provider} />
                ) : null}
                <Text style={styles.userEmail}>
                  {primaryIdentity?.email ?? "No email"}
                </Text>
              </View>
              {isVerified && primaryIdentity?.verified_at ? (
                <View style={styles.verifiedRow}>
                  <Clock color={colors.green} size={10} />
                  <Text style={styles.verifiedTimestamp}>
                    Verified {new Date(primaryIdentity.verified_at).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.verifiedBadge, isVerified && styles.verifiedBadgeActive]}>
              <Text style={[styles.verifiedText, isVerified && styles.verifiedTextActive]}>
                {isVerified ? "Verified" : "Pending"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.userRolesRow}>
            <UserRolesLoader userId={item.id} />
          </View>

          {canManageRoles ? (
            <View style={styles.userActions}>
              <Pressable
                onPress={() => setRoleModalUser(item)}
                style={[styles.actionBtn, { backgroundColor: colors.greenLight }]}
                accessibilityLabel={`Manage roles for ${item.full_name}`}
              >
                <Settings color={colors.green} size={13} />
                <Text style={[styles.actionText, { color: colors.greenDark }]}>Roles</Text>
              </Pressable>
              <Pressable
                onPress={() => setDeleteTarget(item)}
                style={[styles.actionBtn, { backgroundColor: "#FDF0EE" }]}
                accessibilityLabel={`Delete ${item.full_name}`}
              >
                <Trash2 color={colors.coral} size={13} />
                <Text style={[styles.actionText, { color: colors.coral }]}>Delete</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      );
    },
    [canManageRoles],
  );

  if (!currentUser) {
    return (
      <AppChrome active="users">
        <View style={styles.emptyState}>
          <Users color={colors.muted} size={40} />
          <Text style={styles.emptyTitle}>Log in to view users</Text>
          <Text style={styles.emptyCopy}>You need to be logged in to access the users directory.</Text>
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome active="users">
      <View style={styles.header}>
        <Eyebrow>Directory</Eyebrow>
        <Text style={styles.title}>All users</Text>
        <View style={styles.searchBox}>
          <Search color={colors.muted} size={16} />
          <TextInput
            onChangeText={handleSearch}
            placeholder="Search by name or email..."
            placeholderTextColor="#899790"
            style={styles.searchInput}
            value={searchQuery}
          />
        </View>
      </View>

      {error ? (
        <View style={styles.notice}>
          <XCircle color={colors.coral} size={16} />
          <Text style={styles.noticeText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <LoaderCircle color={colors.green} size={24} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UserRound color={colors.muted} size={40} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No users match your search" : "No users found"}
              </Text>
            </View>
          }
          renderItem={renderUser}
        />
      )}

      <RoleAssignmentModal
        visible={!!roleModalUser}
        user={roleModalUser ? { id: roleModalUser.id, full_name: roleModalUser.full_name } as never : null}
        onClose={() => setRoleModalUser(null)}
      />

      <DeleteUserDialog
        visible={!!deleteTarget}
        userName={deleteTarget?.full_name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginBottom: 16 },
  title: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 30, letterSpacing: -0.5 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, height: 42, color: colors.ink, fontFamily: fonts.regular, fontSize: 14 },
  list: { gap: 8, paddingBottom: 30 },
  userCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  userRowPressed: { opacity: 0.7 },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.soft,
    overflow: "hidden",
  },
  userAvatarImage: { width: 44, height: 44, borderRadius: 22 },
  userInfo: { flex: 1, gap: 2 },
  userName: { color: colors.ink, fontFamily: fonts.semiBold, fontSize: 15 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  userEmail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  verifiedTimestamp: { color: colors.greenDark, fontFamily: fonts.regular, fontSize: 11 },
  verifiedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.soft,
  },
  verifiedBadgeActive: { backgroundColor: colors.greenLight },
  verifiedText: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 11 },
  verifiedTextActive: { color: colors.greenDark },
  userRolesRow: { paddingHorizontal: 2 },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: { fontSize: 11, fontFamily: fonts.semiBold },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  loadingText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F9D8D8",
    marginBottom: 12,
  },
  noticeText: { color: colors.coral, fontFamily: fonts.regular, fontSize: 12, flexShrink: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: colors.muted, fontFamily: fonts.semiBold, fontSize: 16 },
  emptyCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 300,
  },
});
