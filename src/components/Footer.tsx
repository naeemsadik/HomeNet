import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts, layout, webPointer, radiusTokens } from "@/theme";
import { AppLink } from "@/components/ui";
import { MobileFooter } from "@/components/MobileFooter";
import { GooglePlayButton } from "@/components/GooglePlayButton";
import {
  RESOURCE_LINKS,
  SEARCH_LINKS,
  getSearchLinks,
  LOCATION_LINKS,
  HOMENET_LINKS,
  PROFESSIONAL_LINKS,
  LEGAL_LINKS,
  STUDENT_ACCOMMODATION_HREF,
  type NavigationLinkItem,
  type ResourceLinkItem,
  SOCIAL_LINKS,
} from "@/constants/navigation";

// Canonical area indexing links (verified by indexing.test.ts):
// href: "/buy/gulshan", href: "/areas"

export { GooglePlayButton };

export {
  RESOURCE_LINKS,
  SEARCH_LINKS,
  getSearchLinks,
  LOCATION_LINKS,
  HOMENET_LINKS,
  PROFESSIONAL_LINKS,
  LEGAL_LINKS,
  STUDENT_ACCOMMODATION_HREF,
  type NavigationLinkItem,
  type ResourceLinkItem,
};

import { useTranslation } from "@/i18n";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { openExternalUrl } from "@/lib/safeUrl";
import { Facebook, Linkedin, Youtube } from "@/components/icons";

const SOCIAL_ICONS = { Facebook, LinkedIn: Linkedin, YouTube: Youtube } as const;

export interface FooterProps {
  style?: StyleProp<ViewStyle>;
  /** The collapsible phone footer, for pages that keep to a short phone layout. */
  compact?: boolean;
}

function WebFooter({ style }: FooterProps) {
  const { t } = useTranslation();
  const { isPhone, isTablet, isCompact, containerMaxWidth } = useResponsive();
  // Below desktop width the six columns sit three to a row, all one width, so the rows line up.
  const third = isCompact ? styles.footerColThird : null;

  const renderSocialIcons = () => (
    <View style={styles.footerSocialIcons}>
      {SOCIAL_LINKS.map(({ name, url }) => {
        const Icon = SOCIAL_ICONS[name];
        return (
          <Pressable
            key={name}
            accessibilityRole="link"
            accessibilityLabel={name}
            hitSlop={8}
            onPress={() => openExternalUrl(url)}
            style={({ pressed }) => [styles.socialIconBtn, webPointer, pressed && { opacity: 0.7 }]}
          >
            <Icon color={colorTokens.ink} size={18} strokeWidth={2} />
          </Pressable>
        );
      })}
    </View>
  );

  if (isPhone) return <MobileFooter style={style} />;

  return (
    <View style={[styles.footer, style]}>
      <View
        style={[
          styles.footerInner,
          isTablet && styles.footerInnerTablet,
          { maxWidth: containerMaxWidth },
        ]}
      >
        {/* Main Columns (Desktop / PC) */}
        <View
          style={[
            styles.footerColumns,
            isTablet && styles.footerColumnsTablet,
          ]}
        >
          {/* Column 1: Download the Homenet app */}
          <View style={[styles.footerDownloadCol, third]}>
            <Text style={styles.footerDownloadHeading}>
              {t("footer.downloadHeading")}
            </Text>
            <GooglePlayButton />
          </View>

          {/* Column 2: Resources */}
          <View style={[styles.footerCol, third]}>
            <Text style={styles.footerColHeading}>{t("footer.resources")}</Text>
            {RESOURCE_LINKS.map((item) => (
              <AppLink href={item.href} key={item.href} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{t(item.labelKey)}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 3: Search */}
          <View style={[styles.footerCol, third]}>
            <Text style={styles.footerColHeading}>{t("footer.search")}</Text>
            {getSearchLinks().map((item) => (
              <AppLink href={item.href} key={item.href} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{t(item.labelKey)}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 4: Locations */}
          <View style={[styles.footerCol, third]}>
            <Text style={styles.footerColHeading}>{t("footer.locations")}</Text>
            {LOCATION_LINKS.map((item) => (
              <AppLink href={item.href} key={item.href} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{t(item.labelKey)}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 5: Homenet */}
          <View style={[styles.footerCol, third]}>
            <Text style={styles.footerColHeading}>{t("footer.homenet")}</Text>
            {HOMENET_LINKS.map((item) => (
              <AppLink href={item.href} key={item.href} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{t(item.labelKey)}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 6: Professional / Pro Plan Benefits */}
          <View style={[styles.footerCol, styles.footerProCol, third]}>
            <Text style={styles.footerColHeading}>{t("footer.professional")}</Text>
            <AppLink href="/seller" style={[styles.proBadgeButton, webPointer]}>
              <Text style={styles.proBadgeText}>{t("footer.homenetPro")}</Text>
            </AppLink>
            {PROFESSIONAL_LINKS.map((item) => (
              <AppLink href={item.href} key={item.href} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{t(item.labelKey)}</Text>
              </AppLink>
            ))}
          </View>
        </View>

        {/* Footer Bottom Divider */}
        <View style={styles.footerDividerLine} />

        <View style={styles.footerBottomRow}>
          {/* Legal / Utility Links */}
          <View style={styles.footerLegalLinks}>
            {LEGAL_LINKS.map((link, idx, arr) => (
              <View key={link.href} style={styles.footerLegalItem}>
                <AppLink href={link.href}>
                  <Text style={styles.footerLegalLinkText}>{t(link.labelKey)}</Text>
                </AppLink>
                {idx < arr.length - 1 ? (
                  <Text style={styles.footerLegalPipe}>|</Text>
                ) : null}
              </View>
            ))}
          </View>

          {/* Social Icons */}
          {renderSocialIcons()}
        </View>

        {/* Copyright notice */}
        <Text style={styles.footerCopyrightText}>
          {t("footer.copyright")}
        </Text>
      </View>
    </View>
  );
}

/**
 * The Android app and compact pages get the phone footer: its policy strip keeps Privacy, Terms,
 * Delete account and Contact on screen without opening a section. The website's full footer
 * (a Google Play badge, links that open /about) has no place inside the app.
 */
export function Footer({ style, compact }: FooterProps = {}) {
  if (Platform.OS !== "web" || compact) return <MobileFooter style={style} />;
  return <WebFooter style={style} />;
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    backgroundColor: "#F4F6F5",
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
  },
  footerInner: {
    width: "100%",
    maxWidth: layout.containerMaxWidth,
    paddingHorizontal: layout.gutter,
    paddingTop: 48,
    paddingBottom: 36,
  },
  footerInnerTablet: {
    paddingHorizontal: layout.gutterTablet,
    paddingTop: 36,
    paddingBottom: 28,
  },
  footerInnerPhone: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
    width: "100%",
  },
  mobileDownloadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radiusTokens.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    marginBottom: 26,
    shadowColor: "rgba(11, 26, 23, 0.05)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  mobileDownloadTextWrap: {
    flex: 1,
    gap: 4,
    paddingRight: 6,
  },
  mobileDownloadHeading: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
    letterSpacing: -0.25,
  },
  mobileDownloadSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    lineHeight: 17,
  },
  mobileDownloadBtnWrap: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  footer2x2Grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 24,
    columnGap: 14,
    marginBottom: 20,
  },
  footer2x2Col: {
    width: "47%",
    minWidth: 135,
    gap: 5,
  },
  mobileProCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radiusTokens.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
    marginTop: 6,
    marginBottom: 10,
    gap: 10,
  },
  mobileProHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mobileProList: {
    gap: 4,
  },
  footerColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
  },
  footerColumnsTablet: {
    columnGap: 24,
    rowGap: 28,
  },
  footerDownloadCol: {
    minWidth: 170,
    flex: 1.1,
  },
  footerDownloadHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  footerColThird: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "30%",
    minWidth: 0,
  },
  footerCol: {
    flex: 1,
    minWidth: 140,
    gap: 6,
  },
  footerProCol: {
    minWidth: 180,
    flex: 1.2,
  },
  footerColHeading: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  footerLinkWrap: {
    paddingVertical: 2,
  },
  footerLinkText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  proBadgeButton: {
    backgroundColor: "#0B1A17",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  footerProBenefitText: {
    color: "#2C3E38",
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  footerDividerLine: {
    height: 1,
    backgroundColor: "rgba(11, 26, 23, 0.08)",
    marginTop: 40,
    marginBottom: 20,
    width: "100%",
  },
  footerBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  footerBottomRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 14,
  },
  footerLegalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  footerLegalLinksPhone: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  footerLegalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLegalItemPhone: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  footerLegalLinkText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
  footerLegalPipe: {
    color: "rgba(11, 26, 23, 0.22)",
    fontSize: 12,
  },
  footerSocialIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  socialIconBtn: {
    padding: 3,
  },
  footerCopyrightText: {
    color: "#8C9A95",
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 14,
  },
});
