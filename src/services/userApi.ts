export type ApiError = {
  success: false;
  message: string;
  error_code?: number;
  data: null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error_code?: number;
};

export class UserApiError extends Error {
  public errorCode: number | undefined;
  public statusCode: number;

  constructor(message: string, statusCode: number, errorCode?: number) {
    super(message);
    this.name = "UserApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export type AuthIdentity = {
  provider: string;
  email: string | null;
  phone: string | null;
  verified_at: string | null;
};

export type UserProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  auth_identities: AuthIdentity[];
};

export const userModuleBaseUrl = "http://localhost:8082/api/v1/users";

import { getAuthSession, saveAuthSession, clearAuthSession } from "@/services/authStorage";

export async function requestUserModule<T>(path: string, accessToken: string | null, init: RequestInit = {}) {
  const url = `${userModuleBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  async function doFetch(token: string | null) {
    const headersObj: Record<string, string> = {};
    if (init.headers) {
      try {
        const provided = init.headers as Headers | Record<string, string> | Array<[string, string]>;
        if (provided instanceof Headers) {
          provided.forEach((v, k) => (headersObj[k] = v));
        } else if (Array.isArray(provided)) {
          provided.forEach(([k, v]) => (headersObj[k] = v));
        } else {
          Object.assign(headersObj, provided);
        }
      } catch {
        // ignore
      }
    }

    if (token) headersObj["Authorization"] = `Bearer ${token}`;

    if (!headersObj["Content-Type"] && init.body && typeof init.body === "string") {
      headersObj["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...init,
      headers: headersObj as HeadersInit,
    });

    const rawText = await response.text();
    let payload: ApiEnvelope<T> | null = null;
    try {
      payload = rawText ? (JSON.parse(rawText) as ApiEnvelope<T>) : null;
    } catch {
      throw new Error(rawText || "Request failed");
    }

    return { response, payload } as const;
  }

  // First attempt
  let attempt = await doFetch(accessToken);

  // If unauthorized, try refreshing once using stored refresh token
  if (!attempt.response.ok && (attempt.response.status === 401 || attempt.payload?.error_code === 1106)) {
    try {
      const session = await getAuthSession();
      if (session?.refreshToken) {
        const authApi = await import("@/services/authApi");
        const refreshed = await authApi.refreshSession(session.refreshToken);
        if (refreshed?.data?.access_token) {
          const newSession = { ...session, accessToken: refreshed.data.access_token, refreshToken: refreshed.data.refresh_token ?? session.refreshToken };
          await saveAuthSession(newSession);
          attempt = await doFetch(newSession.accessToken);
        }
      }
    } catch (refreshErr) {
      console.warn("Token refresh failed:", refreshErr);
      await clearAuthSession();
    }
  }

  const { response, payload } = attempt;

  if (!response.ok) {
    throw new UserApiError(
      payload?.message || "Request failed",
      response.status,
      payload?.error_code,
    );
  }

  return payload || { success: true, message: "OK", data: null };
}

export async function listUsers(accessToken: string) {
  return requestUserModule<UserProfile[]>("", accessToken, { method: "GET" });
}

export async function getUser(accessToken: string, id: string) {
  return requestUserModule<UserProfile>(`/${id}`, accessToken, { method: "GET" });
}

export async function updateUser(accessToken: string, id: string, fullName: string) {
  return requestUserModule<UserProfile>(`/${id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ full_name: fullName }),
  });
}

export async function deleteUser(accessToken: string, id: string) {
  return requestUserModule<null>(`/${id}`, accessToken, { method: "DELETE" });
}

export async function uploadAvatar(accessToken: string, file: Blob | File, fileName = "avatar") {
  const formData = new FormData();
  // If the platform provides a File (web) append it directly so the filename/type are preserved.
  try {
    if ((globalThis as any).File && file instanceof (globalThis as any).File) {
      formData.append("file", file as File);
    } else {
      formData.append("file", file as Blob, fileName);
    }

    // Reuse the central request helper so headers and error parsing stay consistent.
    return requestUserModule<UserProfile>("/avatar", accessToken, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    // Normalize errors coming from malformed FormData or environment differences.
    if (err instanceof UserApiError) throw err;
    throw new UserApiError((err as Error)?.message || "Upload failed", 500);
  }
}

export async function deleteAvatar(accessToken: string) {
  return requestUserModule<UserProfile>("/avatar", accessToken, { method: "DELETE" });
}
