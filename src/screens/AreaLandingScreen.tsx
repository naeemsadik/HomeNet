import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { SEO_AREAS, seoAreaBySlug } from "@/content/areas";
import { useTranslation } from "@/i18n";
import { areaPageMeta } from "@/lib/areaPageMeta";
import { browseSnapshot, type BrowseSnapshot } from "@/lib/browseSnapshot";
import { oncePerBuild, setBuildSnapshot } from "@/lib/buildTimeApi";
import { areaCrumbs, breadcrumbSchema, itemListSchema, type ListingIntent } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { BrowseScreen } from "@/screens/BrowseScreen";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/** For generateStaticParams: one exported page per area, with the area's listings as the build sees them. */
export function areaStaticParams(intent: ListingIntent): Promise<{ area: string }[]> {
  return oncePerBuild(`${intent} areas`, async () => {
    await Promise.all(
      SEO_AREAS.map(async (area) =>
        setBuildSnapshot(`/${intent}/${area.slug}`, await browseSnapshot(intent, area.filter ?? area.name)),
      ),
    );
    return SEO_AREAS.map((area) => ({ area: area.slug }));
  });
}

/**
 * /buy/<area> and /rent/<area>: the browse screen, filtered to one area, under
 * that area's own title, canonical URL and breadcrumb.
 *
 * `initialResults` is the build's copy of the area's listings (see
 * browseSnapshot). An area that had none is a thin page, so it stays out of
 * the index, and out of the sitemap, until it has some.
 */
export function AreaLandingScreen({
  intent,
  slug,
  initialResults,
}: {
  intent: ListingIntent;
  slug: string | undefined;
  initialResults?: BrowseSnapshot;
}) {
  const { language } = useTranslation();
  const area = seoAreaBySlug(slug);
  if (!area) return <NotFoundScreen />;
  const meta = areaPageMeta(area, intent, language);
  const pageUrl = `${SITE_URL}/${intent}/${area.slug}`;
  const listed = initialResults?.items ?? [];

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} noindex={initialResults?.total === 0 ? true : undefined} />
      <JsonLd
        nodes={[breadcrumbSchema(areaCrumbs(area, intent)), ...(listed.length ? [itemListSchema(listed, pageUrl)] : [])]}
      />
      <BrowseScreen mode={intent} location={area.filter ?? area.name} initialResults={initialResults} />
    </>
  );
}
