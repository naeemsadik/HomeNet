import { memo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { AppLink } from "@/components/ui";
import { GooglePlayButton } from "@/components/GooglePlayButton";
import { ChevronDown, Facebook, Linkedin, Youtube } from "@/components/icons";
import { useWindowSize } from "@/hooks/useResponsive";
import { isSafeLinkUrl, openExternalUrl } from "@/lib/safeUrl";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, webPointer } from "@/theme";
import {
  RESOURCE_LINKS,
  getSearchLinks,
  LOCATION_LINKS,
  HOMENET_LINKS,
  PROFESSIONAL_LINKS,
  MOBILE_LEGAL_ROWS,
  SOCIAL_LINKS,
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

const SOCIAL_ICONS = { Facebook, LinkedIn: Linkedin, YouTube: Youtube } as const;

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
      (link) => !MOBILE_LEGAL_ROWS.flat().some((m) => m.href === link.href)
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
  // Under 360 points the links sit closer, so three still fit on one line at the normal text size.
  // useWindowSize, not useWindowDimensions: the website is pre-rendered, and React keeps the
  // server's styles on hydration, so the narrow styles never applied on the live site.
  const { width } = useWindowSize();
  const narrow = width > 0 && width < 360;
  const toggle = (key: string) => setOpenKey((current) => (current === key ? null : key));

  const handleSocialPress = (url: string) => {
    if (isSafeLinkUrl(url)) {
      openExternalUrl(url);
    }
  };

  return (
    <View style={[styles.root, style]}>
      <View style={styles.sections}>
        <View style={styles.column}>
          {/* Offered on the website only: inside the app it is already installed. */}
          {Platform.OS === "web" ? (
            <View style={styles.download}>
              <Text style={styles.downloadHeading}>{t("footer.downloadHeading")}</Text>
              <GooglePlayButton />
            </View>
          ) : null}
          {getSections().map((section) => (
            <Section key={section.key} onToggle={toggle} open={openKey === section.key} section={section} />
          ))}
        </View>
      </View>

      <View style={styles.legal}>
        {/* Always on screen: left-aligned rows with a divider between neighbours. */}
        <View style={styles.column}>
          {/* With a large system font three links do not fit on a line. The row then wraps, so a
              word is never broken. Every link carries a divider on its left; the one that starts a
              line falls outside the clip and is not seen. */}
          {MOBILE_LEGAL_ROWS.map((row) => (
            <View key={row[0].href} style={styles.legalClip}>
              <View style={[styles.legalRow, narrow && styles.legalRowNarrow]} testID="footer-legal-row">
                {row.map((link) => (
                  <View key={link.href} style={[styles.legalItem, narrow && styles.legalItemNarrow]}>
                    <View style={styles.legalDivider} testID="footer-legal-divider" />
                    <AppLink href={link.href} style={styles.legalLink}>
                      <Text style={[styles.legalLinkText, narrow && styles.legalLinkTextNarrow]}>{t(link.labelKey)}</Text>
                    </AppLink>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.socialStrip}>
          {SOCIAL_LINKS.map(({ name, url }) => {
            const Icon = SOCIAL_ICONS[name];
            return (
            <Pressable
              key={name}
              accessibilityRole="link"
              accessibilityLabel={name}
              // On the web the icon is a real link (href below); opening it here too made two tabs.
              onPress={Platform.OS === "web" ? undefined : () => handleSocialPress(url)}
              {...(Platform.OS === "web"
                ? ({ href: url, hrefAttrs: { target: "_blank", rel: "noopener noreferrer" } } as any)
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
            );
          })}
        </View>

        <Text style={styles.copyrightText}>{t("footer.copyright")}</Text>
        </View>
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
  },
  // On a tablet the footer stays one readable column in the middle.
  column: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  download: {
    gap: 14,
    paddingTop: 8,
    paddingBottom: 16,
  },
  downloadHeading: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colorTokens.ink,
  },
  // 4 points of room all round, so the clip does not cut a keyboard focus ring.
  legalClip: {
    overflow: "hidden",
    margin: -4,
    padding: 4,
  },
  // Pulled left by a divider and its gap (1 + 14), which puts each line's first divider outside the clip.
  legalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginLeft: -15,
    // Takes back the last item's trailing margin, so it never causes an early wrap.
    marginRight: -14,
  },
  legalRowNarrow: {
    marginLeft: -9,
    marginRight: -8,
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    maxWidth: "100%",
    gap: 14,
    marginRight: 14,
  },
  legalItemNarrow: {
    gap: 8,
    marginRight: 8,
  },
  legalDivider: {
    width: 1,
    height: 22,
    backgroundColor: colorTokens.subtle,
    opacity: 0.45,
  },
  legalLink: {
    minHeight: 48,
    justifyContent: "center",
    flexShrink: 1,
  },
  legalLinkText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.ink,
  },
  legalLinkTextNarrow: {
    fontSize: 12,
  },
  // The icons sit in 44-point targets; the row starts left so the first icon lines up with the text.
  socialStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: -12,
    marginTop: 4,
    marginBottom: 6,
  },
  socialBtn: {
    width: 44,
    height: 44,
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
