import { effectiveListingStatus, translateListingStatus } from "@/i18n";
import { defaultSearchFilters, filtersFromParams, filtersToParams, toApiFilters } from "@/features/property/utils/searchFilters";

/**
 * The backend has one closed status, `sold`, and uses it for closed lets too.
 * These are the two halves of living with that: never send a word the API
 * rejects, and never show a word the reader would misread.
 */

describe("effectiveListingStatus", () => {
  it("calls a closed sale sold and a closed let rented", () => {
    expect(effectiveListingStatus("sold", "sale")).toBe("sold");
    expect(effectiveListingStatus("sold", "rent")).toBe("rented");
    // A short let is a let.
    expect(effectiveListingStatus("sold", "short_let")).toBe("rented");
  });

  it("leaves every other status alone", () => {
    for (const status of ["active", "pending", "draft", "archived", "rejected"]) {
      expect(effectiveListingStatus(status, "rent")).toBe(status);
      expect(effectiveListingStatus(status, "sale")).toBe(status);
    }
  });

  it("falls back to sold when the listing type is unknown", () => {
    // Better the stored status than a guess at the opposite meaning.
    expect(effectiveListingStatus("sold", null)).toBe("sold");
    expect(effectiveListingStatus("sold", undefined)).toBe("sold");
  });

  it("tolerates casing and empty input", () => {
    expect(effectiveListingStatus("SOLD", "RENT")).toBe("rented");
    expect(effectiveListingStatus("", "rent")).toBe("");
    expect(effectiveListingStatus(null, "rent")).toBe("");
  });

  it("has Bangla for both words, and they differ", () => {
    // Normalised: the same Bangla renders in more than one Unicode
    // composition, and a literal in this file need not match the locale's.
    const bn = (status: string) => translateListingStatus(status, "bn").normalize("NFC");
    expect(bn("rented")).toBe("ভাড়া হয়েছে".normalize("NFC"));
    expect(bn("sold")).toBe("বিক্রি হয়েছে".normalize("NFC"));
    // The two closed states must never collapse into one word.
    expect(bn("rented")).not.toBe(bn("sold"));
    expect(bn("rented")).not.toBe("rented");
  });
});

describe("closed-listing API mapping", () => {
  it("never sends a status the backend rejects", () => {
    // Verified against production on 2026-11-26: `status=rented` answers
    // 400 with "status must be one of ... draft, active, pending, sold,
    // archived, rejected".
    for (const purpose of ["sale", "rent", "short-let"] as const) {
      const params = toApiFilters({ ...defaultSearchFilters, purpose, availability: "closed" });
      expect(params.status).toBe("sold");
    }
  });

  it("keeps the listing type on a closed search, so /buy cannot return lets", () => {
    expect(
      toApiFilters({ ...defaultSearchFilters, purpose: "sale", availability: "closed" }).listing_type,
    ).toBe("sale");
    expect(
      toApiFilters({ ...defaultSearchFilters, purpose: "rent", availability: "closed" }).listing_type,
    ).toBe("rent");
  });

  it("asks for active listings by default", () => {
    expect(toApiFilters(defaultSearchFilters).status).toBe("active");
  });
});

describe("closed-listing URL vocabulary", () => {
  it("writes rented on a rental route and sold on a sale route", () => {
    expect(
      filtersToParams({ ...defaultSearchFilters, purpose: "rent", availability: "closed" }).status,
    ).toBe("rented");
    expect(
      filtersToParams({ ...defaultSearchFilters, purpose: "sale", availability: "closed" }).status,
    ).toBe("sold");
  });

  it("reads both words back as the same closed state", () => {
    expect(filtersFromParams({ status: "rented", listing_type: "rent" }).availability).toBe("closed");
    expect(filtersFromParams({ status: "sold", listing_type: "sale" }).availability).toBe("closed");
  });

  it("round-trips /rent?status=rented without turning it into a sale", () => {
    const back = filtersFromParams({ status: "rented" }, { mode: "rent" });
    expect(back.purpose).toBe("rent");
    expect(back.availability).toBe("closed");
    expect(toApiFilters(back)).toMatchObject({ listing_type: "rent", status: "sold" });
  });
});
