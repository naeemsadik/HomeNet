import { Platform, StyleSheet } from "react-native";
import { colorTokens, fonts } from "@/theme";

/**
 * The one look for the account profile, used by the buyer and the seller
 * profile pages alike. They were two copies with two stylesheets, and only
 * one of them got the sharp-edge pass, so the same page looked different
 * depending on where it was opened from.
 */
export const profileStyles = StyleSheet.create({
  contentWrap: {
    width: "100%",
    maxWidth: 768,
  },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 1px 3px rgba(11, 26, 23, 0.04), 0px 4px 12px rgba(11, 26, 23, 0.02)",
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
    borderRadius: 6,
  },
  sectionSpacing: {
    marginTop: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
    letterSpacing: -0.2,
  },

  // Avatar, name and badge
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  profileRowPhone: {
    gap: 12,
  },
  // A person's photo stays round. The sharp-corner rule is for cards, fields and
  // buttons; a square frame around the round initials read as a box with a coin in it.
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: colorTokens.brandSurface,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    position: "relative",
  },
  avatarWrapPhone: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
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

  // Fields
  formGroup: {
    width: "100%",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.12)",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 1px 2px rgba(11, 26, 23, 0.03)",
        }
      : {}),
  },
  inputWrapPhone: {
    height: 46,
    paddingHorizontal: 14,
  },
  /** The email is shown, not edited: Save only ever sent the name. */
  inputWrapReadOnly: {
    backgroundColor: "#F4F6F5",
    borderColor: "rgba(11,26,23,0.06)",
    ...(Platform.OS === "web" ? { boxShadow: "none" } : {}),
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  textInputNormal: {
    fontWeight: "400",
    color: "#0B1A17",
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#3D4B47",
  },
  clearBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // Account security
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
  securityTitleDanger: {
    color: "#D4183D",
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.12)",
    backgroundColor: "#FFFFFF",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 1px 2px rgba(11, 26, 23, 0.04)",
        }
      : {}),
  },
  changePasswordBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 24, 61, 0.2)",
    backgroundColor: "#FFF9F9",
  },
  deleteAccountBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  fullWidthBtnPhone: {
    alignSelf: "stretch",
    justifyContent: "center",
  },

  // Bottom row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 24,
    paddingBottom: 40,
    width: "100%",
    gap: 12,
  },
  actionRowSplit: {
    justifyContent: "space-between",
  },
  actionRowPhone: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 24, 61, 0.2)",
    backgroundColor: "#FFFFFF",
  },
  logoutBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#D4183D",
  },
  saveBtn: {
    backgroundColor: colorTokens.brand,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 1px 3px rgba(15, 109, 85, 0.2), 0px 4px 12px rgba(15, 109, 85, 0.15)",
        }
      : {
          elevation: 2,
        }),
  },
  saveBtnPhone: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 120,
    borderRadius: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: colorTokens.onBrand,
  },
  pressed: {
    opacity: 0.85,
  },
});

/** Badge colours by meaning. Warning text is amber-800: the old #D97706 on amber-50 was under 3:1. */
export const badgeTones = {
  positive: { backgroundColor: "#E7F2EE", color: "#0F6D55" },
  warning: { backgroundColor: "#FEF3C7", color: "#92400E" },
  neutral: { backgroundColor: "#EEF2F0", color: "#3D4B47" },
} as const;

export type BadgeTone = keyof typeof badgeTones;
