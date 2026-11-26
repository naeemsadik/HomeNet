import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { effectiveListingStatus, translateListingStatus, useTranslation } from "@/i18n";

type PropertyStatus = "draft" | "active" | "pending" | "sold" | "archived" | "rejected";

/** `rented` is not a backend status; it is what a closed rental is called. */
type DisplayStatus = PropertyStatus | "rented";

const STATUS_CONFIG: Record<DisplayStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: colorTokens.backgroundAlt, text: colorTokens.textSecondary, label: "Draft" },
  active: { bg: colorTokens.primaryLight, text: colorTokens.primary, label: "Active" },
  pending: { bg: colorTokens.warningLight, text: colorTokens.warning, label: "Pending" },
  sold: { bg: colorTokens.verifiedLight, text: colorTokens.verified, label: "Sold" },
  rented: { bg: colorTokens.verifiedLight, text: colorTokens.verified, label: "Rented" },
  archived: { bg: colorTokens.backgroundAlt, text: colorTokens.textMuted, label: "Archived" },
  rejected: { bg: colorTokens.errorSurface, text: colorTokens.errorText, label: "Rejected" },
};

export function PropertyStatusBadge({
  status,
  listingType,
}: {
  status: PropertyStatus;
  /**
   * Turns a closed sale into "Sold" and a closed let into "Rented". Omitted
   * where the surface has no listing to hand, which leaves the raw status.
   */
  listingType?: string | null;
}) {
  const { language } = useTranslation();
  const display = effectiveListingStatus(status, listingType) as DisplayStatus;
  const config = STATUS_CONFIG[display] ?? STATUS_CONFIG.draft;
  const label = language === "bn" ? translateListingStatus(display, language) : config.label;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const ROLE_CONFIG: Record<string, { bg: string; text: string }> = {
  admin: { bg: colorTokens.primaryLight, text: colorTokens.primary },
  superadmin: { bg: colorTokens.primaryLight, text: colorTokens.primaryDark },
  moderator: { bg: colorTokens.verifiedLight, text: colorTokens.verified },
  buyer_seller: { bg: colorTokens.backgroundAlt, text: colorTokens.textSecondary },
};

export function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.buyer_seller;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontFamily: fontTokens.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
