// Fails the build if the exported HTML contains an inline <script> whose hash
// isn't allowed by the Content-Security-Policy in vercel.json.
//
// script-src has no 'unsafe-inline', so the only inline script the site runs is
// Expo Router's hydration flag, allowed by its sha256 hash. If an Expo upgrade
// changes that script, the browser would silently block it in production; this
// turns that into a failed build with the hash to add instead.
//
// script-src also carries a hash this check cannot see: Google Translate's
// sandbox iframe (srcdoc, sha256-R6kjt5…) runs one inline script and loads
// translations as scripts from translate-pa.googleapis.com. Without both,
// Bangla silently stays English. If Google changes that script, the console
// shows a CSP error on about:srcdoc with the new hash; swap it in vercel.json.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = process.argv[2] || "dist";
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const csp = vercel.headers
  .flatMap((rule) => rule.headers)
  .find((h) => h.key === "Content-Security-Policy")?.value;
if (!csp) {
  console.error("check-csp: no enforced Content-Security-Policy in vercel.json");
  process.exit(1);
}
const scriptSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src ")) || "";
const allowsInline = scriptSrc.includes("'unsafe-inline'");
const allowed = new Set([...scriptSrc.matchAll(/'sha256-([^']+)'/g)].map((m) => m[1]));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

const missing = new Map();
let inlineCount = 0;
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const body = m[1];
    if (!body.trim()) continue;
    inlineCount++;
    const hash = createHash("sha256").update(body, "utf8").digest("base64");
    if (!allowsInline && !allowed.has(hash)) missing.set(hash, { file, snippet: body.slice(0, 80) });
  }
}

if (missing.size) {
  console.error("check-csp: inline scripts blocked by script-src in vercel.json:");
  for (const [hash, { file, snippet }] of missing) {
    console.error(`  'sha256-${hash}'  (${file}: ${snippet})`);
  }
  console.error("Add the hash(es) above to script-src, or remove the inline script.");
  process.exit(1);
}
console.log(`check-csp: ${inlineCount} inline scripts, all allowed by script-src.`);
