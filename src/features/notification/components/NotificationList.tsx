import React, { useCallback } from "react";
import { FlatList, RefreshControl, View, Text, StyleSheet, ActivityIndicator , Pressable } from "react-native";
import { router } from "expo-router";
import type { Notification, NotificationAudience } from "@/types/api";
import {
  useMarkAllRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { colorTokens, fonts } from "@/theme";

import { Bell } from "lucide-react-native";

// Says only what the system actually sends. Messaging (FR-12) is out of
// scope, so nothing here may promise messages.
const EMPTY_COPY: Record<NotificationAudience, string> = {
  user: "You'll hear here when your listing is approved, or when a property you saved sells or drops in price.",
  admin: "New listings waiting for review will appear here.",
};

interface NotificationListProps {
  /** "user" in the app, "admin" in the admin panel. */
  audience?: NotificationAudience;
  /** Overrides the default: mark as read, then open the notification's link. */
  onPressItem?: (notification: Notification) => void;
}

export function NotificationList({ audience = "user", onPressItem }: NotificationListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications(audience);
  const { data: unreadData } = useUnreadCount(audience);
  const markAll = useMarkAllRead(audience);
  const { mutate: markOneRead } = useMarkAsRead();

  const notifications = data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];
  // The server's count covers pages not loaded yet.
  const totalUnread =
    unreadData?.data?.count ?? notifications.filter((n) => !n.read).length;

  const openNotification = useCallback(
    (notification: Notification) => {
      if (!notification.read) markOneRead(notification.id);
      if (onPressItem) onPressItem(notification);
      else if (notification.link) router.push(notification.link as never);
    },
    [markOneRead, onPressItem],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colorTokens.primary} size="large" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconWrap}>
          <Bell color={colorTokens.textMuted} size={40} />
        </View>
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySubtitle}>
          {EMPTY_COPY[audience]}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {totalUnread > 0 ? (
        <View style={styles.header}>
          <Text style={styles.unreadText}>{totalUnread} unread</Text>
          <Pressable
            onPress={() => markAll.mutate()}
            style={styles.markAllBtn}
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        </View>
      ) : null}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={openNotification} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colorTokens.primary}
            colors={[colorTokens.primary]}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colorTokens.primary} size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  listContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  unreadText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colorTokens.primary,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colorTokens.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
