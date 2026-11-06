import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, User } from "@/components/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { notify } from "@/lib/alert";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/services/apiClient";
import { deleteCompanyLogo, getUser, updateUser, uploadCompanyLogo } from "@/services/userApi";
import type { UploadInput } from "@/services/upload";
import type { AccountType } from "@/types/api";
import { styles } from "../screens/SellerProfileScreen.styles";

/**
 * Whether the account lists as a person or as a company. A company's name and
 * logo take the place of the person's on every listing card, the way an
 * agent's do on a portal. Server data comes from the users API through TanStack
 * Query; the form fields are local until Save.
 */
export function ListerTypeSection() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => (await getUser(userId as string)).data,
    enabled: Boolean(userId),
  });

  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [companyName, setCompanyName] = useState("");
  const [busy, setBusy] = useState<"save" | "logo" | null>(null);

  // The fields start from the saved profile once. A refetch after a logo upload
  // must not overwrite a name that is still being typed, so it seeds by user id.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (profile.data && seededFor !== profile.data.id) {
    setSeededFor(profile.data.id);
    setAccountType(profile.data.account_type ?? "individual");
    setCompanyName(profile.data.company_name ?? "");
  }

  // Nothing to edit while signed out.
  if (!userId) return null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["user", userId] });
  const isCompany = accountType === "company";
  const logoUrl = profile.data?.company_logo_url ?? null;

  const save = async () => {
    if (isCompany && !companyName.trim()) {
      notify(t("common.error"), t("seller.profile.lister.nameRequired"));
      return;
    }
    try {
      setBusy("save");
      await updateUser(userId, {
        account_type: accountType,
        company_name: isCompany ? companyName.trim() : undefined,
      });
      await refresh();
      notify(t("common.success"), t("seller.profile.changesSaved"));
    } catch (err) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setBusy(null);
    }
  };

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setBusy("logo");
      const file: UploadInput = asset.file ?? {
        uri: asset.uri,
        name: asset.fileName || "company-logo.jpg",
        type: asset.mimeType || "image/jpeg",
      };
      await uploadCompanyLogo(file, asset.fileName || "company-logo.jpg");
      await refresh();
    } catch (err) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setBusy(null);
    }
  };

  const removeLogo = async () => {
    try {
      setBusy("logo");
      await deleteCompanyLogo();
      await refresh();
    } catch (err) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setBusy(null);
    }
  };

  const options: { key: AccountType; label: string; Icon: typeof User }[] = [
    { key: "individual", label: t("seller.profile.lister.individual"), Icon: User },
    { key: "company", label: t("seller.profile.lister.company"), Icon: Building2 },
  ];

  return (
    <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{t("seller.profile.lister.title")}</Text>
      </View>
      <Text style={styles.securityDesc}>{t("seller.profile.lister.desc")}</Text>

      <View style={[styles.formGroup, { flexDirection: "row", gap: 10 }]}>
        {options.map(({ key, label, Icon }) => {
          const active = accountType === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              // react-native-web ignores accessibilityState.checked.
              {...({ "aria-checked": active } as object)}
              onPress={() => setAccountType(key)}
              style={[
                styles.changePasswordBtn,
                { flex: 1, flexDirection: "row", gap: 8, justifyContent: "center" },
                active && { borderColor: colorTokens.brand, backgroundColor: colorTokens.brandSurface },
                webPointer,
              ]}
            >
              <Icon color={active ? colorTokens.brandText : colorTokens.body} size={17} />
              <Text style={styles.changePhotoText}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isCompany ? (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{t("seller.profile.lister.nameLabel")}</Text>
            <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
              <TextInput
                maxLength={150}
                onChangeText={setCompanyName}
                placeholder={t("seller.profile.lister.namePlaceholder")}
                placeholderTextColor="rgba(11,26,23,0.35)"
                style={[styles.textInput, styles.textInputNormal]}
                value={companyName}
              />
            </View>
          </View>

          <View style={[styles.formGroup, { flexDirection: "row", alignItems: "center", gap: 14 }]}>
            <UserAvatar name={companyName || "?"} size={56} uri={logoUrl} />
            <Pressable
              accessibilityRole="button"
              disabled={busy === "logo"}
              onPress={pickLogo}
              style={[styles.changePhotoBtn, webPointer]}
            >
              {busy === "logo" ? (
                <ActivityIndicator size="small" color={colorTokens.ink} />
              ) : (
                <Text style={styles.changePhotoText}>
                  {logoUrl ? t("seller.profile.lister.changeLogo") : t("seller.profile.lister.addLogo")}
                </Text>
              )}
            </Pressable>
            {logoUrl ? (
              <Pressable
                accessibilityRole="button"
                disabled={busy === "logo"}
                onPress={removeLogo}
                style={[styles.changePhotoBtn, webPointer]}
              >
                <Text style={styles.changePhotoText}>{t("seller.profile.lister.removeLogo")}</Text>
              </Pressable>
            ) : null}
          </View>
        </>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy !== null || profile.isLoading}
        onPress={save}
        style={[styles.saveBtn, isPhone && styles.saveBtnPhone, webPointer, busy !== null && styles.btnDisabled]}
      >
        {busy === "save" ? (
          <ActivityIndicator color={colorTokens.onBrand} size="small" />
        ) : (
          <Text style={styles.saveBtnText}>{t("seller.profile.saveChangesBtn")}</Text>
        )}
      </Pressable>
    </View>
  );
}
