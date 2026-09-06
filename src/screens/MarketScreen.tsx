import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  House,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow, SectionHeader } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 6, 28)); // July 28, 2026
  const [viewingMonth, setViewingMonth] = useState<number>(6); // July
  const [viewingYear, setViewingYear] = useState<number>(2026);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewingYear, viewingMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewingYear, viewingMonth, 0).getDate();

    const cells: { day: number; type: "prev" | "current" | "next" }[] = [];

    // Prev month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, type: "prev" });
    }
    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      cells.push({ day: i, type: "current" });
    }
    // Next month filler days to complete row
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, type: "next" });
    }
    return cells;
  }, [viewingYear, viewingMonth]);

  const handlePrevMonth = () => {
    if (viewingMonth === 0) {
      setViewingMonth(11);
      setViewingYear((prev) => prev - 1);
    } else {
      setViewingMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewingMonth === 11) {
      setViewingMonth(0);
      setViewingYear((prev) => prev + 1);
    } else {
      setViewingMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDate(new Date(viewingYear, viewingMonth, day));
    setCalendarOpen(false);
  };

  return (
    <AppChrome active="market">
      <View style={[styles.pageIntro, isPhone && styles.pageIntroPhone]}>
        <View style={styles.introCopy}>
          <Eyebrow style={styles.introEyebrow}>HomeNet intelligence</Eyebrow>
          <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>Dhaka market pulse</Text>
          <Text style={styles.pageDescription}>Current pricing, demand, and neighborhood movement, made easier to read.</Text>
        </View>
        <Pressable
          onPress={() => {
            setViewingMonth(selectedDate.getMonth());
            setViewingYear(selectedDate.getFullYear());
            setCalendarOpen(true);
          }}
          style={[styles.marketUpdate, webPointer]}
          accessibilityRole="button"
          accessibilityLabel={`Updated date: ${formattedDate}. Click to choose report date`}
        >
          <CalendarDays color="#0F6D55" size={16} />
          <Text style={styles.marketUpdateText}>Updated {formattedDate}</Text>
          <ChevronDown color="#5C6B66" size={14} />
        </Pressable>
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
          <View style={styles.orbit}><View style={styles.orbitOne} /><View style={styles.orbitTwo} /><View style={styles.orbitCenter}><TrendingUp color={colors.white} size={20} /><Text style={styles.orbitValue}>High</Text><Text style={styles.orbitLabel}>Current demand</Text></View></View>
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

      {/* Calendar Snapshot Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setCalendarOpen(false)}
        transparent
        visible={calendarOpen}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            onPress={() => setCalendarOpen(false)}
            style={styles.modalBackdropTouch}
          />
          <View style={styles.calendarModalCard}>
            {/* Modal Header */}
            <View style={styles.calModalHeader}>
              <View style={styles.calHeaderTitleWrap}>
                <View style={styles.calIconWrap}>
                  <CalendarDays color="#0F6D55" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.calModalTitle}>Market Report Date</Text>
                  <Text style={styles.calModalSubtitle}>
                    Select a snapshot date to view historical pulse
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setCalendarOpen(false)}
                style={[styles.calCloseBtn, webPointer]}
                accessibilityLabel="Close calendar"
              >
                <X color="#5C6B66" size={18} />
              </Pressable>
            </View>

            {/* Quick Presets */}
            <View style={styles.calPresetsRow}>
              {[
                { label: "Live (Today)", date: new Date() },
                { label: "July 28, 2026", date: new Date(2026, 6, 28) },
                { label: "End of Q2", date: new Date(2026, 5, 30) },
                { label: "End of Q1", date: new Date(2026, 2, 31) },
              ].map((preset) => {
                const isSelected =
                  selectedDate.toDateString() === preset.date.toDateString();
                return (
                  <Pressable
                    key={preset.label}
                    onPress={() => {
                      setSelectedDate(preset.date);
                      setViewingMonth(preset.date.getMonth());
                      setViewingYear(preset.date.getFullYear());
                      setCalendarOpen(false);
                    }}
                    style={[
                      styles.calPresetChip,
                      isSelected && styles.calPresetChipActive,
                      webPointer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calPresetText,
                        isSelected && styles.calPresetTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNavRow}>
              <Pressable
                onPress={handlePrevMonth}
                style={[styles.monthNavBtn, webPointer]}
                accessibilityLabel="Previous month"
              >
                <ChevronLeft color="#0B1A17" size={18} />
              </Pressable>
              <Text style={styles.monthYearTitle}>
                {MONTH_NAMES[viewingMonth]} {viewingYear}
              </Text>
              <Pressable
                onPress={handleNextMonth}
                style={[styles.monthNavBtn, webPointer]}
                accessibilityLabel="Next month"
              >
                <ChevronRight color="#0B1A17" size={18} />
              </Pressable>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdaysRow}>
              {WEEKDAY_NAMES.map((wd) => (
                <Text key={wd} style={styles.weekdayText}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarCells.map((cell, idx) => {
                if (cell.type === "prev" || cell.type === "next") {
                  return (
                    <View key={`${cell.type}-${idx}`} style={styles.dayCellMuted}>
                      <Text style={styles.dayTextMuted}>{cell.day}</Text>
                    </View>
                  );
                }
                const isSelected =
                  selectedDate.getDate() === cell.day &&
                  selectedDate.getMonth() === viewingMonth &&
                  selectedDate.getFullYear() === viewingYear;
                const isToday =
                  new Date().getDate() === cell.day &&
                  new Date().getMonth() === viewingMonth &&
                  new Date().getFullYear() === viewingYear;

                return (
                  <Pressable
                    key={`current-${cell.day}`}
                    onPress={() => handleSelectDay(cell.day)}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellActive,
                      isToday && !isSelected && styles.dayCellToday,
                      webPointer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextActive,
                        isToday && !isSelected && styles.dayTextToday,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Modal Footer */}
            <View style={styles.calModalFooter}>
              <Pressable
                onPress={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setViewingMonth(today.getMonth());
                  setViewingYear(today.getFullYear());
                  setCalendarOpen(false);
                }}
                style={[styles.calTodayBtn, webPointer]}
              >
                <Sparkles color="#0F6D55" size={14} />
                <Text style={styles.calTodayBtnText}>Reset to Live Pulse</Text>
              </Pressable>
              <Pressable
                onPress={() => setCalendarOpen(false)}
                style={[styles.calDoneBtn, webPointer]}
              >
                <Text style={styles.calDoneBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  pageDescription: { maxWidth: 580, marginTop: 9, color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  marketUpdate: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  marketUpdateText: { color: colors.ink, fontFamily: fonts.medium, fontSize: 13 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { padding: 18, borderRadius: 14, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  statIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.greenLight },
  statLabel: { marginTop: 12, marginBottom: 4, color: colors.muted, fontFamily: fonts.semiBold, fontSize: 13 },
  statValue: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 22, letterSpacing: -0.8 },
  statBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 8 },
  statDetail: { color: "#899790", fontFamily: fonts.regular, fontSize: 12 },
  change: { flexDirection: "row", alignItems: "center", gap: 4 },
  changeText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 12 },
  changeTextDown: { color: "#D06F5F" },
  dashboard: { flexDirection: "row", alignItems: "stretch", gap: 15, marginTop: 18 },
  dashboardTablet: { flexDirection: "column" },
  chartCard: { flex: 1.45, padding: 22, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  demandCard: { flex: 0.55, padding: 22, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  cardHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  cardEyebrow: { marginBottom: 4 },
  cardTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 18, letterSpacing: -0.5 },
  segmented: { flexDirection: "row", gap: 3, padding: 3, borderRadius: 9, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  segmentButton: { minHeight: 32, justifyContent: "center", paddingHorizontal: 12, borderRadius: 6 },
  segmentButtonActive: { backgroundColor: colors.white },
  segmentText: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 12 },
  segmentTextActive: { color: colors.greenDark },
  lineChart: { position: "relative", height: 285, marginTop: 21, paddingTop: 5, paddingRight: 0, paddingBottom: 25, paddingLeft: 42 },
  lineChartPhone: { height: 230 },
  svg: { overflow: "visible" },
  yLabels: { position: "absolute", top: 0, bottom: 24, left: 0, justifyContent: "space-between" },
  xLabels: { position: "absolute", right: 0, bottom: 0, left: 42, flexDirection: "row", justifyContent: "space-between" },
  axisLabel: { color: "#7B8A83", fontFamily: fonts.medium, fontSize: 12 },
  orbit: { position: "relative", width: 184, height: 184, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 16 },
  orbitOne: { position: "absolute", top: 6, right: 6, bottom: 6, left: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(8,122,91,0.15)" },
  orbitTwo: { position: "absolute", top: 24, right: 24, bottom: 24, left: 24, borderRadius: 999, backgroundColor: "rgba(226,245,237,0.48)", borderWidth: 1, borderColor: "rgba(8,122,91,0.15)" },
  orbitCenter: { width: 114, height: 114, alignItems: "center", justifyContent: "center", borderRadius: 57, backgroundColor: colors.green, paddingHorizontal: 10 },
  orbitValue: { marginTop: 2, color: colors.white, fontFamily: fonts.extraBold, fontSize: 18, lineHeight: 22 },
  orbitLabel: { marginTop: 1, color: "rgba(255,255,255,0.9)", fontFamily: fonts.medium, fontSize: 10.5, textAlign: "center" },
  demandBars: { gap: 10 },
  demandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  demandLabel: { width: 85, color: colors.ink, fontFamily: fonts.medium, fontSize: 13 },
  demandTrack: { minWidth: 0, flex: 1, height: 6, overflow: "hidden", borderRadius: 99, backgroundColor: "#E8EEEB" },
  demandFill: { height: "100%", borderRadius: 99, backgroundColor: colors.green },
  demandValue: { width: 36, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 13, textAlign: "right" },
  areaSection: { marginTop: 45 },
  areaTable: { width: "100%", overflow: "hidden", borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  areaTablePhone: { width: 650 },
  areaRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  areaHead: { minHeight: 46, backgroundColor: "#F6F9F7" },
  areaCell: { flex: 1, color: "#3D4F46", fontFamily: fonts.regular, fontSize: 14 },
  areaHeadText: { color: "#5F7167", fontFamily: fonts.extraBold, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  areaName: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 15 },
  areaChange: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 13 },
  demandCell: { flexDirection: "row", alignItems: "center", gap: 6 },
  areaCellText: { color: "#3D4F46", fontFamily: fonts.medium, fontSize: 13 },
  demandDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  demandDotModerate: { backgroundColor: "#D9A657" },
  demandDotGrowing: { backgroundColor: colors.blue },
  areaArrow: { width: 24, alignItems: "flex-end" },
  aiNote: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 24, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: "#DFEAE5" },
  aiNotePhone: { flexWrap: "wrap" },
  aiNoteIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.green },
  aiNoteCopyWrap: { minWidth: 0, flex: 1 },
  aiNoteTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 16 },
  aiNoteCopy: { marginTop: 4, color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  aiNoteLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiNoteLinkPhone: { marginLeft: 60 },
  aiNoteLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 14 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalBackdropTouch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  calendarModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  calModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calHeaderTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  calIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E7F2EE",
    alignItems: "center",
    justifyContent: "center",
  },
  calModalTitle: {
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  calModalSubtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  calCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  calPresetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  calPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "transparent",
  },
  calPresetChipActive: {
    backgroundColor: "#E7F2EE",
    borderColor: "#0F6D55",
  },
  calPresetText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  calPresetTextActive: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F4F6F5",
    alignItems: "center",
    justifyContent: "center",
  },
  monthYearTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayText: {
    width: 36,
    textAlign: "center",
    color: "#899790",
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: 6,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellActive: {
    backgroundColor: "#0F6D55",
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: "#0F6D55",
  },
  dayCellMuted: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.3,
  },
  dayText: {
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  dayTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
  },
  dayTextToday: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
  },
  dayTextMuted: {
    color: "#899790",
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  calModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  calTodayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E7F2EE",
  },
  calTodayBtnText: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  calDoneBtn: {
    backgroundColor: "#0F6D55",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  calDoneBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
