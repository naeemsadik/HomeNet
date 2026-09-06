import { useState, useEffect, useCallback } from "react";
import apiClient from "@/services/apiClient";
import type { Property, PropertyFilters, PaginatedResponse } from "../types/property";

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
      } catch (err: any) {
        console.error("Failed to load properties from API:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load properties");
        if (isRefresh || targetPage === 1) {
          setProperties([]);
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
