/**
 * Google Analytics 4, switched on by an environment variable.
 *
 * `src/lib/analytics.ts` already sends every conversion event to
 * `window.gtag`. Nothing defined it, so those events went nowhere. This
 * configures gtag so they land in GA4.
 *
 * Two things shape how this is done:
 *
 * - **No inline script.** `script-src` in vercel.json carries no
 *   'unsafe-inline', so an inline script needs its sha256 hash listed there.
 *   The usual GA snippet is inline *and* contains the measurement ID, so its
 *   hash would change whenever the ID did, and the site would break quietly
 *   the first time someone rotated it. The loader tag in `app/+html.tsx` is
 *   external (no hash needed) and the bootstrap below ships inside the
 *   bundle, which `script-src 'self'` already allows.
 * - **No react-native import.** `app/+html.tsx` renders in Node during the
 *   static export and imports this module for the loader tag, so this file
 *   stays free of anything that only resolves inside the app bundle. The
 *   web-only guard is `document`, which native does not define.
 * - **Nothing ships when the ID is unset.** Without
 *   `EXPO_PUBLIC_GA_MEASUREMENT_ID` no loader tag is rendered and this
 *   function returns immediately, so a build without the variable is exactly
 *   the site as it is today.
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

/**
 * Defines `window.gtag` and configures the stream. Safe to call more than
 * once: the second call returns without pushing a second `config`, which
 * would double-count every page view.
 */
export function initGoogleAnalytics(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!isValidMeasurementId(GA_MEASUREMENT_ID)) return;

  const target = window as GtagWindow;
  if (target.__homenetGaReady) return;

  target.dataLayer = target.dataLayer ?? [];
  if (typeof target.gtag !== "function") {
    // gtag reads each call as an arguments object, not an array, so this keeps
    // the canonical shape rather than pushing a rest parameter.
    target.gtag = function gtag() {
      target.dataLayer?.push(arguments);
    };
  }

  target.gtag("js", new Date());
  target.gtag("config", GA_MEASUREMENT_ID);
  target.__homenetGaReady = true;
}
