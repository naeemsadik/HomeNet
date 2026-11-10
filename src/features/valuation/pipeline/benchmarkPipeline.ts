/**
 * Turns scraped listing CSVs into per-area price benchmarks for the valuation
 * estimate. It runs offline (see scripts/valuation/build-benchmarks.mjs), never
 * in the app, and its output holds only aggregates: counts, medians and
 * quartiles. No listing, URL, title or photo is carried into the output.
 *
 * This file has no imports and uses only syntax that Node can strip, so the
 * script runs it directly and the unit tests import it the same way.
 *
 * What the numbers are: asking prices, in Taka per sqft for a sale and Taka per
 * sqft per month for a rent, from the listings that state both a price and a
 * size. They are not sale prices, and the sources are not a random sample.
 */

export type SourceName = "bproperty" | "bikroy" | "jominly" | "aabason";
export type Purpose = "sale" | "rent";

export interface Listing {
  source: SourceName;
  purpose: Purpose;
  /** The area as the site wrote it, e.g. "Gulshan 2, Gulshan, Dhaka". */
  areaRaw: string;
  /** Total asking price for a sale, monthly rent for a rent, in Taka. */
  price: number;
  sizeSqft: number;
  /** A stable id from the site, when it has one, for finding duplicates. */
  id: string;
  /**
   * The listing's title. Used to find the area only when the site left its
   * location blank, never to overrule a location it did give.
   */
  areaHint?: string;
}

export interface Thresholds {
  /** At or above this many listings an area's figure is "ok". */
  minListings: number;
  /** Below minListings but at or above this it is "thin". Below it: "insufficient". */
  thinListings: number;
  minSizeSqft: number;
  maxSizeSqft: number;
  /** Sale price per sqft that is believable for Dhaka apartments, in Taka. */
  salePerSqft: { min: number; max: number };
  /** Monthly rent per sqft that is believable, in Taka. */
  rentPerSqft: { min: number; max: number };
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  minListings: 15,
  thinListings: 5,
  minSizeSqft: 200,
  maxSizeSqft: 10_000,
  salePerSqft: { min: 1_000, max: 60_000 },
  rentPerSqft: { min: 5, max: 400 },
};

// ─── CSV ────────────────────────────────────────────────────────────────────

/** Parses CSV text (quotes, doubled quotes, commas and newlines inside quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

/** CSV text as one object per row, keyed by the header. */
export function csvToRecords(text: string): Record<string, string>[] {
  const [header, ...body] = parseCsv(text);
  if (!header) return [];
  return body.map((cells) => {
    const record: Record<string, string> = {};
    header.forEach((name, i) => {
      record[name.trim()] = (cells[i] ?? "").trim();
    });
    return record;
  });
}

// ─── Parsing a price and a size ─────────────────────────────────────────────

/** "BDT   4,200,000" or "4200000.0" to 4200000. "Call for price", "" and 0 give null. */
export function parsePrice(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const digits = String(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!digits) return null;
  const amount = Number(digits[0]);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

const SQFT_PER_KATHA = 720;

/** "1450 sqft", "1,309", or a bare number to square feet. Katha counts as 720 sqft. */
export function parseSizeSqft(value: string | number | undefined | null, unit?: string): number | null {
  if (value === undefined || value === null) return null;
  const text = String(value).toLowerCase();
  const digits = text.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!digits) return null;
  const amount = Number(digits[0]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const kind = `${unit ?? ""} ${text}`;
  if (/katha/.test(kind)) return amount * SQFT_PER_KATHA;
  return amount;
}

// ─── Source readers ─────────────────────────────────────────────────────────

const lower = (s: string | undefined) => (s ?? "").trim().toLowerCase();

function toListing(
  source: SourceName,
  purpose: string,
  areaRaw: string,
  price: number | null,
  sizeSqft: number | null,
  id: string,
  areaHint: string,
): Listing | null {
  if (purpose !== "sale" && purpose !== "rent") return null;
  if (price === null || sizeSqft === null) return null;
  return { source, purpose, areaRaw, price, sizeSqft, id, areaHint };
}

export function readBproperty(rows: Record<string, string>[]): Listing[] {
  return rows.flatMap((r) => {
    if (lower(r.property_type) !== "apartment") return [];
    const listing = toListing(
      "bproperty",
      lower(r.listing_type),
      r.location_text,
      parsePrice(r.price),
      parseSizeSqft(r.area_size),
      r.listing_id,
      r.title,
    );
    return listing ? [listing] : [];
  });
}

export function readBikroy(rows: Record<string, string>[]): Listing[] {
  return rows.flatMap((r) => {
    if (lower(r.property_type) !== "apartment") return [];
    const listing = toListing(
      "bikroy",
      lower(r.listing_type),
      r.location_text,
      parsePrice(r.price_amount),
      parseSizeSqft(r.area_size_sqft),
      r.listing_url,
      r.title,
    );
    return listing ? [listing] : [];
  });
}

export function readJominly(rows: Record<string, string>[]): Listing[] {
  return rows.flatMap((r) => {
    if (lower(r.property_type) !== "apartment") return [];
    const listing = toListing(
      "jominly",
      lower(r.listing_type),
      r.location_text,
      parsePrice(r.price),
      parseSizeSqft(r.area_size, r.area_unit),
      r.listing_url,
      r.title,
    );
    return listing ? [listing] : [];
  });
}

/**
 * aabason files its listings under category paths. Only plain flats are read:
 * land-share flats are sold on a different deal, and hostels, single rooms,
 * sublets and offices are not what the estimate prices.
 */
export function readAabason(rows: Record<string, string>[]): Listing[] {
  return rows.flatMap((r) => {
    const category = lower(r.category);
    let purpose: Purpose;
    if (category === "/property/for-sale/residential/flat") purpose = "sale";
    else if (category === "/property/to-rent/residential/flat") purpose = "rent";
    else return [];
    const listing = toListing(
      "aabason",
      purpose,
      r.location,
      parsePrice(r.price),
      parseSizeSqft(r.Area),
      r.listing_id,
      r.title,
    );
    return listing ? [listing] : [];
  });
}

// ─── Area names ─────────────────────────────────────────────────────────────

/**
 * Maps a site's free-text location to an area key. Order matters: the first
 * rule that matches wins, so a place inside another (Baridhara Diplomatic Zone,
 * which is not Gulshan) is listed before the larger one. The keys of the first
 * ten match the areas the valuation engine already prices.
 */
const AREA_RULES: [string, RegExp][] = [
  ["baridhara", /baridhara|bari\s*dhara/],
  ["gulshan", /gulshan|gulshon/],
  ["banani", /banani/],
  ["dhanmondi", /dhanmondi|dhanmondy/],
  ["uttara", /uttara|uttra/],
  ["bashundhara", /b[ao]s?h?undhara/],
  ["mirpur", /mirpur/],
  ["mohammadpur", /moh?ammadpur|mohammedpur/],
  ["banasree", /banasree|banashree/],
  ["motijheel", /motijheel|moti\s*jheel/],
  ["badda", /badda/],
  ["khilgaon", /khilgaon/],
  ["khilkhet", /khilkhet/],
  ["aftabnagar", /aftab\s*nagar/],
  ["rampura", /rampura/],
  ["tejgaon", /tejgaon/],
  ["eskaton", /eskaton/],
  ["lalmatia", /lalmatia/],
  ["niketan", /niketan/],
  ["kalabagan", /kalabagan/],
  ["adabor", /adabor/],
  ["hazaribag", /hazaribag/],
  ["shyamoli", /shyamoli/],
  ["malibagh", /malibagh?/],
  ["shantinagar", /shantinagar/],
  ["kakrail", /kakrail/],
  ["bailey-road", /bailey\s*road/],
  ["basabo", /ba[sh]+abo/],
  ["mogbazar", /mogh?\s*bazar/],
  ["agargaon", /agargaon/],
  ["farmgate", /farm\s*gate/],
  ["cantonment", /cantonment/],
  ["rajarbagh", /rajarbagh/],
];

/** An area key such as "gulshan", or null when the text names no area we know. */
export function canonicalArea(raw: string): string | null {
  const text = lower(raw);
  for (const [key, pattern] of AREA_RULES) {
    if (pattern.test(text)) return key;
  }
  return null;
}

// ─── Cleaning ───────────────────────────────────────────────────────────────

export type DropReason =
  | "unmapped-area"
  | "size-out-of-range"
  | "price-per-sqft-out-of-range"
  | "duplicate";

export interface Priced {
  source: SourceName;
  purpose: Purpose;
  area: string;
  perSqft: number;
  id: string;
}

export interface CleanResult {
  kept: Priced[];
  dropped: Record<DropReason, number>;
  /** Locations that mapped to no area, with how many listings used each. */
  unmapped: { raw: string; count: number }[];
}

/**
 * Keeps the listings that can be trusted as a price per sqft. A listing is
 * dropped when its area is unknown, its size or its price per sqft is outside
 * believable bounds (this also removes a total price typed ten times too high),
 * or it repeats one already kept.
 */
export function cleanListings(listings: Listing[], limits: Thresholds = DEFAULT_THRESHOLDS): CleanResult {
  const dropped: Record<DropReason, number> = {
    "unmapped-area": 0,
    "size-out-of-range": 0,
    "price-per-sqft-out-of-range": 0,
    duplicate: 0,
  };
  const unmappedCounts = new Map<string, number>();
  const seen = new Set<string>();
  const kept: Priced[] = [];

  for (const listing of listings) {
    const area =
      canonicalArea(listing.areaRaw) ??
      (listing.areaRaw.trim() === "" && listing.areaHint ? canonicalArea(listing.areaHint) : null);
    if (!area) {
      dropped["unmapped-area"]++;
      const raw = listing.areaRaw.trim() || "(blank)";
      unmappedCounts.set(raw, (unmappedCounts.get(raw) ?? 0) + 1);
      continue;
    }
    if (listing.sizeSqft < limits.minSizeSqft || listing.sizeSqft > limits.maxSizeSqft) {
      dropped["size-out-of-range"]++;
      continue;
    }
    const perSqft = listing.price / listing.sizeSqft;
    const bounds = listing.purpose === "sale" ? limits.salePerSqft : limits.rentPerSqft;
    if (perSqft < bounds.min || perSqft > bounds.max) {
      dropped["price-per-sqft-out-of-range"]++;
      continue;
    }
    // The same site's id, or the same flat advertised twice (same area, price, size).
    const keys = [
      `${listing.source}:${listing.id}`,
      `${listing.purpose}:${area}:${listing.price}:${listing.sizeSqft}`,
    ];
    if (keys.some((k) => seen.has(k))) {
      dropped.duplicate++;
      continue;
    }
    keys.forEach((k) => seen.add(k));
    kept.push({ source: listing.source, purpose: listing.purpose, area, perSqft, id: listing.id });
  }

  const unmapped = [...unmappedCounts.entries()]
    .map(([raw, count]) => ({ raw, count }))
    .sort((a, b) => b.count - a.count || a.raw.localeCompare(b.raw));
  return { kept, dropped, unmapped };
}

// ─── Statistics ─────────────────────────────────────────────────────────────

/** A percentile (0 to 100) by linear interpolation between the closest ranks. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  return sorted[low] + (sorted[high] - sorted[low]) * (rank - low);
}

export type Status = "ok" | "thin" | "insufficient";

export interface PriceStats {
  n: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  /** How many of the n came from each source. */
  bySource: Partial<Record<SourceName, number>>;
  /** The biggest single source's share of n, 0 to 1. Near 1 means one site decides the figure. */
  largestSourceShare: number;
  status: Status;
}

const round = (value: number, places = 0) => {
  const f = 10 ** places;
  return Math.round(value * f) / f;
};

export function statsFor(items: Priced[], limits: Thresholds = DEFAULT_THRESHOLDS): PriceStats {
  const values = items.map((i) => i.perSqft).sort((a, b) => a - b);
  const bySource: Partial<Record<SourceName, number>> = {};
  for (const item of items) bySource[item.source] = (bySource[item.source] ?? 0) + 1;
  const largest = Math.max(0, ...Object.values(bySource).map((n) => n ?? 0));
  const status: Status =
    values.length >= limits.minListings ? "ok" : values.length >= limits.thinListings ? "thin" : "insufficient";
  // Rent is a small number (tens of Taka), so it keeps one decimal; sale does not need it.
  const places = items[0]?.purpose === "rent" ? 1 : 0;
  return {
    n: values.length,
    median: round(percentile(values, 50), places),
    p25: round(percentile(values, 25), places),
    p75: round(percentile(values, 75), places),
    min: round(values[0], places),
    max: round(values[values.length - 1], places),
    bySource,
    largestSourceShare: values.length === 0 ? 0 : round(largest / values.length, 2),
    status,
  };
}

export interface BenchmarkFile {
  /** What the figures are. Shown to whoever reads the file. */
  basis: string;
  asOf: string;
  generatedBy: string;
  thresholds: Thresholds;
  sources: { name: SourceName; listingsRead: number }[];
  /** Listings used and left out, over all sources. */
  totals: { read: number; kept: number; dropped: Record<DropReason, number> };
  /** Per area: Taka per sqft for a sale, Taka per sqft per month for a rent. */
  areas: Record<string, Partial<Record<Purpose, PriceStats>>>;
}

export function buildBenchmarks(
  bySource: Partial<Record<SourceName, Listing[]>>,
  options: { asOf: string; limits?: Thresholds },
): { file: BenchmarkFile; unmapped: CleanResult["unmapped"] } {
  const limits = options.limits ?? DEFAULT_THRESHOLDS;
  const all: Listing[] = [];
  const sources: BenchmarkFile["sources"] = [];
  for (const name of Object.keys(bySource) as SourceName[]) {
    const listings = bySource[name] ?? [];
    sources.push({ name, listingsRead: listings.length });
    all.push(...listings);
  }

  const { kept, dropped, unmapped } = cleanListings(all, limits);

  const grouped = new Map<string, Priced[]>();
  for (const item of kept) {
    const key = `${item.area}|${item.purpose}`;
    const list = grouped.get(key);
    if (list) list.push(item);
    else grouped.set(key, [item]);
  }

  const areas: BenchmarkFile["areas"] = {};
  for (const key of [...grouped.keys()].sort()) {
    const [area, purpose] = key.split("|") as [string, Purpose];
    (areas[area] ??= {})[purpose] = statsFor(grouped.get(key) ?? [], limits);
  }

  return {
    file: {
      basis:
        "Asking prices from listing sites, in Taka per sqft (sale) and Taka per sqft per month (rent), for apartments that state both a price and a size. Not sale prices. The sources are not a random sample.",
      asOf: options.asOf,
      generatedBy: "scripts/valuation/build-benchmarks.mjs",
      thresholds: limits,
      sources,
      totals: { read: all.length, kept: kept.length, dropped },
      areas,
    },
    unmapped,
  };
}

/** A short report for a person to read next to the JSON. */
export function renderReport(file: BenchmarkFile, unmapped: CleanResult["unmapped"], topUnmapped = 15): string {
  const lines: string[] = [];
  lines.push(`Valuation benchmarks as of ${file.asOf}`);
  lines.push("");
  lines.push(`Read ${file.totals.read} apartment listings with a price and a size; kept ${file.totals.kept}.`);
  for (const s of file.sources) lines.push(`  ${s.name}: ${s.listingsRead}`);
  lines.push(
    `Left out: ${Object.entries(file.totals.dropped)
      .map(([reason, count]) => `${count} ${reason}`)
      .join(", ")}.`,
  );
  lines.push("");
  lines.push("Area            purpose    n  median   p25-p75         status        sources (largest share)");
  for (const [area, byPurpose] of Object.entries(file.areas)) {
    for (const purpose of ["sale", "rent"] as const) {
      const s = byPurpose[purpose];
      if (!s) continue;
      const sources =
        Object.entries(s.bySource)
          .map(([name, n]) => `${name} ${n}`)
          .join(", ") + ` (${Math.round(s.largestSourceShare * 100)}%)`;
      lines.push(
        `${area.padEnd(15)} ${purpose.padEnd(8)} ${String(s.n).padStart(3)}  ${String(s.median).padStart(6)}   ` +
          `${`${s.p25}-${s.p75}`.padEnd(15)} ${s.status.padEnd(12)}  ${sources}`,
      );
    }
  }
  lines.push("");
  lines.push(`Locations that matched no area (top ${Math.min(topUnmapped, unmapped.length)} of ${unmapped.length}):`);
  for (const u of unmapped.slice(0, topUnmapped)) lines.push(`  ${String(u.count).padStart(3)}  ${u.raw}`);
  return lines.join("\n");
}
