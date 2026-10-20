/** The public address of the website. The apex domain redirects here. */
export const SITE_URL = "https://www.homenetbd.com";
export const SITE_NAME = "HomeNet";
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
  "/saved",
  "/verification",
  "/messages",
  "/property/create",
  "/property/edit",
];

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
