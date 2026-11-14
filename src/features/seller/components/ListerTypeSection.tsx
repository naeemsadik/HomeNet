import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, User } from "@/components/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { confirmAction, notify } from "@/lib/alert";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/services/apiClient";
import { deleteCompanyLogo, getUser, updateUser, uploadCompanyLogo } from "@/services/userApi";
import type { UploadInput } from "@/services/upload";
import type { AccountType } from "@/types/api";
import { styles } from "./ListerTypeSection.styles";

/**
 * Whether the account lists as a person or as a company. A company's name and
 * logo take the place of the person's on every listing card, the way an
 * agent's do on a portal.
 *
 * Two choice cards say what each option means, so no separate explanation is
 * needed; the company fields appear only for a company; Save appears only when
 * something differs from what is saved, so the page never shows two idle
 * primary buttons.
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

  // The fields start from the saved profile once. A refetch after a logo upload
  // must not overwrite a name that is still being typed, so it seeds by user id.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (profile.data && seededFor !== profile.data.id) {
    setSeededFor(profile.data.id);
    setAccountType(profile.data.account_type ?? "individual");
    setCompanyName(profile.data.company_name ?? "");
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["user", userId] });
  const onError = (err: unknown) => notify(t("common.error"), toApiError(err).message);

  const isCompany = accountType === "company";

  const saveLister = useMutation({
    mutationFn: () =>
      updateUser(userId as string, {
        account_type: accountType,
        company_name: isCompany ? companyName.trim() : undefined,
      }),
    onSuccess: async () => {
      await refresh();
      notify(t("common.success"), t("seller.profile.changesSaved"));
    },
    onError,
  });

  const uploadLogo = useMutation({
    mutationFn: (file: UploadInput & { name?: string }) => uploadCompanyLogo(file, file.name || "company-logo.jpg"),
    onSuccess: refresh,
    onError,
  });

  const removeLogo = useMutation({ mutationFn: deleteCompanyLogo, onSuccess: refresh, onError });

  // Nothing to edit while signed out.
  if (!userId) return null;

  const logoUrl = profile.data?.company_logo_url ?? null;
  const logoBusy = uploadLogo.isPending || removeLogo.isPending;
  const savedType = profile.data?.account_type ?? "individual";
  const savedName = profile.data?.company_name ?? "";
  const isDirty = accountType !== savedType || (isCompany && companyName.trim() !== savedName);

  const save = () => {
    if (isCompany && !companyName.trim()) {
      notify(t("common.error"), t("seller.profile.lister.nameRequired"));
      return;
    }
    saveLister.mutate();
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
      uploadLogo.mutate(
        asset.file ?? {
          uri: asset.uri,
          name: asset.fileName || "company-logo.jpg",
          type: asset.mimeType || "image/jpeg",
        },
      );
    } catch (err) {
      onError(err);
    }
  };

  const options: { key: AccountType; label: string; hint: string; Icon: typeof User }[] = [
    {
      key: "individual",
      label: t("seller.profile.lister.individual"),
      hint: t("seller.profile.lister.individualHint"),
      Icon: User,
    },
    {
      key: "company",
      label: t("seller.profile.lister.company"),
      hint: t("seller.profile.lister.companyHint"),
      Icon: Building2,
    },
  ];

  return (
    <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
      <View style={styles.cardHeaderRow}>
        <Building2 color="#0B1A17" size={20} />
        <Text style={styles.cardTitle}>{t("seller.profile.lister.title")}</Text>
      </View>

      {/* Two choices, each saying what it puts on a listing. */}
      <View accessibilityRole="radiogroup" style={[styles.optionRow, isPhone && styles.optionRowPhone]}>
        {options.map(({ key, label, hint, Icon }) => {
          const active = accountType === key;
          return (
            <Pressable
              key={key}
              accessibilityLabel={`${label}. ${hint}`}
              accessibilityRole="radio"
              aria-checked={active} aria-disabled={profile.isLoading}
              // react-native-web ignores accessibilityState.checked.
              {...({ "aria-checked": active } as object)}
              // Until the saved choice arrives, a pick would be overwritten by it.
              disabled={profile.isLoading}
              onPress={() => setAccountType(key)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                webPointer,
                pressed && styles.pressed,
              ]}
            >
              <Icon color={active ? colorTokens.brandText : "#5C6B66"} size={18} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{label}</Text>
                <Text style={styles.optionHint}>{hint}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {isCompany ? (
        <View style={[styles.companyFields, isPhone && styles.companyFieldsPhone]}>
          {/* The logo beside the name it belongs to, round like a profile photo. */}
          <View style={[styles.logoCol, isPhone && styles.logoColPhone]}>
            <Pressable
              accessibilityLabel={logoUrl ? t("seller.profile.lister.changeLogo") : t("seller.profile.lister.addLogo")}
              accessibilityRole="button"
              disabled={logoBusy}
              onPress={pickLogo}
              style={({ pressed }) => [styles.logoTile, webPointer, pressed && styles.pressed]}
            >
              {logoUrl || companyName.trim() ? (
                <UserAvatar name={companyName} size={64} style={styles.avatarImage} uri={logoUrl} />
              ) : (
                <Building2 color={colorTokens.brandText} size={24} />
              )}
              {logoBusy ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              ) : null}
            </Pressable>
            <View style={[styles.logoActions, isPhone && styles.logoActionsPhone]}>
              <Pressable
                accessibilityRole="button"
                disabled={logoBusy}
                hitSlop={8}
                onPress={pickLogo}
                style={webPointer}
              >
                <Text style={styles.linkText}>
                  {logoUrl ? t("seller.profile.lister.changeLogo") : t("seller.profile.lister.addLogo")}
                </Text>
              </Pressable>
              {logoUrl ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={logoBusy}
                  hitSlop={8}
                  onPress={async () => {
                    // Deleting the stored logo cannot be undone, so ask first.
                    const ok = await confirmAction(
                      t("seller.profile.lister.removeLogo"),
                      t("seller.profile.lister.removeLogoConfirm"),
                      { confirmLabel: t("seller.profile.lister.removeLogo"), destructive: true },
                    );
                    if (ok) removeLogo.mutate();
                  }}
                  style={webPointer}
                >
                  <Text style={styles.linkTextMuted}>{t("seller.profile.lister.removeLogo")}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.nameCol}>
            <Text style={styles.fieldLabel}>{t("seller.profile.lister.nameLabel")}</Text>
            <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
              <TextInput
                accessibilityLabel={t("seller.profile.lister.nameLabel")}
                maxLength={150}
                onChangeText={setCompanyName}
                placeholder={t("seller.profile.lister.namePlaceholder")}
                placeholderTextColor="rgba(11,26,23,0.35)"
                style={[styles.textInput, styles.textInputNormal]}
                value={companyName}
              />
            </View>
          </View>
        </View>
      ) : null}

      {isDirty ? (
        <View style={styles.saveRow}>
          <Pressable
            accessibilityRole="button"
            disabled={saveLister.isPending || profile.isLoading}
            onPress={save}
            style={({ pressed }) => [
              styles.saveListerBtn,
              isPhone && styles.fullWidthBtnPhone,
              webPointer,
              saveLister.isPending && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
          >
            {saveLister.isPending ? (
              <ActivityIndicator color={colorTokens.onBrand} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>{t("seller.profile.saveChangesBtn")}</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
