# Homenet BD logo

| File | Use |
|---|---|
| `homenet-logo.svg` / `homenet-logo-2400.png` | Main logo on white: website header, documents, email, invoices |
| `homenet-logo-reverse.svg` / `homenet-logo-reverse-2400.png` | On ink (`#0B1A17`) or any dark background |
| `homenet-mark.svg` / `homenet-mark-1024.png` | The magnifier-and-house alone, transparent background: stamps, watermarks, small spaces |
| `homenet-icon.svg` / `homenet-icon-512.png` / `-1024.png` | App icon and social avatars (mint tile) |
| `homenet-favicon.svg` | Browser tab and other sizes under 48px (heavier lines) |

All text is converted to outlines, so the SVGs look the same on any machine, with no font installed.

The app draws the same artwork from `src/components/BrandArt.tsx` (header, sign-in card). The launcher icons, splash, favicon and share images in `assets/`, `public/` and `store/` are rendered from these files.

## Colours
These are the app's own colours (`src/theme/colors.ts`).

| Name | Hex | Use |
|---|---|---|
| Mint | `#04cf92` | Ring, "net", icon tile (gradient to `#03b57f`) |
| Ink | `#0B1A17` | "Home", the house; background of the reverse logo |
| Deep green | `#0F6D55` | "BD" |
| Muted | `#5C6B66` | Tagline |
| Soft mint | `#C4E4D5` | "BD" and tagline on dark |

On dark backgrounds "Home" and the house are white.

## Rules
- Keep clear space of at least the house's width on every side.
- Do not recolour or stretch the logo.
- Do not use the full lockup below about 120px wide; use the icon or mark instead.
