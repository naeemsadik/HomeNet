import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { AppLink } from "@/components/ui";
import { ChevronDown } from "@/components/icons";
import { SUPPORT_EMAIL } from "@/content/legal";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, webPointer } from "@/theme";

interface FooterLink {
  /** A translation key, or a plain name (areas are place names, the same in both languages). */
  label: TranslationKey | string;
  href: string;
}

interface FooterSection {
  key: string;
  title: TranslationKey;
  links: FooterLink[];
}

const isKey = (label: string): label is TranslationKey => label.includes(".");

/** Every link opens a page that exists. */
const SECTIONS: FooterSection[] = [
  {
    key: "resources",
    title: "footer.resources",
    links: [
      { label: "nav.guides", href: "/guides" },
      { label: "nav.insights", href: "/market" },
      { label: "nav.valuation", href: "/valuation" },
      { label: "footer.aboutHomenet", href: "/about" },
    ],
  },
  {
    key: "search",
    title: "footer.search",
    links: [
      { label: "nav.buy", href: "/buy" },
      { label: "nav.rent", href: "/rent" },
      { label: "nav.holidayStay", href: "/rent?subtype=short-let" },
      { label: "nav.sold", href: "/sold" },
      { label: "footer.commercial", href: "/buy?type=commercial" },
      { label: "footer.verifiedListings", href: "/buy?is_verified=true" },
    ],
  },
  {
    key: "locations",
    title: "footer.locations",
    links: [
      { label: "Gulshan", href: "/buy?location=Gulshan" },
      { label: "Banani", href: "/buy?location=Banani" },
      { label: "Dhanmondi", href: "/buy?location=Dhanmondi" },
      { label: "Uttara", href: "/buy?location=Uttara" },
      { label: "Bashundhara R/A", href: "/buy?location=Bashundhara+R%2FA" },
      { label: "Mirpur", href: "/buy?location=Mirpur" },
    ],
  },
  {
    key: "homenet",
    title: "footer.homenet",
    links: [
      { label: "footer.aboutHomenet", href: "/about" },
      { label: "footer.contactUs", href: `mailto:${SUPPORT_EMAIL}` },
      { label: "footer.privacyPolicy", href: "/privacy" },
      { label: "footer.termsOfUse", href: "/terms" },
    ],
  },
  {
    key: "professional",
    title: "footer.professional",
    links: [
      { label: "nav.listProperty", href: "/sell" },
      { label: "footer.sellerDashboard", href: "/seller" },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: "footer.termsOfUse", href: "/terms" },
  { label: "footer.privacyPolicy", href: "/privacy" },
  { label: "footer.deleteAccount", href: "/delete-account" },
  { label: "footer.contactUs", href: `mailto:${SUPPORT_EMAIL}` },
];

const Section = memo(function Section({
  section,
  open,
  onToggle,
}: {
  section: FooterSection;
  open: boolean;
  onToggle: (key: string) => void;
}) {
  const { t } = useTranslation();
  const title = t(section.title);

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        onPress={() => onToggle(section.key)}
        style={[styles.sectionHeader, webPointer]}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={open ? styles.chevronOpen : undefined}>
          <ChevronDown color={colorTokens.ink} size={20} strokeWidth={2.2} />
        </View>
      </Pressable>
      {open ? (
        <View style={styles.links}>
          {section.links.map((link) => (
            <AppLink href={link.href} key={`${section.key}-${link.href}-${link.label}`} style={styles.linkRow}>
              <Text style={styles.linkText}>{isKey(link.label) ? t(link.label) : link.label}</Text>
            </AppLink>
          ))}
        </View>
      ) : null}
    </View>
  );
});

/**
 * The phone footer: collapsed sections that open on tap, then the policy links
 * and the copyright line. Only one section is open at a time, so the footer
 * never grows taller than the open list.
 */
export function MobileFooter({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((current) => (current === key ? null : key));

  return (
    <View style={style}>
      <View style={styles.sections}>
        {SECTIONS.map((section) => (
          <Section key={section.key} onToggle={toggle} open={openKey === section.key} section={section} />
        ))}
      </View>

      <View style={styles.legal}>
        {[LEGAL.slice(0, 2), LEGAL.slice(2)].map((row) => (
          <View key={row[0].href} style={styles.legalRow}>
            {row.map((link, index) => (
              <View key={link.href} style={[styles.legalItem, index > 0 && styles.legalDivider]}>
                <AppLink href={link.href}>
                  <Text style={styles.legalText}>{t(link.label as TranslationKey)}</Text>
                </AppLink>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.copyright}>{t("footer.copyright")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    backgroundColor: colorTokens.surfaceSunken,
    paddingHorizontal: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  sectionHeader: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colorTokens.ink,
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  links: {
    paddingBottom: 12,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colorTokens.ink,
  },
  legal: {
    backgroundColor: colorTokens.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  legalRow: {
    flexDirection: "row",
  },
  legalItem: {
    paddingRight: 14,
  },
  legalDivider: {
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: colorTokens.divider,
  },
  legalText: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colorTokens.ink,
  },
  copyright: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colorTokens.muted,
  },
});
