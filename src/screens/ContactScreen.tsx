import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow, FeatureCard } from "@/components/ui";
import {
  Building2,
  Clock,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

export function ContactScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const handleEmailPress = () => {
    void Linking.openURL(`mailto:${t("contact.supportEmail")}`);
  };

  const handlePhonePress = () => {
    void Linking.openURL(`tel:+8809612466363`);
  };

  const departments: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
    {
      icon: UserCheck,
      titleKey: "contact.card1Title",
      descKey: "contact.card1Desc",
    },
    {
      icon: ShieldCheck,
      titleKey: "contact.card2Title",
      descKey: "contact.card2Desc",
    },
    {
      icon: Building2,
      titleKey: "contact.card3Title",
      descKey: "contact.card3Desc",
    },
    {
      icon: Handshake,
      titleKey: "contact.card4Title",
      descKey: "contact.card4Desc",
    },
  ];

  return (
    <AppChrome active={undefined}>
      <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
        {/* Hero Section */}
        <View style={[styles.intro, isPhone && styles.introPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("contact.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {t("contact.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("contact.subtitle")}
          </Text>
        </View>

        {/* Content Layout */}
        <View style={[styles.contentRow, isPhone && styles.contentRowPhone]}>
          {/* Office Details Card */}
          <View style={[styles.officeCard, isPhone && styles.officeCardPhone]}>
            <Text style={styles.cardSectionHeading}>{t("contact.officeHeading")}</Text>

            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <MapPin color={colorTokens.brandText} size={20} strokeWidth={2} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>{t("contact.officeName")}</Text>
                <Text style={styles.infoBody}>{t("contact.officeAddress")}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <Clock color={colorTokens.brandText} size={20} strokeWidth={2} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>{t("contact.officeHoursHeading")}</Text>
                <Text style={styles.infoBody}>{t("contact.officeHours")}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <Mail color={colorTokens.brandText} size={20} strokeWidth={2} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>{t("contact.supportEmailHeading")}</Text>
                <Pressable
                  accessibilityRole="link"
                  onPress={handleEmailPress}
                  style={webPointer}
                >
                  <Text style={styles.linkText}>{t("contact.supportEmail")}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <Phone color={colorTokens.brandText} size={20} strokeWidth={2} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>{t("contact.phoneHeading")}</Text>
                <Pressable
                  accessibilityRole="link"
                  onPress={handlePhonePress}
                  style={webPointer}
                >
                  <Text style={styles.linkText}>{t("contact.phone")}</Text>
                </Pressable>
              </View>
            </View>

            {/* Safety Notice */}
            <View style={styles.safetyBox}>
              <ShieldAlert color={colorTokens.warning} size={18} strokeWidth={2} />
              <Text style={styles.safetyText}>{t("contact.safetyNotice")}</Text>
            </View>
          </View>

          {/* Department Directory Grid */}
          <View style={[styles.directoryCol, isPhone && styles.directoryColPhone]}>
            <Text style={styles.directoryHeading}>
              {t("contact.inquiriesHeading")}
            </Text>
            <View style={[styles.grid, isPhone && styles.gridPhone]}>
              {departments.map((dept) => (
                <FeatureCard
                  key={dept.titleKey}
                  description={t(dept.descKey as any)}
                  descriptionStyle={styles.cardDesc}
                  icon={dept.icon}
                  iconWrapStyle={styles.deptIcon}
                  style={[styles.deptCard, isPhone && styles.deptCardPhone]}
                  title={t(dept.titleKey as any)}
                  titleStyle={styles.cardTitle}
                />
              ))}
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
  contentRow: {
    flexDirection: "row",
    gap: 32,
    alignItems: "flex-start",
  },
  contentRowPhone: {
    flexDirection: "column",
    gap: 24,
  },
  officeCard: {
    flex: 1,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 28,
    ...shadow,
  },
  officeCardPhone: {
    width: "100%",
    padding: 20,
  },
  cardSectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colorTokens.ink,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colorTokens.subtle,
    marginBottom: 4,
  },
  infoBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colorTokens.ink,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colorTokens.brandText,
    minHeight: 24,
  },
  safetyBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 16,
    marginTop: 12,
    alignItems: "center",
  },
  safetyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colorTokens.ink,
  },
  directoryCol: {
    flex: 1.4,
  },
  directoryColPhone: {
    width: "100%",
  },
  directoryHeading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colorTokens.ink,
    marginBottom: 20,
  },
  grid: {
    gap: 16,
  },
  gridPhone: {
    gap: 12,
  },
  deptCard: {
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    borderRadius: radius.card,
    padding: 20,
  },
  deptCardPhone: {
    padding: 16,
  },
  deptIcon: {
    backgroundColor: colorTokens.surfaceSunken,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colorTokens.subtle,
  },
});
