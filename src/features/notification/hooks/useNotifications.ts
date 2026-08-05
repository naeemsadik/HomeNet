import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, fetchUnreadCount, markAllRead, markAsRead } from "../api/notificationApi";

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) => fetchNotifications({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data) return undefined;
      const { total, limit } = lastPage.data;
      const loaded = allPages.length * limit;
      return loaded < total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
