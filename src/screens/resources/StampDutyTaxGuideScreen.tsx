import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { AlertCircle, Building2, Check, CheckCircle2, ChevronDown, CircleHelp, FileCheck, FileText, Receipt, ShieldCheck } from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function StampDutyTaxGuideScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();

  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const fees = [
    { title: t("stampDutyGuide.fee1Title"), desc: t("stampDutyGuide.fee1Desc") },
    { title: t("stampDutyGuide.fee2Title"), desc: t("stampDutyGuide.fee2Desc") },
    { title: t("stampDutyGuide.fee3Title"), desc: t("stampDutyGuide.fee3Desc") },
    { title: t("stampDutyGuide.fee4Title"), desc: t("stampDutyGuide.fee4Desc") },
    { title: t("stampDutyGuide.fee5Title"), desc: t("stampDutyGuide.fee5Desc") },
  ];

  const workflowSteps = [
    {
      num: "01",
      title: t("stampDutyGuide.step1Title"),
      desc: t("stampDutyGuide.step1Desc"),
      icon: FileCheck,
    },
    {
      num: "02",
      title: t("stampDutyGuide.step2Title"),
      desc: t("stampDutyGuide.step2Desc"),
      icon: ShieldCheck,
    },
    {
      num: "03",
      title: t("stampDutyGuide.step3Title"),
      desc: t("stampDutyGuide.step3Desc"),
      icon: FileText,
    },
    {
      num: "04",
      title: t("stampDutyGuide.step4Title"),
      desc: t("stampDutyGuide.step4Desc"),
      icon: Receipt,
    },
    {
      num: "05",
      title: t("stampDutyGuide.step5Title"),
      desc: t("stampDutyGuide.step5Desc"),
      icon: Building2,
    },
    {
      num: "06",
      title: t("stampDutyGuide.step6Title"),
      desc: t("stampDutyGuide.step6Desc"),
      icon: CheckCircle2,
    },
  ];

  const legalDocuments = [
    { title: t("stampDutyGuide.doc1Title"), desc: t("stampDutyGuide.doc1Desc") },
    { title: t("stampDutyGuide.doc2Title"), desc: t("stampDutyGuide.doc2Desc") },
    { title: t("stampDutyGuide.doc3Title"), desc: t("stampDutyGuide.doc3Desc") },
    { title: t("stampDutyGuide.doc4Title"), desc: t("stampDutyGuide.doc4Desc") },
    { title: t("stampDutyGuide.doc5Title"), desc: t("stampDutyGuide.doc5Desc") },
    { title: t("stampDutyGuide.doc6Title"), desc: t("stampDutyGuide.doc6Desc") },
    { title: t("stampDutyGuide.doc7Title"), desc: t("stampDutyGuide.doc7Desc") },
  ];

  const faqs = [
    { q: t("stampDutyGuide.faq1Q"), a: t("stampDutyGuide.faq1A") },
    { q: t("stampDutyGuide.faq2Q"), a: t("stampDutyGuide.faq2A") },
    { q: t("stampDutyGuide.faq3Q"), a: t("stampDutyGuide.faq3A") },
    { q: t("stampDutyGuide.faq4Q"), a: t("stampDutyGuide.faq4A") },
    { q: t("stampDutyGuide.faq5Q"), a: t("stampDutyGuide.faq5A") },
  ];

  return (
    <AppChrome>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("stampDutyGuide.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("stampDutyGuide.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("stampDutyGuide.subheading")}
          </Text>
        </View>

        {/* Which fees apply: no rates, because they change every year */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.feesTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>{t("stampDutyGuide.feesSubtitle")}</Text>
          </View>

          <View style={[styles.workflowGrid, isPhone && styles.workflowGridPhone]}>
            {fees.map((fee) => (
              <View key={fee.title} style={[styles.workflowCard, isPhone && styles.workflowCardPhone]}>
                <Text style={styles.workflowCardTitle}>{fee.title}</Text>
                <Text style={styles.workflowCardDesc}>{fee.desc}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionSubtitle}>{t("stampDutyGuide.feesNote")}</Text>
        </View>

        {/* 6-Step Registration Workflow Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.workflowTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("stampDutyGuide.workflowSubtitle")}
            </Text>
          </View>

          <View style={[styles.workflowGrid, isPhone && styles.workflowGridPhone]}>
            {workflowSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <View
                  key={step.num}
                  style={[styles.workflowCard, isPhone && styles.workflowCardPhone]}
                >
                  <View style={styles.workflowCardTop}>
                    <Text style={styles.workflowStepNumber}>{step.num}</Text>
                    <View style={styles.workflowIconWrap}>
                      <StepIcon color={colorTokens.brandText} size={20} />
                    </View>
                  </View>
                  <Text style={styles.workflowCardTitle}>{step.title}</Text>
                  <Text style={styles.workflowCardDesc}>{step.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Legal Documents Checklist Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.documentsTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("stampDutyGuide.documentsSubtitle")}
            </Text>
          </View>

          <View style={[styles.documentsGrid, isPhone && styles.documentsGridPhone]}>
            {legalDocuments.map((doc, idx) => (
              <View
                key={idx}
                style={[styles.docCard, isPhone && styles.docCardPhone]}
              >
                <View style={styles.docIconWrap}>
                  <Check color={colorTokens.brandText} size={18} />
                </View>
                <View style={styles.docTextWrap}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docDesc}>{doc.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section with Accordions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrap}>
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
            >
              {t("stampDutyGuide.faqTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("stampDutyGuide.faqSubtitle")}
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

        {/* Statutory Legal Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <AlertCircle color={colorTokens.warningText} size={22} />
              <Text style={styles.disclaimerTitle}>
                {t("stampDutyGuide.disclaimerTitle")}
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              {t("stampDutyGuide.disclaimerBody")}
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
    marginBottom: 44,
  },
  heroPhone: {
    marginBottom: 28,
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
    maxWidth: 760,
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
    maxWidth: 680,
    marginBottom: 24,
  },
  heroCopyPhone: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 20,
  },

  // ─── Sections Common ──────────────────────────────────────────────────
  section: {
    marginBottom: 48,
  },
  sectionHeaderWrap: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
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
    lineHeight: 22,
    color: colorTokens.muted,
  },



  // ─── 6-Step Workflow ──────────────────────────────────────────────────
  workflowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  workflowGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  workflowCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    padding: 20,
    ...shadow,
  },
  workflowCardPhone: {
    minWidth: "100%",
    padding: 16,
  },
  workflowCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  workflowStepNumber: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colorTokens.brandText,
  },
  workflowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  workflowCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  workflowCardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.muted,
  },

  // ─── Documents Checklist ──────────────────────────────────────────────
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  documentsGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  docCard: {
    width: "48.5%",
    flexDirection: "row",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  docCardPhone: {
    width: "100%",
    padding: 14,
  },
  docIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  docTextWrap: {
    flex: 1,
  },
  docTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  docDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colorTokens.muted,
  },

  // ─── FAQ Accordions ───────────────────────────────────────────────────
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderColor: colorTokens.border,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 10,
  },
  faqQuestionTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  faqQuestionIcon: {
    marginTop: 1,
  },
  faqQuestionText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.ink,
    flex: 1,
  },
  faqChevronWrap: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  faqChevronWrapRotated: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  faqAnswerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 22,
    color: colorTokens.body,
  },

  // ─── Disclaimer ───────────────────────────────────────────────────────
  disclaimerSection: {
    marginTop: 10,
  },
  disclaimerCard: {
    backgroundColor: colorTokens.warningSurface,
    borderColor: colorTokens.divider,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.warningText,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colorTokens.body,
  },
});
