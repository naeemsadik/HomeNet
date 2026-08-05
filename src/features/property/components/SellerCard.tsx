import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Linking,
} from "react-native";
import { Phone, Mail, UserRound } from "lucide-react-native";
import { colorTokens, fontTokens, shadow, webPointer } from "@/theme";
import type { PropertyDetailUser } from "../hooks/usePropertyDetail";

interface SellerCardProps {
  user: PropertyDetailUser | null;
}

export function SellerCard({ user }: SellerCardProps) {
  if (!user) return null;

  const primaryIdentity = user.auth_identities?.[0];
  const email = primaryIdentity?.email ?? null;
  const phone = primaryIdentity?.phone ?? null;

  const handleCall = () => {
    if (phone) {
      void Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = () => {
    if (email) {
      void Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <View style={[styles.card, shadow]}>
      <Text style={styles.heading}>Listed by</Text>

      <View style={styles.agentRow}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserRound color={colorTokens.textMuted} size={22} />
          </View>
        )}
        <View style={styles.agentInfo}>
          <Text style={styles.agentName} numberOfLines={1}>
            {user.full_name}
          </Text>
          <Text style={styles.agentRole}>Property Owner</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {phone ? (
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnPrimary,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Call ${user.full_name}`}
          >
            <Phone color={colorTokens.textInverse} size={16} />
            <Text style={styles.actionBtnTextPrimary}>Call</Text>
          </Pressable>
        ) : null}
        {email ? (
          <Pressable
            onPress={handleEmail}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnSecondary,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Email ${user.full_name}`}
          >
            <Mail color={colorTokens.primary} size={16} />
            <Text style={styles.actionBtnTextSecondary}>Email</Text>
          </Pressable>
        ) : null}
      </View>

      {phone ? (
        <Text style={styles.contactDetail}>{phone}</Text>
      ) : null}
      {email ? (
        <Text style={styles.contactDetail}>{email}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 14,
  },
  heading: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
  },
  agentInfo: {
    flex: 1,
    gap: 2,
  },
  agentName: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  agentRole: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 44,
    borderRadius: 12,
  },
  actionBtnPrimary: {
    backgroundColor: colorTokens.primary,
  },
  actionBtnSecondary: {
    backgroundColor: colorTokens.primaryLight,
    borderWidth: 1,
    borderColor: "#C4E4D5",
  },
  pressed: {
    opacity: 0.8,
  },
  actionBtnTextPrimary: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
  actionBtnTextSecondary: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },
  contactDetail: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
  },
});
