import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Property } from "../types/property";
import type { CreatePropertyDto, UpdatePropertyDto } from "@/types/api";

async function createProperty(dto: CreatePropertyDto): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.post<ApiResponse<Property>>("/v1/properties", dto);
  return data;
}

async function updateProperty(id: string, dto: UpdatePropertyDto): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.patch<ApiResponse<Property>>(`/v1/properties/${id}`, dto);
  return data;
}

async function deleteProperty(id: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/properties/${id}`);
  return data;
}

async function uploadMedia(propertyId: string, file: Blob | File, type: "image" | "video" = "image"): Promise<ApiResponse<Property>> {
  const formData = new FormData();
  if ((globalThis as any).File && file instanceof (globalThis as any).File) {
    formData.append("file", file as File);
  } else {
    formData.append("file", file as Blob, "media");
  }
  formData.append("type", type);
  const { data } = await apiClient.post<ApiResponse<Property>>(
    `/v1/properties/${propertyId}/media`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

async function deleteMedia(mediaId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/properties/media/${mediaId}`);
  return data;
}

async function submitForVerification(propertyId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(`/v1/properties/${propertyId}/submit`);
  return data;
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePropertyDto }) => updateProperty(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, file, type }: { propertyId: string; file: Blob | File; type?: "image" | "video" }) =>
      uploadMedia(propertyId, file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}

export function useSubmitForVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitForVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}
