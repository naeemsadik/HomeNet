import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import {
  areaCrumbs,
  breadcrumbSchema,
  faqPageSchema,
  jsonLdDocument,
  listingCrumbs,
  listingSchema,
  listingSubjectType,
  organizationSchema,
  serializeJsonLd,
  VALUATION_FAQ,
  websiteSchema,
} from "..";
import { seoAreaBySlug } from "@/content/areas";

const detail = (overrides: Partial<PropertyDetail> = {}): PropertyDetail => ({
  id: "abc-123",
  title: "3 bed flat, south facing",
  description: "Lake view, lift and full generator backup.",
  type: "residential",
  subtype: "apartment",
  listing_type: "rent",
  price: 85000,
  price_currency: "BDT",
  area_size: 1800,
  area_unit: "sqft",
  location_lat: 23.7925,
  location_lng: 90.4078,
  address: "Road 11, Gulshan",
  amenities: { bedrooms: 3, bathrooms: 3, facing: "South", lift: true, generator: true, gym: false },
  status: "active",
  is_verified: true,
  virtual_tour_url: null,
  view_count: 4,
  published_at: "2026-10-01T00:00:00Z",
  created_at: "2026-09-30T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
  area: { id: "a1", name: "Gulshan-2", city: "Dhaka", parent: { id: "a0", name: "Gulshan" } },
  user: { id: "u1", full_name: "Owner", avatar_url: null, auth_identities: [{ email: "o@x.bd", phone: "+8801700000000" }] },
  media: [{ id: "m1", media_type: "image", url: "https://res.cloudinary.com/x/1.jpg", thumbnail_url: null, display_order: 0 }],
  _count: { media: 1 },
  ...overrides,
});

describe("jsonLdDocument", () => {
  it("drops empty optional fields and wraps nodes in one graph", () => {
    const doc = jsonLdDocument(organizationSchema(), websiteSchema());
    expect(doc["@context"]).toBe("https://schema.org");
    expect(doc["@graph"]).toHaveLength(2);
    expect(JSON.stringify(doc)).not.toContain("null");
    // Unset brand fields are left out rather than shipped as placeholders.
    expect(doc["@graph"][0]).not.toHaveProperty("telephone");
    expect(doc["@graph"][0]).not.toHaveProperty("geo");
  });

  it("cannot be broken out of its script tag", () => {
    const text = serializeJsonLd(jsonLdDocument(listingSchema(detail({ title: "</script><script>alert(1)" }))));
    expect(text).not.toContain("<");
    expect(JSON.parse(text)["@graph"][0].name).toBe("</script><script>alert(1)");
  });
});

describe("websiteSchema", () => {
  it("offers a search box that the browse page reads", () => {
    const action = websiteSchema().potentialAction as Record<string, any>;
    expect(action.target.urlTemplate).toBe("https://www.homenetbd.com/buy?query={search_term_string}");
    expect(action["query-input"]).toBe("required name=search_term_string");
  });
});

describe("listingSchema", () => {
  it("describes a rental flat with monthly BDT pricing, size and features", () => {
    const node = listingSchema(detail()) as Record<string, any>;
    expect(node["@type"]).toBe("RealEstateListing");
    expect(node.url).toBe("https://www.homenetbd.com/property/abc-123");
    expect(node.about["@type"]).toBe("Apartment");
    expect(node.about.numberOfBedrooms).toBe(3);
    expect(node.about.floorSize).toMatchObject({ value: 1800, unitCode: "FTK" });
    expect(node.about.geo).toMatchObject({ latitude: 23.7925, longitude: 90.4078 });
    expect(node.offers).toMatchObject({ price: 85000, priceCurrency: "BDT" });
    expect(node.offers.priceSpecification.unitCode).toBe("MON");
    const features = node.about.amenityFeature.map((f: any) => f.name);
    expect(features).toEqual(expect.arrayContaining(["lift", "generator", "Facing"]));
    expect(features).not.toContain("gym");
  });

  it("never publishes the owner's phone or email", () => {
    const text = JSON.stringify(listingSchema(detail()));
    expect(text).not.toContain("+8801700000000");
    expect(text).not.toContain("o@x.bd");
  });

  it("prices a sale once, without a monthly unit, and marks sold listings", () => {
    const node = listingSchema(detail({ listing_type: "sale", status: "sold", price: 25000000 })) as Record<string, any>;
    expect(node.offers.priceSpecification).toBeUndefined();
    expect(node.offers.availability).toBe("https://schema.org/SoldOut");
    expect(node.offers.businessFunction).toContain("#Sell");
  });

  it.each([
    ["residential", "duplex", "SingleFamilyResidence"],
    ["residential", "apartment", "Apartment"],
    ["land", "residential-plot", "Place"],
    ["commercial", "office", "Place"],
    ["parking", "garage", "ParkingFacility"],
  ] as const)("maps %s/%s to %s", (type, subtype, expected) => {
    expect(listingSubjectType(type, subtype)).toBe(expected);
  });
});

describe("breadcrumbs", () => {
  it("place a listing under its city and area pages", () => {
    const crumbs = listingCrumbs(detail());
    expect(crumbs.map((c) => c.name)).toEqual(["Home", "Property to Rent", "Dhaka", "Gulshan 2", "3 bed flat, south facing"]);
    expect(crumbs[3].url).toBe("https://www.homenetbd.com/rent/gulshan-2");
  });

  it("stop at the city when the area has no page", () => {
    const crumbs = listingCrumbs(detail({ area: { id: "x", name: "Somewhere New", city: "Dhaka", parent: null } }));
    expect(crumbs.map((c) => c.name)).toEqual(["Home", "Property to Rent", "Dhaka", "3 bed flat, south facing"]);
  });

  it("number positions from 1", () => {
    const node = breadcrumbSchema(areaCrumbs(seoAreaBySlug("banani")!, "buy")) as Record<string, any>;
    expect(node.itemListElement.map((i: any) => [i.position, i.name])).toEqual([
      [1, "Home"],
      [2, "Property for Sale"],
      [3, "Dhaka"],
      [4, "Banani"],
    ]);
  });
});

describe("faqPageSchema", () => {
  it("turns entries into questions with accepted answers", () => {
    const node = faqPageSchema(VALUATION_FAQ, "https://www.homenetbd.com/instant-valuation") as Record<string, any>;
    expect(node.mainEntity).toHaveLength(VALUATION_FAQ.length);
    expect(node.mainEntity[1].acceptedAnswer.text).toContain("720 square feet");
  });
});
