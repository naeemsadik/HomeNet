import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx will fail the same way again; retrying a 429 only adds to the limit.
      retry: (failureCount, error) => {
        const status = (error as { status?: number | null }).status;
        if (status != null && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
