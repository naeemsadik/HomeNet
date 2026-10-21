import fs from "node:fs";
import path from "node:path";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_NAME } from "@/lib/seo";

describe("the brand name search engines read", () => {
  it("is HomeNet BD, because other companies are also called HomeNet", () => {
    expect(SITE_NAME).toBe("HomeNet BD");
  });

  it("is stated the same way in the organisation and website data", () => {
    const org = organizationSchema();
    expect(org.name).toBe("HomeNet BD");
    expect(org.alternateName).toEqual(expect.arrayContaining(["HomeNet", "HomenetBd"]));
    expect(String(org.disambiguatingDescription)).toContain("homenetbd.com");
    expect(websiteSchema().name).toBe("HomeNet BD");
  });

  it("does not claim anything about other companies", () => {
    expect(String(organizationSchema().disambiguatingDescription)).not.toMatch(/not affiliated|unrelated|internet service/i);
  });

  it("is used in every page title that ends with the brand", () => {
    const root = path.resolve(__dirname, "../../..");
    const files = ["app/buy.tsx", "app/rent.tsx", "app/sell.tsx", "app/sold.tsx", "app/saved.tsx", "app/index.tsx", "app/_layout.tsx"];
    for (const file of files) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      expect(source).not.toMatch(/title="[^"]*(\| HomeNet|— HomeNet|^HomeNet —)"/);
      expect(source).toMatch(/title="[^"]*HomeNet BD[^"]*"/);
    }
  });
});
