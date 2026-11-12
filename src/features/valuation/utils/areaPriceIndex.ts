import areaBenchmarkData from "../data/areaBenchmarks.json";

/**
 * What the public Price Index shows: only the areas the estimate itself trusts
 * (status "ok", enough asking prices), straight from areaBenchmarks.json. No
 * trend, no transaction claim, nothing the file does not hold.
 */
export interface AreaPriceRow {
  key: string;
  listings: number;
  /** Taka per sqft: the middle asking price. */
  median: number;
  /** The middle half of asking prices runs from p25 to p75. */
  p25: number;
  p75: number;
  /** Most of the listings come from one site, so the figure leans on it. */
  mostlyOneSite: boolean;
}

export interface AreaPriceIndex {
  /** When the listings were collected, as written in the file (YYYY-MM-DD). */
  asOf: string;
  listingsKept: number;
  siteCount: number;
  published: AreaPriceRow[];
  /** Areas with some listings but too few to publish a price. */
  building: { key: string; listings: number }[];
}

interface SaleStats {
  n: number;
  median: number;
  p25: number;
  p75: number;
  largestSourceShare?: number;
  status: "ok" | "thin" | "insufficient";
}

interface BenchmarkFile {
  asOf: string;
  sources: { name: string; listingsRead: number }[];
  totals: { kept: number };
  areas: Record<string, { sale?: SaleStats }>;
}

/** The same line the estimate uses: above this share from one site, say so. */
const MAX_SINGLE_SOURCE_SHARE = 0.75;

export function getAreaPriceIndex(data: BenchmarkFile = areaBenchmarkData as unknown as BenchmarkFile): AreaPriceIndex {
  const published: AreaPriceRow[] = [];
  const building: { key: string; listings: number }[] = [];

  for (const [key, area] of Object.entries(data.areas)) {
    const sale = area.sale;
    if (!sale) continue;
    if (sale.status === "ok") {
      published.push({
        key,
        listings: sale.n,
        median: sale.median,
        p25: sale.p25,
        p75: sale.p75,
        mostlyOneSite: (sale.largestSourceShare ?? 0) >= MAX_SINGLE_SOURCE_SHARE,
      });
    } else if (sale.n > 0) {
      building.push({ key, listings: sale.n });
    }
  }

  published.sort((a, b) => b.median - a.median);
  building.sort((a, b) => b.listings - a.listings || a.key.localeCompare(b.key));

  return {
    asOf: data.asOf,
    listingsKept: data.totals.kept,
    siteCount: data.sources.length,
    published,
    building,
  };
}
