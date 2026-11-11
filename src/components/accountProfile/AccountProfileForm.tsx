import * as ImagePicker from "expo-image-picker";
import { KeyRound, Mail, Shield, Trash2, User, X } from "@/components/icons";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { notify } from "@/lib/alert";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { updateUser, uploadAvatar } from "@/services/userApi";
import { toApiError } from "@/services/apiClient";
import type { UploadInput } from "@/services/upload";
import { editProfileSchema } from "@/lib/schemas/user";
import { useTranslation } from "@/i18n";
import { UserAvatar } from "@/components/UserAvatar";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { badgeTones, profileStyles as styles, type BadgeTone } from "./accountProfileStyles";

/** The pill beside the name: a role ("Buyer") or a state ("Verified"). */
export function ProfileBadge({
  icon: Icon,
  label,
  tone,
  onPress,
  accessibilityLabel,
}: {
  icon: ComponentType<{ color?: string; size?: number }>;
  label: string;
  tone: BadgeTone;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { backgroundColor, color } = badgeTones[tone];
  const content = (
    <>
      <Icon color={color} size={14} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </>
  );
  if (!onPress) {
    return (
      <View accessibilityLabel={accessibilityLabel ?? label} style={[styles.badge, { backgroundColor }]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.badge, { backgroundColor }, webPointer, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

/** What deleting the account removes. A seller also loses their listings, so the words differ. */
export interface DeleteAccountCopy {
  description: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel: string;
  deletedTitle: string;
  deletedMessage: string;
}

export interface AccountProfileFormProps {
  badge: ReactNode;
  deleteCopy: DeleteAccountCopy;
  /** Sections only one role has (a seller's "Listing as"), shown after Personal information. */
  children?: ReactNode;
  /** The left end of the Save row, such as Logout where no shell offers it. */
  footerStart?: ReactNode;
}

/**
 * The account profile shared by buyers and sellers: name and photo, email,
 * password and account deletion. The pages around it differ (the site chrome
 * for a buyer, the seller workspace for a seller); this part does not.
 */
export function AccountProfileForm({ badge, deleteCopy, children, footerStart }: AccountProfileFormProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  // Both routes sit behind RequireAuth, so there is always a user here. A name
  // left empty stays empty: a placeholder never becomes someone's saved name.
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url ?? null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.full_name) setFullName(user.full_name);
    if (user.avatar_url) setAvatarUrl(user.avatar_url);
  }, [user]);

  const saveName = useMutation({
    mutationFn: (full_name: string) => updateUser(user!.id, { full_name }),
    onSuccess: async () => {
      await fetchMe();
      notify(t("userProfile.saved"), t("userProfile.profileUpdated"));
    },
    onError: (err) => notify(t("common.error"), toApiError(err).message),
  });

  const savePhoto = useMutation({
    mutationFn: (file: UploadInput & { name?: string }) => uploadAvatar(file, file.name || "avatar.jpg"),
    onSuccess: async () => {
      await fetchMe();
      notify(t("common.success"), t("userProfile.photoUpdated"));
    },
    onError: (err) => {
      // The photo did not upload: say so, and put the old one back.
      setAvatarUrl(user?.avatar_url ?? null);
      notify(t("common.error"), toApiError(err).message);
    },
  });

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
      if (result.canceled || !result.assets?.[0] || !user) return;

      const asset = result.assets[0];
      setAvatarUrl(asset.uri);
      savePhoto.mutate(
        asset.file ?? {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        },
      );
    } catch (err) {
      notify(t("common.error"), toApiError(err).message);
    }
  };

  const handleSave = () => {
    if (!user) return;
    const validation = editProfileSchema.safeParse({ full_name: fullName });
    if (!validation.success) {
      notify(t("userProfile.validation"), validation.error.issues[0]?.message || t("userProfile.invalidName"));
      return;
    }
    saveName.mutate(validation.data.full_name);
  };

  return (
    <View style={styles.contentWrap}>
      {/* Personal information */}
      <View style={[styles.card, isPhone && styles.cardPhone]}>
        <View style={styles.cardHeaderRow}>
          <User color="#0B1A17" size={20} />
          <Text style={styles.cardTitle}>{t("userProfile.personalInfoTitle")}</Text>
        </View>

        <View style={[styles.profileRow, isPhone && styles.profileRowPhone]}>
          <View style={[styles.avatarWrap, isPhone && styles.avatarWrapPhone]}>
            <UserAvatar name={fullName} size={isPhone ? 60 : 76} style={styles.avatarImage} uri={avatarUrl} />
            {savePhoto.isPending ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            ) : null}
          </View>

          <View style={styles.profileInfoCol}>
            <View style={styles.nameBadgeRow}>
              <Text numberOfLines={1} style={styles.profileName}>
                {fullName || user?.full_name}
              </Text>
              {badge}
            </View>

            <Pressable
              accessibilityLabel={t("userProfile.changePhoto")}
              accessibilityRole="button"
              onPress={handleAvatarUpload}
              style={({ pressed }) => [styles.changePhotoBtn, webPointer, pressed && styles.pressed]}
            >
              <Text style={styles.changePhotoText}>{t("userProfile.changePhoto")}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>{t("userProfile.fullNameLabel")}</Text>
          <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
            <TextInput
              accessibilityLabel={t("userProfile.fullNameLabel")}
              onChangeText={setFullName}
              placeholder={t("seller.profile.defaultName")}
              placeholderTextColor="rgba(11,26,23,0.35)"
              style={styles.textInput}
              value={fullName}
            />
            {fullName.length > 0 ? (
              <Pressable
                accessibilityLabel={t("userProfile.clearFullNameAria")}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setFullName("")}
                style={[styles.clearBtn, webPointer]}
              >
                <X color="rgba(11,26,23,0.4)" size={16} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {children}

      {/* Contact information */}
      <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
        <View style={styles.cardHeaderRow}>
          <Mail color="#0B1A17" size={20} />
          <Text style={styles.cardTitle}>{t("userProfile.contactInfoTitle")}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>{t("userProfile.emailLabel")}</Text>
          <View style={[styles.inputWrap, styles.inputWrapReadOnly, isPhone && styles.inputWrapPhone]}>
            {/* Text, not a locked input: a long address ends in "…" instead of being cut mid-word. */}
            <Text
              accessibilityLabel={`${t("userProfile.emailLabel")}: ${user?.email ?? ""}`}
              ellipsizeMode="middle"
              numberOfLines={1}
              selectable
              style={styles.readOnlyValue}
            >
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Account security */}
      <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
        <View style={styles.cardHeaderRow}>
          <Shield color="#0B1A17" size={20} />
          <Text style={styles.cardTitle}>{t("userProfile.accountSecurityTitle")}</Text>
        </View>

        <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
          <View style={styles.securityInfoCol}>
            <Text style={styles.securityTitle}>{t("userProfile.passwordLabel")}</Text>
            <Text style={styles.securityDesc}>{t("userProfile.passwordHint")}</Text>
          </View>
          <Pressable
            accessibilityLabel={t("userProfile.changePasswordBtn")}
            accessibilityRole="button"
            onPress={() => setChangePasswordOpen(true)}
            style={({ pressed }) => [
              styles.changePasswordBtn,
              isPhone && styles.fullWidthBtnPhone,
              webPointer,
              pressed && styles.pressed,
            ]}
          >
            <KeyRound color="#0F6D55" size={15} />
            <Text style={styles.changePasswordBtnText}>{t("userProfile.changePasswordBtn")}</Text>
          </Pressable>
        </View>

        <View style={styles.securityDivider} />

        <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
          <View style={styles.securityInfoCol}>
            <Text style={[styles.securityTitle, styles.securityTitleDanger]}>
              {t("userProfile.deleteAccountTitle")}
            </Text>
            <Text style={styles.securityDesc}>{deleteCopy.description}</Text>
          </View>
          <Pressable
            accessibilityLabel={t("userProfile.deleteAccountBtn")}
            accessibilityRole="button"
            onPress={() => setDeleteDialogOpen(true)}
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

      <View
        style={[
          styles.actionRow,
          footerStart ? styles.actionRowSplit : null,
          isPhone && styles.actionRowPhone,
        ]}
      >
        {footerStart}
        <Pressable
          accessibilityLabel={t("userProfile.saveChanges")}
          accessibilityRole="button"
          disabled={saveName.isPending}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            isPhone && styles.saveBtnPhone,
            webPointer,
            saveName.isPending && styles.btnDisabled,
            pressed && styles.pressed,
          ]}
        >
          {saveName.isPending ? (
            <ActivityIndicator color={colorTokens.onBrand} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{t("userProfile.saveChanges")}</Text>
          )}
        </Pressable>
      </View>

      <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} visible={changePasswordOpen} />

      <DeleteAccountDialog
        confirmLabel={deleteCopy.confirmLabel}
        deletedMessage={deleteCopy.deletedMessage}
        deletedTitle={deleteCopy.deletedTitle}
        message={deleteCopy.confirmMessage}
        onClose={() => setDeleteDialogOpen(false)}
        title={deleteCopy.confirmTitle}
        visible={deleteDialogOpen}
      />
    </View>
  );
}

export { profileStyles } from "./accountProfileStyles";
