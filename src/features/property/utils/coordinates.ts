/**
 * Reading and checking a latitude / longitude. Owners never type these: they
 * come from the map pin, the device location or a pasted Google Maps link. This
 * reads the "lat, lng" pair that Google Maps copies, and checks any pair.
 */

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

function normalise(text: string): string {
  return text
    .replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))
    .replace(/[−–—]/g, "-") // typographic minus signs
    .replace(/°/g, "")
    .trim();
}

/**
 * A "lat, lng" pair pasted into one box, as Google Maps copies it
 * ("23.8103, 90.4125"). Needs a decimal point somewhere so that a single
 * comma-decimal number ("23,8") is never mistaken for a pair.
 */
export function parseCoordinatePair(text: string): { lat: number; lng: number } | null {
  const clean = normalise(text);
  if (!clean.includes(".")) return null;
  const match = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*(?:,|;|\s)\s*([+-]?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

/** Why a latitude/longitude can't be used, in words for the owner; null when both are fine. */
export function coordinateProblem(lat: number | null, lng: number | null): string | null {
  if (lat === null || !Number.isFinite(lat)) {
    return "Enter the latitude as a number, for example 23.8103.";
  }
  if (lat < -90 || lat > 90) {
    return "Latitude must be between -90 and 90 (Dhaka is about 23.8). Check you haven't swapped latitude and longitude.";
  }
  if (lng === null || !Number.isFinite(lng)) {
    return "Enter the longitude as a number, for example 90.4125.";
  }
  if (lng < -180 || lng > 180) {
    return "Longitude must be between -180 and 180 (Dhaka is about 90.4).";
  }
  return null;
}
