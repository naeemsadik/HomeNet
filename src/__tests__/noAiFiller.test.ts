import fs from "node:fs";
import path from "node:path";

/**
 * docs/AGENT_RULES.md 2.3: no sparkle icons, no promo callouts that repeat what
 * the page already says, no invented "AI" figures. A sparkle beside a label says
 * nothing and makes the product read as generated; these guard against it
 * coming back.
 */
const SRC = path.join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const files = sourceFiles(SRC).filter((f) => !f.endsWith(path.join("components", "icons.ts")));
const read = (f: string) => fs.readFileSync(f, "utf8");
const rel = (f: string) => path.relative(SRC, f).split(path.sep).join("/");

describe("no AI filler in the interface", () => {
  it("uses no sparkle icon", () => {
    const offenders = files.filter((f) => /\bSparkles\b/.test(read(f))).map(rel);
    expect(offenders).toEqual([]);
  });

  it("has no promo callout on the sign-in card", () => {
    expect(read(path.join(SRC, "features/auth/components/AuthCard.tsx"))).not.toMatch(/promoCard|auth\.promoText/);
  });

  it("shows no 'AI value' that is the listed price times a factor", () => {
    expect(read(path.join(SRC, "features/property/screens/MyPropertiesScreen.tsx"))).not.toMatch(/aiValue/);
  });

  it("has no brand-green glow shadow on a button", () => {
    const glows = files
      .filter((f) => /\.(tsx|styles\.ts)$/.test(f))
      .filter((f) => /boxShadow:\s*["'][^"']*rgba\(4,\s*207,\s*146/.test(read(f)))
      .map(rel);
    expect(glows).toEqual([]);
  });
});
