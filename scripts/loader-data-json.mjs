// Expo Router puts each pre-rendered page's loader data in an inline script:
//
//   <script id="expo-router-data">globalThis.__EXPO_ROUTER_LOADER_DATA__ = JSON.parse("…");</script>
//
// script-src has no 'unsafe-inline' and the data differs per page, so no hash
// can allow it. This rewrites each one, after `expo export`, into a JSON data
// block the browser never runs:
//
//   <script type="application/json" id="expo-router-data">…</script>
//
// src/lib/buildSnapshot.web.tsx reads the block back onto the global before
// React hydrates. If an Expo upgrade changes the script's shape, this fails the
// build rather than ship pages whose data the browser would block.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = process.argv[2] || "dist";
const SCRIPT = /<script id="expo-router-data">([\s\S]*?)<\/script>/g;
const CONTENTS = /^globalThis\.__EXPO_ROUTER_LOADER_DATA__ = JSON\.parse\(("(?:[^"\\]|\\.)*")\);$/;

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

let rewritten = 0;
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('id="expo-router-data"')) continue;
  const out = html.replace(SCRIPT, (_tag, body) => {
    const match = body.trim().match(CONTENTS);
    if (!match) {
      console.error(`loader-data-json: unexpected loader script in ${file}: ${body.slice(0, 120)}`);
      process.exit(1);
    }
    // Expo's string is JSON with <, >, & and the line separators escaped, so it
    // cannot close the tag early. Parse once to prove it is valid JSON.
    const json = JSON.parse(match[1]);
    JSON.parse(json);
    return `<script type="application/json" id="expo-router-data">${json}</script>`;
  });
  writeFileSync(file, out, "utf8");
  rewritten += 1;
}
console.log(`loader-data-json: ${rewritten} pages carry their loader data as a JSON block.`);
