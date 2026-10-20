/**
 * On Android `window` exists but is not a browser window: it has no
 * addEventListener, localStorage or location. productionConsole runs when the
 * app starts, in every release build, so anything it assumes about `window`
 * stops the app on launch.
 */
describe("productionConsole on Android", () => {
  const original = (globalThis as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = original;
    jest.resetModules();
  });

  it("is not a browser here", () => {
    // If this fails the test is not exercising what a phone has.
    expect(typeof (globalThis as { window?: { addEventListener?: unknown } }).window?.addEventListener).not.toBe("function");
    expect(typeof (globalThis as { localStorage?: unknown }).localStorage).toBe("undefined");
  });

  it("starts without throwing in a release build", () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    jest.isolateModules(() => {
      expect(() => require("@/lib/productionConsole")).not.toThrow();
    });
  });

  it("starts without throwing in a dev build", () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    jest.isolateModules(() => {
      expect(() => require("@/lib/productionConsole")).not.toThrow();
    });
  });
});
