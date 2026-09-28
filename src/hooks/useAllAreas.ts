import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAreas } from "@/services/areaApi";
import type { Area } from "@/types/api";

/**
 * Every area, from one request that is always identical.
 *
 * The API caches GET /v1/areas under a single key whatever the query
 * (backend area.service.ts, findAll), so a request's city, search, page or
 * limit can be answered with the result of whichever request came first in
 * the last five minutes. The home page's `limit: 1` count query did exactly
 * that, and the area picker then offered one area out of 33.
 *
 * So the app sends only this request and derives every list from it with
 * filterAreas/pageAreas. There are 33 areas; the API caps a page at 100, so
 * this needs paging once there are more than 100 (and the backend fix).
 */
export const ALL_AREAS_LIMIT = 100;

export interface AllAreas {
  items: Area[];
  total: number;
  /** False when the API answered with another query's cached result. */
  complete: boolean;
}

async function fetchAllAreas(): Promise<AllAreas> {
  const response = await fetchAreas({ limit: ALL_AREAS_LIMIT });
  const items = response.data?.items ?? [];
  const total = response.data?.total ?? items.length;
  return {
    items,
    total,
    // The response echoes the limit of the request it was cached for.
    complete:
      response.data?.limit === ALL_AREAS_LIMIT &&
      items.length === Math.min(total, ALL_AREAS_LIMIT),
  };
}

export const allAreasQuery = queryOptions({
  queryKey: ["areas", "all"],
  queryFn: fetchAllAreas,
  staleTime: 10 * 60_000,
  // A foreign cached answer clears within the API's five-minute cache TTL.
  refetchInterval: (query) => (query.state.data && !query.state.data.complete ? 60_000 : false),
});

export function useAllAreas({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...allAreasQuery, enabled });
}

/** The same matching the API's filters apply: city exact, name case-insensitive. */
export function filterAreas(
  areas: Area[],
  { search, city, topLevelOnly = false }: { search?: string; city?: string | null; topLevelOnly?: boolean },
): Area[] {
  const needle = search?.trim().toLowerCase() ?? "";
  return areas.filter(
    (area) =>
      (!city || area.city === city) &&
      (!topLevelOnly || !area.parent_area_id) &&
      (!needle || area.name.toLowerCase().includes(needle)),
  );
}

export function pageAreas(areas: Area[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(areas.length / pageSize));
  return {
    items: areas.slice((page - 1) * pageSize, page * pageSize),
    total: areas.length,
    total_pages: totalPages,
  };
}
