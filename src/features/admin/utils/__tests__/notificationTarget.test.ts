import type { Notification } from "@/types/api";
import { adminNotificationTarget } from "../notificationTarget";

const notification = (fields: Partial<Notification>): Notification =>
  ({ id: "n1", type: "system.notice", link: null, metadata: null, ...fields }) as unknown as Notification;

describe("adminNotificationTarget", () => {
  it("opens the moderation list on Pending, at the listing, when a listing is waiting for review", () => {
    expect(
      adminNotificationTarget(notification({ type: "listing.submitted", metadata: { propertyId: "p1" } })),
    ).toEqual({ pathname: "/admin/properties", params: { from: "notifications", status: "pending", highlight: "p1" } });
    expect(adminNotificationTarget(notification({ type: "listing.revision_submitted", metadata: { propertyId: "p1" } }))).toMatchObject({
      params: { status: "pending" },
    });
  });

  it("does not force the Pending filter for another listing notification, which may have moved on", () => {
    const target = adminNotificationTarget(notification({ type: "listing.price_changed", metadata: { property_id: "p2" } }));

    expect(target).toEqual({ pathname: "/admin/properties", params: { from: "notifications", highlight: "p2" } });
  });

  it("finds the listing in the link when the metadata has none", () => {
    expect(adminNotificationTarget(notification({ type: "x", link: "/property/abc-123" }))).toMatchObject({
      params: { highlight: "abc-123" },
    });
    expect(adminNotificationTarget(notification({ type: "x", link: "/admin/properties" }))).toEqual({
      href: "/admin/properties",
    });
  });

  it("follows the notification's own link when it is not about a listing, and does nothing without one", () => {
    expect(adminNotificationTarget(notification({ type: "user.joined", link: "/admin/users" }))).toEqual({ href: "/admin/users" });
    expect(adminNotificationTarget(notification({ type: "user.joined" }))).toBeNull();
  });
});
