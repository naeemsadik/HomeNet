import { BarChart2, CheckCircle2, Sparkles, TrendingUp } from "@/components/icons";
import { Text, View } from "react-native";
import { AiFinderWorkflow } from "@/components/AiFinderWorkflow";
import { useResponsive } from "@/hooks/useResponsive";
import { colors } from "@/theme";
import { useTranslation } from "@/i18n";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** AI Insights tab. */
export function SellerInsightsWorkspace() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();

  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.blueLight }]}>
            <Sparkles color={colors.blue} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              {t("seller.insights.heroTitle")}
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              {t("seller.insights.heroSubtitle")}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.insights.portfolioTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.insights.portfolioSubtitle")}</Text>
        </View>

        <View style={styles.insightsCardsGrid}>
          <View style={styles.insightCard}>
            <View style={[styles.insightCardIcon, { backgroundColor: colors.greenLight }]}>
              <TrendingUp color={colors.green} size={20} />
            </View>
            <Text style={styles.insightCardTitle}>{t("seller.insights.demandCardTitle")}</Text>
            <Text style={styles.insightCardDesc}>
              {t("seller.insights.demandCardDesc")}
            </Text>
            <View style={styles.insightPill}>
              <Text style={styles.insightPillText}>{t("seller.insights.demandCardPill")}</Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightCardIcon, { backgroundColor: colors.blueLight }]}>
              <BarChart2 color={colors.blue} size={20} />
            </View>
            <Text style={styles.insightCardTitle}>{t("seller.insights.priceCardTitle")}</Text>
            <Text style={styles.insightCardDesc}>
              {t("seller.insights.priceCardDesc")}
            </Text>
            <View style={[styles.insightPill, { backgroundColor: colors.blueLight }]}>
              <Text style={[styles.insightPillText, { color: colors.blue }]}>{t("seller.insights.priceCardPill")}</Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightCardIcon, { backgroundColor: colors.orangeLight }]}>
              <CheckCircle2 color={colors.orange} size={20} />
            </View>
            <Text style={styles.insightCardTitle}>{t("seller.insights.qualityCardTitle")}</Text>
            <Text style={styles.insightCardDesc}>
              {t("seller.insights.qualityCardDesc")}
            </Text>
            <View style={[styles.insightPill, { backgroundColor: colors.orangeLight }]}>
              <Text style={[styles.insightPillText, { color: colors.orange }]}>{t("seller.insights.qualityCardPill")}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.insights.matcherTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.insights.matcherSubtitle")}</Text>
        </View>
        <AiFinderWorkflow />
      </View>
    </>
  );
}
