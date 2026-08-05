import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { RoleWithPermissions } from "../types/admin";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<RoleWithPermissions[]>>("/v1/roles");
      return data.data ?? [];
    },
  });
}

export function useRoleDetail(roleId: string) {
  return useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<RoleWithPermissions>>(
        `/v1/roles/${roleId}`,
      );
      return data.data;
    },
    enabled: !!roleId,
  });
}
