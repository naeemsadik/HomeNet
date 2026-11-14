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
  fewer than 5. Only `ok` drives an estimate. `largestSourceShare` says how much
  one site decides a figure: above 75% the estimate is capped at medium confidence
  and says most of the listings come from one site.
- **Apartments only.** The listings are apartments, so the estimate uses them for an
  apartment and calls anything else a rough guide.
- **The pipeline** is `src/features/valuation/pipeline/benchmarkPipeline.ts`,
  with tests beside it. To add a source, write a reader for its CSV columns.
- **How the estimate uses it:** `valuationService.ts` takes the median for an `ok` area
  and keeps its built-in rate elsewhere, marked as a rough guide.
