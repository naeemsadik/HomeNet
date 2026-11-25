import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { FeatureCard } from "@/components/ui";
import {
  Compass,
  Eye,
  Languages,
  Mail,
  type LucideIcon,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function AccessibilityScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const handleEmailPress = () => {
    void Linking.openURL("mailto:accessibility@homenetbd.com");
  };

  const pillars: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
    {
      icon: Languages,
      titleKey: "accessibility.pillar1Title",
      descKey: "accessibility.pillar1Desc",
    },
    {
      icon: Eye,
      titleKey: "accessibility.pillar2Title",
      descKey: "accessibility.pillar2Desc",
    },
    {
      icon: Compass,
      titleKey: "accessibility.pillar3Title",
      descKey: "accessibility.pillar3Desc",
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
            {t("accessibility.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("accessibility.subtitle")}
          </Text>
        </View>

        {/* Commitment Statement Card */}
        <View style={[styles.commitmentCard, isPhone && styles.commitmentCardPhone]}>
          <Text accessibilityRole="header" aria-level={2} style={styles.commitmentHeading}>
            {t("accessibility.commitmentHeading")}
          </Text>
          <Text style={styles.commitmentBody}>
            {t("accessibility.commitmentBody")}
          </Text>
        </View>

        {/* 3 Pillars */}
        <View style={[styles.pillarsGrid, isPhone && styles.pillarsGridPhone]}>
          {pillars.map((pillar) => (
            <FeatureCard
              key={pillar.titleKey}
              description={t(pillar.descKey as any)}
              descriptionStyle={styles.pillarDesc}
              icon={pillar.icon}
              iconWrapStyle={styles.pillarIcon}
              style={[styles.pillarCard, isPhone && styles.pillarCardPhone]}
              title={t(pillar.titleKey as any)}
              titleStyle={styles.pillarTitle}
            />
          ))}
        </View>

        {/* Feedback Section */}
        <View style={[styles.feedbackCard, isPhone && styles.feedbackCardPhone]}>
          <View style={styles.feedbackIconWrap}>
            <Mail color={colorTokens.brandText} size={22} strokeWidth={2} />
          </View>
          <View style={styles.feedbackTextWrap}>
            <Text accessibilityRole="header" aria-level={2} style={styles.feedbackHeading}>
              {t("accessibility.feedbackHeading")}
            </Text>
            <Text style={styles.feedbackBody}>
              {t("accessibility.feedbackBody")}
            </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Email HomeNet Accessibility Team"
              onPress={handleEmailPress}
              style={[styles.feedbackLinkBtn, webPointer]}
            >
              <Text style={styles.feedbackLinkText}>accessibility@homenetbd.com</Text>
            </Pressable>
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
    paddingBottom: 64,
  },
  intro: {
    maxWidth: 720,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 40,
    textAlign: "center",
  },
  introPhone: {
    marginTop: 28,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  eyebrow: {
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 34,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  titlePhone: {
    fontSize: 26,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colorTokens.subtle,
    textAlign: "center",
  },
  subtitlePhone: {
    fontSize: 14,
    lineHeight: 22,
  },
  commitmentCard: {
    backgroundColor: colorTokens.brandSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 28,
    marginBottom: 32,
    ...shadow,
  },
  commitmentCardPhone: {
    padding: 20,
  },
  commitmentHeading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colorTokens.ink,
    marginBottom: 10,
  },
  commitmentBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colorTokens.ink,
  },
  pillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 32,
  },
  pillarsGridPhone: {
    flexDirection: "column",
    gap: 16,
  },
  pillarCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    borderRadius: radius.card,
    padding: 24,
    ...shadow,
  },
  pillarCardPhone: {
    width: "100%",
    padding: 20,
  },
  pillarIcon: {
    backgroundColor: colorTokens.surfaceSunken,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pillarTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  pillarDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.subtle,
  },
  feedbackCard: {
    flexDirection: "row",
    gap: 20,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 28,
    alignItems: "flex-start",
    ...shadow,
  },
  feedbackCardPhone: {
    flexDirection: "column",
    padding: 20,
    gap: 16,
  },
  feedbackIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTextWrap: {
    flex: 1,
  },
  feedbackHeading: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  feedbackBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.subtle,
    marginBottom: 12,
  },
  feedbackLinkBtn: {
    minHeight: 44,
    justifyContent: "center",
  },
  feedbackLinkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colorTokens.brandText,
  },
});
