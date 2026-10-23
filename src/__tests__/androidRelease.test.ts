/// <reference types="node" />
// Node's types for this file only; see src/__native__/routes.native.test.ts.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { checkAndroidRelease, pngSize } = require("../../scripts/check-android-release.cjs") as {
  checkAndroidRelease: (root?: string) => string[];
  pngSize: (file: string) => { width: number; height: number } | null;
};

const REAL = path.resolve(__dirname, "../..");

/** A copy of just what the check reads, in a temp folder, that a test can break. */
// The two config files are edited freely by each test, so they are untyped on purpose.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Files = { app: any; eas: any; root: string };
/* eslint-enable @typescript-eslint/no-explicit-any */
function project(change: (files: Files) => void = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "homenet-release-"));
  const copy = (relative: string) => {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.copyFileSync(path.join(REAL, relative), path.join(root, relative));
  };
  for (const file of [
    "assets/icon.png",
    "assets/adaptive-icon.png",
    "assets/adaptive-icon-background.png",
    "assets/adaptive-icon-monochrome.png",
    "assets/splash-icon.png",
    "store/play-icon-512.png",
    "store/feature-graphic-1024x500.png",
    "app/privacy.tsx",
    "app/terms.tsx",
    "app/delete-account.tsx",
  ]) {
    copy(file);
  }
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/ok.ts"), "export const ok = true;\n");

  const app = JSON.parse(fs.readFileSync(path.join(REAL, "app.json"), "utf8"));
  const eas = JSON.parse(fs.readFileSync(path.join(REAL, "eas.json"), "utf8"));
  change({ app, eas, root });
  fs.writeFileSync(path.join(root, "app.json"), JSON.stringify(app));
  fs.writeFileSync(path.join(root, "eas.json"), JSON.stringify(eas));
  return root;
}

const problemsFor = (change: Parameters<typeof project>[0]) => checkAndroidRelease(project(change));

describe("the Android release preflight", () => {
  it("passes for the project as it is", () => {
    expect(checkAndroidRelease(REAL)).toEqual([]);
  });

  it("reads PNG sizes from the header", () => {
    expect(pngSize(path.join(REAL, "assets/icon.png"))).toEqual({ width: 1024, height: 1024 });
    expect(pngSize(path.join(REAL, "store/feature-graphic-1024x500.png"))).toEqual({ width: 1024, height: 500 });
    expect(pngSize(path.join(REAL, "app.json"))).toBeNull(); // not a PNG
  });

  it("is the same on a clean copy, so the rest of these tests start from a pass", () => {
    expect(problemsFor(() => {})).toEqual([]);
  });

  it("fails when cleartext traffic is allowed", () => {
    const problems = problemsFor(({ app }) => {
      app.expo.plugins = app.expo.plugins.filter((p: unknown) => !(Array.isArray(p) && p[0] === "expo-build-properties"));
    });
    expect(problems.join("\n")).toMatch(/cleartext/);
  });

  it("fails when backup is left on", () => {
    const problems = problemsFor(({ app }) => {
      app.expo.android.allowBackup = true;
    });
    expect(problems.join("\n")).toMatch(/allowBackup/);
  });

  it("fails when the version code is set by hand", () => {
    const problems = problemsFor(({ app }) => {
      app.expo.android.versionCode = 7;
    });
    expect(problems.join("\n")).toMatch(/versionCode/);
  });

  it("fails when an icon is the wrong size or missing", () => {
    expect(
      problemsFor(({ app }) => {
        app.expo.icon = "./store/play-icon-512.png"; // a 512 px file where 1024 is needed
      }).join("\n"),
    ).toMatch(/icon.*512x512, expected 1024x1024/);
    expect(
      problemsFor(({ app }) => {
        app.expo.icon = "./assets/nothing.png";
      }).join("\n"),
    ).toMatch(/does not exist/);
  });

  it("fails when permissions the app does not use are not blocked", () => {
    const problems = problemsFor(({ app }) => {
      app.expo.android.blockedPermissions = [];
      app.expo.plugins = app.expo.plugins.map((p: unknown) => (Array.isArray(p) && p[0] === "expo-image-picker" ? "expo-image-picker" : p));
    });
    expect(problems.join("\n")).toMatch(/READ_MEDIA_IMAGES/);
    expect(problems.join("\n")).toMatch(/cameraPermission/);
  });

  it("fails when production would call a plain-http, local or secret-bearing address", () => {
    expect(
      problemsFor(({ eas }) => {
        eas.build.production.env.EXPO_PUBLIC_API_BASE_URL = "http://api.homenetbd.com";
      }).join("\n"),
    ).toMatch(/must be an https address/);
    expect(
      problemsFor(({ eas }) => {
        eas.build.production.env.EXPO_PUBLIC_API_BASE_URL = "https://localhost:3000";
      }).join("\n"),
    ).toMatch(/must be an https address/);
    expect(
      problemsFor(({ eas }) => {
        eas.build.production.env.EXPO_PUBLIC_GROQ_API_KEY = "gsk_example";
      }).join("\n"),
    ).toMatch(/EXPO_PUBLIC_GROQ_API_KEY is bundled/);
  });

  it("fails when production does not build an app bundle", () => {
    const problems = problemsFor(({ eas }) => {
      eas.build.production.android.buildType = "apk";
    });
    expect(problems.join("\n")).toMatch(/app-bundle/);
  });

  it("fails when a legal page is missing", () => {
    const root = project();
    fs.rmSync(path.join(root, "app/privacy.tsx"));
    expect(checkAndroidRelease(root).join("\n")).toMatch(/\/privacy page is missing/);
  });

  it("fails when code asks for media-library permission", () => {
    const root = project();
    fs.writeFileSync(
      path.join(root, "src/picker.ts"),
      "export const ask = () => ImagePicker.requestMediaLibraryPermissionsAsync();\n",
    );
    expect(checkAndroidRelease(root).join("\n")).toMatch(/src\/picker\.ts asks for media-library permission/);
  });

  it("fails when code reads a secret from a public variable", () => {
    const root = project();
    fs.writeFileSync(path.join(root, "src/key.ts"), "export const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;\n");
    expect(checkAndroidRelease(root).join("\n")).toMatch(/src\/key\.ts reads a secret/);
  });
});
