import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useTranslation, translateListingStatus } from "@/i18n";

type PropertyStatus = "draft" | "active" | "pending" | "sold" | "archived";

const STATUS_CONFIG: Record<PropertyStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: colorTokens.backgroundAlt, text: colorTokens.textSecondary, label: "Draft" },
  active: { bg: colorTokens.primaryLight, text: colorTokens.primary, label: "Active" },
  pending: { bg: colorTokens.warningLight, text: colorTokens.warning, label: "Pending" },
  sold: { bg: colorTokens.verifiedLight, text: colorTokens.verified, label: "Sold" },
  archived: { bg: colorTokens.backgroundAlt, text: colorTokens.textMuted, label: "Archived" },
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { language } = useTranslation();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const label = language === "bn" ? translateListingStatus(status, language) : config.label;
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
