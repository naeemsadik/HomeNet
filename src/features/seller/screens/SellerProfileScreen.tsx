import * as ImagePicker from "expo-image-picker";
import {
  BarChart2,
  Bell,
  Building2,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Heart,
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
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { AppLink } from "@/components/ui";
import { Brand } from "@/components/Brand";
import { useResponsive } from "@/hooks/useResponsive";
import { fonts, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { deleteUser, updateUser, uploadAvatar } from "@/services/userApi";
import type { UploadInput } from "@/services/upload";
import { SellerMobileDrawer } from "../components/SellerMobileDrawer";
import { SellerTopHeader } from "../components/SellerTopHeader";
import { ToggleViewButton } from "../components/ToggleViewButton";
import { Footer } from "@/components/Footer";
import type { SellerNavKey } from "./SellerDashboardScreen";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
const DEFAULT_NAME = "Fuad Abrar";
const DEFAULT_AGENCY = "Homenet Verified Partner";
const DEFAULT_BUYER_PREF = "Apartments & Houses in Dhaka";
const DEFAULT_EMAIL = "fowadabrar10112002@icloud.com";
const DEFAULT_PHONE = "+880 1700-000000";

export function SellerProfileScreen() {
  const { isPhone, isTablet } = useResponsive();
  const { user, logout, fetchMe, changePassword } = useAuthStore();
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

  // Change Password Modal State
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const handleBadgePress = () => {
    if (isVerified) {
      Alert.alert(
        "Verified Account",
        "Your identity and credentials have been verified by HomeNet.",
        [
          { text: "View Verification", onPress: () => router.push("/verification" as any) },
          { text: "OK", style: "cancel" },
        ]
      );
    } else if (!user) {
      Alert.alert(
        "Sign In Required",
        "You are currently viewing a preview profile. Please sign in or complete verification to get your verified badge.",
        [
          { text: "Sign In", onPress: () => router.push("/profile" as any) },
          { text: "Get Verified", onPress: () => router.push("/verification" as any) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      Alert.alert(
        "Verification Pending",
        "Your account is not verified yet. Submit your documents in the Verification Center to get verified.",
        [
          { text: "Go to Verification", onPress: () => router.push("/verification" as any) },
          { text: "Cancel", style: "cancel" },
        ]
      );
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
        Alert.alert(
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
        Alert.alert("Success", "Profile photo updated successfully.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation", "Please enter your full name.");
      return;
    }

    try {
      setIsSaving(true);
      if (user) {
        await updateUser(user.id, { full_name: fullName.trim() });
        await fetchMe();
      }
      Alert.alert("Success", "Profile changes saved successfully.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);
      const success = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (success) {
        setChangePasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        Alert.alert("Success", "Your password has been changed successfully.");
      } else {
        setPasswordError("Failed to change password. Please check your current password.");
      }
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
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
        if (Platform.OS === "web") {
          window.alert("Your account has been permanently deleted.");
        } else {
          Alert.alert("Account Deleted", "Your account has been permanently deleted.");
        }
        router.replace("/");
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to delete account. Please try again.");
      } finally {
        setIsDeletingAccount(false);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Permanently Delete Account?\n\nWarning: This action cannot be undone. All your listings, saved properties, and profile data will be permanently wiped.\n\nAre you sure you want to proceed?"
      );
      if (!confirmed) return;
      await doDelete();
      return;
    }

    Alert.alert(
      "Permanently Delete Account",
      "Warning: This action cannot be undone. All your listings, saved properties, and account data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Permanently", style: "destructive", onPress: doDelete },
      ]
    );
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.warn("Logout error:", err);
      }
      router.replace("/");
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm("Are you sure you want to log out?")
          : true;
      if (!confirmed) return;
      await doLogout();
      return;
    }

    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: doLogout,
      },
    ]);
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
                  onPress={() => {
                    setPasswordError(null);
                    setChangePasswordModalOpen(true);
                  }}
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
                  <ActivityIndicator color="#FFFFFF" size="small" />
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

      {/* Change Password Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setChangePasswordModalOpen(false)}
        transparent
        visible={changePasswordModalOpen}
      >
        <Pressable
          onPress={() => setChangePasswordModalOpen(false)}
          style={styles.modalBackdrop}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalCard, isPhone && styles.modalCardPhone]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <KeyRound color="#03a675" size={20} />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your current password and a new secure password.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close"
                hitSlop={10}
                onPress={() => setChangePasswordModalOpen(false)}
                style={[styles.modalCloseBtn, webPointer]}
              >
                <X color="#0B1A17" size={18} />
              </Pressable>
            </View>

            {passwordError ? (
              <View style={styles.modalErrorBanner}>
                <Text style={styles.modalErrorText}>{passwordError}</Text>
              </View>
            ) : null}

            {/* Current Password */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalFieldLabel}>Current password</Text>
              <View style={styles.modalInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setCurrentPassword(val);
                    setPasswordError(null);
                  }}
                  placeholder="Enter current password"
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  secureTextEntry={!showCurrentPassword}
                  style={styles.modalTextInput}
                  value={currentPassword}
                />
                <Pressable
                  accessibilityLabel="Toggle show password"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={[styles.eyeBtn, webPointer]}
                >
                  {showCurrentPassword ? (
                    <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                  ) : (
                    <Eye color="rgba(11,26,23,0.5)" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* New Password */}
            <View style={[styles.modalInputGroup, { marginTop: 14 }]}>
              <Text style={styles.modalFieldLabel}>New password</Text>
              <View style={styles.modalInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setNewPassword(val);
                    setPasswordError(null);
                  }}
                  placeholder="At least 6 characters"
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  secureTextEntry={!showNewPassword}
                  style={styles.modalTextInput}
                  value={newPassword}
                />
                <Pressable
                  accessibilityLabel="Toggle show password"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={[styles.eyeBtn, webPointer]}
                >
                  {showNewPassword ? (
                    <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                  ) : (
                    <Eye color="rgba(11,26,23,0.5)" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={[styles.modalInputGroup, { marginTop: 14 }]}>
              <Text style={styles.modalFieldLabel}>Confirm new password</Text>
              <View style={styles.modalInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    setPasswordError(null);
                  }}
                  placeholder="Re-enter new password"
                  placeholderTextColor="rgba(11,26,23,0.35)"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.modalTextInput}
                  value={confirmPassword}
                />
                <Pressable
                  accessibilityLabel="Toggle show password"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={[styles.eyeBtn, webPointer]}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                  ) : (
                    <Eye color="rgba(11,26,23,0.5)" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => setChangePasswordModalOpen(false)}
                style={({ pressed }) => [
                  styles.modalCancelBtn,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={isChangingPassword}
                onPress={handleChangePasswordSubmit}
                style={({ pressed }) => [
                  styles.modalSubmitBtn,
                  webPointer,
                  pressed && styles.pressed,
                  isChangingPassword && styles.btnDisabled,
                ]}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Update password</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
  },
  workspaceScroll: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  // Desktop Sidebar
  sidebar: {
    width: 256,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 0.8,
    borderRightColor: "rgba(11,26,23,0.08)",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sidebarHeader: {
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sellerRolePill: {
    backgroundColor: "#E8EEFC",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sellerRoleText: {
    color: "#2251D6",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  sidebarNavScroll: {
    gap: 2,
    paddingVertical: 8,
  },
  navItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    ...webPointer,
  },
  navItemActive: {
    backgroundColor: "#E6FAF4",
  },
  navItemDanger: {
    marginTop: 8,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  navItemTextActive: {
    color: "#04cf92",
    fontFamily: fonts.bold,
  },
  navItemTextDanger: {
    color: "#D4183D",
  },
  // Main Content
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    backgroundColor: "#F8FAF9",
  },
  topHeader: {
    minHeight: 68,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 16,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flex: 1,
    minWidth: 0,
  },
  desktopBrandLink: {
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderRadius: 999,
    paddingHorizontal: 14,
    width: 220,
    height: 38,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    fontFamily: fonts.regular,
    fontWeight: "300",
    color: "rgba(11, 26, 23, 0.45)",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  textInputNormal: {
    fontWeight: "400",
    color: "#0B1A17",
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...webPointer,
  },
  headerDotIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4823A",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  viewSiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    ...webPointer,
  },
  viewSiteText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  // Scrollable Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  scrollContentPhone: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  contentWrap: {
    width: "100%",
    maxWidth: 768,
  },
  // Segmented Tab Switcher (Buyer & Seller)
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#EBEFEA",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    width: "100%",
    gap: 6,
  },
  tabBarPhone: {
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "#0F6D55",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 8px rgba(15, 109, 85, 0.25)",
        }
      : {
          elevation: 2,
        }),
  },
  tabBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#5C6B66",
  },
  tabBtnTextPhone: {
    fontSize: 13,
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
  },
  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1.13,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 2px 8px rgba(11, 26, 23, 0.04)",
        }
      : {
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
        }),
  },
  cardPhone: {
    padding: 16,
    borderRadius: 18,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
    letterSpacing: -0.36,
  },
  // Profile Row
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  profileRowPhone: {
    gap: 12,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  avatarWrapPhone: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoCol: {
    flex: 1,
    justifyContent: "center",
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  profileName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#0F6D55",
    fontWeight: "500",
  },
  unverifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  unverifiedText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#D97706",
    fontWeight: "500",
  },
  buyerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  buyerBadgeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#0F6D55",
    fontWeight: "600",
  },
  changePhotoBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0F6D55",
  },
  // Form Inputs
  formGroup: {
    width: "100%",
  },
  formGroupSpacing: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.06)",
  },
  inputWrapPhone: {
    height: 44,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    fontWeight: "300",
    color: "rgba(11, 26, 23, 0.45)",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  clearBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  // Quick Chips
  quickChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(11,26,23,0.06)",
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
  },
  quickChipText: {
    fontSize: 12.5,
    fontFamily: fonts.medium,
    color: "#0B1A17",
    fontWeight: "500",
  },
  // Account Security
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 4,
  },
  securityRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  securityInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  securityTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  securityDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 3,
    lineHeight: 18,
  },
  securityDivider: {
    height: 1,
    backgroundColor: "rgba(11,26,23,0.06)",
    marginVertical: 14,
  },
  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(4, 207, 146, 0.35)",
    backgroundColor: "rgba(4, 207, 146, 0.12)",
  },
  changePasswordBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#03a675",
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(212, 24, 61, 0.3)",
    backgroundColor: "#FFF5F6",
  },
  deleteAccountBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  fullWidthBtnPhone: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  // Bottom Action Row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 24,
    paddingBottom: 40,
    width: "100%",
    gap: 12,
  },
  actionRowPhone: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.13,
    borderColor: "rgba(212,24,61,0.3)",
    backgroundColor: "#FFFFFF",
  },
  logoutBtnPhone: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  saveBtn: {
    backgroundColor: "#04cf92",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
  },
  saveBtnPhone: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 110,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Change Password Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 100,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 20px 45px -10px rgba(11, 26, 23, 0.25)",
        }
      : {
          elevation: 10,
        }),
  },
  modalCardPhone: {
    padding: 18,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(4, 207, 146, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
    lineHeight: 18,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalErrorBanner: {
    backgroundColor: "#FFF5F6",
    borderWidth: 1,
    borderColor: "rgba(212, 24, 61, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  modalErrorText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#D4183D",
  },
  modalInputGroup: {
    width: "100%",
  },
  modalFieldLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    marginBottom: 6,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.06)",
  },
  modalTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  eyeBtn: {
    padding: 6,
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F4F6F5",
  },
  modalCancelBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.medium,
    color: "#5C6B66",
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#04cf92",
  },
  modalSubmitBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
