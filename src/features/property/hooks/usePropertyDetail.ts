import { useQuery } from "@tanstack/react-query";
import { getProperties, getPropertyById } from "@/services/propertyApi";

export interface PropertyDetailArea {
  id: string;
  name: string;
  city: string;
  parent: { id: string; name: string } | null;
}

export interface PropertyDetailUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  auth_identities: { email: string | null; phone: string | null }[];
}

export interface PropertyDetailMedia {
  id: string;
  media_type: "image" | "video";
  url: string;
  thumbnail_url: string | null;
  display_order: number;
}

export interface PropertyDetail {
  id: string;
  title: string;
  description: string | null;
  type: "residential" | "commercial" | "land" | "parking";
  subtype: string | null;
  listing_type: "sale" | "rent";
  price: number;
  price_currency: string;
  area_size: number | null;
  area_unit: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  amenities: Record<string, unknown> | null;
  status: "draft" | "active" | "pending" | "sold" | "archived";
  is_verified: boolean;
  virtual_tour_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  area: PropertyDetailArea | null;
  user: PropertyDetailUser | null;
  media: PropertyDetailMedia[];
  _count: { media: number };
}

export function usePropertyDetail(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await getPropertyById(id);
      if (!response.data) throw new Error(response.message || "Property not found");
      return response.data as PropertyDetail;
    },
    enabled: !!id,
    refetchInterval: (query) => query.state.data?.status === "pending" ? 10_000 : false,
  });
}

export function useSimilarProperties(
  type: string | undefined,
  areaId: string | undefined,
  excludeId: string,
) {
  return useQuery({
    queryKey: ["properties", "similar", type, areaId, excludeId],
    queryFn: async () => {
      const response = await getProperties({
        type: type as "residential" | "commercial" | "land" | "parking" | undefined,
        area_id: areaId,
        limit: 5,
        status: "active",
      });
      return (response.data?.items ?? [])
        .filter((property) => property.id !== excludeId)
        .slice(0, 4);
    },
    enabled: !!type,
  });
}
