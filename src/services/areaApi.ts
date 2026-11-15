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
  /** Only the areas of one district (what the site calls a city). */
  district_id?: string;
  /** Only the areas of one division. */
  division_id?: string;
  parent_area_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** An area as the API sends it: it belongs to a district, which carries the name the site shows as the city. */
type ApiArea = Omit<Area, "city"> & {
  city?: string | null;
  district?: { id: string; name: string; division_id?: string | null } | null;
};

/**
 * The API has no `city` on an area. The district it sits in is the city: Dhaka,
 * Gazipur, Bogura. Reading that here means everything downstream (the city picker,
 * scoping an area list to a city, the city's listings) works from what the API says
 * and not from a guess at the area's name.
 */
export function normalizeArea<T extends ApiArea>(raw: T): Omit<T, "district"> & Area {
  const { district, ...rest } = raw;
  return {
    ...rest,
    city: raw.city ?? district?.name ?? null,
    district_id: raw.district_id ?? district?.id ?? null,
    division_id: raw.division_id ?? district?.division_id ?? null,
  } as Omit<T, "district"> & Area;
}

export async function fetchAreas(params: FetchAreasParams = {}) {
  const { data } = await apiClient.get<ApiResponse<Omit<AreaListResponse, "items"> & { items: ApiArea[] }>>(
    "/v1/areas",
    { params },
  );
  return { ...data, data: data.data ? { ...data.data, items: data.data.items.map(normalizeArea) } : data.data } as ApiResponse<AreaListResponse>;
}

export async function fetchArea(id: string) {
  const { data } = await apiClient.get<ApiResponse<ApiArea & Omit<AreaDetail, keyof Area>>>(`/v1/areas/${id}`);
  return { ...data, data: data.data ? normalizeArea(data.data) : data.data } as ApiResponse<AreaDetail>;
}

export async function fetchAreaChildren(id: string) {
  const { data } = await apiClient.get<ApiResponse<ApiArea[]>>(`/v1/areas/${id}/children`);
  return { ...data, data: data.data ? data.data.map(normalizeArea) : data.data } as ApiResponse<Area[]>;
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
