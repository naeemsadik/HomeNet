import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  AccommodationMediaItem,
  CreateAccommodationDraftPayload,
  MediaLabel,
  StudentAccommodationCardItem,
  StudentAccommodationDetail,
  StudentAccommodationSearchParams,
  StudentAccommodationSearchResponse,
} from "@/types/studentAccommodation";

export const BASE_PATH = "/v1/student-accommodation";

function unwrap<T>(payload: ApiResponse<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload &&
    (payload as ApiResponse<T>).data !== undefined &&
    (payload as ApiResponse<T>).data !== null
  ) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
}

export async function getAccommodations(
  params?: StudentAccommodationSearchParams,
): Promise<StudentAccommodationSearchResponse> {
  const { data } = await apiClient.get<
    ApiResponse<StudentAccommodationSearchResponse> | StudentAccommodationSearchResponse
  >(BASE_PATH, { params });
  return unwrap(data);
}

export async function getAccommodationDetail(
  id: string,
): Promise<StudentAccommodationDetail> {
  const { data } = await apiClient.get<
    ApiResponse<StudentAccommodationDetail> | StudentAccommodationDetail
  >(`${BASE_PATH}/${id}`);
  return unwrap(data);
}

export async function createDraft(
  payload: CreateAccommodationDraftPayload,
): Promise<{ id: string; status: "draft" }> {
  const { data } = await apiClient.post<
    ApiResponse<{ id: string; status: "draft" }> | { id: string; status: "draft" }
  >(`${BASE_PATH}/draft`, payload);
  return unwrap(data);
}

export async function updateDraft(
  id: string,
  payload: Partial<CreateAccommodationDraftPayload>,
): Promise<{ id: string; status: "draft" }> {
  const { data } = await apiClient.patch<
    ApiResponse<{ id: string; status: "draft" }> | { id: string; status: "draft" }
  >(`${BASE_PATH}/${id}/draft`, payload);
  return unwrap(data);
}

export async function uploadMedia(
  id: string,
  file: Blob | File,
  label: MediaLabel,
  isPrimary?: boolean,
): Promise<AccommodationMediaItem> {
  const formData = new FormData();
  if (typeof File !== "undefined" && file instanceof File) {
    formData.append("file", file, file.name);
  } else {
    formData.append("file", file as any);
  }
  formData.append("label", label);
  if (isPrimary !== undefined) {
    formData.append("is_primary", String(isPrimary));
  }

  const { data } = await apiClient.post<
    ApiResponse<AccommodationMediaItem> | AccommodationMediaItem
  >(`${BASE_PATH}/${id}/media`, formData, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return unwrap(data);
}

export async function publishAccommodation(
  id: string,
): Promise<{ id: string; status: "published" }> {
  const { data } = await apiClient.post<
    ApiResponse<{ id: string; status: "published" }> | { id: string; status: "published" }
  >(`${BASE_PATH}/${id}/publish`);
  return unwrap(data);
}

export async function deleteAccommodation(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

export async function toggleSave(
  id: string,
): Promise<{ is_saved: boolean }> {
  const { data } = await apiClient.post<
    ApiResponse<{ is_saved: boolean }> | { is_saved: boolean }
  >(`${BASE_PATH}/${id}/save`);
  return unwrap(data);
}

export async function getMyAccommodations(): Promise<StudentAccommodationCardItem[]> {
  const { data } = await apiClient.get<
    ApiResponse<StudentAccommodationCardItem[]> | StudentAccommodationCardItem[]
  >(`${BASE_PATH}/my`);
  return unwrap(data);
}

