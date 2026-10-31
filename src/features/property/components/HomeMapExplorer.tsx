import React, { memo, useState, useMemo, useCallback } from "react";
import {
  Platform,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight, MapPin, X } from "@/components/icons";
import { colorTokens, colors, fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import {
  useTranslation,
  formatLocalizedNumber,
  formatLocalizedPrice,
  isPriceOnRequest,
} from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import { getProperties } from "@/services/propertyApi";
import { useQuery } from "@tanstack/react-query";
import type { Property } from "../types/property";
import { HomeMapCanvas } from "./HomeMapCanvas";
import type { HomeMapMarker } from "./HomeMapCanvas.types";

type FilterType = "all" | "sale" | "rent";

type MappableProperty = Property & { location_lat: number; location_lng: number };

/** Only listings with a real pin go on the map; an area centre would put them in the wrong place. */
function hasCoordinates(p: Property): p is MappableProperty {
  return (
    typeof p.location_lat === "number" &&
    typeof p.location_lng === "number" &&
    Number.isFinite(p.location_lat) &&
    Number.isFinite(p.location_lng) &&
    !(p.location_lat === 0 && p.location_lng === 0)
  );
}

function getPropertySpecs(property: Property) {
  const amenities = (property.amenities ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };
  const beds = num(property.bedrooms ?? amenities.bedrooms);
  const baths = num(property.bathrooms ?? amenities.bathrooms);
  const sqft = num(property.sqft ?? property.area_size ?? amenities.area_size);
  return { beds, baths, sqft };
}

/**
 * Home page map of active listings. Web only for now: the map is Leaflet in
 * the page (HomeMapCanvas.web.tsx), and there's no native map yet, so on the
 * app this renders nothing and fetches nothing.
 */
export const HomeMapExplorer = Platform.OS === "web" ? memo(HomeMapExplorerWeb) : () => null;

function HomeMapExplorerWeb() {
  const { t, language } = useTranslation();
  const { isPhone, isTablet } = useResponsive();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Fetch active listings for the map explorer with lightweight client caching
  const listingsQuery = useQuery({
    queryKey: ["properties", "home", "mapExplorer"],
    queryFn: () => getProperties({ status: "active", page: 1, limit: 40 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const items = listingsQuery.data?.data?.items;
  const mappableProperties = useMemo(() => (items ?? []).filter(hasCoordinates), [items]);

  // Filter properties based on active tab
  const filteredProperties = useMemo(() => {
    if (activeFilter === "all") return mappableProperties;
    return mappableProperties.filter((p) => p.listing_type === activeFilter);
  }, [mappableProperties, activeFilter]);

  const allCount = mappableProperties.length;
  const saleCount = useMemo(
    () => mappableProperties.filter((p) => p.listing_type === "sale").length,
    [mappableProperties]
  );
  const rentCount = useMemo(
    () => mappableProperties.filter((p) => p.listing_type === "rent").length,
    [mappableProperties]
  );

  // Looked up in the filtered list, so switching filters closes a card whose pin is gone.
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return filteredProperties.find((p) => p.id === selectedPropertyId) ?? null;
  }, [filteredProperties, selectedPropertyId]);

  const perMonth = t("propertyCard.perMonth");
  const markers = useMemo<HomeMapMarker[]>(
    () =>
      filteredProperties.map((p) => {
        const onRequest = isPriceOnRequest(p.price);
        const isRent = p.listing_type === "rent";
        const price = formatLocalizedPrice(p.price, p.price_currency || "BDT", language);
        return {
          id: String(p.id),
          lat: p.location_lat,
          lng: p.location_lng,
          label: isRent && !onRequest ? `${price}${perMonth}` : price,
          variant: onRequest ? "neutral" : isRent ? "rent" : "sale",
        };
      }),
    [filteredProperties, language, perMonth]
  );

  const handleSelect = useCallback((id: string) => setSelectedPropertyId(id), []);

  const mapHeight = isPhone ? 390 : isTablet ? 470 : 530;

  // Selected property specs and image
  const selectedPhoto = useMemo(() => {
    if (!selectedProperty) return null;
    return (
      selectedProperty.media?.find((m) => m.media_type === "image")?.url ??
      selectedProperty.media?.[0]?.url ??
      null
    );
  }, [selectedProperty]);

  const selectedSpecs = useMemo(() => {
    if (!selectedProperty) return null;
    return getPropertySpecs(selectedProperty);
  }, [selectedProperty]);

  const handleCardPress = useCallback(() => {
    if (!selectedProperty?.id) return;
    router.push(`/property/${selectedProperty.id}` as never);
  }, [selectedProperty]);

  const exploreAllHref = activeFilter === "rent" ? "/rent" : "/buy";
  const num = (value: number) => formatLocalizedNumber(value.toLocaleString("en-BD"), language);

  return (
    <View style={styles.sectionContainer}>
      {/* ─────────────────────────────────────────────────────────────
          1. SECTION HEADER: Crisp, enterprise-grade marketplace copy
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.headerRow, isPhone && styles.headerRowPhone]}>
        <View style={styles.headerTitles}>
          <Text style={styles.kickerTag}>{t("home.mapExplorer.kicker")}</Text>
          <Text
            style={[styles.headlineText, isPhone && styles.headlineTextPhone]}
            accessibilityRole="header"
            aria-level={2}
          >
            {t("home.mapExplorer.headline")}
          </Text>
          <Text style={[styles.subheadlineText, isPhone && styles.subheadlineTextPhone]}>
            {t("home.mapExplorer.subheadline")}
          </Text>
        </View>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("home.mapExplorer.exploreAll")}
          onPress={() => router.push(exploreAllHref as never)}
          style={({ hovered }: PressableStateCallbackType & { hovered?: boolean }) => [
            styles.exploreLink,
            webPointer,
            hovered && styles.exploreLinkHovered,
          ]}
        >
          <Text style={styles.exploreLinkText}>{t("home.mapExplorer.exploreAll")}</Text>
          <ChevronRight size={15} color={colors.greenOnLight} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER PILLS BAR: All / For Sale / For Rent
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.filterRow, isPhone && styles.filterRowPhone]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveFilter("all")}
          style={[
            styles.filterPill,
            isPhone && styles.filterPillPhone,
            activeFilter === "all" && styles.filterPillActive,
            webPointer,
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
              isPhone && styles.filterPillTextPhone,
              activeFilter === "all" && styles.filterPillTextActive,
            ]}
          >
            {t("home.mapExplorer.all")}{" "}
            <Text style={activeFilter === "all" ? styles.countActive : styles.countInactive}>
              ({allCount})
            </Text>
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveFilter("sale")}
          style={[
            styles.filterPill,
            isPhone && styles.filterPillPhone,
            activeFilter === "sale" && styles.filterPillActive,
            webPointer,
          ]}
        >
          <View style={[styles.filterDot, styles.filterDotSale]} />
          <Text
            style={[
              styles.filterPillText,
              isPhone && styles.filterPillTextPhone,
              activeFilter === "sale" && styles.filterPillTextActive,
            ]}
          >
            {t("home.mapExplorer.forSale")}{" "}
            <Text style={activeFilter === "sale" ? styles.countActive : styles.countInactive}>
              ({saleCount})
            </Text>
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveFilter("rent")}
          style={[
            styles.filterPill,
            isPhone && styles.filterPillPhone,
            activeFilter === "rent" && styles.filterPillActive,
            webPointer,
          ]}
        >
          <View style={[styles.filterDot, styles.filterDotRent]} />
          <Text
            style={[
              styles.filterPillText,
              isPhone && styles.filterPillTextPhone,
              activeFilter === "rent" && styles.filterPillTextActive,
            ]}
          >
            {t("home.mapExplorer.forRent")}{" "}
            <Text style={activeFilter === "rent" ? styles.countActive : styles.countInactive}>
              ({rentCount})
            </Text>
          </Text>
        </Pressable>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          3. MAP CANVAS CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        {listingsQuery.isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colorTokens.brand} />
            <Text style={styles.loadingText}>{t("home.mapExplorer.loadingMap")}</Text>
          </View>
        ) : (
          <HomeMapCanvas
            markers={markers}
            selectedId={selectedProperty ? String(selectedProperty.id) : null}
            onSelect={handleSelect}
            accessibilityLabel={t("home.mapExplorer.mapLabel")}
          />
        )}

        {!listingsQuery.isLoading && markers.length === 0 ? (
          <View pointerEvents="none" style={styles.emptyOverlay}>
            <Text style={styles.emptyOverlayText}>{t("home.mapExplorer.noProperties")}</Text>
          </View>
        ) : null}

        {/* ─────────────────────────────────────────────────────────────
            4. FLOATING PROPERTY PREVIEW CARD (OnClick Pin)
            The close button is a sibling of the card's button, not inside
            it: a <button> inside a <button> is invalid HTML on web.
        ───────────────────────────────────────────────────────────── */}
        {selectedProperty ? (
          <View style={[styles.previewCard, isPhone && styles.previewCardPhone]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.mapExplorer.viewDetails", { title: selectedProperty.title })}
              onPress={handleCardPress}
              style={({ pressed, hovered }: PressableStateCallbackType & { hovered?: boolean }) => [
                styles.previewPressable,
                isPhone && styles.previewPressablePhone,
                webPointer,
                pressed && { opacity: 0.96 },
                hovered && styles.previewCardHovered,
              ]}
            >
              {/* Image Thumbnail */}
              <View style={[styles.previewImageWrap, isPhone && styles.previewImageWrapPhone]}>
                {selectedPhoto ? (
                  <Image
                    source={{ uri: cdnImage(selectedPhoto, 200, 160) }}
                    style={styles.previewImage}
                    contentFit="cover"
                    transition={180}
                  />
                ) : (
                  <View style={styles.previewImageFallback}>
                    <MapPin size={20} color={colorTokens.subtle} />
                  </View>
                )}
              </View>

              {/* Info Content */}
              <View style={styles.previewContent}>
                {/* Top Row: Price + Tag (the close button sits over the top-right corner) */}
                <View style={styles.previewTopRow}>
                  <Text style={[styles.previewPrice, isPhone && styles.previewPricePhone]} numberOfLines={1}>
                    {formatLocalizedPrice(
                      selectedProperty.price,
                      selectedProperty.price_currency || "BDT",
                      language
                    )}
                    {selectedProperty.listing_type === "rent" && !isPriceOnRequest(selectedProperty.price) ? (
                      <Text style={styles.previewPerMonth}> {perMonth}</Text>
                    ) : null}
                  </Text>

                  <View
                    style={[
                      styles.tagBadge,
                      selectedProperty.listing_type === "rent"
                        ? styles.tagBadgeRent
                        : styles.tagBadgeSale,
                    ]}
                  >
                    <Text style={styles.tagBadgeText}>
                      {selectedProperty.listing_type === "rent"
                        ? t("home.mapExplorer.statusRent")
                        : t("home.mapExplorer.statusSale")}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text numberOfLines={1} style={[styles.previewTitle, isPhone && styles.previewTitlePhone]}>
                  {selectedProperty.title}
                </Text>

                {/* Neighborhood / Address */}
                <View style={styles.previewLocationRow}>
                  <MapPin size={11} color="#64748B" style={{ marginTop: 1 }} />
                  <Text numberOfLines={1} style={[styles.previewLocation, isPhone && styles.previewLocationPhone]}>
                    {selectedProperty.area?.name || selectedProperty.address || "Dhaka"}
                  </Text>
                </View>

                {/* Specs row */}
                {selectedSpecs && (selectedSpecs.beds || selectedSpecs.baths || selectedSpecs.sqft) ? (
                  <View style={styles.previewSpecsRow}>
                    {selectedSpecs.beds ? (
                      <Text style={styles.previewSpecItem}>
                        {num(selectedSpecs.beds)}{" "}
                        {selectedSpecs.beds === 1 ? t("home.mapExplorer.bed") : t("home.mapExplorer.beds")}
                      </Text>
                    ) : null}
                    {selectedSpecs.beds && selectedSpecs.baths ? (
                      <Text style={styles.specDivider}>•</Text>
                    ) : null}
                    {selectedSpecs.baths ? (
                      <Text style={styles.previewSpecItem}>
                        {num(selectedSpecs.baths)}{" "}
                        {selectedSpecs.baths === 1 ? t("home.mapExplorer.bath") : t("home.mapExplorer.baths")}
                      </Text>
                    ) : null}
                    {(selectedSpecs.beds || selectedSpecs.baths) && selectedSpecs.sqft ? (
                      <Text style={styles.specDivider}>•</Text>
                    ) : null}
                    {selectedSpecs.sqft ? (
                      <Text style={styles.previewSpecItem}>
                        {num(selectedSpecs.sqft)} {t("home.mapExplorer.sqft")}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {/* CTA button (Desktop only, mobile card is directly clickable) */}
                {!isPhone ? (
                  <View style={styles.ctaRow}>
                    <View style={styles.viewPropertyCta}>
                      <Text style={styles.viewPropertyText}>{t("home.mapExplorer.viewProperty")}</Text>
                      <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                  </View>
                ) : null}
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.mapExplorer.closePreview")}
              onPress={() => setSelectedPropertyId(null)}
              hitSlop={8}
              style={[styles.closeBtn, webPointer]}
            >
              <X size={13} color="#64748B" />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  sectionContainer: {
    width: "100%",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  headerRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
  },
  headerTitles: {
    flex: 1,
  },
  kickerTag: {
    color: "#059669",
    fontFamily: fonts.bold,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  headlineText: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  headlineTextPhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  subheadlineText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  subheadlineTextPhone: {
    fontSize: 12.5,
    lineHeight: 18,
  },

  exploreLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  exploreLinkHovered: {
    opacity: 0.82,
  },
  exploreLinkText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    fontWeight: "600",
  },

  /* Filter Tabs */
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterRowPhone: {
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 9999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillPhone: {
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  filterPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: "#334155",
    fontWeight: "600",
  },
  filterPillTextPhone: {
    fontSize: 11.5,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  countActive: {
    color: "#94A3B8",
    fontSize: 11.5,
  },
  countInactive: {
    color: "#64748B",
    fontSize: 11.5,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 50,
  },
  filterDotSale: {
    backgroundColor: "#38BDF8",
  },
  filterDotRent: {
    backgroundColor: "#10B981",
  },

  /* Map Canvas Box */
  mapContainer: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    position: "relative",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 4px 18px -2px rgba(15, 23, 42, 0.08)",
        }
      : {}),
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#64748B",
  },
  emptyOverlay: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  emptyOverlayText: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: "#475569",
  },

  /* Bottom Peek Preview Card */
  previewCard: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 380,
    maxWidth: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 100,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 10px 25px -4px rgba(15, 23, 42, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.06)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }
      : {}),
  },
  previewCardPhone: {
    left: 8,
    right: 8,
    bottom: 8,
    width: undefined,
    maxWidth: undefined,
    borderRadius: 11,
  },
  previewPressable: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
  },
  previewPressablePhone: {
    padding: 8,
    gap: 9,
  },
  previewCardHovered: {
    transform: [{ translateY: -2 }],
  },
  previewImageWrap: {
    width: 96,
    height: 86,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    flexShrink: 0,
  },
  previewImageWrapPhone: {
    width: 74,
    height: 66,
    borderRadius: 7,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  previewContent: {
    flex: 1,
    minWidth: 0,
    gap: 1.5,
  },
  previewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    // Room for the close button, which sits over this corner.
    paddingRight: 24,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeSale: {
    backgroundColor: "#0F172A",
  },
  tagBadgeRent: {
    backgroundColor: "#059669",
  },
  tagBadgeText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  previewPrice: {
    fontFamily: fonts.headingBold,
    fontSize: 15.5,
    color: "#0B1A17",
    fontWeight: "700",
  },
  previewPricePhone: {
    fontSize: 14.5,
  },
  previewPerMonth: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "400",
  },
  previewTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: "#1E293B",
  },
  previewTitlePhone: {
    fontSize: 12,
  },
  previewLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  previewLocation: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: "#64748B",
  },
  previewLocationPhone: {
    fontSize: 11,
  },
  previewSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  previewSpecItem: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: "#475569",
  },
  specDivider: {
    color: "#94A3B8",
    fontSize: 9,
  },
  ctaRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  viewPropertyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  viewPropertyText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    fontWeight: "600",
  },
});
