import apiClient from "@/services/apiClient";
import type {
  ApiResponse,
  NotificationAudience,
  NotificationListResponse,
  UnreadCountResponse,
} from "@/types/api";

interface NotificationQueryParams {
  page?: number;
  limit?: number;
  /** "user" for the app, "admin" for the admin panel. */
  audience?: NotificationAudience;
}

export async function fetchNotifications({
  page = 1,
  limit = 20,
  audience = "user",
}: NotificationQueryParams = {}): Promise<ApiResponse<NotificationListResponse>> {
  const { data } = await apiClient.get<ApiResponse<NotificationListResponse>>("/v1/notifications", {
    params: { page, limit, audience },
  });
  return data;
}

export async function fetchUnreadCount(
  audience: NotificationAudience = "user",
): Promise<ApiResponse<UnreadCountResponse>> {
  const { data } = await apiClient.get<ApiResponse<UnreadCountResponse>>(
    "/v1/notifications/unread-count",
    { params: { audience } },
  );
  return data;
}

export async function markAllRead(
  audience: NotificationAudience = "user",
): Promise<ApiResponse<{ updated: number }>> {
  const { data } = await apiClient.patch<ApiResponse<{ updated: number }>>(
    "/v1/notifications/read-all",
    undefined,
    { params: { audience } },
  );
  return data;
}

export async function markAsRead(id: string): Promise<ApiResponse<{ id: string; read: boolean }>> {
  const { data } = await apiClient.patch<ApiResponse<{ id: string; read: boolean }>>(
    `/v1/notifications/${id}/read`,
  );
  return data;
}
