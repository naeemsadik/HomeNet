import { silenceConsoleInProduction } from "@/lib/productionConsole";

const globals = globalThis as unknown as { __DEV__: boolean };
const methods = ["log", "info", "warn", "error"] as const;

describe("silenceConsoleInProduction", () => {
  const original = Object.fromEntries(methods.map((m) => [m, console[m]]));
  const devBefore = globals.__DEV__;

  afterEach(() => {
    for (const m of methods) console[m] = original[m];
    globals.__DEV__ = devBefore;
    window.localStorage.removeItem("homenet_debug");
  });

  it("leaves the console alone in development", () => {
    globals.__DEV__ = true;
    silenceConsoleInProduction();
    for (const m of methods) expect(console[m]).toBe(original[m]);
  });

  it("silences the console in production", () => {
    globals.__DEV__ = false;
    silenceConsoleInProduction();
    for (const m of methods) expect(console[m]).not.toBe(original[m]);
    expect(() => console.error("hidden")).not.toThrow();
  });

  it("stops uncaught errors from being printed in production", () => {
    globals.__DEV__ = false;
    silenceConsoleInProduction();
    const event = new ErrorEvent("error", { cancelable: true, message: "boom" });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("keeps the console when the homenet_debug flag is set", () => {
    globals.__DEV__ = false;
    window.localStorage.setItem("homenet_debug", "1");
    silenceConsoleInProduction();
    for (const m of methods) expect(console[m]).toBe(original[m]);
  });
});
