// language.ts reads the saved language when the module loads, so each test
// sets up storage first and then loads a fresh copy.
function loadLanguage(): typeof import("@/utils/language") {
  let mod!: typeof import("@/utils/language");
  jest.isolateModules(() => {
    mod = require("@/utils/language");
  });
  return mod;
}

function clearAllCookies() {
  for (const pair of document.cookie.split("; ")) {
    const name = pair.split("=")[0];
    if (name) document.cookie = `${name}=;max-age=0;path=/`;
  }
}

describe("language cookie helpers", () => {
  let cookieWrites: string[];
  let setter: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    clearAllCookies();
    cookieWrites = [];
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")!;
    setter = jest.spyOn(document, "cookie", "set").mockImplementation((value: string) => {
      cookieWrites.push(value);
      descriptor.set!.call(document, value);
    });
  });

  afterEach(() => setter.mockRestore());

  it("restores the googtrans cookie for a Bangla reader, with a one-year expiry", () => {
    localStorage.setItem("homenet_lang", "bn");
    const { restoreTranslateCookie, shouldLoadTranslateOnBoot } = loadLanguage();

    expect(shouldLoadTranslateOnBoot()).toBe(true);
    restoreTranslateCookie();

    const write = cookieWrites.find((c) => c.startsWith("googtrans=/en/bn"));
    expect(write).toBeDefined();
    // Without max-age the cookie died with the tab (the BUG-04 regression).
    expect(write).toContain(`max-age=${365 * 24 * 60 * 60}`);
    expect(write).toContain("path=/");
    expect(document.cookie).toContain("googtrans=/en/bn");
  });

  it("leaves cookies alone for an English reader", () => {
    localStorage.setItem("homenet_lang", "en");
    const { restoreTranslateCookie, shouldLoadTranslateOnBoot } = loadLanguage();

    expect(shouldLoadTranslateOnBoot()).toBe(false);
    restoreTranslateCookie();
    expect(cookieWrites).toHaveLength(0);
  });

  it("treats an existing Bangla cookie as a Bangla reader when storage is empty", () => {
    setter.mockRestore();
    document.cookie = "googtrans=/en/bn;path=/";
    const { shouldLoadTranslateOnBoot } = loadLanguage();
    expect(shouldLoadTranslateOnBoot()).toBe(true);
  });
});
