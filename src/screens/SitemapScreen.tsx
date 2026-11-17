import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, webPointer } from "@/theme";
import {
  HOMENET_LINKS,
  LEGAL_LINKS,
  LOCATION_LINKS,
  PROFESSIONAL_LINKS,
  RESOURCE_LINKS,
  STUDENT_ACCOMMODATION_HREF,
} from "@/constants/navigation";

interface SitemapLink {
  label: string;
  href: string;
}

interface SitemapSection {
  titleKey: string;
  links: SitemapLink[];
}

/** An area page lives at /buy/<slug> and /rent/<slug>; "All areas" has no rent twin. */
const areaSlug = (href: string) => href.replace(/^\/buy\//, "");

/**
 * The site map reads like a printed index: a plain heading, then its links in a
 * single list, with the headings set in columns. No cards, no boxes.
 */
export function SitemapScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet, containerMaxWidth } = useResponsive();
  const columns = isPhone ? 1 : isTablet ? 2 : 3;

  const areas = LOCATION_LINKS.filter((loc) => loc.href.startsWith("/buy/"));

  const sections: SitemapSection[] = [
    {
      titleKey: "sitemap.buySection",
      links: [
        { label: "Search homes for sale", href: "/buy" },
        { label: "Commercial properties for sale", href: "/buy?type=commercial" },
        { label: "New developments", href: "/buy?condition=new" },
        { label: "Verified listings only", href: "/buy?is_verified=true" },
        { label: "Recently sold property prices", href: "/sold" },
      ],
    },
    {
      titleKey: "sitemap.rentSection",
      links: [
        { label: "Search homes for rent", href: "/rent" },
        { label: "Short-let & serviced apartments", href: "/rent?subtype=short-let" },
        ...(STUDENT_ACCOMMODATION_HREF ? [{ label: t("mess.nav"), href: STUDENT_ACCOMMODATION_HREF }] : []),
      ],
    },
    {
      titleKey: "sitemap.areasSaleSection",
      links: [
        { label: t("footer.allAreas"), href: "/areas" },
        ...areas.map((loc) => ({ label: t(loc.labelKey), href: loc.href })),
      ],
    },
    {
      titleKey: "sitemap.areasRentSection",
      links: areas.map((loc) => ({ label: t(loc.labelKey), href: `/rent/${areaSlug(loc.href)}` })),
    },
    {
      titleKey: "sitemap.resourcesSection",
      links: [
        ...RESOURCE_LINKS.map((res) => ({ label: t(res.labelKey), href: res.href })),
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
        ...HOMENET_LINKS.map((item) => ({ label: t(item.labelKey), href: item.href })),
        ...PROFESSIONAL_LINKS.map((item) => ({ label: t(item.labelKey), href: item.href })),
        ...LEGAL_LINKS.map((item) => ({ label: t(item.labelKey), href: item.href })),
        { label: "Delete account", href: "/delete-account" },
      ],
    },
  ];

  return (
    <AppChrome active={undefined}>
      <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
        <Text accessibilityRole="header" aria-level={1} style={[styles.title, isPhone && styles.titlePhone]}>
          {t("sitemap.title")}
        </Text>

        <View style={styles.sections}>
          {sections.map((section) => (
            <View key={section.titleKey} style={{ width: `${100 / columns}%`, paddingRight: isPhone ? 0 : 32 }}>
              <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>
                {t(section.titleKey as never)}
              </Text>
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
    paddingTop: 40,
    paddingBottom: 64,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
    color: colorTokens.ink,
    marginBottom: 32,
  },
  titlePhone: { fontSize: 26, lineHeight: 32, marginBottom: 24 },
  sections: { flexDirection: "row", flexWrap: "wrap", rowGap: 40 },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  linkRow: { minHeight: 44, justifyContent: "center" },
  linkText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colorTokens.brandText },
});
