import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { fonts, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { deleteUser, updateUser, uploadAvatar } from "@/services/userApi";
import type { UploadInput } from "@/services/upload";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
const DEFAULT_NAME = "Fuad Abrar";
const DEFAULT_EMAIL = "fowadabrar10112002@icloud.com";
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
        Alert.alert(
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
        Alert.alert("Success", "Profile photo updated successfully.");
      }
    } catch (err: any) {
      console.warn("Avatar upload error:", err);
      Alert.alert("Notice", "Photo selected. Save changes to keep it.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      Alert.alert(
        "Preview Mode",
        "Sign in to sync your profile updates across all your devices.",
        [
          { text: "Sign In", onPress: () => router.push("/profile" as any) },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }

    try {
      setIsSaving(true);
      await updateUser(user.id, {
        full_name: fullName.trim() || user.full_name,
      });
      await fetchMe();
      Alert.alert("Saved", "Your profile details have been updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
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
      Alert.alert("Success", "Your password has been changed successfully.");
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      Alert.alert("Notice", "No authenticated account to delete in preview mode.");
      return;
    }

    const doDelete = async () => {
      try {
        setIsDeletingAccount(true);
        await deleteUser(user.id);
        await logout();
        router.replace("/home");
        Alert.alert("Account Deleted", "Your account has been permanently removed.");
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to delete account. Please try again.");
      } finally {
        setIsDeletingAccount(false);
      }
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm(
              "Are you sure you want to permanently delete your account? This action cannot be undone."
            )
          : true;
      if (confirmed) {
        await doDelete();
      }
      return;
    }

    Alert.alert(
      "Permanently Delete Account",
      "Are you sure you want to delete your account? All your personal information, saved listings, and history will be permanently erased.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Permanently", style: "destructive", onPress: doDelete },
      ]
    );
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.warn("Logout error:", err);
      }
      router.replace("/home");
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm("Are you sure you want to log out?")
          : true;
      if (!confirmed) return;
      await doLogout();
      return;
    }

    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: doLogout },
    ]);
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
                <ActivityIndicator color="#FFFFFF" size="small" />
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
                  <ActivityIndicator color="#FFFFFF" size="small" />
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

const styles = StyleSheet.create({
  scrollBody: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  scrollBodyPhone: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentWrap: {
    width: "100%",
    maxWidth: 680,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  pageHeaderPhone: {
    gap: 12,
    marginBottom: 18,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 1px 3px rgba(11, 26, 23, 0.04)",
          transition: "all 0.15s ease",
        }
      : {
          elevation: 1,
        }),
  },
  backBtnPhone: {
    height: 36,
    paddingHorizontal: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  pageTitlePhone: {
    fontSize: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 1px 3px rgba(11, 26, 23, 0.03)",
        }
      : {
          elevation: 1,
        }),
  },
  cardPhone: {
    padding: 16,
    borderRadius: 20,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 24,
  },
  profileRowPhone: {
    gap: 14,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E6FAF4",
  },
  avatarWrapPhone: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11, 26, 23, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoCol: {
    flex: 1,
    gap: 5,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  profileName: {
    fontSize: 17,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  buyerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(4, 207, 146, 0.12)",
  },
  buyerBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#03a675",
  },
  changePhotoBtn: {
    alignSelf: "flex-start",
  },
  changePhotoText: {
    fontSize: 13.5,
    fontFamily: fonts.medium,
    color: "#04cf92",
    fontWeight: "600",
  },
  formGroup: {
    width: "100%",
  },
  formGroupSpacing: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    marginBottom: 7,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.04)",
  },
  inputWrapPhone: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    fontFamily: fonts.regular,
    fontWeight: "300",
    color: "rgba(11, 26, 23, 0.45)",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  textInputNormal: {
    fontWeight: "400",
    color: "#0B1A17",
  },
  clearBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  // Security Section
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 6,
  },
  securityRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  securityInfoCol: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  securityDesc: {
    fontSize: 12.5,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 3,
    lineHeight: 18,
  },
  securityDivider: {
    height: 1,
    backgroundColor: "rgba(11,26,23,0.06)",
    marginVertical: 14,
  },
  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(4, 207, 146, 0.35)",
    backgroundColor: "rgba(4, 207, 146, 0.12)",
  },
  changePasswordBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#03a675",
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(212, 24, 61, 0.3)",
    backgroundColor: "#FFF5F6",
  },
  deleteAccountBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  fullWidthBtnPhone: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  // Bottom Action Row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 40,
    width: "100%",
    gap: 12,
  },
  actionRowPhone: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.13,
    borderColor: "rgba(212,24,61,0.3)",
    backgroundColor: "#FFFFFF",
  },
  logoutBtnPhone: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  saveBtn: {
    backgroundColor: "#04cf92",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
  },
  saveBtnPhone: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 110,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Change Password Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 100,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 20px 45px -10px rgba(11, 26, 23, 0.25)",
        }
      : {
          elevation: 10,
        }),
  },
  modalCardPhone: {
    padding: 18,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(4, 207, 146, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
    lineHeight: 18,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalErrorBanner: {
    backgroundColor: "#FFF5F6",
    borderWidth: 1,
    borderColor: "rgba(212, 24, 61, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  modalErrorText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#D4183D",
  },
  modalInputGroup: {
    width: "100%",
  },
  modalFieldLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    marginBottom: 6,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.06)",
  },
  modalTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  eyeBtn: {
    padding: 6,
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F4F6F5",
  },
  modalCancelBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.medium,
    color: "#5C6B66",
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#04cf92",
  },
  modalSubmitBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
