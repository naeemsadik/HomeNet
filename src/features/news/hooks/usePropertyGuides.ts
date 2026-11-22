import { useQuery } from "@tanstack/react-query";
import {
  curatedGuideBySlug,
  curatedGuideList,
  fetchPropertyGuides,
  fetchPropertyGuideBySlug,
} from "../api/newsApi";
import type { FetchPropertyGuidesParams } from "../types/news";

/**
 * Editorial content changes rarely; cache hard so the app stays fast.
 * Accepts either a numeric limit (for backwards compatibility with existing components)
 * or a full filter configuration.
 *
 * Seeded from the bundled guides for the same reason `usePropertyGuide` is:
 * a query function does not run during the static export, so the exported
 * HTML would otherwise carry the empty state and no link to a single guide.
 * The seed is marked stale, so the API replaces it once that endpoint ships.
 */
export function usePropertyGuides(options?: number | FetchPropertyGuidesParams) {
  const params: FetchPropertyGuidesParams =
    typeof options === "number" ? { limit: options } : options || {};

  return useQuery({
    queryKey: ["guides", params],
    queryFn: () => fetchPropertyGuides(params),
    initialData: () => curatedGuideList(params),
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
}

/**
 * Fetches a single property guide by its slug for detail/reader views.
 *
 * A curated guide renders from its bundled copy straight away, so the exported
 * HTML (and so what a crawler first reads) carries the article itself rather
 * than a spinner. The copy is marked stale, so the API version replaces it.
 */
export function usePropertyGuide(slug: string) {
  const curated = curatedGuideBySlug(slug);
  return useQuery({
    queryKey: ["guide", slug],
    queryFn: () => fetchPropertyGuideBySlug(slug),
    enabled: Boolean(slug),
    initialData: curated ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
}

