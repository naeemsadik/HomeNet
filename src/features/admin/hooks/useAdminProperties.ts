import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteProperty,
  adminUpdateProperty,
  getAdminProperties,
} from "@/services/propertyApi";
import type {
  PropertyAdminListResponse,
  PropertyAdminFilters,
} from "../types/admin";

export const ADMIN_PROPERTIES_PAGE_SIZE = 20;

/** Pages accumulate in the cache, so invalidating after a mutation keeps every loaded page. */
export function useAdminProperties(filters: Omit<PropertyAdminFilters, "page">) {
  return useInfiniteQuery({
    queryKey: ["admin", "properties", filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const limit = filters.limit ?? ADMIN_PROPERTIES_PAGE_SIZE;
      const params: Record<string, string | number> = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.page = pageParam;
      params.limit = limit;

      const response = await getAdminProperties(params);
      return (response.data ?? { items: [], total: 0, page: pageParam, limit }) as PropertyAdminListResponse;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
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
