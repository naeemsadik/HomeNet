import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, LoaderCircle, LogOut, Save, ShieldCheck, Trash2, UserRound, XCircle } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppButton, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { deleteAvatar, deleteUser, getUser, updateUser, uploadAvatar, UserApiError, type UserProfile } from "@/services/userApi";
import { clearAuthSession, getAuthSession, saveAuthSession, type StoredAuthSession } from "@/services/authStorage";
import { getCurrentUser, loginUser, registerUser, logoutUser } from "@/services/authApi";

export function ProfileScreen() {
  const { isPhone } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<StoredAuthSession | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("Password123");
  const [fullName, setFullName] = useState("John Doe");

  function formatError(err: unknown): string {
    if (err instanceof UserApiError) {
      return err.errorCode ? `[Error ${err.errorCode}] ${err.message}` : err.message;
    }
    return err instanceof Error ? err.message : String(err);
  }

  useEffect(() => {
    void loadSession();
  }, []);

  async function loadSession() {
    try {
      setLoading(true);
      const session = await getAuthSession();
      if (session) {
        setAuthSession(session);
        setProfile({
          id: session.userId,
          full_name: session.userName,
          avatar_url: session.avatarUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_identities: [{ provider: "LOCAL", email: session.email, phone: null, verified_at: null }],
        });
        setEditingName(session.userName);
        const me = await getCurrentUser(session.accessToken);
        if (me.data) {
          setProfile({
            id: me.data.id,
            full_name: me.data.full_name,
            avatar_url: me.data.avatar_url,
            created_at: me.data.created_at,
            updated_at: me.data.created_at,
            auth_identities: [{ provider: "LOCAL", email: me.data.email, phone: null, verified_at: null }],
          });
          setEditingName(me.data.full_name);
        } else {
          const result = await getUser(session.accessToken, session.userId);
          if (result.data) {
            setProfile(result.data);
            setEditingName(result.data.full_name);
          }
        }
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit() {
    try {
      setLoading(true);
      setError(null);
      const response = mode === "login"
        ? await loginUser(email.trim(), password)
        : await registerUser(fullName.trim(), email.trim(), password);

      const payload = response.data;
      if (!payload) throw new Error("Authentication response did not include user data");

      const session: StoredAuthSession = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
        userId: payload.user.id,
        userName: payload.user.full_name,
        email: payload.user.email,
        avatarUrl: payload.user.avatar_url,
      };

      await saveAuthSession(session);
      setAuthSession(session);
      setProfile({
        id: payload.user.id,
        full_name: payload.user.full_name,
        avatar_url: payload.user.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        auth_identities: [{ provider: "LOCAL", email: payload.user.email, phone: null, verified_at: null }],
      });
      setEditingName(payload.user.full_name);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  const primaryIdentity = useMemo(() => profile?.auth_identities?.[0], [profile]);

  async function handleSave() {
    if (!profile || !authSession) return;
    try {
      setSaving(true);
      setError(null);
      const result = await updateUser(authSession.accessToken, profile.id, editingName.trim());
      setProfile(result.data);
      setEditingName(result.data?.full_name ?? "");
      Alert.alert("Profile updated", "Your profile name has been updated.");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload() {
    if (!profile || !authSession) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library to upload an avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    try {
      setUploading(true);
      setError(null);
      const asset = result.assets[0] as any;

      // Prefer the native File object (web) when provided by the picker.
      let fileToUpload: Blob | File | null = null;
      if (asset.file && (globalThis as any).File && asset.file instanceof (globalThis as any).File) {
        fileToUpload = asset.file as File;
      } else if (asset.uri && asset.uri.startsWith("data:")) {
        // data: URL -> convert to blob
        const base64 = asset.uri.split(",")[1];
        const res = await fetch(asset.uri);
        fileToUpload = await res.blob();
      } else if (asset.uri) {
        // Try fetching blob from URI (blob:, http:, etc.)
        try {
          const response = await fetch(asset.uri);
          fileToUpload = await response.blob();
        } catch (fetchErr) {
          console.error("Failed to fetch picked image URI:", asset.uri, fetchErr);
          throw new Error("Unable to read selected file from the browser. Try a different image or use the desktop build.");
        }
      }

      if (!fileToUpload) {
        throw new Error("Could not obtain file from image picker result");
      }

      // On web convert Blob -> File to preserve filename/type where possible
      try {
        if ((globalThis as any).File && !(fileToUpload instanceof (globalThis as any).File)) {
          fileToUpload = new (globalThis as any).File([fileToUpload], asset.fileName || "avatar.jpg", { type: (fileToUpload as Blob).type || "image/jpeg" });
        }
      } catch {
        // ignore
      }

      const uploadResult = await uploadAvatar(authSession.accessToken, fileToUpload as Blob | File, asset.fileName || "avatar.jpg");
      setProfile(uploadResult.data);
      Alert.alert("Avatar uploaded", "Your avatar has been updated.");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarDelete() {
    if (!profile || !authSession) return;
    try {
      setUploading(true);
      setError(null);
      const result = await deleteAvatar(authSession.accessToken);
      setProfile(result.data);
      Alert.alert("Avatar removed", "Your avatar has been removed.");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!profile || !authSession) return;
    Alert.alert("Delete account", "This will permanently remove your user record.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await deleteUser(authSession.accessToken, profile.id);
            await clearAuthSession();
            setAuthSession(null);
            setProfile(null);
            setEditingName("");
            Alert.alert("Account deleted", "Your account has been removed.");
          } catch (err) {
            setError(formatError(err));
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }

  async function handleLogout() {
    if (!authSession) return;
    try {
      setLoading(true);
      await logoutUser(authSession.accessToken, authSession.refreshToken);
    } catch (err) {
      setError(formatError(err));
    } finally {
      await clearAuthSession();
      setAuthSession(null);
      setProfile(null);
      setEditingName("");
      setLoading(false);
    }
  }

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, isPhone && styles.heroCardPhone]}>
          <LinearGradient colors={[colors.green, colors.blue]} end={{ x: 1, y: 0 }} style={styles.heroGradient} />
          <View style={styles.avatarWrap}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <UserRound color={colors.white} size={34} />
              </View>
            )}
            <Pressable accessibilityLabel="Upload avatar" onPress={handleAvatarUpload} style={[styles.avatarAction, webPointer]}>
              {uploading ? <LoaderCircle color={colors.white} size={15} /> : <Camera color={colors.white} size={15} />}
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <Eyebrow light>Profile</Eyebrow>
            <Text style={styles.title}>{profile?.full_name ?? "Loading profile"}</Text>
            <Text style={styles.subtitle}>{primaryIdentity?.email ?? "No email available"}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <ShieldCheck color={colors.white} size={14} />
                <Text style={styles.badgeText}>Verified account</Text>
              </View>
            </View>
          </View>
        </View>

        {error ? <View style={styles.notice}><XCircle color={colors.coral} size={16} /><Text style={styles.noticeText}>{error}</Text></View> : null}

        {!authSession ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{mode === "login" ? "Sign in to HomeNet" : "Create your HomeNet account"}</Text>
            <Text style={styles.supportText}>This connects the profile screen to your backend auth endpoints.</Text>
            {mode === "register" ? (
              <View style={styles.formStack}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput onChangeText={setFullName} placeholder="Enter your full name" style={styles.input} value={fullName} />
              </View>
            ) : null}
            <View style={styles.formStack}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" style={styles.input} value={email} />
            </View>
            <View style={styles.formStack}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput onChangeText={setPassword} placeholder="Your password" secureTextEntry style={styles.input} value={password} />
            </View>
            <View style={styles.actionsRow}>
              <AppButton label={mode === "login" ? "Sign in" : "Create account"} onPress={handleAuthSubmit} icon={Save} />
              <AppButton label={mode === "login" ? "Create account" : "Sign in"} onPress={() => setMode((current) => current === "login" ? "register" : "login")} variant="secondary" />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Profile details</Text>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput
                onChangeText={setEditingName}
                placeholder="Enter your full name"
                style={styles.input}
                value={editingName}
              />
              <View style={styles.actionsRow}>
                <AppButton disabled={saving || !editingName.trim()} label={saving ? "Saving..." : "Save changes"} onPress={handleSave} icon={Save} />
                <AppButton label="Remove avatar" onPress={handleAvatarDelete} variant="secondary" icon={Trash2} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Account security</Text>
              <Text style={styles.supportText}>Use the endpoints documented for the user module to keep profile data synchronized with your backend.</Text>
              <View style={styles.actionsRow}>
                <AppButton label="Log out" onPress={handleLogout} variant="ghost" icon={LogOut} />
                <AppButton label="Delete account" onPress={handleDeleteAccount} variant="ghost" icon={Trash2} />
              </View>
            </View>
          </>
        )}

        {loading ? <Text style={styles.loadingText}>Loading user details…</Text> : null}
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 30 },
  heroCard: { position: "relative", overflow: "hidden", borderRadius: 24, padding: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, ...shadow },
  heroCardPhone: { padding: 18 },
  heroGradient: { ...StyleSheet.absoluteFill, opacity: 0.96 },
  avatarWrap: { alignSelf: "flex-start", marginBottom: 16 },
  avatarImage: { width: 94, height: 94, borderRadius: 47, borderWidth: 3, borderColor: colors.white },
  avatarPlaceholder: { width: 94, height: 94, borderRadius: 47, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 3, borderColor: colors.white },
  avatarAction: { position: "absolute", right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.greenDark },
  heroContent: { gap: 8 },
  title: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 26, letterSpacing: -1 },
  subtitle: { color: "rgba(255,255,255,0.86)", fontFamily: fonts.regular, fontSize: 12 },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" },
  badgeText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 10 },
  card: { padding: 20, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sectionTitle: { marginBottom: 10, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 17 },
  fieldLabel: { marginBottom: 7, color: colors.muted, fontFamily: fonts.extraBold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  input: { minHeight: 46, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.soft, color: colors.ink, fontFamily: fonts.regular },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  formStack: { marginTop: 12 },
  notice: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, backgroundColor: "#FFF4F4", borderWidth: 1, borderColor: "#F9D8D8" },
  noticeText: { color: colors.coral, fontFamily: fonts.regular, fontSize: 12, flexShrink: 1 },
  supportText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  loadingText: { textAlign: "center", color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
});
