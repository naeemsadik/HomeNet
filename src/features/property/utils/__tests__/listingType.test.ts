import { isHolidayStayType, listingTypeLabel, pricePeriodFor, storedListingTypeFor } from "../listingType";

describe("listing type for people", () => {
  it("calls a short_let listing a holiday stay, not a sale", () => {
    expect(listingTypeLabel("short_let")).toBe("Holiday stay");
    expect(isHolidayStayType("short_let")).toBe(true);
  });

  it("keeps sale and rent as they were", () => {
    expect(listingTypeLabel("sale")).toBe("For Sale");
    expect(listingTypeLabel("rent")).toBe("For Rent");
    expect(isHolidayStayType("rent")).toBe(false);
    expect(isHolidayStayType(undefined)).toBe(false);
  });

  it("quotes a monthly price only for rentals", () => {
    expect(pricePeriodFor("rent")).toBe("/mo");
    expect(pricePeriodFor("sale")).toBe("");
    expect(pricePeriodFor("short_let")).toBe("");
  });
});

describe("storedListingTypeFor", () => {
  it("saves a holiday stay as short_let, whatever the form's rent/sale toggle says", () => {
    expect(storedListingTypeFor("rent", "short-let")).toBe("short_let");
    expect(storedListingTypeFor("sale", "short-let")).toBe("short_let");
  });

  it("leaves every other listing as chosen", () => {
    expect(storedListingTypeFor("rent", "apartment")).toBe("rent");
    expect(storedListingTypeFor("sale", undefined)).toBe("sale");
    expect(storedListingTypeFor("short_let", "house")).toBe("short_let");
  });
});
