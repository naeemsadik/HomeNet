import { useQuery } from "@tanstack/react-query";
import { fetchPropertyGuides, fetchPropertyGuideBySlug } from "../api/newsApi";
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
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

/**
 * Fetches a single property guide by its slug for detail/reader views.
 */
export function usePropertyGuide(slug: string) {
  return useQuery({
    queryKey: ["guide", slug],
    queryFn: () => fetchPropertyGuideBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

