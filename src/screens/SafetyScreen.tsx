import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, FeatureCard } from "@/components/ui";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function SafetyScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const pillars: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
    {
      icon: FileCheck2,
      titleKey: "safety.pillar1Title",
      descKey: "safety.pillar1Desc",
    },
    {
      icon: AlertCircle,
      titleKey: "safety.pillar2Title",
      descKey: "safety.pillar2Desc",
    },
    {
      icon: Eye,
      titleKey: "safety.pillar3Title",
      descKey: "safety.pillar3Desc",
    },
    {
      icon: ShieldAlert,
      titleKey: "safety.pillar4Title",
      descKey: "safety.pillar4Desc",
    },
  ];

  const checklist: string[] = [
    "safety.check1",
    "safety.check2",
    "safety.check3",
    "safety.check4",
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
            {t("safety.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("safety.subtitle")}
          </Text>
        </View>

        {/* 4 Pillars Grid */}
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

        {/* Seeker Guidelines Checklist */}
        <View style={[styles.checklistCard, isPhone && styles.checklistCardPhone]}>
          <View style={styles.checklistHeader}>
            <ShieldCheck color={colorTokens.brandText} size={24} strokeWidth={2} />
            <Text accessibilityRole="header" aria-level={2} style={styles.checklistTitle}>
              {t("safety.guidelinesHeading")}
            </Text>
          </View>

          <View style={styles.checklistItems}>
            {checklist.map((key) => (
              <View key={key} style={styles.checkItem}>
                <CheckCircle2
                  color={colorTokens.brandText}
                  size={18}
                  strokeWidth={2}
                  style={styles.checkIcon}
                />
                <Text style={styles.checkText}>{t(key as any)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Security Alert Support Banner */}
        <View style={[styles.alertBanner, isPhone && styles.alertBannerPhone]}>
          <AlertTriangle color={colorTokens.warning} size={24} strokeWidth={2} />
          <Text style={styles.alertText}>{t("safety.contactSupport")}</Text>
          <AppLink href="/contact" style={[styles.contactBtn, webPointer]}>
            <Text style={styles.contactBtnText}>{t("footer.contactUs")}</Text>
          </AppLink>
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
  pillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 36,
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
    backgroundColor: colorTokens.brandSurface,
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
  checklistCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 28,
    marginBottom: 32,
    ...shadow,
  },
  checklistCardPhone: {
    padding: 20,
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  checklistTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colorTokens.ink,
  },
  checklistItems: {
    gap: 14,
  },
  checkItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  checkIcon: {
    marginTop: 2,
  },
  checkText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.ink,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 20,
    gap: 16,
  },
  alertBannerPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 14,
  },
  alertText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.ink,
  },
  contactBtn: {
    backgroundColor: colorTokens.brandText,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.card,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  contactBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colorTokens.surface,
  },
});
