import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";

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
      const { data } = await apiClient.get<ApiResponse<PropertyDetail>>(
        `/v1/properties/${id}`,
      );
      if (!data.data) throw new Error("Property not found");
      return data.data;
    },
    enabled: !!id,
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
      const { data } = await apiClient.get<
        ApiResponse<{ items: PropertyDetail[]; total: number }>
      >("/v1/properties", {
        params: { type, area_id: areaId, limit: 5, status: "active" },
      });
      return (data.data?.items ?? []).filter((p) => p.id !== excludeId).slice(0, 4);
    },
    enabled: !!type,
  });
}
