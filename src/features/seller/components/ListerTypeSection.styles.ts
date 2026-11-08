import { StyleSheet } from "react-native";
import { colorTokens, fonts } from "@/theme";
import { profileStyles } from "@/components/accountProfile/accountProfileStyles";

/** The profile's card and field look, plus the two choice cards and the company fields. */
export const styles = {
  ...profileStyles,
  ...StyleSheet.create({
    // Choice cards: same 10 radius as the form's buttons; the border width never
    // changes between states, so selecting one does not shift the layout.
    optionRow: {
      flexDirection: "row",
      gap: 12,
    },
    optionRowPhone: {
      flexDirection: "column",
      gap: 8,
    },
    option: {
      flex: 1,
      minHeight: 64,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "rgba(11,26,23,0.12)",
      backgroundColor: "#FFFFFF",
    },
    optionActive: {
      borderColor: colorTokens.brand,
      backgroundColor: colorTokens.brandSurface,
    },
    optionText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    optionTitle: {
      fontSize: 14.5,
      fontFamily: fonts.semiBold,
      fontWeight: "600",
      color: "#0B1A17",
    },
    optionHint: {
      fontSize: 12.5,
      fontFamily: fonts.regular,
      color: "#5C6B66",
      lineHeight: 18,
    },
    // A radio is round by convention; it reads as "pick one" at a glance.
    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: "rgba(11,26,23,0.3)",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    radioActive: {
      borderColor: colorTokens.brandText,
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colorTokens.brandText,
    },

    // Company fields: logo beside the name on wide screens, above it on a phone.
    companyFields: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 20,
      marginTop: 20,
    },
    companyFieldsPhone: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: 16,
    },
    logoCol: {
      alignItems: "center",
      gap: 8,
      minWidth: 88,
    },
    // On a phone the logo sits in a row with its actions instead of floating centred.
    logoColPhone: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    logoActionsPhone: {
      alignItems: "flex-start",
    },
    logoTile: {
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorTokens.brandSurface,
      borderWidth: 1,
      borderColor: "rgba(11,26,23,0.08)",
    },
    logoActions: {
      alignItems: "center",
      gap: 4,
    },
    linkText: {
      fontSize: 13,
      fontFamily: fonts.semiBold,
      fontWeight: "600",
      color: "#0F6D55",
    },
    linkTextMuted: {
      fontSize: 13,
      fontFamily: fonts.medium,
      fontWeight: "500",
      color: "#5C6B66",
    },
    nameCol: {
      flex: 1,
      minWidth: 0,
    },

    saveRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: "rgba(11,26,23,0.06)",
    },
    saveListerBtn: {
      minHeight: 44,
      minWidth: 140,
      paddingHorizontal: 22,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorTokens.brand,
    },
  }),
};
