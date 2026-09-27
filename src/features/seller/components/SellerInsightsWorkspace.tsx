import { BarChart2, CheckCircle2, Sparkles, TrendingUp } from "lucide-react-native";
import { Text, View } from "react-native";
import { AiFinderWorkflow } from "@/components/AiFinderWorkflow";
import { useResponsive } from "@/hooks/useResponsive";
import { colors } from "@/theme";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** AI Insights tab. */
export function SellerInsightsWorkspace() {
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
              AI Market & Property Match Insights
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              Intelligent AI algorithms connecting your listings with high-intent buyers, optimizing pricing, and suggesting listing improvements.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Live Portfolio Intelligence</Text>
          <Text style={styles.tabCardSub}>Sample insights illustrating what HomeNet's AI matching engine surfaces once it has enough activity on your listings</Text>
        </View>

        <View style={styles.insightsCardsGrid}>
          <View style={styles.insightCard}>
            <View style={[styles.insightCardIcon, { backgroundColor: colors.greenLight }]}>
              <TrendingUp color={colors.green} size={20} />
            </View>
            <Text style={styles.insightCardTitle}>High Buyer Demand in Gulshan</Text>
            <Text style={styles.insightCardDesc}>
              Over 48 verified buyers searched for 3-4 bedroom apartments in Gulshan and Banani in the past 7 days. Listings in this range receive 3x more contact requests.
            </Text>
            <View style={styles.insightPill}>
              <Text style={styles.insightPillText}>Demand Surge: +34%</Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightCardIcon, { backgroundColor: colors.blueLight }]}>
              <BarChart2 color={colors.blue} size={20} />
            </View>
            <Text style={styles.insightCardTitle}>Competitive Price Guidance</Text>
            <Text style={styles.insightCardDesc}>
              Properties priced between BDT 1.6 Cr – 2.2 Cr in central Dhaka have closed 2.4x faster than above-market peers this quarter. Review your listing pricing.
            </Text>
            <View style={[styles.insightPill, { backgroundColor: colors.blueLight }]}>
              <Text style={[styles.insightPillText, { color: colors.blue }]}>Optimal Closing Range</Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightCardIcon, { backgroundColor: colors.orangeLight }]}>
              <CheckCircle2 color={colors.orange} size={20} />
            </View>
            <Text style={styles.insightCardTitle}>Listing Quality Score</Text>
            <Text style={styles.insightCardDesc}>
              Listings with verified floorplans, high-res photos, and complete amenity tags retain buyers 42% longer on page. Submit documents in Verification Center.
            </Text>
            <View style={[styles.insightPill, { backgroundColor: colors.orangeLight }]}>
              <Text style={[styles.insightPillText, { color: colors.orange }]}>Verification Priority</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Interactive AI Property Matcher</Text>
          <Text style={styles.tabCardSub}>Explore buyer preferences or match properties live</Text>
        </View>
        <AiFinderWorkflow />
      </View>
    </>
  );
}
