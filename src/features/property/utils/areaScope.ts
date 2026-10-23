import { SEO_AREAS } from "@/content/areas";
import type { Area } from "@/types/api";

/**
 * How a chosen place and "+ N km" turn into API filters.
 *
 * The API's `city` filter compares the *city* of a listing's area ("Dhaka"), not
 * its name, so `city=Gulshan` matches nothing. A neighbourhood has to be asked for
 * by area id (the area plus its sub-areas), or by distance from its centre.
 * Distance search needs the area's coordinates, which only some areas have yet.
 */

const CITIES = ["dhaka", "chattogram", "sylhet", "coxsbazar"];

/** Lower-case letters and digits only, so "Gulshan 1", "Gulshan-1" and "gulshan1" agree. */
export const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function isCityName(name: string): boolean {
  return CITIES.includes(squash(name));
}

/**
 * The area a name means: an exact match, else the longest area name the text
 * starts with ("Bashundhara R/A" is the area "Bashundhara"). Names shorter than
 * four characters are only matched exactly.
 */
export function findArea(name: string, areas: Area[]): Area | null {
  const needle = squash(name);
  if (!needle) return null;

  const exact = areas.find((area) => squash(area.name) === needle);
  if (exact) return exact;

  let best: Area | null = null;
  for (const area of areas) {
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

const validCoordinate = (lat: unknown, lng: unknown): boolean =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng);

/** The area's own centre, else its parent's, else null (distance search is not possible). */
export function areaCentre(area: Area, areas: Area[]): Centre | null {
  if (validCoordinate(area.center_lat, area.center_lng)) {
    return { lat: area.center_lat as number, lng: area.center_lng as number };
  }
  const parent = area.parent_area_id ? areas.find((other) => other.id === area.parent_area_id) : undefined;
  if (parent && validCoordinate(parent.center_lat, parent.center_lng)) {
    return { lat: parent.center_lat as number, lng: parent.center_lng as number };
  }
  return null;
}

export type AreaScope =
  /** No place chosen: all listings. */
  | { kind: "none" }
  /** A whole city: the API's `city` filter. */
  | { kind: "city"; city: string }
  /** A neighbourhood: its listings, by area id. */
  | { kind: "areas"; ids: string[] }
  /** A neighbourhood plus a distance around its centre. */
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

export function resolveScope(input: { name: string; radiusKm: number; areas: Area[] }): ResolvedScope {
  const name = input.name.trim();
  if (!name) return { scope: { kind: "none" }, radiusAvailable: false };

  if (isCityName(name)) return { scope: { kind: "city", city: name }, radiusAvailable: false };

  const area = findArea(name, input.areas);
  if (!area) return { scope: { kind: "text", text: name }, radiusAvailable: false };

  const centre = areaCentre(area, input.areas);
  const radius = Math.min(Math.round(input.radiusKm), MAX_RADIUS_KM);
  if (centre && radius >= 1) {
    return { scope: { kind: "radius", ...centre, radius }, radiusAvailable: true };
  }
  return { scope: { kind: "areas", ids: areaIdsWithChildren(area, input.areas) }, radiusAvailable: centre !== null };
}

export interface AreaOption {
  label: string;
  value: string;
}

/** Cities first, then each neighbourhood with its sub-areas indented under it. */
export function areaOptions(areas: Area[], allAreasLabel: string): AreaOption[] {
  const options: AreaOption[] = [{ label: allAreasLabel, value: "" }];

  const cities = [...new Set(areas.map((area) => area.city).filter((city): city is string => !!city))].sort();
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
