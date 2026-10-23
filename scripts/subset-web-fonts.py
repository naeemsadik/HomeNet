"""Latin subsets of the app's fonts, for the web build only.

The full @expo-google-fonts TTFs carry Cyrillic, Greek and Vietnamese the UI
never renders: Inter is ~340 KB per weight (~165 KB over the wire, brotli).
The subsets keep Basic Latin, Latin-1, Latin Extended-A, general punctuation,
arrows and a few symbols; anything else (including Bengali, which Inter never
had) falls back to the system font as before. Vercel brotli-compresses TTF,
so this is roughly WOFF2-sized on the wire without a WOFF2 toolchain.

Native builds keep the full fonts (app/_layout.tsx picks per platform).

Run after upgrading @expo-google-fonts (needs `pip install fonttools`):
    python scripts/subset-web-fonts.py
"""

from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fonts" / "web"

FONTS = {
    "inter": ["400Regular", "500Medium", "600SemiBold", "700Bold", "800ExtraBold"],
    "plus-jakarta-sans": ["600SemiBold", "700Bold", "800ExtraBold"],
}
FAMILY_PREFIX = {"inter": "Inter", "plus-jakarta-sans": "PlusJakartaSans"}

UNICODES = (
    list(range(0x0000, 0x0180))  # Basic Latin, Latin-1, Latin Extended-A
    + list(range(0x2000, 0x2070))  # General Punctuation: dashes, quotes, bullet, ellipsis
    + list(range(0x2190, 0x219A))  # Arrows
    + [0x20AC, 0x2122, 0x2212, 0x2215, 0xFEFF, 0xFFFD]  # euro, trade mark, minus, slash
)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    options = subset.Options()
    # fontTools' default layout features: kerning, standard ligatures,
    # contextual alternates. The UI uses no stylistic sets or tabular figures.
    options.hinting = False  # browsers other than old Windows GDI ignore it
    options.name_IDs = ["*"]
    for package, weights in FONTS.items():
        for weight in weights:
            name = f"{FAMILY_PREFIX[package]}_{weight}"
            source = ROOT / "node_modules" / "@expo-google-fonts" / package / weight / f"{name}.ttf"
            font = subset.load_font(str(source), options)
            subsetter = subset.Subsetter(options)
            subsetter.populate(unicodes=UNICODES)
            subsetter.subset(font)
            target = OUT / f"{name}.ttf"
            subset.save_font(font, str(target), options)
            print(f"{name}: {source.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
