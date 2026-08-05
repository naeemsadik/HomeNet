import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Trash2, UserRound } from "lucide-react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { FloatingInput, ErrorBanner, AuthButton } from "@/components/AuthFormFields";
import { Eyebrow } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateUserProfile, useUploadAvatar, useDeleteAvatar } from "../hooks/useUserMutations";
import { colorTokens, fonts, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export function EditProfileScreen() {
  const { isPhone } = useResponsive();
  const { user, fetchMe } = useAuthStore();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  const handleSave = async () => {
    if (!user || !fullName.trim()) return;
    setLocalError(null);
    try {
      await updateProfile.mutateAsync({ id: user.id, data: { full_name: fullName.trim() } });
      await fetchMe();
      Alert.alert("Success", "Profile updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      setLocalError(err?.message || "Failed to update profile");
    }
  };

  const handleAvatarUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library.");
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
      const asset = result.assets[0] as any;
      let file: Blob | File | null = null;
      if (asset.uri) {
        const response = await fetch(asset.uri);
        file = await response.blob();
        if ((globalThis as any).File && !(file instanceof (globalThis as any).File)) {
          file = new (globalThis as any).File([file], asset.fileName || "avatar.jpg", {
            type: file.type || "image/jpeg",
          });
        }
      }
      if (!file) throw new Error("Could not obtain file");
      await uploadAvatar.mutateAsync(file as Blob | File);
      await fetchMe();
      Alert.alert("Success", "Avatar updated.");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to upload avatar");
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar.mutateAsync();
      await fetchMe();
      Alert.alert("Success", "Avatar removed.");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to remove avatar");
    }
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Eyebrow>Edit Profile</Eyebrow>
          <Text style={styles.title}>Your profile</Text>
        </View>

        <ErrorBanner message={localError} />

        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <UserRound color={colorTokens.textInverse} size={34} />
                </View>
              )}
              <Pressable
                onPress={handleAvatarUpload}
                style={[styles.avatarAction, webPointer]}
                accessibilityLabel="Upload avatar"
              >
                {uploadAvatar.isPending ? (
                  <ActivityIndicator color={colorTokens.textInverse} size={12} />
                ) : (
                  <Camera color={colorTokens.textInverse} size={15} />
                )}
              </Pressable>
            </View>
            {user?.avatar_url ? (
              <Pressable
                onPress={handleAvatarDelete}
                style={[styles.removeAvatarBtn, webPointer]}
                accessibilityLabel="Remove avatar"
              >
                <Trash2 color={colorTokens.error} size={14} />
                <Text style={styles.removeAvatarText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>

          <FloatingInput
            label="Full Name"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              setLocalError(null);
            }}
            autoCapitalize="words"
          />

          <Text style={styles.emailLabel}>{user?.email}</Text>

          <AuthButton
            label="Save changes"
            onPress={handleSave}
            loading={updateProfile.isPending}
            disabled={!fullName.trim() || fullName === user?.full_name}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 30 },
  headerSection: { gap: 6 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: colorTokens.textPrimary, letterSpacing: -1 },
  card: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  avatarWrap: { position: "relative" },
  avatarImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colorTokens.divider },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primaryLight,
  },
  avatarAction: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primary,
    borderWidth: 2,
    borderColor: colorTokens.background,
  },
  removeAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colorTokens.errorLight,
  },
  removeAvatarText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colorTokens.error,
  },
  emailLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
    marginTop: 8,
    marginBottom: 4,
  },
  saveBtn: { marginTop: 14 },
});
