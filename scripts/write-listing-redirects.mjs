// Old listing links (/property/<uuid>) keep working after listing URLs became
// /property/<title words>-<uuid>.
//
// The site is a static export, so there is no server to answer a 301. For each
// listing the export wrote, this writes dist/property/<uuid>.html: a page that
// forwards at once (meta refresh, which Google treats as a permanent redirect)
// and names the new URL as canonical. It runs no script, so the CSP needs no change.
//
// A listing created after the build has no file here: its old link falls
// through to the "[id]" shell (vercel.json rewrite), which loads the listing and
// replaces the URL in the browser.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, process.argv[2] || "dist");
const DOMAIN = "https://www.homenetbd.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// The segments listingSegment builds from a title: lowercase words and the uuid.
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function snapshotFromHtml(html) {
  const block = html.match(/<script[^>]*\bid="build-snapshot"[^>]*>([\s\S]*?)<\/script>/);
  try {
    return block ? JSON.parse(block[1]) : null;
  } catch {
    return null;
  }
}

// The refresh and link are relative, so a preview deploy forwards within itself;
// only the canonical names the production domain.
function redirectPage(path, title) {
  const url = escapeHtml(path);
  const canonical = escapeHtml(DOMAIN + path);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)} | HomeNet BD</title>
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${canonical}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;box-sizing:border-box;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center}a{color:#0F6D55;overflow-wrap:anywhere}@media (prefers-color-scheme:dark){a{color:#04cf92}}</style>
</head>
<body>
<p>This listing has a new address.<br><a href="${url}">Open the listing</a></p>
</body>
</html>
`;
}

function main() {
  const dir = resolve(DIST, "property");
  if (!existsSync(dir)) return console.log("listing redirects: no dist/property, nothing to do");
  let written = 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".html") || name.startsWith("[")) continue;
    const segment = name.slice(0, -".html".length);
    const snapshot = snapshotFromHtml(readFileSync(resolve(dir, name), "utf8"));
    const id = snapshot?.id;
    // Only a page exported at a title URL needs one; the id comes from the API,
    // so it is checked before it becomes a file name.
    if (typeof id !== "string" || !UUID.test(id) || segment === id || !SEGMENT.test(segment)) continue;
    const target = resolve(dir, `${id}.html`);
    if (existsSync(target)) continue;
    writeFileSync(target, redirectPage(`/property/${segment}`, String(snapshot.title || "Listing")), "utf8");
    written += 1;
  }
  console.log(`listing redirects: ${written} old /property/<id> links forward to their new URLs`);
}

main();
