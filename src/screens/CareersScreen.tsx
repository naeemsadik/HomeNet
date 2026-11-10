import { Linking, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppButton, Eyebrow } from "@/components/ui";
import { Briefcase, Send, ShieldCheck, Users, Zap } from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, shadow } from "@/theme";

const CAREERS_EMAIL = "careers@homenetbd.com";

export function CareersScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();

  const handleApply = () => {
    const subject = encodeURIComponent(t("careers.emailSubject"));
    const mailtoUrl = `mailto:${CAREERS_EMAIL}?subject=${subject}`;
    void Linking.openURL(mailtoUrl).catch(() => {});
  };

  const values = [
    {
      icon: Users,
      title: t("careers.cultureTitle"),
      desc: t("careers.cultureDesc"),
    },
    {
      icon: Zap,
      title: t("careers.autonomyTitle"),
      desc: t("careers.autonomyDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("careers.trustTitle"),
      desc: t("careers.trustDesc"),
    },
  ];

  return (
    <AppChrome active="home">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Hero Section */}
        <View style={[styles.hero, isPhone && styles.heroPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("careers.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}
          >
            {t("careers.headline")}
          </Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>
            {t("careers.subheading")}
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text
            accessibilityRole="header"
            aria-level={2}
            style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
          >
            {t("careers.valuesTitle")}
          </Text>
          <View style={[styles.valuesGrid, isPhone && styles.valuesGridPhone]}>
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.title}
                  style={[styles.valueCard, isPhone && styles.valueCardPhone]}
                >
                  <View style={styles.valueIconWrap}>
                    <Icon color={colorTokens.brandText} size={22} />
                  </View>
                  <Text style={styles.valueCardTitle}>{item.title}</Text>
                  <Text style={styles.valueCardDesc}>{item.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Open Positions Section */}
        <View style={styles.section}>
          <Text
            accessibilityRole="header"
            aria-level={2}
            style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}
          >
            {t("careers.openPositionsTitle")}
          </Text>
          <View style={[styles.fallbackCard, isPhone && styles.fallbackCardPhone]}>
            <View style={styles.fallbackIconWrap}>
              <Briefcase color={colorTokens.brandText} size={24} />
            </View>
            <Text style={styles.fallbackTitle}>
              {t("careers.noOpeningsHeading")}
            </Text>
            <Text style={styles.fallbackNotice}>
              {t("careers.fallbackNotice")}
            </Text>
            <AppButton
              label={t("careers.sendApplication")}
              icon={Send}
              onPress={handleApply}
              variant="primary"
              style={[styles.applyButton, isPhone && styles.applyButtonPhone]}
            />
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 72,
  },
  containerPhone: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 48,
  },
  hero: {
    alignItems: "center",
    marginBottom: 48,
  },
  heroPhone: {
    marginBottom: 32,
  },
  eyebrow: {
    marginBottom: 12,
    fontSize: 12,
  },
  heroTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  heroTitlePhone: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  heroCopy: {
    maxWidth: 620,
    marginTop: 14,
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
  },
  heroCopyPhone: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitlePhone: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 16,
  },
  valuesGrid: {
    flexDirection: "row",
    gap: 18,
    width: "100%",
  },
  valuesGridPhone: {
    flexDirection: "column",
    gap: 14,
  },
  valueCard: {
    flex: 1,
    minHeight: 44,
    padding: 24,
    borderRadius: radius.card,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
    ...shadow,
  },
  valueCardPhone: {
    padding: 20,
  },
  valueIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  valueCardTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  valueCardDesc: {
    color: colorTokens.body,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  fallbackCard: {
    width: "100%",
    padding: 36,
    borderRadius: radius.card,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
    alignItems: "center",
    ...shadow,
  },
  fallbackCardPhone: {
    padding: 24,
  },
  fallbackIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  fallbackTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 8,
    textAlign: "center",
  },
  fallbackNotice: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 480,
    marginBottom: 24,
  },
  applyButton: {
    minHeight: 44,
    minWidth: 160,
    paddingHorizontal: 24,
  },
  applyButtonPhone: {
    width: "100%",
  },
});
