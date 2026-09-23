import Head from "expo-router/head";

/**
 * Per-route document title and description.
 *
 * Expo Router renders its own `<title data-rh="true">` through react-helmet, and
 * emits it *empty* when no route claims one. That empty tag lands before the
 * static one in `app/+html.tsx`, and browsers and crawlers honour the first —
 * which is why Lighthouse reported the page as having no title at all despite
 * one being set. Rendering a title through Head fills the router's own tag
 * rather than competing with it.
 *
 * Every user-reachable route should render this.
 */
export function PageMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
    </Head>
  );
}
