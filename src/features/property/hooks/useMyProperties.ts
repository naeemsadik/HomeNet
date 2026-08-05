import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Property, PaginatedResponse } from "../types/property";

async function fetchMyProperties(page: number = 1, limit: number = 20) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Property>>>("/v1/properties/my", {
    params: { page, limit },
  });
  return data;
}

export function useMyProperties() {
  return useInfiniteQuery({
    queryKey: ["my-properties"],
    queryFn: ({ pageParam = 1 }) => fetchMyProperties(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data) return undefined;
      const { total, limit } = lastPage.data;
      const loaded = allPages.length * limit;
      return loaded < total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
