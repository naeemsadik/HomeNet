import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import {
  Bell,
  ChevronDown,
  Heart,
  Home,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
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
import Svg, { Path } from "react-native-svg";
import { Brand } from "./Brand";
import { AreaPicker } from "./AreaPicker";
import { AppLink } from "./ui";

export type ActivePage =
  | "home"
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
}[] = [
    { label: "Home", href: "/", icon: Home, key: "home" },
    { label: "Search", href: "/buy", icon: Search, key: "buy" },
    { label: "Saved", href: "/saved", icon: Heart, key: "saved" },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageCircle,
      key: "messages",
      badge: 2,
    },
    { label: "Profile", href: "/profile", icon: User, key: "profile" },
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
        {sidebarNav.map(({ label, href, icon: Icon, key, badge }) => {
          const selected =
            active === key ||
            (key === "buy" &&
              (active === "market" ||
                active === "property" ||
                active === "rent"));
          return (
            <AppLink
              href={href}
              key={key}
              onPress={onNavigate}
              style={[styles.sideLink, selected && styles.sideLinkActive]}
            >
              <Icon
                color={selected ? "#0F6D55" : "#5C6B66"}
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
            </AppLink>
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

function TopBar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { isTablet, width } = useResponsive();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Dhaka");
  const { user } = useAuthStore();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.topbarSafe, isTablet && { width, maxWidth: width }]}
    >
      <View style={[styles.topbar, isTablet && styles.topbarTablet]}>
        {isTablet ? (
          <View style={styles.mobileBrandRow}>
            <Brand compact />
          </View>
        ) : (
          /* Desktop Header Search Bar */
          <View style={styles.headerSearchBar}>
            <Search color="#5C6B66" size={20} />
            <TextInput
              onChangeText={setHeaderSearch}
              placeholder="Search area, project or use AI…"
              placeholderTextColor="#5C6B66"
              style={styles.headerSearchInput}
              value={headerSearch}
            />
            <AppLink href="/buy" style={styles.aiSearchBtn}>
              <Sparkles color="#FFFFFF" size={14} />
              <Text style={styles.aiSearchBtnText}>AI Search</Text>
            </AppLink>
          </View>
        )}

        <View style={styles.topRightActions}>
          {/* Location Selector Pill */}
          <Pressable
            onPress={() => setAreaPickerOpen(true)}
            style={[styles.locationPill, webPointer]}
            accessibilityRole="button"
            accessibilityLabel={`Select location, current: ${selectedCity}`}
          >
            <MapPin color="#0F6D55" size={16} />
            <Text style={styles.locationPillText}>{selectedCity}</Text>
            <ChevronDown color="#0B1A17" size={16} />
          </Pressable>

          {user ? (
            <>
              {/* Notification Button */}
              <View style={styles.notificationWrap}>
                <Pressable
                  accessibilityLabel="Open notifications"
                  onPress={() => setNotificationsOpen((open) => !open)}
                  style={[styles.iconCircleButton, webPointer]}
                >
                  <Bell color="#0B1A17" size={20} />
                  <View style={styles.orangeDot} />
                </Pressable>
                {notificationsOpen ? (
                  <View style={styles.notificationPopover}>
                    <Text style={styles.notificationTitle}>Property update</Text>
                    <Text style={styles.notificationCopy}>
                      A saved home in Banani has a newly verified price.
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Avatar */}
              <AppLink
                href="/profile"
                accessibilityLabel="Open profile"
                style={styles.avatarButton}
              >
                <Image
                  source={{
                    uri:
                      user.avatar_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
                  }}
                  style={styles.avatarImage}
                />
              </AppLink>
            </>
          ) : (
            /* Log In Button (Figma node 183:14) */
            <AppLink
              href="/profile"
              accessibilityLabel="Log In"
              style={styles.logInPill}
            >
              <Text style={styles.logInPillText}>Log In</Text>
            </AppLink>
          )}
        </View>
      </View>

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        onSelect={(area) => {
          setSelectedCity(area?.city || area?.name || "Dhaka");
        }}
        selectedArea={null}
      />
    </SafeAreaView>
  );
}

function Footer() {
  const { isPhone, isTablet, width } = useResponsive();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <View style={[styles.footer, isTablet && { width, maxWidth: width }]}>
      <View style={styles.footerInner}>
        {/* Main 5-column section */}
        <View
          style={[styles.footerColumns, isPhone && styles.footerColumnsPhone]}
        >
          {/* Column 1: Brand & Contact Info */}
          <View style={[styles.footerCol1, isPhone && styles.footerColFull]}>
            <Brand />
            <Text style={styles.footerTagline}>
              Bangladesh's AI-powered property marketplace. Verified listings,
              smart valuation and trusted partners — all in one place.
            </Text>
            <View style={styles.contactItem}>
              <Mail color="#5C6B66" size={16} />
              <Text style={styles.contactText}>hello@homenet.com.bd</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone color="#5C6B66" size={16} />
              <Text style={styles.contactText}>+880 1700-000000</Text>
            </View>
            <View style={styles.socialRow}>
              {/* Facebook */}
              <Pressable
                accessibilityLabel="Facebook"
                style={[styles.socialCircle, webPointer]}
              >
                <Svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0B1A17"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </Svg>
              </Pressable>
              {/* Twitter / X */}
              <Pressable
                accessibilityLabel="Twitter"
                style={[styles.socialCircle, webPointer]}
              >
                <Svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0B1A17"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <Path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </Svg>
              </Pressable>
              {/* Instagram */}
              <Pressable
                accessibilityLabel="Instagram"
                style={[styles.socialCircle, webPointer]}
              >
                <Svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0B1A17"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z" />
                  <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <Path d="M17.5 6.5h.01" />
                </Svg>
              </Pressable>
              {/* LinkedIn */}
              <Pressable
                accessibilityLabel="LinkedIn"
                style={[styles.socialCircle, webPointer]}
              >
                <Svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0B1A17"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <Path d="M2 9h4v12H2z" />
                  <Path d="M4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                </Svg>
              </Pressable>
            </View>
          </View>

          {/* Column 2: Explore */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Explore</Text>
            {[
              "Apartments",
              "Houses",
              "Commercial",
              "Land",
              "For Rent",
              "For Sale",
            ].map((item) => (
              <AppLink href="/buy" key={item}>
                <Text style={styles.footerLinkText}>{item}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 3: Company */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Company</Text>
            {[
              "About Homenet",
              "Careers",
              "Press",
              "Trusted Partners",
              "Blog",
            ].map((item) => (
              <AppLink href="/about" key={item}>
                <Text style={styles.footerLinkText}>{item}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 4: Support */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Support</Text>
            {[
              "Help Center",
              "Contact Us",
              "Safety & Trust",
              "Report a Listing",
            ].map((item) => (
              <AppLink href="/about" key={item}>
                <Text style={styles.footerLinkText}>{item}</Text>
              </AppLink>
            ))}
          </View>

          {/* Column 5: Legal */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColHeading}>Legal</Text>
            {["Terms of Service", "Privacy Policy", "Cookie Policy"].map(
              (item) => (
                <AppLink href="/about" key={item}>
                  <Text style={styles.footerLinkText}>{item}</Text>
                </AppLink>
              ),
            )}
          </View>
        </View>

        {/* Newsletter Box */}
        <View
          style={[styles.newsletterCard, isPhone && styles.newsletterCardPhone]}
        >
          <View style={styles.newsletterLeft}>
            <Text style={styles.newsletterTitle}>
              Get market insights in your inbox
            </Text>
            <Text style={styles.newsletterSubtitle}>
              AI price trends & new verified listings, weekly.
            </Text>
          </View>
          <View
            style={[
              styles.newsletterInputWrap,
              isPhone && styles.newsletterInputWrapPhone,
            ]}
          >
            <TextInput
              onChangeText={setEmail}
              placeholder="Your email address"
              placeholderTextColor="rgba(11, 26, 23, 0.5)"
              style={[
                styles.newsletterInput,
                isPhone && styles.newsletterInputPhone,
              ]}
              value={email}
            />
            <Pressable
              onPress={() => setSubscribed(true)}
              style={[
                styles.subscribeButton,
                isPhone && styles.subscribeButtonPhone,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.subscribeButtonText,
                  isPhone && styles.subscribeButtonTextPhone,
                ]}
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer Bottom Bar */}
        <View
          style={[styles.footerBottom, isPhone && styles.footerBottomPhone]}
        >
          <Text style={styles.footerBottomText}>
            © 2026 Homenet. All rights reserved.
          </Text>
          <View style={styles.verifiedListingsTag}>
            <ShieldCheck color="#0F6D55" size={16} />
            <Text style={styles.footerBottomText}>
              12,400+ verified listings across Bangladesh
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MobileNav({ active }: { active: ActivePage }) {
  const { width } = useResponsive();
  const links = [
    { label: "Home", href: "/", icon: Home, selected: active === "home" },
    {
      label: "Search",
      href: "/buy",
      icon: Search,
      selected: active === "buy" || active === "property",
    },
    {
      label: "Saved",
      href: "/saved",
      icon: Heart,
      selected: active === "saved",
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageCircle,
      selected: active === "messages",
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      selected: active === "profile",
    },
  ];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.mobileNavSafe, { width, maxWidth: width }]}
    >
      <View style={styles.mobileNav}>
        {links.map(({ label, href, icon: Icon, selected }) => (
          <AppLink href={href} key={label} style={styles.mobileNavLink}>
            <Icon
              color={selected ? "#0F6D55" : "#7B8983"}
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
          </AppLink>
        ))}
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
  const { isTablet, width } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View
      style={[
        styles.shell,
        isTablet && { width, maxWidth: width, overflow: "hidden" },
      ]}
    >
      {!isTablet ? <SideBar active={active} /> : null}
      <View style={[styles.pageColumn, isTablet && styles.pageColumnMobile]}>
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <ScrollView
          contentContainerStyle={styles.pageScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={isTablet ? { width, maxWidth: width } : undefined}
        >
          <View style={styles.mainGutter}>
            <View style={styles.main}>{children}</View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
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
    backgroundColor: "#E7F2EE",
  },
  sideLinkText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  sideLinkTextActive: {
    color: "#0F6D55",
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
    backgroundColor: "#0F6D55",
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  sidebarCardIconWrap: {
    marginBottom: 2,
  },
  sidebarCardTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  sidebarCardSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  postAdButton: {
    marginTop: 6,
    height: 36,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  postAdButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  pageColumn: {
    width: 0,
    maxWidth: "100%",
    minWidth: 0,
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
  },
  topbar: {
    minHeight: 78.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  topbarTablet: {
    minHeight: 64,
    paddingHorizontal: 16,
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
  headerSearchBar: {
    flex: 1,
    maxWidth: 576,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 16.8,
    paddingRight: 6.8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  headerSearchInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 6,
    outlineStyle: "none",
  } as any,
  aiSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#0F6D55",
  },
  aiSearchBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  locationPillText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
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
  avatarImage: {
    width: "100%",
    height: "100%",
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

  main: {
    width: "100%",
    paddingHorizontal: 24,
  },

  /* Footer Styles */
  footer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
  },
  footerInner: {
    width: "100%",
    maxWidth: 1665,
    paddingHorizontal: 40,
    paddingVertical: 48,
  },
  footerColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 32,
  },
  footerColumnsPhone: {
    flexWrap: "wrap",
    gap: 24,
  },
  footerCol1: {
    flex: 2,
    minWidth: 220,
  },
  footerColFull: {
    flexBasis: "100%",
  },
  footerTagline: {
    marginTop: 16,
    marginBottom: 16,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 280,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  socialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  footerCol: {
    flex: 1,
    minWidth: 120,
    gap: 10,
  },
  footerColHeading: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerLinkText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  newsletterCard: {
    marginTop: 40,
    backgroundColor: "#F8FAF9",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  newsletterCardPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 18,
    gap: 16,
  },
  newsletterLeft: {
    flex: 1,
  },
  newsletterTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
  },
  newsletterSubtitle: {
    marginTop: 4,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  newsletterInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingLeft: 16.8,
    paddingRight: 4.8,
    paddingVertical: 4,
    minHeight: 50,
    width: 320,
    maxWidth: "100%",
  },
  newsletterInputWrapPhone: {
    width: "100%",
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 6,
  },
  newsletterInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 6,
    outlineStyle: "none",
  } as any,
  newsletterInputPhone: {
    fontSize: 14,
    height: 38,
    paddingVertical: 6,
  },
  subscribeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0F6D55",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  subscribeButtonPhone: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  subscribeButtonTextPhone: {
    fontSize: 12,
  },

  footerBottom: {
    marginTop: 32,
    paddingTop: 24.8,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerBottomPhone: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },
  footerBottomText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  verifiedListingsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    color: "#0F6D55",
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
