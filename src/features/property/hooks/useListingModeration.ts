import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  staffArchiveProperty,
  staffRestoreProperty,
  adminDeleteProperty,
} from "@/services/propertyApi";
import { toApiError } from "@/services/apiClient";
import { showToast } from "@/lib/toast";
import { useTranslation } from "@/i18n";
import type { Property } from "../types/property";

/**
 * Two cache shapes live under the `["properties"]` prefix:
 *
 * - `usePropertyFeed` is an infinite query: `{ pages: [{ data: { items } }] }`
 * - `useBrowseFeed`'s multi-area branch is a plain query: `{ items, total }`
 * - `SavedScreen` caches the envelope as it arrives: `{ data: Property[] }`
 *
 * A listing archived on `/buy/<area>` goes through the second, and one
 * archived from Saved through the third, so all three have to be reconciled
 * or the row stays on screen until a reload.
 */
type PagedFeed = { pages?: { data?: { items?: Property[]; total?: number } }[] };
type FlatFeed = { items?: Property[]; total?: number };
/** The raw `ApiResponse<Property[]>` envelope, cached as the saved list gets it. */
type EnvelopeFeed = { data?: Property[] };
type CachedFeed = PagedFeed & FlatFeed & EnvelopeFeed;

/** Every cached property list, whatever its filters. */
const FEED_FILTER = { queryKey: ["properties"] } as const;

const without = (items: Property[] | undefined, id: string) =>
  items?.filter((item) => item.id !== id);

/**
 * Inline moderation for one listing, with the list left intact underneath.
 *
 * Removal is optimistic and reversible; deletion is neither. The cache is
 * mutated in place rather than invalidated, because an invalidation refetches
 * page 1 and loses the admin's scroll position and page cursor.
 */
export function useListingModeration() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  /** Drops one listing from every cached list, returning a restore function. */
  const removeFromCache = useCallback(
    (id: string) => {
      const snapshots = queryClient.getQueriesData<CachedFeed>(FEED_FILTER);

      queryClient.setQueriesData<CachedFeed>(FEED_FILTER, (feed) => {
        if (!feed) return feed;

        if (feed.pages) {
          if (!feed.pages.some((page) => page.data?.items?.some((i) => i.id === id))) {
            return feed;
          }
          return {
            ...feed,
            pages: feed.pages.map((page) => {
              const items = page.data?.items;
              if (!items?.some((item) => item.id === id)) return page;
              return {
                ...page,
                data: {
                  ...page.data,
                  items: without(items, id),
                  total: Math.max(0, (page.data?.total ?? 1) - 1),
                },
              };
            }),
          };
        }

        // Checked before `items`, and by shape rather than by key, because a
        // paged feed also carries `data` — one level further down.
        if (Array.isArray(feed.data)) {
          if (!feed.data.some((item) => item.id === id)) return feed;
          return { ...feed, data: without(feed.data, id) };
        }

        if (feed.items?.some((item) => item.id === id)) {
          return {
            ...feed,
            items: without(feed.items, id),
            total: Math.max(0, (feed.total ?? 1) - 1),
          };
        }

        return feed;
      });

      // Restoring the snapshot puts the row back at its original index, which
      // a refetch would not: the server may re-sort or re-page around it.
      return () => {
        for (const [key, value] of snapshots) queryClient.setQueryData(key, value);
      };
    },
    [queryClient],
  );

  const archive = useCallback(
    async (property: Property) => {
      const restore = removeFromCache(property.id);
      let undone = false;

      // Sent first, and kept: Undo must not reach the server before it. Pressed
      // straight away, an unarchive sent at once could land first and the archive
      // after it, leaving the listing archived although the moderator undid it.
      const archived = staffArchiveProperty(property.id).then(
        () => true,
        (error) => {
          if (!undone) {
            restore();
            showToast(toApiError(error).message);
          }
          return false;
        },
      );

      showToast(t("moderation.archived", { title: property.title }), {
        // The spec sets 7s; the store would otherwise default to 6s for a toast
        // that carries an action. Both sit inside the 5-10s convention, but the
        // number was agreed, so it is stated rather than inherited.
        durationMs: 7000,
        action: {
          label: t("moderation.undo"),
          onPress: () => {
            undone = true;
            // Back on screen at once; the server is told once the archive has settled.
            restore();
            void archived.then(async (ok) => {
              // The archive failed, so there is nothing to undo on the server.
              if (!ok) return;
              try {
                await staffRestoreProperty(property.id);
              } catch (error) {
                // The row is already back on screen; say the server disagreed.
                removeFromCache(property.id);
                showToast(toApiError(error).message);
              }
            });
          },
        },
      });

      await archived;
    },
    [removeFromCache, t],
  );

  /**
   * Irreversible: nothing leaves the list until the server has agreed.
   *
   * Currently unreachable from the interface — `AdminListingActions` does not
   * render the delete control while `DELETE_ENABLED` is false there, because
   * the endpoint below behaved as though it removed more than the listing it
   * was given. Kept intact so re-enabling is a one-line change once the
   * backend handler has been checked.
   */
  const destroy = useCallback(
    async (property: Property) => {
      try {
        await adminDeleteProperty(property.id);
        removeFromCache(property.id);
        showToast(t("moderation.deleted", { title: property.title }));
      } catch (error) {
        showToast(toApiError(error).message);
      }
    },
    [removeFromCache, t],
  );

  return { archive, destroy };
}
