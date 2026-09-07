import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, LoaderCircle, Mail, ShieldCheck, UserRound, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { getUser, type UserProfile } from "@/services/userApi";

export function UserDetailScreen({ userId }: { userId: string }) {
  const { isPhone } = useResponsive();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadUser();
  }, [userId]);

  async function loadUser() {
    try {
      setLoading(true);
      setError(null);
      const result = await getUser(userId);
      setUser(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  const identity = user?.auth_identities?.[0];
  const isVerified = !!identity?.verified_at;

  if (loading) {
    return (
      <AppChrome active="users">
        <View style={styles.center}><LoaderCircle color={colors.green} size={24} /><Text style={styles.loadingText}>Loading user…</Text></View>
      </AppChrome>
    );
  }

  if (error || !user) {
    return (
      <AppChrome active="users">
        <View style={styles.center}>
          <XCircle color={colors.coral} size={32} />
          <Text style={styles.errorText}>{error || "User not found"}</Text>
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome active="users">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, isPhone && styles.heroCardPhone]}>
          <LinearGradient colors={[colors.green, colors.blue]} end={{ x: 1, y: 0 }} style={styles.heroGradient} />
          <View style={styles.avatarWrap}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <UserRound color={colors.white} size={34} />
              </View>
            )}
          </View>
          <View style={styles.heroContent}>
            <Eyebrow light>User profile</Eyebrow>
            <Text style={styles.title}>{user.full_name}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isVerified && styles.badgeVerified]}>
                <ShieldCheck color={colors.white} size={14} />
                <Text style={styles.badgeText}>{isVerified ? "Verified" : "Unverified"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account information</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><Mail color={colors.green} size={16} /></View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Email</Text>
              <Pressable onPress={() => identity?.email && Linking.openURL(`mailto:${identity.email}`)}>
                <Text style={styles.detailValue}>{identity?.email ?? "N/A"}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><ShieldCheck color={colors.green} size={16} /></View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>{identity?.provider ?? "N/A"}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><ShieldCheck color={colors.green} size={16} /></View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Verified at</Text>
              <Text style={styles.detailValue}>{identity?.verified_at ? new Date(identity.verified_at).toLocaleString() : "Not verified"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><UserRound color={colors.green} size={16} /></View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{new Date(user.created_at).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><UserRound color={colors.green} size={16} /></View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Updated</Text>
              <Text style={styles.detailValue}>{new Date(user.updated_at).toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 30 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 12 },
  loadingText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  errorText: { color: colors.coral, fontFamily: fonts.regular, fontSize: 14, textAlign: "center" },
  heroCard: { position: "relative", overflow: "hidden", borderRadius: 24, padding: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, ...shadow },
  heroCardPhone: { padding: 18 },
  heroGradient: { ...StyleSheet.absoluteFill, opacity: 0.96 },
  avatarWrap: { alignSelf: "flex-start", marginBottom: 16 },
  avatarImage: { width: 94, height: 94, borderRadius: 47, borderWidth: 3, borderColor: colors.white },
  avatarPlaceholder: { width: 94, height: 94, borderRadius: 47, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 3, borderColor: colors.white },
  heroContent: { gap: 8 },
  title: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 26, letterSpacing: -0.4 },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" },
  badgeVerified: { backgroundColor: "rgba(255,255,255,0.25)" },
  badgeText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 11 },
  card: { padding: 20, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sectionTitle: { marginBottom: 14, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 17 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  detailIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.greenLight },
  detailInfo: { flex: 1 },
  detailLabel: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  detailValue: { color: colors.ink, fontFamily: fonts.regular, fontSize: 13 },
});
