import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  AtSign,
  Bell,
  BriefcaseBusiness,
  Building2,
  Camera,
  ChartNoAxesCombined,
  CircleHelp,
  Heart,
  Home,
  KeyRound,
  LandPlot,
  MapPin,
  Menu,
  MessageSquareText,
  Search,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { Brand } from "./Brand";
import { AppLink } from "./ui";

export type ActivePage = "home" | "buy" | "rent" | "saved" | "sell" | "ai" | "market" | "property" | "profile" | "users";

const shellNav: { label: string; href: string; icon: LucideIcon; key: ActivePage }[] = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Buy a home", href: "/buy", icon: Search, key: "buy" },
  { label: "Rent a home", href: "/rent", icon: KeyRound, key: "rent" },
  { label: "Community", href: "/users", icon: UserRound, key: "users" },
  { label: "Saved homes", href: "/saved", icon: Heart, key: "saved" },
  { label: "Sell property", href: "/sell", icon: LandPlot, key: "sell" },
  { label: "AI finder", href: "/ai-finder", icon: Sparkles, key: "ai" },
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
  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.sidebar, modal && styles.sidebarModal]}>
      <View style={styles.sidebarTop}>
        <Brand />
        {modal ? (
          <Pressable accessibilityLabel="Close navigation" onPress={onNavigate} style={[styles.circleButton, webPointer]}>
            <X color={colors.muted} size={19} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.exploreLabel}>EXPLORE</Text>
      <View style={styles.sideNav}>
        {shellNav.map(({ label, href, icon: Icon, key }) => {
          const selected = active === key;
          return (
            <AppLink href={href} key={key} onPress={onNavigate} style={[styles.sideLink, selected && styles.sideLinkActive]}>
              {selected ? <View style={styles.activeRail} /> : null}
              <Icon color={selected ? colors.green : "#62736C"} size={18} />
              <Text style={[styles.sideLinkText, selected && styles.sideLinkTextActive]}>
                {label}
              </Text>
              {key === "ai" ? (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              ) : null}
            </AppLink>
          );
        })}
      </View>
      <View style={styles.sidebarSpacer} />
      <LinearGradient
        colors={["#076B50", "#087361", "#277E9A"]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 1 }}
        style={styles.aiSideCard}
      >
        <Sparkles color="#E9FFF6" size={19} />
        <Text style={styles.aiSideTitle}>Know the fair price</Text>
        <Text style={styles.aiSideCopy}>Our AI checks 20+ market signals before you make an offer.</Text>
        <AppLink href="/ai-finder" style={styles.aiSideLink}>
          <Text style={styles.aiSideLinkText}>Check a property</Text>
          <ArrowRight color={colors.white} size={14} />
        </AppLink>
      </LinearGradient>
      <AppLink href="/about" style={styles.supportLink}>
        <CircleHelp color={colors.muted} size={18} />
        <Text style={styles.supportText}>Help &amp; support</Text>
      </AppLink>
    </SafeAreaView>
  );
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { isTablet, width } = useResponsive();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <SafeAreaView edges={["top"]} style={[styles.topbarSafe, isTablet && { width, maxWidth: width }]}>
      <View style={[styles.topbar, isTablet && styles.topbarTablet]}>
        {isTablet ? (
          <View style={styles.mobileBrandRow}>
            <Pressable accessibilityLabel="Open navigation" onPress={onOpenMenu} style={[styles.menuButton, webPointer]}>
              <Menu color={colors.greenDark} size={21} />
            </Pressable>
            <Brand compact />
          </View>
        ) : (
          <View style={styles.locationSwitcher}>
            <MapPin color={colors.green} size={16} />
            <Text style={styles.locationText}>Dhaka, Bangladesh</Text>
          </View>
        )}
        <View style={[styles.topLinks, isTablet && styles.topLinksTablet]}>
          {!isTablet ? (
            <>
              <AppLink href="/buy"><Text style={styles.topLinkText}>For buyers</Text></AppLink>
              <AppLink href="/market"><Text style={styles.topLinkText}>Market insights</Text></AppLink>
              <AppLink href="/sell" style={styles.listButton}><Text style={styles.listButtonText}>List property</Text></AppLink>
            </>
          ) : null}
          <View style={styles.notificationWrap}>
            <Pressable
              accessibilityLabel="Open notifications"
              onPress={() => setNotificationsOpen((open) => !open)}
              style={[styles.notificationButton, webPointer]}
            >
              <Bell color="#5D7068" size={19} />
              <View style={styles.notificationDot} />
            </Pressable>
            {notificationsOpen ? (
              <View style={styles.notificationPopover}>
                <Text style={styles.notificationTitle}>Property update</Text>
                <Text style={styles.notificationCopy}>A saved home in Banani has a newly verified price.</Text>
              </View>
            ) : null}
          </View>
          <AppLink href="/profile" accessibilityLabel="Open profile" style={styles.avatar}>
            <UserRound color={colors.ink} size={18} />
          </AppLink>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Footer() {
  const { isPhone, isTablet, width } = useResponsive();
  const columns = [
    ["Discover", ["Buy a home", "/buy"], ["Rent a home", "/rent"], ["Saved homes", "/saved"]],
    ["Resources", ["Market insights", "/market"], ["AI finder", "/ai-finder"], ["Sell property", "/sell"]],
    ["Company", ["About HomeNet", "/about"], ["Contact", "/about"], ["Privacy", "/about"]],
  ] as const;

  return (
    <View style={[styles.footer, isTablet && { width, maxWidth: width }]}>
      <View style={[styles.footerGrid, isPhone && styles.footerGridPhone]}>
        <View style={[styles.footerAbout, isPhone && styles.footerAboutPhone]}>
          <Brand />
          <Text style={styles.footerCopy}>Property decisions, backed by clearer data and local expertise.</Text>
          <View style={styles.socialLinks}>
            {[AtSign, Camera, BriefcaseBusiness, MessageSquareText].map((Icon, index) => (
              <Pressable accessibilityLabel={["Community", "Photo updates", "Professional network", "Chat with HomeNet"][index]} key={index} style={[styles.socialButton, webPointer]}>
                <Icon color="#587068" size={17} />
              </Pressable>
            ))}
          </View>
        </View>
        {columns.map(([heading, ...links], columnIndex) =>
          isPhone && columnIndex === 2 ? null : (
            <View key={heading} style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>{heading}</Text>
              {links.map(([label, href]) => (
                <AppLink href={href} key={label}>
                  <Text style={styles.footerLink}>{label}</Text>
                </AppLink>
              ))}
            </View>
          ),
        )}
      </View>
      <View style={[styles.footerBottom, isPhone && styles.footerBottomPhone]}>
        <Text style={styles.footerBottomText}>Copyright 2026 HomeNet. All rights reserved.</Text>
        <Text style={styles.footerBottomText}>Made for better property decisions.</Text>
      </View>
    </View>
  );
}

function MobileNav({ active }: { active: ActivePage }) {
  const { width } = useResponsive();
  const links: { label: string; href: string; icon: LucideIcon; selected: boolean }[] = [
    { label: "Home", href: "/", icon: Home, selected: active === "home" },
    { label: "Search", href: "/buy", icon: Search, selected: active === "buy" || active === "rent" || active === "property" },
    { label: "Market", href: "/market", icon: ChartNoAxesCombined, selected: active === "market" },
    { label: "Saved", href: "/saved", icon: Heart, selected: active === "saved" },
    { label: "List", href: "/sell", icon: Building2, selected: active === "sell" },
  ];

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.mobileNavSafe, { width, maxWidth: width }]}>
      <View style={styles.mobileNav}>
        {links.map(({ label, href, icon: Icon, selected }) => (
          <AppLink href={href} key={label} style={styles.mobileNavLink}>
            <Icon color={selected ? colors.green : "#7B8983"} size={19} />
            <Text style={[styles.mobileNavText, selected && styles.mobileNavTextActive]}>{label}</Text>
          </AppLink>
        ))}
      </View>
    </SafeAreaView>
  );
}

export function AppChrome({ children, active }: { children: ReactNode; active: ActivePage }) {
  const { isTablet, contentPadding, width } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.shell, isTablet && { width, maxWidth: width, overflow: "hidden" }]}>
      {!isTablet ? <SideBar active={active} /> : null}
      <View style={[styles.pageColumn, isTablet && styles.pageColumnMobile]}>
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <ScrollView
          contentContainerStyle={styles.pageScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={isTablet ? { width, maxWidth: width } : undefined}
        >
          <View style={[styles.mainGutter, { paddingHorizontal: contentPadding, paddingTop: isTablet ? 18 : 25 }, isTablet && { width, maxWidth: width }]}>
            <View style={styles.main}>{children}</View>
          </View>
          <Footer />
        </ScrollView>
        {isTablet ? <MobileNav active={active} /> : null}
      </View>
      <Modal animationType="fade" onRequestClose={() => setMenuOpen(false)} transparent visible={isTablet && menuOpen}>
        <View style={styles.drawerLayer}>
          <Pressable accessibilityLabel="Close navigation" onPress={() => setMenuOpen(false)} style={styles.drawerOverlay} />
          <SideBar active={active} modal onNavigate={() => setMenuOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { width: "100%", flex: 1, flexDirection: "row", backgroundColor: colors.white },
  sidebar: {
    width: 226,
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: colors.sidebar,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  sidebarModal: { width: 300, borderRightWidth: 0, ...shadow },
  sidebarTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 25 },
  circleButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.soft },
  exploreLabel: { marginTop: 4, marginRight: 12, marginBottom: 10, marginLeft: 12, color: "#A1ADA8", fontFamily: fonts.extraBold, fontSize: 10, letterSpacing: 1.1 },
  sideNav: { gap: 5 },
  sideLink: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, borderRadius: 11 },
  sideLinkActive: { backgroundColor: "#E8F3EE" },
  activeRail: { position: "absolute", left: -18, width: 3, height: 23, borderTopRightRadius: 5, borderBottomRightRadius: 5, backgroundColor: colors.green },
  sideLinkText: { flexShrink: 1, color: "#62736C", fontFamily: fonts.semiBold, fontSize: 13 },
  sideLinkTextActive: { color: colors.greenDark, fontFamily: fonts.extraBold },
  newBadge: { marginLeft: "auto", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99, backgroundColor: "#D8EEE4" },
  newBadgeText: { color: colors.greenDark, fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 0.3 },
  sidebarSpacer: { flex: 1 },
  aiSideCard: { gap: 8, marginVertical: 20, padding: 17, borderRadius: 16, overflow: "hidden" },
  aiSideTitle: { color: "#E9FFF6", fontFamily: fonts.extraBold, fontSize: 13 },
  aiSideCopy: { color: "rgba(239,255,249,0.72)", fontFamily: fonts.regular, fontSize: 10, lineHeight: 15.5 },
  aiSideLink: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6 },
  aiSideLinkText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 10 },
  supportLink: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 9 },
  supportText: { color: colors.muted, fontFamily: fonts.semiBold, fontSize: 12 },
  pageColumn: { width: 0, maxWidth: "100%", minWidth: 0, flex: 1 },
  pageColumnMobile: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%" },
  topbarSafe: { zIndex: 20, backgroundColor: "rgba(255,255,255,0.97)", borderBottomWidth: 1, borderBottomColor: "rgba(228,235,231,0.85)" },
  topbar: { minHeight: 71, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 36 },
  topbarTablet: { minHeight: 64, paddingHorizontal: 20 },
  mobileBrandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuButton: { width: 33, height: 33, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colors.soft },
  locationSwitcher: { flexDirection: "row", alignItems: "center", gap: 7 },
  locationText: { color: "#576B63", fontFamily: fonts.semiBold, fontSize: 12 },
  topLinks: { flexDirection: "row", alignItems: "center", gap: 28 },
  topLinksTablet: { gap: 10 },
  topLinkText: { color: "#5C6E67", fontFamily: fonts.semiBold, fontSize: 12 },
  listButton: { minHeight: 36, paddingHorizontal: 17, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.green },
  listButtonText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 11 },
  notificationWrap: { position: "relative", zIndex: 30 },
  notificationButton: { position: "relative", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: colors.soft },
  notificationDot: { position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.coral, borderWidth: 2, borderColor: colors.white },
  notificationPopover: { position: "absolute", top: 42, right: -18, width: 220, padding: 15, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, ...shadow },
  notificationTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 11 },
  notificationCopy: { marginTop: 5, color: colors.muted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14 },
  avatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#FAF8F3", borderWidth: 1, borderColor: "#DDE4E0" },
  pageScrollContent: { flexGrow: 1 },
  mainGutter: { minWidth: 0, width: "100%", alignItems: "center", paddingBottom: 80 },
  main: { minWidth: 0, width: "100%", maxWidth: 1180 },
  footer: { paddingTop: 46, paddingHorizontal: 36, paddingBottom: 20, backgroundColor: "#F6F9F7", borderTopWidth: 1, borderTopColor: colors.line },
  footerGrid: { width: "100%", maxWidth: 1180, alignSelf: "center", flexDirection: "row", gap: 54 },
  footerGridPhone: { flexWrap: "wrap", gap: 28 },
  footerAbout: { flex: 1.8, minWidth: 200 },
  footerAboutPhone: { flexBasis: "100%" },
  footerCopy: { maxWidth: 240, marginVertical: 14, color: colors.muted, fontFamily: fonts.regular, fontSize: 10, lineHeight: 16 },
  socialLinks: { flexDirection: "row", gap: 8 },
  socialButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  footerColumn: { flex: 1, minWidth: 110, gap: 10 },
  footerColumnTitle: { marginBottom: 3, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 11 },
  footerLink: { color: colors.muted, fontFamily: fonts.regular, fontSize: 9 },
  footerBottom: { width: "100%", maxWidth: 1180, alignSelf: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 40, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  footerBottomPhone: { flexDirection: "column", gap: 6 },
  footerBottomText: { color: "#8B9892", fontFamily: fonts.regular, fontSize: 8 },
  mobileNavSafe: { width: "100%", backgroundColor: "rgba(255,255,255,0.98)", borderTopWidth: 1, borderTopColor: colors.line, ...shadow },
  mobileNav: { minHeight: 62, flexDirection: "row", paddingHorizontal: 10, paddingVertical: 6 },
  mobileNavLink: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  mobileNavText: { color: "#7B8983", fontFamily: fonts.bold, fontSize: 8 },
  mobileNavTextActive: { color: colors.green },
  drawerLayer: { flex: 1, flexDirection: "row" },
  drawerOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(6,28,20,0.36)" },
});
