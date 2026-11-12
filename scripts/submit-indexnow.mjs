import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_HOST = "www.homenetbd.com";
const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 10_000;
const BATCH_SIZE = 10_000;

/**
 * Detects the IndexNow API key:
 * 1. From process.env.INDEXNOW_KEY if set.
 * 2. By scanning public/ for a <32-char-hex>.txt file (or standard hex key file).
 */
export function findIndexNowKey(publicDir = resolve(ROOT, "public")) {
  if (process.env.INDEXNOW_KEY && process.env.INDEXNOW_KEY.trim()) {
    return process.env.INDEXNOW_KEY.trim();
  }
  if (!existsSync(publicDir)) return null;
  const files = readdirSync(publicDir);
  const keyFile =
    files.find((file) => /^[0-9a-fA-F]{32}\.txt$/.test(file)) ||
    files.find((file) => /^[0-9a-fA-F]{8,128}\.txt$/.test(file));
  if (!keyFile) return null;

  try {
    const content = readFileSync(resolve(publicDir, keyFile), "utf8").trim();
    return content || keyFile.replace(/\.txt$/i, "");
  } catch {
    return keyFile.replace(/\.txt$/i, "");
  }
}

/**
 * Locates the sitemap file:
 * Checks the custom argument, process.env.INDEXNOW_SITEMAP, then dist/sitemap.xml, then public/sitemap.xml.
 */
export function getSitemapPath(customPath) {
  const candidate = customPath || process.env.INDEXNOW_SITEMAP;
  if (candidate && existsSync(resolve(ROOT, candidate))) {
    const resolved = resolve(ROOT, candidate);
    return statSync(resolved).isDirectory() ? resolve(resolved, "sitemap.xml") : resolved;
  }
  // dist/ is the sitemap this build just made; public/ may hold an older copy.
  const distPath = resolve(ROOT, "dist/sitemap.xml");
  if (existsSync(distPath)) return distPath;
  const publicPath = resolve(ROOT, "public/sitemap.xml");
  if (existsSync(publicPath)) return publicPath;
  return null;
}

/**
 * Extracts all unique <loc> URLs from a sitemap XML string.
 */
export function extractUrlsFromSitemap(xml) {
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return [
    ...new Set(
      matches
        .map((m) =>
          m[1]
            .trim()
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
        )
        .filter(Boolean)
    ),
  ];
}

/**
 * Submits the URLs to the IndexNow API.
 */
export async function submitToIndexNow({
  host = DEFAULT_HOST,
  key,
  urlList,
  endpoint = INDEXNOW_ENDPOINT,
  timeoutMs = TIMEOUT_MS,
  fetchFn = fetch,
} = {}) {
  if (!key) {
    console.warn("IndexNow: no API key found in public/ or INDEXNOW_KEY environment variable. Skipping submission.");
    return { submitted: false, reason: "missing_key" };
  }
  if (!urlList || urlList.length === 0) {
    console.warn("IndexNow: no URLs found in sitemap. Skipping submission.");
    return { submitted: false, reason: "empty_urls" };
  }

  const keyLocation = `https://${host}/${key}.txt`;
  let successCount = 0;

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    const payload = {
      host,
      key,
      keyLocation,
      urlList: batch,
    };

    try {
      const response = await fetchFn(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) {
        successCount += batch.length;
      } else {
        const errorText = await response.text().catch(() => "");
        console.warn(
          `IndexNow: API returned HTTP ${response.status} for batch ${Math.floor(i / BATCH_SIZE) + 1}: ${errorText}`,
        );
      }
    } catch (error) {
      console.warn(
        `IndexNow: request failed or timed out for batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error?.message || error,
      );
    }
  }

  if (successCount > 0) {
    console.log(`IndexNow: submitted ${successCount} URLs to ${endpoint} (host: ${host}).`);
    return { submitted: true, count: successCount };
  }

  return { submitted: false, reason: "all_requests_failed" };
}

/**
 * Whether this run should tell search engines anything. A search engine fetches the live site, so
 * only a production deploy has something new to report. Preview builds, pull-request builds and
 * local builds would re-send every URL for nothing (and IndexNow may start ignoring a site that
 * does that). `npm run indexnow` passes --force to submit by hand.
 */
export function shouldSubmit({ env = process.env, force = false } = {}) {
  if (force) return { submit: true };
  if (env.INDEXNOW_DISABLED === "1") return { submit: false, reason: "INDEXNOW_DISABLED is set" };
  if (env.VERCEL_ENV === "production") return { submit: true };
  return {
    submit: false,
    reason: env.VERCEL_ENV
      ? `this is a ${env.VERCEL_ENV} build, not production`
      : "this is not a Vercel production build (use `npm run indexnow` to submit by hand)",
  };
}

export async function main() {
  try {
    const args = process.argv.slice(2);
    const force = args.includes("--force");
    const decision = shouldSubmit({ force });
    if (!decision.submit) {
      console.log(`IndexNow: skipped, ${decision.reason}.`);
      return;
    }

    const key = findIndexNowKey();
    if (!key) {
      console.warn("IndexNow: no API key found in public/ or INDEXNOW_KEY. Skipping submission.");
      return;
    }

    const sitemapPath = getSitemapPath(args.find((arg) => !arg.startsWith("--")));
    if (!sitemapPath || !existsSync(sitemapPath)) {
      console.warn("IndexNow: sitemap not found. Skipping submission.");
      return;
    }

    const xml = readFileSync(sitemapPath, "utf8");
    const urls = extractUrlsFromSitemap(xml);
    if (urls.length === 0) {
      console.warn(`IndexNow: no URLs found in sitemap (${sitemapPath}). Skipping submission.`);
      return;
    }

    const host = process.env.INDEXNOW_HOST || DEFAULT_HOST;
    await submitToIndexNow({ host, key, urlList: urls });
  } catch (error) {
    // Fail gracefully: never crash build
    console.warn("IndexNow: unexpected error during submission:", error?.message || error);
  }
}

const isDirectRun =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main().catch((err) => {
    console.warn("IndexNow: unhandled failure:", err?.message || err);
  });
}

