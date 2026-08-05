import { UserApiError } from "./userApi";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error_code?: number;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
};

export type AuthMeResponse = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  email_verified: boolean;
  created_at: string;
};

export const authModuleBaseUrl = (() => {
  // Prefer the documented backend URL and allow overriding it for local setups.
  const configuredBaseUrl = process.env.EXPO_PUBLIC_AUTH_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  // Keep browser and non-browser behavior aligned with the integration guide.
  try {
    if (typeof window !== "undefined" && window.location) {
      return "http://localhost:3000/v1/auth";
    }
  } catch {
    // ignore
  }

  // Fallback to localhost for non-browser environments or tests.
  return "http://localhost:3000/v1/auth";
})();

async function requestAuth<T>(path: string, init: RequestInit = {}) {
  const url = `${authModuleBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const rawText = await response.text();
  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = rawText ? (JSON.parse(rawText) as ApiEnvelope<T>) : null;
  } catch {
    throw new Error(rawText || "Request failed");
  }

  if (!response.ok) {
    throw new UserApiError(
      payload?.message || "Request failed",
      response.status,
      payload?.error_code,
    );
  }

  return payload || { success: true, message: "OK", data: null };
}

export async function registerUser(fullName: string, email: string, password: string) {
  return requestAuth<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
}

export async function loginUser(email: string, password: string) {
  return requestAuth<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshSession(refreshToken: string) {
  return requestAuth<{ access_token: string; refresh_token: string }>('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getCurrentUser(accessToken: string) {
  return requestAuth<AuthMeResponse>('/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function logoutUser(accessToken: string, refreshToken: string) {
  return requestAuth<null>('/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
