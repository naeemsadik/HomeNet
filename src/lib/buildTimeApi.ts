/**
 * The API as the web build sees it: `generateStaticParams` runs at export time
 * in Node, before any page exists, so it uses plain fetch rather than apiClient
 * (which brings the browser's session and storage).
 */
export const BUILD_API_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.homenetbd.com").replace(/\/$/, "");
const TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 4;
/** Never wait longer than this on one Retry-After, whatever the API asks. */
const MAX_PAUSE_MS = 60_000;

/**
 * The routes' `generateStaticParams` fetch every area's and listing's data in
 * one go: a few hundred requests, where the API allows 60 a minute per
 * endpoint. Unthrottled, it answers 429 and the pages export empty. So: two
 * requests at a time, and when the API says 429, everyone waits out its
 * Retry-After before trying again.
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

/**
 * What the build fetched, for the pages to render. `generateStaticParams` fills
 * this before Expo renders anything, and every page then renders in the same
 * process, so the fetching happens once, at a pace the API allows.
 *
 * Not Expo's route loaders (unstable_useServerDataLoaders): those re-bundle and
 * re-evaluate the whole app for every page, all at once. That took the deploy
 * from 3 minutes to over 25, past 6 GB of memory, and it failed on Vercel.
 *
 * On globalThis because Expo can evaluate the server bundle more than once, and
 * each evaluation gets its own copy of this module.
 */
type BuildState = { snapshots: Map<string, string>; runs: Map<string, Promise<unknown>> };
const buildState = ((globalThis as { __HOMENET_BUILD__?: BuildState }).__HOMENET_BUILD__ ??= {
  snapshots: new Map(),
  runs: new Map(),
});

/** Runs `work` the first time only: Expo calls `generateStaticParams` once per manifest it builds. */
export function oncePerBuild<T>(key: string, work: () => Promise<T>): Promise<T> {
  const runs = buildState.runs as Map<string, Promise<T>>;
  const run = runs.get(key) ?? work();
  runs.set(key, run);
  return run;
}

/** JSON that is safe inside a <script>: a listing's own text cannot close the tag. */
const scriptSafeJson = (value: unknown) =>
  JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);

/** Keeps a page's data for its render. Null is a failed fetch: nothing is kept. */
export function setBuildSnapshot(path: string, snapshot: unknown): void {
  if (snapshot !== null && snapshot !== undefined) buildState.snapshots.set(path, scriptSafeJson(snapshot));
}

/** The page's data as script-safe JSON, or undefined when the build has none. */
export function buildSnapshotJson(path: string): string | undefined {
  return buildState.snapshots.get(path);
}
