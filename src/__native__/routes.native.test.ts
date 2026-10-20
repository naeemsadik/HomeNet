/// <reference types="node" />
// Node's types for this file only: tsconfig exposes just Jest's, and the app code
// must not start seeing Node globals by accident.
import fs from "node:fs";
import path from "node:path";

/**
 * Loads every route of the app the way a release build on a phone does.
 *
 * Importing a route runs everything it imports, so this catches code that
 * assumes a browser at load time (`document`, `localStorage`, `window.location`)
 * and a screen that cannot be imported at all. It is the check that would have
 * caught the startup crash in productionConsole. It does not render the screens;
 * what happens after that still needs a device.
 */
const APP_DIR = path.resolve(__dirname, "../../app");

/** Web-only entry points: they exist only in the static export for the browser. */
const WEB_ONLY = new Set(["+html.tsx"]);

function routeFiles(dir: string, base = ""): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) return routeFiles(path.join(dir, entry.name), rel);
    return /\.(tsx|ts)$/.test(entry.name) && !WEB_ONLY.has(rel) ? [rel] : [];
  });
}

const files = routeFiles(APP_DIR).sort();

describe("every route loads on Android in a release build", () => {
  const original = (globalThis as { __DEV__?: boolean }).__DEV__;
  beforeAll(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
  });
  afterAll(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = original;
  });

  it("found the routes", () => {
    expect(files.length).toBeGreaterThan(20);
    expect(files).toContain("_layout.tsx");
  });

  it.each(files)("%s", (file) => {
    jest.isolateModules(() => {
      // A dynamic require is the point: it runs the route's imports.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const loaded = require(path.join(APP_DIR, file));
      // A route's default export is its screen; a layout's is the layout.
      if (!file.endsWith("+html.tsx")) expect(loaded.default).toBeDefined();
    });
  });
});
