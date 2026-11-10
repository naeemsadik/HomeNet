import { useState, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  FileCheck2,
  FileText,
  ShieldCheck,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export interface RenterChecklistItem {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

export const RENTER_CHECKLIST_ITEMS: RenterChecklistItem[] = [
  {
    id: "check-1",
    titleKey: "renterGuides.check1Title",
    descKey: "renterGuides.check1Desc",
  },
  {
    id: "check-2",
    titleKey: "renterGuides.check2Title",
    descKey: "renterGuides.check2Desc",
  },
  {
    id: "check-3",
    titleKey: "renterGuides.check3Title",
    descKey: "renterGuides.check3Desc",
  },
  {
    id: "check-4",
    titleKey: "renterGuides.check4Title",
    descKey: "renterGuides.check4Desc",
  },
  {
    id: "check-5",
    titleKey: "renterGuides.check5Title",
    descKey: "renterGuides.check5Desc",
  },
  {
    id: "check-6",
    titleKey: "renterGuides.check6Title",
    descKey: "renterGuides.check6Desc",
  },
];

export interface RenterPhaseItem {
  id: string;
  tagKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  docsKey: TranslationKey;
  timeKey: TranslationKey;
  warningKey: TranslationKey;
}

export const RENTER_PHASES_DATA: RenterPhaseItem[] = [
  {
    id: "phase-1",
    tagKey: "renterGuides.phase1Tag",
    titleKey: "renterGuides.phase1Title",
    descKey: "renterGuides.phase1Desc",
    docsKey: "renterGuides.phase1Docs",
    timeKey: "renterGuides.phase1Time",
    warningKey: "renterGuides.phase1Warning",
  },
  {
    id: "phase-2",
    tagKey: "renterGuides.phase2Tag",
    titleKey: "renterGuides.phase2Title",
    descKey: "renterGuides.phase2Desc",
    docsKey: "renterGuides.phase2Docs",
    timeKey: "renterGuides.phase2Time",
    warningKey: "renterGuides.phase2Warning",
  },
  {
    id: "phase-3",
    tagKey: "renterGuides.phase3Tag",
    titleKey: "renterGuides.phase3Title",
    descKey: "renterGuides.phase3Desc",
    docsKey: "renterGuides.phase3Docs",
    timeKey: "renterGuides.phase3Time",
    warningKey: "renterGuides.phase3Warning",
  },
  {
    id: "phase-4",
    tagKey: "renterGuides.phase4Tag",
    titleKey: "renterGuides.phase4Title",
    descKey: "renterGuides.phase4Desc",
    docsKey: "renterGuides.phase4Docs",
    timeKey: "renterGuides.phase4Time",
    warningKey: "renterGuides.phase4Warning",
  },
];

export interface RenterDeepDiveGuide {
  id: string;
  categoryKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
}

export const RENTER_DEEP_DIVE_GUIDES: RenterDeepDiveGuide[] = [
  {
    id: "guide-1",
    categoryKey: "renterGuides.guide1Category",
    titleKey: "renterGuides.guide1Title",
    descKey: "renterGuides.guide1Desc",
    href: "/resources/property-price-index",
  },
  {
    id: "guide-2",
    categoryKey: "renterGuides.guide2Category",
    titleKey: "renterGuides.guide2Title",
    descKey: "renterGuides.guide2Desc",
    href: "/resources/stamp-duty-tax-guide",
  },
  {
    id: "guide-3",
    categoryKey: "renterGuides.guide3Category",
    titleKey: "renterGuides.guide3Title",
    descKey: "renterGuides.guide3Desc",
    href: "/rent?subtype=student",
  },
  {
    id: "guide-4",
    categoryKey: "renterGuides.guide4Category",
    titleKey: "renterGuides.guide4Title",
    descKey: "renterGuides.guide4Desc",
    href: "/rent",
  },
  {
    id: "guide-5",
    categoryKey: "renterGuides.guide5Category",
    titleKey: "renterGuides.guide5Title",
    descKey: "renterGuides.guide5Desc",
    href: "/resources/property-valuation-guide",
  },
];

export function RenterGuidesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPhone, isTablet } = useResponsive();

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  // FAQ Accordion state
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const verifiedCount = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems],
  );

  const readinessPercent = useMemo(
    () => Math.round((verifiedCount / RENTER_CHECKLIST_ITEMS.length) * 100),
    [verifiedCount],
  );

  const scoreMeta = useMemo(() => {
    if (readinessPercent < 50) {
      return {
        labelKey: "renterGuides.scoreLow" as TranslationKey,
        color: colorTokens.errorText,
      };
    }
    if (readinessPercent < 84) {
      return {
        labelKey: "renterGuides.scoreMedium" as TranslationKey,
        color: colorTokens.warningText,
      };
    }
    return {
      labelKey: "renterGuides.scoreHigh" as TranslationKey,
      color: colorTokens.brandText,
    };
  }, [readinessPercent]);

  const faqs = [
    {
      q: t("renterGuides.faq1Q"),
      a: t("renterGuides.faq1A"),
    },
    {
      q: t("renterGuides.faq2Q"),
      a: t("renterGuides.faq2A"),
    },
    {
      q: t("renterGuides.faq3Q"),
      a: t("renterGuides.faq3A"),
    },
    {
      q: t("renterGuides.faq4Q"),
      a: t("renterGuides.faq4A"),
    },
  ];

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("renterGuides.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("renterGuides.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("renterGuides.subheading")}
          </Text>

          <View style={[styles.heroBadges, isPhone && styles.heroBadgesPhone]}>
            <View style={styles.badgeItem}>
              <ShieldCheck color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("renterGuides.badgeRentAct")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <FileCheck2 color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("renterGuides.badgeStamp")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <BadgeCheck color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("renterGuides.badgePolice")}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Move-In Readiness Checklist */}
        <View style={styles.section}>
          <View
            style={[
              styles.checklistCard,
              isPhone && styles.checklistCardPhone,
            ]}
          >
            <View style={styles.checklistHeader}>
              <View style={styles.checklistIconWrap}>
                <FileCheck2 color={colorTokens.brandText} size={24} />
              </View>
              <View style={styles.checklistHeaderTextWrap}>
                <Text
                  accessibilityRole="header"
                  aria-level={2}
                  style={[
                    styles.checklistTitle,
                    isPhone && styles.checklistTitlePhone,
                  ]}
                >
                  {t("renterGuides.checklistTitle")}
                </Text>
                <Text style={styles.checklistSubtitle}>
                  {t("renterGuides.checklistSubtitle")}
                </Text>
              </View>
            </View>

            {/* Score & Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>
                  {t("renterGuides.readinessScore")}:{" "}
                  <Text style={styles.progressPercentText}>
                    {readinessPercent}%
                  </Text>
                </Text>
                <Text
                  style={[styles.scoreStatusText, { color: scoreMeta.color }]}
                >
                  {t(scoreMeta.labelKey)}
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${readinessPercent}%`,
                      backgroundColor: scoreMeta.color,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Checklist Grid */}
            <View style={styles.checklistItemsList}>
              {RENTER_CHECKLIST_ITEMS.map((item, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    onPress={() => toggleCheck(idx)}
                    style={[
                      styles.checkRow,
                      webPointer,
                      isChecked && styles.checkRowActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        isChecked && styles.checkboxBoxActive,
                      ]}
                    >
                      {isChecked ? (
                        <Check color={colorTokens.surface} size={14} />
                      ) : null}
                    </View>
                    <View style={styles.checkTextWrap}>
                      <Text
                        style={[
                          styles.checkItemTitle,
                          isChecked && styles.checkItemTitleActive,
                        ]}
                      >
                        {t(item.titleKey)}
                      </Text>
                      <Text style={styles.checkItemDesc}>
                        {t(item.descKey)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* 4 Essential Pillars of Renting */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("renterGuides.phasesTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("renterGuides.phasesSubtitle")}
            </Text>
          </View>

          <View style={styles.phasesList}>
            {RENTER_PHASES_DATA.map((phase) => (
              <View
                key={phase.id}
                style={[styles.phaseCard, isPhone && styles.phaseCardPhone]}
              >
                <View style={styles.phaseTopRow}>
                  <View style={styles.phaseTag}>
                    <Text style={styles.phaseTagText}>{t(phase.tagKey)}</Text>
                  </View>
                  <View style={styles.phaseMetaChip}>
                    <Clock color={colorTokens.muted} size={13} />
                    <Text style={styles.phaseMetaChipText}>
                      {t(phase.timeKey)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.phaseTitle}>{t(phase.titleKey)}</Text>
                <Text style={styles.phaseDesc}>{t(phase.descKey)}</Text>

                <View style={styles.phaseDocsRow}>
                  <Text style={styles.phaseDocsLabel}>
                    {t("renterGuides.phaseDocsLabel")}
                  </Text>
                  <View style={styles.docsChip}>
                    <FileText color={colorTokens.body} size={13} />
                    <Text style={styles.docsChipText}>
                      {t(phase.docsKey)}
                    </Text>
                  </View>
                </View>

                <View style={styles.phaseWarningBox}>
                  <AlertTriangle color={colorTokens.warningText} size={16} />
                  <Text style={styles.phaseWarningText}>
                    {t(phase.warningKey)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Curated Tools & Deep-Dive Renter Guides Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("renterGuides.guidesTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("renterGuides.guidesSubtitle")}
            </Text>
          </View>

          <View
            style={[
              styles.guidesGrid,
              (isPhone || isTablet) && styles.guidesGridStack,
            ]}
          >
            {RENTER_DEEP_DIVE_GUIDES.map((guide) => (
              <Pressable
                key={guide.id}
                accessibilityRole="link"
                onPress={() => router.push(guide.href as any)}
                style={[
                  styles.guideCard,
                  webPointer,
                  isPhone && styles.guideCardPhone,
                ]}
              >
                <View style={styles.guideTopRow}>
                  <View style={styles.guideCategoryPill}>
                    <Text style={styles.guideCategoryText}>
                      {t(guide.categoryKey)}
                    </Text>
                  </View>
                  <ArrowRight color={colorTokens.brandText} size={18} />
                </View>

                <Text style={styles.guideTitle}>{t(guide.titleKey)}</Text>
                <Text style={styles.guideDesc}>{t(guide.descKey)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Interactive FAQ Accordion */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("renterGuides.faqTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("renterGuides.faqSubtitle")}
            </Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => {
              const isExpanded = !!expandedFaqs[index];
              return (
                <View key={index} style={styles.faqCard}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => toggleFaq(index)}
                    style={[styles.faqQuestionRow, webPointer]}
                  >
                    <View style={styles.faqQuestionTextWrap}>
                      <CircleHelp
                        color={colorTokens.brandText}
                        size={20}
                        style={styles.faqQuestionIcon}
                      />
                      <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    </View>
                    <View
                      style={[
                        styles.faqChevronWrap,
                        isExpanded && styles.faqChevronWrapRotated,
                      ]}
                    >
                      <ChevronDown color={colorTokens.body} size={20} />
                    </View>
                  </Pressable>
                  {isExpanded ? (
                    <View style={styles.faqAnswerWrap}>
                      <Text style={styles.faqAnswerText}>{faq.a}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Statutory Tenancy Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <AlertCircle color={colorTokens.warningText} size={22} />
              <Text style={styles.disclaimerTitle}>
                {t("renterGuides.disclaimerTitle")}
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              {t("renterGuides.disclaimerDesc")}
            </Text>
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 40,
    paddingBottom: 64,
  },
  containerPhone: {
    paddingHorizontal: layout.gutterPhone,
    paddingTop: 24,
    paddingBottom: 48,
  },
  // ─── Hero ──────────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 40,
  },
  heroPhone: {
    marginBottom: 24,
    alignItems: "flex-start",
    textAlign: "left",
  },
  eyebrow: {
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 14,
    maxWidth: 780,
  },
  heroTitlePhone: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: "left",
  },
  heroCopy: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colorTokens.muted,
    textAlign: "center",
    maxWidth: 700,
    marginBottom: 24,
  },
  heroCopyPhone: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 20,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  heroBadgesPhone: {
    justifyContent: "flex-start",
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    minHeight: 38,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.brandText,
  },
  // ─── Common Section ────────────────────────────────────────────────────
  section: {
    marginBottom: 44,
  },
  sectionHeaderWrap: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  sectionTitlePhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.muted,
  },
  // ─── Checklist Card ────────────────────────────────────────────────────
  checklistCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 32,
    ...shadow,
  },
  checklistCardPhone: {
    padding: 18,
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  checklistIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistHeaderTextWrap: {
    flex: 1,
  },
  checklistTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  checklistTitlePhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  checklistSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.muted,
  },
  progressContainer: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 18,
    marginBottom: 24,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  progressLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colorTokens.ink,
  },
  progressPercentText: {
    fontFamily: fonts.headingBold,
    color: colorTokens.ink,
  },
  scoreStatusText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colorTokens.divider,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  checklistItemsList: {
    gap: 12,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 16,
    minHeight: 52,
  },
  checkRowActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colorTokens.subtle,
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxBoxActive: {
    backgroundColor: colorTokens.brandText,
    borderColor: colorTokens.brandText,
  },
  checkTextWrap: {
    flex: 1,
  },
  checkItemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  checkItemTitleActive: {
    color: colorTokens.brandText,
  },
  checkItemDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colorTokens.muted,
  },
  // ─── 4 Phases List ─────────────────────────────────────────────────────
  phasesList: {
    gap: 18,
  },
  phaseCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 24,
    ...shadow,
  },
  phaseCardPhone: {
    padding: 18,
  },
  phaseTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  phaseTag: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  phaseTagText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colorTokens.brandText,
    letterSpacing: 0.5,
  },
  phaseMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseMetaChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.muted,
  },
  phaseTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  phaseDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.body,
    marginBottom: 16,
  },
  phaseDocsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  phaseDocsLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.muted,
  },
  docsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.divider,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  docsChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.body,
  },
  phaseWarningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colorTokens.warningSurface,
    borderColor: "rgba(180, 83, 9, 0.2)",
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
  },
  phaseWarningText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colorTokens.warningText,
    flex: 1,
  },
  // ─── Deep Dive Guides Grid ─────────────────────────────────────────────
  guidesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  guidesGridStack: {
    flexDirection: "column",
    gap: 14,
  },
  guideCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 22,
    minHeight: 140,
    justifyContent: "space-between",
    ...shadow,
  },
  guideCardPhone: {
    minWidth: "100%",
    padding: 18,
  },
  guideTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  guideCategoryPill: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  guideCategoryText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colorTokens.muted,
  },
  guideTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  guideDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colorTokens.muted,
  },
  // ─── FAQ Accordion ─────────────────────────────────────────────────────
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    overflow: "hidden",
    ...shadow,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 56,
  },
  faqQuestionTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
    gap: 12,
  },
  faqQuestionIcon: {
    flexShrink: 0,
  },
  faqQuestionText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.ink,
    flex: 1,
  },
  faqChevronWrap: {
    transform: [{ rotate: "0deg" }],
  },
  faqChevronWrapRotated: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  faqAnswerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 24,
    color: colorTokens.body,
  },
  // ─── Disclaimer ────────────────────────────────────────────────────────
  disclaimerSection: {
    marginTop: 8,
  },
  disclaimerCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.muted,
  },
});

