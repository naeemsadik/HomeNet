import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyProperties } from "@/services/propertyApi";

async function fetchMyProperties(page: number = 1, limit: number = 20) {
  return getMyProperties({ page, limit });
}

export function useMyProperties() {
  return useInfiniteQuery({
    queryKey: ["my-properties"],
    queryFn: ({ pageParam = 1 }) => fetchMyProperties(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data) return undefined;
      const { total, limit } = lastPage.data;
      const loaded = allPages.length * limit;
      return loaded < total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) =>
        page.data?.items.some((property) => property.status === "pending"),
      )
        ? 10_000
        : false,
  });
}
