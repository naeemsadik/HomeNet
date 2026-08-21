import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, LoaderCircle, LogOut, Save, ShieldCheck, Trash2, UserRound, KeyRound } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { AppButton, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { FloatingInput, ErrorBanner, AuthButton, Divider } from "@/components/AuthFormFields";
import { getAccessToken } from "@/services/tokenStorage";
import { updateUser, uploadAvatar, deleteAvatar, deleteUser } from "@/services/userApi";

export function ProfileScreen() {
  const { isPhone } = useResponsive();
  const { user, login, register, logout, loading: authLoading, error: authError, clearError, hydrate } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("Password123");
  const [fullName, setFullName] = useState("John Doe");

  const [editingName, setEditingName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, []);

  useEffect(() => {
    if (user) {
      setEditingName(user.full_name);
    }
  }, [user]);

  const handleAuthSubmit = async () => {
    setLocalError(null);
    if (mode === "login") {
      await login({ email: email.trim(), password });
    } else {
      if (!fullName.trim()) {
        setLocalError("Full name is required");
        return;
      }
      if (password.length < 8) {
        setLocalError("Password must be at least 8 characters");
        return;
      }
      await register({ full_name: fullName.trim(), email: email.trim(), password });
    }
  };

  const handleSaveName = async () => {
    if (!user || !editingName.trim()) return;
    try {
      setUpdatingProfile(true);
      setLocalError(null);
      const token = await getAccessToken();
      await updateUser(token || "", user.id, editingName.trim());
      // Refresh user details in store
      const { fetchMe } = useAuthStore.getState();
      await fetchMe();
      Alert.alert("Success", "Profile name updated successfully.");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to update profile name");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!user) return;
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
      setUploadingAvatar(true);
      setLocalError(null);
      const asset = result.assets[0] as any;

      let fileToUpload: Blob | File | null = null;
      if (asset.file && (globalThis as any).File && asset.file instanceof (globalThis as any).File) {
        fileToUpload = asset.file as File;
      } else if (asset.uri && asset.uri.startsWith("data:")) {
        const base64 = asset.uri.split(",")[1];
        const res = await fetch(asset.uri);
        fileToUpload = await res.blob();
      } else if (asset.uri) {
        try {
          const response = await fetch(asset.uri);
          fileToUpload = await response.blob();
        } catch (fetchErr) {
          throw new Error("Unable to read selected file from browser.");
        }
      }

      if (!fileToUpload) {
        throw new Error("Could not obtain file from image picker");
      }

      try {
        if ((globalThis as any).File && !(fileToUpload instanceof (globalThis as any).File)) {
          fileToUpload = new (globalThis as any).File([fileToUpload], asset.fileName || "avatar.jpg", {
            type: (fileToUpload as Blob).type || "image/jpeg",
          });
        }
      } catch {
        // ignore
      }

      const token = await getAccessToken();
      await uploadAvatar(token || "", fileToUpload as Blob | File, asset.fileName || "avatar.jpg");
      
      const { fetchMe } = useAuthStore.getState();
      await fetchMe();
      Alert.alert("Success", "Avatar uploaded successfully.");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;
    try {
      setUploadingAvatar(true);
      setLocalError(null);
      const token = await getAccessToken();
      await deleteAvatar(token || "");
      
      const { fetchMe } = useAuthStore.getState();
      await fetchMe();
      Alert.alert("Success", "Avatar removed.");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    Alert.alert("Delete Account", "Are you sure? This action is permanent.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdatingProfile(true);
            const token = await getAccessToken();
            await deleteUser(token || "", user.id);
            await logout();
            Alert.alert("Deleted", "Your account has been deleted.");
          } catch (err: any) {
            setLocalError(err?.message || "Failed to delete account");
          } finally {
            setUpdatingProfile(false);
          }
        },
      },
    ]);
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Profile Card if Logged In */}
        {user ? (
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
              <Pressable accessibilityLabel="Upload avatar" onPress={handleAvatarUpload} style={[styles.avatarAction, webPointer]}>
                {uploadingAvatar ? <LoaderCircle color={colors.white} size={15} /> : <Camera color={colors.white} size={15} />}
              </Pressable>
            </View>

            <View style={styles.heroContent}>
              <Eyebrow light>Profile</Eyebrow>
              <Text style={styles.title}>{user.full_name}</Text>
              <Text style={styles.subtitle}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <ShieldCheck color={colors.white} size={14} />
                  <Text style={styles.badgeText}>Verified Account</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Global Errors */}
        <ErrorBanner message={localError || authError} />

        {/* Unauthenticated State */}
        {!user ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {mode === "login" ? "Log in to HomeNet" : "Create your HomeNet account"}
            </Text>
            <Text style={styles.supportText}>
              Access saved properties, list new homes, and verify pricing.
            </Text>

            <View style={styles.formContainer}>
              {mode === "register" ? (
                <FloatingInput
                  label="Full Name"
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    setLocalError(null);
                    clearError();
                  }}
                  autoCapitalize="words"
                />
              ) : null}

              <FloatingInput
                label="Email"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setLocalError(null);
                  clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <FloatingInput
                label="Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setLocalError(null);
                  clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AuthButton
                label={mode === "login" ? "Log In" : "Register"}
                onPress={handleAuthSubmit}
                loading={authLoading}
                disabled={!email || !password || (mode === "register" && !fullName)}
                style={styles.submitBtn}
              />

              <Divider text="or" />

              <AuthButton
                label={mode === "login" ? "Create an account" : "Back to Log In"}
                onPress={() => {
                  setMode((current) => (current === "login" ? "register" : "login"));
                  setLocalError(null);
                  clearError();
                }}
                variant="secondary"
              />
            </View>
          </View>
        ) : (
          /* Authenticated Settings State */
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Profile details</Text>
              
              <FloatingInput
                label="Full Name"
                value={editingName}
                onChangeText={(val) => {
                  setEditingName(val);
                  setLocalError(null);
                }}
                autoCapitalize="words"
              />

              <View style={styles.actionsRow}>
                <AuthButton
                  label="Save changes"
                  onPress={handleSaveName}
                  loading={updatingProfile}
                  disabled={!editingName.trim() || editingName === user.full_name}
                  style={styles.flexBtn}
                />
                
                {user.avatar_url ? (
                  <AuthButton
                    label="Remove avatar"
                    onPress={handleAvatarDelete}
                    variant="secondary"
                    icon={Trash2}
                    style={styles.flexBtn}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Account Security</Text>
              <Text style={styles.supportText}>
                Manage your credentials and security preferences.
              </Text>
              
              <View style={styles.actionsRow}>
                <AuthButton
                  label="Change Password"
                  onPress={() => router.push("/profile/change-password")}
                  variant="secondary"
                  icon={KeyRound}
                  style={styles.flexBtn}
                />
                
                <AuthButton
                  label="Log out"
                  onPress={logout}
                  variant="ghost"
                  icon={LogOut}
                  style={styles.flexBtn}
                />
              </View>

              <Pressable
                onPress={handleDeleteAccount}
                style={[styles.deleteAccountBtn, webPointer]}
              >
                <Trash2 size={14} color={colors.coral} />
                <Text style={styles.deleteAccountText}>Permanently Delete Account</Text>
              </Pressable>
            </View>
          </>
        )}
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
  
  card: { padding: 24, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sectionTitle: { marginBottom: 4, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 18 },
  supportText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginBottom: 18 },
  
  formContainer: {
    marginTop: 16,
  },
  submitBtn: {
    marginTop: 10,
  },
  
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 14, flexWrap: "wrap" },
  flexBtn: {
    flex: 1,
    minWidth: 150,
  },
  
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F9D8D8",
    backgroundColor: "#FFF4F4",
    borderRadius: 12,
  },
  deleteAccountText: {
    color: colors.coral,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
