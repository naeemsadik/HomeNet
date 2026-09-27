import { BarChart2, TrendingUp } from "lucide-react-native";
import { Text, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts } from "@/theme";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Analytics tab. */
export function SellerAnalyticsWorkspace() {
  const { isPhone } = useResponsive();
  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={styles.tabHeroIconWrap}>
            <BarChart2 color={colors.green} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              Dhaka Real Estate Market Analytics
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              Illustrative price-per-square-foot trends and buyer demand indexing to help you price and time your listing.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        {[
          { label: "Dhaka Avg Sq Ft", value: "৳ 16,840", sub: "+4.8% YoY", color: colors.green },
          { label: "Avg Days on Market", value: "32 Days", sub: "3 days faster than '25", color: colors.blue },
          { label: "Avg Rental Yield", value: "5.6%", sub: "Annualized gross", color: colors.orange },
          { label: "Market Health Score", value: "88 / 100", sub: "Strong seller market", color: "#0F6D55" },
        ].map((kpi, idx) => (
          <View key={idx} style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
            <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <Text style={styles.kpiSub}>{kpi.sub}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Area Price Trends & Demand Index</Text>
          <Text style={styles.tabCardSub}>Illustrative Dhaka market benchmarks — connect a live market-data feed for figures specific to today</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>Area</Text>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>Avg Price / Sq Ft</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5 }]}>6M Trend</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5 }]}>Buyer Demand</Text>
          </View>

          {[
            { area: "Gulshan", price: "BDT 19,800", trend: "+6.2%", demand: "Very High" },
            { area: "Banani", price: "BDT 17,450", trend: "+4.8%", demand: "High" },
            { area: "Baridhara", price: "BDT 18,900", trend: "+5.1%", demand: "High" },
            { area: "Dhanmondi", price: "BDT 14,200", trend: "+3.7%", demand: "Moderate" },
            { area: "Uttara", price: "BDT 10,850", trend: "+2.9%", demand: "Growing" },
            { area: "Bashundhara", price: "BDT 11,200", trend: "+4.1%", demand: "High" },
            { area: "Mirpur", price: "BDT 8,400", trend: "+2.2%", demand: "Moderate" },
          ].map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowEven]}>
              <Text style={[styles.tableCellTextBold, { flex: 2 }]}>{row.area}</Text>
              <Text style={[styles.tableCellText, { flex: 2 }]}>{row.price}</Text>
              <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <TrendingUp color={colors.green} size={14} />
                <Text style={{ fontSize: 13, fontFamily: fonts.semiBold, color: colors.green }}>{row.trend}</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <View style={styles.demandBadge}>
                  <Text style={styles.demandBadgeText}>{row.demand}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
