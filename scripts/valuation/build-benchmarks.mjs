#!/usr/bin/env node
/**
 * Builds the valuation price benchmarks from scraped listing CSVs.
 *
 *   npm run valuation:benchmarks -- --input <folder> --as-of 2026-10-30
 *
 * <folder> holds one subfolder per source, each with its listings CSV:
 *   bproperty/bproperty_listings.csv   bikroy/bikroy_listings.csv
 *   jominly/jominly_listings.csv       aabason/aabason_listings.csv
 *
 * Keep the raw CSVs outside this repository: they are scraped listings. The
 * output holds only counts, medians and quartiles per area, and is safe to commit.
 *
 * Options:
 *   --input   folder with the source subfolders (required)
 *   --as-of   date the listings were collected, YYYY-MM-DD (required; the CSVs'
 *             own dates are mostly blank or relative, so they cannot be used)
 *   --out     JSON to write (default src/features/valuation/data/areaBenchmarks.json)
 *   --report  also write the text report to this file
 *
 * Runs with Node 22.6 or newer: the npm script passes --experimental-strip-types.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildBenchmarks,
  csvToRecords,
  readAabason,
  readBikroy,
  readBproperty,
  readJominly,
  renderReport,
} from "../../src/features/valuation/pipeline/benchmarkPipeline.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const [key, inline] = arg.slice(2).split("=");
    args[key] = inline ?? argv[++i];
  }
  return args;
}

function fail(message) {
  console.error(`build-benchmarks: ${message}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
if (!args.input) fail("--input <folder> is required");
if (!args["as-of"] || !/^\d{4}-\d{2}-\d{2}$/.test(args["as-of"])) fail("--as-of YYYY-MM-DD is required");

const input = resolve(args.input);
const out = resolve(args.out ?? join(root, "src/features/valuation/data/areaBenchmarks.json"));

const readers = {
  bproperty: readBproperty,
  bikroy: readBikroy,
  jominly: readJominly,
  aabason: readAabason,
};

const bySource = {};
for (const [name, read] of Object.entries(readers)) {
  const file = join(input, name, `${name}_listings.csv`);
  if (!existsSync(file)) {
    console.warn(`build-benchmarks: ${file} not found, skipping ${name}`);
    continue;
  }
  bySource[name] = read(csvToRecords(readFileSync(file, "utf8")));
}
if (Object.keys(bySource).length === 0) fail(`no source CSVs found under ${input}`);

const { file, unmapped } = buildBenchmarks(bySource, { asOf: args["as-of"] });

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);

const report = renderReport(file, unmapped);
if (args.report) writeFileSync(resolve(args.report), `${report}\n`);

console.log(report);
console.log(`\nWrote ${out}`);
