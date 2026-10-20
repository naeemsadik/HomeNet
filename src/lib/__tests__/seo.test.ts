import { isPrivatePath, SITE_SHARE_IMAGE, SITE_URL } from "../seo";

describe("isPrivatePath", () => {
  it.each([
    "/admin",
    "/admin/users",
    "/seller",
    "/seller/settings",
    "/dashboard",
    "/my-properties",
    "/profile",
    "/profile/edit",
    "/settings",
    "/notifications",
    "/saved",
    "/verification",
    "/messages",
    "/property/create",
    "/property/edit",
  ])("keeps %s out of search results", (path) => {
    expect(isPrivatePath(path)).toBe(true);
  });

  it.each([
    "/",
    "/buy",
    "/rent",
    "/sell",
    "/sold",
    "/explore",
    "/guides",
    "/guides/namzari-mutation-bangladesh-guide",
    "/property/abc-123",
    "/users/abc-123",
    "/about",
    "/privacy",
    "/terms",
    "/delete-account", // Google Play requires this one to be public
  ])("leaves %s indexable", (path) => {
    expect(isPrivatePath(path)).toBe(false);
  });

  it("does not match a longer word that merely starts the same way", () => {
    expect(isPrivatePath("/seller-guide")).toBe(false);
    expect(isPrivatePath("/sellers")).toBe(false);
    expect(isPrivatePath("/saved-searches")).toBe(false);
  });
});

describe("site constants", () => {
  it("point at the canonical www host over https", () => {
    expect(SITE_URL).toBe("https://www.homenetbd.com");
    expect(SITE_SHARE_IMAGE).toBe("https://www.homenetbd.com/og-image.png");
  });
});
