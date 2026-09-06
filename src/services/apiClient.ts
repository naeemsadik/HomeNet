import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, ApiValidationData } from "@/types/api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

export class ApiError extends Error {
  public readonly error_code: number | null;

  constructor(
    message: string,
    public readonly status: number | null = null,
    public readonly errorCode: number | null = null,
    public readonly validationErrors: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.error_code = errorCode;
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

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const payload = axiosError.response?.data;
    const validationData = payload?.data as ApiValidationData | null;
    return new ApiError(
      payload?.message || axiosError.message || "Request failed",
      axiosError.response?.status ?? null,
      payload?.error_code ?? null,
      validationData?.errors ?? [],
    );
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError(String(error));
}

export const VERCEL_API_BASE_URL = "https://homenet-api.vercel.app";
export const LOCAL_API_BASE_URL = "http://localhost:3000";

let apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_BASE_URL || VERCEL_API_BASE_URL
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

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processPendingQueue(error: unknown, token: string | null) {
  for (const pending of pendingQueue) {
    if (error || !token) pending.reject(error);
    else pending.resolve(token);
  }
  pendingQueue = [];
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

    // Auto-failover: If connecting to localhost failed because port 3000 is unavailable, switch to Vercel
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
      console.warn(
        `[apiClient] Local server at ${apiBaseUrl} is unavailable. Switching to Vercel endpoint: ${VERCEL_API_BASE_URL}`,
      );
      setApiBaseUrl(VERCEL_API_BASE_URL);

      if (originalRequest) {
        originalRequest._fallbackTried = true;
        originalRequest.baseURL = VERCEL_API_BASE_URL;
        if (originalRequest.url?.includes("localhost:3000")) {
          originalRequest.url = originalRequest.url.replace(
            /http:\/\/(localhost|127\.0\.0\.1):3000/,
            VERCEL_API_BASE_URL,
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

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new ApiError("Your session has expired", 401, 1106);

      const response = await axios.post<
        ApiResponse<{ access_token: string; refresh_token: string }>
      >(`${apiBaseUrl}/v1/auth/refresh`, { refresh_token: refreshToken }, { timeout: 15_000 });
      const refreshed = response.data.data;
      if (!response.data.success || !refreshed) {
        throw new ApiError(response.data.message || "Token refresh failed", 401);
      }

      await saveTokens(refreshed.access_token, refreshed.refresh_token);
      originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
      processPendingQueue(null, refreshed.access_token);
      return apiClient(originalRequest);
    } catch (refreshError) {
      const normalized = toApiError(refreshError);
      await clearTokens();
      processPendingQueue(normalized, null);
      await notifyUnauthorized();
      return Promise.reject(normalized);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
