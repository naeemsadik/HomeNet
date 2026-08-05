import { useState, useEffect, useCallback } from "react";
import apiClient from "@/services/apiClient";
import type { Property, PropertyFilters, PaginatedResponse } from "../types/property";

const mockProperties: Property[] = [
  {
    id: "prop-1",
    user_id: "user-1",
    area_id: "area-gulshan",
    title: "Luxury Duplex Apartment in Gulshan 2",
    description: "Modern architectural design with private balcony, Italian marble floors, and 24/7 high-level security.",
    type: "residential",
    subtype: "Apartment",
    listing_type: "sale",
    price: 48000000,
    price_currency: "BDT",
    area_size: 3240,
    area_unit: "sqft",
    location_lat: 23.7925,
    location_lng: 90.4078,
    address: "Road 71, Gulshan 2, Dhaka",
    amenities: { pool: true, gym: true, elevator: true, parking: 2 },
    status: "active",
    is_verified: true,
    virtual_tour_url: null,
    view_count: 1420,
    published_at: "2026-08-01T10:00:00Z",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z",
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3240,
    area: { id: "area-gulshan", name: "Gulshan 2", type: "NEIGHBORHOOD", parent_area_id: "area-dhaka" },
    verification: { id: "ver-1", status: "verified", notes: "Title deed checked", verified_at: "2026-08-02T12:00:00Z" },
    media: [
      { id: "m-1", property_id: "prop-1", media_type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85", public_id: "p1", thumbnail_url: null, display_order: 1 },
      { id: "m-2", property_id: "prop-1", media_type: "image", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", public_id: "p2", thumbnail_url: null, display_order: 2 },
      { id: "m-3", property_id: "prop-1", media_type: "image", url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85", public_id: "p3", thumbnail_url: null, display_order: 3 },
    ],
  },
  {
    id: "prop-2",
    user_id: "user-2",
    area_id: "area-banani",
    title: "Quiet Parkside Residence",
    description: "Spacious 3-bedroom apartment facing Banani Lake Park.",
    type: "residential",
    subtype: "Apartment",
    listing_type: "rent",
    price: 185000,
    price_currency: "BDT",
    area_size: 2150,
    area_unit: "sqft",
    location_lat: 23.7937,
    location_lng: 90.4046,
    address: "Block E, Banani, Dhaka",
    amenities: { elevator: true, generator: true },
    status: "active",
    is_verified: true,
    virtual_tour_url: null,
    view_count: 890,
    published_at: "2026-08-02T10:00:00Z",
    created_at: "2026-08-02T10:00:00Z",
    updated_at: "2026-08-02T10:00:00Z",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2150,
    area: { id: "area-banani", name: "Banani", type: "NEIGHBORHOOD", parent_area_id: "area-dhaka" },
    verification: { id: "ver-2", status: "verified", notes: "Ownership confirmed", verified_at: "2026-08-03T10:00:00Z" },
    media: [
      { id: "m-4", property_id: "prop-2", media_type: "image", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=85", public_id: "p4", thumbnail_url: null, display_order: 1 },
      { id: "m-5", property_id: "prop-2", media_type: "image", url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=85", public_id: "p5", thumbnail_url: null, display_order: 2 },
    ],
  },
  {
    id: "prop-3",
    user_id: "user-3",
    area_id: "area-bashundhara",
    title: "Sunlit Family Condominium",
    description: "Bright multi-family unit in Block C, Bashundhara R/A with modern fittings.",
    type: "residential",
    subtype: "Condo",
    listing_type: "sale",
    price: 26000000,
    price_currency: "BDT",
    area_size: 1980,
    area_unit: "sqft",
    location_lat: 23.8161,
    location_lng: 90.426,
    address: "Block C, Bashundhara R/A, Dhaka",
    amenities: { security: true, parking: 1 },
    status: "active",
    is_verified: false,
    virtual_tour_url: null,
    view_count: 650,
    published_at: "2026-08-03T10:00:00Z",
    created_at: "2026-08-03T10:00:00Z",
    updated_at: "2026-08-03T10:00:00Z",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1980,
    area: { id: "area-bashundhara", name: "Bashundhara R/A", type: "NEIGHBORHOOD", parent_area_id: "area-dhaka" },
    verification: null,
    media: [
      { id: "m-6", property_id: "prop-3", media_type: "image", url: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=85", public_id: "p6", thumbnail_url: null, display_order: 1 },
    ],
  },
  {
    id: "prop-4",
    user_id: "user-4",
    area_id: "area-dhanmondi",
    title: "Modern Open-Plan Penthouse",
    description: "Luxury penthouse with floor-to-ceiling glass windows and panoramic skyline views.",
    type: "residential",
    subtype: "Condo",
    listing_type: "rent",
    price: 145000,
    price_currency: "BDT",
    area_size: 2720,
    area_unit: "sqft",
    location_lat: 23.7461,
    location_lng: 90.3742,
    address: "Road 9A, Dhanmondi, Dhaka",
    amenities: { pool: true, gym: true },
    status: "active",
    is_verified: true,
    virtual_tour_url: null,
    view_count: 1100,
    published_at: "2026-08-04T10:00:00Z",
    created_at: "2026-08-04T10:00:00Z",
    updated_at: "2026-08-04T10:00:00Z",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2720,
    area: { id: "area-dhanmondi", name: "Dhanmondi", type: "NEIGHBORHOOD", parent_area_id: "area-dhaka" },
    verification: { id: "ver-4", status: "verified", notes: "Inspection completed", verified_at: "2026-08-04T12:00:00Z" },
    media: [
      { id: "m-7", property_id: "prop-4", media_type: "image", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85", public_id: "p7", thumbnail_url: null, display_order: 1 },
      { id: "m-8", property_id: "prop-4", media_type: "image", url: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1400&q=85", public_id: "p8", thumbnail_url: null, display_order: 2 },
    ],
  },
];

export function usePropertyFeed(filters: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingNextPage, setFetchingNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProperties = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (targetPage > 1) {
        setFetchingNextPage(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const queryParams = {
          ...filters,
          page: targetPage,
          limit: filters.limit || 20,
        };

        const res = await apiClient.get<{
          success: boolean;
          message: string;
          data: PaginatedResponse<Property> | null;
        }>("/v1/properties", { params: queryParams });

        const data = res.data?.data;
        const newItems = data?.items || [];
        const total = data?.total || 0;

        if (isRefresh || targetPage === 1) {
          setProperties(newItems);
        } else {
          setProperties((prev) => [...prev, ...newItems]);
        }

        setPage(targetPage);
        setHasMore(targetPage * (filters.limit || 20) < total);
      } catch {
        // Fallback to local mock data filtered by search/filters
        let filtered = [...mockProperties];

        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q) ||
              p.address?.toLowerCase().includes(q)
          );
        }

        if (filters.listing_type) {
          filtered = filtered.filter((p) => p.listing_type === filters.listing_type);
        }

        if (filters.type) {
          filtered = filtered.filter((p) => p.type === filters.type);
        }

        if (filters.bedrooms && filters.bedrooms > 0) {
          filtered = filtered.filter((p) => (p.bedrooms || 0) >= (filters.bedrooms || 0));
        }

        if (isRefresh || targetPage === 1) {
          setProperties(filtered);
        } else {
          setProperties((prev) => [...prev, ...filtered]);
        }

        setHasMore(false);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setFetchingNextPage(false);
      }
    },
    [filters]
  );

  // Re-fetch when filters change
  useEffect(() => {
    fetchProperties(1);
  }, [fetchProperties]);

  const loadMore = useCallback(() => {
    if (!loading && !fetchingNextPage && hasMore) {
      fetchProperties(page + 1);
    }
  }, [loading, fetchingNextPage, hasMore, page, fetchProperties]);

  const refresh = useCallback(() => {
    fetchProperties(1, true);
  }, [fetchProperties]);

  return {
    properties,
    loading,
    refreshing,
    fetchingNextPage,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
