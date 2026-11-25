import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, FeatureCard } from "@/components/ui";
import {
  Briefcase,
  Building2,
  Compass,
  Cpu,
  Eye,
  FileCheck2,
  Search,
  ShieldCheck,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function TechBlogScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const avmFeatures = [
    {
      icon: Cpu,
      title: t("techBlog.avmFeature1Title"),
      desc: t("techBlog.avmFeature1Desc"),
    },
    {
      icon: Building2,
      title: t("techBlog.avmFeature2Title"),
      desc: t("techBlog.avmFeature2Desc"),
    },
  ];

  const fraudPillars = [
    {
      icon: FileCheck2,
      title: t("techBlog.fraudPillar1Title"),
      desc: t("techBlog.fraudPillar1Desc"),
    },
    {
      icon: Eye,
      title: t("techBlog.fraudPillar2Title"),
      desc: t("techBlog.fraudPillar2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("techBlog.fraudPillar3Title"),
      desc: t("techBlog.fraudPillar3Desc"),
    },
  ];

  const nlpFeatures = [
    {
      icon: Search,
      title: t("techBlog.nlpFeature1Title"),
      desc: t("techBlog.nlpFeature1Desc"),
    },
    {
      icon: Compass,
      title: t("techBlog.nlpFeature2Title"),
      desc: t("techBlog.nlpFeature2Desc"),
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
            {t("techBlog.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("techBlog.subtitle")}
          </Text>
        </View>

        {/* Section 1: Automated Valuation Model */}
        <View style={[styles.topicSection, isPhone && styles.topicSectionPhone]}>
          <View style={styles.topicHeader}>
            <Text accessibilityRole="header" aria-level={2} style={styles.topicHeading}>
              {t("techBlog.avmHeading")}
            </Text>
            <Text style={styles.topicBody}>{t("techBlog.avmBody")}</Text>
          </View>

          <View style={[styles.grid2, isPhone && styles.gridPhone]}>
            {avmFeatures.map((item) => (
              <FeatureCard
                key={item.title}
                description={item.desc}
                descriptionStyle={styles.cardDesc}
                icon={item.icon}
                iconWrapStyle={styles.cardIconWrap}
                style={[styles.card, isPhone && styles.cardPhone]}
                title={item.title}
                titleStyle={styles.cardTitle}
              />
            ))}
          </View>
        </View>

        {/* Section 2: Anti-Fraud & Verification Pipeline */}
        <View style={[styles.topicSection, isPhone && styles.topicSectionPhone]}>
          <View style={styles.topicHeader}>
            <Text accessibilityRole="header" aria-level={2} style={styles.topicHeading}>
              {t("techBlog.antiFraudHeading")}
            </Text>
            <Text style={styles.topicBody}>{t("techBlog.antiFraudBody")}</Text>
          </View>

          <View style={[styles.grid3, isPhone && styles.gridPhone]}>
            {fraudPillars.map((item) => (
              <FeatureCard
                key={item.title}
                description={item.desc}
                descriptionStyle={styles.cardDesc}
                icon={item.icon}
                iconWrapStyle={styles.cardIconWrap}
                style={[styles.card, isPhone && styles.cardPhone]}
                title={item.title}
                titleStyle={styles.cardTitle}
              />
            ))}
          </View>
        </View>

        {/* Section 3: Trilingual Semantic Search */}
        <View style={[styles.topicSection, isPhone && styles.topicSectionPhone]}>
          <View style={styles.topicHeader}>
            <Text accessibilityRole="header" aria-level={2} style={styles.topicHeading}>
              {t("techBlog.nlpHeading")}
            </Text>
            <Text style={styles.topicBody}>{t("techBlog.nlpBody")}</Text>
          </View>

          <View style={[styles.grid2, isPhone && styles.gridPhone]}>
            {nlpFeatures.map((item) => (
              <FeatureCard
                key={item.title}
                description={item.desc}
                descriptionStyle={styles.cardDesc}
                icon={item.icon}
                iconWrapStyle={styles.cardIconWrap}
                style={[styles.card, isPhone && styles.cardPhone]}
                title={item.title}
                titleStyle={styles.cardTitle}
              />
            ))}
          </View>
        </View>

        {/* Careers Call to Action */}
        <View style={[styles.careersBanner, isPhone && styles.careersBannerPhone]}>
          <View style={styles.careersIconWrap}>
            <Briefcase color={colorTokens.brandText} size={24} strokeWidth={2} />
          </View>
          <View style={styles.careersContent}>
            <Text accessibilityRole="header" aria-level={2} style={styles.careersTitle}>
              {t("techBlog.careersHeading")}
            </Text>
            <Text style={styles.careersBody}>{t("techBlog.careersBody")}</Text>
            <AppLink href="/careers" style={[styles.careersBtn, webPointer]}>
              <Text style={styles.careersBtnText}>{t("techBlog.careersLinkText")}</Text>
            </AppLink>
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
  topicSection: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
    marginBottom: 32,
  },
  topicSectionPhone: {
    padding: 16,
    marginBottom: 24,
  },
  topicHeader: {
    marginBottom: 20,
  },
  topicHeading: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 8,
  },
  topicBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  grid2: {
    flexDirection: "row",
    gap: 16,
  },
  grid3: {
    flexDirection: "row",
    gap: 16,
  },
  gridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 240,
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
  careersBanner: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  careersBannerPhone: {
    padding: 16,
    flexDirection: "column",
  },
  careersIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  careersContent: {
    flex: 1,
  },
  careersTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 6,
  },
  careersBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colorTokens.body,
    marginBottom: 16,
  },
  careersBtn: {
    backgroundColor: colorTokens.brandText,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  careersBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    fontWeight: "600",
  },
});
