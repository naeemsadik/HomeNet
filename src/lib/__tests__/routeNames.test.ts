import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const APP = join(__dirname, "..", "..", "..", "app");

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(path);
    return /\.[jt]sx?$/.test(entry.name) ? [relative(APP, path).split(sep).join("/")] : [];
  });
}

// expo-router strips a trailing "index" from a route's path even without a "/"
// before it, so "price-index.tsx" is exported as "price-": the static HTML is
// then the not-found page, marked noindex. Use "price-index/index.tsx".
it("has no route file whose name ends in 'index' other than index itself", () => {
  const broken = routeFiles(APP).filter((file) => /[^/]index(\.web|\.native|\.ios|\.android)?\.[jt]sx?$/.test(file));
  expect(broken).toEqual([]);
});
