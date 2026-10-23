import { isSafeLinkUrl, openExternalUrl } from "@/lib/safeUrl";

describe("isSafeLinkUrl", () => {
  it.each([
    "https://mutation.land.gov.bd",
    "http://bdlaws.minlaw.gov.bd/act-90/part-details-293.html",
    "mailto:hello@homenet.com.bd",
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
