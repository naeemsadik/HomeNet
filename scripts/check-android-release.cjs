#!/usr/bin/env node
/**
 * Preflight for a Google Play release: `npm run check:android`.
 *
 * Checks what Play (or a reviewer) rejects or what has already broken a release
 * of this app: icon sizes, permissions, cleartext traffic, the API address a
 * production build will use, store graphics, the privacy and account-deletion
 * pages, and code that asks for storage permission. It reads files only: no
 * network, no build. A green run does not replace testing on a device.
 *
 * Also loaded by src/__tests__/androidRelease.test.ts so CI fails when one
 * of these slips.
 */
/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");

const PNG_SIGNATURE = "89504e470d0a1a0a";

/** Width and height of a PNG, read from its header. null when it is not a PNG. */
function pngSize(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "__tests__" || entry.name === "__native__") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** @returns {string[]} what is wrong; empty when the project is ready. */
function checkAndroidRelease(root = path.resolve(__dirname, "..")) {
  const problems = [];
  const fail = (message) => problems.push(message);
  const at = (...parts) => path.join(root, ...parts);

  // ── app.json ──────────────────────────────────────────────────────────────
  let expo;
  try {
    expo = readJson(at("app.json")).expo;
  } catch (error) {
    return [`app.json cannot be read: ${error.message}`];
  }
  const android = expo.android ?? {};

  if (!/^\d+\.\d+\.\d+$/.test(expo.version ?? "")) fail(`version "${expo.version}" is not x.y.z`);
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(android.package ?? "")) {
    fail(`android.package "${android.package}" is not a valid application id`);
  }
  if ("versionCode" in android) {
    fail("android.versionCode is set by hand; EAS raises it on each build (appVersionSource: remote). Remove it.");
  }

  const checkPng = (label, relative, width, height) => {
    if (!relative) return fail(`${label} is not set`);
    const file = at(relative);
    if (!fs.existsSync(file)) return fail(`${label}: ${relative} does not exist`);
    const size = pngSize(file);
    if (!size) return fail(`${label}: ${relative} is not a PNG`);
    if (size.width !== width || size.height !== height) {
      fail(`${label}: ${relative} is ${size.width}x${size.height}, expected ${width}x${height}`);
    }
  };
  checkPng("icon", expo.icon, 1024, 1024);
  checkPng("adaptive icon foreground", android.adaptiveIcon?.foregroundImage, 1024, 1024);
  checkPng("adaptive icon background", android.adaptiveIcon?.backgroundImage, 1024, 1024);
  checkPng("adaptive icon monochrome", android.adaptiveIcon?.monochromeImage, 1024, 1024);

  const plugin = (name) => (expo.plugins ?? []).find((p) => (Array.isArray(p) ? p[0] : p) === name);
  const options = (name) => {
    const found = plugin(name);
    return Array.isArray(found) ? (found[1] ?? {}) : {};
  };

  const splash = options("expo-splash-screen");
  if (!plugin("expo-splash-screen")) fail("the expo-splash-screen plugin is not configured");
  else checkPng("splash image", splash.image, 1024, 1024);

  if (android.allowBackup !== false) {
    fail("android.allowBackup must be false: a restored backup cannot decrypt the sign-in token in SecureStore");
  }
  if (android.usesCleartextTraffic === true || options("expo-build-properties").android?.usesCleartextTraffic !== false) {
    fail("cleartext (http) traffic must be switched off: expo-build-properties android.usesCleartextTraffic = false");
  }
  const blocked = new Set(android.blockedPermissions ?? []);
  for (const permission of [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_MEDIA_IMAGES",
    "android.permission.READ_MEDIA_VIDEO",
    "android.permission.RECORD_AUDIO",
    "android.permission.CAMERA",
    "android.permission.USE_BIOMETRIC",
    "android.permission.USE_FINGERPRINT",
  ]) {
    if (!blocked.has(permission)) fail(`${permission} should be in android.blockedPermissions (the app does not use it)`);
  }
  const picker = options("expo-image-picker");
  if (picker.cameraPermission !== false || picker.microphonePermission !== false) {
    fail("expo-image-picker must set cameraPermission and microphonePermission to false");
  }
  for (const key of Object.keys(android.permissions ?? [])) {
    fail(`android.permissions lists ${android.permissions[key]}: only add a permission the app really needs`);
  }

  // ── eas.json ──────────────────────────────────────────────────────────────
  let eas;
  try {
    eas = readJson(at("eas.json"));
  } catch (error) {
    return [...problems, `eas.json cannot be read: ${error.message}`];
  }
  if (eas.cli?.appVersionSource !== "remote") fail("eas.json cli.appVersionSource should be \"remote\"");
  const production = eas.build?.production;
  if (!production) {
    fail("eas.json has no production build profile");
  } else {
    if (production.android?.buildType !== "app-bundle") fail("the production profile must build an app-bundle (.aab): Play does not take an APK");
    if (production.autoIncrement !== true) fail("the production profile should set autoIncrement: true");
    const api = production.env?.EXPO_PUBLIC_API_BASE_URL;
    if (!api) fail("the production profile must set EXPO_PUBLIC_API_BASE_URL");
    else if (!/^https:\/\//.test(api) || /localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\./.test(api)) {
      fail(`the production API address "${api}" must be an https address of the real server`);
    }
    for (const key of Object.keys(production.env ?? {})) {
      if (/(KEY|SECRET|TOKEN|PASSWORD)/i.test(key) && key.startsWith("EXPO_PUBLIC_")) {
        fail(`${key} is bundled into the app and readable by anyone: never put a secret in an EXPO_PUBLIC_ variable`);
      }
    }
  }

  // ── Store assets and legal pages ──────────────────────────────────────────
  checkPng("Play store icon", "store/play-icon-512.png", 512, 512);
  checkPng("Play feature graphic", "store/feature-graphic-1024x500.png", 1024, 500);
  for (const page of ["privacy", "terms", "delete-account"]) {
    if (!fs.existsSync(at("app", `${page}.tsx`))) fail(`the /${page} page is missing (Play needs a public privacy policy and account-deletion page)`);
  }

  // ── Source ────────────────────────────────────────────────────────────────
  for (const file of [...walk(at("src")), ...walk(at("app"))]) {
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (/requestMediaLibraryPermissionsAsync/.test(text)) {
      fail(`${rel} asks for media-library permission; the system photo picker needs none, and on Android 11-12 the request blocks uploads`);
    }
    if (/EXPO_PUBLIC_[A-Z_]*(SECRET|API_KEY|TOKEN)/.test(text)) {
      fail(`${rel} reads a secret from an EXPO_PUBLIC_ variable; those are bundled into the app`);
    }
  }

  return problems;
}

module.exports = { checkAndroidRelease, pngSize };

if (require.main === module) {
  const problems = checkAndroidRelease();
  if (problems.length === 0) {
    console.log("check-android: ready. (Still test a release build on a phone before uploading.)");
  } else {
    console.error(`check-android: ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
    for (const problem of problems) console.error(`  ✖ ${problem}`);
    process.exit(1);
  }
}
