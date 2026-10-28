import { useQuery } from "@tanstack/react-query";
import { getPropertiesInAreas } from "@/services/propertyApi";
import { toApiError } from "@/services/apiClient";
import type { AreaScope } from "../utils/areaScope";
import type { PropertyFilters } from "../types/property";
import { usePropertyFeed } from "./usePropertyFeed";

/** A neighbourhood and its sub-areas come back in one go: there are few listings per area. */
const AREA_PAGE_SIZE = 100;

/**
 * The browse screen's results. One place can mean one request (a city, or a
 * distance around a centre, both of which the API paginates) or several (an area
 * and its sub-areas, one request per area id, merged). `ready` holds the request
 * back until the area list has arrived, so the page never shows results for the
 * wrong place first.
 */
export function useBrowseFeed(filters: PropertyFilters, scope: AreaScope, ready: boolean) {
  const multiArea = scope.kind === "areas";

  const single = usePropertyFeed(
    {
      ...filters,
      // `city` is not a filter the API accepts, it answers any value with
      // 400 "property city should not exist", so a city searches by name.
      ...(scope.kind === "city" || scope.kind === "text"
        ? {
            search: (() => {
              const place = scope.kind === "city" ? scope.city : scope.text;
              return filters.search ? `${place} ${filters.search}`.trim() : place;
            })(),
          }
        : {}),
      ...(scope.kind === "radius" ? { lat: scope.lat, lng: scope.lng, radius: scope.radius } : {}),
    },
    { enabled: ready && !multiArea },
  );

  const areaIds = scope.kind === "areas" ? scope.ids : [];
  const multi = useQuery({
    queryKey: ["properties", "areas", areaIds, filters],
    enabled: ready && multiArea,
    queryFn: () => getPropertiesInAreas({ ...filters, limit: AREA_PAGE_SIZE }, areaIds),
  });

  if (!multiArea) return single;

  return {
    total: multi.data?.total,
    properties: multi.data?.items ?? [],
    loading: multi.isPending,
    refreshing: multi.isRefetching,
    fetchingNextPage: false,
    isError: multi.isError,
    error: multi.error ? toApiError(multi.error).message : null,
    hasMore: false,
    loadMore: async () => undefined,
    refresh: multi.refetch,
  };
}
