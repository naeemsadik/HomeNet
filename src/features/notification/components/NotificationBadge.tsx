import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUnreadCount } from "../hooks/useNotifications";
import { colorTokens } from "@/theme";

export function NotificationBadge() {
  const { data } = useUnreadCount();
  const count = data?.data?.count ?? 0;

  if (count === 0) return null;

  const displayCount = count > 99 ? "99+" : String(count);

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.error,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colorTokens.textInverse,
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
  },
});
