import fs from "node:fs";
import path from "node:path";
import { SOCIAL_LINKS } from "@/constants/navigation";

/**
 * The desktop footer drew five social icons that did nothing when clicked. Both footers now take
 * their icons from the one list of real pages.
 */
describe("footer social links", () => {
  it("points every icon at an https page", () => {
    expect(SOCIAL_LINKS.length).toBeGreaterThan(0);
    for (const link of SOCIAL_LINKS) expect(link.url).toMatch(/^https:\/\//);
  });

  it.each(["Footer.tsx", "MobileFooter.tsx"])("%s draws its icons from that list and opens them", (file) => {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    expect(source).toContain("SOCIAL_LINKS.map");
    expect(source).toContain("openExternalUrl(url)");
  });
});
