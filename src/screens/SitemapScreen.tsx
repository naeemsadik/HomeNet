import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow } from "@/components/ui";
import {
  BookOpen,
  Building2,
  Compass,
  FileCheck2,
  KeyRound,
  ShieldCheck,
  TrendingUp,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";
import {
  RESOURCE_LINKS,
  LOCATION_LINKS,
  HOMENET_LINKS,
  PROFESSIONAL_LINKS,
  LEGAL_LINKS,
} from "@/constants/navigation";

interface SitemapSection {
  titleKey: string;
  links: { label: string; href: string }[];
}

export function SitemapScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();

  const sections: SitemapSection[] = [
    {
      titleKey: "sitemap.buySection",
      links: [
        { label: "Search homes for sale", href: "/buy" },
        { label: "Commercial properties for sale", href: "/buy?type=commercial" },
        { label: "New developments", href: "/buy?condition=new" },
        { label: "Verified listings only", href: "/buy?is_verified=true" },
        { label: "Recently sold property prices", href: "/sold" },
        ...LOCATION_LINKS.map((loc) => ({
          label: `${t(loc.labelKey)} (Sale)`,
          href: loc.href,
        })),
      ],
    },
    {
      titleKey: "sitemap.rentSection",
      links: [
        { label: "Search homes for rent", href: "/rent" },
        { label: "Commercial properties to rent", href: "/rent" },
        { label: "Short-let & serviced apartments", href: "/rent?subtype=short-let" },
        { label: "Student & bachelor housing", href: "/rent?subtype=student" },
        { label: "Gulshan (Rent)", href: "/rent/gulshan" },
        { label: "Banani (Rent)", href: "/rent/banani" },
        { label: "Dhanmondi (Rent)", href: "/rent/dhanmondi" },
        { label: "Uttara (Rent)", href: "/rent/uttara" },
        { label: "Mirpur (Rent)", href: "/rent/mirpur" },
      ],
    },
    {
      titleKey: "sitemap.resourcesSection",
      links: [
        ...RESOURCE_LINKS.map((res) => ({
          label: t(res.labelKey),
          href: res.href,
        })),
        { label: "Instant Property Valuation", href: "/instant-valuation" },
      ],
    },
    {
      titleKey: "sitemap.legalSection",
      links: [
        { label: "Property Guides & Legal Advice Hub", href: "/guides" },
        { label: "Namzari & Mutation Guide", href: "/guides/namzari-mutation-guide" },
        { label: "Bangladesh Land Measurement Units", href: "/guides/bangladesh-land-measurement-units" },
        { label: "Property Registration Checklist", href: "/guides/property-registration-checklist" },
        { label: "Rajuk Plan Approval Guide", href: "/guides/rajuk-plan-approval-guide" },
        { label: "Title Deed Verification Guide", href: "/guides/title-deed-verification-guide" },
      ],
    },
    {
      titleKey: "sitemap.companySection",
      links: [
        ...HOMENET_LINKS.map((item) => ({
          label: t(item.labelKey),
          href: item.href,
        })),
        ...PROFESSIONAL_LINKS.map((item) => ({
          label: t(item.labelKey),
          href: item.href,
        })),
        ...LEGAL_LINKS.map((item) => ({
          label: t(item.labelKey),
          href: item.href,
        })),
        { label: "Delete account", href: "/delete-account" },
      ],
    },
  ];

  return (
    <AppChrome active={undefined}>
      <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
        {/* Intro */}
        <View style={[styles.intro, isPhone && styles.introPhone]}>
          <Eyebrow style={styles.eyebrow}>{t("sitemap.eyebrow")}</Eyebrow>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {t("sitemap.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("sitemap.subtitle")}
          </Text>
        </View>

        {/* Sitemap Sections Grid */}
        <View style={styles.sectionsList}>
          {sections.map((section) => (
            <View key={section.titleKey} style={styles.sectionCard}>
              <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>
                {t(section.titleKey as any)}
              </Text>
              <View style={styles.linksGrid}>
                {section.links.map((link) => (
                  <AppLink
                    key={`${section.titleKey}-${link.href}-${link.label}`}
                    href={link.href}
                    style={[styles.linkRow, webPointer]}
                  >
                    <Text style={styles.linkText}>{link.label}</Text>
                  </AppLink>
                ))}
              </View>
            </View>
          ))}
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
  sectionsList: {
    gap: 32,
  },
  sectionCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 28,
    ...shadow,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colorTokens.ink,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  linksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 24,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: "center",
    minWidth: 260,
    flexGrow: 1,
  },
  linkText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colorTokens.brandText,
  },
});
