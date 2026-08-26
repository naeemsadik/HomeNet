import { useQuery } from "@tanstack/react-query";
import { getUserRoles } from "@/services/roleApi";
import type { UserRole } from "../types/admin";

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["roles", "user", userId],
    queryFn: async () => {
      const response = await getUserRoles(userId);
      return (response.data ?? []) as UserRole[];
    },
    enabled: !!userId,
  });
}
