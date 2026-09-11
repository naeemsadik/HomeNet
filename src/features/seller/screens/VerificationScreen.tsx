import {
  Bell,
  Building2,
  Check,
  CircleHelp,
  Clock,
  CreditCard,
  FileCheck,
  Globe,
  IdCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareText,
  PlusCircle,
  Receipt,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  BarChart2,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { fonts, webPointer } from "@/theme";
import { SellerMobileDrawer } from "../components/SellerMobileDrawer";
import { SellerTopHeader } from "../components/SellerTopHeader";
import type { SellerNavKey } from "./SellerDashboardScreen";

interface VerificationDoc {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  status: "uploaded" | "pending";
}

const REQUIRED_DOCUMENTS: VerificationDoc[] = [
  {
    id: "nid",
    title: "National ID",
    subtitle: "Front & back of your NID card",
    icon: IdCard,
    status: "uploaded",
  },
  {
    id: "deed",
    title: "Property Deed",
    subtitle: "Registered ownership document",
    icon: FileCheck,
    status: "uploaded",
  },
  {
    id: "tax",
    title: "Land Tax Receipt",
    subtitle: "Latest paid tax receipt",
    icon: Receipt,
    status: "pending",
  },
  {
    id: "gps",
    title: "GPS Property Photo",
    subtitle: "Geo-tagged photo of the property",
    icon: MapPin,
    status: "pending",
  },
];

const TIMELINE_STEPS = [
  {
    id: "submitted",
    title: "Submitted",
    date: "Jul 02, 2026",
    status: "completed" as const,
  },
  {
    id: "review",
    title: "Under Review",
    date: "In progress",
    status: "in_progress" as const,
  },
  {
    id: "approved",
    title: "Approved",
    date: "Pending",
    status: "pending" as const,
  },
];

export function VerificationScreen() {
  const { isTablet, isPhone } = useResponsive();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<VerificationDoc[]>(REQUIRED_DOCUMENTS);

  const uploadedCount = documents.filter((d) => d.status === "uploaded").length;
  const totalDocs = documents.length;
  const progressPercent = Math.round((uploadedCount / totalDocs) * 100);

  // SVG Progress Ring calculations
  const circleRadius = 48;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progressPercent / 100);

  const sidebarNavItems = [
    { key: "dashboard" as SellerNavKey, label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
    { key: "listings" as SellerNavKey, label: "My Listings", icon: Building2, href: "/my-properties" },
    { key: "create" as SellerNavKey, label: "Create Property", icon: PlusCircle, href: "/property/create" },
    { key: "verification" as SellerNavKey, label: "Verification", icon: ShieldCheck, href: "/verification", active: true },
    { key: "boost" as SellerNavKey, label: "Boost Listings", icon: Rocket },
    { key: "insights" as SellerNavKey, label: "AI Insights", icon: Sparkles, href: "/ai-finder" },
    { key: "analytics" as SellerNavKey, label: "Analytics", icon: BarChart2, href: "/market" },
    { key: "payments" as SellerNavKey, label: "Payments", icon: CreditCard },
    { key: "notifications" as SellerNavKey, label: "Notifications", icon: Bell, badgeCount: 3, href: "/notifications" },
    { key: "profile" as SellerNavKey, label: "Profile", icon: User, href: "/seller/profile" },
    { key: "settings" as SellerNavKey, label: "Settings", icon: Settings, href: "/settings" },
    { key: "help" as SellerNavKey, label: "Help Center", icon: CircleHelp, href: "/about" },
    { key: "logout" as SellerNavKey, label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  const handleUpload = (docId: string, docTitle: string) => {
    Alert.alert("Upload Document", `Select file to upload for ${docTitle}.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Upload",
        onPress: () => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, status: "uploaded" } : d))
          );
        },
      },
    ]);
  };

  const handleSubmit = () => {
    if (uploadedCount < totalDocs) {
      Alert.alert(
        "Incomplete Documents",
        `Please upload all required documents (${uploadedCount}/${totalDocs} completed).`
      );
      return;
    }
    Alert.alert("Documents Submitted", "Your verification documents are under review.");
  };

  return (
    <View style={styles.outerContainer}>
      {/* Desktop Sidebar */}
      {!isTablet && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconBg}>
                <Building2 color="#FFFFFF" size={20} />
              </View>
              <Text style={styles.brandText}>
                Home<Text style={styles.brandTextAccent}>net</Text>
              </Text>
            </View>

            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>Seller Dashboard</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.sidebarNavScroll} showsVerticalScrollIndicator={false}>
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = item.key === "verification";

              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
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
        activeNav="verification"
        items={sidebarNavItems}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={() => { }}
        visible={isTablet && mobileDrawerOpen}
      />

      {/* Main Workspace Area */}
      <View style={styles.mainContent}>
        {isTablet ? (
          <SellerTopHeader
            hasUnreadNotifications
            onPressMenu={() => setMobileDrawerOpen(true)}
            onSearchQueryChange={setSearchQuery}
            searchQuery={searchQuery}
            title="Verification Center"
          />
        ) : (
          <View style={styles.topHeader}>
            <Text style={styles.headerTitle}>Verification Center</Text>

            <View style={styles.headerActions}>
              <View style={styles.searchContainer}>
                <Search color="rgba(11,26,23,0.5)" size={16} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Search listings…"
                  placeholderTextColor="rgba(11,26,23,0.5)"
                  style={styles.searchInput}
                  value={searchQuery}
                />
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

        {/* Scrollable Center Body */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollBody,
            isPhone && styles.scrollBodyPhone,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.contentGrid, isTablet && styles.contentGridMobile]}>
            {/* Left Column: Banner + Documents List */}
            <View style={styles.leftColumn}>
              {/* Verified Badge Banner (Figma Node 288:2167) */}
              <View style={styles.badgeBanner}>
                <View style={styles.badgeIconWrap}>
                  <ShieldCheck color="#FFFFFF" size={24} strokeWidth={2.2} />
                </View>
                <View style={styles.badgeTextWrap}>
                  <Text style={styles.badgeTitle}>Get your Verified Badge</Text>
                  <Text style={styles.badgeSubtitle}>
                    Verified sellers get up to 3x more inquiries and buyer trust.
                  </Text>
                </View>
              </View>

              {/* Required Documents Section (Figma Node 288:2180) */}
              <View style={styles.documentsSection}>
                <Text style={styles.sectionTitle}>Required documents</Text>

                <View style={styles.documentsList}>
                  {documents.map((doc) => {
                    const DocIcon = doc.icon;
                    const isUploaded = doc.status === "uploaded";

                    return (
                      <View key={doc.id} style={styles.documentCard}>
                        <View style={[styles.docIconWrap, isUploaded ? styles.docIconWrapUploaded : styles.docIconWrapPending]}>
                          <DocIcon
                            color={isUploaded ? "#0F6D55" : "#5C6B66"}
                            size={20}
                            strokeWidth={1.8}
                          />
                        </View>

                        <View style={styles.docDetails}>
                          <Text numberOfLines={1} style={styles.docTitle}>
                            {doc.title}
                          </Text>
                          <Text numberOfLines={1} style={styles.docSubtitle}>
                            {doc.subtitle}
                          </Text>
                        </View>

                        {isUploaded ? (
                          <View style={styles.uploadedBadge}>
                            <Check color="#0F6D55" size={14} strokeWidth={2.4} />
                            <Text style={styles.uploadedBadgeText}>Uploaded</Text>
                          </View>
                        ) : (
                          <Pressable
                            accessibilityLabel={`Upload ${doc.title}`}
                            accessibilityRole="button"
                            onPress={() => handleUpload(doc.id, doc.title)}
                            style={({ pressed }) => [
                              styles.uploadBtn,
                              webPointer,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Upload color="#FFFFFF" size={15} strokeWidth={2} />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Submit Button (Figma Node 288:2268) */}
                <Pressable
                  accessibilityLabel="Upload all documents to submit"
                  accessibilityRole="button"
                  onPress={handleSubmit}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    uploadedCount < totalDocs && styles.submitBtnDisabled,
                    webPointer,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.submitBtnText}>
                    {uploadedCount === totalDocs
                      ? "Submit documents for verification"
                      : `Upload all documents to submit (${uploadedCount}/${totalDocs})`}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Right Column: Progress & Timeline Cards */}
            <View style={styles.rightColumn}>
              {/* Verification Progress Card (Figma Node 288:2274) */}
              <View style={styles.card}>
                <View style={styles.progressRingContainer}>
                  <Svg height={120} width={120}>
                    {/* Background Circle */}
                    <Circle
                      cx={60}
                      cy={60}
                      fill="none"
                      r={circleRadius}
                      stroke="#F0F4F2"
                      strokeWidth={strokeWidth}
                    />
                    {/* Progress Arc */}
                    <Circle
                      cx={60}
                      cy={60}
                      fill="none"
                      r={circleRadius}
                      stroke="#0F6D55"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      strokeWidth={strokeWidth}
                      transform="rotate(-90 60 60)"
                    />
                  </Svg>

                  <View style={styles.progressCenterContent}>
                    <Text style={styles.progressValueText}>{progressPercent}</Text>
                    <Text style={styles.progressCompleteLabel}>complete</Text>
                  </View>
                </View>

                <Text style={styles.progressTitle}>Verification progress</Text>
                <Text style={styles.progressSubtitle}>
                  {uploadedCount} of {totalDocs} documents uploaded
                </Text>
              </View>

              {/* Verification Timeline Card (Figma Node 288:2296) */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Verification timeline</Text>

                <View style={styles.timelineList}>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = step.status === "completed";
                    const isInProgress = step.status === "in_progress";
                    const isLast = idx === TIMELINE_STEPS.length - 1;

                    return (
                      <View key={step.id} style={styles.timelineRow}>
                        <View style={styles.timelineIndicatorColumn}>
                          {isCompleted ? (
                            <View style={styles.timelineCircleCompleted}>
                              <Check color="#FFFFFF" size={13} strokeWidth={2.5} />
                            </View>
                          ) : isInProgress ? (
                            <View style={styles.timelineCircleInProgress}>
                              <Clock color="#FFFFFF" size={13} strokeWidth={2.2} />
                            </View>
                          ) : (
                            <View style={styles.timelineCirclePending}>
                              <View style={styles.timelineDotPending} />
                            </View>
                          )}

                          {!isLast && <View style={styles.timelineConnector} />}
                        </View>

                        <View style={styles.timelineTextWrap}>
                          <Text
                            style={[
                              styles.timelineStepTitle,
                              isCompleted && styles.timelineStepTitleCompleted,
                              isInProgress && styles.timelineStepTitleInProgress,
                            ]}
                          >
                            {step.title}
                          </Text>
                          <Text style={styles.timelineStepDate}>{step.date}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Callout Notice (Figma Node 288:2338) */}
                <View style={styles.calloutBox}>
                  <Clock color="#2251D6" size={16} strokeWidth={2} />
                  <Text style={styles.calloutText}>
                    Reviews typically complete within 2–3 business days.
                  </Text>
                </View>
              </View>
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
    minHeight: "100%",
  },

  /* Sidebar Styles */
  sidebar: {
    width: 226,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "rgba(11,26,23,0.08)",
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  sidebarHeader: {
    gap: 12,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  brandIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.4,
  },
  brandTextAccent: {
    color: "#04cf92",
  },
  sellerRolePill: {
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  sellerRoleText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  sidebarNavScroll: {
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    ...(webPointer as any),
  },
  navItemActive: {
    backgroundColor: "#E7F2EE",
  },
  navItemDanger: {
    marginTop: 12,
  },
  navItemText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#5C6B66",
  },
  navItemTextActive: {
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  navItemTextDanger: {
    color: "#D4183D",
  },

  /* Workspace Header Styles */
  mainContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
  },
  topHeader: {
    height: 64,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    zIndex: 10,
    ...(Platform.OS === "web" ? ({ backdropFilter: "blur(8px)" } as any) : {}),
  },
  headerTitle: {
    fontSize: 19.2,
    lineHeight: 26,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.384,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    width: 220,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...(webPointer as any),
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
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    ...(webPointer as any),
  },
  viewSiteText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },

  /* Scrollable Content Body */
  scrollBody: {
    padding: 24,
  },
  scrollBodyPhone: {
    padding: 16,
  },
  contentGrid: {
    flexDirection: "row",
    gap: 24,
    alignItems: "flex-start",
    maxWidth: 1200,
    width: "100%",
  },
  contentGridMobile: {
    flexDirection: "column",
    gap: 20,
  },
  leftColumn: {
    flex: 1.2,
    minWidth: 0,
    gap: 24,
    width: "100%",
  },
  rightColumn: {
    flex: 0.8,
    minWidth: 0,
    gap: 20,
    width: "100%",
  },

  /* Verified Badge Banner */
  badgeBanner: {
    backgroundColor: "#E7F2EE",
    borderWidth: 1.13,
    borderColor: "rgba(15,109,85,0.2)",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  badgeIconWrap: {
    width: 44,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTextWrap: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.bold,
    color: "#0F6D55",
    letterSpacing: -0.36,
  },
  badgeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: "rgba(15,109,85,0.8)",
    marginTop: 2,
  },

  /* Documents Section */
  documentsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.bold,
    color: "#0B1A17",
    letterSpacing: -0.36,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.13,
    borderColor: "rgba(11,26,23,0.08)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  docIconWrapUploaded: {
    backgroundColor: "#E7F2EE",
  },
  docIconWrapPending: {
    backgroundColor: "#F4F6F5",
  },
  docDetails: {
    flex: 1,
    minWidth: 0,
  },
  docTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  docSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
  },
  uploadedBadge: {
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uploadedBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: "#0F6D55",
  },
  uploadBtn: {
    backgroundColor: "#0F6D55",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
  submitBtn: {
    backgroundColor: "#0F6D55",
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
    textAlign: "center",
  },

  /* Right Column Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.13,
    borderColor: "rgba(11,26,23,0.08)",
    borderRadius: 24,
    padding: 24,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.bold,
    color: "#0B1A17",
    letterSpacing: -0.36,
  },

  /* Progress Card */
  progressRingContainer: {
    width: 120,
    height: 120,
    alignSelf: "center",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCenterContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressValueText: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  progressCompleteLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  progressTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
    textAlign: "center",
    marginTop: 16,
  },
  progressSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    textAlign: "center",
    marginTop: 4,
  },

  /* Timeline Card */
  timelineList: {
    marginTop: 18,
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  timelineIndicatorColumn: {
    alignItems: "center",
    width: 24,
  },
  timelineCircleCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCircleInProgress: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F4823A",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCirclePending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.13,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotPending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5C6B66",
  },
  timelineConnector: {
    width: 2,
    height: 34,
    backgroundColor: "rgba(11,26,23,0.08)",
    marginVertical: 4,
  },
  timelineTextWrap: {
    flex: 1,
    paddingTop: 1,
  },
  timelineStepTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  timelineStepTitleCompleted: {
    color: "#0B1A17",
  },
  timelineStepTitleInProgress: {
    color: "#0B1A17",
  },
  timelineStepDate: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
  },
  calloutBox: {
    backgroundColor: "#E8EEFC",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  calloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: "#2251D6",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
