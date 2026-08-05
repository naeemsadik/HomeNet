import { router } from "expo-router";
import { LoaderCircle, Search, UserRound, Users, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";
import { getAuthSession, type StoredAuthSession } from "@/services/authStorage";
import { listUsers, type UserProfile } from "@/services/userApi";

export function UsersScreen() {
  const { isPhone } = useResponsive();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const stored = await getAuthSession();
      if (!stored) {
        setError("You must be signed in to view users.");
        return;
      }
      setSession(stored);
      const result = await listUsers(stored.accessToken);
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
    if (!session) return;
    router.push(`/users/${user.id}` as any);
  }

  function renderUser({ item }: { item: UserProfile }) {
    const primaryEmail = item.auth_identities?.[0]?.email;
    const isVerified = !!item.auth_identities?.[0]?.verified_at;

    return (
      <Pressable
        onPress={() => handleUserPress(item)}
        style={({ pressed }) => [styles.userRow, pressed && styles.userRowPressed, webPointer]}
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
          <Text style={styles.userEmail}>{primaryEmail ?? "No email"}</Text>
        </View>
        <View style={[styles.verifiedBadge, isVerified && styles.verifiedBadgeActive]}>
          <Text style={[styles.verifiedText, isVerified && styles.verifiedTextActive]}>
            {isVerified ? "Verified" : "Pending"}
          </Text>
        </View>
      </Pressable>
    );
  }

  if (!session) {
    return (
      <AppChrome active="users">
        <View style={styles.emptyState}>
          <Users color={colors.muted} size={40} />
          <Text style={styles.emptyTitle}>Sign in to view users</Text>
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
            placeholder="Search by name or email…"
            placeholderTextColor="#899790"
            style={styles.searchInput}
            value={searchQuery}
          />
        </View>
      </View>

      {error ? <View style={styles.notice}><XCircle color={colors.coral} size={16} /><Text style={styles.noticeText}>{error}</Text></View> : null}

      {loading ? (
        <View style={styles.center}><LoaderCircle color={colors.green} size={24} /><Text style={styles.loadingText}>Loading users…</Text></View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UserRound color={colors.muted} size={40} />
              <Text style={styles.emptyTitle}>{searchQuery ? "No users match your search" : "No users found"}</Text>
            </View>
          }
          renderItem={renderUser}
        />
      )}
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginBottom: 16 },
  title: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 32, letterSpacing: -1.5 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, paddingHorizontal: 13, minHeight: 42, borderRadius: 12, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  searchInput: { flex: 1, color: colors.ink, fontFamily: fonts.regular, fontSize: 13 },
  list: { gap: 6, paddingBottom: 30 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  userRowPressed: { opacity: 0.7 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.soft, overflow: "hidden" },
  userAvatarImage: { width: 44, height: 44, borderRadius: 22 },
  userInfo: { flex: 1 },
  userName: { color: colors.ink, fontFamily: fonts.semiBold, fontSize: 14 },
  userEmail: { marginTop: 2, color: colors.muted, fontFamily: fonts.regular, fontSize: 11 },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.soft },
  verifiedBadgeActive: { backgroundColor: colors.greenLight },
  verifiedText: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 9 },
  verifiedTextActive: { color: colors.greenDark },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  loadingText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  notice: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, backgroundColor: "#FFF4F4", borderWidth: 1, borderColor: "#F9D8D8", marginBottom: 12 },
  noticeText: { color: colors.coral, fontFamily: fonts.regular, fontSize: 12, flexShrink: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: colors.muted, fontFamily: fonts.semiBold, fontSize: 16 },
  emptyCopy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, textAlign: "center", maxWidth: 300 },
});
