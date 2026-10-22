import { BarChart2, TrendingUp } from "@/components/icons";
import { Text, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts } from "@/theme";
import { useTranslation, formatLocalizedNumber } from "@/i18n";
import { styles } from "../screens/SellerDashboardScreen.styles";
import { LiveText } from "@/components/LiveText";

/** Analytics tab. */
export function SellerAnalyticsWorkspace() {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();

  const kpis = [
    {
      label: t("seller.analytics.kpis.avgSqFt"),
      value: t("seller.payments.currencyAmount", { amount: formatLocalizedNumber(16840, language) }),
      sub: t("seller.analytics.kpis.avgSqFtSub"),
      color: colors.green,
    },
    {
      label: t("seller.analytics.kpis.avgDaysOnMarket"),
      value: t("seller.analytics.kpis.avgDaysOnMarketVal", {
        days: formatLocalizedNumber(32, language),
      }),
      sub: t("seller.analytics.kpis.avgDaysOnMarketSub"),
      color: colors.blue,
    },
    {
      label: t("seller.analytics.kpis.avgRentalYield"),
      value: `${formatLocalizedNumber("5.6", language)}%`,
      sub: t("seller.analytics.kpis.avgRentalYieldSub"),
      color: colors.orange,
    },
    {
      label: t("seller.analytics.kpis.marketHealthScore"),
      value: `${formatLocalizedNumber(88, language)} / ${formatLocalizedNumber(100, language)}`,
      sub: t("seller.analytics.kpis.marketHealthScoreSub"),
      color: "#0F6D55",
    },
  ];

  const rows = [
    { area: t("seller.analytics.areas.gulshan"), price: `BDT ${formatLocalizedNumber(19800, language)}`, trend: "+6.2%", demand: t("seller.analytics.demandVeryHigh") },
    { area: t("seller.analytics.areas.banani"), price: `BDT ${formatLocalizedNumber(17450, language)}`, trend: "+4.8%", demand: t("seller.analytics.demandHigh") },
    { area: t("seller.analytics.areas.baridhara"), price: `BDT ${formatLocalizedNumber(18900, language)}`, trend: "+5.1%", demand: t("seller.analytics.demandHigh") },
    { area: t("seller.analytics.areas.dhanmondi"), price: `BDT ${formatLocalizedNumber(14200, language)}`, trend: "+3.7%", demand: t("seller.analytics.demandModerate") },
    { area: t("seller.analytics.areas.uttara"), price: `BDT ${formatLocalizedNumber(10850, language)}`, trend: "+2.9%", demand: t("seller.analytics.demandGrowing") },
    { area: t("seller.analytics.areas.bashundhara"), price: `BDT ${formatLocalizedNumber(11200, language)}`, trend: "+4.1%", demand: t("seller.analytics.demandHigh") },
    { area: t("seller.analytics.areas.mirpur"), price: `BDT ${formatLocalizedNumber(8400, language)}`, trend: "+2.2%", demand: t("seller.analytics.demandModerate") },
  ];

  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={styles.tabHeroIconWrap}>
            <BarChart2 color={colors.green} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              {t("seller.analytics.heroTitle")}
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              {t("seller.analytics.heroSubtitle")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        {kpis.map((kpi, idx) => (
          <View key={idx} style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
            <LiveText style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</LiveText>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <Text style={styles.kpiSub}>{kpi.sub}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.analytics.tableTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.analytics.tableSubtitle")}</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>{t("seller.analytics.colArea")}</Text>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>{t("seller.analytics.colPrice")}</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5 }]}>{t("seller.analytics.colTrend")}</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5 }]}>{t("seller.analytics.colDemand")}</Text>
          </View>

          {rows.map((row, i) => (
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
