import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import {
  Bell,
  ChevronDown,
  Heart,
  Home,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { router } from "expo-router";
import { Brand } from "./Brand";
import { LoginModal } from "./LoginModal";
import { AiFinderModal } from "./AiFinderModal";
import { AppLink } from "./ui";

export type ActivePage =
  | "home"
  | "search"
  | "buy"
  | "rent"
  | "saved"
  | "sell"
  | "ai"
  | "market"
  | "property"
  | "profile"
  | "users"
  | "seller"
  | "messages";

const sidebarNav: {
  label: string;
  href: string;
  icon: LucideIcon;
  key: ActivePage;
  badge?: number;
  authGated?: boolean;
}[] = [
    { label: "Home", href: "/", icon: Home, key: "home" },
    { label: "Insights", href: "/market", icon: TrendingUp, key: "market" },
    { label: "Saved", href: "/saved", icon: Heart, key: "saved", authGated: true },
    { label: "Profile", href: "/profile", icon: User, key: "profile", authGated: true },
  ];

function SideBar({
  active,
  onNavigate,
  modal = false,
}: {
  active: ActivePage;
  onNavigate?: () => void;
  modal?: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.sidebar, modal && styles.sidebarModal]}
    >
      <View style={styles.sidebarTop}>
        <Brand />
        {modal ? (
          <Pressable
            accessibilityLabel="Close navigation"
            onPress={onNavigate}
            style={[styles.circleButton, webPointer]}
          >
            <X color={colors.muted} size={19} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.sideNav}>
        {sidebarNav
          .filter((item) => item.key !== "saved" || Boolean(user))
          .map(({ label, href, icon: Icon, key, badge, authGated }) => {
          const selected =
            active === key ||
            ((key === "search" || key === "buy") &&
              (active === "search" ||
                active === "buy" ||
                active === "property" ||
                active === "rent"));

          const handlePress = () => {
            onNavigate?.();
            if (authGated && !user) {
              useAuthModalStore.getState().open(() => router.push(href as any));
            } else {
              router.push(href as any);
            }
          };

          return (
            <Pressable
              key={key}
              onPress={handlePress}
              style={({ pressed }) => [
                styles.sideLink,
                selected && styles.sideLinkActive,
                webPointer,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="link"
            >
              <Icon
                color={selected ? "#04cf92" : "#5C6B66"}
                size={20}
                strokeWidth={selected ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.sideLinkText,
                  selected && styles.sideLinkTextActive,
                ]}
              >
                {label}
              </Text>
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarSpacer} />

      {/* List your property Card (Figma node 1:2025) */}
      <View style={styles.sidebarCard}>
        <View style={styles.sidebarCardIconWrap}>
          <Sparkles color="#FFFFFF" size={20} />
        </View>
        <Text style={styles.sidebarCardTitle}>List your property</Text>
        <Text style={styles.sidebarCardSubtitle}>
          Get AI pricing & reach 2M+ buyers.
        </Text>
        <AppLink href="/sell" style={styles.postAdButton} onPress={onNavigate}>
          <Text style={styles.postAdButtonText}>Post an ad</Text>
        </AppLink>
      </View>
    </SafeAreaView>
  );
}

function TopBar({
  active,
  onOpenMenu,
}: {
  active?: ActivePage;
  onOpenMenu?: () => void;
}) {
  const { isTablet, isPhone } = useResponsive();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuthStore();

    const topNavLinks: {
      label: string;
      href: string;
      key: string;
      authGated?: boolean;
    }[] = [
      ...(user ? [{ label: "Saved", href: "/saved", key: "saved", authGated: true }] : []),
    ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.topbarSafe}
    >
      <View
        style={[
          styles.topbar,
          isTablet && styles.topbarTablet,
          isPhone && styles.topbarPhone,
        ]}
      >
        {/* Left: Brand + Hamburger (mobile) */}
        <View style={[styles.topbarLeft, isPhone && styles.topbarLeftPhone]}>
          {isTablet ? (
            <Pressable
              onPress={onOpenMenu}
              style={[styles.menuButton, isPhone && styles.menuButtonPhone, webPointer]}
              accessibilityLabel="Open navigation menu"
            >
              <Menu color="#0B1A17" size={isPhone ? 18 : 20} />
            </Pressable>
          ) : null}
          <Brand compact={isTablet} />
        </View>

        {/* Center: Desktop Nav Links (only when links exist) */}
        {!isTablet && topNavLinks.length > 0 ? (
          <View style={styles.topNavCenter}>
            {topNavLinks.map((link) => {
              const isSelected =
                active === link.key ||
                (link.key === "buy" && (active === "search" || active === "property"));

              const handlePress = () => {
                if (link.authGated && !user) {
                  useAuthModalStore.getState().open(() => router.push(link.href as any));
                } else {
                  router.push(link.href as any);
                }
              };

              return (
                <Pressable
                  key={link.label}
                  onPress={handlePress}
                  style={({ pressed }) => [
                    styles.topNavLink,
                    webPointer,
                    pressed && { opacity: 0.8 },
                  ]}
                  accessibilityRole="link"
                >
                  <Text
                    style={[
                      styles.topNavLinkText,
                      isSelected && styles.topNavLinkTextActive,
                    ]}
                  >
                    {link.label}
                  </Text>
                  {isSelected ? <View style={styles.topNavIndicator} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={[styles.topRightActions, isPhone && styles.topRightActionsPhone]}>
          {user ? (
            <>
              {/* Notification Button */}
              <View style={styles.notificationWrap}>
                <Pressable
                  accessibilityLabel="Open notifications"
                  onPress={() => setNotificationsOpen((open) => !open)}
                  style={[styles.iconCircleButton, isPhone && styles.iconCircleButtonPhone, webPointer]}
                >
                  <Bell color="#0B1A17" size={isPhone ? 16 : 19} />
                </Pressable>
                {notificationsOpen ? (
                  <View style={styles.notificationPopover}>
                    <Text style={styles.notificationTitle}>Notifications</Text>
                    <Text style={styles.notificationCopy}>
                      You have no new notifications.
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Avatar */}
              <AppLink
                href="/profile"
                accessibilityLabel="Open profile"
                style={[styles.avatarButton, isPhone && styles.avatarButtonPhone]}
              >
                <Image
                  source={{
                    uri:
                      user.avatar_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
                  }}
                  style={[styles.avatarImage, isPhone && styles.avatarImagePhone]}
                />
              </AppLink>
            </>
          ) : (
            /* Previous Sign In Button Design (White background, emerald border, User icon) */
            <Pressable
              onPress={() => setAuthModalOpen(true)}
              accessibilityLabel="Sign in"
              style={({ pressed }) => [
                styles.rightmoveSignInBtn,
                isPhone && styles.rightmoveSignInBtnPhone,
                webPointer,
                pressed && { opacity: 0.85, backgroundColor: "rgba(0, 207, 146, 0.08)" },
              ]}
            >
              <User
                color="#04cf92"
                size={isPhone ? 15 : 17}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.rightmoveSignInText,
                  isPhone && styles.rightmoveSignInTextPhone,
                ]}
              >
                Sign in
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <LoginModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </SafeAreaView>
  );
}

function GooglePlayButton() {
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

function Footer() {
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
      <View style={styles.footer}>
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
    <View style={styles.footer}>
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

function MobileNav({ active }: { active: ActivePage }) {
  const user = useAuthStore((s) => s.user);
  const links = [
    { label: "Home", href: "/", icon: Home, selected: active === "home", authGated: false },
    {
      label: "Insights",
      href: "/market",
      icon: TrendingUp,
      selected: active === "market",
      authGated: false,
    },
    ...(user
      ? [
          {
            label: "Saved",
            href: "/saved",
            icon: Heart,
            selected: active === "saved",
            authGated: true,
          },
        ]
      : []),
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      selected: active === "profile",
      authGated: true,
    },
  ];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={styles.mobileNavSafe}
    >
      <View style={styles.mobileNav}>
        {links.map(({ label, href, icon: Icon, selected, authGated }) => {
          const handlePress = () => {
            if (authGated && !user) {
              useAuthModalStore.getState().open(() => router.push(href as any));
            } else {
              router.push(href as any);
            }
          };

          return (
            <Pressable
              key={label}
              onPress={handlePress}
              style={({ pressed }) => [
                styles.mobileNavLink,
                webPointer,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="link"
            >
              <Icon
                color={selected ? "#04cf92" : "#7B8983"}
                size={20}
                strokeWidth={selected ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.mobileNavText,
                  selected && styles.mobileNavTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function AppChrome({
  children,
  active,
}: {
  children: ReactNode;
  active: ActivePage;
}) {
  const { isTablet, isPhone } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.shell}>
      <View style={styles.pageColumn}>
        <TopBar active={active} onOpenMenu={() => setMenuOpen(true)} />
        <ScrollView
          contentContainerStyle={styles.pageScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          <View style={[styles.mainGutter, isPhone && styles.mainGutterPhone]}>
            <View style={[styles.main, isPhone && styles.mainPhone]}>{children}</View>
          </View>
          <Footer />
        </ScrollView>
        {isTablet ? <MobileNav active={active} /> : null}
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
        transparent
        visible={isTablet && menuOpen}
      >
        <View style={styles.drawerLayer}>
          <Pressable
            accessibilityLabel="Close navigation"
            onPress={() => setMenuOpen(false)}
            style={styles.drawerOverlay}
          />
          <SideBar
            active={active}
            modal
            onNavigate={() => setMenuOpen(false)}
          />
        </View>
      </Modal>
      <AiFinderModal />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  sidebar: {
    width: 256,
    paddingLeft: 16,
    paddingRight: 16.8,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1.8,
    borderRightColor: "rgba(11, 26, 23, 0.05)",
  },
  sidebarModal: {
    width: 260,
    borderRightWidth: 0,
    ...shadow,
  },
  sidebarTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  circleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
  },
  sideNav: {
    gap: 4,
    width: "100%",
  },
  sideLink: {
    width: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  sideLinkActive: {
    backgroundColor: "#E6FAF4",
  },
  sideLinkText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  sideLinkTextActive: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontWeight: "600",
  },
  badge: {
    marginLeft: "auto",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F4823A",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  sidebarSpacer: {
    flex: 1,
    minHeight: 30,
  },
  sidebarCard: {
    padding: 16,
    backgroundColor: "#E6FAF4",
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  sidebarCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarCardTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  sidebarCardSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  postAdButton: {
    width: "100%",
    height: 38.4,
    backgroundColor: "#04cf92",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  postAdButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  pageColumn: {
    width: "100%",
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  pageColumnMobile: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
  },
  topbarSafe: {
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.2,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
    width: "100%",
  },
  topbar: {
    width: "100%",
    maxWidth: 1600,
    marginHorizontal: "auto",
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 12,
    gap: 16,
  },
  topbarTablet: {
    minHeight: 64,
    paddingHorizontal: 16,
  },
  topbarPhone: {
    minHeight: 56,
    paddingHorizontal: 8,
    gap: 4,
  },
  topbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  topbarLeftPhone: {
    gap: 6,
  },
  topNavCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },
  topNavLink: {
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  topNavLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1A17",
    letterSpacing: -0.2,
  },
  topNavLinkTextActive: {
    color: "#04cf92",
    fontWeight: "700",
  },
  topNavIndicator: {
    position: "absolute",
    bottom: 0,
    left: 4,
    right: 4,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: "#04cf92",
  },
  mobileBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F8FAF9",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  menuButtonPhone: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F8FAF9",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  authPillPhone: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  authPillText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 120,
  },
  authPillTextPhone: {
    fontSize: 11,
    maxWidth: 80,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  notificationButtonPhone: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F4823A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  topRightActionsPhone: {
    gap: 6,
    flexShrink: 0,
  },
  rightmoveSignInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: "#04cf92",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    height: 38,
    flexShrink: 0,
  },
  rightmoveSignInBtnPhone: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 32,
    gap: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  rightmoveSignInText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "700",
  },
  rightmoveSignInTextPhone: {
    fontSize: 12.5,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  locationPillPhone: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    gap: 3,
    borderWidth: 1.2,
  },
  locationPillText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  locationPillTextPhone: {
    fontSize: 11.5,
    maxWidth: 52,
  },
  logInPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  logInPillText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#04cf92",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    height: 38,
    flexShrink: 0,
  },
  signInButtonPhone: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    height: 32,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  signInButtonTextPhone: {
    fontSize: 12,
    fontWeight: "600",
  },
  notificationWrap: {
    position: "relative",
  },
  iconCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  iconCircleButtonPhone: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  orangeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4823A",
  },
  notificationPopover: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 240,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    zIndex: 50,
    ...shadow,
  },
  notificationTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
  },
  notificationCopy: {
    marginTop: 4,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  avatarButtonPhone: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarImagePhone: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  pageScrollContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
  },

  mainGutter: {
    width: "100%",
    maxWidth: 1665,
    paddingTop: 16,
    paddingBottom: 48,
  },
  mainGutterPhone: {
    paddingTop: 10,
    paddingBottom: 24,
  },

  main: {
    width: "100%",
    paddingHorizontal: 24,
  },
  mainPhone: {
    paddingHorizontal: 12,
  },

  /* Footer Styles */
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
  footerColumnsPhone: {
    flexDirection: "column",
    gap: 24,
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
  footerColPhone: {
    width: "100%",
    minWidth: "100%",
    gap: 6,
  },
  footerColFull: {
    width: "100%",
    flexBasis: "100%",
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

  /* Mobile bottom bar */
  mobileNavSafe: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    ...shadow,
  },
  mobileNav: {
    minHeight: 60,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mobileNavLink: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  mobileNavText: {
    color: "#7B8983",
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  mobileNavTextActive: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
  },
  drawerLayer: {
    flex: 1,
    flexDirection: "row",
  },
  drawerOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(11, 26, 23, 0.4)",
  },
});
