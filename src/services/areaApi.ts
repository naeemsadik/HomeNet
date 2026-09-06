import apiClient from "./apiClient";
import type {
  ApiResponse,
  Area,
  AreaDetail,
  AreaListResponse,
  CreateAreaDto,
  UpdateAreaDto,
} from "@/types/api";

export interface FetchAreasParams {
  city?: string;
  parent_area_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchAreas(params: FetchAreasParams = {}) {
  const { data } = await apiClient.get<ApiResponse<AreaListResponse>>("/v1/areas", { params });
  return data;
}

export async function fetchArea(id: string) {
  const { data } = await apiClient.get<ApiResponse<AreaDetail>>(`/v1/areas/${id}`);
  return data;
}

export async function fetchAreaChildren(id: string) {
  const { data } = await apiClient.get<ApiResponse<Area[]>>(`/v1/areas/${id}/children`);
  return data;
}

export async function createArea(dto: CreateAreaDto) {
  const { data } = await apiClient.post<ApiResponse<Pick<Area, "id" | "name">>>(
    "/v1/areas",
    dto,
  );
  return data;
}

export async function updateArea(id: string, dto: UpdateAreaDto) {
  const { data } = await apiClient.patch<ApiResponse<Pick<Area, "id">>>(
    `/v1/areas/${id}`,
    dto,
  );
  return data;
}

export async function deleteArea(id: string) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/v1/areas/${id}`);
  return data;
}
