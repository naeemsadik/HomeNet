/**
 * The API as the web build sees it: `generateStaticParams` and route loaders
 * run at export time in Node, before any page exists, so they use plain fetch
 * rather than apiClient (which brings the browser's session and storage).
 */
export const BUILD_API_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.homenetbd.com").replace(/\/$/, "");
const TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 4;
/** Never wait longer than this on one Retry-After, whatever the API asks. */
const MAX_PAUSE_MS = 60_000;

/**
 * Expo exports every page at once, and each area page's and listing's loader
 * calls the API. Unthrottled, that is well over a hundred requests in a burst:
 * the API answers 429 (it rate-limits per endpoint), and on Windows the open
 * sockets ran the build out of file handles. So: two requests at a time, and
 * when the API says 429, everyone waits out its Retry-After before trying again.
 */
const MAX_IN_FLIGHT = 2;
let inFlight = 0;
let pausedUntil = 0;
const waiting: (() => void)[] = [];

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function acquire(): Promise<void> {
  if (inFlight < MAX_IN_FLIGHT) inFlight += 1;
  else await new Promise<void>((resolve) => waiting.push(resolve));
  const pause = pausedUntil - Date.now();
  if (pause > 0) await delay(pause);
}

/** Hands the slot straight to the next waiting request, if any. */
function release(): void {
  const next = waiting.shift();
  if (next) next();
  else inFlight -= 1;
}

/**
 * GET a path on the API and return the parsed body. Retries a 429 (after its
 * Retry-After), a 5xx and a timeout; throws on anything else, or when the
 * attempts run out.
 */
export async function buildTimeGet<T>(path: string): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    await acquire();
    try {
      const response = await fetch(`${BUILD_API_URL}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (response.ok) return (await response.json()) as T;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === MAX_ATTEMPTS) throw new Error(`API returned HTTP ${response.status} for ${path}`);
      const retryAfter = Number(response.headers.get("retry-after"));
      const pause = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2_000 * attempt;
      pausedUntil = Math.max(pausedUntil, Date.now() + Math.min(pause, MAX_PAUSE_MS));
      await response.body?.cancel();
    } catch (error) {
      const timedOut = (error as Error).name === "TimeoutError" || (error as Error).name === "AbortError";
      if (!timedOut || attempt === MAX_ATTEMPTS) throw error;
    } finally {
      release();
    }
  }
}
