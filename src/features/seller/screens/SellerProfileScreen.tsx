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
import type { SellerNavKey } from "./SellerDashboardScreen";
import { styles } from "./SellerProfileScreen.styles";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
// Sample values shown (greyed out) in signed-out preview. Never a real person.
const DEFAULT_NAME = "Your name";
const DEFAULT_AGENCY = "Homenet Verified Partner";
const DEFAULT_EMAIL = "you@example.com";
const DEFAULT_PHONE = "+880 1700-000000";

export function SellerProfileScreen() {
  const { isPhone, isTablet } = useResponsive();
  const { user, logout, fetchMe } = useAuthStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || DEFAULT_NAME);
  const [agency, setAgency] = useState(DEFAULT_AGENCY);
  const [email, setEmail] = useState(user?.email || DEFAULT_EMAIL);
  const [phone, setPhone] = useState(DEFAULT_PHONE);
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
        "Verified Account",
        "Your identity and credentials have been verified by HomeNet. View your verification details?",
        { confirmLabel: "View Verification", cancelLabel: "OK" },
      );
      if (view) router.push("/verification" as any);
    } else if (!user) {
      // Verification needs an account (the route is behind RequireAuth), so
      // signing in is the only step to offer.
      const signIn = await confirmAction(
        "Sign In Required",
        "You are currently viewing a preview profile. Sign in, then complete verification to get your verified badge. Sign in now?",
        { confirmLabel: "Sign In" },
      );
      if (signIn) router.push("/profile" as any);
    } else {
      const go = await confirmAction(
        "Verification Pending",
        "Your account is not verified yet. Submit your documents in the Verification Center to get verified. Go there now?",
        { confirmLabel: "Go to Verification" },
      );
      if (go) router.push("/verification" as any);
    }
  };

  const sidebarNavItems = [
    { key: "dashboard" as SellerNavKey, label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
    { key: "listings" as SellerNavKey, label: "My Listings", icon: Building2, href: "/my-properties" },
    { key: "create" as SellerNavKey, label: "Create Property", icon: PlusCircle, href: "/property/create" },
    { key: "verification" as SellerNavKey, label: "Verification", icon: ShieldCheck, href: "/verification" },
    { key: "boost" as SellerNavKey, label: "Boost Listings", icon: Rocket, href: "/seller?tab=boost" },
    { key: "insights" as SellerNavKey, label: "AI Insights", icon: Sparkles, href: "/seller?tab=insights" },
    { key: "analytics" as SellerNavKey, label: "Analytics", icon: BarChart2, href: "/seller?tab=analytics" },
    { key: "payments" as SellerNavKey, label: "Payments", icon: CreditCard, href: "/seller?tab=payments" },
    { key: "profile" as SellerNavKey, label: "Profile", icon: User, href: "/seller/profile", active: true },
    { key: "help" as SellerNavKey, label: "Help Center", icon: CircleHelp, href: "/seller?tab=help" },
    { key: "logout" as SellerNavKey, label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  const handleAvatarUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notify(
          "Permission needed",
          "Allow access to your photo library to change your profile picture."
        );
        return;
      }

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
        notify("Success", "Profile photo updated successfully.");
      }
    } catch (err: any) {
      notify("Error", toApiError(err).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    const validation = editProfileSchema.safeParse({ full_name: fullName });
    if (!validation.success) {
      notify("Validation", validation.error.issues[0]?.message || "Please enter a valid full name.");
      return;
    }

    try {
      setIsSaving(true);
      if (user) {
        await updateUser(user.id, { full_name: validation.data.full_name });
        await fetchMe();
      }
      notify("Success", "Profile changes saved successfully.");
    } catch (err: any) {
      notify("Error", toApiError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doDelete = async () => {
      try {
        setIsDeletingAccount(true);
        if (user) {
          await deleteUser(user.id);
          await logout();
        }
        notify("Account Deleted", "Your account has been permanently deleted.");
        router.replace("/home");
      } catch (err: any) {
        notify("Error", toApiError(err).message);
      } finally {
        setIsDeletingAccount(false);
      }
    };

    const confirmed = await confirmAction(
      "Permanently Delete Account",
      "Warning: This action cannot be undone. All your listings, saved properties, and account data will be permanently deleted. Are you sure you want to proceed?",
      { confirmLabel: "Delete Permanently", destructive: true },
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

    const confirmed = await confirmAction("Logout", "Are you sure you want to log out?", {
      confirmLabel: "Logout",
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
              <Text style={styles.sellerRoleText}>Seller Dashboard</Text>
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
            title="Profile"
          />
        ) : (
          /* Desktop Header */
          <View style={styles.topHeader}>
            <Text style={styles.headerTitle}>Profile</Text>

            <View style={styles.headerActions}>
              <View style={styles.searchContainer}>
                <Search color="rgba(11,26,23,0.5)" size={16} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Search listings…"
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
                    accessibilityLabel="Clear search"
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
                accessibilityLabel="Notifications"
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
                <Text style={styles.cardTitle}>Personal information</Text>
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
                        isVerified ? "Verified seller account" : "Account unverified"
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
                          <Text style={styles.verifiedText}>Verified</Text>
                        </>
                      ) : (
                        <>
                          <ShieldAlert color="#D97706" size={14} />
                          <Text style={styles.unverifiedText}>Unverified</Text>
                        </>
                      )}
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityLabel="Change photo"
                    accessibilityRole="button"
                    onPress={handleAvatarUpload}
                    style={({ pressed }) => [
                      styles.changePhotoBtn,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.changePhotoText}>Change photo</Text>
                  </Pressable>
                </View>
              </View>

              {/* Form Field: Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Full name</Text>
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
                      accessibilityLabel="Clear full name"
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

              {/* Form Field: Agency */}
              <View style={[styles.formGroup, styles.formGroupSpacing]}>
                <Text style={styles.fieldLabel}>Agency</Text>
                <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                  <TextInput
                    onChangeText={setAgency}
                    onFocus={() => {
                      if (agency === DEFAULT_AGENCY) {
                        setAgency("");
                      }
                    }}
                    placeholder={DEFAULT_AGENCY}
                    placeholderTextColor="rgba(11,26,23,0.35)"
                    selectTextOnFocus
                    style={[
                      styles.textInput,
                      isNormalText(agency, DEFAULT_AGENCY) && styles.textInputNormal,
                    ]}
                    value={agency}
                  />
                  {agency.length > 0 && (
                    <Pressable
                      accessibilityLabel="Clear agency"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setAgency("")}
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
                <Text style={styles.cardTitle}>Contact information</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
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
                      accessibilityLabel="Clear email"
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

              <View style={[styles.formGroup, styles.formGroupSpacing]}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <View style={[styles.inputWrap, isPhone && styles.inputWrapPhone]}>
                  <TextInput
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                    onFocus={() => {
                      if (phone === DEFAULT_PHONE) {
                        setPhone("");
                      }
                    }}
                    placeholder={DEFAULT_PHONE}
                    placeholderTextColor="rgba(11,26,23,0.35)"
                    selectTextOnFocus
                    style={[
                      styles.textInput,
                      isNormalText(phone, DEFAULT_PHONE) && styles.textInputNormal,
                    ]}
                    value={phone}
                  />
                  {phone.length > 0 && (
                    <Pressable
                      accessibilityLabel="Clear phone"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setPhone("")}
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
                <Text style={styles.cardTitle}>Account security</Text>
              </View>

              {/* Change Password Option */}
              <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
                <View style={styles.securityInfoCol}>
                  <Text style={styles.securityTitle}>Password</Text>
                  <Text style={styles.securityDesc}>
                    •••••••••••• &nbsp;·&nbsp; Keep your account protected with a strong password
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel="Change password"
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
                  <Text style={styles.changePasswordBtnText}>Change password</Text>
                </Pressable>
              </View>

              <View style={styles.securityDivider} />

              {/* Permanently Delete Account Option */}
              <View style={[styles.securityRow, isPhone && styles.securityRowPhone]}>
                <View style={styles.securityInfoCol}>
                  <Text style={[styles.securityTitle, { color: "#D4183D" }]}>
                    Permanently delete account
                  </Text>
                  <Text style={styles.securityDesc}>
                    Once deleted, your profile, listings, saved properties, and account data will be permanently removed.
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel="Permanently delete account"
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
                      <Text style={styles.deleteAccountBtnText}>Permanently delete account</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={[styles.actionRow, isPhone && styles.actionRowPhone]}>
              {/* Save changes Button */}
              <Pressable
                accessibilityLabel="Save changes"
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
                  <Text style={styles.saveBtnText}>Save changes</Text>
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
