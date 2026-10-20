// Writes public/sitemap.xml: the public pages, the guides and every live listing.
// Runs as the first step of `npm run build`, so each Vercel deploy publishes a
// sitemap that matches the listings that exist at that moment.
//
// robots.txt is a plain file in public/, not generated here.
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
// No <lastmod> here: these pages have no real "last changed" date, and a made-up
// one teaches Google to ignore the field for the listings that do have one.
const STATIC_PATHS = ["", "/buy", "/rent", "/sold", "/explore", "/sell", "/guides", "/about", "/privacy", "/terms"];

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

function guideSlugs() {
  const source = readFileSync(resolve(ROOT, "src/content/curatedGuides.ts"), "utf8");
  const slugs = [...new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]))];
  if (slugs.length === 0) throw new Error("no guide slugs found in src/content/curatedGuides.ts");
  return slugs;
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

function urlEntry(path, lastmod) {
  return `  <url>\n    <loc>${escapeXml(DOMAIN + path)}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}  </url>\n`;
}

async function main() {
  const guides = guideSlugs();

  // A failed API call must not fail the deploy, or a short outage at the API
  // would stop the website from shipping. The sitemap then lists pages and
  // guides only, and says so loudly in the build log.
  let listings = [];
  try {
    listings = await liveListings();
  } catch (error) {
    console.warn(`WARNING: listings left out of the sitemap: ${error.message}`);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const path of STATIC_PATHS) xml += urlEntry(path);
  for (const slug of guides) xml += urlEntry(`/guides/${encodeURIComponent(slug)}`);
  for (const listing of listings) xml += urlEntry(`/property/${encodeURIComponent(listing.id)}`, isoDay(listing.changed));
  xml += `</urlset>\n`;

  writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml, "utf8");
  console.log(
    `sitemap: ${STATIC_PATHS.length} pages, ${guides.length} guides, ${listings.length} listings (from ${API_URL})`,
  );
}

main().catch((error) => {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
});
