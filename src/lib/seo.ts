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

/** Must match `expo.android.package` in app.json (a test checks). */
export const ANDROID_PACKAGE = "com.homenet.app";
/** Must match `expo.scheme` in app.json. Deep links read homenet://property/<id>. */
export const APP_SCHEME = "homenet";

/**
 * The page's URL in each language. Bangla is served at the same address (the
 * language toggle translates in place), so every alternate points at the
 * canonical URL. If Bangla ever gets its own URLs, change bn-BD here.
 */
export function languageAlternates(canonical: string): { hrefLang: string; href: string }[] {
  return [
    { hrefLang: "en-BD", href: canonical },
    { hrefLang: "bn-BD", href: canonical },
    { hrefLang: "x-default", href: canonical },
  ];
}
