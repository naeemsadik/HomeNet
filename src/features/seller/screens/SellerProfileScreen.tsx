import * as ImagePicker from "expo-image-picker";
import {
  CheckCircle2,
  KeyRound,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  X,
} from "@/components/icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { notify } from "@/lib/alert";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { updateUser, uploadAvatar } from "@/services/userApi";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { toApiError } from "@/services/apiClient";
import { editProfileSchema } from "@/lib/schemas/user";
import type { UploadInput } from "@/services/upload";
import { SellerChangePasswordModal } from "../components/SellerChangePasswordModal";
import { SellerShell } from "../components/SellerShell";
import { useTranslation } from "@/i18n";
import { UserAvatar } from "@/components/UserAvatar";
import { styles } from "./SellerProfileScreen.styles";

// Sample values shown (greyed out) in signed-out preview. Never a real person.
const DEFAULT_NAME = "Your name";
const DEFAULT_EMAIL = "you@example.com";

export function SellerProfileScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { user, fetchMe } = useAuthStore();

  const defaultName = t("seller.profile.defaultName");

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || defaultName);
  const [email, setEmail] = useState(user?.email || DEFAULT_EMAIL);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url ?? null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.email) setEmail(user.email);
      if (user.avatar_url) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const isVerified = Boolean(user && user.id && user.email_verified !== false);

  const isNormalText = (val: string, defaultVal: string) =>
    Boolean(user) || (val.length > 0 && val !== defaultVal);

  const handleBadgePress = () => {
    if (isVerified) {
      notify(
        t("seller.profile.verifiedAlertTitle"),
        t("seller.profile.verifiedAlertMessage")
      );
    } else {
      notify(
        t("seller.profile.unverifiedBadge"),
        t("seller.profile.verificationPendingMessage")
      );
    }
  };

  const handleAvatarUpload = async () => {
    try {
      // No permission request: the system photo picker needs none. On Android 11-12 the
      // request asked for WRITE_EXTERNAL_STORAGE, which cannot be granted there, and
      // blocked every upload.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setAvatarUrl(asset.uri);

      if (user) {
        setIsUploading(true);
        const file: UploadInput = asset.file ?? {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        };
        await uploadAvatar(file, asset.fileName || "avatar.jpg");
        await fetchMe();
        notify(t("common.success"), t("seller.profile.photoUpdated"));
      }
    } catch (err: any) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    const validation = editProfileSchema.safeParse({ full_name: fullName });
    if (!validation.success) {
      notify(t("common.error"), validation.error.issues[0]?.message || t("seller.profile.invalidName"));
      return;
    }

    try {
      setIsSaving(true);
      if (user) {
        await updateUser(user.id, { full_name: validation.data.full_name });
        await fetchMe();
      }
      notify(t("common.success"), t("seller.profile.changesSaved"));
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

  return (
    <SellerShell
      activeNav="profile"
      title={t("seller.profile.title")}
    >
          <View
            style={[
              styles.scrollContent,
              isPhone && styles.scrollContentPhone,
            ]}
          >
            <View style={styles.contentWrap}>
            {/* Section 1: Personal Information */}
            <View style={[styles.card, isPhone && styles.cardPhone]}>
              <View style={styles.cardHeaderRow}>
                <User color="#0B1A17" size={20} />
                <Text style={styles.cardTitle}>{t("seller.profile.personalInfoTitle")}</Text>
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

                    <Pressable
                      accessibilityLabel={
                        isVerified
                          ? t("seller.profile.verifiedSellerAria")
                          : t("seller.profile.unverifiedAria")
                      }
                      accessibilityRole="button"
                      onPress={handleBadgePress}
                      style={({ pressed }) => [
                        isVerified ? styles.verifiedBadge : styles.unverifiedBadge,
                        webPointer,
                        pressed && styles.pressed,
                      ]}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 color="#0F6D55" size={14} />
                          <Text style={styles.verifiedText}>{t("seller.profile.verifiedBadge")}</Text>
                        </>
                      ) : (
                        <>
                          <ShieldAlert color="#D97706" size={14} />
                          <Text style={styles.unverifiedText}>{t("seller.profile.unverifiedBadge")}</Text>
                        </>
                      )}
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityLabel={t("seller.profile.changePhoto")}
                    accessibilityRole="button"
                    onPress={handleAvatarUpload}
                    style={({ pressed }) => [
                      styles.changePhotoBtn,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.changePhotoText}>{t("seller.profile.changePhoto")}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Form Field: Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>{t("seller.profile.fullNameLabel")}</Text>
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
                      accessibilityLabel={t("seller.profile.clearFullNameAria")}
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
                <Text style={styles.cardTitle}>{t("seller.profile.contactInfoTitle")}</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>{t("seller.profile.emailLabel")}</Text>
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
                      accessibilityLabel={t("seller.profile.clearEmailAria")}
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
                <Text style={styles.cardTitle}>{t("seller.profile.accountSecurityTitle")}</Text>
              </View>

              {/* Change Password Option */}
              <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
                <View style={styles.securityInfoCol}>
                  <Text style={styles.securityTitle}>{t("seller.profile.passwordTitle")}</Text>
                  <Text style={styles.securityDesc}>
                    {t("seller.profile.passwordDesc")}
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel={t("seller.profile.changePasswordBtn")}
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
                  <Text style={styles.changePasswordBtnText}>{t("seller.profile.changePasswordBtn")}</Text>
                </Pressable>
              </View>

              <View style={styles.securityDivider} />

              {/* Permanently Delete Account Option */}
              <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
                <View style={styles.securityInfoCol}>
                  <Text style={[styles.securityTitle, { color: "#D4183D" }]}>
                    {t("seller.profile.deleteAccountTitle")}
                  </Text>
                  <Text style={styles.securityDesc}>
                    {t("seller.profile.deleteAccountDesc")}
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel={t("seller.profile.deleteAccountBtn")}
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
                  <Text style={styles.deleteAccountBtnText}>{t("seller.profile.deleteAccountBtn")}</Text>
                </Pressable>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={[styles.actionRow, isPhone && styles.actionRowPhone]}>
              {/* Save changes Button */}
              <Pressable
                accessibilityLabel={t("seller.profile.saveChangesBtn")}
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
                  <Text style={styles.saveBtnText}>{t("seller.profile.saveChangesBtn")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

      <SellerChangePasswordModal
        onClose={() => setChangePasswordModalOpen(false)}
        visible={changePasswordModalOpen}
      />

      <DeleteAccountDialog
        confirmLabel={t("seller.profile.deletePermanentlyBtn")}
        deletedMessage={t("seller.profile.accountDeletedMessage")}
        deletedTitle={t("seller.profile.accountDeletedTitle")}
        message={t("seller.profile.deleteAccountConfirmMessage")}
        onClose={() => setDeleteDialogOpen(false)}
        title={t("seller.profile.deleteAccountConfirmTitle")}
        visible={deleteDialogOpen}
      />
    </SellerShell>
  );
}
