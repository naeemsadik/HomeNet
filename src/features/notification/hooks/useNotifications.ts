import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import type { NotificationAudience } from "@/types/api";
import { fetchNotifications, fetchUnreadCount, markAllRead, markAsRead } from "../api/notificationApi";

/**
 * Notifications are per signed-in user; nothing is fetched for visitors. That
 * matters beyond saving requests: a 401 from these endpoints would otherwise
 * run the app's session-expired handling on every poll.
 *
 * The user id is part of every cache key. Logging out does not clear the
 * query cache, so without it the next person to sign in on the same browser
 * would briefly see the previous user's notifications.
 */
function useSignedInUserId() {
  return useAuthStore((state) => state.user?.id ?? null);
}

export function useNotifications(
  audience: NotificationAudience = "user",
  { limit = 20, enabled = true }: { limit?: number; enabled?: boolean } = {},
) {
  const userId = useSignedInUserId();
  return useInfiniteQuery({
    queryKey: ["notifications", userId, audience, "list", limit],
    queryFn: ({ pageParam }) => fetchNotifications({ page: pageParam, limit, audience }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data) return undefined;
      const { total, limit: pageSize } = lastPage.data;
      return allPages.length * pageSize < total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: userId !== null && enabled,
    // Refetch whenever a list mounts (opening the bell, visiting the screen).
    // The badge polls every minute, so under the app-wide five-minute staleTime
    // the list could show a new count with none of the new items in it.
    staleTime: 0,
  });
}

export function useUnreadCount(audience: NotificationAudience = "user") {
  const userId = useSignedInUserId();
  return useQuery({
    queryKey: ["notifications", userId, audience, "unread-count"],
    queryFn: () => fetchUnreadCount(audience),
    enabled: userId !== null,
    // Polling rather than a socket: a minute's delay is fine for approvals and
    // price drops, and TanStack pauses it while the tab is in the background.
    refetchInterval: 60_000,
  });
}

/** Refreshes every audience: a change in one portal can move counts in both. */
function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function useMarkAllRead(audience: NotificationAudience = "user") {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => markAllRead(audience),
    onSuccess: invalidate,
  });
}

export function useMarkAsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: invalidate,
  });
}
