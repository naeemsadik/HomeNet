import { StyleSheet } from "react-native";
import { colorTokens, colors, fonts, shadow, radius } from "@/theme";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
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
    backgroundColor: colorTokens.surface,
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colorTokens.divider,
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
    borderRadius: radius.xs,
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
    borderBottomColor: colorTokens.divider,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
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
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
  },

  // City selection chips
  chipsSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
    backgroundColor: colorTokens.surface,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.body,
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
    backgroundColor: colorTokens.canvas,
    borderWidth: 1.2,
    borderColor: colorTokens.divider,
    borderRadius: radius.xl,
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
    color: colorTokens.ink,
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
    borderRadius: radius.md,
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
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.xl,
    marginVertical: 2,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  areaRowSelected: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  areaRowFocused: {
    backgroundColor: colorTokens.surfaceSunken,
    borderColor: colorTokens.divider,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pinCircleSelected: {
    backgroundColor: colorTokens.brandBorder,
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
    color: colorTokens.ink,
    letterSpacing: -0.2,
  },
  areaNameSelected: {
    color: colorTokens.brandText,
    fontWeight: "700",
  },
  areaCity: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.muted,
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
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
    backgroundColor: colorTokens.surface,
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  directSelectBtnActive: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  directSelectText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  selectedCheckBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  drillBtn: {
    padding: 6,
    borderRadius: radius.sm,
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
    borderRadius: radius.md,
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
    borderRadius: radius.xs,
    backgroundColor: colors.soft,
  },
  skeletonLineShort: {
    width: "30%",
    height: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.soft,
  },
  skeletonArrow: {
    width: 16,
    height: 16,
    borderRadius: radius.md,
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
    borderRadius: radius.md,
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
  googleSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  googleSectionLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ambiguousBox: {
    marginTop: 8,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.canvas,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
  },
  ambiguousTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 4,
  },
});
