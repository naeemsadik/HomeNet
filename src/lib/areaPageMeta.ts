import type { SeoArea } from "@/content/areas";
import type { SupportedLanguage } from "@/i18n";
import type { ListingIntent } from "@/lib/schema";

function placeLabel(area: SeoArea, lang?: SupportedLanguage): string {
  if (lang === "bn") {
    const cityBn = area.city === "Dhaka" ? "ঢাকা" : area.city === "Chattogram" ? "চট্টগ্রাম" : area.city === "Sylhet" ? "সিলেট" : "কক্সবাজার";
    return area.parent ? `${area.nameBn}, ${cityBn}` : area.nameBn;
  }
  return area.parent ? `${area.name}, ${area.city}` : area.name;
}

/**
 * English titles stay under 60 characters and descriptions under 160, the
 * lengths a search result shows; the Bangla search term goes at the end of the
 * description rather than in the title. (A test checks every area.)
 */
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

  // Short area names leave room to say what the page shows; long ones do not.
  const fit = (lead: string, tail: string) => {
    const full = `${lead} See photos, prices and maps. ${tail}`;
    return full.length <= 160 ? full : `${lead} ${tail}`;
  };
  if (intent === "rent") {
    return {
      title: `Flats & Houses for Rent in ${area.name} | HomeNet BD`,
      description: fit(`Family flats, bachelor flats and sublets to rent in ${place}. Contact owners directly on HomeNet BD.`, `${area.nameBn} বাসা ভাড়া ও টু-লেট।`),
    };
  }
  return {
    title: `Flats & Houses for Sale in ${area.name} | HomeNet BD`,
    description: fit(`Flats, houses and plots for sale in ${place}. Deal directly with owners on HomeNet BD.`, `${area.nameBn} ফ্ল্যাট ও জমি বিক্রয়।`),
  };
}
