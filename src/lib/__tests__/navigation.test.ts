import { router } from "expo-router";
import { isSafeReturnPath, readReturnPath, safeGoBack, withReturnTo } from "@/lib/navigation";

jest.mock("expo-router", () => ({
  router: { canGoBack: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

const mocked = router as unknown as {
  canGoBack: jest.Mock;
  back: jest.Mock;
  replace: jest.Mock;
};

beforeEach(() => {
  mocked.canGoBack.mockReset();
  mocked.back.mockReset();
  mocked.replace.mockReset();
});

describe("isSafeReturnPath", () => {
  it("accepts a path inside the app", () => {
    for (const path of ["/", "/admin/properties", "/buy?status=sold", "/property/abc-123#photos"]) {
      expect<[string, boolean]>([path, isSafeReturnPath(path)]).toEqual([path, true]);
    }
  });

  it("rejects anything that could leave the origin", () => {
    const hostile = [
      "https://evil.com",
      "http://evil.com",
      "//evil.com", // protocol-relative
      "///evil.com",
      "/\\evil.com", // a browser reads the backslash as a slash
      "\\\\evil.com",
      "/%2f%2fevil.com", // the same attack, percent-encoded
      "/%5c%5cevil.com",
      "javascript:alert(1)",
      "/javascript:alert(1)".replace("/", ""), // bare scheme, no leading slash
      "data:text/html,<script>",
      "evil.com",
      "../admin",
    ];
    for (const path of hostile) {
      expect<[string, boolean]>([path, isSafeReturnPath(path)]).toEqual([path, false]);
    }
  });

  it("rejects control characters and malformed escapes", () => {
    expect(isSafeReturnPath("/admin\nSet-Cookie: x=1")).toBe(false);
    expect(isSafeReturnPath("/admin\u0000")).toBe(false);
    expect(isSafeReturnPath("/%E0%A4%A")).toBe(false); // decodeURIComponent throws
  });

  it("rejects non-strings, empties and absurd lengths", () => {
    expect(isSafeReturnPath(undefined)).toBe(false);
    expect(isSafeReturnPath(null)).toBe(false);
    expect(isSafeReturnPath(42)).toBe(false);
    expect(isSafeReturnPath("")).toBe(false);
    expect(isSafeReturnPath("   ")).toBe(false);
    expect(isSafeReturnPath("/" + "a".repeat(600))).toBe(false);
  });
});

describe("readReturnPath", () => {
  it("takes the first safe value from a repeated query key", () => {
    // ?returnTo=/admin/properties&returnTo=//evil.com
    expect(readReturnPath(["/admin/properties", "//evil.com"])).toBe("/admin/properties");
  });

  it("skips an unsafe first value rather than giving up", () => {
    expect(readReturnPath(["//evil.com", "/admin/properties"])).toBe("/admin/properties");
  });

  it("returns null when nothing is usable", () => {
    expect(readReturnPath(undefined)).toBeNull();
    expect(readReturnPath(["//evil.com", "https://evil.com"])).toBeNull();
  });
});

describe("safeGoBack", () => {
  it("goes back when there is history, whatever returnTo says", () => {
    mocked.canGoBack.mockReturnValue(true);
    safeGoBack({ returnTo: "/admin/properties", fallback: "/buy" });
    expect(mocked.back).toHaveBeenCalledTimes(1);
    expect(mocked.replace).not.toHaveBeenCalled();
  });

  it("uses a validated returnTo when the stack is empty", () => {
    // The reported bug: a listing opened from the admin panel in a new tab.
    mocked.canGoBack.mockReturnValue(false);
    safeGoBack({ returnTo: "/admin/properties", fallback: "/buy" });
    expect(mocked.back).not.toHaveBeenCalled();
    expect(mocked.replace).toHaveBeenCalledWith("/admin/properties");
  });

  it("falls back when the stack is empty and there is no returnTo", () => {
    mocked.canGoBack.mockReturnValue(false);
    safeGoBack({ fallback: "/rent" });
    expect(mocked.replace).toHaveBeenCalledWith("/rent");
  });

  it("falls back rather than following a hostile returnTo", () => {
    mocked.canGoBack.mockReturnValue(false);
    for (const hostile of ["https://evil.com", "//evil.com", "/\\evil.com"]) {
      mocked.replace.mockClear();
      safeGoBack({ returnTo: hostile, fallback: "/buy" });
      expect(mocked.replace).toHaveBeenCalledWith("/buy");
    }
  });

  it("never fires an unguarded GO_BACK", () => {
    // The whole point: back() is only ever reached behind canGoBack().
    mocked.canGoBack.mockReturnValue(false);
    safeGoBack({ fallback: "/" });
    expect(mocked.back).not.toHaveBeenCalled();
    expect(mocked.replace).toHaveBeenCalledTimes(1);
  });
});

describe("withReturnTo", () => {
  it("adds the param, encoded", () => {
    expect(withReturnTo("/property/abc", "/admin/properties")).toBe(
      "/property/abc?returnTo=%2Fadmin%2Fproperties",
    );
  });

  it("respects an existing query string", () => {
    expect(withReturnTo("/property/abc?x=1", "/admin/properties")).toBe(
      "/property/abc?x=1&returnTo=%2Fadmin%2Fproperties",
    );
  });

  it("refuses to write an unsafe value into a URL it will later trust", () => {
    expect(withReturnTo("/property/abc", "//evil.com")).toBe("/property/abc");
  });
});
