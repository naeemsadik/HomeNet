import { readdirSync, readFileSync, statSync } from "fs";
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

  it("gives every listing URL a canonical in the response, before any script runs", () => {
    const rule = vercel.headers.find((h: { source: string }) => h.source.startsWith("/property/:id"));
    expect(rule.headers).toContainEqual({
      key: "Link",
      value: '<https://www.homenetbd.com/property/:id>; rel="canonical"',
    });
    // ...but not the listing form's own pages, which are not listings.
    expect(rule.source).toBe("/property/:id((?!(?:create|edit)$)[^/]+)");
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

  it("keeps a listing the build could not fetch out of the index, so one failed fetch cannot fail the deploy", () => {
    // Exported as the loading state, with no <h1>. Were it indexable, check-seo would stop the build.
    const screen = read("src/features/property/screens/PropertyDetailScreen.tsx");
    expect(screen).toMatch(/isLoading && !property[\s\S]{0,400}<PageMeta [^>]*\bnoindex\b/);
  });

  it("does not use Expo's route loaders, which re-bundle the whole app for every page and failed the deploy", () => {
    expect(read("app.json")).not.toContain("unstable_useServerDataLoaders");
  });
});
