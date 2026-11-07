import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { listingMetaDescription, listingMetaTitle, listingShareImage } from "../listingMeta";

const detail = (overrides: Partial<PropertyDetail> = {}): PropertyDetail => ({
  id: "abc-123",
  title: "Flat Booking Open with Land Ownership — Shahjadpur, Dhaka",
  description:
    "Flat booking open with land ownership at Shahjadpur, Dhaka.\n\nDeveloper: AB Zam Zam Holdings Ltd. Contact the developer directly for details.",
  type: "residential",
  subtype: "apartment",
  listing_type: "sale",
  price: 8_500_000,
  price_currency: "BDT",
  area_size: 1450,
  area_unit: "sqft",
  location_lat: 23.79,
  location_lng: 90.42,
  address: "Bijoy Path, North Badda, Badda, Dhaka",
  amenities: { bedrooms: 3, bathrooms: 3, lift: true },
  status: "active",
  is_verified: false,
  virtual_tour_url: null,
  view_count: 14,
  published_at: null,
  created_at: "2026-10-23T12:57:15.079Z",
  updated_at: "2026-11-04T16:53:34.133Z",
  area: { id: "a1", name: "Badda", city: "Dhaka", parent: null },
  user: null,
  media: [
    {
      id: "m1",
      media_type: "image",
      url: "https://res.cloudinary.com/demo/image/upload/v1788701402/listing/1.jpg",
      thumbnail_url: null,
      display_order: 0,
    },
  ],
  _count: { media: 1 },
  ...overrides,
});

describe("listingMetaTitle", () => {
  it("says what, where and how much, in the words people search", () => {
    expect(listingMetaTitle(detail())).toBe("3 Bed Flat for Sale in Badda, ৳ 85 Lac | HomeNet BD");
  });

  it("prices a rental per month", () => {
    expect(listingMetaTitle(detail({ listing_type: "rent", price: 40_500 }))).toBe(
      "3 Bed Flat for Rent in Badda, ৳ 40,500/mo | HomeNet BD",
    );
  });

  it("leaves the price out when it is on request", () => {
    expect(listingMetaTitle(detail({ price: 1 }))).toBe("3 Bed Flat for Sale in Badda | HomeNet BD");
  });

  it("drops the price rather than run past the length search results show", () => {
    const title = listingMetaTitle(detail({ subtype: "commercial-plot", type: "land", area: { id: "a", name: "Bashundhara Residential Area", city: "Dhaka", parent: null } }));
    expect(title).toBe("Commercial Plot for Sale in Bashundhara Residential Area | HomeNet BD");
  });

  it("does not count bedrooms on land", () => {
    expect(listingMetaTitle(detail({ type: "land", subtype: "plot" }))).toMatch(/^Plot for Sale in Badda/);
  });
});

describe("listingMetaDescription", () => {
  it("fits a search snippet and opens with the facts", () => {
    const text = listingMetaDescription(detail());
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text.length).toBeGreaterThan(120);
    expect(text).toMatch(/^3 Bed Flat for Sale in Badda, Dhaka at ৳ 85 Lac\. 3 beds, 3 baths, 1,450 sqft\./);
    expect(text).toMatch(/See photos and contact details on HomeNet BD\.$/);
  });

  it("stays within the limit whatever the owner wrote", () => {
    const text = listingMetaDescription(detail({ description: "word ".repeat(400) }));
    expect(text.length).toBeLessThanOrEqual(160);
  });

  it("still reads as a sentence with no description or facts", () => {
    expect(listingMetaDescription(detail({ description: null, amenities: null, area_size: null, price: 1 }))).toBe(
      "Flat for Sale in Badda, Dhaka. See photos and contact details on HomeNet BD.",
    );
  });
});

describe("listingShareImage", () => {
  it("asks Cloudinary for a 1200×630 JPEG of the first photo", () => {
    expect(listingShareImage(detail())).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_jpg,q_auto,w_1200,h_630,c_fill/v1788701402/listing/1.jpg",
    );
  });

  it("has none when the listing has no photo", () => {
    expect(listingShareImage(detail({ media: [] }))).toBeUndefined();
  });
});
