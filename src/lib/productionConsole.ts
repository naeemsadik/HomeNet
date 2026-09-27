/**
 * Production builds print nothing to the browser console; local runs
 * (`__DEV__`) keep every log, warning and error.
 *
 * Imported first by app/_layout.tsx so it is in place before anything can
 * log. It covers the app, its libraries (React's hydration reports among
 * them) and Google Translate, which all share this window's console, and it
 * stops uncaught errors and rejected promises from being printed.
 *
 * What no page can hide: the browser's own lines for failed requests and
 * blocked resources ("Failed to load resource", CSP violations).
 *
 * To debug production, run `localStorage.setItem("homenet_debug", "1")` in
 * the console and reload; remove the item to silence it again.
 */

const DEBUG_FLAG = "homenet_debug";

const CONSOLE_METHODS = [
  "log",
  "info",
  "debug",
  "warn",
  "error",
  "trace",
  "table",
  "dir",
  "group",
  "groupCollapsed",
  "groupEnd",
] as const;

function debugRequested(): boolean {
  try {
    return window.localStorage.getItem(DEBUG_FLAG) === "1";
  } catch {
    return false;
  }
}

export function silenceConsoleInProduction(): void {
  if (__DEV__ || typeof window === "undefined" || debugRequested()) return;

  const noop = () => {};
  const target = console as unknown as Record<string, unknown>;
  for (const method of CONSOLE_METHODS) target[method] = noop;

  // preventDefault stops the browser from printing "Uncaught …". React
  // reports hydration and render errors through this same event.
  window.addEventListener("error", (event) => event.preventDefault());
  window.addEventListener("unhandledrejection", (event) => event.preventDefault());
}

silenceConsoleInProduction();
