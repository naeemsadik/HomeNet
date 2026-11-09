import type { University } from "../types/mess";

/** Great-circle distance in metres. */
export function straightMetres(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6_371_000 * Math.asin(Math.sqrt(h)));
}

/**
 * The routing fallback from PRD 2.4.1: 1.35 × the straight line, at 80 m a
 * minute. The server stores the real walking route once a listing is saved.
 */
export function estimatedWalk(straight: number): { walking_m: number; walking_min: number } {
  const walking_m = Math.round(straight * 1.35);
  return { walking_m, walking_min: Math.max(1, Math.ceil(walking_m / 80)) };
}

/** The nearest campus within `maxMetres` of a point, with its estimated walk. */
export function nearestCampus(
  point: { lat: number; lng: number },
  universities: readonly University[],
  maxMetres = 6000,
): { shortName: string; campusName: string; walking_min: number } | null {
  let best: { shortName: string; campusName: string; straight: number } | null = null;
  for (const university of universities) {
    for (const campus of university.campuses) {
      const straight = straightMetres(point.lat, point.lng, campus.lat, campus.lng);
      if (straight <= maxMetres && (!best || straight < best.straight)) {
        best = { shortName: university.short_name, campusName: campus.name, straight };
      }
    }
  }
  return best ? { shortName: best.shortName, campusName: best.campusName, walking_min: estimatedWalk(best.straight).walking_min } : null;
}
