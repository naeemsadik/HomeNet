import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse } from "@/types/api";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./tokenStorage";

// ─── Axios Instance ────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor – inject JWT ──────────────────────────────────────

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Refresh-token machinery ───────────────────────────────────────────────

let isRefreshing = false;

/**
 * Queue of requests that arrived while a token refresh was already in flight.
 * Each entry is a pair of `resolve` / `reject` callbacks that will be settled
 * once the refresh attempt completes.
 */
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processPendingQueue(error: unknown, token: string | null) {
  for (const { resolve, reject } of pendingQueue) {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  }
  pendingQueue = [];
}

// ─── Response Interceptor – handle 401 + refresh + retry ───────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and only once per request.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request.
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          },
          reject: (err: unknown) => {
            reject(err);
          },
        });
      });
    }

    // Start the refresh flow.
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Use a plain axios call (not the instance) to avoid interceptor loops.
      const { data } = await axios.post<
        ApiResponse<{ access_token: string; refresh_token: string }>
      >(
        `${apiClient.defaults.baseURL}/v1/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Token refresh failed");
      }

      const { access_token, refresh_token } = data.data;
      await saveTokens(access_token, refresh_token);

      // Retry the original request with the fresh token.
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      // Flush queued requests with the new token.
      processPendingQueue(null, access_token);

      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed – clear stored tokens and reject everything.
      await clearTokens();
      processPendingQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
