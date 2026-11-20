import type { Notification } from "@/types/api";

/** What an admin notification opens: the moderation list at a listing, or the notification's own link. */
export type AdminNotificationTarget =
  | { pathname: "/admin/properties"; params: { from: "notifications"; status?: "pending"; highlight?: string } }
  | { href: string };

/** Notifications that put a listing in the review queue, so the list should open on Pending. */
const QUEUED_FOR_REVIEW = new Set(["listing.submitted", "listing.revision_submitted"]);

const LISTING_ID_IN_LINK = /\/(?:admin\/)?propert(?:y|ies)\/([A-Za-z0-9-]+)/;

function listingIdOf(notification: Notification): string | null {
  const meta = notification.metadata as Record<string, unknown> | null;
  const fromMeta = meta?.property_id ?? meta?.propertyId ?? meta?.id;
  if (typeof fromMeta === "string" && fromMeta) return fromMeta;
  return notification.link?.match(LISTING_ID_IN_LINK)?.[1] ?? null;
}

/**
 * Where pressing an admin notification goes. A listing notification opens the moderation list
 * with that listing first; it filters to Pending only when the notification says a listing is
 * waiting for review, since a listing may have moved on by the time the admin looks.
 */
export function adminNotificationTarget(notification: Notification): AdminNotificationTarget | null {
  const highlight = listingIdOf(notification);
  const isListing = highlight !== null || notification.type?.startsWith("listing.");
  if (isListing) {
    return {
      pathname: "/admin/properties",
      params: {
        from: "notifications",
        ...(QUEUED_FOR_REVIEW.has(notification.type) ? { status: "pending" as const } : {}),
        ...(highlight ? { highlight } : {}),
      },
    };
  }
  return notification.link ? { href: notification.link } : null;
}
