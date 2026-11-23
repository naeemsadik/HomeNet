import { isSafeLinkUrl, openExternalUrl } from "@/lib/safeUrl";

describe("isSafeLinkUrl", () => {
  it.each([
    "https://mutation.land.gov.bd",
    "http://bdlaws.minlaw.gov.bd/act-90/part-details-293.html",
    "mailto:support@homenetbd.com",
    "tel:+8801700000000",
  ])("allows %s", (url) => {
    expect(isSafeLinkUrl(url)).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "/guides/some-guide",
    "not a url",
    "",
  ])("rejects %p", (url) => {
    expect(isSafeLinkUrl(url)).toBe(false);
  });

  it("rejects null and undefined", () => {
    expect(isSafeLinkUrl(null)).toBe(false);
    expect(isSafeLinkUrl(undefined)).toBe(false);
  });
});

describe("openExternalUrl (web)", () => {
  let open: jest.SpyInstance;

  beforeEach(() => {
    open = jest.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => open.mockRestore());

  it("opens safe URLs in a new tab without an opener", () => {
    expect(openExternalUrl("https://www.eporcha.gov.bd")).toBe(true);
    expect(open).toHaveBeenCalledWith("https://www.eporcha.gov.bd", "_blank", "noopener,noreferrer");
  });

  it("never opens an unsafe URL", () => {
    expect(openExternalUrl("javascript:alert(document.cookie)")).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });
});

describe("sanitizeExternalUrl", () => {
  const { sanitizeExternalUrl } = require("@/lib/safeUrl");

  it("strips unexpected characters from tel: numbers", () => {
    expect(sanitizeExternalUrl("tel:+880 1700-000000")).toBe("tel:+8801700000000");
    expect(sanitizeExternalUrl("tel:017<script>")).toBe("tel:017");
    expect(sanitizeExternalUrl("tel:abc")).toBeNull();
  });

  it("accepts one plain address for mailto: and keeps the subject", () => {
    expect(sanitizeExternalUrl("mailto:jobs@homenetbd.com?subject=Hi%20there")).toBe(
      "mailto:jobs@homenetbd.com?subject=Hi%20there",
    );
    expect(sanitizeExternalUrl("mailto:not-an-address")).toBeNull();
    expect(sanitizeExternalUrl("mailto:a@b.com,c@d.com")).toBeNull();
    expect(sanitizeExternalUrl("mailto:a%@b.com")).toBeNull();
    expect(sanitizeExternalUrl("mailto:a@b.com?subject=Hi&bcc=x@y.com")).toBe("mailto:a@b.com?subject=Hi");
  });

  it("leaves https URLs alone and rejects unsafe ones", () => {
    expect(sanitizeExternalUrl("https://maps.google.com/?q=1,2")).toBe("https://maps.google.com/?q=1,2");
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
  });
});
