/**
 * Google Analytics 4, switched on by an environment variable.
 *
 * `src/lib/analytics.ts` already sends every conversion event to
 * `window.gtag`. Nothing defined it, so those events went nowhere. This
 * defines it and configures the stream so they land in GA4.
 *
 * Four things shape how this is done:
 *
 * - **No inline script.** `script-src` in vercel.json carries no
 *   'unsafe-inline', so an inline script needs its sha256 hash listed there.
 *   The usual GA snippet is inline *and* contains the measurement ID, so its
 *   hash would change whenever the ID did, and the site would break quietly
 *   the first time someone rotated it. The loader tag in `app/+html.tsx` is
 *   external (no hash needed) and the bootstrap below ships inside the
 *   bundle, which `script-src 'self'` already allows.
 * - **The stub is defined at module load, not in an effect.** gtag queues
 *   calls on `dataLayer` and gtag.js replays them once it arrives, so an
 *   event fired before configuration is only lost if `window.gtag` does not
 *   exist yet. Defining it as this module is imported means an early
 *   `trackEvent` is queued rather than dropped.
 * - **Page views are sent by hand.** The app routes on the client, so the
 *   single `config` call at startup would record one page view for a whole
 *   session. `config` therefore sets `send_page_view: false` and
 *   `trackPageView` reports each route, the first one included.
 * - **No react-native import.** `app/+html.tsx` renders in Node during the
 *   static export and imports this module for the loader tag, so this file
 *   stays free of anything that only resolves inside the app bundle. The
 *   web-only guard is `document`, which native does not define.
 *
 * Nothing at all ships when `EXPO_PUBLIC_GA_MEASUREMENT_ID` is unset: no
 * loader tag is rendered and every function here returns immediately.
 */
export const GA_MEASUREMENT_ID = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;

/** A measurement ID looks like `G-XXXXXXXXXX`. */
export function isValidMeasurementId(id: string | null): id is string {
  return typeof id === "string" && /^G-[A-Z0-9]{4,}$/i.test(id);
}

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __homenetGaReady?: boolean;
};

const isWeb = () => typeof window !== "undefined" && typeof document !== "undefined";

/**
 * Defines `window.gtag` so calls made before gtag.js loads are queued on
 * `dataLayer` instead of lost. Runs at module load; safe to call again.
 */
function defineGtag(): GtagWindow | null {
  if (!isWeb() || !isValidMeasurementId(GA_MEASUREMENT_ID)) return null;

  const target = window as GtagWindow;
  target.dataLayer = target.dataLayer ?? [];
  if (typeof target.gtag !== "function") {
    // gtag reads each call as an arguments object, not an array, so this keeps
    // the canonical shape rather than pushing a rest parameter.
    target.gtag = function gtag() {
      target.dataLayer?.push(arguments);
    };
  }
  return target;
}

// Define the stub as early as this module is imported, so no event is dropped.
defineGtag();

/**
 * Configures the stream. Safe to call more than once: the second call returns
 * without pushing another `config`.
 */
export function initGoogleAnalytics(): void {
  const target = defineGtag();
  if (!target || target.__homenetGaReady) return;

  target.gtag?.("js", new Date());
  // Page views are reported by trackPageView, including the first one.
  target.gtag?.("config", GA_MEASUREMENT_ID, { send_page_view: false });
  target.__homenetGaReady = true;
}

/** Reports one page view. Called for every route the user lands on. */
export function trackPageView(path: string): void {
  const target = defineGtag();
  if (!target) return;
  if (!target.__homenetGaReady) initGoogleAnalytics();

  target.gtag?.("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
