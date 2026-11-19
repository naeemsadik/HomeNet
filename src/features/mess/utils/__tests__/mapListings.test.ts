import { cardsForMap, detailForMap, hasPin } from "../mapListings";
import type { MessCard, MessDetail } from "../../types/mess";

const card = (fields: Partial<MessCard> = {}): MessCard =>
  ({
    id: "m1",
    title: "Two seats open, Kuril",
    subtype: "mess",
    area: { id: "kuril", name: "Kuril" },
    location_lat: 23.82,
    location_lng: 90.42,
    cover: { url: "https://img/cover.jpg", label: null },
    cost: { all_in_min: 5850, all_in_max: 6000, rent_from: 4800, costs_complete: true },
    is_verified: true,
    last_confirmed_at: "2026-11-10T00:00:00Z",
    ...fields,
  }) as MessCard;

describe("hasPin", () => {
  it("is true only when both coordinates are set, and 0 counts as a coordinate", () => {
    expect(hasPin({ location_lat: 23.8, location_lng: 90.4 })).toBe(true);
    expect(hasPin({ location_lat: 0, location_lng: 0 })).toBe(true);
    expect(hasPin({ location_lat: 23.8, location_lng: null })).toBe(false);
    expect(hasPin({})).toBe(false);
  });
});

describe("cardsForMap", () => {
  it("leaves out cards without a pin and shows the rest at their all-in monthly cost", () => {
    const pins = cardsForMap([card(), card({ id: "m2", location_lat: null, location_lng: null })]);

    expect(pins).toHaveLength(1);
    expect(pins[0]).toMatchObject({
      id: "m1",
      price: 5850,
      price_currency: "BDT",
      listing_type: "rent",
      subtype: "mess",
      location_lat: 23.82,
      location_lng: 90.42,
    });
    expect(pins[0].media?.[0].url).toBe("https://img/cover.jpg");
  });

  it("copes with a card that has no cover or area", () => {
    const [pin] = cardsForMap([card({ cover: null, area: null })]);

    expect(pin.media).toEqual([]);
    expect(pin.area).toBeNull();
  });
});

describe("detailForMap", () => {
  const detail = (fields: Partial<MessDetail> = {}): MessDetail =>
    ({
      ...card(),
      media: [{ id: "x", url: "https://img/a.jpg", label: null, display_order: 0 }],
      mess: { all_in_min: 5850 },
      created_at: "2026-11-01T00:00:00Z",
      ...fields,
    }) as unknown as MessDetail;

  it("gives one pin for a listing with coordinates", () => {
    expect(detailForMap(detail())).toHaveLength(1);
    expect(detailForMap(detail())[0].media?.[0].url).toBe("https://img/a.jpg");
  });

  it("gives none when the lister placed no pin", () => {
    expect(detailForMap(detail({ location_lat: null, location_lng: null }))).toEqual([]);
  });
});
