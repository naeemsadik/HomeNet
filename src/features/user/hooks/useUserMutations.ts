import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { AuthMeResponse } from "@/types/api";

async function updateUserProfile(id: string, data: { full_name?: string }): Promise<ApiResponse<AuthMeResponse>> {
  const { data: res } = await apiClient.patch<ApiResponse<AuthMeResponse>>(`/v1/users/${id}`, data);
  return res;
}

async function uploadUserAvatar(file: Blob | File): Promise<ApiResponse<AuthMeResponse>> {
  const formData = new FormData();
  if ((globalThis as any).File && file instanceof (globalThis as any).File) {
    formData.append("file", file as File);
  } else {
    formData.append("file", file as Blob, "avatar.jpg");
  }
  const { data: res } = await apiClient.post<ApiResponse<AuthMeResponse>>("/v1/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
}

async function deleteUserAvatar(): Promise<ApiResponse<AuthMeResponse>> {
  const { data: res } = await apiClient.delete<ApiResponse<AuthMeResponse>>("/v1/users/avatar");
  return res;
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { full_name?: string } }) => updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadUserAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
