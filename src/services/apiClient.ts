import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";
import type { ApiResponse, ApiValidationData } from "@/types/api";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

import { sanitizeErrorMessage } from "@/lib/errorSanitizer";
import { reportError } from "@/lib/errorLogger";

export class ApiError extends Error {
  public readonly error_code: number | null;
  public readonly rawMessage: string;

  constructor(
    message: string,
    public readonly status: number | null = null,
    public readonly errorCode: number | null = null,
    public readonly validationErrors: string[] = [],
    rawMessage?: string,
  ) {
    const safeMessage = sanitizeErrorMessage(message, status, undefined, errorCode);
    super(safeMessage);
    this.name = "ApiError";
    this.error_code = errorCode;
    this.rawMessage = rawMessage || message;
  }
}

type UnauthorizedHandler = () => void | Promise<void>;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export async function notifyUnauthorized() {
  await unauthorizedHandler?.();
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  reportError(error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const payload = axiosError.response?.data;
    const validationData = payload?.data as ApiValidationData | null;
    const status = axiosError.response?.status ?? null;
    const rawMsg = payload?.message || axiosError.message || "Request failed";
    const sanitizedMsg = sanitizeErrorMessage(
      rawMsg,
      status,
      undefined,
      payload?.error_code ?? null,
    );

    return new ApiError(
      sanitizedMsg,
      status,
      payload?.error_code ?? null,
      // Several validator lines can become the same friendly sentence; show it once.
      [...new Set((validationData?.errors ?? []).map((err) => sanitizeErrorMessage(err, status)))],
      rawMsg,
    );
  }

  if (error instanceof Error) {
    const sanitized = sanitizeErrorMessage(error.message);
    return new ApiError(sanitized, null, null, [], error.message);
  }

  const str = String(error);
  return new ApiError(sanitizeErrorMessage(str), null, null, [], str);
}


export const PRODUCTION_API_BASE_URL = "https://api.homenetbd.com";
export const LOCAL_API_BASE_URL = "http://localhost:3000/api";

let apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_BASE_URL || PRODUCTION_API_BASE_URL
).replace(/\/$/, "");

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

export function setApiBaseUrl(newUrl: string) {
  apiBaseUrl = newUrl.replace(/\/$/, "");
  apiClient.defaults.baseURL = apiBaseUrl;
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Cross-tab and single-flight token refresh coordinator.
 *
 * Prevents refresh token reuse (F3 security finding):
 * 1. Pre-lock token check: If another request or tab has already rotated the
 *    tokens, reuse the newly stored access token immediately without hitting /v1/auth/refresh.
 * 2. Cross-tab lock (Web Locks API / `navigator.locks`): Serializes refresh calls
 *    across multiple browser tabs.
 * 3. Double-check inside lock: If another tab finished refreshing while this tab was
 *    waiting on the lock, reuse that tab's fresh token instead of making a duplicate call.
 * 4. In-tab single-flight: Concurrent 401s in the same tab share a single active Promise.
 * 5. Permanent 401 / 403 failure: Wipes tokens, notifies authStore, and breaks loops.
 */
let inTabRefreshPromise: Promise<string> | null = null;

async function runWithCrossTabLock<T>(action: () => Promise<T>): Promise<T> {
  if (
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    typeof navigator.locks?.request === "function"
  ) {
    return navigator.locks.request("homenet_auth_refresh_lock", async () => {
      return action();
    });
  }
  return action();
}

async function requestFreshTokens(failedToken: string | null): Promise<string> {
  return runWithCrossTabLock(async () => {
    // Check if another tab refreshed while we waited to acquire the lock
    const currentStoredToken = await getAccessToken();
    if (currentStoredToken && failedToken && currentStoredToken !== failedToken) {
      return currentStoredToken;
    }

    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new ApiError("Your session has expired", 401, 1106);
    }

    const response = await axios.post<
      ApiResponse<{ access_token: string; refresh_token: string }>
    >(`${apiBaseUrl}/v1/auth/refresh`, { refresh_token: refreshToken }, { timeout: 15_000 });

    const refreshed = response.data?.data;
    if (!response.data?.success || !refreshed?.access_token || !refreshed?.refresh_token) {
      throw new ApiError(response.data?.message || "Token refresh failed", 401);
    }

    await saveTokens(refreshed.access_token, refreshed.refresh_token);
    return refreshed.access_token;
  });
}

async function getOrStartTokenRefresh(failedToken: string | null): Promise<string> {
  if (!inTabRefreshPromise) {
    inTabRefreshPromise = (async () => {
      try {
        return await requestFreshTokens(failedToken);
      } finally {
        inTabRefreshPromise = null;
      }
    })();
  }
  return inTabRefreshPromise;
}

// Storage event listener for cross-tab session synchronization on Web
if (Platform.OS === "web" && typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === REFRESH_TOKEN_KEY || event.key === ACCESS_TOKEN_KEY) {
      if (!event.newValue) {
        // Tokens were cleared in another tab (logout or expired session)
        void notifyUnauthorized();
      }
    }
  });
}

function isPublicAuthRequest(url = "") {
  return ["/v1/auth/login", "/v1/auth/register", "/v1/auth/refresh"].some((path) =>
    url.endsWith(path),
  );
}

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    if (response.data?.success === false) {
      const validationData = response.data.data as ApiValidationData | null;
      return Promise.reject(
        new ApiError(
          response.data.message || "Request failed",
          response.status,
          response.data.error_code ?? null,
          validationData?.errors ?? [],
        ),
      );
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _fallbackTried?: boolean })
      | undefined;

    // Auto-failover: if localhost:3000 is unreachable, switch to the production API.
    const isNetworkError =
      !error.response &&
      (error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        (error.message && error.message.includes("Network Error")));

    const isTargetingLocalhost =
      apiBaseUrl.includes("localhost:3000") ||
      apiBaseUrl.includes("127.0.0.1:3000") ||
      Boolean(originalRequest?.url?.includes("localhost:3000"));

    if (isNetworkError && isTargetingLocalhost && !originalRequest?._fallbackTried) {
      if (__DEV__) console.warn(
        `[apiClient] Local server at ${apiBaseUrl} is unavailable. Switching to ${PRODUCTION_API_BASE_URL}`,
      );
      setApiBaseUrl(PRODUCTION_API_BASE_URL);

      if (originalRequest) {
        originalRequest._fallbackTried = true;
        originalRequest.baseURL = PRODUCTION_API_BASE_URL;
        if (originalRequest.url?.includes("localhost:3000")) {
          originalRequest.url = originalRequest.url.replace(
            /http:\/\/(localhost|127\.0\.0\.1):3000/,
            PRODUCTION_API_BASE_URL,
          );
        }
        return apiClient(originalRequest);
      }
    }

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(toApiError(error));
    }

    // Mark retry on originalRequest to prevent any loop on this specific request instance
    originalRequest._retry = true;

    const requestToken =
      originalRequest.headers?.Authorization?.toString().replace(/^Bearer\s+/i, "") || null;

    // 1. Fast path: check if stored access token already rotated in another request or tab
    try {
      const currentToken = await getAccessToken();
      if (currentToken && requestToken && currentToken !== requestToken) {
        originalRequest.headers.Authorization = `Bearer ${currentToken}`;
        return apiClient(originalRequest);
      }
    } catch {
      // Continue to full refresh coordinator
    }

    // 2. Coordinated refresh (single-flight in-tab, Web Locks cross-tab)
    try {
      const freshAccessToken = await getOrStartTokenRefresh(requestToken);
      originalRequest.headers.Authorization = `Bearer ${freshAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      const normalized = toApiError(refreshError);
      // Only a rejected refresh token ends the session. /v1/auth/refresh is rate
      // limited, so a 429, a 5xx or a dropped connection must keep the tokens.
      if (normalized.status === 400 || normalized.status === 401 || normalized.status === 403) {
        await clearTokens();
        await notifyUnauthorized();
      }
      return Promise.reject(normalized);
    }
  },
);

export default apiClient;
