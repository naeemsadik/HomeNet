import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: colorTokens.primaryLight, text: colorTokens.primary },
  superadmin: { bg: colorTokens.primaryLight, text: colorTokens.primaryDark },
  moderator: { bg: colorTokens.verifiedLight, text: colorTokens.verified },
  buyer_seller: { bg: colorTokens.backgroundAlt, text: colorTokens.textSecondary },
};

interface UserRoleBadgesProps {
  roles: { role: { id: string; name: string } }[];
}

export function UserRoleBadges({ roles }: UserRoleBadgesProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <View style={styles.container}>
      {roles.map((ur) => {
        const colors = ROLE_COLORS[ur.role.name] ?? ROLE_COLORS.buyer_seller;
        return (
          <View key={ur.role.id} style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{ur.role.name}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fontTokens.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
