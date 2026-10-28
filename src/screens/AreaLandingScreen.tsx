import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { SEO_AREAS, seoAreaBySlug, type SeoArea } from "@/content/areas";
import { useTranslation, type SupportedLanguage } from "@/i18n";
import { areaCrumbs, breadcrumbSchema, type ListingIntent } from "@/lib/schema";
import { BrowseScreen } from "@/screens/BrowseScreen";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/** For generateStaticParams: one exported page per area. */
export function areaStaticParams(): { area: string }[] {
  return SEO_AREAS.map((area) => ({ area: area.slug }));
}

function placeLabel(area: SeoArea, lang?: SupportedLanguage): string {
  if (lang === "bn") {
    const cityBn = area.city === "Dhaka" ? "ঢাকা" : area.city === "Chattogram" ? "চট্টগ্রাম" : area.city === "Sylhet" ? "সিলেট" : "কক্সবাজার";
    return area.parent ? `${area.nameBn}, ${cityBn}` : area.nameBn;
  }
  return area.parent ? `${area.name}, ${area.city}` : area.name;
}

export function areaPageMeta(area: SeoArea, intent: ListingIntent, lang: SupportedLanguage = "en"): { title: string; description: string } {
  const place = placeLabel(area, lang);
  if (lang === "bn") {
    if (intent === "rent") {
      return {
        title: `${area.nameBn}-এ বাসা ও ফ্ল্যাট ভাড়া (টু-লেট) | HomeNet BD`,
        description: `${place}-এ ফ্যামিলি বাসা, ব্যাচেলর ফ্ল্যাট, টু-লেট ও সাবলেট। কোনো ব্রোকার ছাড়া সরাসরি মালিকের সাথে কথা বলুন HomeNet-এ। ${area.nameBn} বাসা ভাড়া, টু-লেট ও সাবলেট।`,
      };
    }
    return {
      title: `${area.nameBn}-এ ফ্ল্যাট ও প্রোপার্টি বিক্রয় | HomeNet BD`,
      description: `${place}-এ রেডি ফ্ল্যাট ও নির্মাণাধীন ফ্ল্যাট, বাড়ি এবং প্লট বিক্রয়। ০% ব্রোকার কমিশনে সরাসরি মালিকের সাথে চুক্তি করুন HomeNet-এ। ${area.nameBn} ফ্ল্যাট ও জমি বিক্রয়।`,
    };
  }

  if (intent === "rent") {
    return {
      title: `Flat & House Rent in ${place} | ${area.nameBn} বাসা ভাড়া | HomeNet BD`,
      description: `Family flats, bachelor flats, sublets and furnished apartments to rent in ${place}. Contact owners directly on HomeNet, with no broker. ${area.nameBn} বাসা ভাড়া, টু-লেট ও সাবলেট।`,
    };
  }
  return {
    title: `Flats, Houses & Land for Sale in ${place} | ${area.nameBn} ফ্ল্যাট বিক্রয় | HomeNet BD`,
    description: `Ready and under-construction flats, houses, plots and commercial space for sale in ${place}. Deal directly with owners on HomeNet, with no broker fee. ${area.nameBn} ফ্ল্যাট ও জমি বিক্রয়।`,
  };
}

/**
 * /buy/<area> and /rent/<area>: the browse screen, filtered to one area, under
 * that area's own title, canonical URL and breadcrumb.
 */
export function AreaLandingScreen({ intent, slug }: { intent: ListingIntent; slug: string | undefined }) {
  const { language } = useTranslation();
  const area = seoAreaBySlug(slug);
  if (!area) return <NotFoundScreen />;
  const meta = areaPageMeta(area, intent, language);

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />
      <JsonLd nodes={[breadcrumbSchema(areaCrumbs(area, intent))]} />
      <BrowseScreen mode={intent} location={area.filter ?? area.name} />
    </>
  );
}
