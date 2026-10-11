import { GEOCODER_URL } from "@/features/property/constants/map";
import type { MapPoint } from "@/features/property/constants/areaCenters";

/** What a pin turned out to be: a readable address and the neighbourhood names around it. */
export interface GeocodedPlace {
  /** Road and neighbourhood names joined into one line, ready to show in the address box. */
  address: string;
  /** Neighbourhood-level names, most specific first, for matching HomeNet's own areas. */
  areaNames: string[];
}

// Only neighbourhood-level fields name an area. Shops, amenities and buildings do not:
// a shop called "Luxury Lifestyle (Banani)" in Gulshan must not make the area Banani.
const AREA_KEYS = ["neighbourhood", "quarter", "residential", "suburb", "city_district", "borough", "town", "village", "municipality"];
const ROAD_KEYS = ["road", "pedestrian", "footway", "path"];
const MAX_ADDRESS_LENGTH = 300; // the form's limit

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/** Reads one Nominatim `reverse` answer. null when it has nothing usable. */
export function parseGeocode(body: unknown): GeocodedPlace | null {
  if (!body || typeof body !== "object" || "error" in body) return null;
  const raw = (body as { address?: unknown }).address;
  if (!raw || typeof raw !== "object") return null;
  const address = raw as Record<string, unknown>;

  const areaNames = AREA_KEYS.map((key) => text(address[key])).filter((name): name is string => name !== null);

  const road = ROAD_KEYS.map((key) => text(address[key])).find(Boolean) ?? null;
  const houseNumber = text(address.house_number);
  const street = [houseNumber, road].filter(Boolean).join(", ") || null;
  const city = text(address.city) ?? text(address.town) ?? text(address.village);

  // The street first, then the neighbourhood names narrowest to widest, without repeats.
  const seen = new Set<string>();
  const line = [street, text(address.neighbourhood), text(address.quarter), text(address.residential), text(address.suburb), city]
    .filter((part): part is string => part !== null)
    .filter((part) => !seen.has(part.toLowerCase()) && seen.add(part.toLowerCase()))
    .join(", ")
    .slice(0, MAX_ADDRESS_LENGTH);

  return line || areaNames.length ? { address: line, areaNames } : null;
}

const cache = new Map<string, GeocodedPlace | null>();
const TIMEOUT_MS = 6_000;

/**
 * Looks up what is at a pin. Plain fetch on purpose: the app's API client would
 * attach the owner's sign-in token to a request that goes to a third party.
 * Throws when the service can't be reached or refuses; resolves null when it has no answer.
 */
export async function reverseGeocode(point: MapPoint): Promise<GeocodedPlace | null> {
  // About 10 m: dragging a pin around one spot asks only once.
  const key = `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const url =
    `${GEOCODER_URL}/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en` +
    `&lat=${point.lat}&lon=${point.lng}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`The address service answered ${response.status}.`);
    const place = parseGeocode(await response.json());
    cache.set(key, place);
    return place;
  } finally {
    clearTimeout(timer);
  }
}

/** For tests. */
export function clearGeocodeCache() {
  cache.clear();
}
