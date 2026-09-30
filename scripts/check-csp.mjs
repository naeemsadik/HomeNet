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
//
// connect-src is checked against the API address the app is built with
// (EXPO_PUBLIC_API_BASE_URL, else .env, else the default in apiClient.ts). A
// mismatch would ship a site whose every API request the browser blocks.
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
const connectSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("connect-src ")) || "";

function builtApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  try {
    // Expo reads .env at build time; real environment variables win, as here.
    const line = readFileSync(".env", "utf8").split(String.fromCharCode(10)).map((l) => l.trim()).find((l) => l.startsWith("EXPO_PUBLIC_API_BASE_URL="));
    const value = line?.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  } catch {}
  const source = readFileSync("src/services/apiClient.ts", "utf8");
  return source.match(/PRODUCTION_API_BASE_URL\s*=\s*"([^"]+)"/)?.[1];
}

const apiBase = builtApiBaseUrl();
let apiOrigin;
try {
  apiOrigin = new URL(apiBase).origin;
} catch {
  console.error(`check-csp: cannot read an API address from EXPO_PUBLIC_API_BASE_URL (got ${JSON.stringify(apiBase)}).`);
  process.exit(1);
}
if (!connectSrc.split(/\s+/).includes(apiOrigin)) {
  console.error(`check-csp: the app is built to call ${apiOrigin}, but connect-src in vercel.json does not allow it:`);
  console.error(`  ${connectSrc}`);
  console.error("The browser would block every API request. Add the origin to connect-src, or fix EXPO_PUBLIC_API_BASE_URL.");
  process.exit(1);
}
console.log(`check-csp: API address ${apiOrigin} is allowed by connect-src.`);

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
