// Checks the exported HTML the way a crawler that runs no JavaScript sees it.
// Every page meant to be indexed (no robots noindex, canonical pointing at
// itself) must have a title, a canonical URL and exactly one <h1>, and must not
// claim a Bangla alternate that does not exist. Those fail the build. Titles
// over 60 characters and descriptions outside 120-160 are reported as warnings:
// they are copy decisions, not breakage.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const DIST = process.argv[2] || "dist";
const SITE = "https://www.homenetbd.com";
const SKIP = new Set(["404.html", "+not-found.html"]);
// Paths Vercel redirects before any file is served (/home, /search, ...).
const REDIRECTED = new Set(JSON.parse(readFileSync("vercel.json", "utf8")).redirects.map((rule) => rule.source));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name.startsWith("_") ? [] : htmlFiles(path);
    return name.endsWith(".html") && !SKIP.has(name) ? [path] : [];
  });
}

const decode = (text) =>
  text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** The URL a file is served at: dist/buy/gulshan.html is /buy/gulshan, dist/index.html is the root. */
function urlOf(file) {
  const path = relative(DIST, file).split(sep).join("/").replace(/\.html$/, "");
  return path === "index" ? SITE : `${SITE}/${path.replace(/\/index$/, "")}`;
}

const errors = [];
const warnings = [];
let checked = 0;
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  // Not a page the app rendered: a plain file from public/ (Google's verification file).
  if (!html.includes('id="root"')) continue;
  if (/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) continue;
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  const url = urlOf(file);
  if (REDIRECTED.has(url.slice(SITE.length))) continue;
  // A page canonicalised to another (say /explore to /buy) is not indexed under its own URL.
  if (canonical && canonical !== url) continue;
  checked += 1;

  const where = relative(DIST, file);
  const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  const description = decode(html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] ?? "").trim();
  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;

  if (!title) errors.push(`${where}: no <title>`);
  if (!canonical) errors.push(`${where}: no canonical link`);
  if (h1s !== 1) errors.push(`${where}: ${h1s} <h1> elements, expected exactly 1`);
  if (/hreflang="bn-BD"/i.test(html)) errors.push(`${where}: claims a bn-BD alternate, but Bangla has no URL of its own`);

  if (title.length > 60) warnings.push(`${where}: title is ${title.length} characters (over 60): ${title}`);
  if (!description) warnings.push(`${where}: no meta description`);
  else if (description.length < 120 || description.length > 160) {
    warnings.push(`${where}: description is ${description.length} characters (want 120-160)`);
  }
}

if (warnings.length) {
  console.warn(`check-seo: ${warnings.length} warnings:`);
  for (const warning of warnings) console.warn(`  ${warning}`);
}
if (errors.length) {
  console.error(`check-seo: ${errors.length} problems on indexable pages:`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`check-seo: ${checked} indexable pages, each with a title, a canonical and one <h1>.`);
