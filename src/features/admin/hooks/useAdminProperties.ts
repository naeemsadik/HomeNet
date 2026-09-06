import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteProperty,
  adminUpdateProperty,
  getAdminProperties,
} from "@/services/propertyApi";
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

      const response = await getAdminProperties(params);
      return (response.data ?? { items: [], total: 0, page: 1, limit: 20 }) as PropertyAdminListResponse;
    },
  });
}

export function useAdminPropertyMutations() {
  const queryClient = useQueryClient();

  const approveProperty = useMutation({
    mutationFn: async (id: string) => {
      await adminUpdateProperty(id, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });

  const rejectProperty = useMutation({
    mutationFn: async (id: string) => {
      await adminUpdateProperty(id, { status: "draft" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      await adminDeleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });

  return { approveProperty, rejectProperty, deleteProperty };
}
