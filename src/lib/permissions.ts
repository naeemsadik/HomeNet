import type { UserRole } from "@/features/admin/types/admin";

const ADMIN_ROLES = ["admin", "superadmin"];

export function hasPermission(userRoles: UserRole[], permission: string): boolean {
  return userRoles.some((ur) =>
    ur.role.role_permissions?.some((rp) => rp.permission.name === permission),
  );
}

export function isAdmin(userRoles: UserRole[]): boolean {
  return userRoles.some((ur) => ADMIN_ROLES.includes(ur.role.name));
}

export function getRoleName(userRoles: UserRole[]): string | null {
  if (userRoles.length === 0) return null;
  return userRoles[0].role.name;
}

export function hasAnyAdminPermission(userRoles: UserRole[]): boolean {
  return userRoles.some(
    (ur) =>
      ADMIN_ROLES.includes(ur.role.name) ||
      ur.role.role_permissions?.some((rp) =>
        [
          "manage_properties",
          "manage_users",
          "manage_roles",
          "manage_areas",
          "moderate_listing",
          "review_verification",
        ].includes(rp.permission.name),
      ),
  );
}
