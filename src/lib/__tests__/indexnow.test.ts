import { execFile } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = resolve(__dirname, "../../..");
const SCRIPT = join(ROOT, "scripts/submit-indexnow.mjs");

type Submission = { host: string; key: string; keyLocation: string; urlList: string[] };

/**
 * A stand-in for api.indexnow.org. These tests must never reach the real one: it would send the live
 * site's URLs to search engines every time the suite runs.
 */
let server: Server;
let endpoint = "";
let received: Submission[] = [];
let respondWith = 200;

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push(JSON.parse(body));
      res.statusCode = respondWith;
      res.end(respondWith === 200 ? "" : "nope");
    });
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/indexnow`;
});

afterAll(() => new Promise<void>((done) => server.close(() => done())));

beforeEach(() => {
  received = [];
  respondWith = 200;
});

const tempDirs: string[] = [];
afterAll(() => tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function sitemapWith(...locs: string[]) {
  const dir = mkdtempSync(join(tmpdir(), "indexnow-test-"));
  tempDirs.push(dir);
  const file = join(dir, "sitemap.xml");
  writeFileSync(file, `<urlset>${locs.map((loc) => `<url><loc>${loc}</loc></url>`).join("")}</urlset>`);
  return file;
}

/** Starts from a clean slate so a developer's own Vercel variables can't change the result. */
function scriptEnv(extra: Record<string, string>, indexNowEndpoint = endpoint): NodeJS.ProcessEnv {
  return { NODE_ENV: "test", PATH: process.env.PATH ?? "", INDEXNOW_ENDPOINT: indexNowEndpoint, ...extra };
}

/** Runs the script like the build does. Resolves on exit 0 and rejects on any other exit code. */
function runIndexNow(args: string[], env: Record<string, string>) {
  return run(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8", env: scriptEnv(env) });
}

const PRODUCTION = { VERCEL: "1", VERCEL_ENV: "production" };

describe("scripts/submit-indexnow.mjs", () => {
  it("sends the sitemap's URLs, the host and the key to IndexNow on a production build", async () => {
    const sitemap = sitemapWith(
      "https://www.homenetbd.com",
      "https://www.homenetbd.com/buy?type=flat&amp;city=dhaka",
      "https://www.homenetbd.com",
    );
    const { stdout } = await runIndexNow([sitemap], { ...PRODUCTION, INDEXNOW_KEY: "abc123def4567890abc123def4567890" });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      host: "www.homenetbd.com",
      key: "abc123def4567890abc123def4567890",
      keyLocation: "https://www.homenetbd.com/abc123def4567890abc123def4567890.txt",
      // The duplicate is dropped and the XML-escaped & is decoded.
      urlList: ["https://www.homenetbd.com", "https://www.homenetbd.com/buy?type=flat&city=dhaka"],
    });
    expect(stdout).toContain("submitted 2 URLs");
  });

  it.each([
    ["a Vercel preview build", { VERCEL: "1", VERCEL_ENV: "preview" }],
    ["a Vercel development build", { VERCEL: "1", VERCEL_ENV: "development" }],
    ["a local build", {}],
  ])("sends nothing on %s", async (_name, env) => {
    const { stdout } = await runIndexNow([sitemapWith("https://www.homenetbd.com")], { ...env, INDEXNOW_KEY: "k" });
    expect(received).toHaveLength(0);
    expect(stdout).toContain("IndexNow: skipped");
  });

  it("sends nothing in production when INDEXNOW_DISABLED=1", async () => {
    await runIndexNow([sitemapWith("https://www.homenetbd.com")], { ...PRODUCTION, INDEXNOW_KEY: "k", INDEXNOW_DISABLED: "1" });
    expect(received).toHaveLength(0);
  });

  it("submits by hand with --force, outside production (npm run indexnow)", async () => {
    await runIndexNow(["--force", sitemapWith("https://www.homenetbd.com/rent")], { INDEXNOW_KEY: "k" });
    expect(received).toHaveLength(1);
    expect(received[0].urlList).toEqual(["https://www.homenetbd.com/rent"]);
  });

  it("uses the key file committed in public/ when no key is given", async () => {
    const keyFile = readdirSync(join(ROOT, "public")).find((file) => /^[0-9a-f]{32}\.txt$/i.test(file));
    expect(keyFile).toBeDefined();
    const key = readFileSync(join(ROOT, "public", keyFile as string), "utf8").trim();
    // IndexNow checks that https://host/<key>.txt contains the key, so name and content must match.
    expect(`${key}.txt`).toBe(keyFile);

    await runIndexNow([sitemapWith("https://www.homenetbd.com")], PRODUCTION);
    expect(received[0].key).toBe(key);
  });

  it("sends nothing when the sitemap has no URLs", async () => {
    await runIndexNow([sitemapWith()], { ...PRODUCTION, INDEXNOW_KEY: "k" });
    expect(received).toHaveLength(0);
  });

  it("never fails the build, even when IndexNow answers with an error", async () => {
    respondWith = 500;
    const { stdout, stderr } = await runIndexNow([sitemapWith("https://www.homenetbd.com")], { ...PRODUCTION, INDEXNOW_KEY: "k" });
    expect(received).toHaveLength(1);
    expect(`${stdout}${stderr}`).toContain("HTTP 500");
  });

  it("never fails the build when IndexNow cannot be reached", async () => {
    await expect(
      run(process.execPath, [SCRIPT, sitemapWith("https://www.homenetbd.com")], {
        cwd: ROOT,
        env: scriptEnv({ ...PRODUCTION, INDEXNOW_KEY: "k" }, "http://127.0.0.1:1/indexnow"),
      }),
    ).resolves.toBeDefined();
  });
});
