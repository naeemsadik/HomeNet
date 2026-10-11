import type { GeocodedPlace } from "@/services/geocodeApi";
import type { Area } from "@/types/api";
import { knownAreaCenter, type MapPoint } from "../constants/areaCenters";
import { resolveArea } from "./aiSearchFilters";

/** Administrative words that name a district around an area, not the area ("Gulshan Thana"). */
const NOISE = /\b(thana|upazila|upazilla|ward|union|division|district|metropolitan|city corporation)\b/gi;

/**
 * Which of HomeNet's areas the geocoder's neighbourhood names mean, or null.
 *
 * A numbered sub-area ("Sector 6") counts only when its parent ("Uttara") is
 * also named, because "Sector 6" alone appears in more than one part of Dhaka.
 */
export function areaFromPlace(place: GeocodedPlace, areas: Area[]): Area | null {
  const matches = place.areaNames
    .map((name) => resolveArea(name.replace(NOISE, " ").replace(/\s+/g, " ").trim(), areas))
    .filter((area): area is Area => area !== null);

  for (const area of matches) {
    if (!area.parent_area_id) return area;
    // A sub-area is accepted only alongside its parent.
    if (matches.some((other) => other.id === area.parent_area_id)) return area;
  }
  return null;
}

const EARTH_RADIUS_KM = 6371;

export function distanceKm(a: MapPoint, b: MapPoint): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** A pin closer than this to a listed neighbourhood's centre is taken to be in it. */
export const NEAREST_AREA_LIMIT_KM = 2;

/**
 * The listed neighbourhood nearest to a pin, when one is close enough. A
 * suggestion for when the geocoder's names match nothing: the form says so and
 * lets the owner change it.
 */
export function nearestArea(point: MapPoint, areas: Area[]): Area | null {
  let best: { area: Area; km: number } | null = null;
  for (const area of areas) {
    if (area.parent_area_id) continue; // neighbourhoods, not their numbered parts
    const centre = knownAreaCenter(area.id, area.name, areas);
    if (!centre) continue;
    const km = distanceKm(point, centre);
    if (km <= NEAREST_AREA_LIMIT_KM && (!best || km < best.km)) best = { area, km };
  }
  return best?.area ?? null;
}
