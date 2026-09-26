import { useCallback, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { Notification } from "@/types/api";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useMarkAsRead, useNotifications } from "../hooks/useNotifications";

/** The newest user notifications, for the dropdown under the header bell. */
export function NotificationPreview({ onNavigate }: { onNavigate: () => void }) {
  const { data, isLoading, isError } = useNotifications("user", { limit: 5 });
  const { mutate: markRead } = useMarkAsRead();
  const items = data?.pages[0]?.data?.items ?? [];

  const open = useCallback(
    (notification: Notification) => {
      if (!notification.read) markRead(notification.id);
      onNavigate();
      if (notification.link) router.push(notification.link as never);
    },
    [markRead, onNavigate],
  );

  const seeAll = useCallback(() => {
    onNavigate();
    router.push("/notifications" as never);
  }, [onNavigate]);

  let body: ReactNode;
  if (isLoading) {
    body = <ActivityIndicator color={colorTokens.brandText} style={styles.state} />;
  } else if (isError) {
    body = <Text style={styles.state}>Couldn't load notifications.</Text>;
  } else if (items.length === 0) {
    body = <Text style={styles.state}>You have no notifications yet.</Text>;
  } else {
    body = items.map((notification) => (
      <Pressable
        key={notification.id}
        accessibilityRole="button"
        accessibilityLabel={`${notification.read ? "" : "Unread: "}${notification.title}. ${notification.message}`}
        onPress={() => open(notification)}
        style={(state) => [
          styles.row,
          (state as { hovered?: boolean }).hovered && styles.rowHovered,
          webPointer,
        ]}
      >
        <View style={[styles.dot, notification.read && styles.dotRead]} />
        <View style={styles.rowText}>
          <Text style={[styles.title, !notification.read && styles.titleUnread]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
      </Pressable>
    ));
  }

  return (
    <View>
      <Text style={styles.heading}>Notifications</Text>
      {body}
      <Pressable accessibilityRole="link" onPress={seeAll} style={[styles.seeAll, webPointer]}>
        <Text style={styles.seeAllText}>See all notifications</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  state: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 6,
    marginHorizontal: -6,
    borderRadius: 8,
  },
  rowHovered: { backgroundColor: colorTokens.surfaceSunken },
  // Dark green, not mint: an unread marker is information, and mint is below
  // the 3:1 contrast that non-text UI needs.
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 5,
    backgroundColor: colorTokens.brandText,
  },
  dotRead: { backgroundColor: "transparent" },
  rowText: { flex: 1, gap: 2 },
  title: {
    color: colorTokens.ink,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  titleUnread: { fontFamily: fonts.semiBold, fontWeight: "600" },
  message: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  seeAll: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  seeAllText: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: "600",
  },
});
