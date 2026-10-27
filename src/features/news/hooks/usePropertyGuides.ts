import { useQuery } from "@tanstack/react-query";
import { curatedGuideBySlug, fetchPropertyGuides, fetchPropertyGuideBySlug } from "../api/newsApi";
import type { FetchPropertyGuidesParams } from "../types/news";

/**
 * Editorial content changes rarely; cache hard so the app stays fast.
 * Accepts either a numeric limit (for backwards compatibility with existing components)
 * or a full filter configuration.
 */
export function usePropertyGuides(options?: number | FetchPropertyGuidesParams) {
  const params: FetchPropertyGuidesParams =
    typeof options === "number" ? { limit: options } : options || {};

  return useQuery({
    queryKey: ["guides", params],
    queryFn: () => fetchPropertyGuides(params),
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

