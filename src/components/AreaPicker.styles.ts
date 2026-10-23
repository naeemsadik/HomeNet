import { StyleSheet } from "react-native";
import { colorTokens, colors, fonts, shadow } from "@/theme";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 40, 32, 0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalOverlayDesktop: {
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    maxHeight: "90%",
    ...shadow,
  },
  sheetPhone: {
    height: "85%",
  },
  sheetTablet: {
    height: 560,
    width: 480,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
  },
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.06)",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: "#0B1A17",
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearSelectBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearSelectText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.coral,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F5F4",
    alignItems: "center",
    justifyContent: "center",
  },

  // City selection chips
  chipsSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.06)",
    backgroundColor: "#FFFFFF",
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F3F5F4",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#04cf92",
    borderColor: "#04cf92",
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#4A5B55",
  },
  chipTextActive: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
  },

  // Search input
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    outlineStyle: "none",
  } as any,
  clearSearchBtn: {
    padding: 4,
  },

  // Breadcrumbs Navigation
  breadcrumbBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.soft,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  breadcrumbScroll: {
    alignItems: "center",
    gap: 4,
  },
  breadcrumbBtn: {
    paddingVertical: 4,
  },
  breadcrumbBtnDisabled: {
    opacity: 0.8,
  },
  breadcrumbTextHome: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  breadcrumbText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  breadcrumbTextActive: {
    color: colors.greenDark,
    fontFamily: fonts.bold,
  },
  breadDivider: {
    marginHorizontal: 2,
  },
  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
  },
  backStepText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.green,
  },

  // Selection Banner
  selectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.greenLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  selectionBannerLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.greenDark,
    flex: 1,
    marginRight: 10,
  },
  selectionBannerValue: {
    fontFamily: fonts.bold,
  },
  selectionBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.green,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectionBannerBtnText: {
    color: colorTokens.onBrand,
    fontSize: 12,
    fontFamily: fonts.bold,
  },

  // Main List Layout
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "transparent",
  },
  areaRowSelected: {
    backgroundColor: "#F0F7F4",
    borderColor: "rgba(15, 109, 85, 0.2)",
  },
  areaRowFocused: {
    backgroundColor: "#F4F7F5",
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F4F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pinCircleSelected: {
    backgroundColor: "#DCEEE8",
  },
  areaInfoPressable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
    paddingVertical: 3,
  },
  areaRowIcon: {
    marginRight: 12,
  },
  areaTextContainer: {
    flex: 1,
  },
  areaName: {
    fontSize: 14.5,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
    letterSpacing: -0.2,
  },
  areaNameSelected: {
    color: "#04cf92",
    fontWeight: "700",
  },
  areaCity: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#6D7E78",
    marginTop: 1.5,
  },
  actionCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  directSelectBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(4, 207, 146, 0.25)",
    backgroundColor: "#FFFFFF",
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  directSelectBtnActive: {
    backgroundColor: "#04cf92",
    borderColor: "#04cf92",
  },
  directSelectText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#04cf92",
  },
  selectedCheckBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  drillBtn: {
    padding: 6,
    borderRadius: 6,
  },

  // Skeletons
  skeletonContainer: {
    paddingTop: 10,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.soft,
    marginRight: 12,
  },
  skeletonTextWrap: {
    flex: 1,
    gap: 6,
  },
  skeletonLineLong: {
    width: "60%",
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.soft,
  },
  skeletonLineShort: {
    width: "30%",
    height: 8,
    borderRadius: 3,
    backgroundColor: colors.soft,
  },
  skeletonArrow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.soft,
  },

  // Errors / Empty
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.coral,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
