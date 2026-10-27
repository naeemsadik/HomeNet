import {
  Check,
  Clock,
  FileCheck,
  IdCard,
  MapPin,
  Receipt,
  ShieldCheck,
  Upload,
} from "@/components/icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts, webPointer } from "@/theme";
import { SellerShell } from "../components/SellerShell";

interface VerificationDoc {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  status: "uploaded" | "pending";
}

type TimelineStatus = "completed" | "in_progress" | "pending";

export function VerificationScreen() {
  const { t } = useTranslation();
  const { isTablet, isPhone } = useResponsive();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const documents: VerificationDoc[] = [
    {
      id: "nid",
      title: t("seller.verification.docs.nid.title"),
      subtitle: t("seller.verification.docs.nid.subtitle"),
      icon: IdCard,
      status: "pending",
    },
    {
      id: "deed",
      title: t("seller.verification.docs.deed.title"),
      subtitle: t("seller.verification.docs.deed.subtitle"),
      icon: FileCheck,
      status: "pending",
    },
    {
      id: "tax",
      title: t("seller.verification.docs.tax.title"),
      subtitle: t("seller.verification.docs.tax.subtitle"),
      icon: Receipt,
      status: "pending",
    },
    {
      id: "gps",
      title: t("seller.verification.docs.gps.title"),
      subtitle: t("seller.verification.docs.gps.subtitle"),
      icon: MapPin,
      status: "pending",
    },
  ];

  const timelineSteps: {
    id: string;
    title: string;
    date: string;
    status: TimelineStatus;
  }[] = [
    {
      id: "submitted",
      title: t("seller.verification.timeline.submitted.title"),
      date: t("seller.verification.timeline.submitted.date"),
      status: "pending",
    },
    {
      id: "review",
      title: t("seller.verification.timeline.review.title"),
      date: t("seller.verification.timeline.review.date"),
      status: "pending",
    },
    {
      id: "approved",
      title: t("seller.verification.timeline.approved.title"),
      date: t("seller.verification.timeline.approved.date"),
      status: "pending",
    },
  ];

  const uploadedCount = documents.filter((d) => d.status === "uploaded").length;
  const totalDocs = documents.length;
  const progressPercent = Math.round((uploadedCount / totalDocs) * 100);

  // SVG Progress Ring calculations
  const circleRadius = 48;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progressPercent / 100);

  return (
    <SellerShell
      activeNav="verification"
      onSearchQueryChange={setSearchQuery}
      searchQuery={searchQuery}
      title={t("seller.verification.headerTitle")}
    >
          <View style={[styles.scrollBody, isPhone && styles.scrollBodyPhone]}>
            <View style={[styles.contentGrid, isTablet && styles.contentGridMobile]}>
            {/* Left Column: Banner + Documents List */}
            <View style={styles.leftColumn}>
              {/* Verified Badge Banner (Figma Node 288:2167) */}
              <View style={styles.badgeBanner}>
                <View style={styles.badgeIconWrap}>
                  <ShieldCheck color="#FFFFFF" size={24} strokeWidth={2.2} />
                </View>
                <View style={styles.badgeTextWrap}>
                  <Text style={styles.badgeTitle}>{t("seller.verification.badgeTitle")}</Text>
                  <Text style={styles.badgeSubtitle}>
                    {t("seller.verification.badgeSubtitle")}
                  </Text>
                </View>
              </View>

              {/* Required Documents Section (Figma Node 288:2180) */}
              <View style={styles.documentsSection}>
                <Text style={styles.sectionTitle}>{t("seller.verification.requiredDocsTitle")}</Text>

                <View style={styles.calloutBox}>
                  <Clock color="#2251D6" size={16} strokeWidth={2} />
                  <Text style={styles.calloutText}>
                    {t("seller.verification.uploadUnavailableCallout")}
                  </Text>
                </View>

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
                            <Text style={styles.uploadedBadgeText}>{t("seller.verification.uploadedBadge")}</Text>
                          </View>
                        ) : (
                          <Pressable
                            accessibilityLabel={t("seller.verification.uploadDocAria", { title: doc.title })}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: true }}
                            disabled
                            style={[styles.uploadBtn, styles.uploadBtnDisabled]}
                          >
                            <Upload color="#FFFFFF" size={15} strokeWidth={2} />
                            <Text style={styles.uploadBtnText}>{t("seller.verification.comingSoonBtn")}</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Submit Button (Figma Node 288:2268) */}
                <Pressable
                  accessibilityLabel={t("seller.verification.submitUnavailableAria")}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: true }}
                  disabled
                  style={[styles.submitBtn, styles.submitBtnDisabled]}
                >
                  <Text style={styles.submitBtnText}>
                    {t("seller.verification.submitUnavailableBtn")}
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
                    <Text style={styles.progressCompleteLabel}>{t("seller.verification.completeLabel")}</Text>
                  </View>
                </View>

                <Text style={styles.progressTitle}>{t("seller.verification.progressTitle")}</Text>
                <Text style={styles.progressSubtitle}>
                  {t("seller.verification.progressSubtitle", {
                    uploaded: uploadedCount,
                    total: totalDocs,
                  })}
                </Text>
              </View>

              {/* Verification Timeline Card (Figma Node 288:2296) */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t("seller.verification.timelineTitle")}</Text>

                <View style={styles.timelineList}>
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = step.status === "completed";
                    const isInProgress = step.status === "in_progress";
                    const isLast = idx === timelineSteps.length - 1;

                    return (
                      <View key={step.id} style={styles.timelineRow}>
                        <View style={styles.timelineIndicatorColumn}>
                          {isCompleted ? (
                            <View style={styles.timelineCircleCompleted}>
                              <Check color="#FFFFFF" size={13} strokeWidth={2.5} />
                            </View>
                          ) : isInProgress ? (
                            <View style={styles.timelineCircleInProgress}>
                              <Clock color={colorTokens.onAccent} size={13} strokeWidth={2.2} />
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
                    {t("seller.verification.timelineNotice")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
    </SellerShell>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
    minHeight: "100%",
  },
  workspaceScroll: {
    flexGrow: 1,
    justifyContent: "space-between",
  },

  /* Sidebar Styles */
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  brandTextAccent: {
    color: "#04cf92",
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
    ...(webPointer as any),
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
  uploadBtnDisabled: {
    opacity: 0.5,
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
});
