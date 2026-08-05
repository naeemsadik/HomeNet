export interface Area {
  id: string;
  name: string;
  type: 'DIVISION' | 'CITY' | 'DISTRICT' | 'NEIGHBORHOOD' | 'UPZILA';
  parent_area_id: string | null;
}

export interface Verification {
  id: string;
  status: 'pending' | 'verified' | 'rejected';
  notes: string | null;
  verified_at: string | null;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: 'image' | 'video';
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
  type: 'residential' | 'commercial' | 'land' | 'parking';
  subtype: string | null;
  listing_type: 'sale' | 'rent';
  price: number;
  price_currency: string;
  area_size: number | null;
  area_unit: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  amenities: Record<string, unknown> | null;
  status: 'draft' | 'active' | 'pending' | 'sold' | 'archived';
  is_verified: boolean;
  virtual_tour_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  area?: Area;
  media?: PropertyMedia[];
  verification?: Verification | null;

  // Convenience display properties
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PropertyFilters {
  city?: string;
  area_id?: string;
  type?: 'residential' | 'commercial' | 'land' | 'parking';
  listing_type?: 'sale' | 'rent';
  status?: 'active';
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  is_verified?: boolean;
  sort_by?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}
