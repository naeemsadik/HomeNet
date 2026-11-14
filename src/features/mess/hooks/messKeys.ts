import type { MessFilters } from "../types/mess";

/**
 * TanStack Query keys for the mess module. In a file of their own so code
 * outside the module (listing moderation) can update a mess page's cache
 * without loading the mess API.
 */
export const messKeys = {
  all: ["mess"] as const,
  feed: (filters: MessFilters) => ["mess", "feed", filters] as const,
  detail: (id: string) => ["mess", "detail", id] as const,
  my: (userId: string | undefined) => ["mess", "my", userId] as const,
};
