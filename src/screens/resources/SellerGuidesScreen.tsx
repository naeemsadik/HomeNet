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
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  FileCheck2,
  FileText,
  LandPlot,
  Receipt,
  ShieldCheck,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export interface SellerChecklistItem {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

export const SELLER_CHECKLIST_ITEMS: SellerChecklistItem[] = [
  {
    id: "check-1",
    titleKey: "sellerGuides.check1Title",
    descKey: "sellerGuides.check1Desc",
  },
  {
    id: "check-2",
    titleKey: "sellerGuides.check2Title",
    descKey: "sellerGuides.check2Desc",
  },
  {
    id: "check-3",
    titleKey: "sellerGuides.check3Title",
    descKey: "sellerGuides.check3Desc",
  },
  {
    id: "check-4",
    titleKey: "sellerGuides.check4Title",
    descKey: "sellerGuides.check4Desc",
  },
  {
    id: "check-5",
    titleKey: "sellerGuides.check5Title",
    descKey: "sellerGuides.check5Desc",
  },
  {
    id: "check-6",
    titleKey: "sellerGuides.check6Title",
    descKey: "sellerGuides.check6Desc",
  },
];

export interface SellerPhaseItem {
  id: string;
  tagKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  docsKey: TranslationKey;
  timeKey: TranslationKey;
  warningKey: TranslationKey;
}

export const SELLER_PHASES_DATA: SellerPhaseItem[] = [
  {
    id: "phase-1",
    tagKey: "sellerGuides.phase1Tag",
    titleKey: "sellerGuides.phase1Title",
    descKey: "sellerGuides.phase1Desc",
    docsKey: "sellerGuides.phase1Docs",
    timeKey: "sellerGuides.phase1Time",
    warningKey: "sellerGuides.phase1Warning",
  },
  {
    id: "phase-2",
    tagKey: "sellerGuides.phase2Tag",
    titleKey: "sellerGuides.phase2Title",
    descKey: "sellerGuides.phase2Desc",
    docsKey: "sellerGuides.phase2Docs",
    timeKey: "sellerGuides.phase2Time",
    warningKey: "sellerGuides.phase2Warning",
  },
  {
    id: "phase-3",
    tagKey: "sellerGuides.phase3Tag",
    titleKey: "sellerGuides.phase3Title",
    descKey: "sellerGuides.phase3Desc",
    docsKey: "sellerGuides.phase3Docs",
    timeKey: "sellerGuides.phase3Time",
    warningKey: "sellerGuides.phase3Warning",
  },
  {
    id: "phase-4",
    tagKey: "sellerGuides.phase4Tag",
    titleKey: "sellerGuides.phase4Title",
    descKey: "sellerGuides.phase4Desc",
    docsKey: "sellerGuides.phase4Docs",
    timeKey: "sellerGuides.phase4Time",
    warningKey: "sellerGuides.phase4Warning",
  },
];

export interface SellerDeepDiveGuide {
  id: string;
  categoryKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
}

export const SELLER_DEEP_DIVE_GUIDES: SellerDeepDiveGuide[] = [
  {
    id: "guide-1",
    categoryKey: "sellerGuides.guide1Category",
    titleKey: "sellerGuides.guide1Title",
    descKey: "sellerGuides.guide1Desc",
    href: "/resources/property-valuation-guide",
  },
  {
    id: "guide-2",
    categoryKey: "sellerGuides.guide2Category",
    titleKey: "sellerGuides.guide2Title",
    descKey: "sellerGuides.guide2Desc",
    href: "/resources/property-price-index",
  },
  {
    id: "guide-3",
    categoryKey: "sellerGuides.guide3Category",
    titleKey: "sellerGuides.guide3Title",
    descKey: "sellerGuides.guide3Desc",
    href: "/resources/stamp-duty-tax-guide",
  },
  {
    id: "guide-4",
    categoryKey: "sellerGuides.guide4Category",
    titleKey: "sellerGuides.guide4Title",
    descKey: "sellerGuides.guide4Desc",
    href: "/guides/namzari-mutation-bangladesh-guide",
  },
  {
    id: "guide-5",
    categoryKey: "sellerGuides.guide5Category",
    titleKey: "sellerGuides.guide5Title",
    descKey: "sellerGuides.guide5Desc",
    href: "/guides/baina-nama-agreement-to-sell-bangladesh",
  },
];

export function SellerGuidesScreen() {
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
    () => Math.round((verifiedCount / SELLER_CHECKLIST_ITEMS.length) * 100),
    [verifiedCount],
  );

  const scoreMeta = useMemo(() => {
    if (readinessPercent < 50) {
      return {
        labelKey: "sellerGuides.scoreLow" as TranslationKey,
        color: colorTokens.errorText,
      };
    }
    if (readinessPercent < 84) {
      return {
        labelKey: "sellerGuides.scoreMedium" as TranslationKey,
        color: colorTokens.warningText,
      };
    }
    return {
      labelKey: "sellerGuides.scoreHigh" as TranslationKey,
      color: colorTokens.brandText,
    };
  }, [readinessPercent]);

  const faqs = [
    {
      q: t("sellerGuides.faq1Q"),
      a: t("sellerGuides.faq1A"),
    },
    {
      q: t("sellerGuides.faq2Q"),
      a: t("sellerGuides.faq2A"),
    },
    {
      q: t("sellerGuides.faq3Q"),
      a: t("sellerGuides.faq3A"),
    },
    {
      q: t("sellerGuides.faq4Q"),
      a: t("sellerGuides.faq4A"),
    },
  ];

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("sellerGuides.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("sellerGuides.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("sellerGuides.subheading")}
          </Text>

          <View style={[styles.heroBadges, isPhone && styles.heroBadgesPhone]}>
            <View style={styles.badgeItem}>
              <Receipt color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("sellerGuides.badgeTaxAct")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <ShieldCheck color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("sellerGuides.badgeBainaAct")}
              </Text>
            </View>
            <View style={styles.badgeItem}>
              <LandPlot color={colorTokens.brandText} size={18} />
              <Text style={styles.badgeText}>
                {t("sellerGuides.badgeNamjari")}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Seller Readiness Checklist */}
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
                  {t("sellerGuides.checklistTitle")}
                </Text>
                <Text style={styles.checklistSubtitle}>
                  {t("sellerGuides.checklistSubtitle")}
                </Text>
              </View>
            </View>

            {/* Score & Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>
                  {t("sellerGuides.readinessScore")}:{" "}
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
              {SELLER_CHECKLIST_ITEMS.map((item, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    aria-checked={isChecked}
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

        {/* 4 Essential Phases of Selling Property */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("sellerGuides.phasesTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("sellerGuides.phasesSubtitle")}
            </Text>
          </View>

          <View style={styles.phasesList}>
            {SELLER_PHASES_DATA.map((phase) => (
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
                    {t("sellerGuides.phaseDocsLabel")}
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

        {/* Curated Tools & Deep-Dive Seller Guides Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("sellerGuides.guidesTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("sellerGuides.guidesSubtitle")}
            </Text>
          </View>

          <View
            style={[
              styles.guidesGrid,
              (isPhone || isTablet) && styles.guidesGridStack,
            ]}
          >
            {SELLER_DEEP_DIVE_GUIDES.map((guide) => (
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
              {t("sellerGuides.faqTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("sellerGuides.faqSubtitle")}
            </Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => {
              const isExpanded = !!expandedFaqs[index];
              return (
                <View key={index} style={styles.faqCard}>
                  <Pressable
                    accessibilityRole="button"
                    aria-expanded={isExpanded}
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

        {/* Seller Advisory Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <AlertCircle color={colorTokens.warningText} size={22} />
              <Text style={styles.disclaimerTitle}>
                {t("sellerGuides.disclaimerTitle")}
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              {t("sellerGuides.disclaimerDesc")}
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

