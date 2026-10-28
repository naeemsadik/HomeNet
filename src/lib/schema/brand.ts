import { SUPPORT_EMAIL } from "@/content/legal";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Who HomeNet is, as structured data states it. Every field here is published
 * to search engines and AI answer engines, so only facts go in.
 *
 * TODO(owner): fill the nulls. Each is left out of the markup until it is set,
 * rather than shipped as a made-up value:
 *   - telephone: public support number, in +880 form
 *   - address: the registered office
 *   - geo: the office's coordinates (from Google Maps, 4+ decimals)
 *   - sameAs: official social profiles (Facebook page, LinkedIn, YouTube)
 */
export const BRAND = {
  name: SITE_NAME,
  alternateName: ["HomeNet", "HomenetBd", "HomeNetBD", "homenetbd.com", "HomeNet Bangladesh", "হোমনেট"],
  /** Tells search engines which "HomeNet" this is. Facts only, no claim about any other company. */
  disambiguatingDescription: "HomeNet BD (homenetbd.com): a property marketplace for Bangladesh.",
  url: SITE_URL,
  /** 1024×1024 PNG, copied from assets/icon.png. */
  logo: `${SITE_URL}/logo.png`,
  email: SUPPORT_EMAIL,
  description:
    "HomeNet is a Bangladesh property marketplace where owners list flats, houses, land, commercial space and parking directly, and buyers and tenants contact them without a broker.",
  telephone: null as string | null,
  address: null as {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
  } | null,
  geo: null as { latitude: number; longitude: number } | null,
  sameAs: [] as string[],
  areaServed: ["Dhaka", "Chattogram", "Sylhet", "Cox's Bazar"],
};

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
