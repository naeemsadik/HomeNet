import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  House,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow, SectionHeader } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";

const areaRows = [
  ["Gulshan", "BDT 19,800", "+6.2%", "Very high"],
  ["Banani", "BDT 17,450", "+4.8%", "High"],
  ["Baridhara", "BDT 18,900", "+5.1%", "High"],
  ["Dhanmondi", "BDT 14,200", "+3.7%", "Moderate"],
  ["Uttara", "BDT 10,850", "+2.9%", "Growing"],
];

export function MarketScreen() {
  const { isPhone, isTablet } = useResponsive();
  const [period, setPeriod] = useState("6 months");

  return (
    <AppChrome active="market">
      <View style={[styles.pageIntro, isPhone && styles.pageIntroPhone]}>
        <View style={styles.introCopy}>
          <Eyebrow style={styles.introEyebrow}>HomeNet intelligence</Eyebrow>
          <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>Dhaka market pulse</Text>
          <Text style={styles.pageDescription}>Current pricing, demand, and neighborhood movement, made easier to read.</Text>
        </View>
        <View style={styles.marketUpdate}><CalendarDays color={colors.muted} size={15} /><Text style={styles.marketUpdateText}>Updated July 28, 2026</Text></View>
      </View>

      <View style={styles.statGrid}>
        {[
          [CircleDollarSign, "Average asking price", "BDT 12,480", "per sq ft", "+4.8%"],
          [Building2, "Active verified homes", "1,284", "across Dhaka", "+8.1%"],
          [Clock3, "Median time listed", "34 days", "before agreement", "-3 days"],
          [House, "Sale-to-list ratio", "96.4%", "prime neighborhoods", "+1.2%"],
        ].map(([Icon, label, value, detail, change]) => {
          const StatIcon = Icon as LucideIcon;
          const down = (change as string).startsWith("-");
          return (
            <View key={label as string} style={[styles.statCard, { width: isPhone || isTablet ? "48.7%" : "24%" }]}>
              <View style={styles.statIcon}><StatIcon color={colors.green} size={19} /></View>
              <Text style={styles.statLabel}>{label as string}</Text>
              <Text style={styles.statValue}>{value as string}</Text>
              <View style={styles.statBottom}><Text style={styles.statDetail}>{detail as string}</Text><View style={styles.change}>{down ? <TrendingDown color="#D06F5F" size={12} /> : <TrendingUp color={colors.green} size={12} />}<Text style={[styles.changeText, down && styles.changeTextDown]}>{change as string}</Text></View></View>
            </View>
          );
        })}
      </View>

      <View style={[styles.dashboard, isTablet && styles.dashboardTablet]}>
        <View style={styles.chartCard}>
          <View style={styles.cardHeading}>
            <View><Eyebrow style={styles.cardEyebrow}>Price movement</Eyebrow><Text style={styles.cardTitle}>Average asking price</Text></View>
            <View style={styles.segmented}>
              {(["3 months", "6 months", "1 year"] as const).map((value, index) => isPhone && index === 0 ? null : (
                <Pressable key={value} onPress={() => setPeriod(value)} style={[styles.segmentButton, period === value && styles.segmentButtonActive, webPointer]}><Text style={[styles.segmentText, period === value && styles.segmentTextActive]}>{value}</Text></Pressable>
              ))}
            </View>
          </View>
          <View style={[styles.lineChart, isPhone && styles.lineChartPhone]}>
            <View style={styles.yLabels}>{["14k", "12k", "10k", "8k"].map((label) => <Text key={label} style={styles.axisLabel}>{label}</Text>)}</View>
            <Svg height="100%" style={styles.svg} viewBox="0 0 700 230" width="100%">
              <Defs><SvgGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><Stop offset="0" stopColor={colors.green} stopOpacity="0.25" /><Stop offset="1" stopColor={colors.green} stopOpacity="0" /></SvgGradient></Defs>
              <Path d="M0,190 C65,176 92,188 145,150 C195,116 235,142 286,115 C338,87 382,100 430,73 C475,49 515,69 558,42 C610,17 648,32 700,15 L700,230 L0,230 Z" fill="url(#areaFill)" />
              <Path d="M0,190 C65,176 92,188 145,150 C195,116 235,142 286,115 C338,87 382,100 430,73 C475,49 515,69 558,42 C610,17 648,32 700,15" fill="none" stroke={colors.green} strokeLinecap="round" strokeWidth={5} />
            </Svg>
            <View style={styles.xLabels}>{["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((label) => <Text key={label} style={styles.axisLabel}>{label}</Text>)}</View>
          </View>
        </View>

        <View style={styles.demandCard}>
          <View style={styles.cardHeading}><View><Eyebrow style={styles.cardEyebrow}>Demand signal</Eyebrow><Text style={styles.cardTitle}>Buyer activity</Text></View><Info color="#91A098" size={16} /></View>
          <View style={styles.orbit}><View style={styles.orbitOne} /><View style={styles.orbitTwo} /><View style={styles.orbitCenter}><TrendingUp color={colors.white} size={22} /><Text style={styles.orbitValue}>High</Text><Text style={styles.orbitLabel}>Current demand</Text></View></View>
          <View style={styles.demandBars}>
            {[["Apartments", 88], ["Houses", 66], ["Condos", 73]].map(([label, value]) => (
              <View key={label as string} style={styles.demandRow}><Text style={styles.demandLabel}>{label as string}</Text><View style={styles.demandTrack}><View style={[styles.demandFill, { width: `${value as number}%` }]} /></View><Text style={styles.demandValue}>{value as number}%</Text></View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.areaSection}>
        <SectionHeader action="Explore homes" eyebrow="Neighborhood comparison" href="/buy" title="Where the market is moving" />
        <ScrollView horizontal={isPhone} showsHorizontalScrollIndicator={false}>
          <View style={[styles.areaTable, isPhone && styles.areaTablePhone]}>
            <View style={[styles.areaRow, styles.areaHead]}><Text style={[styles.areaCell, styles.areaHeadText]}>Area</Text><Text style={[styles.areaCell, styles.areaHeadText]}>Average per sq ft</Text><Text style={[styles.areaCell, styles.areaHeadText]}>12-month change</Text><Text style={[styles.areaCell, styles.areaHeadText]}>Buyer demand</Text><View style={styles.areaArrow} /></View>
            {areaRows.map(([area, price, change, demand]) => (
              <AppLink href={`/buy?area=${area}`} key={area} style={styles.areaRow}>
                <Text style={[styles.areaCell, styles.areaName]}>{area}</Text><Text style={styles.areaCell}>{price}</Text><View style={[styles.areaCell, styles.change]}><TrendingUp color={colors.green} size={12} /><Text style={styles.areaChange}>{change}</Text></View><View style={[styles.areaCell, styles.demandCell]}><View style={[styles.demandDot, demand === "Moderate" && styles.demandDotModerate, demand === "Growing" && styles.demandDotGrowing]} /><Text style={styles.areaCellText}>{demand}</Text></View><View style={styles.areaArrow}><ChevronRight color={colors.muted} size={15} /></View>
              </AppLink>
            ))}
          </View>
        </ScrollView>
      </View>

      <LinearGradient colors={["#EAF7F1", "#EEF3FB"]} end={{ x: 1, y: 0 }} style={[styles.aiNote, isPhone && styles.aiNotePhone]}>
        <View style={styles.aiNoteIcon}><Sparkles color={colors.white} size={20} /></View>
        <View style={styles.aiNoteCopyWrap}><Text style={styles.aiNoteTitle}>What this means for your search</Text><Text style={styles.aiNoteCopy}>Prices are rising steadily, but verified listings in Uttara and Dhanmondi still show room to negotiate. HomeNet flags those opportunities in your results.</Text></View>
        <AppLink href="/ai-finder" style={[styles.aiNoteLink, isPhone && styles.aiNoteLinkPhone]}><Text style={styles.aiNoteLinkText}>Find my best area</Text><ArrowRight color={colors.green} size={15} /></AppLink>
      </LinearGradient>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pageIntro: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 28, paddingTop: 22, paddingBottom: 25 },
  pageIntroPhone: { flexDirection: "column", alignItems: "flex-start", gap: 18, paddingTop: 13 },
  introCopy: { flex: 1 },
  introEyebrow: { marginBottom: 7 },
  pageTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 46, lineHeight: 49, letterSpacing: -2.5 },
  pageTitlePhone: { fontSize: 33, lineHeight: 36, letterSpacing: -1.8 },
  pageDescription: { maxWidth: 580, marginTop: 9, color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
  marketUpdate: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  marketUpdateText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 8 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { padding: 17, borderRadius: 14, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  statIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.greenLight },
  statLabel: { marginTop: 13, marginBottom: 5, color: colors.muted, fontFamily: fonts.regular, fontSize: 8 },
  statValue: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 19, letterSpacing: -0.8 },
  statBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5, marginTop: 8 },
  statDetail: { color: "#899790", fontFamily: fonts.regular, fontSize: 7 },
  change: { flexDirection: "row", alignItems: "center", gap: 3 },
  changeText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 7 },
  changeTextDown: { color: "#D06F5F" },
  dashboard: { flexDirection: "row", alignItems: "stretch", gap: 15, marginTop: 18 },
  dashboardTablet: { flexDirection: "column" },
  chartCard: { flex: 1.45, padding: 21, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  demandCard: { flex: 0.55, padding: 21, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  cardHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  cardEyebrow: { marginBottom: 4 },
  cardTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 15, letterSpacing: -0.5 },
  segmented: { flexDirection: "row", gap: 3, padding: 3, borderRadius: 9, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  segmentButton: { minHeight: 29, justifyContent: "center", paddingHorizontal: 10, borderRadius: 6 },
  segmentButtonActive: { backgroundColor: colors.white },
  segmentText: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 8 },
  segmentTextActive: { color: colors.greenDark },
  lineChart: { position: "relative", height: 285, marginTop: 21, paddingTop: 5, paddingRight: 0, paddingBottom: 25, paddingLeft: 38 },
  lineChartPhone: { height: 230 },
  svg: { overflow: "visible" },
  yLabels: { position: "absolute", top: 0, bottom: 24, left: 0, justifyContent: "space-between" },
  xLabels: { position: "absolute", right: 0, bottom: 0, left: 38, flexDirection: "row", justifyContent: "space-between" },
  axisLabel: { color: "#95A29C", fontFamily: fonts.regular, fontSize: 7 },
  orbit: { position: "relative", width: 178, height: 178, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 14 },
  orbitOne: { position: "absolute", top: 7, right: 7, bottom: 7, left: 7, borderRadius: 90, borderWidth: 1, borderColor: "rgba(8,122,91,0.15)" },
  orbitTwo: { position: "absolute", top: 26, right: 26, bottom: 26, left: 26, borderRadius: 90, backgroundColor: "rgba(226,245,237,0.48)", borderWidth: 1, borderColor: "rgba(8,122,91,0.15)" },
  orbitCenter: { width: 95, height: 95, alignItems: "center", justifyContent: "center", borderRadius: 48, backgroundColor: colors.green },
  orbitValue: { marginTop: 4, color: colors.white, fontFamily: fonts.extraBold, fontSize: 15 },
  orbitLabel: { color: "rgba(255,255,255,0.72)", fontFamily: fonts.regular, fontSize: 6 },
  demandBars: { gap: 10 },
  demandRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  demandLabel: { width: 66, color: colors.ink, fontFamily: fonts.regular, fontSize: 7 },
  demandTrack: { minWidth: 0, flex: 1, height: 5, overflow: "hidden", borderRadius: 99, backgroundColor: "#E8EEEB" },
  demandFill: { height: "100%", borderRadius: 99, backgroundColor: colors.green },
  demandValue: { width: 28, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 7, textAlign: "right" },
  areaSection: { marginTop: 45 },
  areaTable: { width: "100%", overflow: "hidden", borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  areaTablePhone: { width: 650 },
  areaRow: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 17, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  areaHead: { minHeight: 42, backgroundColor: "#F6F9F7" },
  areaCell: { flex: 1, color: "#60736A", fontFamily: fonts.regular, fontSize: 8 },
  areaHeadText: { color: "#87958E", fontFamily: fonts.extraBold, fontSize: 7, textTransform: "uppercase" },
  areaName: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 9 },
  areaChange: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 8 },
  demandCell: { flexDirection: "row", alignItems: "center", gap: 6 },
  areaCellText: { color: "#60736A", fontFamily: fonts.regular, fontSize: 8 },
  demandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  demandDotModerate: { backgroundColor: "#D9A657" },
  demandDotGrowing: { backgroundColor: colors.blue },
  areaArrow: { width: 24, alignItems: "flex-end" },
  aiNote: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 24, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: "#DFEAE5" },
  aiNotePhone: { flexWrap: "wrap" },
  aiNoteIcon: { width: 41, height: 41, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.green },
  aiNoteCopyWrap: { minWidth: 0, flex: 1 },
  aiNoteTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 10 },
  aiNoteCopy: { marginTop: 4, color: colors.muted, fontFamily: fonts.regular, fontSize: 8, lineHeight: 12 },
  aiNoteLink: { flexDirection: "row", alignItems: "center", gap: 5 },
  aiNoteLinkPhone: { marginLeft: 55 },
  aiNoteLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 8 },
});
