import { useQuery } from "@tanstack/react-query";
import { getUser, listUsers } from "@/services/userApi";
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
      const response = await listUsers();
      const query = filters.search?.trim().toLowerCase();
      const users = (response.data ?? []).filter((user) =>
        !query ||
        user.full_name.toLowerCase().includes(query) ||
        user.auth_identities.some((identity) => identity.email?.toLowerCase().includes(query)),
      );
      return {
        items: users as UserWithRoles[],
        total: users.length,
        page: 1,
        limit: users.length,
      };
    },
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      const response = await getUser(userId);
      return response.data as UserWithRoles | null;
    },
    enabled: !!userId,
  });
}
