import { useQuery } from "@tanstack/react-query";
import { getRole, getRoles } from "@/services/roleApi";
import type { RoleWithPermissions } from "../types/admin";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await getRoles();
      return (response.data ?? []) as RoleWithPermissions[];
    },
  });
}

export function useRoleDetail(roleId: string) {
  return useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const response = await getRole(roleId);
      return response.data as RoleWithPermissions | null;
    },
    enabled: !!roleId,
  });
}
