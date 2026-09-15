import { useResponsive } from "@/hooks/useResponsive";
import { fonts, webPointer } from "@/theme";
import { AppLink } from "@/components/ui";
import { Sparkles } from "lucide-react-native";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Line, Path, Rect } from "react-native-svg";

export function GooglePlayButton() {
  return (
    <Pressable
      accessibilityLabel="Get it on Google Play"
      style={[styles.playStoreBtn, webPointer]}
      onPress={() => {
        Alert.alert(
          "Download Homenet",
          "Homenet for Android is launching soon on the Google Play Store!"
        );
      }}
    >
      <Svg width="22" height="24" viewBox="0 0 512 512">
        <Path
          fill="#4285F4"
          d="M32.5 48.3v415.4c0 10.9 5.8 20.9 15.1 26.4l230.9-234.1L47.6 21.9c-9.3 5.5-15.1 15.5-15.1 26.4z"
        />
        <Path
          fill="#FBBC04"
          d="M380.2 329.8l-101.7-73.8 101.7-73.8 54.3 31.3c15.4 8.9 25 25.3 25 42.5s-9.6 33.6-25 42.5l-54.3 31.3z"
        />
        <Path
          fill="#EA4335"
          d="M278.5 256L47.6 489.1c11.9 6.8 26.6 6.8 38.5 0l294.1-159.3-101.7-73.8z"
        />
        <Path
          fill="#34A853"
          d="M380.2 182.2L86.1 22.9C74.2 16 59.5 16 47.6 22.9L278.5 256l101.7-73.8z"
        />
      </Svg>
      <View style={styles.playStoreTextWrap}>
        <Text style={styles.playStoreSub}>GET IT ON</Text>
        <Text style={styles.playStoreTitle}>Google Play</Text>
      </View>
    </Pressable>
  );
}

export interface FooterProps {
  style?: StyleProp<ViewStyle>;
}

export function Footer({ style }: FooterProps = {}) {
  const { isPhone, isTablet } = useResponsive();

  const resourcesLinks = [
    { label: "Stamp Duty & Tax Guide", href: "/about" },
    { label: "Property Price Index", href: "/market" },
    { label: "Property Valuation Guide", href: "/about" },
    { label: "Property News & Trends", href: "/about" },
    { label: "Buyer Guides", href: "/about" },
    { label: "Seller Guides", href: "/sell" },
    { label: "Renter Guides", href: "/rent" },
    { label: "Landlord Guides", href: "/seller" },
    { label: "Mortgage Calculator", href: "/market" },
  ];

  const searchLinks = [
    { label: "Search homes for sale", href: "/buy" },
    { label: "Search homes for rent", href: "/rent" },
    { label: "Commercial for sale", href: "/buy" },
    { label: "Commercial to rent", href: "/rent" },
    { label: "Short-let & Serviced", href: "/rent?subtype=short-let" },
    { label: "Verified listings only", href: "/buy?is_verified=true" },
    { label: "Find an agent", href: "/users" },
    { label: "Student accommodation", href: "/rent" },
    { label: "New developments", href: "/buy" },
  ];

  const locationsLinks = [
    { label: "Major areas in Dhaka", href: "/buy" },
    { label: "Gulshan", href: "/buy?location=Gulshan" },
    { label: "Banani", href: "/buy?location=Banani" },
    { label: "Dhanmondi", href: "/buy?location=Dhanmondi" },
    { label: "Uttara", href: "/buy?location=Uttara" },
    { label: "Bashundhara R/A", href: "/buy?location=Bashundhara+R%2FA" },
    { label: "Mirpur", href: "/buy?location=Mirpur" },
    { label: "Chittagong", href: "/buy?city=Chittagong" },
    { label: "Sylhet", href: "/buy?city=Sylhet" },
  ];

  const homenetLinks = [
    { label: "About Homenet", href: "/about" },
    { label: "Tech blog & AI models", href: "/about" },
    { label: "Press centre", href: "/about" },
    { label: "Investor relations", href: "/about" },
    { label: "Careers", href: "/about" },
    { label: "Contact us", href: "/about" },
    { label: "Verified agencies", href: "/users" },
  ];

  const proBenefits = [
    "Property Boosting (5x leads)",
    "Priority Notice & Alerts",
    "AI Valuation & Analytics",
    "Verified Agency Badge",
    "Direct WhatsApp Inquiries",
    "Dedicated Account Support",
    "Advertise on Homenet",
  ];

  const legalLinks = [
    { label: "Site map", href: "/about" },
    { label: "Help", href: "/about" },
    { label: "Safety and Security", href: "/about" },
    { label: "Terms of Use", href: "/about" },
    { label: "Accessibility", href: "/about" },
    { label: "Privacy Policy", href: "/about" },
  ];

  const renderSocialIcons = () => (
    <View style={styles.footerSocialIcons}>
      {/* Facebook */}
      <Pressable accessibilityLabel="Facebook" style={[styles.socialIconBtn, webPointer]}>
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="#0B1A17">
          <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </Svg>
      </Pressable>

      {/* X / Twitter */}
      <Pressable accessibilityLabel="X" style={[styles.socialIconBtn, webPointer]}>
        <Svg width="15" height="15" viewBox="0 0 24 24" fill="#0B1A17">
          <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </Svg>
      </Pressable>

      {/* Instagram */}
      <Pressable accessibilityLabel="Instagram" style={[styles.socialIconBtn, webPointer]}>
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1A17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <Line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </Svg>
      </Pressable>

      {/* TikTok */}
      <Pressable accessibilityLabel="TikTok" style={[styles.socialIconBtn, webPointer]}>
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="#0B1A17">
          <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.33 6.33 0 0 0 6.33-6.32V8.75a8.28 8.28 0 0 0 3.93 1.07V6.69z" />
        </Svg>
      </Pressable>

      {/* YouTube */}
      <Pressable accessibilityLabel="YouTube" style={[styles.socialIconBtn, webPointer]}>
        <Svg width="17" height="17" viewBox="0 0 24 24" fill="#0B1A17">
          <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </Svg>
      </Pressable>
    </View>
  );

  if (isPhone) {
    return (
      <View style={[styles.footer, style]}>
        <View style={styles.footerInnerPhone}>
          {/* Individual Card on Top: Download the Homenet app */}
          <View style={styles.mobileDownloadCard}>
            <View style={styles.mobileDownloadTextWrap}>
              <Text style={styles.mobileDownloadHeading}>Download the Homenet app</Text>
              <Text style={styles.mobileDownloadSub}>
                Explore, buy & rent properties with live AI valuation on Android.
              </Text>
            </View>
            <View style={styles.mobileDownloadBtnWrap}>
              <GooglePlayButton />
            </View>
          </View>

          {/* 2 by 2 Grid for Resources, Search, Locations, Homenet */}
          <View style={styles.footer2x2Grid}>
            {/* 1. Resources */}
            <View style={styles.footer2x2Col}>
              <Text style={styles.footerColHeading}>Resources</Text>
              {resourcesLinks.map((item) => (
                <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                  <Text style={styles.footerLinkText}>{item.label}</Text>
                </AppLink>
              ))}
            </View>

            {/* 2. Search */}
            <View style={styles.footer2x2Col}>
              <Text style={styles.footerColHeading}>Search</Text>
              {searchLinks.map((item) => (
                <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                  <Text style={styles.footerLinkText}>{item.label}</Text>
                </AppLink>
              ))}
            </View>

            {/* 3. Locations */}
            <View style={styles.footer2x2Col}>
              <Text style={styles.footerColHeading}>Locations</Text>
              {locationsLinks.map((item) => (
                <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                  <Text style={styles.footerLinkText}>{item.label}</Text>
                </AppLink>
              ))}
            </View>

            {/* 4. Homenet */}
            <View style={styles.footer2x2Col}>
              <Text style={styles.footerColHeading}>Homenet</Text>
              {homenetLinks.map((item) => (
                <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                  <Text style={styles.footerLinkText}>{item.label}</Text>
                </AppLink>
              ))}
            </View>
          </View>

          {/* Column: Professional / Pro Plan Benefits */}
          <View style={styles.mobileProCard}>
            <View style={styles.mobileProHeader}>
              <Text style={styles.footerColHeading}>Professional</Text>
              <AppLink href="/seller" style={[styles.proBadgeButton, webPointer]}>
                <Text style={styles.proBadgeText}>Homenet Pro</Text>
                <Sparkles color="#A7F3D0" size={13} />
              </AppLink>
            </View>
            <View style={styles.mobileProList}>
              {proBenefits.map((item) => (
                <AppLink href="/seller" key={item} style={styles.footerLinkWrap}>
                  <Text style={styles.footerProBenefitText}>• {item}</Text>
                </AppLink>
              ))}
            </View>
          </View>

          {/* Footer Bottom Divider */}
          <View style={styles.footerDividerLine} />

          <View style={styles.footerBottomRowPhone}>
            {/* Legal / Utility Links */}
            <View style={styles.footerLegalLinksPhone}>
              {legalLinks.map((link) => (
                <AppLink href={link.href} key={link.label} style={styles.footerLegalItemPhone}>
                  <Text style={styles.footerLegalLinkText}>{link.label}</Text>
                </AppLink>
              ))}
            </View>

            {/* Social Icons */}
            {renderSocialIcons()}
          </View>

          {/* Copyright notice */}
          <Text style={styles.footerCopyrightText}>
            Copyright © 2026 HomeNet Group Limited. All rights reserved. Bangladesh's AI property marketplace.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.footer, style]}>
      <View
        style={[
          styles.footerInner,
          isTablet && styles.footerInnerTablet,
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
          <View style={styles.footerDownloadCol}>
            <Text style={styles.footerDownloadHeading}>
              Download the{"\n"}Homenet app
            </Text>
            <GooglePlayButton />
          </View>

          {/* Column 2: Resources */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Resources</Text>
            {resourcesLinks.map((item) => (
              <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{item.label}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 3: Search */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Search</Text>
            {searchLinks.map((item) => (
              <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{item.label}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 4: Locations */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Locations</Text>
            {locationsLinks.map((item) => (
              <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{item.label}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 5: Homenet */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Homenet</Text>
            {homenetLinks.map((item) => (
              <AppLink href={item.href} key={item.label} style={styles.footerLinkWrap}>
                <Text style={styles.footerLinkText}>{item.label}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 6: Professional / Pro Plan Benefits */}
          <View style={[styles.footerCol, styles.footerProCol]}>
            <Text style={styles.footerColHeading}>Professional</Text>
            <AppLink href="/seller" style={[styles.proBadgeButton, webPointer]}>
              <Text style={styles.proBadgeText}>Homenet Pro</Text>
              <Sparkles color="#A7F3D0" size={13} />
            </AppLink>
            {proBenefits.map((item) => (
              <AppLink href="/seller" key={item} style={styles.footerLinkWrap}>
                <Text style={styles.footerProBenefitText}>{item}</Text>
              </AppLink>
            ))}
          </View>
        </View>

        {/* Footer Bottom Divider */}
        <View style={styles.footerDividerLine} />

        <View style={styles.footerBottomRow}>
          {/* Legal / Utility Links */}
          <View style={styles.footerLegalLinks}>
            {legalLinks.map((link, idx, arr) => (
              <View key={link.label} style={styles.footerLegalItem}>
                <AppLink href={link.href}>
                  <Text style={styles.footerLegalLinkText}>{link.label}</Text>
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
          Copyright © 2026 HomeNet Group Limited. All rights reserved. Bangladesh's AI property marketplace.
        </Text>
      </View>
    </View>
  );
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
    maxWidth: 1400,
    paddingHorizontal: 40,
    paddingTop: 48,
    paddingBottom: 36,
  },
  footerInnerTablet: {
    paddingHorizontal: 24,
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
    borderRadius: 16,
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
    borderRadius: 14,
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
  playStoreBtn: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  playStoreTextWrap: {
    justifyContent: "center",
  },
  playStoreSub: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontFamily: fonts.medium,
    letterSpacing: 0.5,
    lineHeight: 11,
  },
  playStoreTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: "700",
    lineHeight: 17,
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
