import apiClient from "./apiClient";
import { appendUpload, type UploadInput } from "./upload";
import type { ApiResponse, UpdateUserDto, UserProfile } from "@/types/api";

export async function listUsers() {
  const { data } = await apiClient.get<ApiResponse<UserProfile[]>>("/v1/users");
  return data;
}

export async function getUser(id: string) {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(`/v1/users/${id}`);
  return data;
}

export async function updateUser(id: string, dto: UpdateUserDto) {
  const { data } = await apiClient.patch<ApiResponse<UserProfile>>(`/v1/users/${id}`, dto);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/users/${id}`);
  return data;
}

export async function uploadAvatar(file: UploadInput, fileName = "avatar.jpg") {
  const formData = new FormData();
  appendUpload(formData, "file", file, fileName);
  const { data } = await apiClient.post<ApiResponse<UserProfile>>("/v1/users/avatar", formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

export async function deleteAvatar() {
  const { data } = await apiClient.delete<ApiResponse<UserProfile>>("/v1/users/avatar");
  return data;
}

export type { UserProfile } from "@/types/api";
