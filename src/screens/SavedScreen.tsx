import { Bookmark, Heart } from "@/components/icons";
import { useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { AppLink } from "@/components/ui";
import { getPropertyById, getSavedProperties, unsaveProperty } from "@/services/propertyApi";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts } from "@/theme";
import { useSavedStore } from "@/stores/savedStore";
import { useAuthStore } from "@/stores/authStore";
import type { ApiResponse } from "@/types/api";
import type { Property } from "@/features/property/types/property";
import { LiveText } from "@/components/LiveText";
import { PropertySkeletonFeed } from "@/features/property/components/PropertySkeleton";

export function SavedScreen() {
  const { isPhone } = useResponsive();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Server saved properties for authenticated user
  const { data: savedData, isLoading: isServerLoading } = useQuery({
    queryKey: ["properties", "saved"],
    queryFn: getSavedProperties,
    staleTime: 60 * 1000,
    enabled: !!user,
  });

  const savedIds = useSavedStore((s) => s.savedIds);

  // Guest saved properties (when not logged in, fetched by savedIds)
  const { data: guestProperties, isLoading: isGuestLoading } = useQuery({
    queryKey: ["properties", "guest", savedIds],
    queryFn: async () => {
      const results = await Promise.allSettled(
        savedIds.map((id) => getPropertyById(id))
      );
      return results
        .filter(
          (r): r is PromiseFulfilledResult<ApiResponse<Property>> =>
            r.status === "fulfilled" && !!r.value?.data
        )
        .map((r) => r.value.data);
    },
    enabled: !user && savedIds.length > 0,
    staleTime: 60 * 1000,
  });

  // Sync server saved IDs into savedStore so cards show red hearts across pages
  useEffect(() => {
    if (user && savedData?.data && Array.isArray(savedData.data)) {
      const serverIds = savedData.data.map((p) => String(p.id));
      useSavedStore.getState().setSavedIds(serverIds);
    }
  }, [user, savedData]);

  // Server state via TanStack Query (no full property objects stored in Zustand)
  const savedListings = useMemo(() => {
    const list = user ? (savedData?.data ?? []) : (guestProperties ?? []);
    return list.filter((p): p is Property => Boolean(p && p.id));
  }, [user, savedData?.data, guestProperties]);

  const isLoading = user ? isServerLoading : (!user && savedIds.length > 0 && isGuestLoading);

  // Optimistic unsave mutation for authenticated users
  const unsaveMutation = useMutation({
    mutationFn: (id: string) => unsaveProperty(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["properties", "saved"] });
      const previousData = queryClient.getQueryData<ApiResponse<Property[]>>(["properties", "saved"]);

      if (previousData?.data) {
        queryClient.setQueryData<ApiResponse<Property[]>>(["properties", "saved"], {
          ...previousData,
          data: previousData.data.filter((p) => String(p.id) !== String(id)),
        });
      }

      const previousIds = useSavedStore.getState().savedIds;
      useSavedStore.setState({
        savedIds: previousIds.filter((itemId) => String(itemId) !== String(id)),
      });

      return { previousData, previousIds };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["properties", "saved"], context.previousData);
      }
      if (context?.previousIds) {
        useSavedStore.setState({ savedIds: context.previousIds });
      }
      if (__DEV__) console.error("[SavedScreen] Failed to unsave property on server, rolling back:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "saved"] });
    },
  });

  const { mutate: unsave } = unsaveMutation;
  const handleUnsaveCard = useCallback(
    (property: Property) => {
      const idStr = String(property.id);
      if (user) {
        unsave(idStr);
      } else {
        void useSavedStore.getState().removeSaved(idStr);
      }
    },
    [user, unsave],
  );

  return (
    <AppChrome active="saved">
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER (Figma data-node-id="1:1452")
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.headerRow, isPhone && styles.headerRowPhone]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.pageHeading}>Saved</Text>
          <Text style={styles.pageSubtitle}>
            {!user && savedIds.length > 0
              ? "Saved locally on this device · Sign in to sync across devices"
              : "Your saved properties & bookmarks"}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <AppLink href="/buy" style={styles.exploreLink}>
            <Text style={styles.exploreLinkText}>Browse more homes</Text>
          </AppLink>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. SAVED PROPERTIES
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIconRow}>
            <Bookmark color="#0B1A17" size={20} />
            <LiveText style={styles.sectionTitle}>Saved properties ({savedListings.length})</LiveText>
          </View>
        </View>

        {isLoading && savedListings.length === 0 ? (
          <PropertySkeletonFeed />
        ) : savedListings.length === 0 ? (
          <View style={styles.emptySavedBox}>
            <Heart color="#899790" size={48} />
            <Text style={styles.emptySavedTitle}>No saved properties yet</Text>
            <Text style={styles.emptySavedText}>
              Properties you save while browsing will appear here for easy comparison.
            </Text>
            <AppLink href="/buy" style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Explore properties</Text>
            </AppLink>
          </View>
        ) : (
          <View style={[styles.savedPropertiesGrid, isPhone && styles.savedPropertiesGridPhone]}>
            {savedListings.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                imageHeight={isPhone ? 180 : 220}
                saved={true}
                onSave={handleUnsaveCard}
                style={[styles.savedCardItem, isPhone && styles.savedCardItemPhone]}
              />
            ))}
          </View>
        )}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  /* 1. Page Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 16,
    width: "100%",
  },
  headerRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
  },
  headerTitleWrap: {
    gap: 4,
  },
  pageHeading: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 25.6,
    fontWeight: "800",
    lineHeight: 38.4,
    letterSpacing: -0.512,
  },
  pageSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
  },

  /* 2. Folders Row */

  /* Common Section Header */
  sectionSpacing: {
    marginTop: 32,
    width: "100%",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  titleWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.4,
  },

  /* 3. Saved Properties (2 Columns) */
  savedPropertiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
    alignItems: "flex-start",
  },
  savedPropertiesGridPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  savedCardItem: {
    flexBasis: "48.5%",
    flexGrow: 1,
    minWidth: 320,
  },
  savedCardItemPhone: {
    flexBasis: "auto",
    flexGrow: 0,
    minWidth: 0,
    width: "100%",
  },

  /* 4. Recently Viewed (3 Columns) */
  exploreLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E6FAF4",
  },
  exploreLinkText: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  emptySavedBox: {
    width: "100%",
    padding: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  emptySavedTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.headingBold,
    color: "#0B1A17",
  },
  emptySavedText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    textAlign: "center",
    maxWidth: 400,
  },
  browseButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#04cf92",
  },
  browseButtonText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
