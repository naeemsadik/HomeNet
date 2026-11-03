# Homenet BD logo

| File | Use |
|---|---|
| `homenet-logo.svg` / `homenet-logo-2400.png` | Main lockup (tile + wordmark) on white: website header, documents, email, invoices |
| `homenet-logo-reverse.svg` / `homenet-logo-reverse-2400.png` | On ink (`#0B1A17`) or any dark background: white wordmark |
| `homenet-wordmark.svg` | "Homenet BD" alone, for layouts that already show the tile |
| `homenet-mark.svg` / `homenet-mark-1024.png` | The house-and-magnifier alone in mint, transparent background: stamps, watermarks |
| `homenet-icon.svg` / `homenet-icon-512.png` / `-1024.png` | Rounded mint tile: app tile, social avatars |
| `homenet-favicon.svg` | Browser tab (same artwork as the icon) |

The artwork is traced from the approved final logo (November 2026), so the SVGs need no font installed.

The app draws the same artwork from `src/components/BrandArt.tsx` (header, sign-in card). The launcher icons, splash, favicon and share images in `assets/`, `public/` and `store/` are rendered from these files. Store and launcher icons (`assets/icon.png`, `store/play-icon-512.png`) are the full-bleed square, because the OS applies its own corner mask.

## Colours
These are the app's own colours (`src/theme/colors.ts`).

| Name | Hex | Use |
|---|---|---|
| Mint | `#04cf92` | Tile, house-and-magnifier mark, wordmark |
| White | `#FFFFFF` | House and magnifier on the tile; wordmark on dark |
| Ink | `#0B1A17` | Background of the reverse logo |

## Rules
- Keep clear space of at least a quarter of the tile's width on every side.
- Do not recolour or stretch the logo.
- Do not use the full lockup below about 120px wide; use the icon or mark instead.
