import apiClient from "./apiClient";
import type { ApiResponse, CreatePropertyDto, UpdatePropertyDto } from "@/types/api";
import type { Property, PropertyFilters, PaginatedResponse, PropertyMedia } from "@/features/property/types/property";

/**
 * Fetch published/active properties with filters & pagination (GET /v1/properties).
 */
export async function getProperties(params: PropertyFilters = {}): Promise<ApiResponse<PaginatedResponse<Property>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Property>>>("/v1/properties", { params });
  return data;
}

/**
 * Fetch single property details by ID (GET /v1/properties/:id).
 */
export async function getPropertyById(id: string): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.get<ApiResponse<Property>>(`/v1/properties/${id}`);
  return data;
}

/**
 * Create a new property listing (POST /v1/properties).
 */
export async function createProperty(dto: CreatePropertyDto): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.post<ApiResponse<Property>>("/v1/properties", dto);
  return data;
}

/**
 * Update an existing property listing (PATCH /v1/properties/:id).
 */
export async function updateProperty(id: string, dto: UpdatePropertyDto): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.patch<ApiResponse<Property>>(`/v1/properties/${id}`, dto);
  return data;
}

/**
 * Submit property for verification (POST /v1/properties/:id/submit).
 */
export async function submitProperty(id: string): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.post<ApiResponse<Property>>(`/v1/properties/${id}/submit`);
  return data;
}

/**
 * Upload media file for a property (POST /v1/properties/:id/media).
 */
export async function uploadPropertyMedia(id: string, formData: FormData): Promise<ApiResponse<PropertyMedia>> {
  const { data } = await apiClient.post<ApiResponse<PropertyMedia>>(`/v1/properties/${id}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Delete a media file (DELETE /v1/properties/:id/media/:mediaId).
 */
export async function deletePropertyMedia(id: string, mediaId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/properties/${id}/media/${mediaId}`);
  return data;
}

/**
 * Save / Favorite a property (POST /v1/properties/:id/save).
 */
export async function saveProperty(id: string): Promise<ApiResponse<{ saved: boolean }>> {
  const { data } = await apiClient.post<ApiResponse<{ saved: boolean }>>(`/v1/properties/${id}/save`);
  return data;
}

/**
 * Remove property from saved list (DELETE /v1/properties/:id/save).
 */
export async function unsaveProperty(id: string): Promise<ApiResponse<{ saved: boolean }>> {
  const { data } = await apiClient.delete<ApiResponse<{ saved: boolean }>>(`/v1/properties/${id}/save`);
  return data;
}

/**
 * Get current user's saved properties (GET /v1/properties/saved).
 */
export async function getSavedProperties(): Promise<ApiResponse<Property[]>> {
  const { data } = await apiClient.get<ApiResponse<Property[]>>("/v1/properties/saved");
  return data;
}

/**
 * Get current user's uploaded properties (GET /v1/properties/my-properties).
 */
export async function getMyProperties(): Promise<ApiResponse<Property[]>> {
  const { data } = await apiClient.get<ApiResponse<Property[]>>("/v1/properties/my-properties");
  return data;
}

/**
 * Admin: Update property status (PATCH /v1/properties/:id/admin).
 */
export async function adminUpdatePropertyStatus(
  id: string,
  status: "draft" | "pending" | "active" | "sold" | "archived"
): Promise<ApiResponse<Property>> {
  const { data } = await apiClient.patch<ApiResponse<Property>>(`/v1/properties/${id}/admin`, { status });
  return data;
}
