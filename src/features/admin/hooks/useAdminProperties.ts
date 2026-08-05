import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  PropertyAdminItem,
  PropertyAdminListResponse,
  PropertyAdminFilters,
} from "../types/admin";

export function useAdminProperties(filters: PropertyAdminFilters) {
  return useQuery({
    queryKey: ["admin", "properties", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.page = filters.page ?? 1;
      params.limit = filters.limit ?? 20;

      const { data } = await apiClient.get<ApiResponse<PropertyAdminListResponse>>(
        "/v1/properties/admin",
        { params },
      );
      return data.data ?? { items: [], total: 0, page: 1, limit: 20 };
    },
  });
}

export function useAdminPropertyMutations() {
  const queryClient = useQueryClient();

  const approveProperty = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/v1/properties/${id}/admin`, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });

  const rejectProperty = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/v1/properties/${id}/admin`, { status: "draft" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/properties/${id}/admin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });

  return { approveProperty, rejectProperty, deleteProperty };
}
