import apiClient from "./apiClient";
import type { ApiResponse, AreaListResponse } from "@/types/api";

export interface FetchAreasParams {
  city?: string;
  parent_area_id?: string | null;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch list of areas based on query parameters.
 */
export async function fetchAreas(params: FetchAreasParams = {}): Promise<ApiResponse<AreaListResponse>> {
  const { data } = await apiClient.get<ApiResponse<AreaListResponse>>("/v1/areas", { params });
  return data;
}

/**
 * Fetch child areas of a given area ID.
 */
export async function fetchAreaChildren(id: string | null): Promise<ApiResponse<AreaListResponse>> {
  return fetchAreas({ parent_area_id: id });
}
