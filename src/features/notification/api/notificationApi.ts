import apiClient from "@/services/apiClient";
import type { ApiResponse, Notification, NotificationListResponse, UnreadCountResponse } from "@/types/api";

interface NotificationQueryParams {
  page?: number;
  limit?: number;
}

export async function fetchNotifications(params: NotificationQueryParams = {}): Promise<ApiResponse<NotificationListResponse>> {
  const { data } = await apiClient.get<ApiResponse<NotificationListResponse>>("/v1/notifications", {
    params: { page: params.page ?? 1, limit: params.limit ?? 20 },
  });
  return data;
}

export async function fetchUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
  const { data } = await apiClient.get<ApiResponse<UnreadCountResponse>>("/v1/notifications/unread-count");
  return data;
}

export async function markAllRead(): Promise<ApiResponse<null>> {
  const { data } = await apiClient.patch<ApiResponse<null>>("/v1/notifications/read-all");
  return data;
}

export async function markAsRead(id: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.patch<ApiResponse<null>>(`/v1/notifications/${id}/read`);
  return data;
}
