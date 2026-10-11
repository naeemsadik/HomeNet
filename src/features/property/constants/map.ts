/**
 * The map behind the location picker.
 *
 * Tiles come from OpenStreetMap's public servers: free and keyless. Their usage
 * policy allows light traffic with visible attribution, which suits a picker
 * only owners open while listing. Before real traffic, point
 * EXPO_PUBLIC_MAP_TILE_URL at a tile provider (MapTiler, Stadia, Mapbox…) and
 * EXPO_PUBLIC_MAP_ATTRIBUTION at its required credit. The tile host must also be
 * in the `img-src` of the Content-Security-Policy in vercel.json.
 */
export const MAP_TILE_URL = process.env.EXPO_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const MAP_ATTRIBUTION =
  process.env.EXPO_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export const MAP_MAX_ZOOM = 19;
/** Zoom when opening on an area, and when a pin is placed. */
export const MAP_AREA_ZOOM = 14;
export const MAP_PIN_ZOOM = 17;
export const MAP_CITY_ZOOM = 11;

/**
 * Turning a pin into an address and area (reverse geocoding). OpenStreetMap's
 * public Nominatim is free and keyless; its policy allows light use (one lookup
 * per pin placed, which is what the app does). Before real traffic, route this
 * through the API (docs/BACKEND_REQUIREMENTS.md §9) or point
 * EXPO_PUBLIC_GEOCODER_URL at a provider. The host must also be in `connect-src`
 * in vercel.json.
 */
export const GEOCODER_URL = process.env.EXPO_PUBLIC_GEOCODER_URL || "https://nominatim.openstreetmap.org";
