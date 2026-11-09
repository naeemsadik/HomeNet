/** The public address of the website. The apex domain redirects here. */
export const SITE_URL = "https://www.homenetbd.com";
/** The name people and search engines should use: other companies are also called "HomeNet". */
export const SITE_NAME = "HomeNet BD";
/** Shown when a link is shared (WhatsApp, Facebook, X). Lives in `public/`. */
export const SITE_SHARE_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Pages that only mean something to a signed-in person. They show a sign-in
 * prompt or an empty shell to anyone else, so they stay out of search results.
 *
 * `/delete-account` is deliberately not here: Google Play requires that page to
 * be public.
 */
const PRIVATE_PREFIXES = [
  "/admin",
  "/seller",
  "/dashboard",
  "/my-properties",
  "/profile",
  "/settings",
  "/notifications",
  "/enquiries",
  "/saved",
  "/verification",
  "/messages",
  "/property/create",
  "/property/edit",
  // Staff-only user lists and profiles: a crawler only ever sees the sign-in gate.
  "/users",
];

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Must match `expo.android.package` in app.json (a test checks). */
export const ANDROID_PACKAGE = "com.homenet.app";
/** Must match `expo.scheme` in app.json. Deep links read homenet://property/<id>. */
export const APP_SCHEME = "homenet";

/*
 * No hreflang alternates: Bangla is the same page translated in place, not a
 * page of its own, and an alternate that points back at the same URL tells
 * search engines nothing. Add them when Bangla gets its own URLs.
 */

/**
 * A dynamic route's shell: exported once with the pattern still in its path
 * ("/property/[id]"), and served by the vercel.json rewrite for any id that was
 * not pre-rendered, whether a listing created after the build or one that does
 * not exist. It has no content of its own, so it stays out of the index; the
 * next build exports a new listing as its own page.
 */
export function isShellPath(pathname: string): boolean {
  return pathname.includes("[");
}
