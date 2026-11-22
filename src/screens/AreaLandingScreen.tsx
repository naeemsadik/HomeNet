import { useState } from "react";
import { FaqSection } from "@/components/FaqSection";
import { NearbyAreasSection } from "@/components/NearbyAreasSection";
import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { SEO_AREAS, seoAreaBySlug } from "@/content/areas";
import { areaFaq } from "@/content/areaFaq";
import { useTranslation } from "@/i18n";
import { areaPageMeta } from "@/lib/areaPageMeta";
import { browseSnapshot, type BrowseSnapshot } from "@/lib/browseSnapshot";
import { oncePerBuild, setBuildSnapshot } from "@/lib/buildTimeApi";
import {
  areaCrumbs,
  breadcrumbSchema,
  faqPageSchema,
  itemListSchema,
  webPageSchema,
  type ListingIntent,
} from "@/lib/schema";
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
  const { t, language } = useTranslation();
  const area = seoAreaBySlug(slug);
  const [liveTotal, setLiveTotal] = useState<number | undefined>(initialResults?.total);

  if (!area) return <NotFoundScreen />;
  const meta = areaPageMeta(area, intent, language);
  const pageUrl = `${SITE_URL}/${intent}/${area.slug}`;
  const listed = initialResults?.items ?? [];
  const latestDate = listed.reduce<string | undefined>((latest, item) => {
    const itemDate = item.updated_at || item.published_at || item.created_at;
    if (!itemDate) return latest;
    if (!latest) return itemDate;
    return new Date(itemDate) > new Date(latest) ? itemDate : latest;
  }, undefined);
  // Hidden only when known to be empty: the live feed or the build saw zero listings. A page
  // the build could not fetch stays indexable; Google may not run the script that would clear
  // a noindex written into the exported HTML.
  const isZero = liveTotal !== undefined ? liveTotal === 0 : initialResults?.total === 0;

  // Curated areas only, and never on a page that is going out noindex: a thin
  // page is the last place FAQ markup belongs, and Google treats the same FAQ
  // repeated across many pages as spam. Areas without curated content get no
  // FAQ block and no FAQPage node.
  const faq = isZero ? [] : areaFaq(area.slug, intent);

  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        robots={isZero ? "noindex, follow" : undefined}
      />
      <JsonLd
        nodes={[
          webPageSchema({
            url: pageUrl,
            name: meta.title,
            description: meta.description,
            dateModified: latestDate,
          }),
          breadcrumbSchema(areaCrumbs(area, intent)),
          ...(listed.length ? [itemListSchema(listed, pageUrl)] : []),
          // Returns undefined for an empty list, which <JsonLd> drops.
          faqPageSchema(faq, pageUrl),
        ]}
      />
      <BrowseScreen
        mode={intent}
        location={area.filter ?? area.name}
        initialResults={initialResults}
        onTotalChange={setLiveTotal}
        footer={
          <>
            <FaqSection entries={faq} title={t("faq.areaHeading", { area: area.name })} />
            {/* Hub-and-spoke internal links. Rendered even on an area with no
                listings: the page is noindex,follow, so the links still get
                crawled, and a visitor who lands on an empty area has
                somewhere to go instead of a dead end. */}
            <NearbyAreasSection currentSlug={area.slug} mode={intent} />
          </>
        }
      />
    </>
  );
}
