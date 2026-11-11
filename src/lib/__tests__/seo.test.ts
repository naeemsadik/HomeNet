import { ANDROID_PACKAGE, APP_SCHEME, isPrivatePath, isShellPath, SITE_SHARE_IMAGE, SITE_URL } from "../seo";

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
    "/enquiries",
    "/saved",
    "/verification",
    "/messages",
    "/property/create",
    "/property/edit",
    "/users",
    "/users/abc-123",
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
    "/about",
    "/careers",
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

describe("app identifiers", () => {
  // Read rather than imported, so the test needs no JSON module support.
  const app = JSON.parse(require("fs").readFileSync(require("path").resolve(__dirname, "../../../app.json"), "utf8")).expo;

  it("match app.json, which the App Links tags and assetlinks.json depend on", () => {
    expect(ANDROID_PACKAGE).toBe(app.android.package);
    expect(APP_SCHEME).toBe(app.scheme);
  });

  it("assetlinks.json names the same package", () => {
    const links = JSON.parse(
      require("fs").readFileSync(require("path").resolve(__dirname, "../../../public/.well-known/assetlinks.json"), "utf8"),
    );
    expect(links[0].target.package_name).toBe(ANDROID_PACKAGE);
  });
});

describe("isShellPath", () => {
  it("recognises a dynamic route exported with its pattern still in the path", () => {
    expect(isShellPath("/property/[id]")).toBe(true);
    expect(isShellPath("/guides/[slug]")).toBe(true);
  });

  it("leaves pre-rendered pages alone", () => {
    expect(isShellPath("/property/94ea3a90-1c2d-4e5f-8a9b-0c1d2e3f4a5b")).toBe(false);
    expect(isShellPath("/buy/gulshan")).toBe(false);
    expect(isShellPath("/")).toBe(false);
  });
});
