import { StyleSheet } from "react-native";

/**
 * Only the padding around the form inside the seller workspace. The form's own
 * look lives in components/accountProfile, shared with the buyer profile.
 */
export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  scrollContentPhone: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
});
