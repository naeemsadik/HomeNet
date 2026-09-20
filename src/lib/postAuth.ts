import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { hasAnyAdminPermission } from "@/lib/permissions";

/**
 * Where a user lands after signing in with no pending intent.
 *
 * Intent wins when there is one — `useRequireAuth` replays the action the user
 * was blocked on. This is only the fallback for a bare "Sign in".
 *
 * Only `admin` / `superadmin` exist as roles today; everyone else is treated as
 * a seeker and sent to search. Add seller routing here if an owner role lands.
 */
export function resolvePostAuthDestination(): string {
  const { userRoles } = useAuthStore.getState();
  if (hasAnyAdminPermission(userRoles)) return "/admin";
  return "/buy";
}

export function goToPostAuthDestination() {
  router.replace(resolvePostAuthDestination() as never);
}
