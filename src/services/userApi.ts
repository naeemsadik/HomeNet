import apiClient, { ApiError } from "./apiClient";
import { appendUpload, type UploadInput } from "./upload";
import { updateUserDtoSchema } from "@/lib/schemas/user";
import { bumpAvatarVersion } from "@/lib/avatarCache";
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

  const validated = updateUserDtoSchema.parse(dto);
  const { data } = await apiClient.patch<ApiResponse<UserProfile>>(`/v1/users/${id}`, validated);
  return data;
}


/** Admin-only: deletes another user's account. Users delete their own with `deleteMyAccount`. */
export async function deleteUser(id: string) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/users/${id}`);
  return data;
}

/** The phrase the user types to confirm, sent verbatim as `confirmation`. Never translated. */
export const DELETE_ACCOUNT_CONFIRMATION = "delete-my-account";

/**
 * Deletes the signed-in user's own account. A 404 means the account is
 * already gone (an earlier attempt succeeded but the response was lost), so
 * it counts as success. Any other failure is rethrown as an `ApiError`.
 */
export async function deleteMyAccount(): Promise<void> {
  try {
    // The body must hold only `confirmation`; extra fields are rejected with 400.
    await apiClient.delete<ApiResponse<null>>("/v1/users/me", {
      data: { confirmation: DELETE_ACCOUNT_CONFIRMATION },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return;
    throw err;
  }
}

export async function uploadAvatar(file: UploadInput, fileName = "avatar.jpg") {
  const formData = new FormData();
  appendUpload(formData, "file", file, fileName);
  const { data } = await apiClient.post<ApiResponse<UserProfile>>("/v1/users/avatar", formData, {
    headers: { "Content-Type": undefined },
  });
  bumpAvatarVersion();
  return data;
}

export async function deleteAvatar() {
  const { data } = await apiClient.delete<ApiResponse<UserProfile>>("/v1/users/avatar");
  bumpAvatarVersion();
  return data;
}

export type { UserProfile } from "@/types/api";
