import apiClient from "./apiClient";
import { appendUpload, type UploadInput } from "./upload";
import type { ApiResponse, PropertyStatus, UpsertPropertyDto } from "@/types/api";
import type {
  PaginatedResponse,
  Property,
  PropertyFilters,
  PropertyMedia,
} from "@/features/property/types/property";

export type PropertyMutationResult = Pick<Property, "id"> & Partial<Property>;

export async function getProperties(params: PropertyFilters = {}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Property>>>("/v1/properties", {
    params,
  });
  return data;
}

export async function getAdminProperties(params: PropertyFilters = {}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Property>>>(
    "/v1/properties/admin",
    { params },
  );
  return data;
}

export async function getMyProperties(params: PropertyFilters = {}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Property>>>("/v1/properties/my", {
    params,
  });
  return data;
}

export async function getPropertyById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Property>>(`/v1/properties/${id}`);
  return data;
}

export async function upsertProperty(dto: UpsertPropertyDto) {
  const { data } = await apiClient.post<ApiResponse<PropertyMutationResult>>("/v1/properties", dto);
  return data;
}

export async function createProperty(dto: UpsertPropertyDto) {
  return upsertProperty(dto);
}

export async function updateProperty(id: string, dto: UpsertPropertyDto) {
  return upsertProperty({ ...dto, property_id: id });
}

export async function legacyPatchProperty(id: string, dto: UpsertPropertyDto) {
  const { data } = await apiClient.patch<ApiResponse<PropertyMutationResult>>(
    `/v1/properties/${id}`,
    dto,
  );
  return data;
}

export async function deleteProperty(id: string) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/properties/${id}`);
  return data;
}

export async function submitProperty(id: string) {
  const { data } = await apiClient.post<
    ApiResponse<{ id: string; status: PropertyStatus }>
  >(`/v1/properties/${id}/submit`);
  return data;
}

export async function uploadPropertyMedia(
  id: string,
  file: UploadInput,
  mediaType: "image" | "video",
  displayOrder?: number,
) {
  const formData = new FormData();
  appendUpload(formData, "file", file, mediaType === "image" ? "property.jpg" : "property.mp4");
  formData.append("media_type", mediaType);
  if (displayOrder !== undefined) formData.append("display_order", String(displayOrder));

  const { data } = await apiClient.post<ApiResponse<PropertyMedia>>(
    `/v1/properties/${id}/media`,
    formData,
    { headers: { "Content-Type": undefined } },
  );
  return data;
}

export async function deletePropertyMedia(mediaId: string) {
  const { data } = await apiClient.delete<ApiResponse<null>>(
    `/v1/properties/media/${mediaId}`,
  );
  return data;
}

export async function adminUpdateProperty(id: string, dto: UpsertPropertyDto) {
  const { data } = await apiClient.patch<ApiResponse<PropertyMutationResult>>(
    `/v1/properties/${id}/admin`,
    dto,
  );
  return data;
}

export async function adminDeleteProperty(id: string) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/properties/${id}/admin`);
  return data;
}

// Not documented by the supplied API; retained for existing unsupported screens.
export async function saveProperty(id: string) {
  const { data } = await apiClient.post<ApiResponse<{ saved: boolean }>>(`/v1/properties/${id}/save`);
  return data;
}

export async function unsaveProperty(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ saved: boolean }>>(`/v1/properties/${id}/save`);
  return data;
}

export async function getSavedProperties() {
  const { data } = await apiClient.get<ApiResponse<Property[]>>("/v1/properties/saved");
  return data;
}
