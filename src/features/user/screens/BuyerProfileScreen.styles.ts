import { Platform, StyleSheet } from "react-native";
import { colorTokens, fonts } from "@/theme";

export const styles = StyleSheet.create({
  scrollBody: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  scrollBodyPhone: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentWrap: {
    width: "100%",
    maxWidth: 680,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  pageHeaderPhone: {
    gap: 12,
    marginBottom: 18,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 1px 3px rgba(11, 26, 23, 0.04)",
          transition: "all 0.15s ease",
        }
      : {
          elevation: 1,
        }),
  },
  backBtnPhone: {
    height: 36,
    paddingHorizontal: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  pageTitlePhone: {
    fontSize: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 1px 3px rgba(11, 26, 23, 0.03)",
        }
      : {
          elevation: 1,
        }),
  },
  cardPhone: {
    padding: 16,
    borderRadius: 20,
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
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 24,
  },
  profileRowPhone: {
    gap: 14,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E6FAF4",
  },
  avatarWrapPhone: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11, 26, 23, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoCol: {
    flex: 1,
    gap: 5,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  profileName: {
    fontSize: 17,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  buyerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(4, 207, 146, 0.12)",
  },
  buyerBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#03a675",
  },
  changePhotoBtn: {
    alignSelf: "flex-start",
  },
  changePhotoText: {
    fontSize: 13.5,
    fontFamily: fonts.medium,
    color: "#04cf92",
    fontWeight: "600",
  },
  formGroup: {
    width: "100%",
  },
  formGroupSpacing: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    marginBottom: 7,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.04)",
  },
  inputWrapPhone: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
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
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  // Security Section
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 6,
  },
  securityRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  securityInfoCol: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  securityDesc: {
    fontSize: 12.5,
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
    justifyContent: "space-between",
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
    color: colorTokens.onBrand,
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
    color: colorTokens.onBrand,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
