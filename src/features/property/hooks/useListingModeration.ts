import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteProperty,
  adminUpdateProperty,
  staffArchiveProperty,
  staffRestoreProperty,
  submitPropertyFeedback,
} from "@/services/propertyApi";
import { toApiError } from "@/services/apiClient";
import { showToast } from "@/lib/toast";
import { translateListingStatus, useTranslation } from "@/i18n";
import type { ApiResponse, PropertyFeedbackDto, PropertyStatus } from "@/types/api";
import type { Property } from "../types/property";
import { messKeys } from "@/features/mess/hooks/messKeys";

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
type CachedDetail = ApiResponse<{ id: string; status: PropertyStatus } & Record<string, unknown>>;
type CachedMessDetail = { id: string; status: PropertyStatus } & Record<string, unknown>;

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
  const { t, language } = useTranslation();

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

  const patchDetailStatus = useCallback(
    (id: string, nextStatus: PropertyStatus) => {
      const prev = queryClient.getQueryData<CachedDetail>(["property", id]);
      queryClient.setQueryData<CachedDetail>(["property", id], (current) => {
        if (!current?.data) return current;
        return {
          ...current,
          data: { ...current.data, status: nextStatus },
        };
      });
      // A mess listing is moderated from its own page (/mess/:id), whose cache holds
      // the listing itself rather than the API envelope.
      const messKey = messKeys.detail(id);
      const prevMess = queryClient.getQueryData<CachedMessDetail>(messKey);
      queryClient.setQueryData<CachedMessDetail>(messKey, (current) => (current ? { ...current, status: nextStatus } : current));
      return () => {
        if (prev !== undefined) {
          queryClient.setQueryData(["property", id], prev);
        }
        if (prevMess !== undefined) queryClient.setQueryData(messKey, prevMess);
      };
    },
    [queryClient],
  );

  const archive = useCallback(
    async (property: Pick<Property, "id" | "title">) => {
      const restoreFeed = removeFromCache(property.id);
      const revertDetail = patchDetailStatus(property.id, "archived");
      let undone = false;

      // Sent first, and kept: Undo must not reach the server before it. Pressed
      // straight away, an unarchive sent at once could land first and the archive
      // after it, leaving the listing archived although the moderator undid it.
      const archived = staffArchiveProperty(property.id).then(
        () => {
          void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
          return true;
        },
        (error) => {
          if (!undone) {
            restoreFeed();
            revertDetail();
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
            restoreFeed();
            revertDetail();
            void archived.then(async (ok) => {
              // The archive failed, so there is nothing to undo on the server.
              if (!ok) return;
              try {
                await staffRestoreProperty(property.id);
                void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
                void queryClient.invalidateQueries({ queryKey: ["property", property.id] });
                void queryClient.invalidateQueries({ queryKey: messKeys.detail(property.id) });
              } catch (error) {
                // The row is already back on screen; say the server disagreed.
                removeFromCache(property.id);
                patchDetailStatus(property.id, "archived");
                showToast(toApiError(error).message);
              }
            });
          },
        },
      });

      await archived;
    },
    [patchDetailStatus, queryClient, removeFromCache, t],
  );

  const restore = useCallback(
    async (property: Pick<Property, "id" | "title">) => {
      const revertDetail = patchDetailStatus(property.id, "active");
      try {
        const res = await staffRestoreProperty(property.id);
        const restoredStatus = (res.data?.status as PropertyStatus | undefined) ?? "active";
        patchDetailStatus(property.id, restoredStatus);
        void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
        void queryClient.invalidateQueries({ queryKey: ["properties"] });
        showToast(t("moderation.restored", { title: property.title }));
        return true;
      } catch (error) {
        revertDetail();
        showToast(toApiError(error).message);
        return false;
      }
    },
    [patchDetailStatus, queryClient, t],
  );

  const updateStatus = useCallback(
    async (
      property: Pick<Property, "id" | "title" | "status">,
      nextStatus: PropertyStatus,
    ) => {
      if (nextStatus === "archived") {
        await archive(property);
        return true;
      }
      if (property.status === "archived" && nextStatus === "active") {
        return restore(property);
      }

      const revertDetail = patchDetailStatus(property.id, nextStatus);
      const shouldHideFromPublic = nextStatus === "draft" || nextStatus === "pending";
      const restoreFeed = shouldHideFromPublic ? removeFromCache(property.id) : null;

      try {
        await adminUpdateProperty(property.id, { status: nextStatus });
        void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
        void queryClient.invalidateQueries({ queryKey: ["property", property.id] });
        void queryClient.invalidateQueries({ queryKey: messKeys.detail(property.id) });
        const statusLabel = translateListingStatus(nextStatus, language);
        showToast(
          t("moderation.statusUpdated", {
            title: property.title,
            status: statusLabel,
          }),
        );
        return true;
      } catch (error) {
        revertDetail();
        restoreFeed?.();
        showToast(toApiError(error).message);
        return false;
      }
    },
    [archive, language, patchDetailStatus, queryClient, removeFromCache, restore, t],
  );

  const sendFeedback = useCallback(
    async (
      property: Pick<Property, "id" | "title" | "status">,
      payload: PropertyFeedbackDto,
    ) => {
      const requestChanges = payload.requestChanges !== false;
      const revertDetail = requestChanges ? patchDetailStatus(property.id, "draft") : null;
      const restoreFeed = requestChanges ? removeFromCache(property.id) : null;

      try {
        await submitPropertyFeedback(property.id, payload);
        void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
        void queryClient.invalidateQueries({ queryKey: ["property", property.id] });
        void queryClient.invalidateQueries({ queryKey: messKeys.detail(property.id) });
        showToast(t("moderation.feedbackSent", { title: property.title }), {
          durationMs: 5000,
        });
        return true;
      } catch (error) {
        revertDetail?.();
        restoreFeed?.();
        const apiError = toApiError(error);
        // The endpoint is not deployed everywhere yet. Say so plainly: nothing was sent.
        const notDeployed = apiError.status === 404 || apiError.status === 405 || apiError.status === 501;
        showToast(notDeployed ? t("moderation.feedbackUnavailable") : apiError.message, { durationMs: 6000 });
        return false;
      }
    },
    [patchDetailStatus, queryClient, removeFromCache, t],
  );

  /**
   * Irreversible: nothing leaves the list until the server has agreed.
   *
   * Not reachable from the interface, on purpose. On staging, one call to this
   * endpoint naming a single listing was followed by every other listing
   * disappearing. Do not add a button for it until the backend handler has
   * been checked for a cascade; then ask for confirmation at the trigger site.
   */
  const destroy = useCallback(
    async (property: Pick<Property, "id" | "title">) => {
      try {
        await adminDeleteProperty(property.id);
        removeFromCache(property.id);
        void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
        void queryClient.invalidateQueries({ queryKey: ["property", property.id] });
        void queryClient.invalidateQueries({ queryKey: messKeys.detail(property.id) });
        showToast(t("moderation.deleted", { title: property.title }));
        return true;
      } catch (error) {
        showToast(toApiError(error).message);
        return false;
      }
    },
    [queryClient, removeFromCache, t],
  );

  return { archive, restore, updateStatus, sendFeedback, destroy };
}
