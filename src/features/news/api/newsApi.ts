import type { PropertyGuideList } from "../types/news";

/**
 * Homepage guides feed.
 *
 * The backend has no guides/news module yet — `apps/api` currently exposes only
 * areas, auth, properties, roles and users. Until a `v1/guides` endpoint exists
 * this resolves empty, and the section hides itself rather than showing
 * invented articles.
 *
 * To connect the real source, replace the body with:
 *
 *   const { data } = await apiClient.get<ApiResponse<PropertyGuideList>>(
 *     "/v1/guides",
 *     { params: { limit } },
 *   );
 *   return data.data ?? { items: [], total: 0 };
 *
 * Nothing above this function needs to change.
 */
export async function fetchPropertyGuides(
  limit = 4,
): Promise<PropertyGuideList> {
  void limit;
  return { items: [], total: 0 };
}
