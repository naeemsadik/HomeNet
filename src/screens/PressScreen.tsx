import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, FeatureCard } from "@/components/ui";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  Mail,
  ShieldCheck,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function PressScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const handlePressEmail = () => {
    void Linking.openURL(`mailto:${t("press.pressEmail")}`);
  };

  const briefings = [
    {
      icon: BarChart3,
      title: t("press.briefing1Title"),
      desc: t("press.briefing1Desc"),
    },
    {
      icon: Building2,
      title: t("press.briefing2Title"),
      desc: t("press.briefing2Desc"),
    },
    {
      icon: Globe,
      title: t("press.briefing3Title"),
      desc: t("press.briefing3Desc"),
    },
  ];

  const editorialRules = [
    {
      label: t("press.editorialRule1Label"),
      val: t("press.editorialRule1Val"),
    },
    {
      label: t("press.editorialRule2Label"),
      val: t("press.editorialRule2Val"),
    },
    {
      label: t("press.editorialRule3Label"),
      val: t("press.editorialRule3Val"),
    },
  ];

  return (
    <AppChrome active={undefined}>
      <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
        {/* Intro */}
        <View style={[styles.intro, isPhone && styles.introPhone]}>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {t("press.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("press.subtitle")}
          </Text>
        </View>

        {/* Brand Mission Card */}
        <View style={[styles.missionCard, isPhone && styles.missionCardPhone]}>
          <View style={styles.missionHeader}>
            <ShieldCheck color={colorTokens.brandText} size={24} strokeWidth={2} />
            <Text accessibilityRole="header" aria-level={2} style={styles.missionTitle}>
              {t("press.missionHeading")}
            </Text>
          </View>
          <Text style={styles.missionBody}>{t("press.missionBody")}</Text>
        </View>

        {/* Market Transparency Briefings */}
        <View style={styles.sectionHeaderWrap}>
          <Text accessibilityRole="header" aria-level={2} style={styles.sectionHeading}>
            {t("press.briefingsHeading")}
          </Text>
        </View>

        <View style={[styles.grid, isPhone && styles.gridPhone]}>
          {briefings.map((briefing) => (
            <FeatureCard
              key={briefing.title}
              description={briefing.desc}
              descriptionStyle={styles.cardDesc}
              icon={briefing.icon}
              iconWrapStyle={styles.cardIconWrap}
              style={[styles.card, isPhone && styles.cardPhone]}
              title={briefing.title}
              titleStyle={styles.cardTitle}
            />
          ))}
        </View>

        {/* Editorial & Brand Guidelines */}
        <View style={[styles.rulesCard, isPhone && styles.rulesCardPhone]}>
          <View style={styles.rulesHeader}>
            <FileText color={colorTokens.brandText} size={22} strokeWidth={2} />
            <Text accessibilityRole="header" aria-level={2} style={styles.rulesHeading}>
              {t("press.editorialHeading")}
            </Text>
          </View>

          <View style={styles.rulesList}>
            {editorialRules.map((rule) => (
              <View key={rule.label} style={styles.ruleItem}>
                <CheckCircle2
                  color={colorTokens.brandText}
                  size={18}
                  strokeWidth={2}
                  style={styles.ruleIcon}
                />
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleLabel}>{rule.label}</Text>
                  <Text style={styles.ruleVal}>{rule.val}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Media Inquiries & Press Desk */}
        <View style={[styles.contactCard, isPhone && styles.contactCardPhone]}>
          <View style={styles.contactIconWrap}>
            <Mail color={colorTokens.brandText} size={24} strokeWidth={2} />
          </View>
          <View style={styles.contactContent}>
            <Text accessibilityRole="header" aria-level={2} style={styles.contactTitle}>
              {t("press.inquiriesHeading")}
            </Text>
            <Text style={styles.contactBody}>{t("press.inquiriesBody")}</Text>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityLabel={t("press.pressEmail")}
                accessibilityRole="button"
                onPress={handlePressEmail}
                style={[styles.emailBtn, webPointer]}
              >
                <Mail color="#FFFFFF" size={16} strokeWidth={2} />
                <Text style={styles.emailBtnText}>{t("press.pressEmail")}</Text>
              </Pressable>

              <AppLink href="/contact" style={[styles.contactLink, webPointer]}>
                <Text style={styles.contactLinkText}>{t("press.contactLinkText")}</Text>
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
  missionCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
    marginBottom: 32,
  },
  missionCardPhone: {
    padding: 16,
    marginBottom: 24,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
  },
  missionBody: {
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
  rulesCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
    marginBottom: 32,
  },
  rulesCardPhone: {
    padding: 16,
    marginBottom: 24,
  },
  rulesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  rulesHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
  },
  rulesList: {
    gap: 16,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  ruleIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  ruleTextWrap: {
    flex: 1,
  },
  ruleLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 2,
  },
  ruleVal: {
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
