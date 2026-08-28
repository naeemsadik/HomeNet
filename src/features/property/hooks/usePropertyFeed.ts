import { useInfiniteQuery } from "@tanstack/react-query";
import { getProperties } from "@/services/propertyApi";
import { toApiError } from "@/services/apiClient";
import type { PropertyFilters } from "../types/property";

export function usePropertyFeed(filters: PropertyFilters) {
  const query = useInfiniteQuery({
    queryKey: ["properties", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getProperties({ ...filters, page: pageParam, limit: filters.limit ?? 20 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.data) return undefined;
      const loaded = lastPage.data.page * lastPage.data.limit;
      return loaded < lastPage.data.total ? lastPage.data.page + 1 : undefined;
    },
  });

  return {
    properties: query.data?.pages.flatMap((page) => page.data?.items ?? []) ?? [],
    loading: query.isLoading,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    fetchingNextPage: query.isFetchingNextPage,
    error: query.error ? toApiError(query.error).message : null,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    refresh: query.refetch,
  };
}
