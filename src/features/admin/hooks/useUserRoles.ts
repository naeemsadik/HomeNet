import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { UserRole } from "../types/admin";

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["roles", "user", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<UserRole[]>>(
        `/v1/roles/user/${userId}`,
      );
      return data.data ?? [];
    },
    enabled: !!userId,
  });
}
