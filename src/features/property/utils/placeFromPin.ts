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

/** What this step has written into the form itself, as opposed to what the owner typed. */
export interface WrittenByPin {
  areaId: string | null;
  address: string | null;
}

export interface PinFillPatch {
  areaId?: string;
  areaName?: string;
  district?: string;
  address?: string;
}

/**
 * What to change in the form after a pin has been looked up.
 *
 * A box is filled only when it is empty or still holds what the pin put there,
 * so an owner's own entry is never replaced. When the new pin gives no area (or
 * no address), whatever an earlier pin put in that box is cleared rather than
 * left to describe a place the pin is no longer at.
 *
 * `areaFollowsPin` is set once the owner has moved the pin: the area then always
 * describes where the pin is, even if it was picked by hand or came from a draft.
 * The address the owner typed is still kept, since it holds the house and road.
 */
export function pinFillPatch(
  current: { areaId: string; address: string },
  written: WrittenByPin,
  area: Area | null,
  address: string | null,
  areaFollowsPin = false,
): { patch: PinFillPatch; written: WrittenByPin } {
  const patch: PinFillPatch = {};
  const next = { ...written };

  const areaIsOurs = areaFollowsPin || current.areaId === "" || current.areaId === written.areaId;
  if (area && areaIsOurs) {
    patch.areaId = area.id;
    patch.areaName = area.name;
    patch.district = area.city ?? "";
    next.areaId = area.id;
  } else if (!area && current.areaId !== "" && areaIsOurs) {
    patch.areaId = "";
    patch.areaName = "";
    patch.district = "";
    next.areaId = null;
  }

  const addressIsOurs = current.address.trim() === "" || current.address === written.address;
  if (address && addressIsOurs) {
    patch.address = address;
    next.address = address;
  } else if (!address && current.address !== "" && current.address === written.address) {
    patch.address = "";
    next.address = null;
  }

  return { patch, written: next };
}
