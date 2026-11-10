/**
 * HomeNet's official social profiles, in one place. The footers link to them and
 * the site's structured data (`sameAs`) lists them, which is how search engines
 * connect those accounts to this site. A profile left as `null` is not shown
 * anywhere, so no icon ever goes to a page that does not exist.
 *
 * TODO(owner): create the X, Instagram and TikTok accounts, then paste each URL
 * here. Use the exact same name, logo and "HomeNet BD" description on every one.
 */
export const SOCIAL_PROFILES = {
  facebook: "https://www.facebook.com/homenetbd",
  linkedin: "https://www.linkedin.com/company/homenetbd",
  youtube: "https://www.youtube.com/@homenetbd",
  x: null as string | null,
  instagram: null as string | null,
  tiktok: null as string | null,
} as const;

export type SocialNetwork = keyof typeof SOCIAL_PROFILES;

/** The profile URL for a network, or null when HomeNet has no account there yet. */
export function socialProfileUrl(network: SocialNetwork): string | null {
  return SOCIAL_PROFILES[network];
}

/** Every profile that exists, for the `sameAs` list in the organisation schema. */
export function socialProfileUrls(): string[] {
  return Object.values(SOCIAL_PROFILES).filter((url): url is string => typeof url === "string");
}
