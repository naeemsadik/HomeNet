import Head from "expo-router/head";
import { usePathname } from "expo-router";

import {
  ANDROID_PACKAGE,
  APP_SCHEME,
  isPrivatePath,
  languageAlternates,
  SITE_NAME,
  SITE_SHARE_IMAGE,
  SITE_URL,
} from "@/lib/seo";

/**
 * Per-route document title, description, canonical URL and share preview.
 *
 * Expo Router renders its own `<title data-rh="true">` through react-helmet, and
 * emits it *empty* when no route claims one. That empty tag lands before the
 * static one in `app/+html.tsx`, and browsers and crawlers honour the first,
 * which is why Lighthouse reported the page as having no title at all despite
 * one being set. Rendering a title through Head fills the router's own tag
 * rather than competing with it.
 *
 * The same goes for the description: it is set here and nowhere else, so a page
 * never carries two. Tags that are not set by a deeper PageMeta fall back to the
 * one in `app/_layout.tsx`, since react-helmet keeps the last tag of each kind.
 *
 * Signed-in pages (see `isPrivatePath`) are marked noindex automatically.
 *
 * Public pages also say which languages they serve (hreflang) and how to open
 * the same screen in the Android app (App Links meta, read by Facebook,
 * WhatsApp and other in-app browsers).
 *
 * Every user-reachable route should render this.
 */
export function PageMeta({
  title,
  description,
  noindex,
}: {
  title: string;
  description?: string;
  /** Force noindex on or off. Defaults to on for signed-in pages only. */
  noindex?: boolean;
}) {
  const pathname = usePathname();
  const hidden = noindex ?? isPrivatePath(pathname);
  // A dynamic route is exported once as a shell whose path still reads
  // "/property/[id]". A canonical built from that would be wrong for every
  // listing, so none is emitted until the browser knows the real path.
  const canonical = pathname.includes("[") ? null : `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {hidden ? <meta name="robots" content="noindex, nofollow" /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {canonical && !hidden
        ? languageAlternates(canonical).map((alt) => (
            <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
          ))
        : null}
      {canonical && !hidden ? <meta property="al:android:url" content={`${APP_SCHEME}:/${pathname}`} /> : null}
      {canonical && !hidden ? <meta property="al:android:package" content={ANDROID_PACKAGE} /> : null}
      {canonical && !hidden ? <meta property="al:android:app_name" content={SITE_NAME} /> : null}
      {canonical && !hidden ? <meta property="al:web:url" content={canonical} /> : null}
      {canonical && !hidden ? <meta name="google-play-app" content={`app-id=${ANDROID_PACKAGE}`} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_BD" />
      <meta property="og:locale:alternate" content="bn_BD" />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:image" content={SITE_SHARE_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={SITE_SHARE_IMAGE} />
    </Head>
  );
}
