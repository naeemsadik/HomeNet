/**
 * The neighbourhoods that get their own landing pages: /buy/<slug> and
 * /rent/<slug>. Each page is the ordinary browse screen filtered to the area,
 * with its own title, description, canonical URL and breadcrumb, so a search
 * for "flat rent gulshan" can land on a page that is about Gulshan.
 *
 * `filter` is what the browse screen sends to the API as `city`, the same
 * value the footer's area links (/buy?location=Gulshan) already send.
 *
 * scripts/generate-sitemap.mjs reads the slugs out of this file with a regex,
 * so keep each slug on the same line as its `slug:` key.
 */
export interface SeoArea {
  slug: string;
  /** English name, as people search it. */
  name: string;
  /** Bangla name, as people search it. */
  nameBn: string;
  /** The city the area belongs to, for breadcrumbs and addresses. */
  city: "Dhaka" | "Chattogram" | "Sylhet" | "Cox's Bazar";
  /** Slug of the city-level page this area sits under, if it is not one itself. */
  parent?: string;
  /** Sent to the API as the `city` filter. Defaults to `name`. */
  filter?: string;
}

export const SEO_AREAS: SeoArea[] = [
  // Cities
  { slug: "dhaka", name: "Dhaka", nameBn: "ঢাকা", city: "Dhaka" },
  { slug: "chattogram", name: "Chattogram", nameBn: "চট্টগ্রাম", city: "Chattogram" },
  { slug: "sylhet", name: "Sylhet", nameBn: "সিলেট", city: "Sylhet" },
  { slug: "coxs-bazar", name: "Cox's Bazar", nameBn: "কক্সবাজার", city: "Cox's Bazar" },

  // Dhaka: prime and diplomatic
  { slug: "gulshan", name: "Gulshan", nameBn: "গুলশান", city: "Dhaka", parent: "dhaka" },
  { slug: "gulshan-1", name: "Gulshan 1", nameBn: "গুলশান ১", city: "Dhaka", parent: "dhaka" },
  { slug: "gulshan-2", name: "Gulshan 2", nameBn: "গুলশান ২", city: "Dhaka", parent: "dhaka" },
  { slug: "banani", name: "Banani", nameBn: "বনানী", city: "Dhaka", parent: "dhaka" },
  { slug: "baridhara", name: "Baridhara", nameBn: "বারিধারা", city: "Dhaka", parent: "dhaka" },
  { slug: "baridhara-dohs", name: "Baridhara DOHS", nameBn: "বারিধারা ডিওএইচএস", city: "Dhaka", parent: "dhaka" },
  { slug: "niketan", name: "Niketan", nameBn: "নিকেতন", city: "Dhaka", parent: "dhaka" },
  { slug: "mohakhali-dohs", name: "Mohakhali DOHS", nameBn: "মহাখালী ডিওএইচএস", city: "Dhaka", parent: "dhaka" },

  // Dhaka: central
  { slug: "dhanmondi", name: "Dhanmondi", nameBn: "ধানমন্ডি", city: "Dhaka", parent: "dhaka" },
  { slug: "lalmatia", name: "Lalmatia", nameBn: "লালমাটিয়া", city: "Dhaka", parent: "dhaka" },
  { slug: "kalabagan", name: "Kalabagan", nameBn: "কলাবাগান", city: "Dhaka", parent: "dhaka" },
  { slug: "green-road", name: "Green Road", nameBn: "গ্রিন রোড", city: "Dhaka", parent: "dhaka" },
  { slug: "shantinagar", name: "Shantinagar", nameBn: "শান্তিনগর", city: "Dhaka", parent: "dhaka" },
  { slug: "malibagh", name: "Malibagh", nameBn: "মালিবাগ", city: "Dhaka", parent: "dhaka" },
  { slug: "kakrail", name: "Kakrail", nameBn: "কাকরাইল", city: "Dhaka", parent: "dhaka" },
  { slug: "bailey-road", name: "Bailey Road", nameBn: "বেইলি রোড", city: "Dhaka", parent: "dhaka" },
  { slug: "motijheel", name: "Motijheel", nameBn: "মতিঝিল", city: "Dhaka", parent: "dhaka" },
  { slug: "dilkusha", name: "Dilkusha", nameBn: "দিলকুশা", city: "Dhaka", parent: "dhaka" },

  // Dhaka: planned
  { slug: "uttara", name: "Uttara", nameBn: "উত্তরা", city: "Dhaka", parent: "dhaka" },
  { slug: "bashundhara-ra", name: "Bashundhara R/A", nameBn: "বসুন্ধরা আবাসিক এলাকা", city: "Dhaka", parent: "dhaka" },
  { slug: "mirpur-dohs", name: "Mirpur DOHS", nameBn: "মিরপুর ডিওএইচএস", city: "Dhaka", parent: "dhaka" },
  { slug: "banasree", name: "Banasree", nameBn: "বনশ্রী", city: "Dhaka", parent: "dhaka" },

  // Dhaka: fast-growing
  { slug: "mirpur", name: "Mirpur", nameBn: "মিরপুর", city: "Dhaka", parent: "dhaka" },
  { slug: "pallabi", name: "Pallabi", nameBn: "পল্লবী", city: "Dhaka", parent: "dhaka" },
  { slug: "kazipara", name: "Kazipara", nameBn: "কাজীপাড়া", city: "Dhaka", parent: "dhaka" },
  { slug: "shewrapara", name: "Shewrapara", nameBn: "শেওড়াপাড়া", city: "Dhaka", parent: "dhaka" },
  { slug: "mohammadpur", name: "Mohammadpur", nameBn: "মোহাম্মদপুর", city: "Dhaka", parent: "dhaka" },
  { slug: "badda", name: "Badda", nameBn: "বাড্ডা", city: "Dhaka", parent: "dhaka" },
  { slug: "aftabnagar", name: "Aftabnagar", nameBn: "আফতাবনগর", city: "Dhaka", parent: "dhaka" },
  { slug: "rampura", name: "Rampura", nameBn: "রামপুরা", city: "Dhaka", parent: "dhaka" },
  { slug: "khilgaon", name: "Khilgaon", nameBn: "খিলগাঁও", city: "Dhaka", parent: "dhaka" },
  { slug: "basabo", name: "Basabo", nameBn: "বাসাবো", city: "Dhaka", parent: "dhaka" },
  { slug: "mogbazar", name: "Mogbazar", nameBn: "মগবাজার", city: "Dhaka", parent: "dhaka" },

  // Chattogram
  { slug: "gec-chattogram", name: "GEC", nameBn: "জিইসি", city: "Chattogram", parent: "chattogram" },
  { slug: "agrabad", name: "Agrabad", nameBn: "আগ্রাবাদ", city: "Chattogram", parent: "chattogram" },
  { slug: "khulshi", name: "Khulshi", nameBn: "খুলশী", city: "Chattogram", parent: "chattogram" },
  { slug: "nasirabad", name: "Nasirabad", nameBn: "নাসিরাবাদ", city: "Chattogram", parent: "chattogram" },
];

const BY_SLUG = new Map(SEO_AREAS.map((area) => [area.slug, area]));

export function seoAreaBySlug(slug: string | undefined): SeoArea | undefined {
  return slug ? BY_SLUG.get(slug.toLowerCase()) : undefined;
}

/** "Bashundhara R/A" → "bashundhara-ra", "Gulshan-2" → "gulshan-2". */
export function areaSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’/.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The landing page for an area name from the API, if HomeNet has one. */
export function seoAreaForName(name: string | null | undefined): SeoArea | undefined {
  return name ? BY_SLUG.get(areaSlug(name)) : undefined;
}
