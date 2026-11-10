import { SOCIAL_PROFILES, socialProfileUrl, socialProfileUrls } from "@/content/socialProfiles";
import { organizationSchema } from "@/lib/schema/organization";

describe("social profiles", () => {
  it("lists only profiles that exist, as secure URLs", () => {
    const urls = socialProfileUrls();
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
    expect(urls).toHaveLength(Object.values(SOCIAL_PROFILES).filter(Boolean).length);
  });

  it("returns null for a network HomeNet has no account on", () => {
    const empty = (Object.keys(SOCIAL_PROFILES) as (keyof typeof SOCIAL_PROFILES)[]).find(
      (network) => SOCIAL_PROFILES[network] === null,
    );
    if (empty) expect(socialProfileUrl(empty)).toBeNull();
  });

  it("publishes the same profiles as the organisation's sameAs", () => {
    expect(organizationSchema().sameAs).toEqual(socialProfileUrls());
  });
});
