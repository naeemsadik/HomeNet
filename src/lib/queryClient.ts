import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx will fail the same way again; retrying a 429 only adds to the limit.
      retry: (failureCount, error) => {
        const status =
          (error as { status?: number | null })?.status ??
          (error as any)?.statusCode ??
          (error as any)?.response?.status ??
          null;
        if (status != null && status >= 400 && status < 500) return false;
        if (status === 429) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
