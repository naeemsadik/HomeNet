// Renders verification stills at given seconds: node scripts/stills.mjs 1.5 7.9 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "HomeNetPromo", browserExecutable });
for (const s of process.argv.slice(2)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  await renderStill({ serveUrl, composition, frame, output: `out/check_${s}.png`, browserExecutable, scale: 0.5 });
  console.log("rendered", s);
}
