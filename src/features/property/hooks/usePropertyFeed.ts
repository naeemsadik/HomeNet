import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
  const stableFilters = useMemo(() => filters, [
    filters.city,
    filters.area_id,
    filters.type,
    filters.listing_type,
    filters.min_price,
    filters.max_price,
    filters.min_area,
    filters.max_area,
    filters.bedrooms,
    filters.bathrooms,
    filters.search,
    filters.is_verified,
    filters.sort_by,
  ]);

  const query = useInfiniteQuery({
    queryKey: ["properties", stableFilters],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const queryParams = {
          ...stableFilters,
          page: pageParam,
          limit: stableFilters.limit || 20,
        };
        const res = await apiClient.get<{
          success: boolean;
          message: string;
          data: PaginatedResponse<Property> | null;
        }>("/v1/properties", { params: queryParams });
        const data = res.data?.data;
        return {
          items: data?.items || [],
          total: data?.total || 0,
          page: pageParam,
          limit: stableFilters.limit || 20,
        };
      } catch {
        let filtered = [...mockProperties];
        if (stableFilters.search) {
          const q = stableFilters.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q) ||
              p.address?.toLowerCase().includes(q),
          );
        }
        if (stableFilters.listing_type) {
          filtered = filtered.filter((p) => p.listing_type === stableFilters.listing_type);
        }
        if (stableFilters.type) {
          filtered = filtered.filter((p) => p.type === stableFilters.type);
        }
        if (stableFilters.bedrooms && stableFilters.bedrooms > 0) {
          filtered = filtered.filter((p) => (p.bedrooms || 0) >= (stableFilters.bedrooms || 0));
        }
        return {
          items: filtered,
          total: filtered.length,
          page: pageParam,
          limit: stableFilters.limit || 20,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.length * lastPage.limit;
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const properties = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const hasMore = query.hasNextPage ?? false;

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    properties,
    loading: query.isLoading,
    refreshing: query.isRefetching,
    fetchingNextPage: query.isFetchingNextPage,
    error: query.error?.message ?? null,
    hasMore,
    loadMore,
    refresh: () => { query.refetch(); },
  };
}
