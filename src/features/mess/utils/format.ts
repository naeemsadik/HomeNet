/**
 * Number, money, distance and date formatting for the mess module.
 *
 * Money does not go through formatLocalizedPrice: that shows 0 and 1 as
 * "Contact for price" (the property API's placeholder) and switches to lakh
 * notation, neither of which fits a seat's monthly bills.
 */
import { formatLocalizedNumber, type SupportedLanguage, type TranslationKey } from "@/i18n";

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

function grouped(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "৳ 6,050" in English, "৳ ৬,০৫০" in Bangla. */
export function formatTaka(amount: number, lang: SupportedLanguage): string {
  return `৳ ${formatLocalizedNumber(grouped(amount), lang)}`;
}

/** One figure when the ends match, else "৳ 6,050 to ৳ 6,200". */
export function formatTakaRange(min: number, max: number, lang: SupportedLanguage, t: Translate): string {
  if (max <= min) return formatTaka(min, lang);
  return t("mess.cost.range", { min: formatTaka(min, lang), max: formatTaka(max, lang) });
}

/** "950 m" under a kilometre (to the nearest 50), else "1.2 km". */
export function formatDistance(metres: number, lang: SupportedLanguage, t: Translate): string {
  if (metres < 1000) return t("mess.walk.m", { m: formatLocalizedNumber(Math.max(50, Math.round(metres / 50) * 50), lang) });
  return t("mess.walk.km", { km: formatLocalizedNumber((metres / 1000).toFixed(1), lang) });
}

const MONTHS: Record<SupportedLanguage, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
};

/**
 * "1 Dec", with the year when it is not this year. Read from the date's own
 * digits, so an ISO date ("2026-12-01") never shifts a day across time zones.
 */
export function formatDate(iso: string, lang: SupportedLanguage, now: Date = new Date()): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const parts = [formatLocalizedNumber(Number(day), lang), MONTHS[lang][Number(month) - 1]];
  if (Number(year) !== now.getFullYear()) parts.push(formatLocalizedNumber(year, lang));
  return parts.join(" ");
}

/** Whole days between a timestamp and now (0 for today). */
export function daysSince(iso: string, now: number = Date.now()): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now - then) / 86_400_000));
}

/** Today's date as "YYYY-MM-DD" in local time, for date inputs and comparisons. */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
