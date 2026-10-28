import { parseGoogleGeocode, type GoogleGeocodeResult } from "../googleGeocode";

jest.mock("@/lib/googleMapsLoader", () => ({ loadGoogleMaps: jest.fn() }));

const result = (components: [string, string[]][]): GoogleGeocodeResult => ({
  address_components: components.map(([long_name, types]) => ({ long_name, types })),
});

describe("parseGoogleGeocode", () => {
  it("reads a Dhaka street address", () => {
    const place = parseGoogleGeocode([
      result([
        ["12", ["street_number"]],
        ["Road 103", ["route"]],
        ["Gulshan 2", ["sublocality_level_1", "sublocality", "political"]],
        ["Dhaka", ["locality", "political"]],
        ["Bangladesh", ["country", "political"]],
      ]),
    ]);
    expect(place).toEqual({
      address: "12, Road 103, Gulshan 2, Dhaka",
      areaNames: ["Gulshan 2", "Dhaka"],
    });
  });

  it("names the town for a place outside Dhaka, so the form can say no listed area matched", () => {
    const place = parseGoogleGeocode([
      result([
        ["Dhaka-Mymensingh Highway", ["route"]],
        ["Tongi", ["locality", "political"]],
        ["Gazipur District", ["administrative_area_level_2", "political"]],
      ]),
    ]);
    expect(place?.address).toBe("Dhaka-Mymensingh Highway, Tongi");
    expect(place?.areaNames).toEqual(["Tongi"]);
  });

  it("does not repeat a name in the address", () => {
    const place = parseGoogleGeocode([
      result([
        ["Banani", ["neighborhood", "political"]],
        ["Banani", ["sublocality_level_1", "sublocality", "political"]],
      ]),
    ]);
    expect(place?.address).toBe("Banani");
  });

  it("uses only the most specific result", () => {
    const place = parseGoogleGeocode([
      result([["Uttara", ["sublocality_level_1"]]]),
      result([["Dhaka", ["locality"]]]),
    ]);
    expect(place?.areaNames).toEqual(["Uttara"]);
  });

  it("returns null when there is nothing usable", () => {
    expect(parseGoogleGeocode([])).toBeNull();
    expect(parseGoogleGeocode(null)).toBeNull();
    expect(parseGoogleGeocode([result([["Bangladesh", ["country"]]])])).toBeNull();
  });
});
