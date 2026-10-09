import type { Area } from "@/types/api";
import type { SmartSearchFilters, SmartSearchListing } from "../../types/aiSearch";
import { areaIdsFor, describeFilters, resolveArea, toCardProperty } from "../aiSearchFilters";

const area = (id: string, name: string, parent: string | null = null): Area => ({
  id,
  name,
  city: "Dhaka",
  parent_area_id: parent,
});

// The shape of the live data: parents with listings only under their children.
const areas = [
  area("gulshan", "Gulshan"),
  area("gulshan-1", "Gulshan-1", "gulshan"),
  area("gulshan-2", "Gulshan-2", "gulshan"),
  area("banani", "Banani"),
  area("uttara", "Uttara"),
  area("sector-7", "Sector-7", "uttara"),
  area("mirpur", "Mirpur"),
  area("mirpur-10", "Mirpur-10", "mirpur"),
];

describe("resolveArea", () => {
  it("matches a name however it is punctuated or cased", () => {
    expect(resolveArea("Gulshan 2", areas)?.id).toBe("gulshan-2");
    expect(resolveArea("gulshan-2", areas)?.id).toBe("gulshan-2");
    expect(resolveArea("  BANANI ", areas)?.id).toBe("banani");
  });

  it("prefers the parent for a bare parent name", () => {
    expect(resolveArea("Gulshan", areas)?.id).toBe("gulshan");
  });

  it("finds the most specific area named inside longer text", () => {
    expect(resolveArea("Gulshan-2, Dhaka", areas)?.id).toBe("gulshan-2");
    expect(resolveArea("near Gulshan avenue", areas)?.id).toBe("gulshan");
  });

  it("reads a sector together with its parent", () => {
    expect(resolveArea("Uttara sector 7", areas)?.id).toBe("sector-7");
  });

  it("returns null for an unknown or empty place instead of guessing", () => {
    expect(resolveArea("Narnia", areas)).toBeNull();
    expect(resolveArea("", areas)).toBeNull();
    expect(resolveArea(undefined, areas)).toBeNull();
  });

  it("returns null when two areas share the name", () => {
    const twins = [area("a", "Uttara"), area("p1", "Park"), area("p2", "Park"), ...areas.slice(0, 1)];
    expect(resolveArea("Park", twins)).toBeNull();
  });
});

describe("areaIdsFor", () => {
  it("covers a parent and its sub-areas, because area_id matches one area only", () => {
    expect(areaIdsFor(areas[0], areas)).toEqual(["gulshan", "gulshan-1", "gulshan-2"]);
  });

  it("covers just the area when it has no children", () => {
    expect(areaIdsFor(areas[3], areas)).toEqual(["banani"]);
  });
});

const noFilters: SmartSearchFilters = {
  area: null,
  listing_type: null,
  type: null,
  min_price: null,
  max_price: null,
  bedrooms: null,
  bathrooms: null,
  amenities: [],
};

describe("describeFilters", () => {
  it("lists what was understood, in plain words", () => {
    const chips = describeFilters({
      ...noFilters,
      listing_type: "rent",
      type: "residential",
      area: "Dhanmondi",
      max_price: 40_000,
      bedrooms: 2,
      amenities: ["parking", "loading_dock"],
    });
    expect(chips.map((c) => c.label)).toEqual([
      "For rent",
      "Residential",
      "Dhanmondi",
      "Up to ৳ 40,000",
      "2+ bedrooms",
      "Parking",
      "Loading dock",
    ]);
  });

  it("writes prices in crore and lakh, as ranges or one-sided", () => {
    const label = (f: Partial<SmartSearchFilters>) =>
      describeFilters({ ...noFilters, ...f }).find((c) => c.id === "price")?.label;
    expect(label({ min_price: 5_000_000, max_price: 15_000_000 })).toBe("৳ 50 Lac – ৳ 1.50 Cr");
    expect(label({ min_price: 20_000_000 })).toBe("From ৳ 2 Cr");
    expect(label({ max_price: 20_000_000 })).toBe("Up to ৳ 2 Cr");
  });

  it("names short-lets and bathrooms", () => {
    expect(describeFilters({ ...noFilters, listing_type: "short_let", bathrooms: 2 }).map((c) => c.label)).toEqual([
      "Short-let",
      "2+ bathrooms",
    ]);
  });

  it("is empty when the query gave nothing to filter on", () => {
    expect(describeFilters(noFilters)).toEqual([]);
  });
});

const listing: SmartSearchListing = {
  id: "p1",
  title: "Luxury 4BR Apartment in Gulshan-1",
  type: "residential",
  subtype: "apartment",
  listing_type: "sale",
  price: 25_000_000,
  price_currency: "BDT",
  area_size: 2200,
  area_unit: "sqft",
  address: "Road 11, Gulshan-1",
  amenities: { bedrooms: 4, bathrooms: 4, lift: true },
  is_verified: true,
  published_at: "2026-09-01T00:00:00.000Z",
  area: { id: "gulshan-1", name: "Gulshan-1", city: "Dhaka" },
  media: [{ id: "m1", url: "https://img/1.jpg", thumbnail_url: null }],
  ai_badges: ["4 beds as requested"],
};

describe("toCardProperty", () => {
  it("fills a Property from the slim search card", () => {
    const property = toCardProperty(listing);
    expect(property).toMatchObject({
      id: "p1",
      title: listing.title,
      price: 25_000_000,
      is_verified: true,
      status: "active",
      area: { id: "gulshan-1", name: "Gulshan-1", city: "Dhaka" },
      amenities: { bedrooms: 4, bathrooms: 4, lift: true },
    });
    expect(property.media).toEqual([
      { id: "m1", property_id: "p1", media_type: "image", url: "https://img/1.jpg", public_id: "", thumbnail_url: null, display_order: 0 },
    ]);
  });

  it("shows a short-let as a rental, as Browse does", () => {
    expect(toCardProperty({ ...listing, listing_type: "short_let" }).listing_type).toBe("rent");
    expect(toCardProperty(listing).listing_type).toBe("sale");
  });

  it("copes with a listing that has no photo or publish date", () => {
    const property = toCardProperty({ ...listing, media: [], published_at: null });
    expect(property.media).toEqual([]);
    expect(property.published_at).toBeNull();
  });
});
