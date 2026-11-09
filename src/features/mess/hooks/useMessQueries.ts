import { useInfiniteQuery, useQuery, type QueryClient } from "@tanstack/react-query";
import { toApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { getMessDetail, getMyMessListings, searchMess } from "../api/messApi";
import type { MessFilters } from "../types/mess";

/** The API caps a page at 30. */
export const MESS_PAGE_SIZE = 20;

export const messKeys = {
  all: ["mess"] as const,
  feed: (filters: MessFilters) => ["mess", "feed", filters] as const,
  detail: (id: string) => ["mess", "detail", id] as const,
  my: (userId: string | undefined) => ["mess", "my", userId] as const,
};

/** Search results, paged for infinite scroll. Same return shape as usePropertyFeed. */
export function useMessFeed(filters: MessFilters, { enabled = true }: { enabled?: boolean } = {}) {
  const query = useInfiniteQuery({
    queryKey: messKeys.feed(filters),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => searchMess(filters, pageParam, MESS_PAGE_SIZE),
    getNextPageParam: (lastPage) => (lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined),
  });

  return {
    total: query.data?.pages[0]?.total,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    loading: query.isPending,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    fetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    error: query.error ? toApiError(query.error).message : null,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    refresh: query.refetch,
  };
}

export function useMessDetail(id: string | undefined) {
  return useQuery({
    queryKey: messKeys.detail(id ?? ""),
    queryFn: () => getMessDetail(id!),
    enabled: Boolean(id),
  });
}

/** Warms the detail cache when a card is pressed, so the page opens with its data. */
export function prefetchMessDetail(client: QueryClient, id: string) {
  return client.prefetchQuery({ queryKey: messKeys.detail(id), queryFn: () => getMessDetail(id) });
}

export function useMyMessListings() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: messKeys.my(userId),
    queryFn: getMyMessListings,
    enabled: Boolean(userId),
  });
}
