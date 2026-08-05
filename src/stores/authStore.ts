import { create } from "zustand";
import apiClient from "@/services/apiClient";
import { saveTokens, clearTokens } from "@/services/tokenStorage";
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  AuthMeResponse,
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
} from "@/types/api";
import type { UserRole } from "@/features/admin/types/admin";

// ─── Store Shape ───────────────────────────────────────────────────────────

interface AuthState {
  /** The currently authenticated user, or `null` when logged out. */
  user: AuthUser | null;
  /** `true` while any auth request (login / register / refresh / etc.) is in flight. */
  loading: boolean;
  /** Human-readable error message from the last failed operation. */
  error: string | null;
  /** Raw `error_code` from the backend envelope (useful for inline field errors). */
  errorCode: number | null;
  /** User's assigned roles with permissions (fetched after login). */
  userRoles: UserRole[];

  // ── Actions ──────────────────────────────────────────────────────────────
  register: (dto: RegisterDto) => Promise<boolean>;
  login: (dto: LoginDto) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<boolean>;
  clearError: () => void;
  /** Hydrate the store on app startup – reads tokens & calls GET /me. */
  hydrate: () => Promise<void>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function extractError(err: unknown): { message: string; code: number | null } {
  if (typeof err === "object" && err !== null && "response" in err) {
    const axiosErr = err as { response?: { data?: ApiResponse<unknown> } };
    const payload = axiosErr.response?.data;
    if (payload) {
      return {
        message: payload.message || "Something went wrong",
        code: payload.error_code ?? null,
      };
    }
  }
  if (err instanceof Error) return { message: err.message, code: null };
  return { message: String(err), code: null };
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  errorCode: null,
  userRoles: [],

  // ── Register ─────────────────────────────────────────────────────────────
  register: async (dto) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
        "/v1/auth/register",
        dto,
      );
      const payload = data.data!;
      await saveTokens(payload.access_token, payload.refresh_token);
      set({ user: payload.user, loading: false });
      await get().fetchUserRoles(payload.user.id);
      return true;
    } catch (err) {
      const { message, code } = extractError(err);
      set({ loading: false, error: message, errorCode: code });
      return false;
    }
  },

  // ── Login ────────────────────────────────────────────────────────────────
  login: async (dto) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
        "/v1/auth/login",
        dto,
      );
      const payload = data.data!;
      await saveTokens(payload.access_token, payload.refresh_token);
      set({ user: payload.user, loading: false });
      await get().fetchUserRoles(payload.user.id);
      return true;
    } catch (err) {
      const { message, code } = extractError(err);
      set({ loading: false, error: message, errorCode: code });
      return false;
    }
  },

  // ── Logout ───────────────────────────────────────────────────────────────
  logout: async () => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const { getRefreshToken } = await import("@/services/tokenStorage");
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiClient
          .post("/v1/auth/logout", { refresh_token: refreshToken })
          .catch(() => {});
      }
    } finally {
      await clearTokens();
      set({ user: null, loading: false, error: null, errorCode: null, userRoles: [] });
    }
  },

  // ── Fetch Me ─────────────────────────────────────────────────────────────
  fetchMe: async () => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const { data } = await apiClient.get<ApiResponse<AuthMeResponse>>(
        "/v1/auth/me",
      );
      const me = data.data!;
      set({
        user: {
          id: me.id,
          full_name: me.full_name,
          email: me.email,
          avatar_url: me.avatar_url,
        },
        loading: false,
      });
      await get().fetchUserRoles(me.id);
    } catch (err) {
      const { message, code } = extractError(err);
      set({ loading: false, error: message, errorCode: code });
    }
  },

  // ── Fetch User Roles ─────────────────────────────────────────────────────
  fetchUserRoles: async (userId: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<UserRole[]>>(
        `/v1/roles/user/${userId}`,
      );
      set({ userRoles: data.data ?? [] });
    } catch {
      set({ userRoles: [] });
    }
  },

  // ── Change Password ─────────────────────────────────────────────────────
  changePassword: async (dto) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      await apiClient.patch<ApiResponse<null>>(
        "/v1/auth/change-password",
        dto,
      );
      set({ loading: false });
      return true;
    } catch (err) {
      const { message, code } = extractError(err);
      set({ loading: false, error: message, errorCode: code });
      return false;
    }
  },

  // ── Clear Error ──────────────────────────────────────────────────────────
  clearError: () => set({ error: null, errorCode: null }),

  // ── Hydrate ──────────────────────────────────────────────────────────────
  hydrate: async () => {
    const { getAccessToken } = await import("@/services/tokenStorage");
    const token = await getAccessToken();
    if (!token) return;

    await get().fetchMe();
  },
}));
