import { formatLocalizedNumber, type SupportedLanguage } from "@/i18n";

/** "05:30" → "0530", the form rule keys carry. */
export function toCompactTime(hhmm: string): string {
  return hhmm.replace(":", "");
}

/** "0530" or "05:30" → "05:30"; null when it is not a valid 24-hour time. */
export function toClockTime(value: string): string | null {
  const match = /^([01]\d|2[0-3]):?([0-5]\d)$/.exec(value.trim());
  return match ? `${match[1]}:${match[2]}` : null;
}

/** Minutes since midnight, for comparing gate and quiet-hour times. */
export function minutesOfDay(hhmm: string): number {
  const clock = toClockTime(hhmm);
  if (!clock) return Number.NaN;
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}

/** Bangla names the part of the day rather than writing am or pm. */
function banglaDayPart(hour: number): string {
  if (hour >= 4 && hour < 6) return "ভোর";
  if (hour >= 6 && hour < 12) return "সকাল";
  if (hour >= 12 && hour < 15) return "দুপুর";
  if (hour >= 15 && hour < 18) return "বিকাল";
  if (hour >= 18 && hour < 20) return "সন্ধ্যা";
  return "রাত";
}

/** "05:00" → "5:00 am" in English, "ভোর ৫:০০" in Bangla. Unreadable input comes back as it was. */
export function formatClock(value: string, lang: SupportedLanguage): string {
  const clock = toClockTime(value);
  if (!clock) return value;
  const [h, m] = clock.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutes = String(m).padStart(2, "0");
  if (lang === "bn") return `${banglaDayPart(h)} ${formatLocalizedNumber(`${hour12}:${minutes}`, "bn")}`;
  return `${hour12}:${minutes} ${h < 12 ? "am" : "pm"}`;
}
