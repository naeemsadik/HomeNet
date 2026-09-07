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
      <View style={[styles.pageIntro, isTablet && styles.pageIntroTablet, isPhone && styles.pageIntroPhone]}>
        <View style={styles.introCopy}>
          <Eyebrow style={styles.introEyebrow}>HomeNet intelligence</Eyebrow>
          <Text style={[styles.pageTitle, isTablet && styles.pageTitleTablet, isPhone && styles.pageTitlePhone]}>
            Dhaka market pulse
          </Text>
          <Text style={[styles.pageDescription, isPhone && styles.pageDescriptionPhone]}>
            Current pricing, demand, and neighborhood movement, made easier to read.
          </Text>
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
            <View
              key={label as string}
              style={[
                styles.statCard,
                isTablet && styles.statCardTablet,
                isPhone && styles.statCardPhone,
              ]}
            >
              <View style={styles.statIcon}>
                <StatIcon color={colors.green} size={19} />
              </View>
              <Text style={[styles.statLabel, isPhone && styles.statLabelPhone]}>
                {label as string}
              </Text>
              <Text style={[styles.statValue, isPhone && styles.statValuePhone]}>
                {value as string}
              </Text>
              <View style={styles.statBottom}>
                <Text style={styles.statDetail}>{detail as string}</Text>
                <View style={styles.change}>
                  {down ? (
                    <TrendingDown color="#D06F5F" size={12} />
                  ) : (
                    <TrendingUp color={colors.green} size={12} />
                  )}
                  <Text style={[styles.changeText, down && styles.changeTextDown]}>
                    {change as string}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.dashboard, (isTablet || isPhone) && styles.dashboardTablet]}>
        <View style={[styles.chartCard, (isTablet || isPhone) && styles.chartCardTablet, isPhone && styles.chartCardPhone]}>
          <View style={[styles.cardHeading, isPhone && styles.cardHeadingPhone]}>
            <View>
              <Eyebrow style={styles.cardEyebrow}>Price movement</Eyebrow>
              <Text style={styles.cardTitle}>Average asking price</Text>
            </View>
            <View style={styles.segmented}>
              {(["3 months", "6 months", "1 year"] as const).map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setPeriod(value)}
                  style={[
                    styles.segmentButton,
                    period === value && styles.segmentButtonActive,
                    isPhone && styles.segmentButtonPhone,
                    webPointer,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      period === value && styles.segmentTextActive,
                      isPhone && styles.segmentTextPhone,
                    ]}
                  >
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={[styles.lineChart, isPhone && styles.lineChartPhone]}>
            <View style={styles.yLabels}>
              {["14k", "12k", "10k", "8k"].map((label) => (
                <Text key={label} style={styles.axisLabel}>
                  {label}
                </Text>
              ))}
            </View>
            <Svg height="100%" style={styles.svg} viewBox="0 0 700 230" width="100%">
              <Defs>
                <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.green} stopOpacity="0.25" />
                  <Stop offset="100%" stopColor={colors.green} stopOpacity="0" />
                </SvgGradient>
              </Defs>
              <Path
                d="M0,190 C65,176 92,188 145,150 C195,116 235,142 286,115 C338,87 382,100 430,73 C475,49 515,69 558,42 C610,17 648,32 700,15 L700,230 L0,230 Z"
                fill="url(#areaFill)"
              />
              <Path
                d="M0,190 C65,176 92,188 145,150 C195,116 235,142 286,115 C338,87 382,100 430,73 C475,49 515,69 558,42 C610,17 648,32 700,15"
                fill="none"
                stroke={colors.green}
                strokeLinecap="round"
                strokeWidth={5}
              />
            </Svg>
            <View style={styles.xLabels}>
              {["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((label) => (
                <Text key={label} style={styles.axisLabel}>
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.demandCard, (isTablet || isPhone) && styles.demandCardTablet, isPhone && styles.demandCardPhone]}>
          <View style={styles.cardHeading}>
            <View>
              <Eyebrow style={styles.cardEyebrow}>Demand signal</Eyebrow>
              <Text style={styles.cardTitle}>Buyer activity</Text>
            </View>
            <Info color="#91A098" size={16} />
          </View>
          <View style={styles.orbit}>
            <View style={styles.orbitOne} />
            <View style={styles.orbitTwo} />
            <View style={styles.orbitCenter}>
              <TrendingUp color={colors.white} size={20} />
              <Text style={styles.orbitValue}>High</Text>
              <Text style={styles.orbitLabel}>Current demand</Text>
            </View>
          </View>
          <View style={styles.demandBars}>
            {[
              ["Apartments", 88],
              ["Houses", 66],
              ["Condos", 73],
            ].map(([label, value]) => (
              <View key={label as string} style={styles.demandRow}>
                <Text style={[styles.demandLabel, isPhone && styles.demandLabelPhone]}>{label as string}</Text>
                <View style={styles.demandTrack}>
                  <View style={[styles.demandFill, { width: `${value as number}%` }]} />
                </View>
                <Text style={[styles.demandValue, isPhone && styles.demandValuePhone]}>{value as number}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.areaSection}>
        <SectionHeader
          action="Explore homes"
          eyebrow="Neighborhood comparison"
          href="/buy"
          title="Where the market is moving"
        />
        <View style={styles.areaTable}>
          <View style={[styles.areaRow, styles.areaHead, isPhone && styles.areaRowPhone]}>
            <Text numberOfLines={1} style={[styles.areaCell, styles.areaColName, styles.areaHeadText, isPhone && styles.areaHeadTextPhone]}>Area</Text>
            <Text numberOfLines={1} style={[styles.areaCell, styles.areaColPrice, styles.areaHeadText, isPhone && styles.areaHeadTextPhone]}>{isPhone ? "Avg / sq ft" : "Average per sq ft"}</Text>
            <Text numberOfLines={1} style={[styles.areaCell, styles.areaColChange, styles.areaHeadText, isPhone && styles.areaHeadTextPhone]}>{isPhone ? "12m Change" : "12-month change"}</Text>
            <Text numberOfLines={1} style={[styles.areaCell, styles.areaColDemand, styles.areaHeadText, isPhone && styles.areaHeadTextPhone]}>Buyer demand</Text>
            <View style={styles.areaArrow} />
          </View>
          {areaRows.map(([area, price, change, demand]) => (
            <AppLink href={`/buy?area=${area}`} key={area} style={[styles.areaRow, isPhone && styles.areaRowPhone]}>
              <Text numberOfLines={1} style={[styles.areaCell, styles.areaColName, styles.areaName, isPhone && styles.areaNamePhone]}>{area}</Text>
              <Text numberOfLines={1} style={[styles.areaCell, styles.areaColPrice, styles.areaPriceText, isPhone && styles.areaPriceTextPhone]}>{price}</Text>
              <View style={[styles.areaColChange, styles.change]}>
                <TrendingUp color={colors.green} size={isPhone ? 11 : 13} />
                <Text numberOfLines={1} style={[styles.areaChange, isPhone && styles.areaChangePhone]}>{change}</Text>
              </View>
              <View style={[styles.areaColDemand, styles.demandCell]}>
                <View
                  style={[
                    styles.demandDot,
                    demand === "Moderate" && styles.demandDotModerate,
                    demand === "Growing" && styles.demandDotGrowing,
                  ]}
                />
                <Text numberOfLines={1} style={[styles.areaCell, styles.areaCellText, isPhone && styles.areaCellTextPhone]}>{demand}</Text>
              </View>
              <View style={styles.areaArrow}>
                <ChevronRight color={colors.muted} size={isPhone ? 14 : 16} />
              </View>
            </AppLink>
          ))}
        </View>
      </View>

      <LinearGradient
        colors={["#EAF7F1", "#EEF3FB"]}
        end={{ x: 1, y: 0 }}
        style={[styles.aiNote, isPhone && styles.aiNotePhone]}
      >
        <View style={styles.aiNoteIcon}>
          <Sparkles color={colors.white} size={20} />
        </View>
        <View style={styles.aiNoteCopyWrap}>
          <Text style={styles.aiNoteTitle}>What this means for your search</Text>
          <Text style={styles.aiNoteCopy}>
            Prices are rising steadily, but verified listings in Uttara and Dhanmondi still show room to negotiate. HomeNet flags those opportunities in your results.
          </Text>
        </View>
        <AppLink href="/ai-finder" style={[styles.aiNoteLink, isPhone && styles.aiNoteLinkPhone]}>
          <Text style={styles.aiNoteLinkText}>Find my best area</Text>
          <ArrowRight color={colors.green} size={15} />
        </AppLink>
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
  pageIntro: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
    paddingTop: 16,
    paddingBottom: 22,
  },
  pageIntroTablet: {
    paddingTop: 12,
    paddingBottom: 18,
    gap: 16,
  },
  pageIntroPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 14,
    paddingTop: 8,
    paddingBottom: 16,
  },
  introCopy: { flex: 1 },
  introEyebrow: { marginBottom: 6 },
  pageTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  pageTitleTablet: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  pageTitlePhone: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  pageDescription: {
    maxWidth: 580,
    marginTop: 6,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
  },
  pageDescriptionPhone: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  marketUpdate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  marketUpdateText: {
    color: "#0B1A17",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  statCardTablet: {
    flexBasis: "48%",
    minWidth: "48%",
  },
  statCardPhone: {
    flexBasis: "48%",
    minWidth: "48%",
    padding: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(15, 109, 85, 0.08)",
  },
  statLabel: {
    marginTop: 10,
    marginBottom: 4,
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  statLabelPhone: {
    fontSize: 11.5,
  },
  statValue: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  statValuePhone: {
    fontSize: 18,
  },
  statBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    marginTop: 6,
    flexWrap: "wrap",
  },
  statDetail: {
    color: "#7B8A83",
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  change: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  changeText: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  changeTextDown: {
    color: "#D06F5F",
  },
  dashboard: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
    marginTop: 20,
  },
  dashboardTablet: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  chartCard: {
    flex: 1.45,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  chartCardTablet: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
  },
  chartCardPhone: {
    padding: 14,
  },
  demandCard: {
    flex: 0.85,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  demandCardTablet: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
  },
  demandCardPhone: {
    padding: 14,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardHeadingPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  cardEyebrow: {
    marginBottom: 4,
  },
  cardTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  segmented: {
    flexDirection: "row",
    gap: 3,
    padding: 3,
    borderRadius: 10,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
  },
  segmentButton: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  segmentButtonPhone: {
    minHeight: 28,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  segmentText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  segmentTextPhone: {
    fontSize: 11,
  },
  segmentTextActive: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
  },
  lineChart: {
    position: "relative",
    height: 260,
    marginTop: 20,
    paddingTop: 8,
    paddingRight: 0,
    paddingBottom: 24,
    paddingLeft: 40,
  },
  lineChartPhone: {
    height: 200,
    paddingLeft: 34,
  },
  svg: {
    overflow: "visible",
  },
  yLabels: {
    position: "absolute",
    top: 0,
    bottom: 24,
    left: 0,
    justifyContent: "space-between",
  },
  xLabels: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  axisLabel: {
    color: "#7B8A83",
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },
  orbit: {
    position: "relative",
    width: 170,
    height: 170,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  orbitOne: {
    position: "absolute",
    top: 6,
    right: 6,
    bottom: 6,
    left: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(15, 109, 85, 0.15)",
  },
  orbitTwo: {
    position: "absolute",
    top: 22,
    right: 22,
    bottom: 22,
    left: 22,
    borderRadius: 999,
    backgroundColor: "rgba(231, 242, 238, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(15, 109, 85, 0.15)",
  },
  orbitCenter: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 52,
    backgroundColor: "#0F6D55",
    paddingHorizontal: 8,
  },
  orbitValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 17,
    lineHeight: 21,
  },
  orbitLabel: {
    marginTop: 1,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: fonts.medium,
    fontSize: 10,
    textAlign: "center",
  },
  demandBars: {
    gap: 10,
    marginTop: 6,
  },
  demandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  demandLabel: {
    width: 80,
    color: "#0B1A17",
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  demandLabelPhone: {
    width: 68,
    fontSize: 11.5,
  },
  demandTrack: {
    minWidth: 0,
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: "#E8EEEB",
  },
  demandFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#0F6D55",
  },
  demandValue: {
    width: 34,
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 12.5,
    textAlign: "right",
  },
  demandValuePhone: {
    width: 30,
    fontSize: 11.5,
  },
  areaSection: {
    marginTop: 28,
  },
  areaTable: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  areaRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.06)",
  },
  areaRowPhone: {
    minHeight: 48,
    gap: 4,
    paddingHorizontal: 10,
  },
  areaHead: {
    minHeight: 44,
    backgroundColor: "#F4F6F5",
  },
  areaCell: {
    color: "#3D4F46",
    fontFamily: fonts.regular,
    fontSize: 13.5,
  },
  areaCellPhone: {
    fontSize: 11.5,
  },
  areaColName: {
    flex: 1.15,
  },
  areaColPrice: {
    flex: 1.25,
  },
  areaColChange: {
    flex: 1,
  },
  areaColDemand: {
    flex: 1.15,
  },
  areaHeadText: {
    color: "#5F7167",
    fontFamily: fonts.bold,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  areaHeadTextPhone: {
    fontSize: 9.5,
    letterSpacing: 0,
  },
  areaName: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 14.5,
  },
  areaNamePhone: {
    fontSize: 12.5,
  },
  areaPriceText: {
    color: "#3D4F46",
    fontFamily: fonts.regular,
    fontSize: 13.5,
  },
  areaPriceTextPhone: {
    fontSize: 11.5,
  },
  areaChange: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  areaChangePhone: {
    fontSize: 11.5,
  },
  demandCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  areaCellText: {
    color: "#3D4F46",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  areaCellTextPhone: {
    fontSize: 11.5,
  },
  demandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#0F6D55",
    flexShrink: 0,
  },
  demandDotModerate: {
    backgroundColor: "#D9A657",
  },
  demandDotGrowing: {
    backgroundColor: "#2251D6",
  },
  areaArrow: {
    width: 16,
    alignItems: "flex-end",
    flexShrink: 0,
  },
  aiNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 109, 85, 0.15)",
  },
  aiNotePhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
  },
  aiNoteIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#0F6D55",
  },
  aiNoteCopyWrap: {
    minWidth: 0,
    flex: 1,
  },
  aiNoteTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 15.5,
  },
  aiNoteCopy: {
    marginTop: 4,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  aiNoteLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiNoteLinkPhone: {
    marginTop: 4,
  },
  aiNoteLinkText: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },

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
