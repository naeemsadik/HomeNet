import { useQueries } from "@tanstack/react-query";
import { getProperties } from "@/services/propertyApi";
import { allAreasQuery } from "@/hooks/useAllAreas";

const STALE_TIME = 10 * 60_000; // 10 minutes

export interface ResolvedLandingMetrics {
  activeListings: number;
  forSale: number;
  forRent: number;
  areasCovered: number;
  categories: number;
  isLoading: boolean;
  isError: boolean;
}

export function useLandingMetrics(): ResolvedLandingMetrics {
  const results = useQueries({
    queries: [
      {
        queryKey: ["landing", "metrics", "active"],
        queryFn: () => getProperties({ limit: 1, sort_by: "view_count_desc" }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["landing", "metrics", "sale"],
        queryFn: () =>
          getProperties({ listing_type: "sale", limit: 1, sort_by: "view_count_desc" }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["landing", "metrics", "rent"],
        queryFn: () =>
          getProperties({ listing_type: "rent", limit: 1, sort_by: "view_count_desc" }),
        staleTime: STALE_TIME,
      },
      // Not a `limit: 1` request of its own: the API caches every areas
      // query under one key, and that answer was served to the area picker.
      allAreasQuery,
    ],
  });

  const [activeQuery, saleQuery, rentQuery, areasQuery] = results;

  const isLoading = results.some((q) => q.isLoading);
  const isError = results.every((q) => q.isError);

  const activeListings = (activeQuery.data as any)?.data?.total ?? 0;
  const forSale = (saleQuery.data as any)?.data?.total ?? 0;
  const forRent = (rentQuery.data as any)?.data?.total ?? 0;
  const areasCovered = areasQuery.data?.total ?? 0;

  return {
    activeListings,
    forSale,
    forRent,
    areasCovered,
    categories: 4, // Schema constant: residential, commercial, land, parking
    isLoading,
    isError,
  };
}
