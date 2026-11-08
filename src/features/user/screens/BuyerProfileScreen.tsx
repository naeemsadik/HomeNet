import { ArrowLeft, LogOut, User } from "@/components/icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { confirmAction } from "@/lib/alert";
import { AppChrome } from "@/components/AppChrome";
import { AccountProfileForm, ProfileBadge, profileStyles } from "@/components/accountProfile/AccountProfileForm";
import { useResponsive } from "@/hooks/useResponsive";
import { webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n";
import { styles } from "./BuyerProfileScreen.styles";

/** A buyer's profile, inside the site chrome. The form itself is the one sellers see. */
export function BuyerProfileScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    const confirmed = await confirmAction(t("userProfile.logoutConfirmTitle"), t("userProfile.logoutConfirmMessage"), {
      confirmLabel: t("userProfile.logoutBtn"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await logout();
    } catch (err) {
      if (__DEV__) console.warn("Logout error:", err);
    }
    router.replace("/");
  };

  return (
    <AppChrome active="profile">
      <ScrollView
        contentContainerStyle={[styles.scrollBody, isPhone && styles.scrollBodyPhone]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[profileStyles.contentWrap, styles.pageHeader, isPhone && styles.pageHeaderPhone]}>
          <Pressable
            accessibilityLabel={t("userProfile.back")}
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.push("/"))}
            style={({ pressed }) => [
              styles.backBtn,
              isPhone && styles.backBtnPhone,
              webPointer,
              pressed && profileStyles.pressed,
            ]}
          >
            <ArrowLeft color="#0B1A17" size={17} strokeWidth={2.2} />
            <Text style={styles.backBtnText}>{t("userProfile.back")}</Text>
          </Pressable>
          <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>{t("userProfile.pageTitle")}</Text>
        </View>

        <AccountProfileForm
          badge={<ProfileBadge icon={User} label={t("userProfile.buyerBadge")} tone="neutral" />}
          deleteCopy={{
            description: t("userProfile.deleteAccountDesc"),
            confirmTitle: t("userProfile.deleteModalTitle"),
            confirmMessage: t("userProfile.deleteModalMessage"),
            confirmLabel: t("userProfile.deleteModalConfirm"),
            deletedTitle: t("userProfile.accountDeletedTitle"),
            deletedMessage: t("userProfile.accountDeletedMessage"),
          }}
          footerStart={
            user ? (
              <Pressable
                accessibilityLabel={t("userProfile.logoutBtn")}
                accessibilityRole="button"
                onPress={handleLogout}
                style={({ pressed }) => [profileStyles.logoutBtn, webPointer, pressed && profileStyles.pressed]}
              >
                <LogOut color="#D4183D" size={16} />
                <Text style={profileStyles.logoutBtnText}>{t("userProfile.logoutBtn")}</Text>
              </Pressable>
            ) : undefined
          }
        />
      </ScrollView>
    </AppChrome>
  );
}
