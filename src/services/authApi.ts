import apiClient from "./apiClient";
import {
  changePasswordDtoSchema,
  googleLoginSchema,
  loginSchema,
  registerDtoSchema,
} from "@/lib/schemas/auth";
import type {
  ApiResponse,
  AuthMeResponse,
  AuthResponse,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from "@/types/api";

export async function registerUser(dto: RegisterDto) {
  // Guarantee only API-compliant fields (full_name, email, password) are sent,
  // stripping any client-side fields like confirmPassword prior to validation and API dispatch.
  const payload: RegisterDto = {
    full_name: (dto.full_name ?? "").trim(),
    email: (dto.email ?? "").trim(),
    password: dto.password,
  };
  const validated = registerDtoSchema.parse(payload);
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/v1/auth/register", validated);
  return data;
}

export async function loginUser(dto: LoginDto) {
  const validated = loginSchema.parse(dto);
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/v1/auth/login", validated);
  return data;
}

export async function loginWithGoogle(idToken: string) {
  const validated = googleLoginSchema.parse({ id_token: idToken });
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/v1/auth/google", validated);
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
  const validated = changePasswordDtoSchema.parse(dto);
  const { data } = await apiClient.patch<ApiResponse<null>>("/v1/auth/change-password", validated);
  return data;
}

