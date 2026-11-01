import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is loaded by Jest environment
import { createRoot } from "react-dom/client";
import { PropertyResultsMap } from "../PropertyResultsMap";
import type { Property } from "../../types/property";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-image", () => ({
  Image: ({ source, style }: any) => <img src={source?.uri} style={style} alt="" />,
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("@/components/icons", () => ({
  MapPin: () => <span>MapPin</span>,
  X: () => <span>X</span>,
}));

describe("PropertyResultsMap Component", () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  const mockProperty: Property = {
    id: "prop-1",
    user_id: "user-1",
    area_id: "area-1",
    type: "residential",
    subtype: "apartment",
    title: "Modern Apartment in Gulshan",
    description: "Spacious luxury flat",
    price: 35000,
    price_currency: "BDT",
    listing_type: "rent",
    status: "active",
    address: "Road 11, Gulshan 2",
    location_lat: 23.7925,
    location_lng: 90.4078,
    area_size: 1800,
    area_unit: "sqft",
    bedrooms: 3,
    bathrooms: 3,
    amenities: null,
    is_verified: true,
    virtual_tour_url: null,
    view_count: 120,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: "media-1",
        property_id: "prop-1",
        url: "https://example.com/photo.jpg",
        public_id: "photo-1",
        thumbnail_url: null,
        media_type: "image",
        display_order: 0,
      },
    ],
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
  });

  it("renders peek card without nested HTML <button> elements", () => {
    act(() => {
      root.render(<PropertyResultsMap properties={[mockProperty]} />);
    });

    const buttons = container?.querySelectorAll("button");
    expect(buttons && buttons.length).toBeGreaterThan(0);

    // Verify no button has an ancestor button
    buttons?.forEach((button) => {
      expect(button.closest("button") === button).toBe(true);
      expect(button.parentElement?.closest("button")).toBeNull();
    });
  });
});
