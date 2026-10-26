import type { MapPoint } from "@/features/property/constants/areaCenters";
import type { GeocodedPlace } from "@/services/geocodeApi";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

/** The part of a Google Geocoder result this file reads. */
export interface GoogleGeocodeResult {
  address_components: { long_name: string; types: string[] }[];
}

const MAX_ADDRESS_LENGTH = 300; // the form's limit

// Neighbourhood-level components, narrowest first. Streets, shops and buildings do not name an area.
const AREA_TYPES = ["neighborhood", "sublocality_level_3", "sublocality_level_2", "sublocality_level_1", "sublocality", "locality"];

function component(result: GoogleGeocodeResult, type: string): string | null {
  return result.address_components.find((c) => c.types.includes(type))?.long_name.trim() || null;
}

/** Reads the most specific result of a reverse geocode. null when it has nothing usable. */
export function parseGoogleGeocode(results: GoogleGeocodeResult[] | null | undefined): GeocodedPlace | null {
  const best = results?.[0];
  if (!best?.address_components?.length) return null;

  const areaNames = [...new Set(AREA_TYPES.map((type) => component(best, type)).filter((name): name is string => name !== null))];

  const street = [component(best, "street_number"), component(best, "route")].filter(Boolean).join(", ") || null;
  // The street first, then the neighbourhood names narrowest to widest, without repeats.
  const seen = new Set<string>();
  const address = [street, ...areaNames]
    .filter((part): part is string => part !== null)
    .filter((part) => !seen.has(part.toLowerCase()) && seen.add(part.toLowerCase()))
    .join(", ")
    .slice(0, MAX_ADDRESS_LENGTH);

  return address || areaNames.length ? { address, areaNames } : null;
}

const cache = new Map<string, GeocodedPlace | null>();

/**
 * Looks up what is at a pin with Google's Geocoder. Throws when Google cannot be
 * reached or refuses (the caller falls back to OpenStreetMap); resolves null when
 * it has no answer for the spot.
 */
export async function googleReverseGeocode(point: MapPoint): Promise<GeocodedPlace | null> {
  // About 10 m: dragging a pin around one spot asks only once.
  const key = `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  await loadGoogleMaps();
  const { Geocoder } = (await google.maps.importLibrary("geocoding")) as google.maps.GeocodingLibrary;
  try {
    const { results } = await new Geocoder().geocode({ location: point });
    const place = parseGoogleGeocode(results as unknown as GoogleGeocodeResult[]);
    cache.set(key, place);
    return place;
  } catch (error) {
    // Google answers ZERO_RESULTS by rejecting; that is "no answer", not a failure.
    if ((error as { code?: string }).code === "ZERO_RESULTS") {
      cache.set(key, null);
      return null;
    }
    throw error;
  }
}

/** For tests. */
export function clearGoogleGeocodeCache() {
  cache.clear();
}
