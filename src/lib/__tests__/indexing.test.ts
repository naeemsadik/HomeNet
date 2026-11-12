import { execFileSync } from "child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const ROOT = resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");
const vercel = JSON.parse(read("vercel.json"));

function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (name === "__tests__" || name === "locales") return [];
    return statSync(join(ROOT, path)).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("what Google is asked to index", () => {
  it("redirects the alias pages on the server, so no empty stub carries the homepage's title", () => {
    const redirects = Object.fromEntries(vercel.redirects.map((r: { source: string; destination: string }) => [r.source, r.destination]));
    expect(redirects["/valuation"]).toBe("/instant-valuation");
    expect(redirects["/search"]).toBe("/buy");
    expect(redirects["/home"]).toBe("/");
  });

  it("does not inject a blanket canonical Link header on /property/:id responses, so deleted/unknown IDs on the 200 shell never carry a self-referencing canonical", () => {
    const rule = vercel.headers.find((h: { source: string }) => h.source.startsWith("/property/:id"));
    expect(rule).toBeUndefined();
  });

  it("answers an unknown guide with a real 404: every guide is exported, so there is no shell rewrite", () => {
    expect(vercel.rewrites.map((r: { source: string }) => r.source)).not.toContain("/guides/:slug");
  });

  it("does not link to an alias page that redirects", () => {
    const aliases = ["/valuation", "/search", "/home"];
    const offenders = [...sourceFiles("src"), ...sourceFiles("app")].filter((file) => {
      const text = read(file);
      return aliases.some((alias) => new RegExp(`(href|push|replace)[:=(\\s{]+["']${alias}["'?]`).test(text));
    });
    expect(offenders).toEqual([]);
  });

  it("links the area pages from the footers by their own address, not a ?location= copy of /buy", () => {
    for (const file of ["src/components/Footer.tsx", "src/components/MobileFooter.tsx"]) {
      const text = read(file);
      expect(text).not.toMatch(/href: "\/buy\?(location|city)=/);
      expect(text).toContain('href: "/buy/gulshan"');
      expect(text).toContain('href: "/areas"');
    }
  });

  it("lists the areas hub in the sitemap and leaves out /explore, which copies /buy", () => {
    const script = read("scripts/generate-sitemap.mjs");
    expect(script).toContain('path: "/areas"');
    expect(script).not.toContain('path: "/explore"');
  });

  describe("area pages in the sitemap", () => {
    // Runs the real generator on a small fake export: Dhaka seen empty for sale, Dhaka seen with
    // listings to rent, Chattogram not fetched at all (the API failed during the build).
    const sitemap = (() => {
      const dist = mkdtempSync(join(tmpdir(), "sitemap-"));
      const page = (intent: string, slug: string, snapshot: object) => {
        mkdirSync(join(dist, intent), { recursive: true });
        writeFileSync(
          join(dist, intent, `${slug}.html`),
          `<html><script type="application/json" id="build-snapshot">${JSON.stringify(snapshot)}</script></html>`,
        );
      };
      page("buy", "dhaka", { total: 0, items: [] });
      page("rent", "dhaka", { total: 3, items: [{ updated_at: "2026-11-01T00:00:00Z" }] });
      execFileSync(process.execPath, [join(ROOT, "scripts/generate-sitemap.mjs"), dist], { cwd: ROOT, stdio: "pipe" });
      const xml = readFileSync(join(dist, "sitemap.xml"), "utf8");
      rmSync(dist, { recursive: true, force: true });
      return xml;
    })();

    it("leaves out an area the build saw with no listings", () => {
      expect(sitemap).not.toContain("<loc>https://www.homenetbd.com/buy/dhaka</loc>");
    });

    it("lists an area with listings, dated by its newest one", () => {
      expect(sitemap).toMatch(/<loc>https:\/\/www\.homenetbd\.com\/rent\/dhaka<\/loc>\n    <lastmod>2026-11-01<\/lastmod>/);
    });

    it("keeps an area the build could not fetch, so one failed request cannot drop every area page", () => {
      expect(sitemap).toContain("<loc>https://www.homenetbd.com/buy/chattogram</loc>");
      expect(sitemap).toContain("<loc>https://www.homenetbd.com/rent/chattogram</loc>");
    });
  });

  describe("property pages in the sitemap", () => {
    const sitemap = (() => {
      const dist = mkdtempSync(join(tmpdir(), "sitemap-props-"));
      mkdirSync(join(dist, "property"), { recursive: true });
      const prop = (name: string, html: string) => writeFileSync(join(dist, "property", `${name}.html`), html);
      prop(
        "active-1",
        `<html><script type="application/json" id="build-snapshot">${JSON.stringify({ id: "active-1", status: "active", updated_at: "2026-11-05T00:00:00Z" })}</script></html>`,
      );
      prop(
        "archived-1",
        `<html><script type="application/json" id="build-snapshot">${JSON.stringify({ id: "archived-1", status: "archived", updated_at: "2026-11-05T00:00:00Z" })}</script></html>`,
      );
      prop(
        "noindex-1",
        `<html><head><meta name="robots" content="noindex, follow" /></head><script type="application/json" id="build-snapshot">${JSON.stringify({ id: "noindex-1", status: "active" })}</script></html>`,
      );
      prop("no-id-1", `<html><script type="application/json" id="build-snapshot">${JSON.stringify({})}</script></html>`);
      prop("missing-snapshot", `<html><body>Loading...</body></html>`);
      prop("[id]", `<html><body>Shell</body></html>`);
      prop("create", `<html><body>Create</body></html>`);
      prop("edit", `<html><body>Edit</body></html>`);
      execFileSync(process.execPath, [join(ROOT, "scripts/generate-sitemap.mjs"), dist], { cwd: ROOT, stdio: "pipe" });
      const xml = readFileSync(join(dist, "sitemap.xml"), "utf8");
      rmSync(dist, { recursive: true, force: true });
      return xml;
    })();

    it("includes only active, existing properties with their lastmod date", () => {
      expect(sitemap).toMatch(
        /<loc>https:\/\/www\.homenetbd\.com\/property\/active-1<\/loc>\n    <lastmod>2026-11-05<\/lastmod>/,
      );
    });

    it("excludes archived, noindex, shell, form, and missing-snapshot property pages", () => {
      for (const excluded of ["archived-1", "noindex-1", "no-id-1", "missing-snapshot", "%5Bid%5D", "[id]", "create", "edit"]) {
        expect(sitemap).not.toContain(`/property/${excluded}`);
      }
    });
  });

  it("keeps a listing the build could not fetch out of the index, so one failed fetch cannot fail the deploy", () => {
    // Exported as the loading state, with no <h1>. Were it indexable, check-seo would stop the build.
    const screen = read("src/features/property/screens/PropertyDetailScreen.tsx");
    expect(screen).toMatch(/isLoading && !property[\s\S]{0,400}<PageMeta [^>]*\bnoindex\b/);
  });

  it("marks missing/deleted property pages noindex, follow and suppresses self-referencing canonicals", () => {
    const screen = read("src/features/property/screens/PropertyDetailScreen.tsx");
    expect(screen).toMatch(/if \(!property\)[\s\S]{0,400}robots="noindex, follow"[\s\S]{0,120}noCanonical/);
  });

  it("includes automated IndexNow submission in the post-build / sitemap pipeline", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts.build).toContain("scripts/submit-indexnow.mjs");
    expect(pkg.scripts.sitemap).toContain("scripts/submit-indexnow.mjs");
    expect(pkg.scripts.indexnow).toBe("node scripts/submit-indexnow.mjs");
  });

  it("does not use Expo's route loaders, which re-bundle the whole app for every page and failed the deploy", () => {
    expect(read("app.json")).not.toContain("unstable_useServerDataLoaders");
  });
});
