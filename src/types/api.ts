// ─── Generic API Envelope ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error_code?: number;
}

// ─── Auth Module ───────────────────────────────────────────────────────────
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

// ─── Extended profile returned by GET /v1/auth/me ──────────────────────────
export interface AuthMeResponse {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  email_verified: boolean;
  created_at: string;
}

// ─── Area / Location Module ────────────────────────────────────────────────
export interface Area {
  id: string;
  name: string;
  type: 'DIVISION' | 'CITY' | 'DISTRICT' | 'NEIGHBORHOOD' | 'UPZILA';
  parent_area_id: string | null;
  latitude: number | null;
  longitude: number | null;
  city?: string;
  _count?: {
    children: number;
  };
}

export interface AreaListResponse {
  items: Area[];
  total: number;
  page: number;
  limit: number;
}

// ─── Notification Module ────────────────────────────────────────────────────
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

// ─── Role Module ────────────────────────────────────────────────────────────
export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  role_permissions?: {
    permission: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}

// ─── Admin Module ───────────────────────────────────────────────────────────
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

// ─── Property Create/Update DTO ────────────────────────────────────────────
export interface CreatePropertyDto {
  title: string;
  description?: string;
  type: "residential" | "commercial" | "land" | "parking";
  listing_type: "sale" | "rent";
  price: number;
  area_id: string;
  bedrooms?: number;
  bathrooms?: number;
  area_size?: number;
  address?: string;
  location_lat?: number;
  location_lng?: number;
  amenities?: Record<string, unknown>;
  virtual_tour_url?: string;
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;

// ─── User Update DTO ───────────────────────────────────────────────────────
export interface UpdateUserDto {
  full_name?: string;
}

