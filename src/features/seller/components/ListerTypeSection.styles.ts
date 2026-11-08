import { Platform, StyleSheet } from "react-native";
import { colorTokens, fonts } from "@/theme";
import { profileStyles } from "@/components/accountProfile/accountProfileStyles";

/** The profile's card and field look, plus the Individual / Company switch and its Save row. */
export const styles = {
  ...profileStyles,
  ...StyleSheet.create({
    segmentedTrack: {
      flexDirection: "row",
      backgroundColor: "#F0F4F2",
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    segmentItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 10,
      borderRadius: 9,
      backgroundColor: "transparent",
    },
    segmentItemActive: {
      backgroundColor: "#FFFFFF",
      ...(Platform.OS === "web"
        ? {
            boxShadow: "0px 1px 3px rgba(11, 26, 23, 0.08)",
          }
        : {
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 2,
          }),
    },
    segmentItemText: {
      fontSize: 13.5,
      fontFamily: fonts.medium,
      fontWeight: "500",
      color: "#5C6B66",
    },
    segmentItemTextActive: {
      fontFamily: fonts.semiBold,
      fontWeight: "600",
      color: "#0B1A17",
    },
    listerSaveRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: "rgba(11,26,23,0.06)",
    },
    listerSaveBtn: {
      backgroundColor: colorTokens.brand,
      paddingHorizontal: 20,
      paddingVertical: 9,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 110,
    },
  }),
};
