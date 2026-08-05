import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { UserWithRoles, UserAdminFilters } from "../types/admin";

interface UserAdminListResponse {
  items: UserWithRoles[];
  total: number;
  page: number;
  limit: number;
}

export function useAdminUsers(filters: UserAdminFilters) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.search) params.search = filters.search;
      params.page = filters.page ?? 1;
      params.limit = filters.limit ?? 20;

      const { data } = await apiClient.get<ApiResponse<UserAdminListResponse>>(
        "/v1/users",
        { params },
      );
      return data.data ?? { items: [], total: 0, page: 1, limit: 20 };
    },
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<UserWithRoles>>(
        `/v1/users/${userId}`,
      );
      return data.data;
    },
    enabled: !!userId,
  });
}
