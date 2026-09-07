import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, LoaderCircle, LogOut, Save, ShieldCheck, Trash2, UserRound, KeyRound } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { AppButton, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { FloatingInput, ErrorBanner, AuthButton } from "@/components/AuthFormFields";
import { AuthCard } from "@/components/AuthCard";
import { updateUser, uploadAvatar, deleteAvatar, deleteUser } from "@/services/userApi";
import type { UploadInput } from "@/services/upload";

export function ProfileScreen() {
  const { isPhone } = useResponsive();
  const { user, logout } = useAuthStore();
  const params = useLocalSearchParams<{ register?: string; mode?: string }>();
  const initialAuthMode =
    params.register === "true" || params.mode === "register" || params.mode === "signup"
      ? "signup"
      : "signin";

  const [editingName, setEditingName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditingName(user.full_name);
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !editingName.trim()) return;
    try {
      setUpdatingProfile(true);
      setLocalError(null);
      await updateUser(user.id, { full_name: editingName.trim() });
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
      const asset = result.assets[0];
      const file: UploadInput = asset.file ?? {
        uri: asset.uri,
        name: asset.fileName || "avatar.jpg",
        type: asset.mimeType || "image/jpeg",
      };
      await uploadAvatar(file, asset.fileName || "avatar.jpg");
      
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
      await deleteAvatar();
      
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
            await deleteUser(user.id);
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

        {/* Unauthenticated State */}
        {!user ? (
          <View style={styles.authWrapper}>
            <AuthCard initialMode={initialAuthMode} />
          </View>
        ) : (
          /* Authenticated Settings State */
          <>
            {/* Global Errors for Authenticated Actions */}
            <ErrorBanner message={localError} />

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
                  onPress={() => router.push("/profile/change-password" as never)}
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
  title: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 26, letterSpacing: -0.4 },
  subtitle: { color: "rgba(255,255,255,0.86)", fontFamily: fonts.regular, fontSize: 13 },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" },
  badgeText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 11 },
  
  card: { padding: 24, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sectionTitle: { marginBottom: 4, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 18 },
  supportText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginBottom: 18 },
  
  authWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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
