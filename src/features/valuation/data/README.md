# Valuation benchmark data

`areaBenchmarks.json` holds asking-price statistics per area, built from scraped
listing sites. It holds only counts, medians and quartiles. No listing, URL,
title or photo is in it, and none may be added.

It is generated, not edited by hand:

```bash
npm run valuation:benchmarks -- --input <folder with the source CSVs> --as-of 2026-10-30
```

The raw CSVs stay outside this repository. They are scraped listings, and the
team's rule is to use them for aggregate statistics only. Check each site's
terms before adding a source.

- **What the figures are:** asking prices in Taka per sqft (sale) and Taka per
  sqft per month (rent), for apartments that state both a price and a size.
  They are not sale prices.
- **Status:** `ok` is 15 or more listings, `thin` is 5 to 14, `insufficient` is
  fewer than 5. Only `ok` should drive an estimate. `largestSourceShare` says how
  much one site decides a figure; near 1 means treat it with care.
- **The pipeline** is `src/features/valuation/pipeline/benchmarkPipeline.ts`,
  with tests beside it. To add a source, write a reader for its CSV columns.
- **Not wired into the estimate yet.** `valuationService.ts` still uses its own
  hard-coded rates.
