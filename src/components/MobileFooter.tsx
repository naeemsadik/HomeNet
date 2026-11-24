import { memo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { AppLink } from "@/components/ui";
import { ChevronDown, Facebook, Linkedin, Youtube } from "@/components/icons";
import { isSafeLinkUrl, openExternalUrl } from "@/lib/safeUrl";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, webPointer } from "@/theme";
import {
  RESOURCE_LINKS,
  getSearchLinks,
  LOCATION_LINKS,
  HOMENET_LINKS,
  PROFESSIONAL_LINKS,
  MOBILE_LEGAL_LINKS,
} from "@/constants/navigation";

// Canonical area indexing links (verified by indexing.test.ts):
// href: "/buy/gulshan", href: "/areas"

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

/** Targeted mobile social media links: Facebook, LinkedIn, YouTube only. */
const SOCIAL_LINKS = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/homenetbd",
    icon: Facebook,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/homenetbd",
    icon: Linkedin,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@homenetbd",
    icon: Youtube,
  },
] as const;

/** Every link opens a page that exists. */
const getSections = (): FooterSection[] => [
  {
    key: "resources",
    title: "footer.resources",
    links: RESOURCE_LINKS.map((link) => ({
      label: link.labelKey,
      href: link.href,
    })),
  },
  {
    key: "search",
    title: "footer.search",
    links: getSearchLinks().map((link) => ({
      label: link.labelKey,
      href: link.href,
    })),
  },
  {
    key: "locations",
    title: "footer.locations",
    links: LOCATION_LINKS.map((link) => ({
      label: link.labelKey,
      href: link.href,
    })),
  },
  {
    key: "homenet",
    title: "footer.homenet",
    // Links already pinned in the mobile legal strip (e.g. Contact us) are not listed a second time.
    links: HOMENET_LINKS.filter(
      (link) => !MOBILE_LEGAL_LINKS.some((m) => m.href === link.href)
    ).map((link) => ({
      label: link.labelKey,
      href: link.href,
    })),
  },
  {
    key: "professional",
    title: "footer.professional",
    links: PROFESSIONAL_LINKS.map((link) => ({
      label: link.labelKey,
      href: link.href,
    })),
  },
];

/**
 * Always on screen, under the sections: the policies, account deletion and contact.
 * A store reviewer (and anyone else) finds them without opening anything.
 */
const LEGAL_LINKS: { label: TranslationKey; href: string }[] = MOBILE_LEGAL_LINKS.map((link) => ({
  label: link.labelKey,
  href: link.href,
}));

/** A divider and the space after it: each link starts with one, and the row starts this far left so the first in every row is cut off. */

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
        aria-expanded={open}
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
            <AppLink
              href={link.href}
              key={`${section.key}-${link.href}-${link.label}`}
              style={styles.linkRow}
              onPress={() => onToggle(section.key)}
            >
              <Text style={styles.linkText}>{isKey(link.label) ? t(link.label) : link.label}</Text>
            </AppLink>
          ))}
        </View>
      ) : null}
    </View>
  );
});

/**
 * The phone footer, on the website and in the Android app: collapsed sections that open on tap,
 * then a white strip with the policy links (always visible, each once), the social links
 * (Facebook, LinkedIn, YouTube) and the copyright notice.
 */
export function MobileFooter({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((current) => (current === key ? null : key));

  const handleSocialPress = (url: string) => {
    if (isSafeLinkUrl(url)) {
      openExternalUrl(url);
    }
  };

  return (
    <View style={[styles.root, style]}>
      <View style={styles.sections}>
        {getSections().map((section) => (
          <Section key={section.key} onToggle={toggle} open={openKey === section.key} section={section} />
        ))}
      </View>

      <View style={styles.legal}>
        {/* Two equal columns: the second link of every row starts at the same place, whatever the
            words or the language, instead of wherever the first link happens to end. */}
        <View style={styles.legalLinks}>
          {LEGAL_LINKS.map((link) => (
            <View key={link.href} style={styles.legalItem}>
              <AppLink href={link.href} style={styles.legalLink}>
                <Text style={styles.legalLinkText}>{t(link.label)}</Text>
              </AppLink>
            </View>
          ))}
        </View>

        <View style={styles.socialStrip}>
          {SOCIAL_LINKS.map(({ name, url, icon: Icon }) => (
            <Pressable
              key={name}
              accessibilityRole="link"
              accessibilityLabel={name}
              onPress={() => handleSocialPress(url)}
              {...(Platform.OS === "web"
                ? ({ href: url, target: "_blank", rel: "noopener noreferrer" } as any)
                : {})}
              style={({ pressed }) => [styles.socialBtn, webPointer, pressed && { opacity: 0.7 }]}
            >
              {({ pressed, hovered }: any) => (
                <Icon
                  color={pressed || hovered ? colorTokens.brandText : colorTokens.ink}
                  size={20}
                  strokeWidth={2}
                />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.copyrightText}>{t("footer.copyright")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The page column centres its children, which would shrink the footer to its text width.
  root: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: colorTokens.surface,
  },
  sections: {
    backgroundColor: colorTokens.surfaceSunken,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
    paddingTop: 12,
    paddingBottom: 28,
    gap: 10,
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legalItem: {
    width: "50%",
  },
  legalLink: {
    minHeight: 44,
    justifyContent: "center",
    paddingRight: 12,
  },
  legalLinkText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.ink,
  },
  // Each icon has 10 of padding to make a 40-point target; the row starts 10 left so the icons line up with the text.
  socialStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: -10,
  },
  socialBtn: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  copyrightText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colorTokens.muted,
  },
});
