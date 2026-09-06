import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

/**
 * Returns a function that gates an action behind authentication.
 *
 * - If the user is logged in, the action runs immediately.
 * - If the user is NOT logged in, the auth modal opens.
 *   On successful login/registration the action runs automatically.
 *
 * Usage:
 * ```ts
 * const requireAuth = useRequireAuth();
 * requireAuth(() => router.push("/saved"));
 * ```
 */
export function useRequireAuth() {
  const user = useAuthStore((s) => s.user);

  return (action: () => void) => {
    if (user) {
      action();
    } else {
      useAuthModalStore.getState().open(action);
    }
  };
}
