import { withScope } from "@/features/property/hooks/useBrowseFeed";
import type { PaginatedResponse, Property, PropertyFilters } from "@/features/property/types/property";
import { isCityName, resolveScope } from "@/features/property/utils/areaScope";
import { filtersFromParams, toApiFilters } from "@/features/property/utils/searchFilters";
import { buildTimeGet } from "@/lib/buildTimeApi";
import type { ApiResponse, Area } from "@/types/api";

/**
 * The first page of a browse page's results as the build saw them, for the
 * loaders of /buy, /rent, /buy/<area> and /rent/<area>. The page renders it
 * until the live feed answers, so the exported HTML lists real listings, with
 * the real count, instead of a skeleton and "0 properties found".
 *
 * It asks the API the way BrowseScreen does (filtersFromParams, resolveScope,
 * withScope), so the HTML shows what a visitor then sees. Null when the API
 * fails: the page exports as before.
 */
export type BrowseSnapshot = { items: Property[]; total: number };

/** As in useBrowseFeed: a neighbourhood and its sub-areas come back in one go. */
const AREA_PAGE_SIZE = 100;

function queryString(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

async function listings(filters: PropertyFilters): Promise<BrowseSnapshot> {
  const body = await buildTimeGet<ApiResponse<PaginatedResponse<Property>>>(`/v1/properties?${queryString(filters)}`);
  return { items: body.data?.items ?? [], total: body.data?.total ?? 0 };
}

/** The whole area list, fetched once per build. BrowseScreen ignores a partial list, and so does this. */
let areaList: Promise<Area[]> | undefined;
function allAreas(): Promise<Area[]> {
  areaList ??= buildTimeGet<ApiResponse<PaginatedResponse<Area>>>("/v1/areas?limit=100").then((body) => {
    const items = body.data?.items ?? [];
    return items.length > 0 && items.length >= (body.data?.total ?? 0) ? items : [];
  });
  return areaList.catch(() => []);
}

/**
 * What a card needs, no more: the snapshot is published inside the page.
 * Descriptions are long and cards do not show them; owners' phone numbers
 * and sign-in identities stay out of the HTML (the browser fetches them).
 */
function cardFields({ description, user, ...rest }: Property & { phone?: unknown }): Property {
  const { phone, ...card } = rest;
  return { ...card, description: null, user: user ? { ...user, auth_identities: [] } : user };
}

export async function browseSnapshot(mode: "buy" | "rent", location?: string): Promise<BrowseSnapshot | null> {
  try {
    const filters = filtersFromParams({}, { mode, fixedLocation: location });
    const apiFilters = toApiFilters(filters);
    const areas = filters.area && !isCityName(filters.area) ? await allAreas() : [];
    const { scope } = resolveScope({ name: filters.area, radiusKm: 0, areas });

    let result: BrowseSnapshot;
    if (scope.kind === "areas") {
      // getPropertiesInAreas, without apiClient: one request per area, merged newest first.
      const pages = await Promise.all(scope.ids.map((id) => listings({ ...apiFilters, limit: AREA_PAGE_SIZE, area_id: id })));
      const seen = new Set<string>();
      const merged = pages
        .flatMap((page) => page.items)
        .filter((item) => !seen.has(item.id) && seen.add(item.id))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      result = { items: merged, total: merged.length };
    } else {
      result = await listings({ ...withScope(apiFilters, scope), page: 1 });
    }
    return { items: result.items.map(cardFields), total: result.total };
  } catch (error) {
    console.warn(`WARNING: ${mode} page${location ? ` for ${location}` : ""} exported without listings: ${(error as Error).message}`);
    return null;
  }
}
