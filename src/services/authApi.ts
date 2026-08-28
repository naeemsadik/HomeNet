import apiClient from "./apiClient";
import type {
  ApiResponse,
  AuthMeResponse,
  AuthResponse,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from "@/types/api";

export async function registerUser(dto: RegisterDto) {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/v1/auth/register", dto);
  return data;
}

export async function loginUser(dto: LoginDto) {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/v1/auth/login", dto);
  return data;
}

export async function refreshSession(refreshToken: string) {
  const { data } = await apiClient.post<
    ApiResponse<{ access_token: string; refresh_token: string }>
  >("/v1/auth/refresh", { refresh_token: refreshToken });
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiResponse<AuthMeResponse>>("/v1/auth/me");
  return data;
}

export async function logoutUser(refreshToken: string) {
  const { data } = await apiClient.post<ApiResponse<null>>("/v1/auth/logout", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function changePassword(dto: ChangePasswordDto) {
  const { data } = await apiClient.patch<ApiResponse<null>>("/v1/auth/change-password", dto);
  return data;
}
