/**
 * "Added to site": the API has no such filter, so listings are narrowed here by
 * when they were published. The browse screen asks for a full page (100) when this
 * is set, so the count is the count of what matched.
 */
const WINDOWS_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "14d": 14 * 24 * 60 * 60 * 1000,
};

/** The earliest moment (ms since 1970) a listing may have been added, or null for "anytime". */
export function addedSince(option: string, now: number = Date.now()): number | null {
  const window = WINDOWS_MS[option];
  return window === undefined ? null : now - window;
}

/** Keeps listings published (or, before that, created) at or after the cutoff. A listing with no readable date is kept out. */
export function filterAddedSince<T extends { published_at?: string | null; created_at?: string | null }>(
  items: T[],
  option: string,
  now: number = Date.now(),
): T[] {
  const cutoff = addedSince(option, now);
  if (cutoff === null) return items;
  return items.filter((item) => {
    const time = Date.parse(item.published_at || item.created_at || "");
    return Number.isFinite(time) && time >= cutoff;
  });
}
