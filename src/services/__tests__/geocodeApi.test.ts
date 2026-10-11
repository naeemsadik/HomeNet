import { clearGeocodeCache, parseGeocode, reverseGeocode } from "@/services/geocodeApi";

// Answers copied from real lookups of Dhaka coordinates.
const GULSHAN = {
  display_name: "Enamul Haque Chowdhury Road, Road 10, Korail, Gulshan, Dhaka, …",
  address: { road: "Enamul Haque Chowdhury Road, Road 10", quarter: "Korail", suburb: "Gulshan", city: "Dhaka", county: "Dhaka Metropolitan" },
};
const SHOP_PIN = {
  address: {
    shop: "SWISH - Luxury Lifestyle (Banani)",
    house_number: "Tajwar Centre",
    road: "Road 19A",
    quarter: "Korail",
    suburb: "Gulshan",
    city: "Dhaka",
  },
};
const NO_ROAD = { address: { residential: "Dhanmondi Residential Area", suburb: "Lalmatia", county: "Dhaka Metropolitan" } };

describe("parseGeocode", () => {
  it("builds an address from the road and neighbourhoods and lists the area names", () => {
    expect(parseGeocode(GULSHAN)).toEqual({
      address: "Enamul Haque Chowdhury Road, Road 10, Korail, Gulshan, Dhaka",
      areaNames: ["Korail", "Gulshan"],
    });
  });

  it("keeps a building name that sits in house_number, and ignores a shop's name", () => {
    const result = parseGeocode(SHOP_PIN);
    expect(result?.address).toBe("Tajwar Centre, Road 19A, Korail, Gulshan, Dhaka");
    expect(result?.address).not.toMatch(/Banani|SWISH/);
    expect(result?.areaNames).not.toContain("SWISH - Luxury Lifestyle (Banani)");
  });

  it("copes with no road and no city", () => {
    expect(parseGeocode(NO_ROAD)).toEqual({
      address: "Dhanmondi Residential Area, Lalmatia",
      areaNames: ["Dhanmondi Residential Area", "Lalmatia"],
    });
  });

  it("never repeats a name", () => {
    expect(parseGeocode({ address: { road: "Road 5", suburb: "Gulshan", quarter: "gulshan", city: "Gulshan" } })?.address).toBe("Road 5, gulshan");
  });

  it("caps the address at the form's limit", () => {
    expect(parseGeocode({ address: { road: "R".repeat(500) } })?.address).toHaveLength(300);
  });

  it.each([null, undefined, "text", 5, {}, { error: "Unable to geocode" }, { address: "no" }, { address: {} }])(
    "returns null for %p",
    (body) => {
      expect(parseGeocode(body)).toBeNull();
    },
  );
});

describe("reverseGeocode", () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    clearGeocodeCache();
    (globalThis as { fetch: unknown }).fetch = fetchMock;
  });

  const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

  it("asks the geocoder for English names at street level, with no sign-in token", async () => {
    fetchMock.mockResolvedValue(ok(GULSHAN));
    await reverseGeocode({ lat: 23.7931, lng: 90.4065 });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("https://nominatim.openstreetmap.org/reverse?");
    expect(url).toContain("lat=23.7931");
    expect(url).toContain("lon=90.4065");
    expect(url).toContain("accept-language=en");
    expect(url).toContain("addressdetails=1");
    expect(Object.keys(options.headers)).toEqual(["Accept"]); // no Authorization
  });

  it("asks once for pins about 10 m apart", async () => {
    fetchMock.mockResolvedValue(ok(GULSHAN));
    await reverseGeocode({ lat: 23.793101, lng: 90.406501 });
    await reverseGeocode({ lat: 23.793149, lng: 90.406549 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("asks again for a pin somewhere else", async () => {
    fetchMock.mockResolvedValue(ok(GULSHAN));
    await reverseGeocode({ lat: 23.7931, lng: 90.4065 });
    await reverseGeocode({ lat: 23.8193, lng: 90.4526 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when the service refuses (rate limit, outage) and does not cache the failure", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) });
    await expect(reverseGeocode({ lat: 23.7, lng: 90.3 })).rejects.toThrow(/429/);
    fetchMock.mockResolvedValueOnce(ok(GULSHAN));
    await expect(reverseGeocode({ lat: 23.7, lng: 90.3 })).resolves.toMatchObject({ areaNames: ["Korail", "Gulshan"] });
  });

  it("resolves null when the spot has no address (open water, say)", async () => {
    fetchMock.mockResolvedValue(ok({ error: "Unable to geocode" }));
    await expect(reverseGeocode({ lat: 21, lng: 91 })).resolves.toBeNull();
  });
});
