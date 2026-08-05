import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { AssignRoleDto, RevokeRoleDto, AssignPermissionDto } from "../types/admin";

export function useRoleMutations(userId?: string) {
  const queryClient = useQueryClient();

  const invalidateUserRoles = () => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["roles", "user", userId] });
    }
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const assignRole = useMutation({
    mutationFn: async (dto: AssignRoleDto) => {
      await apiClient.post("/v1/roles/assign", dto);
    },
    onSuccess: invalidateUserRoles,
  });

  const revokeRole = useMutation({
    mutationFn: async (dto: RevokeRoleDto) => {
      await apiClient.delete("/v1/roles/revoke", { data: dto });
    },
    onSuccess: invalidateUserRoles,
  });

  return { assignRole, revokeRole };
}

export function usePermissionMutations(roleId?: string) {
  const queryClient = useQueryClient();

  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: ["roles"] });
    if (roleId) {
      queryClient.invalidateQueries({ queryKey: ["roles", roleId] });
    }
  };

  const assignPermission = useMutation({
    mutationFn: async (dto: AssignPermissionDto) => {
      await apiClient.post(`/v1/roles/${roleId}/permissions`, dto);
    },
    onSuccess: invalidateRoles,
  });

  const revokePermission = useMutation({
    mutationFn: async (permissionId: string) => {
      await apiClient.delete(`/v1/roles/${roleId}/permissions/${permissionId}`);
    },
    onSuccess: invalidateRoles,
  });

  return { assignPermission, revokePermission };
}
