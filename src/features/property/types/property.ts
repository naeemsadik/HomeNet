import type { Area, ListingType, PropertyStatus, PropertyType } from "@/types/api";

export interface Verification {
  id: string;
  status: "pending" | "verified" | "rejected";
  notes: string | null;
  verified_at: string | null;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: "image" | "video";
  url: string;
  public_id: string;
  thumbnail_url: string | null;
  display_order: number;
}

export interface Property {
  id: string;
  user_id: string;
  area_id: string;
  title: string;
  description: string | null;
  type: PropertyType;
  subtype: string | null;
  listing_type: ListingType;
  price: number;
  price_currency: string;
  area_size: number | null;
  area_unit: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  amenities: Record<string, unknown> | null;
  status: PropertyStatus;
  is_verified: boolean;
  virtual_tour_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  distance?: number;
  area?: Area | null;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    auth_identities?: { email: string | null; phone: string | null }[];
  } | null;
  media?: PropertyMedia[];
  verification?: Verification | null;
  _count?: { media: number };
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages?: number;
}

export interface PropertyFilters {
  city?: string;
  area_id?: string;
  type?: PropertyType;
  listing_type?: ListingType;
  status?: PropertyStatus;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  is_verified?: boolean;
  sort_by?: "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc" | "view_count_desc";
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}
