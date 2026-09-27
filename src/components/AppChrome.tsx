import { useResponsive } from "@/hooks/useResponsive";
import { colors, colorTokens, layout, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import {
  Bell,
  Heart,
  Home,
  LogOut,
  Menu,
  Sparkles,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { confirmAction } from "@/lib/alert";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { Brand } from "./Brand";
import { LoginModal } from "./LoginModal";
import { AiFinderModal } from "./AiFinderModal";
import { LanguageToggle } from "./LanguageToggle";
import { AppLink } from "./ui";
import { Footer } from "./Footer";
import { NotificationPreview } from "@/features/notification/components/NotificationPreview";
import { useUnreadCount } from "@/features/notification/hooks/useNotifications";
import { styles } from "./AppChrome.styles";
import { LiveText } from "@/components/LiveText";

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
          <Sparkles color={colorTokens.onBrand} size={20} />
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
  const { data: unreadData } = useUnreadCount("user");
  const unreadCount = unreadData?.data?.count ?? 0;
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);

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
                  accessibilityLabel={
                    unreadCount > 0
                      ? `Open notifications, ${unreadCount} unread`
                      : "Open notifications"
                  }
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
                  {unreadCount > 0 ? (
                    <View style={styles.notificationBadge} pointerEvents="none">
                      <LiveText style={styles.notificationBadgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </LiveText>
                    </View>
                  ) : null}
                </Pressable>
                {notificationsOpen ? (
                  <View style={styles.notificationPopover}>
                    <NotificationPreview onNavigate={closeNotifications} />
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
                          const confirmed = await confirmAction("Log Out", "Are you sure you want to log out?", {
                            confirmLabel: "Log Out",
                            destructive: true,
                          });
                          if (!confirmed) return;
                          await logout();
                          router.push("/home");
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
  fluid,
}: {
  children: ReactNode;
  active: ActivePage;
  bleed?: ReactNode;
  fluid?: boolean;
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
              fluid ? styles.mainGutterFluid : { maxWidth: containerMaxWidth },
            ]}
          >
            <View
              style={[
                styles.main,
                isPhone && styles.mainPhone,
                fluid && styles.mainFluid,
              ]}
            >
              {children}
            </View>
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
