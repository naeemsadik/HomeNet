import { CreditCard } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors } from "@/theme";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Payments tab. */
export function SellerPaymentsWorkspace() {
  const { isPhone } = useResponsive();
  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.blueLight }]}>
            <CreditCard color={colors.blue} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              Seller Payments, Invoices & Payouts
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              Manage your payout accounts, download receipts for boosting packages, and view transaction history.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: colors.green }]}>৳ 0.00</Text>
          <Text style={styles.kpiLabel}>Available Balance</Text>
          <Text style={styles.kpiSub}>Ready for withdrawal</Text>
        </View>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: colors.blue }]}>৳ 0.00</Text>
          <Text style={styles.kpiLabel}>Pending Clearance</Text>
          <Text style={styles.kpiSub}>Processing settlements</Text>
        </View>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: "#0F6D55" }]}>৳ 0.00</Text>
          <Text style={styles.kpiLabel}>Lifetime Earnings</Text>
          <Text style={styles.kpiSub}>Total volume processed</Text>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Payout Methods</Text>
          <Text style={styles.tabCardSub}>Configure automated or manual payouts directly to your local bank or MFS account</Text>
        </View>

        <View style={styles.payoutMethodsRow}>
          <View style={[styles.payoutMethodCard, { borderStyle: "dashed" }]}>
            <View style={styles.payoutCardTop}>
              <Text style={styles.payoutMethodName}>bKash Commercial</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>Not connected</Text>
              </View>
            </View>
            <Text style={styles.payoutAccountNo}>Link a bKash merchant account</Text>
            <Pressable style={styles.connectPayoutBtn}>
              <Text style={styles.connectPayoutBtnText}>Connect</Text>
            </Pressable>
          </View>

          <View style={[styles.payoutMethodCard, { borderStyle: "dashed" }]}>
            <View style={styles.payoutCardTop}>
              <Text style={styles.payoutMethodName}>Bank Transfer (EFTN)</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>Not connected</Text>
              </View>
            </View>
            <Text style={styles.payoutAccountNo}>Local bank account in Bangladesh</Text>
            <Pressable style={styles.connectPayoutBtn}>
              <Text style={styles.connectPayoutBtnText}>Connect</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Billing History & Invoices</Text>
          <Text style={styles.tabCardSub}>Receipts for boost packages, listing verifications, and subscriptions</Text>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <CreditCard color={colors.green} size={26} />
          </View>
          <Text style={styles.emptyTitle}>No Invoices Generated Yet</Text>
          <Text style={styles.emptyDesc}>
            All official VAT invoices and payment receipts will be archived here for instant PDF download.
          </Text>
        </View>
      </View>
    </>
  );
}
