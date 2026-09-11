import * as ImagePicker from "expo-image-picker";
import {
  BarChart2,
  Bell,
  Building2,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PlusCircle,
  Rocket,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { AppLink } from "@/components/ui";
import { Brand } from "@/components/Brand";
import { useResponsive } from "@/hooks/useResponsive";
import { fonts, webPointer } from "@/theme";
import { useAuthStore } from "@/stores/authStore";
import { updateUser, uploadAvatar } from "@/services/userApi";
import type { UploadInput } from "@/services/upload";
import { SellerMobileDrawer } from "../components/SellerMobileDrawer";
import { SellerTopHeader } from "../components/SellerTopHeader";
import type { SellerNavKey } from "./SellerDashboardScreen";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
const DEFAULT_NAME = "Ayesha Rahman";
const DEFAULT_AGENCY = "Homenet Verified Partner";
const DEFAULT_EMAIL = "ayesha@homenet.com.bd";
const DEFAULT_PHONE = "+880 1700-000000";

export function SellerProfileScreen() {
  const { isTablet } = useResponsive();
  const { user, logout, fetchMe } = useAuthStore();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || "Ayesha Rahman");
  const [agency, setAgency] = useState("Homenet Verified Partner");
  const [email, setEmail] = useState(user?.email || "ayesha@homenet.com.bd");
  const [phone, setPhone] = useState("+880 1700-000000");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url || DEFAULT_AVATAR
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
        "Verified Seller",
        "Your identity and seller credentials have been verified by HomeNet.",
        [
          { text: "View Verification", onPress: () => router.push("/verification" as any) },
          { text: "OK", style: "cancel" },
        ]
      );
    } else if (!user) {
      Alert.alert(
        "Sign In Required",
        "You are currently viewing a preview profile. Please sign in or complete verification to get your verified seller badge.",
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
    { key: "boost" as SellerNavKey, label: "Boost Listings", icon: Rocket },
    { key: "insights" as SellerNavKey, label: "AI Insights", icon: Sparkles, href: "/ai-finder" },
    { key: "analytics" as SellerNavKey, label: "Analytics", icon: BarChart2, href: "/market" },
    { key: "payments" as SellerNavKey, label: "Payments", icon: CreditCard },
    { key: "profile" as SellerNavKey, label: "Profile", icon: User, href: "/seller/profile", active: true },
    { key: "settings" as SellerNavKey, label: "Settings", icon: Settings, href: "/settings" },
    { key: "help" as SellerNavKey, label: "Help Center", icon: CircleHelp, href: "/about" },
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
      {/* Desktop Sidebar */}
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

      {/* Mobile Navigation Drawer */}
      <SellerMobileDrawer
        activeNav="profile"
        items={sidebarNavItems}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={(key) => {
          if (key === "logout") {
            handleLogout();
          }
        }}
        visible={isTablet && mobileDrawerOpen}
      />

      {/* Main Workspace Area */}
      <View style={styles.mainContent}>
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
                    <X color="rgba(11,26,23,0.4)" size={14} />
                  </Pressable>
                )}
              </View>

              <AppLink href="/notifications" style={styles.iconCircleBtn}>
                <Bell color="#0B1A17" size={19} />
                <View style={styles.headerDotIndicator} />
              </AppLink>

              <AppLink href="/" style={styles.viewSiteBtn}>
                <Globe color="#0B1A17" size={16} />
                <Text style={styles.viewSiteText}>View site</Text>
              </AppLink>
            </View>
          </View>
        )}

        {/* Scrollable Content Container */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrap}>
            {/* Section 1: Personal Information */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <User color="#0B1A17" size={20} />
                <Text style={styles.cardTitle}>Personal information</Text>
              </View>

              {/* Avatar and Name Row */}
              <View style={styles.profileRow}>
                <View style={styles.avatarWrap}>
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
                      {fullName || "Ayesha Rahman"}
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

              {/* Form Fields: Full Name & Agency */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <View style={styles.inputWrap}>
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

              <View style={[styles.formGroup, styles.formGroupSpacing]}>
                <Text style={styles.fieldLabel}>Agency</Text>
                <View style={styles.inputWrap}>
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
            <View style={[styles.card, styles.sectionSpacing]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Contact information</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
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
                <View style={styles.inputWrap}>
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

            {/* Bottom Actions Row */}
            <View style={styles.actionRow}>
              {/* Logout Button */}
              <Pressable
                accessibilityLabel="Logout"
                accessibilityRole="button"
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutBtn,
                  webPointer,
                  pressed && styles.pressed,
                ]}
              >
                <LogOut color="#D4183D" size={16} />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </Pressable>

              {/* Save changes Button */}
              <Pressable
                accessibilityLabel="Save changes"
                accessibilityRole="button"
                disabled={isSaving}
                onPress={handleSaveChanges}
                style={({ pressed }) => [
                  styles.saveBtn,
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
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
  },
  // Desktop Sidebar
  sidebar: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "rgba(11,26,23,0.06)",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.06)",
    gap: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 20,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  brandTextAccent: {
    color: "#04cf92",
  },
  sellerRolePill: {
    alignSelf: "flex-start",
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sellerRoleText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#04cf92",
  },
  sidebarNavScroll: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    ...webPointer,
  },
  navItemActive: {
    backgroundColor: "#E6FAF4",
  },
  navItemDanger: {
    marginTop: 10,
  },
  navItemText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#5C6B66",
  },
  navItemTextActive: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontWeight: "600",
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
    height: 70,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    width: 220,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "rgba(11, 26, 23, 0.45)",
    fontFamily: fonts.regular,
    fontWeight: "300",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    position: "relative",
    ...webPointer,
  },
  headerDotIndicator: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F4823A",
  },
  viewSiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.06)",
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
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  contentWrap: {
    width: "100%",
    maxWidth: 768,
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
          boxShadow: "0px 1px 3px rgba(11, 26, 23, 0.03)",
        }
      : {
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
        }),
  },
  sectionSpacing: {
    marginTop: 24,
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
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
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
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
    marginBottom: 6,
  },
  inputWrap: {
    backgroundColor: "#F4F6F5",
    borderRadius: 16,
    borderWidth: 1.13,
    borderColor: "rgba(11,26,23,0.08)",
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
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
  clearBtn: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  // Bottom Action Row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 40,
    width: "100%",
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
  logoutBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  saveBtn: {
    backgroundColor: "#0F6D55",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
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
  pressed: {
    opacity: 0.85,
  },
});
