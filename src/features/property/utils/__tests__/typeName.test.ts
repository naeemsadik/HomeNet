import { listingAddress, listingTypeName } from "../typeName";

describe("listingTypeName", () => {
  it("shows the kind of property as words, not the stored code", () => {
    expect(listingTypeName({ subtype: "apartment_project", type: "residential" })).toBe("Apartment Project");
    expect(listingTypeName({ subtype: "apartment" })).toBe("Apartment");
    expect(listingTypeName({ subtype: null, type: "commercial" })).toBe("Commercial");
    expect(listingTypeName({ subtype: "short-let" })).toBe("Holiday Stay");
    expect(listingTypeName({})).toBeNull();
  });
});

describe("listingAddress", () => {
  it("puts the street address first and leaves out what it already names", () => {
    expect(listingAddress({ address: "Bijoy Path, North Badda", area: { name: "Badda", city: "Dhaka" } })).toBe(
      "Bijoy Path, North Badda, Dhaka",
    );
    expect(listingAddress({ area: { name: "Mirpur", city: "Dhaka" } })).toBe("Mirpur, Dhaka");
    expect(listingAddress({ address: " ", area: null })).toBeNull();
  });
});
