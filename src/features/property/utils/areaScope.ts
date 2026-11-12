import { SEO_AREAS } from "@/content/areas";
import {
  collectAvailableCities,
  inferAreaCity,
  isKnownBangladeshCity,
  isNationwideValue,
  normalizeCityName,
  resolveAreaMatch,
  scopeAreasToCity,
} from "@/lib/areaMatcher";
import type { Area } from "@/types/api";

/**
 * How a chosen place and "+ N km" turn into API filters.
 *
 * The API's `city` filter compares the *city* of a listing's area ("Dhaka"), not
 * its name, so `city=Gulshan` matches nothing. A neighbourhood has to be asked for
 * by area id (the area plus its sub-areas), or by distance from its centre.
 * Distance search needs the area's coordinates, which only some areas have yet.
 */

/** Lower-case letters and digits only, so "Gulshan 1", "Gulshan-1" and "gulshan1" agree. */
export const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function isCityName(name: string): boolean {
  if (!name.trim() || isNationwideValue(name)) return false;
  return isKnownBangladeshCity(name);
}

/**
 * Resolves a sub-area name inside `areas` (optionally scoped to `city`):
 * Uses the multi-layer matcher (exact/alias -> transliteration fuzzy -> proximity),
 * then falls back to longest prefix match ("Bashundhara R/A" -> "Bashundhara").
 */
export function findArea(
  name: string,
  areas: Area[],
  city?: string | null,
  coordinates?: { lat: number; lng: number } | null,
): Area | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const scoped = city && !isNationwideValue(city) ? scopeAreasToCity(areas, city) : areas;
  const resolution = resolveAreaMatch({
    query: trimmed,
    city,
    areas: scoped,
    coordinates: coordinates ?? null,
  });

  if (resolution.matchedArea) return resolution.matchedArea;
  if (resolution.matchType === "ambiguous") return null;

  const needle = squash(trimmed);
  if (!needle) return null;

  const exact = scoped.find((area) => squash(area.name) === needle);
  if (exact) return exact;

  let best: Area | null = null;
  for (const area of scoped) {
    const candidate = squash(area.name);
    if (candidate.length >= 4 && needle.startsWith(candidate) && (!best || candidate.length > squash(best.name).length)) {
      best = area;
    }
  }
  return best;
}

/** The area's own id and the ids of its sub-areas, so "Gulshan" includes Gulshan-1 and Gulshan-2. */
export function areaIdsWithChildren(area: Area, areas: Area[]): string[] {
  return [area.id, ...areas.filter((other) => other.parent_area_id === area.id).map((other) => other.id)];
}

export interface Centre {
  lat: number;
  lng: number;
}

const isValidCoord = (val: unknown): val is number =>
  typeof val === "number" && Number.isFinite(val);

function toCentre(lat: unknown, lng: unknown): Centre | null {
  return isValidCoord(lat) && isValidCoord(lng) ? { lat, lng } : null;
}

/** The area's own centre, else its parent's, else null (distance search is not possible). */
export function areaCentre(area: Area, areas: Area[]): Centre | null {
  const own = toCentre(area.center_lat, area.center_lng);
  if (own) return own;
  const parent = area.parent_area_id ? areas.find((other) => other.id === area.parent_area_id) : undefined;
  return parent ? toCentre(parent.center_lat, parent.center_lng) : null;
}

export type AreaScope =
  /** No place chosen: all listings across Bangladesh. */
  | { kind: "none" }
  /** A whole city: city-wide text search. */
  | { kind: "city"; city: string }
  /** A neighbourhood (or disambiguated set): its listings, by area id. */
  | { kind: "areas"; ids: string[] }
  /** A neighbourhood or pin plus a distance around its centre. */
  | { kind: "radius"; lat: number; lng: number; radius: number }
  /** A place the area list does not know: fall back to a text search for the name. */
  | { kind: "text"; text: string };

export interface ResolvedScope {
  scope: AreaScope;
  /** Whether a "+ N km" distance can be applied to this place. */
  radiusAvailable: boolean;
}

/** The API accepts 1 to 50 km. */
export const MAX_RADIUS_KM = 50;

export function resolveScope(input: {
  name: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  radiusKm: number;
  areas: Area[];
}): ResolvedScope {
  const name = input.name.trim();
  const city = input.city && !isNationwideValue(input.city) ? normalizeCityName(input.city) ?? input.city.trim() : "";
  const coords = toCentre(input.lat, input.lng);
  const radius = Math.min(Math.round(input.radiusKm), MAX_RADIUS_KM);

  if (!name && !city) {
    if (coords) {
      return {
        scope: { kind: "radius", ...coords, radius: radius >= 1 ? radius : 3 },
        radiusAvailable: true,
      };
    }
    return { scope: { kind: "none" }, radiusAvailable: false };
  }

  // City-level selection (no specific sub-area selected, or sub-area is the city name itself)
  if ((!name && city) || (name && isCityName(name))) {
    const resolvedCity = city || normalizeCityName(name) || name;
    if (coords && radius >= 1) {
      return { scope: { kind: "radius", ...coords, radius }, radiusAvailable: true };
    }
    return { scope: { kind: "city", city: resolvedCity }, radiusAvailable: false };
  }

  const scopedAreas = city ? scopeAreasToCity(input.areas, city) : input.areas;
  const resolution = resolveAreaMatch({
    query: name,
    city: city || null,
    areas: scopedAreas,
    coordinates: coords,
  });

  if (resolution.matchedArea) {
    const centre = areaCentre(resolution.matchedArea, input.areas) ?? coords;
    if (centre && radius >= 1) {
      return { scope: { kind: "radius", ...centre, radius }, radiusAvailable: true };
    }
    return {
      scope: { kind: "areas", ids: areaIdsWithChildren(resolution.matchedArea, input.areas) },
      radiusAvailable: centre !== null,
    };
  }

  if (resolution.matchType === "ambiguous" && resolution.candidates.length > 0) {
    const ids = Array.from(
      new Set(resolution.candidates.flatMap((candidate) => areaIdsWithChildren(candidate, input.areas))),
    );
    return { scope: { kind: "areas", ids }, radiusAvailable: coords !== null };
  }

  // Fallback for prefix-matched area names (e.g. "Bashundhara R/A" -> "Bashundhara")
  const prefixMatch = findArea(name, scopedAreas, city, coords);
  if (prefixMatch) {
    const centre = areaCentre(prefixMatch, input.areas) ?? coords;
    if (centre && radius >= 1) {
      return { scope: { kind: "radius", ...centre, radius }, radiusAvailable: true };
    }
    return {
      scope: { kind: "areas", ids: areaIdsWithChildren(prefixMatch, input.areas) },
      radiusAvailable: centre !== null,
    };
  }

  // Coordinate fallback when Google Place location is outside mapped DB areas
  if (coords) {
    return {
      scope: { kind: "radius", ...coords, radius: radius >= 1 ? radius : 3 },
      radiusAvailable: true,
    };
  }

  return { scope: { kind: "text", text: name }, radiusAvailable: false };
}

export interface AreaOption {
  label: string;
  value: string;
}

/** Step 1 filter options: All Cities (Bangladesh) followed by active BD cities. */
export function cityOptions(areas: Area[], allCitiesLabel: string): AreaOption[] {
  const options: AreaOption[] = [{ label: allCitiesLabel, value: "" }];
  for (const city of collectAvailableCities(areas)) {
    options.push({ label: city, value: city });
  }
  return options;
}

/** Step 2 filter options: sub-areas strictly scoped to `city`, with children indented. */
export function areaOptionsForCity(
  areas: Area[],
  city: string | null | undefined,
  allAreasLabel: string,
): AreaOption[] {
  const options: AreaOption[] = [{ label: allAreasLabel, value: "" }];
  const normalizedCity = city ? normalizeCityName(city) : null;
  if (!normalizedCity || isNationwideValue(normalizedCity)) {
    return options;
  }

  const byId = new Map(areas.map((a) => [a.id, a]));
  const scoped = scopeAreasToCity(areas, normalizedCity).filter(
    (area) => (normalizeCityName(area.name)?.toLowerCase() ?? "") !== normalizedCity.toLowerCase(),
  );

  const byName = (a: Area, b: Area) => a.name.localeCompare(b.name);
  const topLevel = scoped.filter((area) => !area.parent_area_id || !byId.has(area.parent_area_id)).sort(byName);
  const seen = new Set<string>();

  for (const area of topLevel) {
    if (!seen.has(area.name)) {
      options.push({ label: area.name, value: area.name });
      seen.add(area.name);
    }
    for (const child of scoped.filter((other) => other.parent_area_id === area.id).sort(byName)) {
      if (!seen.has(child.name)) {
        options.push({ label: `  ${child.name}`, value: child.name });
        seen.add(child.name);
      }
    }
  }
  return options;
}

/** Fallback sub-area options when live `/v1/areas` is incomplete, scoped strictly to `city`. */
export function fallbackAreaOptionsForCity(
  city: string | null | undefined,
  allAreasLabel: string,
): AreaOption[] {
  const options: AreaOption[] = [{ label: allAreasLabel, value: "" }];
  const normalizedCity = city ? normalizeCityName(city) : null;
  if (!normalizedCity || isNationwideValue(normalizedCity)) return options;

  for (const place of SEO_AREAS.filter((area) => area.parent && area.city.toLowerCase() === normalizedCity.toLowerCase())) {
    options.push({ label: place.name, value: place.name });
  }
  return options;
}

/** Cities first, then each neighbourhood with its sub-areas indented under it. */
export function areaOptions(areas: Area[], allAreasLabel: string): AreaOption[] {
  const options: AreaOption[] = [{ label: allAreasLabel, value: "" }];

  const cities = [
    ...new Set(
      areas
        .map((area) => inferAreaCity(area))
        .filter((city): city is string => !!city),
    ),
  ].sort();
  for (const city of cities) options.push({ label: city, value: city });

  const byName = (a: Area, b: Area) => a.name.localeCompare(b.name);
  const topLevel = areas.filter((area) => !area.parent_area_id).sort(byName);
  for (const area of topLevel) {
    options.push({ label: area.name, value: area.name });
    for (const child of areas.filter((other) => other.parent_area_id === area.id).sort(byName)) {
      options.push({ label: `  ${child.name}`, value: child.name });
    }
  }
  // Sub-areas whose parent is missing from the list still need to be pickable.
  const known = new Set(options.map((option) => option.value));
  for (const area of areas.filter((a) => a.parent_area_id && !known.has(a.name)).sort(byName)) {
    options.push({ label: area.name, value: area.name });
  }
  return options;
}

/**
 * The places to offer when the live area list is missing or incomplete: the
 * cities and neighbourhoods the site has pages for. They are picked by name, so
 * they search by text instead of by area id, and have no distance search.
 */
export function fallbackAreaOptions(allAreasLabel: string): AreaOption[] {
  const options: AreaOption[] = [{ label: allAreasLabel, value: "" }];
  for (const place of SEO_AREAS.filter((area) => !area.parent)) options.push({ label: place.name, value: place.name });
  for (const place of SEO_AREAS.filter((area) => area.parent)) options.push({ label: place.name, value: place.name });
  return options;
}
