// Writes public/sitemap.xml: the public pages, the area pages, the guides and
// every live listing. Runs as the first step of `npm run build`, so each Vercel
// deploy publishes a sitemap that matches the listings that exist at that moment.
//
// Every URL carries hreflang alternates for en-BD, bn-BD and x-default. Bangla
// is served at the same address (the language toggle translates in place), so
// all three point at the URL itself; see languageAlternates in src/lib/seo.ts.
//
// robots.txt, llms.txt and llms-full.txt are plain files in public/.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOMAIN = "https://www.homenetbd.com";
const API_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.homenetbd.com").replace(/\/$/, "");
const PAGE_SIZE = 100; // the API's maximum
const MAX_PAGES = 50; // a runaway-loop guard: 5,000 listings
const TIMEOUT_MS = 15_000;

// Pages a stranger can open and that have real content. Left out on purpose:
// signed-in pages, /market (an empty page until there is data) and /ai-finder.
// <lastmod> for these is the date their route file last changed in git. A
// made-up date teaches Google to ignore the field for the listings that do have
// a real one, so where git cannot say (a shallow clone), it is left out.
const STATIC_PAGES = [
  { path: "", file: "app/index.tsx", changefreq: "daily", priority: "1.0" },
  { path: "/buy", file: "app/buy.tsx", changefreq: "daily", priority: "0.9" },
  { path: "/rent", file: "app/rent.tsx", changefreq: "daily", priority: "0.9" },
  { path: "/sold", file: "app/sold.tsx", changefreq: "weekly", priority: "0.5" },
  { path: "/explore", file: "app/explore.tsx", changefreq: "daily", priority: "0.6" },
  { path: "/sell", file: "app/sell.tsx", changefreq: "monthly", priority: "0.7" },
  { path: "/instant-valuation", file: "app/instant-valuation.tsx", changefreq: "monthly", priority: "0.8" },
  { path: "/guides", file: "app/guides/index.tsx", changefreq: "weekly", priority: "0.6" },
  { path: "/about", file: "app/about.tsx", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy", file: "app/privacy.tsx", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", file: "app/terms.tsx", changefreq: "yearly", priority: "0.2" },
];
// /buy/<area> and /rent/<area>, one pair per area in src/content/areas.ts.
const AREA_INTENTS = ["buy", "rent"];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

function isoDay(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

function slugsIn(file) {
  const source = readFileSync(resolve(ROOT, file), "utf8");
  const slugs = [...new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]))];
  if (slugs.length === 0) throw new Error(`no slugs found in ${file}`);
  return slugs;
}

let shallow;
/** The day a file last changed in git, or null when git cannot tell. */
function gitDay(file) {
  try {
    shallow ??= execFileSync("git", ["rev-parse", "--is-shallow-repository"], { cwd: ROOT, encoding: "utf8" }).trim() === "true";
    if (shallow) return null;
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { cwd: ROOT, encoding: "utf8" }).trim();
    return out ? isoDay(out) : null;
  } catch {
    return null;
  }
}

function guideSlugs() {
  return slugsIn("src/content/curatedGuides.ts");
}

async function liveListings() {
  const listings = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetch(`${API_URL}/v1/properties?page=${page}&limit=${PAGE_SIZE}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`API returned HTTP ${response.status} on page ${page}`);
    const body = await response.json();
    const items = body?.data?.items;
    if (!Array.isArray(items)) throw new Error("API response has no data.items list");
    for (const item of items) {
      if (item?.id && (item.status === undefined || item.status === "active")) {
        listings.push({ id: item.id, changed: item.updated_at || item.created_at });
      }
    }
    if (items.length < PAGE_SIZE || listings.length >= (body.data.total ?? 0)) break;
  }
  return listings;
}

const HREFLANGS = ["en-BD", "bn-BD", "x-default"];

function urlEntry(path, { lastmod, changefreq, priority } = {}) {
  const loc = escapeXml(DOMAIN + path);
  let entry = `  <url>\n    <loc>${loc}</loc>\n`;
  for (const lang of HREFLANGS) entry += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}"/>\n`;
  if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) entry += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) entry += `    <priority>${priority}</priority>\n`;
  return `${entry}  </url>\n`;
}

async function main() {
  const guides = guideSlugs();
  const areas = slugsIn("src/content/areas.ts");
  const guidesDay = gitDay("src/content/curatedGuides.ts");
  const areasDay = gitDay("src/content/areas.ts");

  // A failed API call must not fail the deploy, or a short outage at the API
  // would stop the website from shipping. The sitemap then lists pages and
  // guides only, and says so loudly in the build log.
  let listings = [];
  try {
    listings = await liveListings();
  } catch (error) {
    console.warn(`WARNING: listings left out of the sitemap: ${error.message}`);
  }

  let xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
  for (const page of STATIC_PAGES) xml += urlEntry(page.path, { ...page, lastmod: gitDay(page.file) });
  for (const intent of AREA_INTENTS) {
    for (const slug of areas) {
      xml += urlEntry(`/${intent}/${encodeURIComponent(slug)}`, { lastmod: areasDay, changefreq: "daily", priority: "0.8" });
    }
  }
  for (const slug of guides) {
    xml += urlEntry(`/guides/${encodeURIComponent(slug)}`, { lastmod: guidesDay, changefreq: "monthly", priority: "0.6" });
  }
  for (const listing of listings) {
    xml += urlEntry(`/property/${encodeURIComponent(listing.id)}`, {
      lastmod: isoDay(listing.changed),
      changefreq: "weekly",
      priority: "0.7",
    });
  }
  xml += `</urlset>\n`;

  writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml, "utf8");
  console.log(
    `sitemap: ${STATIC_PAGES.length} pages, ${areas.length * AREA_INTENTS.length} area pages, ${guides.length} guides, ${listings.length} listings (from ${API_URL})`,
  );
}

main().catch((error) => {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
});
