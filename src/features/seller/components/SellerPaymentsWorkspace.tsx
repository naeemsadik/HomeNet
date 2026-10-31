import { CreditCard } from "@/components/icons";
import { Pressable, Text, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, webPointer } from "@/theme";
import { notify } from "@/lib/alert";
import { useTranslation, formatLocalizedNumber } from "@/i18n";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Payments tab. */
export function SellerPaymentsWorkspace() {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();

  const zeroAmount = t("seller.payments.currencyAmount", { amount: formatLocalizedNumber("0.00", language) });

  const handleConnectPayout = (method: string) => {
    notify(t("common.notice"), `${method} integration is currently in sandbox demo mode.`);
  };

  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.blueLight }]}>
            <CreditCard color={colors.blue} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              {t("seller.payments.heroTitle")}
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              {t("seller.payments.heroSubtitle")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: colors.green }]}>{zeroAmount}</Text>
          <Text style={styles.kpiLabel}>{t("seller.payments.availableBalance")}</Text>
          <Text style={styles.kpiSub}>{t("seller.payments.readyForWithdrawal")}</Text>
        </View>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: colors.blue }]}>{zeroAmount}</Text>
          <Text style={styles.kpiLabel}>{t("seller.payments.pendingClearance")}</Text>
          <Text style={styles.kpiSub}>{t("seller.payments.processingSettlements")}</Text>
        </View>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: "#0F6D55" }]}>{zeroAmount}</Text>
          <Text style={styles.kpiLabel}>{t("seller.payments.lifetimeEarnings")}</Text>
          <Text style={styles.kpiSub}>{t("seller.payments.totalVolumeProcessed")}</Text>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.payments.payoutMethodsTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.payments.payoutMethodsSubtitle")}</Text>
        </View>

        <View style={styles.payoutMethodsRow}>
          <View style={[styles.payoutMethodCard, { borderStyle: "dashed" }]}>
            <View style={styles.payoutCardTop}>
              <Text style={styles.payoutMethodName}>{t("seller.payments.bkashCommercial")}</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>{t("seller.payments.notConnected")}</Text>
              </View>
            </View>
            <Text style={styles.payoutAccountNo}>{t("seller.payments.linkBkash")}</Text>
            <Pressable
              onPress={() => handleConnectPayout("bKash")}
              style={[styles.connectPayoutBtn, webPointer]}
            >
              <Text style={styles.connectPayoutBtnText}>{t("seller.payments.connectBtn")}</Text>
            </Pressable>
          </View>

          <View style={[styles.payoutMethodCard, { borderStyle: "dashed" }]}>
            <View style={styles.payoutCardTop}>
              <Text style={styles.payoutMethodName}>{t("seller.payments.bankTransfer")}</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>{t("seller.payments.notConnected")}</Text>
              </View>
            </View>
            <Text style={styles.payoutAccountNo}>{t("seller.payments.localBank")}</Text>
            <Pressable
              onPress={() => handleConnectPayout("Bank Transfer")}
              style={[styles.connectPayoutBtn, webPointer]}
            >
              <Text style={styles.connectPayoutBtnText}>{t("seller.payments.connectBtn")}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.payments.billingHistoryTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.payments.billingHistorySubtitle")}</Text>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <CreditCard color={colors.green} size={26} />
          </View>
          <Text style={styles.emptyTitle}>{t("seller.payments.noInvoicesTitle")}</Text>
          <Text style={styles.emptyDesc}>
            {t("seller.payments.noInvoicesDesc")}
          </Text>
        </View>
      </View>
    </>
  );
}
