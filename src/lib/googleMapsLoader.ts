import { GOOGLE_MAPS_API_KEY } from "@/lib/features";

const SCRIPT_ID = "google-maps-js";
const TIMEOUT_MS = 10_000;

let loading: Promise<void> | null = null;

/**
 * Loads Google's Maps JavaScript API once, for the website only.
 *
 * Rejects when there is no key, the script is blocked or offline, or Google
 * refuses the key (a wrong referrer, a disabled API, billing off): the picker
 * then falls back to the OpenStreetMap map. A failed load can be retried.
 */
export function loadGoogleMaps(): Promise<void> {
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error("Google Maps has no API key"));
  const key = GOOGLE_MAPS_API_KEY;
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps needs a browser"));
  if (typeof google !== "undefined" && typeof google.maps?.importLibrary === "function") return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Google Maps took too long to load")), TIMEOUT_MS);
    const fail = (message: string) => {
      clearTimeout(timer);
      document.getElementById(SCRIPT_ID)?.remove();
      reject(new Error(message));
    };

    // Google calls this when it rejects the key after the script has loaded.
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () =>
      fail("Google Maps rejected the API key");
    (window as unknown as { __homenetMapsReady?: () => void }).__homenetMapsReady = () => {
      clearTimeout(timer);
      resolve();
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.onerror = () => fail("Google Maps could not be reached");
    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(key)}&v=weekly&loading=async&language=en&region=BD&callback=__homenetMapsReady`;
    document.head.appendChild(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });

  return loading;
}
