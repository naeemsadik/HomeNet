import { create } from "zustand";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/services/tokenStorage";
import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/services/authApi";
import { getUserRoles } from "@/services/roleApi";
import { notifyUnauthorized, toApiError } from "@/services/apiClient";
import type {
  AuthUser,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UserRole,
} from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  errorCode: number | null;
  userRoles: UserRole[];
  register: (dto: RegisterDto) => Promise<boolean>;
  login: (dto: LoginDto) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<boolean>;
  clearError: () => void;
  hydrate: () => Promise<void>;
  resetSession: () => void;
}

function authError(error: unknown) {
  const normalized = toApiError(error);
  return { error: normalized.message, errorCode: normalized.errorCode };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,
  errorCode: null,
  userRoles: [],

  register: async (dto) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const response = await registerUser(dto);
      if (!response.data) throw new Error(response.message || "Registration failed");
      await saveTokens(response.data.access_token, response.data.refresh_token);
      set({ user: response.data.user, loading: false });
      await get().fetchUserRoles(response.data.user.id);
      return true;
    } catch (error) {
      set({ loading: false, ...authError(error) });
      return false;
    }
  },

  login: async (dto) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const response = await loginUser(dto);
      if (!response.data) throw new Error(response.message || "Login failed");
      await saveTokens(response.data.access_token, response.data.refresh_token);
      set({ user: response.data.user, loading: false });
      await get().fetchUserRoles(response.data.user.id);
      return true;
    } catch (error) {
      set({ loading: false, ...authError(error) });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await logoutUser(refreshToken).catch(() => undefined);
    } finally {
      await clearTokens();
      get().resetSession();
      await notifyUnauthorized();
    }
  },

  fetchMe: async () => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const response = await getCurrentUser();
      if (!response.data) throw new Error(response.message || "Profile not found");
      const me = response.data;
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
    } catch (error) {
      set({ loading: false, ...authError(error) });
      throw error;
    }
  },

  fetchUserRoles: async (userId) => {
    try {
      const response = await getUserRoles(userId);
      set({ userRoles: response.data ?? [] });
    } catch {
      set({ userRoles: [] });
    }
  },

  changePassword: async (dto) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      await changePasswordRequest(dto);
      await clearTokens();
      get().resetSession();
      await notifyUnauthorized();
      return true;
    } catch (error) {
      set({ loading: false, ...authError(error) });
      return false;
    }
  },

  clearError: () => set({ error: null, errorCode: null }),

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      if (await getAccessToken()) await get().fetchMe();
    } catch {
      await clearTokens();
      get().resetSession();
    } finally {
      set({ hydrated: true, loading: false });
    }
  },

  resetSession: () =>
    set({
      user: null,
      loading: false,
      error: null,
      errorCode: null,
      userRoles: [],
    }),
}));
