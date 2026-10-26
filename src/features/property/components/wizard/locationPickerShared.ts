import { DHAKA_CENTER, type MapPoint } from "../../constants/areaCenters";
import { MAP_AREA_ZOOM, MAP_CITY_ZOOM } from "../../constants/map";

/** Six decimals is about 10 cm, far finer than a GPS fix. */
export const round = (n: number) => Math.round(n * 1e6) / 1e6;

export const PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">' +
  '<path d="M18 1C9.2 1 2 8 2 16.7 2 28.4 18 45 18 45s16-16.6 16-28.3C34 8 26.8 1 18 1z" fill="#04cf92" stroke="#0B1A17" stroke-width="2"/>' +
  '<circle cx="18" cy="17" r="6" fill="#0B1A17"/></svg>';

/** Within the rounding of the six-decimal values the form holds (at most 5e-7 apart). */
export const sameSpot = (a: MapPoint, b: MapPoint) => Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

/** Whole-city view until an area is chosen, then a neighbourhood view. */
export const zoomFor = (openAt: MapPoint) => (sameSpot(openAt, DHAKA_CENTER) ? MAP_CITY_ZOOM : MAP_AREA_ZOOM);

export const LOCATION_MESSAGES: Record<number, string> = {
  1: "Location access is blocked. Allow it in your browser's address bar, or tap the map instead.",
  2: "We couldn't work out where you are. Tap the map instead.",
  3: "Finding your location took too long. Tap the map instead.",
};
