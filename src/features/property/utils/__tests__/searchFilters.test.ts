import type { Property } from "../../types/property";
import {
  applyClientFilters,
  clampRange,
  countActiveFilters,
  defaultSearchFilters,
  filterAddedSince,
  filtersFromParams,
  filtersToParamPatch,
  filtersToParams,
  hasClientFilters,
  isFiltersModalRequested,
  parsePriceToNumber,
  resetSearchFilters,
  toApiFilters,
  toPropertyTypeFilter,
  type SearchFilters,
} from "../searchFilters";

function property(over: Partial<Property> = {}): Property {
  return {
    id: "p1",
    user_id: "u1",
    area_id: "a1",
    title: "Flat",
    description: null,
    type: "residential",
    subtype: null,
    listing_type: "sale",
    price: 5000000,
    price_currency: "BDT",
    area_size: 1200,
    area_unit: "sqft",
    location_lat: null,
    location_lng: null,
    address: null,
    amenities: null,
    status: "active",
    is_verified: false,
    virtual_tour_url: null,
    view_count: 0,
    published_at: "2026-10-20T00:00:00.000Z",
    created_at: "2026-10-20T00:00:00.000Z",
    updated_at: "2026-10-20T00:00:00.000Z",
    ...over,
  } as Property;
}

describe("toPropertyTypeFilter", () => {
  it("passes API types through", () => {
    expect(toPropertyTypeFilter("residential")).toBe("residential");
    expect(toPropertyTypeFilter("land")).toBe("land");
  });

  it("folds legacy subtype links into residential", () => {
    // /buy?type=apartment is a live bookmark; the API 400s on it as a type.
    for (const legacy of ["apartment", "flat", "house", "villa"]) {
      expect(toPropertyTypeFilter(legacy)).toBe("residential");
    }
  });

  it("falls back to all for anything unknown or missing", () => {
    expect(toPropertyTypeFilter("spaceship")).toBe("all");
    expect(toPropertyTypeFilter(undefined)).toBe("all");
  });
});

describe("parsePriceToNumber", () => {
  it("reads the shapes people and old links actually use", () => {
    expect(parsePriceToNumber("5000000")).toBe(5000000);
    expect(parsePriceToNumber("50 lakh")).toBe(5000000);
    expect(parsePriceToNumber("50lac")).toBe(5000000);
    expect(parsePriceToNumber("1.5cr")).toBe(15000000);
    expect(parsePriceToNumber("2 crore")).toBe(20000000);
    expect(parsePriceToNumber("৳25,00,000")).toBe(2500000);
  });

  it("returns undefined for empty and unreadable values", () => {
    expect(parsePriceToNumber("")).toBeUndefined();
    expect(parsePriceToNumber("   ")).toBeUndefined();
    expect(parsePriceToNumber("cheap")).toBeUndefined();
  });
});

describe("filtersFromParams", () => {
  it("reads every legacy param a live link can carry", () => {
    const filters = filtersFromParams({
      query: "Gulshan",
      type: "apartment",
      min_price: "50 lakh",
      max_price: "1.5cr",
      bedrooms: "4",
      bathrooms: "2",
      is_verified: "true",
      city: "Dhaka",
    });

    expect(filters.query).toBe("Gulshan");
    expect(filters.propertyType).toBe("residential");
    // Prices normalise to plain numbers so the dropdowns can match them.
    expect(filters.minPrice).toBe("5000000");
    expect(filters.maxPrice).toBe("15000000");
    // The hero's `bedrooms=4` means "4 or more".
    expect(filters.minBedrooms).toBe("4");
    expect(filters.minBathrooms).toBe("2");
    expect(filters.verifiedOnly).toBe(true);
    expect(filters.area).toBe("Dhaka");
  });

  it("prefers ?search= when ?query= is absent", () => {
    expect(filtersFromParams({ search: "Banani" }).query).toBe("Banani");
  });

  it("derives purpose from subtype, status, listing_type and the route", () => {
    expect(filtersFromParams({ subtype: "short-let" }).purpose).toBe("short-let");
    expect(filtersFromParams({ status: "sold" }).purpose).toBe("sold");
    expect(filtersFromParams({ listing_type: "rent" }).purpose).toBe("rent");
    expect(filtersFromParams({ listing_type: "sale" }).purpose).toBe("sale");
    expect(filtersFromParams({}, { mode: "buy" }).purpose).toBe("sale");
    expect(filtersFromParams({}, { mode: "rent" }).purpose).toBe("rent");
    expect(filtersFromParams({}, { mode: "sold" }).purpose).toBe("sold");
    expect(filtersFromParams({}).purpose).toBe("all");
  });

  it("lets a fixed location win over the query string", () => {
    const filters = filtersFromParams({ city: "Dhaka" }, { fixedLocation: "Gulshan" });
    expect(filters.area).toBe("Gulshan");
  });

  it("reads the round-trip params the UI writes back", () => {
    const filters = filtersFromParams({
      max_bedrooms: "4",
      max_bathrooms: "3",
      min_area: "750",
      max_area: "2000",
      radius: "5",
      added: "7d",
      include_sold: "true",
      amenities: "lift,parking, generator ",
    });

    expect(filters.maxBedrooms).toBe("4");
    expect(filters.maxBathrooms).toBe("3");
    expect(filters.minSize).toBe("750");
    expect(filters.maxSize).toBe("2000");
    expect(filters.radius).toBe("5");
    expect(filters.addedToSite).toBe("7d");
    expect(filters.includeSold).toBe(true);
    expect(filters.amenities).toEqual(["lift", "parking", "generator"]);
  });

  it("drops counts that are not whole positive numbers", () => {
    const filters = filtersFromParams({ bedrooms: "abc", bathrooms: "0", min_area: "-5" });
    expect(filters.minBedrooms).toBe("");
    expect(filters.minBathrooms).toBe("");
    expect(filters.minSize).toBe("");
  });

  it("takes the first value when expo-router repeats a param", () => {
    expect(filtersFromParams({ query: ["a", "b"] }).query).toBe("a");
  });

  it("has no default location", () => {
    expect(filtersFromParams({}).area).toBe("");
    expect(defaultSearchFilters.area).toBe("");
  });
});

describe("isFiltersModalRequested", () => {
  it("opens for every param the old links used", () => {
    expect(isFiltersModalRequested({ filters: "open" })).toBe(true);
    expect(isFiltersModalRequested({ filters: "true" })).toBe(true);
    expect(isFiltersModalRequested({ modal: "filters" })).toBe(true);
  });

  it("stays closed otherwise", () => {
    expect(isFiltersModalRequested({})).toBe(false);
    expect(isFiltersModalRequested({ filters: "closed" })).toBe(false);
  });
});

describe("filtersToParams", () => {
  it("round-trips through filtersFromParams", () => {
    const original: SearchFilters = {
      ...defaultSearchFilters,
      purpose: "rent",
      query: "Banani",
      area: "Dhaka",
      radius: "5",
      propertyType: "residential",
      addedToSite: "3d",
      includeSold: true,
      verifiedOnly: true,
      minPrice: "2500000",
      maxPrice: "10000000",
      minBedrooms: "2",
      maxBedrooms: "4",
      minBathrooms: "1",
      maxBathrooms: "3",
      minSize: "750",
      maxSize: "2000",
      amenities: ["lift", "parking"],
    };

    expect(filtersFromParams(filtersToParams(original))).toEqual(original);
  });

  it("round-trips a short-let and a sold search", () => {
    for (const purpose of ["short-let", "sold"] as const) {
      const filters = { ...defaultSearchFilters, purpose };
      expect(filtersFromParams(filtersToParams(filters)).purpose).toBe(purpose);
    }
  });

  it("omits empty values rather than writing blanks", () => {
    expect(filtersToParams(defaultSearchFilters)).toEqual({});
  });

  it("never writes location or city on a pinned-area page", () => {
    const params = filtersToParams(
      { ...defaultSearchFilters, area: "Gulshan" },
      { fixedLocation: "Gulshan" },
    );
    expect(params.city).toBeUndefined();
    expect(params.location).toBeUndefined();
  });
});

describe("filtersToParamPatch", () => {
  it("blanks only the params the URL actually carries", () => {
    const patch = filtersToParamPatch(
      { ...defaultSearchFilters, minPrice: "100000" },
      { current: { bathrooms: "2", amenities: "lift" } },
    );
    // router.setParams merges, so a filter being cleared needs an empty value.
    expect(patch.bathrooms).toBe("");
    expect(patch.amenities).toBe("");
    expect(patch.min_price).toBe("100000");
    // Untouched params stay out, so a shared link does not grow a tail of
    // empty keys.
    expect(patch).not.toHaveProperty("max_area");
    expect(patch).not.toHaveProperty("radius");
  });

  it("blanks everything when it is not told what the URL holds", () => {
    const patch = filtersToParamPatch(defaultSearchFilters);
    for (const key of ["bathrooms", "amenities", "min_price"]) {
      expect(patch[key]).toBe("");
    }
  });
});

describe("toApiFilters", () => {
  it("sends bathrooms as a minimum", () => {
    // Bug 1: the hero wrote `bathrooms` to the URL and Browse never read it.
    expect(toApiFilters({ ...defaultSearchFilters, minBathrooms: "2" }).bathrooms).toBe(2);
  });

  it("maps size onto min_area and max_area", () => {
    const api = toApiFilters({ ...defaultSearchFilters, minSize: "750", maxSize: "2000" });
    expect(api.min_area).toBe(750);
    expect(api.max_area).toBe(2000);
  });

  it("swaps a range a hand-edited URL inverted", () => {
    const api = toApiFilters({ ...defaultSearchFilters, minPrice: "10000000", maxPrice: "2500000" });
    expect(api.min_price).toBe(2500000);
    expect(api.max_price).toBe(10000000);
  });

  it("swaps inverted bedroom and bathroom bounds before API minimums", () => {
    const api = toApiFilters({
      ...defaultSearchFilters,
      minBedrooms: "5",
      maxBedrooms: "2",
      minBathrooms: "4",
      maxBathrooms: "1",
    });
    expect(api.bedrooms).toBe(2);
    expect(api.bathrooms).toBe(1);
  });

  it("keeps the short-let, sold and verified behaviour", () => {
    // A holiday stay is its own listing type in the API, not rent plus a text
    // search for the words, which also matched ordinary rentals saying them.
    const shortLet = toApiFilters({ ...defaultSearchFilters, purpose: "short-let" });
    expect(shortLet.listing_type).toBe("short_let");
    expect(shortLet.search).toBeUndefined();

    const sold = toApiFilters({ ...defaultSearchFilters, purpose: "sold" });
    expect(sold.status).toBe("sold");

    expect(toApiFilters({ ...defaultSearchFilters }).status).toBe("active");
    expect(toApiFilters({ ...defaultSearchFilters, includeSold: true }).status).toBeUndefined();
    expect(toApiFilters({ ...defaultSearchFilters, verifiedOnly: true }).is_verified).toBe(true);
  });

  it("never sends a city param, whatever the link carried", () => {
    // The deployed API answers any `city` with 400 "property city should not
    // exist". The place is applied by resolveScope/useBrowseFeed instead.
    const fromLegacyLink = filtersFromParams({ city: "Dhaka" });
    expect(fromLegacyLink.area).toBe("Dhaka");
    expect(toApiFilters(fromLegacyLink)).not.toHaveProperty("city");
    expect(toApiFilters({ ...defaultSearchFilters, area: "Gulshan" })).not.toHaveProperty("city");
  });

  it("leaves type unset for an any-type search", () => {
    expect(toApiFilters(defaultSearchFilters).type).toBeUndefined();
    expect(toApiFilters({ ...defaultSearchFilters, propertyType: "land" }).type).toBe("land");
  });

  it("widens the page only when a client-side pass has to narrow it", () => {
    expect(toApiFilters(defaultSearchFilters).limit).toBe(20);
    expect(toApiFilters({ ...defaultSearchFilters, addedToSite: "24h" }).limit).toBe(100);
    expect(toApiFilters({ ...defaultSearchFilters, amenities: ["lift"] }).limit).toBe(100);
    expect(toApiFilters({ ...defaultSearchFilters, maxBathrooms: "2" }).limit).toBe(100);
  });
});

describe("hasClientFilters", () => {
  it("is true only for the filters the API cannot apply", () => {
    expect(hasClientFilters(defaultSearchFilters)).toBe(false);
    expect(hasClientFilters({ ...defaultSearchFilters, minPrice: "100000" })).toBe(false);
    expect(hasClientFilters({ ...defaultSearchFilters, amenities: ["lift"] })).toBe(true);
    expect(hasClientFilters({ ...defaultSearchFilters, addedToSite: "7d" })).toBe(true);
    expect(hasClientFilters({ ...defaultSearchFilters, maxBathrooms: "2" })).toBe(true);
  });
});

describe("filterAddedSince", () => {
  const now = Date.parse("2026-10-20T12:00:00.000Z");

  it("keeps only listings inside the window", () => {
    const fresh = property({ id: "fresh", published_at: "2026-10-20T06:00:00.000Z" });
    const stale = property({ id: "stale", published_at: "2026-10-01T06:00:00.000Z" });
    expect(filterAddedSince([fresh, stale], "24h", now).map((p) => p.id)).toEqual(["fresh"]);
  });

  it("leaves out a listing with no readable date", () => {
    const undated = property({ published_at: null, created_at: "" });
    expect(filterAddedSince([undated], "24h", now)).toEqual([]);
  });

  it("passes everything through when no window is chosen", () => {
    const items = [property()];
    expect(filterAddedSince(items, "", now)).toBe(items);
  });
});

describe("applyClientFilters", () => {
  it("keeps a listing only when every chosen amenity is truthy", () => {
    const both = property({ id: "both", amenities: { lift: true, parking: true } });
    const one = property({ id: "one", amenities: { lift: true } });
    const falsy = property({ id: "falsy", amenities: { lift: true, parking: false } });
    const none = property({ id: "none", amenities: null });

    const results = applyClientFilters([both, one, falsy, none], {
      ...defaultSearchFilters,
      amenities: ["lift", "parking"],
    });
    expect(results.map((p) => p.id)).toEqual(["both"]);
  });

  it("applies a bathroom ceiling and drops listings that cannot answer it", () => {
    const two = property({ id: "two", bathrooms: 2 });
    const four = property({ id: "four", bathrooms: 4 });
    const unknown = property({ id: "unknown" });

    const results = applyClientFilters([two, four, unknown], {
      ...defaultSearchFilters,
      maxBathrooms: "3",
    });
    expect(results.map((p) => p.id)).toEqual(["two"]);
  });

  it("normalizes inverted room bounds before client-side ceilings", () => {
    const two = property({ id: "two", bedrooms: 2, bathrooms: 2 });
    const four = property({ id: "four", bedrooms: 4, bathrooms: 4 });
    const six = property({ id: "six", bedrooms: 6, bathrooms: 6 });

    const results = applyClientFilters([two, four, six], {
      ...defaultSearchFilters,
      minBedrooms: "5",
      maxBedrooms: "2",
      minBathrooms: "5",
      maxBathrooms: "2",
    });
    expect(results.map((p) => p.id)).toEqual(["two", "four"]);
  });

  it("reads a bathroom count kept on amenities", () => {
    const fromAmenities = property({ id: "amen", amenities: { bathrooms: 2 } });
    const results = applyClientFilters([fromAmenities], {
      ...defaultSearchFilters,
      maxBathrooms: "3",
    });
    expect(results.map((p) => p.id)).toEqual(["amen"]);
  });

  it("re-asserts the sold filter the API ignores", () => {
    const sold = property({ id: "sold", status: "sold" });
    const active = property({ id: "active", status: "active" });
    const results = applyClientFilters([sold, active], {
      ...defaultSearchFilters,
      purpose: "sold",
    });
    expect(results.map((p) => p.id)).toEqual(["sold"]);
  });

  it("returns everything when nothing client-side is active", () => {
    const items = [property(), property({ id: "p2" })];
    expect(applyClientFilters(items, defaultSearchFilters)).toHaveLength(2);
  });
});

describe("countActiveFilters", () => {
  it("counts nothing for a fresh search", () => {
    expect(countActiveFilters(defaultSearchFilters)).toBe(0);
  });

  it("does not count the search itself", () => {
    const searching = {
      ...defaultSearchFilters,
      query: "Gulshan",
      area: "Dhaka",
      purpose: "rent" as const,
    };
    expect(countActiveFilters(searching)).toBe(0);
  });

  it("counts a range as one group however many ends are set", () => {
    expect(countActiveFilters({ ...defaultSearchFilters, minPrice: "100000" })).toBe(1);
    expect(
      countActiveFilters({ ...defaultSearchFilters, minPrice: "100000", maxPrice: "500000" }),
    ).toBe(1);
  });

  it("counts amenities as one group however many are ticked", () => {
    // Bug 2: the hero badge added one per amenity while sending none of them.
    expect(
      countActiveFilters({
        ...defaultSearchFilters,
        amenities: ["lift", "parking", "gym", "pool"],
      }),
    ).toBe(1);
  });

  it("gives the hero and Browse the same number for the same filters", () => {
    const filters: SearchFilters = {
      ...defaultSearchFilters,
      minPrice: "2500000",
      maxPrice: "10000000",
      minBedrooms: "3",
      minBathrooms: "2",
      minSize: "1000",
      propertyType: "residential",
      addedToSite: "7d",
      amenities: ["lift", "parking"],
      verifiedOnly: true,
      includeSold: true,
      radius: "5",
    };
    // price, beds, baths, size, type, added, amenities, verified, sold, radius
    expect(countActiveFilters(filters)).toBe(10);

    // The hero builds a URL, Browse reads it: the count has to survive.
    expect(countActiveFilters(filtersFromParams(filtersToParams(filters)))).toBe(10);
  });
});

describe("clampRange", () => {
  it("leaves a valid pair alone", () => {
    expect(clampRange("1000", "2000", "min")).toEqual({ min: "1000", max: "2000" });
  });

  it("clears the max when a new min overtakes it", () => {
    expect(clampRange("3000", "2000", "min")).toEqual({ min: "3000", max: "" });
  });

  it("clears the min when a new max drops below it", () => {
    expect(clampRange("3000", "2000", "max")).toEqual({ min: "", max: "2000" });
  });

  it("leaves half-open ranges alone", () => {
    expect(clampRange("", "2000", "max")).toEqual({ min: "", max: "2000" });
    expect(clampRange("1000", "", "min")).toEqual({ min: "1000", max: "" });
  });
});

describe("resetSearchFilters", () => {
  it("keeps the page's purpose and pinned area", () => {
    const current: SearchFilters = {
      ...defaultSearchFilters,
      purpose: "rent",
      area: "Gulshan",
      minPrice: "100000",
      amenities: ["lift"],
    };
    const reset = resetSearchFilters(current, { fixedLocation: "Gulshan" });

    expect(reset.purpose).toBe("rent");
    expect(reset.area).toBe("Gulshan");
    expect(reset.minPrice).toBe("");
    expect(reset.amenities).toEqual([]);
    expect(countActiveFilters(reset)).toBe(0);
  });

  it("clears the area when the page does not pin one", () => {
    const reset = resetSearchFilters({ ...defaultSearchFilters, area: "Dhaka" });
    expect(reset.area).toBe("");
  });
});
