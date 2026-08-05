import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Bell, Check, Clock } from "lucide-react-native";
import type { Notification } from "@/types/api";
import { colorTokens } from "@/theme";
import { fonts } from "@/theme";

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <Pressable
      onPress={() => onPress?.(notification)}
      style={({ pressed }) => [
        styles.container,
        !notification.read && styles.unread,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Notification: ${notification.title}`}
    >
      <View style={[styles.iconWrap, !notification.read && styles.iconWrapUnread]}>
        <Bell color={!notification.read ? colorTokens.primary : colorTokens.textMuted} size={18} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !notification.read && styles.titleUnread]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <View style={styles.metaRow}>
          <Clock color={colorTokens.textMuted} size={12} />
          <Text style={styles.time}>{formatTimeAgo(notification.created_at)}</Text>
          {!notification.read ? (
            <View style={styles.unreadDot} />
          ) : (
            <Check color={colorTokens.textMuted} size={12} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  unread: {
    backgroundColor: colorTokens.primaryLight,
    borderColor: "#C4E4D5",
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
  },
  iconWrapUnread: {
    backgroundColor: "#C4E4D5",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
  },
  titleUnread: {
    fontFamily: fonts.bold,
  },
  message: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colorTokens.primary,
  },
});
