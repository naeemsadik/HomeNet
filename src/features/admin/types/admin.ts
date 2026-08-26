import type { Property } from "@/features/property/types/property";

// ─── Permission ────────────────────────────────────────────────────────────
export interface Permission {
  id: string;
  name: string;
  description?: string | null;
}

// ─── Role ──────────────────────────────────────────────────────────────────
export interface RolePermission {
  permission: Permission;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  role_permissions: RolePermission[];
}

// ─── User with Roles ───────────────────────────────────────────────────────
export interface UserRole {
  id: string;
  role_id: string;
  role: {
    id: string;
    name: string;
    role_permissions?: RolePermission[];
  };
}

export interface UserWithRoles {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  auth_identities: {
    email: string | null;
    phone: string | null;
    provider: string;
  }[];
  user_roles?: UserRole[];
}

// ─── Property Admin ────────────────────────────────────────────────────────
export type PropertyAdminItem = Property & {
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  _count?: {
    media: number;
  };
};

export interface PropertyAdminListResponse {
  items: PropertyAdminItem[];
  total: number;
  page: number;
  limit: number;
}

// ─── Admin Stats ───────────────────────────────────────────────────────────
export interface AdminStatsResponse {
  totalUsers: number;
  totalProperties: number;
  pendingVerifications: number;
  activeListings: number;
}

// ─── Filter Types ──────────────────────────────────────────────────────────
export interface PropertyAdminFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserAdminFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Mutation DTOs ─────────────────────────────────────────────────────────
export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

export interface RevokeRoleDto {
  userId: string;
  roleId: string;
}

export interface AssignPermissionDto {
  permissionId: string;
}
