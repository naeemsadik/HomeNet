import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  User,
  X,
} from "@/components/icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { confirmAction, notify } from "@/lib/alert";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { deleteUser, updateUser, uploadAvatar } from "@/services/userApi";
import { editProfileSchema } from "@/lib/schemas/user";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { toApiError } from "@/services/apiClient";
import type { UploadInput } from "@/services/upload";
import { styles } from "./BuyerProfileScreen.styles";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
// Sample values shown (greyed out) in signed-out preview. Never a real person.
const DEFAULT_NAME = "Your name";
const DEFAULT_EMAIL = "you@example.com";
const DEFAULT_PHONE = "+880 1700-000000";

export function BuyerProfileScreen() {
  const { isPhone } = useResponsive();
  const { user, logout, fetchMe, changePassword } = useAuthStore();

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || DEFAULT_NAME);
  const [email, setEmail] = useState(user?.email || DEFAULT_EMAIL);
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url || DEFAULT_AVATAR
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Change Password Modal State
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.email) setEmail(user.email);
      if (user?.avatar_url) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const isNormalText = (val: string, defaultVal: string) =>
    Boolean(user) || (val.length > 0 && val !== defaultVal);

  const handleAvatarUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notify(
          "Permission Required",
          "Please grant photo library access to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setAvatarUrl(asset.uri);

      if (user?.id) {
        setIsUploading(true);
        const file: UploadInput = asset.file ?? {
          uri: asset.uri,
          name: asset.fileName || "profile.jpg",
          type: asset.mimeType || "image/jpeg",
        };
        await uploadAvatar(file, asset.fileName || "profile.jpg");
        await fetchMe();
        notify("Success", "Profile photo updated successfully.");
      }
    } catch (err: any) {
      if (__DEV__) console.warn("Avatar upload error:", err);
      notify("Notice", "Photo selected. Save changes to keep it.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      const signIn = await confirmAction(
        "Preview Mode",
        "Sign in to sync your profile updates across all your devices. Sign in now?",
        { confirmLabel: "Sign In", cancelLabel: "Not now" },
      );
      if (signIn) router.push("/profile" as any);
      return;
    }

    const validation = editProfileSchema.safeParse({ full_name: fullName });
    if (!validation.success) {
      notify("Validation", validation.error.issues[0]?.message || "Please enter a valid full name.");
      return;
    }

    try {
      setIsSaving(true);
      await updateUser(user.id, {
        full_name: validation.data.full_name,
      });
      await fetchMe();
      notify("Saved", "Your profile details have been updated.");
    } catch (err: any) {
      notify("Error", toApiError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError(null);
    const validation = changePasswordSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirmPassword: confirmPassword,
    });
    if (!validation.success) {
      setPasswordError(validation.error.issues[0]?.message || "Invalid password details.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setChangePasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify("Success", "Your password has been changed successfully.");
    } catch (err: any) {
      setPasswordError(toApiError(err).message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      notify("Notice", "No authenticated account to delete in preview mode.");
      return;
    }

    const doDelete = async () => {
      try {
        setIsDeletingAccount(true);
        await deleteUser(user.id);
        await logout();
        router.replace("/home");
        notify("Account Deleted", "Your account has been permanently removed.");
      } catch (err: any) {
        notify("Error", toApiError(err).message);
      } finally {
        setIsDeletingAccount(false);
      }
    };

    const confirmed = await confirmAction(
      "Permanently Delete Account",
      "Are you sure you want to delete your account? All your personal information, saved listings, and history will be permanently erased. This cannot be undone.",
      { confirmLabel: "Delete Permanently", destructive: true },
    );
    if (confirmed) await doDelete();
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        if (__DEV__) console.warn("Logout error:", err);
      }
      router.replace("/home");
    };

    const confirmed = await confirmAction("Logout", "Are you sure you want to log out?", {
      confirmLabel: "Logout",
      destructive: true,
    });
    if (confirmed) await doLogout();
  };

  return (
    <AppChrome active="profile">
      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          isPhone && styles.scrollBodyPhone,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Header Title & Back Button */}
          <View style={[styles.pageHeader, isPhone && styles.pageHeaderPhone]}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/home");
                }
              }}
              style={({ pressed }) => [
                styles.backBtn,
                isPhone && styles.backBtnPhone,
                webPointer,
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft color="#0B1A17" size={17} strokeWidth={2.2} />
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>

            <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>Profile</Text>
          </View>

          {/* Section 1: Personal Information */}
          <View style={[styles.card, isPhone && styles.cardPhone]}>
            <View style={styles.cardHeaderRow}>
              <User color="#0B1A17" size={20} />
              <Text style={styles.cardTitle}>Personal information</Text>
            </View>

            {/* Avatar and Name Row */}
            <View style={[styles.profileRow, isPhone && styles.profileRowPhone]}>
              <View style={[styles.avatarWrap, isPhone && styles.avatarWrapPhone]}>
                <Image
                  source={{ uri: avatarUrl || DEFAULT_AVATAR }}
                  style={styles.avatarImage}
                />
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  </View>
                )}
              </View>

              <View style={styles.profileInfoCol}>
                <View style={styles.nameBadgeRow}>
                  <Text numberOfLines={1} style={styles.profileName}>
                    {fullName || DEFAULT_NAME}
                  </Text>

                  <View style={styles.buyerBadge}>
                    <CheckCircle2 color="#04cf92" size={14} />
                    <Text style={styles.buyerBadgeText}>Buyer</Text>
                  </View>
                </View>

                <Pressable
                  accessibilityLabel="Change photo"
                  accessibilityRole="button"
                  onPress={handleAvatarUpload}
                  style={({ pressed }) => [
                    styles.changePhotoBtn,
                    webPointer,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.changePhotoText}>Change photo</Text>
                </Pressable>
              </View>
            </View>

            {/* Form Field: Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                <TextInput
                  onChangeText={setFullName}
                  onFocus={() => {
                    if (fullName === DEFAULT_NAME) {
                      setFullName("");
                    }
                  }}
                  placeholder={DEFAULT_NAME}
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  selectTextOnFocus
                  style={[
                    styles.textInput,
                    isNormalText(fullName, DEFAULT_NAME) && styles.textInputNormal,
                  ]}
                  value={fullName}
                />
                {fullName.length > 0 && (
                  <Pressable
                    accessibilityLabel="Clear full name"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setFullName("")}
                    style={[styles.clearBtn, webPointer]}
                  >
                    <X color="rgba(11,26,23,0.4)" size={16} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Section 2: Contact Information */}
          <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Contact information</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  onFocus={() => {
                    if (email === DEFAULT_EMAIL) {
                      setEmail("");
                    }
                  }}
                  placeholder={DEFAULT_EMAIL}
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  selectTextOnFocus
                  style={[
                    styles.textInput,
                    isNormalText(email, DEFAULT_EMAIL) && styles.textInputNormal,
                  ]}
                  value={email}
                />
                {email.length > 0 && (
                  <Pressable
                    accessibilityLabel="Clear email"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setEmail("")}
                    style={[styles.clearBtn, webPointer]}
                  >
                    <X color="rgba(11,26,23,0.4)" size={16} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={[styles.formGroup, styles.formGroupSpacing]}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={setPhone}
                  onFocus={() => {
                    if (phone === DEFAULT_PHONE) {
                      setPhone("");
                    }
                  }}
                  placeholder={DEFAULT_PHONE}
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  selectTextOnFocus
                  style={[
                    styles.textInput,
                    isNormalText(phone, DEFAULT_PHONE) && styles.textInputNormal,
                  ]}
                  value={phone}
                />
                {phone.length > 0 && (
                  <Pressable
                    accessibilityLabel="Clear phone"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setPhone("")}
                    style={[styles.clearBtn, webPointer]}
                  >
                    <X color="rgba(11,26,23,0.4)" size={16} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Section 3: Account Security (Change Password & Permanently Delete Account) */}
          <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
            <View style={styles.cardHeaderRow}>
              <Shield color="#0B1A17" size={20} />
              <Text style={styles.cardTitle}>Account security</Text>
            </View>

            {/* Change Password Option */}
            <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
              <View style={styles.securityInfoCol}>
                <Text style={styles.securityTitle}>Password</Text>
                <Text style={styles.securityDesc}>
                  •••••••••••• &nbsp;·&nbsp; Keep your account protected with a strong password
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Change password"
                accessibilityRole="button"
                onPress={() => {
                  setPasswordError(null);
                  setChangePasswordModalOpen(true);
                }}
                style={({ pressed }) => [
                  styles.changePasswordBtn,
                  isPhone && styles.fullWidthBtnPhone,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <KeyRound color="#03a675" size={15} />
                <Text style={styles.changePasswordBtnText}>Change password</Text>
              </Pressable>
            </View>

            <View style={styles.securityDivider} />

            {/* Permanently Delete Account Option */}
            <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
              <View style={styles.securityInfoCol}>
                <Text style={[styles.securityTitle, { color: "#D4183D" }]}>
                  Permanently delete account
                </Text>
                <Text style={styles.securityDesc}>
                  Once deleted, your profile, saved properties, and account data will be permanently removed.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Permanently delete account"
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={handleDeleteAccount}
                style={({ pressed }) => [
                  styles.deleteAccountBtn,
                  isPhone && styles.fullWidthBtnPhone,
                  webPointer,
                  pressed && styles.pressed,
                  isDeletingAccount && styles.btnDisabled,
                ]}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator color="#D4183D" size="small" />
                ) : (
                  <>
                    <Trash2 color="#D4183D" size={15} />
                    <Text style={styles.deleteAccountBtnText}>Permanently delete account</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Bottom Actions Row */}
          <View style={[styles.actionRow, isPhone && styles.actionRowPhone]}>
            {/* Logout Button */}
            <Pressable
              accessibilityLabel="Logout"
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                isPhone && styles.logoutBtnPhone,
                webPointer,
                pressed && styles.pressed,
              ]}
            >
              <LogOut color="#D4183D" size={16} />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </Pressable>

            {/* Save changes Button with website theme color */}
            <Pressable
              accessibilityLabel="Save changes"
              accessibilityRole="button"
              disabled={isSaving}
              onPress={handleSaveChanges}
              style={({ pressed }) => [
                styles.saveBtn,
                isPhone && styles.saveBtnPhone,
                webPointer,
                isSaving && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colorTokens.onBrand} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setChangePasswordModalOpen(false)}
        transparent
        visible={changePasswordModalOpen}
      >
        <Pressable
          onPress={() => setChangePasswordModalOpen(false)}
          style={styles.modalBackdrop}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalCard, isPhone && styles.modalCardPhone]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <KeyRound color="#03a675" size={20} />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your current password and a new secure password.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close"
                hitSlop={10}
                onPress={() => setChangePasswordModalOpen(false)}
                style={[styles.modalCloseBtn, webPointer]}
              >
                <X color="#0B1A17" size={18} />
              </Pressable>
            </View>

            {passwordError ? (
              <View style={styles.modalErrorBanner}>
                <Text style={styles.modalErrorText}>{passwordError}</Text>
              </View>
            ) : null}

            {/* Current Password */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalFieldLabel}>Current password</Text>
              <View style={styles.modalInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setCurrentPassword(val);
                    setPasswordError(null);
                  }}
                  placeholder="Enter current password"
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  secureTextEntry={!showCurrentPassword}
                  style={styles.modalTextInput}
                  value={currentPassword}
                />
                <Pressable
                  accessibilityLabel="Toggle show password"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={[styles.eyeBtn, webPointer]}
                >
                  {showCurrentPassword ? (
                    <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                  ) : (
                    <Eye color="rgba(11,26,23,0.5)" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* New Password */}
            <View style={[styles.modalInputGroup, { marginTop: 14 }]}>
              <Text style={styles.modalFieldLabel}>New password</Text>
              <View style={styles.modalInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setNewPassword(val);
                    setPasswordError(null);
                  }}
                  placeholder="At least 6 characters"
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  secureTextEntry={!showNewPassword}
                  style={styles.modalTextInput}
                  value={newPassword}
                />
                <Pressable
                  accessibilityLabel="Toggle show new password"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={[styles.eyeBtn, webPointer]}
                >
                  {showNewPassword ? (
                    <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                  ) : (
                    <Eye color="rgba(11,26,23,0.5)" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={[styles.modalInputGroup, { marginTop: 14 }]}>
              <Text style={styles.modalFieldLabel}>Confirm new password</Text>
              <View style={styles.modalInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    setPasswordError(null);
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.modalTextInput}
                  value={confirmPassword}
                />
                <Pressable
                  accessibilityLabel="Toggle show confirm password"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={[styles.eyeBtn, webPointer]}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                  ) : (
                    <Eye color="rgba(11,26,23,0.5)" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <Pressable
                accessibilityLabel="Cancel"
                disabled={isChangingPassword}
                onPress={() => setChangePasswordModalOpen(false)}
                style={({ pressed }) => [
                  styles.modalCancelBtn,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Save password"
                disabled={isChangingPassword}
                onPress={handleChangePasswordSubmit}
                style={({ pressed }) => [
                  styles.modalSubmitBtn,
                  webPointer,
                  isChangingPassword && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color={colorTokens.onBrand} size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save password</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppChrome>
  );
}
