import { Platform, StyleSheet } from "react-native";
import { colors, fonts, layout } from "@/theme";

export const styles = StyleSheet.create({
  sectionSpacing: {
    marginTop: 40,
    width: "100%",
  },
  sectionGap: {
    height: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeaderInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },

  seeAllLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  /* 1. Hero Section */
  heroBlock: {
    width: "100%",
  },
  // Full-bleed: the photograph runs edge to edge, outside the page container.
  heroPhoto: {
    width: "100%",
    overflow: "hidden",
    minHeight: 520,
  },
  heroBg: {
    width: "100%",
    minHeight: 520,
    justifyContent: "center",
  },
  heroCopy: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  heroCopyLarge: {
    maxWidth: 1100,
  },
  heroCopyPhone: {
    paddingHorizontal: 16,
    paddingBottom: 72,
  },
  // Display weight is light on purpose: the photograph carries the volume.
  heroHeading: {
    color: "#FFFFFF",
    fontFamily: fonts.headingSemiBold,
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -1.6,
    textAlign: "center",
  },

  // The dock sits back inside the page gutter even though the photo does not.
  dockGutter: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: layout.gutter,
  },
  dockGutterPhone: {
    paddingHorizontal: layout.gutterPhone,
  },

  // The dock owns radius + shadow; the widget inside runs flush.
  searchDock: {
    width: "100%",
    maxWidth: 940,
    marginTop: -88,
    borderRadius: 16,
    overflow: "hidden",
    ...(Platform.select({
      web: { boxShadow: "0 28px 64px -24px rgba(11, 26, 23, 0.34)" },
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 22 },
        shadowOpacity: 0.26,
        shadowRadius: 48,
        elevation: 16,
      },
    }) as any),
  },
  searchDockLarge: {
    maxWidth: 1060,
    borderRadius: 20,
  },
  searchDockPhone: {
    marginTop: -56,
    borderRadius: 12,
  },

  ownerBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    paddingHorizontal: 28,
    paddingVertical: 20,
    backgroundColor: colors.ink,
  },
  ownerBandPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  ownerCopy: { flexShrink: 1, gap: 3 },
  ownerTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 17,
  },
  ownerSub: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  ownerCta: {
    flexShrink: 0,
    height: 46,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  ownerCtaPhone: { height: 44 },
  ownerCtaHovered: { backgroundColor: "rgba(255, 255, 255, 0.88)" },
  ownerCtaText: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 15,
  },




  /* 3. Featured Properties */
  featuredWrapper: {
    width: "100%",
  },
  featuredCardsRow: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  featuredCard: {
    width: 520,
    height: 325,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#EEF3F1",
    ...(Platform.OS === "web" ? {
      transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease",
    } : {}),
  },
  featuredCardInner: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  featuredCardHovered: {
    transform: [{ translateY: -4 }, { scale: 1.01 }],
    shadowColor: "rgba(4, 207, 146, 0.3)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  featuredCardBg: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    padding: 16,
    ...(Platform.OS === "web" ? {
      transition: "transform 0.35s ease",
    } : {}),
  },
  featuredCardBgHovered: {
    transform: [{ scale: 1.035 }],
  },
  featuredCardPlaceholder: {
    backgroundColor: "#EEF3F1",
  },
  featuredPlaceholderIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTopBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredVerifiedText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredInvestmentBadge: {
    backgroundColor: "#FDEEE2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredInvestmentText: {
    color: "#F4823A",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredBottomDetails: {
    gap: 2,
  },
  featuredLocation: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
  },
  featuredPrice: {
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginTop: 2,
  },
  featuredTextDark: {
    color: "#0B1A17",
  },

  /* Position Bar for Featured Properties (Both Mobile & PC) */
  featuredPositionBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  featuredPositionTrack: {
    flex: 1,
    maxWidth: 220,
    height: 6,
    backgroundColor: "#DFEAE4",
    borderRadius: 999,
    position: "relative",
    overflow: "hidden",
  },
  featuredPositionTrackPhone: {
    maxWidth: 160,
  },
  featuredPositionThumb: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: colors.green,
    borderRadius: 999,
  },
  scrollArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D3DFD8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollArrowBtnDisabled: {
    opacity: 0.35,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  scrollArrowBtnPressed: {
    backgroundColor: "#EAF7F1",
    transform: [{ scale: 0.93 }],
  },


  requestState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 28,
    borderRadius: 16,
    backgroundColor: "#F8FBF9",
    borderWidth: 1,
    borderColor: "#DDE8E3",
  },
  requestStateTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 16,
    textAlign: "center",
  },
  requestStateCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },



  /* 10. Market Insights & Trusted Partners */
  twoColSection: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  twoColSectionTablet: {
    flexDirection: "column",
  },
  marketInsightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24.8,
  },
  chartWrapper: {
    marginTop: 16,
    width: "100%",
  },

  trustedPartnersCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24.8,
  },
  partnersList: {
    gap: 12,
    marginTop: 8,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 12,
  },
  partnerInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  partnerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerAvatarText: {
    color: "#2251D6",
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  partnerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partnerNameText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  partnerDealsText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  partnerViewBtn: {
    paddingHorizontal: 12.8,
    paddingVertical: 6.8,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    backgroundColor: "#FFFFFF",
  },
  partnerViewBtnText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },

  /* 11. Latest Property News */
  newsGrid: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    alignItems: "flex-start",
  },
  newsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  newsGridPhone: {
    flexDirection: "column",
    gap: 14,
    alignItems: "stretch",
  },
  newsCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    padding: 0.8,
  },
  newsCardTablet: {
    flex: 0,
    flexBasis: "48.5%",
    minWidth: "48.5%",
    maxWidth: "48.5%",
  },
  newsCardPhone: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    borderRadius: 16,
  },
  newsImageWrap: {
    height: 157,
    backgroundColor: "#F4F6F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsBody: {
    padding: 16,
    gap: 8,
  },
  newsTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newsTagPill: {
    backgroundColor: "#E8EEFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newsTagPillText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  newsTimeText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  newsTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
