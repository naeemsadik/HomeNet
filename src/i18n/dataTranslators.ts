import type { SupportedLanguage } from "./types";

const BENGALI_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

/**
 * Converts Western digits (0-9) to Bengali digits (০-৯) if lang === 'bn'.
 */
export function formatLocalizedNumber(num: number | string | null | undefined, lang: SupportedLanguage): string {
  if (num === null || num === undefined) return "";
  const str = String(num);
  if (lang !== "bn") return str;
  return str.replace(/[0-9]/g, (d) => BENGALI_DIGITS[d] || d);
}

/**
 * Formats property price into crore/lakh notation in English or Bengali.
 */
export function formatLocalizedPrice(
  amount: number,
  currency: string = "BDT",
  lang: SupportedLanguage = "en"
): string {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  const unit = currency === "BDT" ? "৳" : currency;

  if (lang === "bn") {
    if (amount >= 10_000_000) {
      const formattedNum = (amount / 10_000_000).toFixed(2).replace(/\.00$/, "");
      return `${unit} ${formatLocalizedNumber(formattedNum, "bn")} কোটি`;
    }
    if (amount >= 100_000) {
      const formattedNum = (amount / 100_000).toFixed(2).replace(/\.00$/, "");
      return `${unit} ${formatLocalizedNumber(formattedNum, "bn")} লাখ`;
    }
    const standard = amount.toLocaleString("en-BD");
    return `${unit} ${formatLocalizedNumber(standard, "bn")}`;
  }

  // English fallback / default
  if (amount >= 10_000_000) {
    return `${unit} ${(amount / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (amount >= 100_000) {
    return `${unit} ${(amount / 100_000).toFixed(2).replace(/\.00$/, "")} Lac`;
  }
  return `${unit} ${amount.toLocaleString("en-BD")}`;
}

const PROPERTY_TYPE_MAP_BN: Record<string, string> = {
  apartment: "অ্যাপার্টমেন্ট",
  flat: "ফ্ল্যাট",
  duplex: "ডুপ্লেক্স",
  house: "বাড়ি",
  building: "বিল্ডিং",
  commercial: "বাণিজ্যিক",
  office: "অফিস",
  land: "জমি",
  plot: "প্লট",
  shop: "দোকান",
  penthouse: "পেন্টহাউস",
  studio: "স্টুডিও",
  villa: "ভিলা",
  warehouse: "গুদাম",
  garage: "গ্যারেজ",
  residential: "আবাসিক",
  space: "স্পেস",
};

/**
 * Safely translates backend property types without modifying underlying raw values.
 */
export function translatePropertyType(type: string, lang: SupportedLanguage): string {
  if (!type || typeof type !== "string") return "";
  if (lang !== "bn") return type;

  const normalized = type.trim().toLowerCase().replace(/[-_]/g, " ");
  return PROPERTY_TYPE_MAP_BN[normalized] || PROPERTY_TYPE_MAP_BN[type.trim().toLowerCase()] || type;
}

const LISTING_STATUS_MAP_BN: Record<string, string> = {
  active: "সক্রিয়",
  available: "পাওয়া যাচ্ছে",
  pending: "অপেক্ষমান",
  sold: "বিক্রি হয়েছে",
  rented: "ভাড়া হয়েছে",
  draft: "খসড়া",
  rejected: "প্রত্যাখ্যাত",
  verified: "যাচাইকৃত",
  inactive: "নিষ্ক্রিয়",
  under_review: "পর্যালোচনাধীন",
};

/**
 * Safely translates backend listing status without modifying underlying raw values.
 */
export function translateListingStatus(status: string, lang: SupportedLanguage): string {
  if (!status || typeof status !== "string") return "";
  if (lang !== "bn") return status;

  const normalized = status.trim().toLowerCase().replace(/[-_]/g, "_");
  return LISTING_STATUS_MAP_BN[normalized] || LISTING_STATUS_MAP_BN[status.trim().toLowerCase()] || status;
}

const AMENITY_MAP_BN: Record<string, string> = {
  lift: "লিফট",
  elevator: "লিফট",
  parking: "পার্কিং",
  generator: "জেনারেটর",
  "backup generator": "জেনারেটর",
  "standby generator": "জেনারেটর",
  gym: "জিম",
  "fitness center": "জিম",
  pool: "সুইমিং পুল",
  "swimming pool": "সুইমিং পুল",
  security: "নিরাপত্তা",
  "24/7 security": "২৪/৭ নিরাপত্তা",
  cctv: "সিসিটিভি",
  garden: "বাগান",
  lawn: "বাগান",
  "smart home": "স্মার্ট হোম",
  gas: "গ্যাস লাইন",
  "gas line": "গ্যাস লাইন",
  "servant quarter": "সার্ভেন্ট কোয়ার্টার",
  "servant room": "সার্ভেন্ট রুম",
  balcony: "ব্যালকনি",
  terrace: "টেরেস",
  rooftop: "ছাদ",
  intercom: "ইন্টারকম",
  mosque: "মসজিদ",
  "prayer room": "নামাজের ঘর",
  "fire exit": "জরুরি বহির্গমন",
  "fire safety": "অগ্নি নিরাপত্তা",
  playground: "খেলার মাঠ",
  furnished: "সুসজ্জিত",
  "semi furnished": "আধা-সুসজ্জিত",
  "central ac": "সেন্ট্রাল এসি",
  ac: "এসি",
  wifi: "ওয়াইফাই",
  internet: "ইন্টারনেট",
  laundry: "লন্ড্রি",
};

/**
 * Safely translates amenity names without modifying underlying raw values.
 */
export function translateAmenity(amenity: string, lang: SupportedLanguage): string {
  if (!amenity || typeof amenity !== "string") return "";
  if (lang !== "bn") return amenity;

  const normalized = amenity.trim().toLowerCase();
  return AMENITY_MAP_BN[normalized] || amenity;
}
