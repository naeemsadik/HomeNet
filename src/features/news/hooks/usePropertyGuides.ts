import { useQuery } from "@tanstack/react-query";
import { fetchPropertyGuides } from "../api/newsApi";

/** Editorial content changes rarely; cache hard so the homepage stays fast. */
export function usePropertyGuides(limit = 4) {
  return useQuery({
    queryKey: ["guides", limit],
    queryFn: () => fetchPropertyGuides(limit),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}
