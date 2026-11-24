import {
  trackContactOwner,
  trackEvent,
  trackListPropertySubmit,
  trackPropertyView,
  trackSearchFilter,
} from "../analytics";

describe("analytics", () => {
  beforeEach(() => {
    window.gtag = jest.fn();
    window.va = jest.fn();
    window.dataLayer = [];
  });

  afterEach(() => {
    delete window.gtag;
    delete window.va;
    delete window.dataLayer;
  });

  it("dispatches events to gtag, va, and dataLayer", () => {
    trackEvent("custom_conversion", { test: 123 });

    expect(window.gtag).toHaveBeenCalledWith("event", "custom_conversion", { test: 123 });
    expect(window.va).toHaveBeenCalledWith("event", { name: "custom_conversion", data: { test: 123 } });
    expect(window.dataLayer).toContainEqual({ event: "custom_conversion", test: 123 });
  });

  it("tracks property_view correctly", () => {
    trackPropertyView({
      id: "prop-123",
      title: "Luxury Apt in Gulshan",
      price: 50000000,
      area: "Gulshan",
      listingType: "sale",
      propertyType: "residential",
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "property_view",
      expect.objectContaining({
        property_id: "prop-123",
        property_title: "Luxury Apt in Gulshan",
        price: "50000000",
        area: "Gulshan",
        listing_type: "sale",
        property_type: "residential",
      }),
    );
  });

  it("never sends the owner's name or phone to an analytics provider", () => {
    trackContactOwner({ propertyId: "prop-123", method: "call" });

    const [, , payload] = (window.gtag as jest.Mock).mock.calls[0];
    expect(Object.keys(payload)).toEqual(["property_id", "contact_method"]);
    // Personal data in an analytics payload breaks Google Analytics' terms,
    // so this asserts the shape rather than the absence of one key.
    expect(JSON.stringify(payload)).not.toMatch(/name|phone/i);
  });

  it("tracks contact_owner_click correctly", () => {
    trackContactOwner({
      propertyId: "prop-123",
      method: "whatsapp",
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "contact_owner_click",
      expect.objectContaining({
        property_id: "prop-123",
        contact_method: "whatsapp",
      }),
    );
  });

  it("tracks list_property_submit correctly", () => {
    trackListPropertySubmit({
      propertyId: "prop-456",
      purpose: "sale",
      propertyType: "residential",
      area: "Banani",
      price: 25000000,
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "list_property_submit",
      expect.objectContaining({
        property_id: "prop-456",
        purpose: "sale",
        property_type: "residential",
        area: "Banani",
        price: 25000000,
      }),
    );
  });

  it("tracks property_search_filter correctly", () => {
    trackSearchFilter({
      purpose: "rent",
      location: "Dhanmondi",
      minPrice: 20000,
      maxPrice: 40000,
      beds: 3,
      propertyType: "residential",
    });

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "property_search_filter",
      expect.objectContaining({
        search_purpose: "rent",
        search_location: "Dhanmondi",
        min_price: "20000",
        max_price: "40000",
        bedrooms: "3",
        property_type: "residential",
      }),
    );
  });

  it("does not throw if window or providers are undefined", () => {
    delete window.gtag;
    delete window.va;
    delete window.dataLayer;
    expect(() => trackEvent("test")).not.toThrow();
  });
});
