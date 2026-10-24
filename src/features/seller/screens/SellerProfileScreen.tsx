import * as ImagePicker from "expo-image-picker";
import {
  BarChart2,
  Bell,
  Building2,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Rocket,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from "@/components/icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { confirmAction, notify } from "@/lib/alert";
import { router } from "expo-router";
import { AppLink } from "@/components/ui";
import { Brand } from "@/components/Brand";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { deleteUser, updateUser, uploadAvatar } from "@/services/userApi";
import { toApiError } from "@/services/apiClient";
import { editProfileSchema } from "@/lib/schemas/user";
import type { UploadInput } from "@/services/upload";
import { SellerChangePasswordModal } from "../components/SellerChangePasswordModal";
import { SellerMobileDrawer } from "../components/SellerMobileDrawer";
import { SellerTopHeader } from "../components/SellerTopHeader";
import { ToggleViewButton } from "../components/ToggleViewButton";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/i18n";
import type { SellerNavKey } from "./SellerDashboardScreen";
import { styles } from "./SellerProfileScreen.styles";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
// Sample values shown (greyed out) in signed-out preview. Never a real person.
const DEFAULT_NAME = "Your name";
const DEFAULT_EMAIL = "you@example.com";

export function SellerProfileScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();
  const { user, logout, fetchMe } = useAuthStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultName = t("seller.profile.defaultName");

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || defaultName);
  const [email, setEmail] = useState(user?.email || DEFAULT_EMAIL);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url || DEFAULT_AVATAR
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.email) setEmail(user.email);
      if (user.avatar_url) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const isVerified = Boolean(user && user.id && user.email_verified !== false);

  const isNormalText = (val: string, defaultVal: string) =>
    Boolean(user) || (val.length > 0 && val !== defaultVal);

  // The browser's confirm dialog only has OK / Cancel, so each message ends
  // with the question its OK answers.
  const handleBadgePress = async () => {
    if (isVerified) {
      const view = await confirmAction(
        t("seller.profile.verifiedAlertTitle"),
        t("seller.profile.verifiedAlertMessage"),
        { confirmLabel: t("seller.profile.viewVerificationBtn"), cancelLabel: t("common.ok") },
      );
      if (view) router.push("/verification" as any);
    } else if (!user) {
      // Verification needs an account (the route is behind RequireAuth), so
      // signing in is the only step to offer.
      const signIn = await confirmAction(
        t("seller.profile.signInRequiredTitle"),
        t("seller.profile.signInRequiredMessage"),
        { confirmLabel: t("seller.profile.signInBtn") },
      );
      if (signIn) router.push("/profile" as any);
    } else {
      const go = await confirmAction(
        t("seller.profile.verificationPendingTitle"),
        t("seller.profile.verificationPendingMessage"),
        { confirmLabel: t("seller.profile.goToVerificationBtn") },
      );
      if (go) router.push("/verification" as any);
    }
  };

  const sidebarNavItems = [
    { key: "dashboard" as SellerNavKey, label: t("dashboard.tabs.dashboard"), icon: LayoutDashboard, href: "/seller" },
    { key: "listings" as SellerNavKey, label: t("dashboard.tabs.myListings"), icon: Building2, href: "/my-properties" },
    { key: "create" as SellerNavKey, label: t("dashboard.tabs.createProperty"), icon: PlusCircle, href: "/property/create" },
    { key: "verification" as SellerNavKey, label: t("dashboard.tabs.verification"), icon: ShieldCheck, href: "/verification" },
    { key: "boost" as SellerNavKey, label: t("dashboard.tabs.boostListings"), icon: Rocket, href: "/seller?tab=boost" },
    { key: "insights" as SellerNavKey, label: t("dashboard.tabs.aiInsights"), icon: Sparkles, href: "/seller?tab=insights" },
    { key: "analytics" as SellerNavKey, label: t("dashboard.tabs.analytics"), icon: BarChart2, href: "/seller?tab=analytics" },
    { key: "payments" as SellerNavKey, label: t("dashboard.tabs.payments"), icon: CreditCard, href: "/seller?tab=payments" },
    { key: "profile" as SellerNavKey, label: t("dashboard.tabs.profile"), icon: User, href: "/seller/profile", active: true },
    { key: "help" as SellerNavKey, label: t("dashboard.tabs.helpCenter"), icon: CircleHelp, href: "/seller?tab=help" },
    { key: "logout" as SellerNavKey, label: t("dashboard.tabs.logout"), icon: LogOut, danger: true, href: "/" },
  ];

  const handleAvatarUpload = async () => {
    try {
      // No permission request: the system photo picker needs none. On Android 11-12 the
      // request asked for WRITE_EXTERNAL_STORAGE, which cannot be granted there, and
      // blocked every upload.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setAvatarUrl(asset.uri);

      if (user) {
        setIsUploading(true);
        const file: UploadInput = asset.file ?? {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        };
        await uploadAvatar(file, asset.fileName || "avatar.jpg");
        await fetchMe();
        notify(t("common.success"), t("seller.profile.photoUpdated"));
      }
    } catch (err: any) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    const validation = editProfileSchema.safeParse({ full_name: fullName });
    if (!validation.success) {
      notify(t("common.error"), validation.error.issues[0]?.message || t("seller.profile.invalidName"));
      return;
    }

    try {
      setIsSaving(true);
      if (user) {
        await updateUser(user.id, { full_name: validation.data.full_name });
        await fetchMe();
      }
      notify(t("common.success"), t("seller.profile.changesSaved"));
    } catch (err: any) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Nothing to delete without an account; saying "deleted" would be false.
    if (!user) {
      notify(t("common.notice"), t("userProfile.noAuthAccountToDelete"));
      return;
    }

    const doDelete = async () => {
      try {
        setIsDeletingAccount(true);
        await deleteUser(user.id);
        await logout();
        notify(t("seller.profile.accountDeletedTitle"), t("seller.profile.accountDeletedMessage"));
        router.replace("/home");
      } catch (err: any) {
        notify(t("common.error"), toApiError(err).message);
      } finally {
        setIsDeletingAccount(false);
      }
    };

    const confirmed = await confirmAction(
      t("seller.profile.deleteAccountConfirmTitle"),
      t("seller.profile.deleteAccountConfirmMessage"),
      { confirmLabel: t("seller.profile.deletePermanentlyBtn"), destructive: true },
    );
    if (confirmed) await doDelete();
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        if (__DEV__) console.warn("Logout error:", err);
      }
      router.replace("/home");
    };

    const confirmed = await confirmAction(t("seller.profile.logoutConfirmTitle"), t("seller.profile.logoutConfirmMessage"), {
      confirmLabel: t("seller.profile.logoutBtn"),
      destructive: true,
    });
    if (confirmed) await doLogout();
  };

  return (
    <View style={styles.outerContainer}>
      {/* Desktop Sidebar - screen > tablet */}
      {!isTablet && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Brand />

            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>{t("seller.drawer.rolePill")}</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.sidebarNavScroll}
            showsVerticalScrollIndicator={false}
          >
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = item.key === "profile";

              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
                  onPress={item.key === "logout" ? handleLogout : undefined}
                  style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                    item.danger && styles.navItemDanger,
                  ]}
                >
                  <IconComp
                    color={item.danger ? "#D4183D" : isActive ? "#04cf92" : "#5C6B66"}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      isActive && styles.navItemTextActive,
                      item.danger && styles.navItemTextDanger,
                    ]}
                  >
                    {item.label}
                  </Text>
                </AppLink>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Mobile Navigation Drawer for Seller */}
      <SellerMobileDrawer
        activeNav="profile"
        items={sidebarNavItems}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={(key) => {
          setMobileDrawerOpen(false);
          if (key === "logout") {
            handleLogout();
            return;
          }
          const found = sidebarNavItems.find((i) => i.key === key);
          if (found?.href) router.push(found.href as any);
        }}
        visible={isTablet && mobileDrawerOpen}
      />

      {/* Main Workspace Area */}
      <View style={styles.mainContent}>
        {/* Top Header */}
        {isTablet ? (
          /* Mobile Top Header (Figma 288:2759) */
          <SellerTopHeader
            hasUnreadNotifications
            onPressMenu={() => setMobileDrawerOpen(true)}
            showViewSite={false}
            title={t("seller.profile.title")}
          />
        ) : (
          /* Desktop Header */
          <View style={styles.topHeader}>
            <Text style={styles.headerTitle}>{t("seller.profile.title")}</Text>

            <View style={styles.headerActions}>
              <View style={styles.searchContainer}>
                <Search color="rgba(11,26,23,0.5)" size={16} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder={t("seller.header.searchPlaceholder")}
                  placeholderTextColor="rgba(11,26,23,0.5)"
                  selectTextOnFocus
                  style={[
                    styles.searchInput,
                    (Boolean(user) || searchQuery.length > 0) && styles.textInputNormal,
                  ]}
                  value={searchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    accessibilityLabel={t("seller.header.clearSearchAria")}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setSearchQuery("")}
                    style={[styles.clearBtn, webPointer]}
                  >
                    <X color="rgba(11,26,23,0.4)" size={15} />
                  </Pressable>
                )}
              </View>

              <Pressable
                accessibilityLabel={t("seller.header.notificationsAria")}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.iconCircleBtn,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <Bell color="#0B1A17" size={19} />
              </Pressable>

              <ToggleViewButton />
            </View>
          </View>
        )}

        {/* Scrollable Form Body */}
        <ScrollView
          contentContainerStyle={styles.workspaceScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.scrollContent,
              isPhone && styles.scrollContentPhone,
            ]}
          >
            <View style={styles.contentWrap}>
            {/* Section 1: Personal Information */}
            <View style={[styles.card, isPhone && styles.cardPhone]}>
              <View style={styles.cardHeaderRow}>
                <User color="#0B1A17" size={20} />
                <Text style={styles.cardTitle}>{t("seller.profile.personalInfoTitle")}</Text>
              </View>

              {/* Avatar and Name Row */}
              <View style={[styles.profileRow, isPhone && styles.profileRowPhone]}>
                <View style={[styles.avatarWrap, isPhone && styles.avatarWrapPhone]}>
                  <Image
                    source={{ uri: avatarUrl || DEFAULT_AVATAR }}
                    style={styles.avatarImage}
                  />
                  {isUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    </View>
                  )}
                </View>

                <View style={styles.profileInfoCol}>
                  <View style={styles.nameBadgeRow}>
                    <Text numberOfLines={1} style={styles.profileName}>
                      {fullName || DEFAULT_NAME}
                    </Text>

                    <Pressable
                      accessibilityLabel={
                        isVerified
                          ? t("seller.profile.verifiedSellerAria")
                          : t("seller.profile.unverifiedAria")
                      }
                      accessibilityRole="button"
                      onPress={handleBadgePress}
                      style={({ pressed }) => [
                        isVerified ? styles.verifiedBadge : styles.unverifiedBadge,
                        webPointer,
                        pressed && styles.pressed,
                      ]}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 color="#0F6D55" size={14} />
                          <Text style={styles.verifiedText}>{t("seller.profile.verifiedBadge")}</Text>
                        </>
                      ) : (
                        <>
                          <ShieldAlert color="#D97706" size={14} />
                          <Text style={styles.unverifiedText}>{t("seller.profile.unverifiedBadge")}</Text>
                        </>
                      )}
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityLabel={t("seller.profile.changePhoto")}
                    accessibilityRole="button"
                    onPress={handleAvatarUpload}
                    style={({ pressed }) => [
                      styles.changePhotoBtn,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.changePhotoText}>{t("seller.profile.changePhoto")}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Form Field: Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>{t("seller.profile.fullNameLabel")}</Text>
                <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                  <TextInput
                    onChangeText={setFullName}
                    onFocus={() => {
                      if (fullName === DEFAULT_NAME) {
                        setFullName("");
                      }
                    }}
                    placeholder={DEFAULT_NAME}
                    placeholderTextColor="rgba(11,26,23,0.35)"
                    selectTextOnFocus
                    style={[
                      styles.textInput,
                      isNormalText(fullName, DEFAULT_NAME) && styles.textInputNormal,
                    ]}
                    value={fullName}
                  />
                  {fullName.length > 0 && (
                    <Pressable
                      accessibilityLabel={t("seller.profile.clearFullNameAria")}
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setFullName("")}
                      style={[styles.clearBtn, webPointer]}
                    >
                      <X color="rgba(11,26,23,0.4)" size={16} />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Section 2: Contact Information */}
            <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{t("seller.profile.contactInfoTitle")}</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>{t("seller.profile.emailLabel")}</Text>
                <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    onFocus={() => {
                      if (email === DEFAULT_EMAIL) {
                        setEmail("");
                      }
                    }}
                    placeholder={DEFAULT_EMAIL}
                    placeholderTextColor="rgba(11,26,23,0.35)"
                    selectTextOnFocus
                    style={[
                      styles.textInput,
                      isNormalText(email, DEFAULT_EMAIL) && styles.textInputNormal,
                    ]}
                    value={email}
                  />
                  {email.length > 0 && (
                    <Pressable
                      accessibilityLabel={t("seller.profile.clearEmailAria")}
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setEmail("")}
                      style={[styles.clearBtn, webPointer]}
                    >
                      <X color="rgba(11,26,23,0.4)" size={16} />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Section 3: Account Security (Change Password & Permanently Delete Account) */}
            <View style={[styles.card, styles.sectionSpacing, isPhone && styles.cardPhone]}>
              <View style={styles.cardHeaderRow}>
                <Shield color="#0B1A17" size={20} />
                <Text style={styles.cardTitle}>{t("seller.profile.accountSecurityTitle")}</Text>
              </View>

              {/* Change Password Option */}
              <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
                <View style={styles.securityInfoCol}>
                  <Text style={styles.securityTitle}>{t("seller.profile.passwordTitle")}</Text>
                  <Text style={styles.securityDesc}>
                    {t("seller.profile.passwordDesc")}
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel={t("seller.profile.changePasswordBtn")}
                  accessibilityRole="button"
                  onPress={() => setChangePasswordModalOpen(true)}
                  style={({ pressed }) => [
                    styles.changePasswordBtn,
                    isPhone && styles.fullWidthBtnPhone,
                    webPointer,
                    pressed && styles.pressed,
                  ]}
                >
                  <KeyRound color="#03a675" size={15} />
                  <Text style={styles.changePasswordBtnText}>{t("seller.profile.changePasswordBtn")}</Text>
                </Pressable>
              </View>

              <View style={styles.securityDivider} />

              {/* Permanently Delete Account Option */}
              <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
                <View style={styles.securityInfoCol}>
                  <Text style={[styles.securityTitle, { color: "#D4183D" }]}>
                    {t("seller.profile.deleteAccountTitle")}
                  </Text>
                  <Text style={styles.securityDesc}>
                    {t("seller.profile.deleteAccountDesc")}
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel={t("seller.profile.deleteAccountBtn")}
                  accessibilityRole="button"
                  disabled={isDeletingAccount}
                  onPress={handleDeleteAccount}
                  style={({ pressed }) => [
                    styles.deleteAccountBtn,
                    isPhone && styles.fullWidthBtnPhone,
                    webPointer,
                    pressed && styles.pressed,
                    isDeletingAccount && styles.btnDisabled,
                  ]}
                >
                  {isDeletingAccount ? (
                    <ActivityIndicator color="#D4183D" size="small" />
                  ) : (
                    <>
                      <Trash2 color="#D4183D" size={15} />
                      <Text style={styles.deleteAccountBtnText}>{t("seller.profile.deleteAccountBtn")}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={[styles.actionRow, isPhone && styles.actionRowPhone]}>
              {/* Save changes Button */}
              <Pressable
                accessibilityLabel={t("seller.profile.saveChangesBtn")}
                accessibilityRole="button"
                disabled={isSaving}
                onPress={handleSaveChanges}
                style={({ pressed }) => [
                  styles.saveBtn,
                  isPhone && styles.saveBtnPhone,
                  webPointer,
                  isSaving && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color={colorTokens.onBrand} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>{t("seller.profile.saveChangesBtn")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
        <Footer />
      </ScrollView>
      </View>

      <SellerChangePasswordModal
        onClose={() => setChangePasswordModalOpen(false)}
        visible={changePasswordModalOpen}
      />
    </View>
  );
}
