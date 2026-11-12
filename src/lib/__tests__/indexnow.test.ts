import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(__dirname, "../../..");
const SCRIPT = join(ROOT, "scripts/submit-indexnow.mjs");

function runIndexNow(args: string[] = [], env: Record<string, string> = {}) {
  return execFileSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
    stdio: "pipe",
  });
}

describe("scripts/submit-indexnow.mjs", () => {
  it("defines the IndexNow submission script with required endpoints and payload properties", () => {
    const content = readFileSync(SCRIPT, "utf8");
    expect(content).toContain("https://api.indexnow.org/indexnow");
    expect(content).toContain("www.homenetbd.com");
    expect(content).toContain("keyLocation");
    expect(content).toContain("urlList");
    expect(content).toContain("findIndexNowKey");
    expect(content).toContain("extractUrlsFromSitemap");
  });

  it("exits gracefully with 0 when sitemap is empty or missing", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "indexnow-test-"));
    const emptySitemap = join(tempDir, "sitemap.xml");
    writeFileSync(emptySitemap, "<urlset></urlset>");

    const output = runIndexNow([emptySitemap], { INDEXNOW_KEY: "dummy-key-for-test" });
    expect(output).toBeDefined();

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("exits gracefully with 0 when key file is missing", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "indexnow-test-"));
    const sitemap = join(tempDir, "sitemap.xml");
    writeFileSync(
      sitemap,
      `<urlset><url><loc>https://www.homenetbd.com</loc></url><url><loc>https://www.homenetbd.com/buy</loc></url></urlset>`,
    );

    // Empty key env var
    const output = runIndexNow([sitemap], { INDEXNOW_KEY: "" });
    expect(output).toBeDefined();

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("runs on a valid sitemap without crashing the build", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "indexnow-test-"));
    const sitemap = join(tempDir, "sitemap.xml");
    writeFileSync(
      sitemap,
      `<urlset>
        <url><loc>https://www.homenetbd.com</loc></url>
        <url><loc>https://www.homenetbd.com/buy</loc></url>
        <url><loc>https://www.homenetbd.com/rent</loc></url>
      </urlset>`,
    );

    // Run with detected or dummy key; even if api.indexnow.org rejects or times out, exit code must be 0
    const output = runIndexNow([sitemap], { INDEXNOW_KEY: "bc54ca3aac3949d5b77bb019747ef7e1" });
    expect(output).toBeDefined();

    rmSync(tempDir, { recursive: true, force: true });
  });
});
