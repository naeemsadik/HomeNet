export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error_code?: number;
}

export interface ApiValidationData {
  errors?: string[];
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface AuthMeResponse extends AuthUser {
  email_verified: boolean;
  created_at: string;
}

export interface AuthIdentity {
  provider: string;
  email: string | null;
  phone: string | null;
  verified_at: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  auth_identities: AuthIdentity[];
}

export interface UpdateUserDto {
  full_name?: string;
}

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

export interface Area {
  id: string;
  name: string;
  parent_area_id: string | null;
  city: string | null;
  created_at?: string;
  updated_at?: string;
  _count?: { children: number };
}

export interface AreaDetail extends Area {
  boundary?: string | null;
  centroid?: string | null;
  parent: Pick<Area, "id" | "name"> | null;
  children: Pick<Area, "id" | "name">[];
}

export interface AreaListResponse {
  items: Area[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateAreaDto {
  name: string;
  parent_area_id?: string | null;
  city?: string;
  boundary?: string;
  centroid?: string;
}

export type UpdateAreaDto = Partial<CreateAreaDto>;

export type PropertyType = "residential" | "commercial" | "land" | "parking";
export type ListingType = "sale" | "rent";
export type PropertyStatus = "draft" | "pending" | "active" | "sold" | "archived";

export interface UpsertPropertyDto {
  property_id?: string;
  area_id?: string;
  title?: string;
  description?: string;
  type?: PropertyType;
  subtype?: string;
  listing_type?: ListingType;
  price?: number;
  price_currency?: string;
  area_size?: number;
  area_unit?: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  amenities?: Record<string, unknown>;
  virtual_tour_url?: string;
  status?: PropertyStatus;
}

export type CreatePropertyDto = UpsertPropertyDto & { area_id: string };
export type UpdatePropertyDto = Omit<UpsertPropertyDto, "property_id">;

export interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  role_permissions: { permission: Permission }[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: Pick<Role, "id" | "name"> & {
    role_permissions?: { permission: Permission }[];
  };
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

export interface AssignPermissionDto {
  permissionId: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  pendingVerifications: number;
  activeListings: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}
