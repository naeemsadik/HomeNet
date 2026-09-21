import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, layout, shadow, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import {
  Bell,
  ChevronDown,
  Heart,
  Home,
  LogIn,
  LogOut,
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
import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
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
import { LanguageToggle } from "./LanguageToggle";
import { AppLink } from "./ui";
import { Footer } from "./Footer";

export type ActivePage =
  | "home"
  | "search"
  | "buy"
  | "rent"
  | "sold"
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
    { label: "Home", href: "/home", icon: Home, key: "home" },
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
                color={selected ? colors.greenOnLight : "#5C6B66"}
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
          Free to list. Describe it in a sentence.
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
  isCrystal = false,
}: {
  active?: ActivePage;
  onOpenMenu?: () => void;
  isCrystal?: boolean;
}) {
  const { isTablet, isPhone, containerMaxWidth } = useResponsive();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();

    // Seekers-first: the two search intents lead, Saved follows. Everything
    // else lives in the drawer (tablet/phone) or the footer.
    const topNavLinks: {
      label: string;
      href: string;
      key: string;
      authGated?: boolean;
    }[] = [
      { label: "Buy", href: "/buy", key: "buy" },
      { label: "Rent", href: "/rent", key: "rent" },
      { label: "Sold", href: "/sold", key: "sold" },
      { label: "Saved", href: "/saved", key: "saved", authGated: true },
    ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.topbarSafe, isCrystal && styles.topbarSafeCrystal]}
    >
      <View
        style={[
          styles.topbar,
          isTablet && styles.topbarTablet,
          isPhone && styles.topbarPhone,
          { maxWidth: containerMaxWidth },
        ]}
      >
        {/* Left: Brand + Hamburger (mobile) */}
        <View style={[styles.topbarLeft, isPhone && styles.topbarLeftPhone]}>
          {isTablet ? (
            <Pressable
              onPress={onOpenMenu}
              style={[
                styles.menuButton,
                isPhone && styles.menuButtonPhone,
                isCrystal && styles.menuButtonCrystal,
                webPointer,
              ]}
              accessibilityLabel="Open navigation menu"
            >
              <Menu
                color={isCrystal ? "#FFFFFF" : "#0B1A17"}
                size={isPhone ? 18 : 20}
                strokeWidth={2.4}
              />
            </Pressable>
          ) : null}
          <Brand compact={isTablet} variant={isCrystal ? "light" : "dark"} />
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
                  style={({ pressed, hovered }: any) => [
                    styles.topNavLink,
                    hovered && styles.topNavLinkHovered,
                    webPointer,
                    pressed && { opacity: 0.8 },
                  ]}
                  accessibilityRole="link"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.topNavLinkText,
                      isSelected && styles.topNavLinkTextActive,
                      isCrystal && styles.topNavLinkTextCrystal,
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
          {/* Owner path: present on every page, visually subordinate to search. */}
          {!isPhone ? (
            <Pressable
              accessibilityLabel="List your property"
              accessibilityRole="button"
              onPress={() => {
                if (user) router.push("/property/create" as any);
                else
                  useAuthModalStore
                    .getState()
                    .open(() => router.push("/property/create" as any));
              }}
              style={({ pressed }) => [
                styles.listPropertyBtn,
                webPointer,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.listPropertyText}>List your property</Text>
            </Pressable>
          ) : null}

          {user ? (
            <>
              {/* Notification Button */}
              <View style={styles.notificationWrap}>
                <Pressable
                  accessibilityLabel="Open notifications"
                  onPress={() => {
                    setUserDropdownOpen(false);
                    setNotificationsOpen((open) => !open);
                  }}
                  style={[
                    styles.notificationButton,
                    isPhone && styles.notificationButtonPhone,
                    isCrystal && styles.notificationButtonCrystal,
                    webPointer,
                  ]}
                >
                  <Bell
                    color={isCrystal ? "#FFFFFF" : "#0B1A17"}
                    size={isPhone ? 16 : 19}
                    strokeWidth={2}
                  />
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

              {/* User Avatar + Triangle Dropdown Trigger */}
              <View style={styles.userDropdownWrap}>
                <Pressable
                  accessibilityLabel="Open user menu"
                  onPress={() => {
                    setNotificationsOpen(false);
                    setUserDropdownOpen((open) => !open);
                  }}
                  style={({ pressed }) => [
                    styles.userDropdownTrigger,
                    isCrystal && styles.userDropdownTriggerCrystal,
                    userDropdownOpen && styles.userDropdownTriggerActive,
                    pressed && { opacity: 0.85 },
                    webPointer,
                  ]}
                >
                  <View style={[styles.avatarButton, isPhone && styles.avatarButtonPhone]}>
                    <Image
                      source={{
                        uri:
                          user.avatar_url ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
                      }}
                      style={[styles.avatarImage, isPhone && styles.avatarImagePhone]}
                    />
                  </View>

                  {/* Triangle dropdown icon */}
                  <View
                    style={[
                      styles.triangleIconBox,
                      userDropdownOpen && styles.triangleIconBoxOpen,
                    ]}
                  >
                    <Svg width={8} height={5} viewBox="0 0 8 5">
                      <Path d="M0 0L8 0L4 5Z" fill={isCrystal ? "#FFFFFF" : "#5C6B66"} />
                    </Svg>
                  </View>
                </Pressable>

                {userDropdownOpen && (
                  <>
                    {Platform.OS === "web" && (
                      <Pressable
                        style={styles.dropdownBackdrop}
                        onPress={() => setUserDropdownOpen(false)}
                      />
                    )}
                    <View style={[styles.userDropdownMenu, isPhone && styles.userDropdownMenuPhone]}>
                      {/* User Info Header */}
                      <View style={styles.userDropdownProfile}>
                        <Image
                          source={{
                            uri:
                              user.avatar_url ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
                          }}
                          style={styles.dropdownAvatar}
                        />
                        <View style={styles.dropdownProfileInfo}>
                          <Text numberOfLines={1} style={styles.userDropdownName}>
                            {user.full_name || "Account"}
                          </Text>
                          {user.email ? (
                            <Text numberOfLines={1} style={styles.userDropdownEmail}>
                              {user.email}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.dropdownDivider} />

                      {/* Saved Button */}
                      <Pressable
                        accessibilityLabel="Saved properties"
                        accessibilityRole="button"
                        onPress={() => {
                          setUserDropdownOpen(false);
                          router.push("/saved");
                        }}
                        style={({ pressed, hovered }: any) => [
                          styles.dropdownItem,
                          (pressed || hovered) && styles.dropdownItemPressed,
                          webPointer,
                        ]}
                      >
                        <View style={[styles.dropdownIconBox, { backgroundColor: "rgba(4, 207, 146, 0.10)" }]}>
                          <Heart color="#04cf92" size={16} strokeWidth={2} />
                        </View>
                        <Text style={styles.dropdownItemText}>Saved</Text>
                      </Pressable>

                      {/* Profile Button */}
                      <Pressable
                        accessibilityLabel="Profile settings"
                        accessibilityRole="button"
                        onPress={() => {
                          setUserDropdownOpen(false);
                          router.push("/profile");
                        }}
                        style={({ pressed, hovered }: any) => [
                          styles.dropdownItem,
                          (pressed || hovered) && styles.dropdownItemPressed,
                          webPointer,
                        ]}
                      >
                        <View style={styles.dropdownIconBox}>
                          <User color="#0B1A17" size={16} strokeWidth={1.8} />
                        </View>
                        <Text style={styles.dropdownItemText}>Profile</Text>
                      </Pressable>

                      <View style={styles.dropdownDivider} />

                      {/* Log out Button */}
                      <Pressable
                        accessibilityLabel="Log out"
                        accessibilityRole="button"
                        onPress={async () => {
                          setUserDropdownOpen(false);
                          if (Platform.OS === "web") {
                            const confirmed = window.confirm("Are you sure you want to log out?");
                            if (confirmed) {
                              await logout();
                              router.push("/home");
                            }
                          } else {
                            Alert.alert("Log Out", "Are you sure you want to log out?", [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Log Out",
                                style: "destructive",
                                onPress: async () => {
                                  await logout();
                                  router.push("/home");
                                },
                              },
                            ]);
                          }
                        }}
                        style={({ pressed, hovered }: any) => [
                          styles.dropdownItem,
                          (pressed || hovered) && { backgroundColor: "rgba(239, 68, 68, 0.06)" },
                          webPointer,
                        ]}
                      >
                        <View style={[styles.dropdownIconBox, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}>
                          <LogOut color="#EF4444" size={16} strokeWidth={1.8} />
                        </View>
                        <Text style={[styles.dropdownItemText, { color: "#EF4444" }]}>
                          Log out
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => setAuthModalOpen(true)}
              accessibilityLabel="Sign in"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.rightmoveSignInBtn,
                isPhone && styles.rightmoveSignInBtnPhone,
                isCrystal && styles.rightmoveSignInBtnCrystal,
                webPointer,
                pressed && {
                  opacity: 0.85,
                  backgroundColor: isCrystal ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 207, 146, 0.08)",
                },
              ]}
            >
              <User
                color={isCrystal ? "#FFFFFF" : "#04cf92"}
                size={isPhone ? 15 : 17}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.rightmoveSignInText,
                  isPhone && styles.rightmoveSignInTextPhone,
                  isCrystal && styles.rightmoveSignInTextCrystal,
                ]}
              >
                Sign in
              </Text>
            </Pressable>
          )}

          {/* Language Toggle (ENG / BN) */}
          <LanguageToggle compact={isPhone} variant={isCrystal ? "crystal" : "default"} />
        </View>
      </View>

      <LoginModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </SafeAreaView>
  );
}

function MobileNav({ active }: { active: ActivePage }) {
  const user = useAuthStore((s) => s.user);
  const links = [
    { label: "Home", href: "/home", icon: Home, selected: active === "home", authGated: false },
    {
      label: "Insights",
      href: "/market",
      icon: TrendingUp,
      selected: active === "market",
      authGated: false,
    },
    {
      label: "Saved",
      href: "/saved",
      icon: Heart,
      selected: active === "saved",
      authGated: true,
    },
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
                color={selected ? colors.greenOnLight : "#7B8983"}
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
  bleed,
}: {
  children: ReactNode;
  active: ActivePage;
  bleed?: ReactNode;
}) {
  const { isTablet, isPhone, containerMaxWidth } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isCrystal = Boolean(bleed) && !isScrolled;

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const onScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(top > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = (e: any) => {
    const top = e?.nativeEvent?.contentOffset?.y ?? 0;
    setIsScrolled(top > 40);
  };

  return (
    <View style={styles.shell}>
      <View style={styles.pageColumn}>
        <TopBar active={active} onOpenMenu={() => setMenuOpen(true)} isCrystal={isCrystal} />
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.pageScrollContent,
            !bleed && {
              paddingTop: isPhone
                ? layout.navHeightPhone
                : isTablet
                ? layout.navHeightTablet
                : layout.navHeight,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          {bleed ? <View style={styles.bleed}>{bleed}</View> : null}
          <View
            style={[
              styles.mainGutter,
              isPhone && styles.mainGutterPhone,
              { maxWidth: containerMaxWidth },
            ]}
          >
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
    color: colors.greenOnLight,
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    borderBottomWidth: 0,
    width: "100%",
    ...(Platform.select({
      web: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        boxShadow: "0 4px 20px -2px rgba(11, 26, 23, 0.05)",
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease",
      },
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
      },
    }) as any),
  },
  topbarSafeCrystal: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    ...(Platform.select({
      web: {
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        boxShadow: "none",
      },
      default: {
        elevation: 0,
        shadowOpacity: 0,
      },
    }) as any),
  },
  topNavLinkTextCrystal: {
    color: "#FFFFFF",
    ...(Platform.select({
      web: {
        textShadow: "0 1px 4px rgba(0, 0, 0, 0.45)",
      },
      default: {},
    }) as any),
  },
  rightmoveSignInBtnCrystal: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.4)",
    ...(Platform.select({
      web: {
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      },
      default: {},
    }) as any),
  },
  rightmoveSignInTextCrystal: {
    color: "#FFFFFF",
  },
  topbar: {
    width: "100%",
    maxWidth: layout.containerMaxWidth,
    marginHorizontal: "auto",
    minHeight: layout.navHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.gutter,
    paddingVertical: 12,
    gap: 16,
  },
  topbarTablet: {
    minHeight: layout.navHeightTablet,
    paddingHorizontal: layout.gutterTablet,
  },
  topbarPhone: {
    minHeight: layout.navHeightPhone,
    paddingHorizontal: layout.gutterPhone,
    gap: 4,
  },
  topbarLeft: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  topbarLeftPhone: {
    gap: 6,
  },
  topNavCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  topNavLink: {
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexShrink: 0,
    ...(Platform.select({
      web: { transition: "background-color 0.15s ease" },
      default: {},
    }) as any),
  },
  topNavLinkHovered: {
    backgroundColor: "rgba(11, 26, 23, 0.04)",
  },
  topNavLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1A17",
    letterSpacing: -0.2,
    ...(Platform.select({
      web: { whiteSpace: "nowrap" },
      default: {},
    }) as any),
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
  menuButtonCrystal: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderColor: "rgba(255, 255, 255, 0.32)",
    borderWidth: 1,
    ...(Platform.select({
      web: {
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      },
      default: {},
    }) as any),
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
  notificationButtonCrystal: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderColor: "rgba(255, 255, 255, 0.32)",
    borderWidth: 1,
    ...(Platform.select({
      web: {
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      },
      default: {},
    }) as any),
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
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginLeft: "auto",
  },
  topRightActionsPhone: {
    gap: 6,
    marginLeft: "auto",
  },
  listPropertyBtn: {
    flexShrink: 0,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#04cf92",
  },
  listPropertyText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "700",
    ...(Platform.select({
      web: { whiteSpace: "nowrap" },
      default: {},
    }) as any),
  },
  rightmoveSignInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(4, 207, 146, 0.8)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    height: 38,
    flexShrink: 0,
    ...(Platform.select({
      web: {
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      },
      default: {},
    }) as any),
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
    ...(Platform.select({
      web: { whiteSpace: "nowrap" },
      default: {},
    }) as any),
  },
  rightmoveSignInTextPhone: {
    fontSize: 12.5,
  },
  userDropdownWrap: {
    position: "relative",
    zIndex: 60,
  },
  guestDropdownWrap: {
    position: "relative",
    zIndex: 60,
  },
  guestPillGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#04cf92",
    borderWidth: 1.5,
    borderRadius: 8,
    height: 38,
    overflow: "hidden",
  },
  guestPillGroupPhone: {
    height: 32,
    borderRadius: 6,
  },
  guestSignInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    height: "100%",
  },
  guestSignInBtnPhone: {
    paddingHorizontal: 8,
    gap: 4,
  },
  guestPillDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(4, 207, 146, 0.3)",
  },
  guestTriangleBtn: {
    height: "100%",
    paddingHorizontal: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  guestTriangleBtnPhone: {
    paddingHorizontal: 6,
  },
  guestTriangleBtnActive: {
    backgroundColor: "rgba(4, 207, 146, 0.12)",
  },
  userDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.10)",
    backgroundColor: "#FFFFFF",
  },
  userDropdownTriggerCrystal: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderColor: "rgba(255, 255, 255, 0.32)",
    borderWidth: 1,
    ...(Platform.select({
      web: {
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      },
      default: {},
    }) as any),
  },
  userDropdownTriggerActive: {
    borderColor: "#04cf92",
    backgroundColor: "rgba(4, 207, 146, 0.04)",
  },
  triangleIconBox: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  triangleIconBoxOpen: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownBackdrop: {
    position: (Platform.OS === "web" ? "fixed" : "absolute") as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 80,
  },
  userDropdownMenu: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 240,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 6,
    zIndex: 90,
    ...Platform.select({
      web: {
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 16px 36px -4px rgba(11, 26, 23, 0.12), 0 2px 8px -2px rgba(11, 26, 23, 0.04), 0 0 0 1px rgba(11, 26, 23, 0.04)",
      } as any,
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 10,
      },
    }),
  },
  userDropdownMenuPhone: {
    width: 220,
  },
  userDropdownProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  dropdownProfileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userDropdownName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1A17",
    letterSpacing: -0.2,
  },
  userDropdownEmail: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#707E78",
    marginTop: 1,
  },
  guestMenuHeader: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  guestMenuTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: "700",
    color: "#8A9993",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "rgba(11, 26, 23, 0.06)",
    marginVertical: 4,
    marginHorizontal: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownItemPressed: {
    backgroundColor: "rgba(11, 26, 23, 0.05)",
  },
  dropdownIconBox: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(11, 26, 23, 0.04)",
  },
  dropdownItemText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: "500",
    color: "#0B1A17",
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
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    zIndex: 90,
    ...shadow,
    ...(Platform.select({
      web: {
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      },
      default: {},
    }) as any),
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
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatarButtonPhone: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarImagePhone: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  pageScrollContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
  },

  bleed: {
    width: "100%",
  },

  // Same container as the navbar — alignment is structural, not tuned.
  mainGutter: {
    width: "100%",
    maxWidth: layout.containerMaxWidth,
    paddingTop: 16,
    paddingBottom: 48,
  },
  mainGutterPhone: {
    paddingTop: 10,
    paddingBottom: 24,
  },

  main: {
    width: "100%",
    paddingHorizontal: layout.gutter,
  },
  mainPhone: {
    paddingHorizontal: layout.gutterPhone,
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
    color: colors.greenOnLight,
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
