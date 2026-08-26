import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignPermission as assignPermissionRequest,
  assignRole as assignRoleRequest,
  revokePermission as revokePermissionRequest,
  revokeRole as revokeRoleRequest,
} from "@/services/roleApi";
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
      await assignRoleRequest(dto);
    },
    onSuccess: invalidateUserRoles,
  });

  const revokeRole = useMutation({
    mutationFn: async (dto: RevokeRoleDto) => {
      await revokeRoleRequest(dto);
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
      if (!roleId) throw new Error("Role is required");
      await assignPermissionRequest(roleId, dto);
    },
    onSuccess: invalidateRoles,
  });

  const revokePermission = useMutation({
    mutationFn: async (permissionId: string) => {
      if (!roleId) throw new Error("Role is required");
      await revokePermissionRequest(roleId, permissionId);
    },
    onSuccess: invalidateRoles,
  });

  return { assignPermission, revokePermission };
}
