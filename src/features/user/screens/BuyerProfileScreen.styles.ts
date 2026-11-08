import { Platform, StyleSheet } from "react-native";
import { fonts } from "@/theme";

/** Only the page around the form: its scroll padding and the Back + title row. */
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
  // Same shape as the form's secondary buttons (Change password), not a pill.
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.12)",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 1px 2px rgba(11, 26, 23, 0.04)" }
      : { elevation: 1 }),
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
});
