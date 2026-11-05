import { create } from "zustand";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/services/tokenStorage";
import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  registerUser,
} from "@/services/authApi";
import { getRoles, getUserRoles } from "@/services/roleApi";
import { notifyUnauthorized, toApiError } from "@/services/apiClient";
import { useSavedStore } from "@/stores/savedStore";
import { withAvatarVersion } from "@/lib/avatarCache";
import type {
  AuthUser,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UserRole,
} from "@/types/api";

/** The role every new account is given; it carries no staff permissions. */
const DEFAULT_ROLE_NAME = "buyer_seller";

/**
 * Fills in the permissions `GET /v1/roles/user/:id` leaves out.
 *
 * That endpoint returns each role without its `role_permissions`, while
 * `GET /v1/roles` returns them in full. Without this merge `hasPermission()`
 * is false for every user no matter what the backend has granted, so any
 * permission-gated interface stays hidden from the staff who hold it.
 *
 * Best effort, and deliberately so:
 *
 * - It is skipped once a role already carries its permissions, so it costs
 *   nothing extra the day the endpoint starts returning them.
 * - It is skipped for accounts holding nothing but the default `buyer_seller`
 *   role. `/v1/roles` is itself gated, and a rejection there would reach the
 *   refresh interceptor on the way back; not asking at all keeps ordinary
 *   sign-in on exactly the path it takes today. Every permission this merge
 *   exists to recover belongs to a staff role anyway.
 * - A failure still returns the roles as they arrived rather than dropping
 *   them, so staff sign-in cannot be broken by this either.
 *
 * This decides only what the client renders. The API authorises every request
 * against the token regardless of what is merged here.
 */
async function withRolePermissions(roles: UserRole[]): Promise<UserRole[]> {
  if (roles.length === 0 || roles.some((ur) => ur.role?.role_permissions?.length)) {
    return roles;
  }

  // Named rather than listed against ADMIN_ROLES: any staff role, including
  // one added later, should reach the merge. Only the role every account is
  // given at sign-up is excluded.
  if (roles.every((ur) => ur.role.name === DEFAULT_ROLE_NAME)) {
    return roles;
  }

  try {
    const all = await getRoles();
    const permissionsByRoleId = new Map(
      (all.data ?? []).map((role) => [role.id, role.role_permissions]),
    );

    return roles.map((ur) => {
      const permissions = permissionsByRoleId.get(ur.role.id);
      return permissions
        ? { ...ur, role: { ...ur.role, role_permissions: permissions } }
        : ur;
    });
  } catch {
    return roles;
  }
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  errorCode: number | null;
  userRoles: UserRole[];
  register: (dto: RegisterDto) => Promise<boolean>;
  login: (dto: LoginDto) => Promise<boolean>;
  /** Signs in or up with the credential (ID token) Google Identity Services returns. */
  googleLogin: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<boolean>;
  clearError: () => void;
  hydrate: () => Promise<void>;
  resetSession: () => void;
}

/** 401: the refresh in apiClient failed too. 404: the account is gone. */
function isSessionGone(error: unknown) {
  const status = toApiError(error).status;
  return status === 401 || status === 404;
}

const RESTORE_RETRY_DELAYS_MS = [1_000, 3_000];

async function fetchMeWithRetry(fetchMe: () => Promise<void>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchMe();
    } catch (error) {
      if (isSessionGone(error) || attempt >= RESTORE_RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, RESTORE_RETRY_DELAYS_MS[attempt]));
    }
  }
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
      void useSavedStore.getState().syncGuestSaves();
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
      void useSavedStore.getState().syncGuestSaves();
      return true;
    } catch (error) {
      set({ loading: false, ...authError(error) });
      return false;
    }
  },

  googleLogin: async (idToken) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const response = await loginWithGoogle(idToken);
      if (!response.data) throw new Error(response.message || "Google sign-in failed");
      await saveTokens(response.data.access_token, response.data.refresh_token);
      set({ user: response.data.user, loading: false });
      await get().fetchUserRoles(response.data.user.id);
      void useSavedStore.getState().syncGuestSaves();
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
      useSavedStore.getState().clearSaved();
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
          avatar_url: withAvatarVersion(me.avatar_url),
          email_verified: me.email_verified,
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
      set({ userRoles: await withRolePermissions(response.data ?? []) });
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
      if (await getAccessToken()) {
        await fetchMeWithRetry(get().fetchMe);
        void useSavedStore.getState().syncGuestSaves();
      }
    } catch (error) {
      // Only a rejected session ends it. A 429, a 5xx or a dropped connection
      // says nothing about the tokens, and clearing them signed people out
      // whenever the API was busy.
      if (isSessionGone(error)) {
        await clearTokens();
        get().resetSession();
      }
    } finally {
      set({ hydrated: true, loading: false });
    }
  },

  resetSession: () => {
    useSavedStore.getState().clearSaved();
    set({
      user: null,
      loading: false,
      error: null,
      errorCode: null,
      userRoles: [],
    });
  },
}));

// A console handle for debugging. Never in production, where it would hand
// login, logout and resetSession to any script on the page.
if (__DEV__ && typeof window !== "undefined") {
  (window as any).__authStore = useAuthStore;
}
