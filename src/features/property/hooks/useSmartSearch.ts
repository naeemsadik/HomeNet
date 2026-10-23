import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { smartSearch } from "@/services/aiApi";
import type { AiParseError } from "../types/aiListing";
import type { SmartSearchResult } from "../types/aiSearch";

export const SMART_SEARCH_PAGE_SIZE = 12;

/**
 * AI search for one submitted query; `null` means nothing has been searched yet.
 * Pages accumulate for "show more". Each fetch costs model calls, so a failed
 * search is never retried or refetched on its own — the seeker presses Find again.
 */
export function useSmartSearch(query: string | null) {
  return useInfiniteQuery<
    SmartSearchResult,
    AiParseError,
    InfiniteData<SmartSearchResult, number>,
    readonly ["smart-search", string | null],
    number
  >({
    queryKey: ["smart-search", query],
    queryFn: ({ pageParam }) =>
      smartSearch({ query: query as string, page: pageParam, limit: SMART_SEARCH_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) => (pagination.page < pagination.total_pages ? pagination.page + 1 : undefined),
    enabled: query !== null,
    retry: false,
    refetchOnWindowFocus: false,
    // The API caches the model's filters for 10 minutes; the listings behind them are read live.
    staleTime: 2 * 60 * 1000,
  });
}
