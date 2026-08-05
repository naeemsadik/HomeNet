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
  city: string;
  parent_area_id: string | null;
}

