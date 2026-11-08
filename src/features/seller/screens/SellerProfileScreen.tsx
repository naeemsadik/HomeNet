import { CheckCircle2, ShieldAlert } from "@/components/icons";
import { View } from "react-native";
import { notify } from "@/lib/alert";
import { AccountProfileForm, ProfileBadge } from "@/components/accountProfile/AccountProfileForm";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n";
import { ListerTypeSection } from "../components/ListerTypeSection";
import { SellerShell } from "../components/SellerShell";
import { styles } from "./SellerProfileScreen.styles";

/** A seller's profile, inside the seller workspace: the shared form plus "Listing as". */
export function SellerProfileScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);

  // Only a confirmed true counts: an account whose payload has no email_verified is not verified.
  const isVerified = user?.email_verified === true;

  const badge = isVerified ? (
    <ProfileBadge
      accessibilityLabel={t("seller.profile.verifiedSellerAria")}
      icon={CheckCircle2}
      label={t("seller.profile.verifiedBadge")}
      onPress={() => notify(t("seller.profile.verifiedAlertTitle"), t("seller.profile.verifiedAlertMessage"))}
      tone="positive"
    />
  ) : (
    <ProfileBadge
      accessibilityLabel={t("seller.profile.unverifiedAria")}
      icon={ShieldAlert}
      label={t("seller.profile.unverifiedBadge")}
      onPress={() => notify(t("seller.profile.unverifiedBadge"), t("seller.profile.verificationPendingMessage"))}
      tone="warning"
    />
  );

  return (
    <SellerShell activeNav="profile" title={t("seller.profile.title")}>
      <View style={[styles.scrollContent, isPhone && styles.scrollContentPhone]}>
        <AccountProfileForm
          badge={badge}
          deleteCopy={{
            description: t("seller.profile.deleteAccountDesc"),
            confirmTitle: t("seller.profile.deleteAccountConfirmTitle"),
            confirmMessage: t("seller.profile.deleteAccountConfirmMessage"),
            confirmLabel: t("seller.profile.deletePermanentlyBtn"),
            deletedTitle: t("seller.profile.accountDeletedTitle"),
            deletedMessage: t("seller.profile.accountDeletedMessage"),
          }}
        >
          <ListerTypeSection />
        </AccountProfileForm>
      </View>
    </SellerShell>
  );
}
