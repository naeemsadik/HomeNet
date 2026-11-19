import type { Property } from "@/features/property/types/property";
import type { MessCard, MessDetail } from "../types/mess";

/** True when the lister placed a pin, so the card can appear on the map. */
export const hasPin = (card: Pick<MessCard, "location_lat" | "location_lng">): boolean =>
  card.location_lat != null && card.location_lng != null;

interface MapSource {
  id: string;
  title: string;
  subtype: MessCard["subtype"];
  area: MessCard["area"];
  location_lat?: number | null;
  location_lng?: number | null;
  /** All-in monthly cost, the number the listing leads with. */
  allInMin: number;
  is_verified: boolean;
  at: string;
  cover: string | null;
}

/**
 * The results map draws any listing shaped like a property. A mess listing is
 * shown there at its all-in monthly cost and opens its own page (a mess
 * subtype routes to /mess/:id).
 */
function toMapProperty(source: MapSource): Property {
  return {
    id: source.id,
    user_id: "",
    area_id: source.area?.id ?? "",
    title: source.title,
    description: null,
    type: "residential",
    subtype: source.subtype,
    listing_type: "rent",
    price: source.allInMin,
    price_currency: "BDT",
    area_size: null,
    area_unit: null,
    location_lat: source.location_lat ?? null,
    location_lng: source.location_lng ?? null,
    address: null,
    amenities: null,
    status: "active",
    is_verified: source.is_verified,
    virtual_tour_url: null,
    view_count: 0,
    published_at: null,
    created_at: source.at,
    updated_at: source.at,
    area: source.area ? { id: source.area.id, name: source.area.name, parent_area_id: null, city: null } : null,
    media: source.cover
      ? [{ id: `${source.id}-cover`, property_id: source.id, media_type: "image", url: source.cover, public_id: "", thumbnail_url: null, display_order: 0 }]
      : [],
  };
}

/** The cards that have a pin, for the results map. */
export const cardsForMap = (cards: MessCard[]): Property[] =>
  cards.filter(hasPin).map((card) =>
    toMapProperty({ ...card, allInMin: card.cost.all_in_min, at: card.last_confirmed_at, cover: card.cover?.url ?? null }),
  );

/** One listing for the map on its own page, or none when it has no pin. */
export const detailForMap = (detail: MessDetail): Property[] =>
  hasPin(detail)
    ? [toMapProperty({ ...detail, allInMin: detail.mess.all_in_min, at: detail.created_at, cover: detail.media[0]?.url ?? null })]
    : [];
