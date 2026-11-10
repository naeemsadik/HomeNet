// Writes dist/sitemap.xml: the public pages, the area pages that have
// listings, the guides and every listing page the build exported. Runs after
// `expo export` in `npm run build` and reads what the export saw, without
// calling the API again (by then the export has used up its rate limit), from
// the snapshot in each page's HTML (src/lib/buildSnapshot.web.tsx):
//   - a listing page with one (dist/property/<id>.html) is a listing that
//     exists at this deploy, with the date it last changed;
//   - an area page's (dist/<intent>/<slug>.html) says whether the area had any
//     listings, and when the newest of them changed.
// So the sitemap lists exactly the pages that were pre-rendered.
//
// An area with no listings is exported noindex (AreaLandingScreen) and left
// out here: a sitemap must not list pages it asks search engines to skip.
//
// No hreflang alternates: Bangla is the same page translated in place, not a
// separate URL (see src/lib/seo.ts).
//
// robots.txt, llms.txt and llms-full.txt are plain files in public/.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, process.argv[2] || "dist");
const DOMAIN = "https://www.homenetbd.com";

// Pages a stranger can open and that have real content. Left out on purpose:
// signed-in pages, /market (an empty page until there is data), /ai-finder and
// /explore (the same listings as /buy, canonicalised to it).
// <lastmod> is the date the content last changed where a file says so
// (`lastmod`), else the date the route file last changed in git. A made-up
// date teaches Google to ignore the field for the pages that do have a real
// one, so where git cannot say (a shallow clone), it is left out.
const LEGAL_UPDATED = legalUpdated();
const STATIC_PAGES = [
  { path: "", file: "app/index.tsx", changefreq: "daily", priority: "1.0" },
  { path: "/buy", file: "app/buy.tsx", changefreq: "daily", priority: "0.9" },
  { path: "/rent", file: "app/rent.tsx", changefreq: "daily", priority: "0.9" },
  { path: "/sold", file: "app/sold.tsx", changefreq: "weekly", priority: "0.5" },
  { path: "/areas", file: "app/areas.tsx", changefreq: "weekly", priority: "0.7" },
  { path: "/sell", file: "app/sell.tsx", changefreq: "monthly", priority: "0.7" },
  { path: "/instant-valuation", file: "app/instant-valuation.tsx", changefreq: "monthly", priority: "0.8" },
  { path: "/guides", file: "app/guides/index.tsx", changefreq: "weekly", priority: "0.6" },
  { path: "/about", file: "app/about.tsx", changefreq: "yearly", priority: "0.4" },
  { path: "/careers", file: "app/careers.tsx", changefreq: "monthly", priority: "0.4" },
  { path: "/resources/stamp-duty-tax-guide", file: "app/resources/stamp-duty-tax-guide.tsx", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", file: "app/privacy.tsx", changefreq: "yearly", priority: "0.2", lastmod: LEGAL_UPDATED },
  { path: "/terms", file: "app/terms.tsx", changefreq: "yearly", priority: "0.2", lastmod: LEGAL_UPDATED },
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
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

function source(file) {
  return readFileSync(resolve(ROOT, file), "utf8");
}

function slugsIn(file) {
  const slugs = [...new Set([...source(file).matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]))];
  if (slugs.length === 0) throw new Error(`no slugs found in ${file}`);
  return slugs;
}

/** The legal pages' "Last updated" date, e.g. const UPDATED = "20 October 2026". */
function legalUpdated() {
  const match = source("src/content/legal.ts").match(/const UPDATED = "([^"]+)"/);
  // Read as UTC, so the day cannot shift with the build machine's time zone.
  return match ? isoDay(`${match[1]} UTC`) : null;
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

/**
 * Each curated guide's slug and the day it last changed: `updatedAt` when the
 * figures were last checked, else `publishedAt`. Each guide's fields sit
 * between its `slug:` and the next guide's.
 */
function guides() {
  const text = source("src/content/curatedGuides.ts");
  const starts = [...text.matchAll(/slug:\s*"([^"]+)"/g)];
  if (starts.length === 0) throw new Error("no slugs found in src/content/curatedGuides.ts");
  return starts.map((match, index) => {
    const body = text.slice(match.index, starts[index + 1]?.index ?? text.length);
    const date = body.match(/updatedAt:\s*"([^"]+)"/)?.[1] ?? body.match(/publishedAt:\s*"([^"]+)"/)?.[1];
    return { slug: match[1], lastmod: isoDay(date) };
  });
}

/** The build snapshot in an exported page's HTML, parsed; null when the page has none. */
function pageSnapshot(...segments) {
  const file = resolve(DIST, ...segments);
  if (!existsSync(file)) return null;
  const block = readFileSync(file, "utf8").match(/<script[^>]*\bid="build-snapshot"[^>]*>([\s\S]*?)<\/script>/);
  return block ? JSON.parse(block[1]) : null;
}

/**
 * The listing pages the export wrote, with the day each listing last changed.
 * A page with no snapshot is left out: the "[id]" shell, /property/create, and
 * a listing the build could not fetch, which exports noindex until the next
 * build.
 */
function exportedListings() {
  const dir = resolve(DIST, "property");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".html"))
    .sort()
    .flatMap((name) => {
      const detail = pageSnapshot("property", name);
      return detail ? [{ id: name.slice(0, -".html".length), lastmod: isoDay(detail.updated_at || detail.created_at) }] : [];
    });
}

/**
 * What the export saw for an area page: its listings, or null when the API
 * failed at build time. Unknown is kept in the sitemap; only an area known to
 * be empty is left out.
 */
function areaListings(intent, slug) {
  return pageSnapshot(intent, `${slug}.html`);
}

function newestDay(items) {
  const days = items.map((item) => isoDay(item.updated_at || item.created_at)).filter(Boolean).sort();
  return days.at(-1) ?? null;
}

function urlEntry(path, { lastmod, changefreq, priority } = {}) {
  let entry = `  <url>\n    <loc>${escapeXml(DOMAIN + path)}</loc>\n`;
  if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) entry += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) entry += `    <priority>${priority}</priority>\n`;
  return `${entry}  </url>\n`;
}

function main() {
  if (!existsSync(DIST)) throw new Error(`${DIST} does not exist: run expo export first`);
  const guideList = guides();
  const areas = slugsIn("src/content/areas.ts");
  // When the API was down at build time no listing pages were exported, and
  // none are listed: the "[id]" shell that serves them is noindex.
  const listings = exportedListings();
  if (listings.length === 0) console.warn("WARNING: no listing pages were exported, so the sitemap lists none.");

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const page of STATIC_PAGES) xml += urlEntry(page.path, { ...page, lastmod: page.lastmod ?? gitDay(page.file) });

  let areaPages = 0;
  let unknown = 0;
  const empty = [];
  for (const intent of AREA_INTENTS) {
    for (const slug of areas) {
      const seen = areaListings(intent, slug);
      // Left out only when the build saw it with no listings. When the build could not fetch it,
      // it stays: one failed request must not drop every area page from the sitemap.
      if (seen && (seen.total ?? 0) <= 0) {
        empty.push(`${intent}/${slug}`);
        continue;
      }
      if (!seen) unknown += 1;
      areaPages += 1;
      xml += urlEntry(`/${intent}/${encodeURIComponent(slug)}`, {
        lastmod: seen ? newestDay(seen.items ?? []) : null,
        changefreq: "daily",
        priority: "0.8",
      });
    }
  }
  for (const guide of guideList) {
    xml += urlEntry(`/guides/${encodeURIComponent(guide.slug)}`, { lastmod: guide.lastmod, changefreq: "monthly", priority: "0.6" });
  }
  for (const listing of listings) {
    xml += urlEntry(`/property/${encodeURIComponent(listing.id)}`, { lastmod: listing.lastmod, changefreq: "weekly", priority: "0.7" });
  }
  xml += `</urlset>\n`;

  writeFileSync(resolve(DIST, "sitemap.xml"), xml, "utf8");
  console.log(
    `sitemap: ${STATIC_PAGES.length} pages, ${areaPages} area pages (${empty.length} with no listings left out` +
      `${unknown ? `, ${unknown} kept without build-time data` : ""}), ${guideList.length} guides, ${listings.length} listings`,
  );
}

try {
  main();
} catch (error) {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
}
