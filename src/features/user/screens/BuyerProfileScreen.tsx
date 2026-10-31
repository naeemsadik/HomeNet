import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  CheckCircle2,
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
import { updateUser, uploadAvatar } from "@/services/userApi";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { editProfileSchema } from "@/lib/schemas/user";
import { toApiError } from "@/services/apiClient";
import type { UploadInput } from "@/services/upload";
import { useTranslation } from "@/i18n";
import { UserAvatar } from "@/components/UserAvatar";
import { styles } from "./BuyerProfileScreen.styles";

// Sample values shown (greyed out) in signed-out preview. Never a real person.
const DEFAULT_NAME = "Your name";
const DEFAULT_EMAIL = "you@example.com";

export function BuyerProfileScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { user, logout, fetchMe, changePassword } = useAuthStore();

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || DEFAULT_NAME);
  const [email, setEmail] = useState(user?.email || DEFAULT_EMAIL);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url ?? null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Change Password Modal State
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

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
      // No permission request: the system photo picker needs none. On Android 11-12 the
      // request asked for WRITE_EXTERNAL_STORAGE, which cannot be granted there, and
      // blocked every upload.
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
        notify(t("common.success"), t("userProfile.photoUpdated"));
      }
    } catch (err: any) {
      if (__DEV__) console.warn("Avatar upload error:", err);
      notify(t("common.notice"), t("userProfile.photoNotice"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      const signIn = await confirmAction(
        t("userProfile.previewTitle"),
        t("userProfile.previewMessage"),
        { confirmLabel: t("userProfile.signIn"), cancelLabel: t("userProfile.notNow") },
      );
      if (signIn) router.push("/profile" as any);
      return;
    }

    const validation = editProfileSchema.safeParse({ full_name: fullName });
    if (!validation.success) {
      notify(t("userProfile.validation"), validation.error.issues[0]?.message || t("userProfile.invalidName"));
      return;
    }

    try {
      setIsSaving(true);
      await updateUser(user.id, {
        full_name: validation.data.full_name,
      });
      await fetchMe();
      notify(t("userProfile.saved"), t("userProfile.profileUpdated"));
    } catch (err: any) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setIsSaving(false);
    }
  };


  const handleDeleteAccount = () => {
    if (!user) {
      notify(t("common.notice"), t("userProfile.noAuthAccountToDelete"));
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        if (__DEV__) console.warn("Logout error:", err);
      }
      router.replace("/");
    };

    const confirmed = await confirmAction(t("userProfile.logoutConfirmTitle"), t("userProfile.logoutConfirmMessage"), {
      confirmLabel: t("userProfile.logoutBtn"),
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
              accessibilityLabel={t("userProfile.back")}
              accessibilityRole="button"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/");
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
              <Text style={styles.backBtnText}>{t("userProfile.back")}</Text>
            </Pressable>

            <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>{t("userProfile.pageTitle")}</Text>
          </View>

          {/* Section 1: Personal Information */}
          <View style={[styles.card, isPhone && styles.cardPhone]}>
            <View style={styles.cardHeaderRow}>
              <User color="#0B1A17" size={20} />
              <Text style={styles.cardTitle}>{t("userProfile.personalInfoTitle")}</Text>
            </View>

            {/* Avatar and Name Row */}
            <View style={[styles.profileRow, isPhone && styles.profileRowPhone]}>
              <View style={[styles.avatarWrap, isPhone && styles.avatarWrapPhone]}>
                <UserAvatar name={fullName} size={96} style={styles.avatarImage} uri={avatarUrl} />
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
                    <Text style={styles.buyerBadgeText}>{t("userProfile.buyerBadge")}</Text>
                  </View>
                </View>

                <Pressable
                  accessibilityLabel={t("userProfile.changePhoto")}
                  accessibilityRole="button"
                  onPress={handleAvatarUpload}
                  style={({ pressed }) => [
                    styles.changePhotoBtn,
                    webPointer,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.changePhotoText}>{t("userProfile.changePhoto")}</Text>
                </Pressable>
              </View>
            </View>

            {/* Form Field: Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>{t("userProfile.fullNameLabel")}</Text>
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
                    accessibilityLabel={t("userProfile.clearFullNameAria")}
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
              <Text style={styles.cardTitle}>{t("userProfile.contactInfoTitle")}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>{t("userProfile.emailLabel")}</Text>
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
                    accessibilityLabel={t("userProfile.clearEmailAria")}
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
          </View>

          {/* Section 3: Account Security (Change Password & Permanently Delete Account) */}
          <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
            <View style={styles.cardHeaderRow}>
              <Shield color="#0B1A17" size={20} />
              <Text style={styles.cardTitle}>{t("userProfile.accountSecurityTitle")}</Text>
            </View>

            {/* Change Password Option */}
            <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
              <View style={styles.securityInfoCol}>
                <Text style={styles.securityTitle}>{t("userProfile.passwordLabel")}</Text>
                <Text style={styles.securityDesc}>{t("userProfile.passwordHint")}</Text>
              </View>

              <Pressable
                accessibilityLabel={t("userProfile.changePasswordBtn")}
                accessibilityRole="button"
                onPress={() => setChangePasswordModalOpen(true)}
                style={({ pressed }) => [
                  styles.changePasswordBtn,
                  isPhone && styles.fullWidthBtnPhone,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <KeyRound color="#03a675" size={15} />
                <Text style={styles.changePasswordBtnText}>{t("userProfile.changePasswordBtn")}</Text>
              </Pressable>
            </View>

            <View style={styles.securityDivider} />

            {/* Permanently Delete Account Option */}
            <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
              <View style={styles.securityInfoCol}>
                <Text style={[styles.securityTitle, { color: "#D4183D" }]}>
                  {t("userProfile.deleteAccountTitle")}
                </Text>
                <Text style={styles.securityDesc}>
                  {t("userProfile.deleteAccountDesc")}
                </Text>
              </View>

              <Pressable
                accessibilityLabel={t("userProfile.deleteAccountBtn")}
                accessibilityRole="button"
                onPress={handleDeleteAccount}
                style={({ pressed }) => [
                  styles.deleteAccountBtn,
                  isPhone && styles.fullWidthBtnPhone,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <Trash2 color="#D4183D" size={15} />
                <Text style={styles.deleteAccountBtnText}>{t("userProfile.deleteAccountBtn")}</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom Actions Row */}
          <View style={[styles.actionRow, isPhone && styles.actionRowPhone]}>
            {/* Logout Button */}
            <Pressable
              accessibilityLabel={t("userProfile.logoutBtn")}
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
              <Text style={styles.logoutBtnText}>{t("userProfile.logoutBtn")}</Text>
            </Pressable>

            {/* Save changes Button with website theme color */}
            <Pressable
              accessibilityLabel={t("userProfile.saveChanges")}
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
                <Text style={styles.saveBtnText}>{t("userProfile.saveChanges")}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        onClose={() => setChangePasswordModalOpen(false)}
        visible={changePasswordModalOpen}
      />

      <DeleteAccountDialog
        confirmLabel={t("userProfile.deleteModalConfirm")}
        deletedMessage={t("userProfile.accountDeletedMessage")}
        deletedTitle={t("userProfile.accountDeletedTitle")}
        message={t("userProfile.deleteModalMessage")}
        onClose={() => setDeleteDialogOpen(false)}
        title={t("userProfile.deleteModalTitle")}
        visible={deleteDialogOpen}
      />
    </AppChrome>
  );
}
