import type { ReactNode } from "react";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";

/**
 * Renders `children` only for a signed-in user holding `permission`.
 *
 * The component-level sibling of RequirePermission: that one is a route gate
 * and answers a denial with a 404 page. This one renders nothing, because it
 * sits inside public lists and detail pages where a 404 would replace content
 * the visitor is entitled to see.
 *
 * Showing or hiding is cosmetic. The API authorises every mutation itself.
 */
export function IfPermitted({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const allowed = useAuthStore(
    (s) => s.user !== null && hasPermission(s.userRoles, permission),
  );

  // Before hydration we do not know who this is. Rendering nothing keeps admin
  // markup out of the static export, which ships to every visitor and to
  // Googlebot.
  if (!hydrated || !allowed) return null;

  return <>{children}</>;
}
