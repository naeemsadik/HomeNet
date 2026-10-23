import { useQuery } from "@tanstack/react-query";
import { fetchAreas } from "@/services/areaApi";

/**
 * Every area, with its sub-areas and (where known) centre coordinates. The list
 * is small and changes rarely, so it is fetched once and kept for ten minutes.
 */
export function useAreas() {
  const query = useQuery({
    queryKey: ["areas", "all"],
    queryFn: async () => {
      const data = (await fetchAreas({ limit: 100 })).data;
      return { items: data?.items ?? [], total: data?.total ?? 0 };
    },
    staleTime: 10 * 60 * 1000,
  });
  const items = query.data?.items ?? [];
  return {
    areas: items,
    ready: query.isSuccess || query.isError,
    /**
     * Whether every area arrived. The API caches the list under one key whatever
     * the page or limit asked for, so a request for a short page can leave a short
     * list for everyone until the cache expires. A partial list must not be used:
     * it would offer two areas and treat all the others as unknown.
     */
    complete: query.isSuccess && items.length > 0 && items.length >= (query.data?.total ?? 0),
  };
}
