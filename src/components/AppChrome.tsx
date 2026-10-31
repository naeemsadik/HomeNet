import { useResponsive } from "@/hooks/useResponsive";
import { colors, colorTokens, layout, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import {
  Bell,
  BookOpen,
  Building2,
  Calculator,
  CalendarCheck,
  Heart,
  Home,
  KeyRound,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from "@/components/icons";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import { confirmAction } from "@/lib/alert";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Link, router, usePathname, type Href } from "expo-router";
import { useTranslation, type TranslationKey } from "@/i18n";
import { Brand } from "./Brand";
import { AiFinderModal } from "./AiFinderModal";
import { InstantValuationModal } from "@/features/valuation/components/InstantValuationModal";
import { LanguageToggle } from "./LanguageToggle";
import { DrawerLanguageDropdown } from "./DrawerLanguageDropdown";
import { Footer } from "./Footer";
import { NotificationPreview } from "@/features/notification/components/NotificationPreview";
import { useUnreadCount } from "@/features/notification/hooks/useNotifications";
import { styles } from "./AppChrome.styles";
import { LiveText } from "@/components/LiveText";
import { startListing } from "@/lib/startListing";

export type ActivePage =
  | "home"
  | "search"
  | "buy"
  | "rent"
  | "holiday"
  | "sold"
  | "saved"
  | "sell"
  | "ai"
  | "market"
  | "property"
  | "profile"
  | "users"
  | "seller"
  | "messages"
  | "enquiries"
  | "valuation"
  | "guides";

/** Below this width the phone bar is used (matches the phone home and search screens). */
export const isMobileWidth = (width: number) => width < 768;
/** Below this width the web navbar's links no longer fit beside the brand and actions. */
const isCollapsedNavWidth = (width: number) => width < 1024;

/**
 * The search intents the web navbar leads with. The phone drawer lists the same
 * links, so nothing on the web navbar is missing on a phone.
 */
const browseNavLinks: {
  translationKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  key: ActivePage;
  authGated?: boolean;
}[] = [
  { translationKey: "nav.buy", href: "/buy", icon: Building2, key: "buy" },
  { translationKey: "nav.rent", href: "/rent", icon: KeyRound, key: "rent" },
  {
    translationKey: "nav.holidayStay",
    href: "/rent?subtype=short-let",
    icon: CalendarCheck,
    key: "holiday",
  },
  { translationKey: "nav.sold", href: "/sold", icon: Tag, key: "sold" },
];

const sidebarNavConfig: {
  translationKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  key: ActivePage;
  badge?: number;
  authGated?: boolean;
}[] = [
    ...browseNavLinks,
    { translationKey: "nav.insights", href: "/market", icon: TrendingUp, key: "market" },
    { translationKey: "nav.valuation", href: "/instant-valuation", icon: Calculator, key: "valuation" },
    { translationKey: "nav.guides", href: "/guides", icon: BookOpen, key: "guides" },
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
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { isTablet } = useResponsive();
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.sidebar, modal && styles.sidebarModal]}
    >
      <View style={styles.sidebarTop}>
        <Brand />
        {modal ? (
          <Pressable
            accessibilityLabel={t("nav.closeMenu")}
            onPress={onNavigate}
            style={[styles.circleButton, webPointer]}
          >
            <X color={colors.muted} size={19} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.sideNav}>
        {sidebarNavConfig.map(({ translationKey, href, icon: Icon, key, badge, authGated }) => {
          const label = t(translationKey);
          const selected =
            active === key ||
            (key === "buy" && (active === "search" || active === "property"));

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

      <View style={styles.drawerLanguage}>
        <DrawerLanguageDropdown />
      </View>

      <View style={styles.sidebarSpacer} />

      {/* List your property card. Where the bottom bar shows, Post there does the same job. */}
      {isTablet ? null : (
      <View style={styles.sidebarCard}>
        <View style={styles.sidebarCardIconWrap}>
          <Sparkles color={colorTokens.onBrand} size={20} />
        </View>
        <Text style={styles.sidebarCardTitle}>{t("nav.listProperty")}</Text>
        <Text style={styles.sidebarCardSubtitle}>
          {t("nav.listPropertyDesc")}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            onNavigate?.();
            startListing();
          }}
          style={[styles.postAdButton, webPointer]}
        >
          <Text style={styles.postAdButtonText}>{t("nav.postAd")}</Text>
        </Pressable>
      </View>
      )}
    </SafeAreaView>
  );
}

/**
 * A top-nav item that is a real <a href> on the web. Link's asChild drops a
 * function style on its child, which left these links with no padding, so the
 * style goes on Link, flattened, and hover is tracked here instead.
 */
function TopNavAnchor({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      asChild
      href={href as Href}
      style={StyleSheet.flatten([styles.topNavLink, hovered && styles.topNavLinkHovered, webPointer]) as TextStyle}
    >
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ selected }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        {children}
      </Pressable>
    </Link>
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
  const { t } = useTranslation();
  const { isTablet, isPhone, width, containerMaxWidth } = useResponsive();
  const isMobile = isMobileWidth(width);
  const collapseNav = isCollapsedNavWidth(width);
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  // Until the saved session is restored, "Sign in" would be a guess. Every full
  // page load starts here, so showing it flashed a signed-out header at people
  // who were signed in.
  const hydrated = useAuthStore((s) => s.hydrated);
  const { data: unreadData } = useUnreadCount("user");
  const unreadCount = unreadData?.data?.count ?? 0;
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);

  // Every phone page gets the same bar: the menu that holds the web navbar's
  // links, the brand, then language, notifications and account.
  if (isMobile) {
    const onHome = pathname === "/" || pathname === "/home";
    return (
      <SafeAreaView edges={["top"]} style={styles.topbarSafe}>
        <View
          style={[
            styles.topbar,
            styles.topbarMobileHome,
            { maxWidth: containerMaxWidth },
          ]}
        >
          <View style={styles.mobileHomeBrandWrap}>
            <Pressable
              onPress={onOpenMenu}
              style={[styles.menuButton, webPointer]}
              accessibilityLabel={t("nav.openMenu")}
            >
              <Menu color="#0B1A17" size={18} strokeWidth={2.4} />
            </Pressable>
            <Brand
              compact
              size="default"
              subtitle={onHome ? t("home.subcopy") : undefined}
            />
          </View>

          <View style={styles.mobileHomeRightWrap}>
            {/* Notification bell (guests have Sign in beside it instead). The language switcher is in the menu. */}
            {user ? (
            <Pressable
              accessibilityLabel={
                unreadCount > 0
                  ? t("nav.openNotificationsWithCount", { count: unreadCount })
                  : t("nav.openNotifications")
              }
              onPress={() => router.push("/notifications" as any)}
              style={[
                styles.notificationButton,
                styles.notificationButtonPhone,
                webPointer,
              ]}
            >
              <Bell color={colorTokens.ink} size={18} strokeWidth={2} />
              {unreadCount > 0 ? (
                <View style={styles.notificationBadge} pointerEvents="none">
                  <LiveText style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </LiveText>
                </View>
              ) : null}
            </Pressable>
            ) : null}

            {/* 3. Auth / Sign In Trigger */}
            {user ? (
              <Pressable
                accessibilityLabel={t("nav.profileSettings")}
                accessibilityRole="button"
                onPress={() => router.push("/profile")}
                style={[styles.mobileHomeAccountBtn, webPointer]}
              >
                <View style={styles.mobileHomeAvatarWrap}>
                  <Image
                    source={{
                      uri:
                        user.avatar_url ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
                    }}
                    style={styles.mobileHomeAvatarImage}
                  />
                </View>
              </Pressable>
            ) : hydrated ? (
              <Pressable
                accessibilityLabel={t("auth.signIn")}
                accessibilityRole="button"
                onPress={() => useAuthModalStore.getState().open()}
                style={({ pressed }) => [
                  styles.mobileHomeSignInBtn,
                  webPointer,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <User color={colorTokens.brandText} size={14} strokeWidth={2.2} />
                <Text style={styles.mobileHomeSignInText}>{t("auth.signIn")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Seekers-first: the search intents lead, Saved follows. The phone drawer
  // lists the same links plus the rest of the app.
  const topNavLinks: {
    translationKey: TranslationKey;
    href: string;
    key: string;
    authGated?: boolean;
  }[] = [
    ...browseNavLinks,
    { translationKey: "nav.saved", href: "/saved", key: "saved", authGated: true },
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
          {collapseNav ? (
            <Pressable
              onPress={onOpenMenu}
              style={[
                styles.menuButton,
                isPhone && styles.menuButtonPhone,
                isCrystal && styles.menuButtonCrystal,
                webPointer,
              ]}
              accessibilityLabel={t("nav.openMenu")}
            >
              <Menu
                color={isCrystal ? "#FFFFFF" : "#0B1A17"}
                size={isPhone ? 18 : 20}
                strokeWidth={2.4}
              />
            </Pressable>
          ) : null}
          <Brand compact={collapseNav} variant={isCrystal ? "light" : "dark"} />
        </View>

        {/* Center: Desktop Nav Links (only when links exist) */}
        {!collapseNav && topNavLinks.length > 0 ? (
          <View style={styles.topNavCenter}>
            {topNavLinks.map((link) => {
              const label = t(link.translationKey);
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

              // Signed-out visitors get the sign-in prompt first; every other
              // link is a real <a href> on the web so crawlers can follow it.
              const asAnchor = Platform.OS === "web" && !(link.authGated && !user);
              const content = (
                <>
                  <Text
                    style={[
                      styles.topNavLinkText,
                      isSelected && styles.topNavLinkTextActive,
                      isCrystal && styles.topNavLinkTextCrystal,
                    ]}
                  >
                    {label}
                  </Text>
                  {isSelected ? <View style={styles.topNavIndicator} /> : null}
                </>
              );
              return asAnchor ? (
                <TopNavAnchor href={link.href} key={link.key} selected={isSelected}>
                  {content}
                </TopNavAnchor>
              ) : (
                <Pressable
                  key={link.key}
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
                  {content}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={[styles.topRightActions, isPhone && styles.topRightActionsPhone]}>
          {/* Owner path: present on every page, visually subordinate to search. */}
          {!isPhone ? (
            <Pressable
              accessibilityLabel={t("nav.listProperty")}
              accessibilityRole="button"
              onPress={startListing}
              style={({ pressed }) => [
                styles.listPropertyBtn,
                webPointer,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.listPropertyText}>{t("nav.listProperty")}</Text>
            </Pressable>
          ) : null}

          {user ? (
            <>
              {/* Notification Button */}
              <View style={styles.notificationWrap}>
                <Pressable
                  accessibilityLabel={
                    unreadCount > 0
                      ? t("nav.openNotificationsWithCount", { count: unreadCount })
                      : t("nav.openNotifications")
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
                  accessibilityLabel={t("nav.openUserMenu")}
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
                            {user.full_name || t("nav.account")}
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
                        accessibilityLabel={t("nav.savedProperties")}
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
                        <Text style={styles.dropdownItemText}>{t("nav.saved")}</Text>
                      </Pressable>

                      {/* Profile Button */}
                      <Pressable
                        accessibilityLabel={t("nav.profileSettings")}
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
                        <Text style={styles.dropdownItemText}>{t("nav.profile")}</Text>
                      </Pressable>

                      <View style={styles.dropdownDivider} />

                      {/* Log out Button */}
                      <Pressable
                        accessibilityLabel={t("nav.logOut")}
                        accessibilityRole="button"
                        onPress={async () => {
                          setUserDropdownOpen(false);
                          const confirmed = await confirmAction(t("nav.logOutConfirmTitle"), t("nav.logOutConfirmMsg"), {
                            confirmLabel: t("nav.logOut"),
                            destructive: true,
                          });
                          if (!confirmed) return;
                          await logout();
                          router.push("/");
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
                          {t("nav.logOut")}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </>
          ) : hydrated ? (
            <Pressable
              onPress={() => useAuthModalStore.getState().open()}
              accessibilityLabel={t("nav.signIn")}
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
                {t("nav.signIn")}
              </Text>
            </Pressable>
          ) : null}

          {/* Language Toggle (ENG / BN) */}
          <LanguageToggle compact={isPhone} variant={isCrystal ? "crystal" : "default"} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function MobileNav({ active }: { active: ActivePage }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const links: {
    translationKey: TranslationKey;
    href: string;
    icon: LucideIcon;
    selected: boolean;
    authGated: boolean;
  }[] = [
    { translationKey: "nav.home", href: "/", icon: Home, selected: active === "home", authGated: false },
    { translationKey: "nav.search", href: "/buy", icon: Search, selected: active === "buy" || active === "rent" || active === "holiday" || active === "sold" || active === "search" || active === "property" || active === "market", authGated: false },
    { translationKey: "nav.post", href: "/property/create", icon: Plus, selected: false, authGated: true },
    { translationKey: "nav.saved", href: "/saved", icon: Heart, selected: active === "saved", authGated: true },
    { translationKey: "nav.account", href: "/profile", icon: User, selected: active === "profile", authGated: true },
  ];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={styles.mobileNavSafe}
    >
      <View style={styles.mobileNav}>
        {links.map(({ translationKey, href, icon: Icon, selected, authGated }) => {
          const label = t(translationKey);
          const handlePress = () => {
            if (authGated && !user) {
              useAuthModalStore.getState().open(() => router.push(href as any));
            } else {
              router.push(href as any);
            }
          };

          return (
            <Pressable
              key={translationKey}
              onPress={handlePress}
              style={({ pressed }) => [
                styles.mobileNavLink,
                webPointer,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="link"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
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
  customTopBar,
  compactFooter,
  floating,
}: {
  children: ReactNode;
  active: ActivePage;
  bleed?: ReactNode;
  fluid?: boolean;
  customTopBar?: ReactNode;
  /** Show only the short footer (policies and contact), for the phone homepage. */
  compactFooter?: boolean;
  /**
   * Pinned over the page, just above the bottom tabs, while the page scrolls
   * under it (the search results' List | Map switcher). The web pins such
   * controls with position: fixed; in the app that is not available, and an
   * absolute child of the page scrolled away with the content and landed over
   * the last card, so the app needs this slot outside the scroll view.
   */
  floating?: ReactNode;
}) {
  const { isTablet, isPhone, width, containerMaxWidth } = useResponsive();
  const isMobile = isMobileWidth(width);
  const collapseNav = isCollapsedNavWidth(width);
  const insets = useSafeAreaInsets();
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

  const scrollView = (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.pageScrollContent,
        // The bar is pinned over the page and grows by the status-bar inset
        // (edge-to-edge on Android), so the page must start below both.
        // A custom bar (the phone search screen's) sits in the flow instead.
        !bleed && !customTopBar && {
          paddingTop:
            (isMobile
              ? layout.navHeightPhone
              : isTablet
              ? layout.navHeightTablet
              : layout.navHeight) + insets.top,
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
      <Footer compact={compactFooter} />
    </ScrollView>
  );

  return (
    <View style={styles.shell}>
      <View style={styles.pageColumn}>
        {customTopBar ?? (
          <TopBar active={active} onOpenMenu={() => setMenuOpen(true)} isCrystal={isCrystal} />
        )}
        {floating ? (
          <View style={styles.scrollArea}>
            {scrollView}
            <View pointerEvents="box-none" style={styles.floatingLayer}>
              {floating}
            </View>
          </View>
        ) : (
          scrollView
        )}
        {isTablet ? <MobileNav active={active} /> : null}
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
        transparent
        visible={collapseNav && menuOpen}
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
      <InstantValuationModal />
    </View>
  );
}
