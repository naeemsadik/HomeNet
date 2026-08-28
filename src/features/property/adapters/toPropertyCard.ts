import type { Property as CardProperty } from "@/data/properties";
import type { Property } from "../types/property";

export type ApiPropertyCard = Omit<CardProperty, "id"> & { id: string };

export function toPropertyCard(property: Property): ApiPropertyCard {
  const amenities = property.amenities ?? {};
  const formattedPrice = `${property.price_currency || "BDT"} ${property.price.toLocaleString()}`;
  const imageMedia = property.media?.find((media) => media.media_type === "image") ?? property.media?.[0];

  return {
    id: property.id,
    title: property.title,
    location:
      [property.area?.name, property.area?.city].filter(Boolean).join(", ") ||
      property.address ||
      "Location unavailable",
    price: formattedPrice,
    monthlyPrice: `${formattedPrice}/mo`,
    image: imageMedia?.thumbnail_url || imageMedia?.url || "",
    tag: property.is_verified ? "Verified" : "",
    beds: Number(amenities.bedrooms ?? property.bedrooms ?? 0),
    baths: Number(amenities.bathrooms ?? property.bathrooms ?? 0),
    area: `${property.area_size?.toLocaleString() ?? "N/A"} ${property.area_unit || "sqft"}`,
    type:
      property.type === "commercial"
        ? "Commercial"
        : property.subtype?.toLowerCase().includes("house")
          ? "House"
          : property.subtype?.toLowerCase().includes("condo")
            ? "Condo"
            : "Apartment",
    forRent: property.listing_type === "rent",
    isVerified: property.is_verified,
  };
}
