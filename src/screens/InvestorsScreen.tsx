import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow, FeatureCard } from "@/components/ui";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  FileCheck2,
  Mail,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function InvestorsScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const handleInvestorEmail = () => {
    void Linking.openURL(`mailto:${t("investors.investorEmail")}`);
  };

  const revenuePillars = [
    {
      icon: Building2,
      title: t("investors.pillar1Title"),
      desc: t("investors.pillar1Desc"),
    },
    {
      icon: Zap,
      title: t("investors.pillar2Title"),
      desc: t("investors.pillar2Desc"),
    },
    {
      icon: BarChart3,
      title: t("investors.pillar3Title"),
      desc: t("investors.pillar3Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("investors.pillar4Title"),
      desc: t("investors.pillar4Desc"),
    },
  ];

  const governanceItems = [
    {
      title: t("investors.gov1Title"),
      desc: t("investors.gov1Desc"),
    },
    {
      title: t("investors.gov2Title"),
      desc: t("investors.gov2Desc"),
    },
    {
      title: t("investors.gov3Title"),
      desc: t("investors.gov3Desc"),
    },
  ];

  return (
    <AppChrome active={undefined}>
      <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
        {/* Intro */}
        <View style={[styles.intro, isPhone && styles.introPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("investors.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {t("investors.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("investors.subtitle")}
          </Text>
        </View>

        {/* PropTech Macro Thesis */}
        <View style={[styles.thesisCard, isPhone && styles.thesisCardPhone]}>
          <View style={styles.thesisHeader}>
            <TrendingUp color={colorTokens.brandText} size={24} strokeWidth={2} />
            <Text accessibilityRole="header" aria-level={2} style={styles.thesisTitle}>
              {t("investors.thesisHeading")}
            </Text>
          </View>
          <Text style={styles.thesisBody}>{t("investors.thesisBody")}</Text>
        </View>

        {/* Revenue Pillars */}
        <View style={styles.sectionHeaderWrap}>
          <Text accessibilityRole="header" aria-level={2} style={styles.sectionHeading}>
            {t("investors.pillarsHeading")}
          </Text>
        </View>

        <View style={[styles.grid, isPhone && styles.gridPhone]}>
          {revenuePillars.map((pillar) => (
            <FeatureCard
              key={pillar.title}
              description={pillar.desc}
              descriptionStyle={styles.cardDesc}
              icon={pillar.icon}
              iconWrapStyle={styles.cardIconWrap}
              style={[styles.card, isPhone && styles.cardPhone]}
              title={pillar.title}
              titleStyle={styles.cardTitle}
            />
          ))}
        </View>

        {/* Corporate Governance & Legal Compliance */}
        <View style={[styles.govCard, isPhone && styles.govCardPhone]}>
          <View style={styles.govHeader}>
            <FileCheck2 color={colorTokens.brandText} size={22} strokeWidth={2} />
            <Text accessibilityRole="header" aria-level={2} style={styles.govHeading}>
              {t("investors.governanceHeading")}
            </Text>
          </View>

          <View style={styles.govList}>
            {governanceItems.map((item) => (
              <View key={item.title} style={styles.govItem}>
                <CheckCircle2
                  color={colorTokens.brandText}
                  size={18}
                  strokeWidth={2}
                  style={styles.govIcon}
                />
                <View style={styles.govTextWrap}>
                  <Text style={styles.govItemTitle}>{item.title}</Text>
                  <Text style={styles.govItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Investor Relations Contact Desk */}
        <View style={[styles.contactCard, isPhone && styles.contactCardPhone]}>
          <View style={styles.contactIconWrap}>
            <Mail color={colorTokens.brandText} size={24} strokeWidth={2} />
          </View>
          <View style={styles.contactContent}>
            <Text accessibilityRole="header" aria-level={2} style={styles.contactTitle}>
              {t("investors.inquiriesHeading")}
            </Text>
            <Text style={styles.contactBody}>{t("investors.inquiriesBody")}</Text>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityLabel={t("investors.investorEmail")}
                accessibilityRole="button"
                onPress={handleInvestorEmail}
                style={[styles.emailBtn, webPointer]}
              >
                <Mail color="#FFFFFF" size={16} strokeWidth={2} />
                <Text style={styles.emailBtnText}>{t("investors.investorEmail")}</Text>
              </Pressable>

              <AppLink href="/contact" style={[styles.contactLink, webPointer]}>
                <Text style={styles.contactLinkText}>{t("investors.contactLinkText")}</Text>
              </AppLink>
            </View>
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 32,
    paddingBottom: 64,
  },
  intro: {
    marginBottom: 32,
  },
  introPhone: {
    marginBottom: 24,
  },
  eyebrow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  titlePhone: {
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colorTokens.body,
    maxWidth: 720,
  },
  subtitlePhone: {
    fontSize: 14,
    lineHeight: 20,
  },
  thesisCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
    marginBottom: 32,
  },
  thesisCardPhone: {
    padding: 16,
    marginBottom: 24,
  },
  thesisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  thesisTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
  },
  thesisBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  sectionHeaderWrap: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  gridPhone: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: 260,
  },
  cardPhone: {
    minWidth: "100%",
  },
  cardIconWrap: {
    backgroundColor: colorTokens.brandSurface,
    borderRadius: radius.md,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  govCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
    marginBottom: 32,
  },
  govCardPhone: {
    padding: 16,
    marginBottom: 24,
  },
  govHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  govHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
  },
  govList: {
    gap: 16,
  },
  govItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  govIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  govTextWrap: {
    flex: 1,
  },
  govItemTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 2,
  },
  govItemDesc: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  contactCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  contactCardPhone: {
    padding: 16,
    flexDirection: "column",
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 6,
  },
  contactBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colorTokens.body,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colorTokens.brandText,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: radius.sm,
    justifyContent: "center",
  },
  emailBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    fontWeight: "600",
  },
  contactLink: {
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  contactLinkText: {
    color: colorTokens.brandText,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
