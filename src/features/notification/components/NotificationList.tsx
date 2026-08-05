import React from "react";
import { FlatList, RefreshControl, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { Notification } from "@/types/api";
import { useNotifications, useMarkAllRead } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { colorTokens, fonts } from "@/theme";
import { Pressable } from "react-native";
import { Bell } from "lucide-react-native";

interface NotificationListProps {
  onPressItem?: (notification: Notification) => void;
}

export function NotificationList({ onPressItem }: NotificationListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications();

  const markAll = useMarkAllRead();

  const notifications = data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];
  const totalUnread = notifications.filter((n) => !n.read).length;

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
          You'll see property updates, messages, and verification status here.
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
          <NotificationItem notification={item} onPress={onPressItem} />
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
