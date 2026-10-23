import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUser, listUsers } from "@/services/userApi";
import type { UserWithRoles, UserAdminFilters } from "../types/admin";

// GET /v1/users is not paginated, so the full list is cached once per search
// and pages are revealed from it without further requests.
export const ADMIN_USERS_PAGE_SIZE = 20;

export function useAdminUsers(filters: UserAdminFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? ADMIN_USERS_PAGE_SIZE;
  return useQuery({
    queryKey: ["admin", "users", { search: filters.search }],
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
    select: (result) => ({ ...result, items: result.items.slice(0, page * limit), page, limit }),
    placeholderData: keepPreviousData,
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
