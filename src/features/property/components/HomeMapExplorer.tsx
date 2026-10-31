import React, { memo, useState, useMemo, useEffect, useCallback } from "react";
import {
  Platform,
  Pressable,
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
import { useTranslation, formatLocalizedPrice } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import { getProperties } from "@/services/propertyApi";
import { useQuery } from "@tanstack/react-query";
import { DHAKA_CENTER, areaCenterFor } from "../constants/areaCenters";
import type { Property } from "../types/property";

type FilterType = "all" | "sale" | "rent";

function sanitize(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPillPrice(price: number, listingType: string): string {
  if (!price || price <= 0) return "Contact for price";

  if (listingType === "rent") {
    if (price >= 100000) {
      const lac = (price / 100000).toFixed(price % 100000 === 0 ? 0 : 1);
      return `৳ ${lac} Lac/mo`;
    }
    if (price >= 1000) {
      return `৳ ${Math.round(price / 1000)}k/mo`;
    }
    return `৳ ${price.toLocaleString()}/mo`;
  }

  // Sale
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(price % 10000000 === 0 ? 0 : 2).replace(/\.00$/, "");
    return `৳ ${cr} Cr`;
  }
  if (price >= 100000) {
    const lac = (price / 100000).toFixed(price % 100000 === 0 ? 0 : 2).replace(/\.00$/, "");
    return `৳ ${lac} Lac`;
  }
  if (price >= 1000) {
    return `৳ ${Math.round(price / 1000)}k`;
  }
  return `৳ ${price.toLocaleString()}`;
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

export const HomeMapExplorer = memo(function HomeMapExplorer() {
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

  const rawProperties = useMemo(
    () => listingsQuery.data?.data?.items ?? [],
    [listingsQuery.data?.data?.items]
  );

  // Filter properties based on active tab
  const filteredProperties = useMemo(() => {
    if (activeFilter === "sale") {
      return rawProperties.filter((p) => p.listing_type === "sale");
    }
    if (activeFilter === "rent") {
      return rawProperties.filter((p) => p.listing_type === "rent");
    }
    return rawProperties;
  }, [rawProperties, activeFilter]);

  const allCount = rawProperties.length;
  const saleCount = useMemo(
    () => rawProperties.filter((p) => p.listing_type === "sale").length,
    [rawProperties]
  );
  const rentCount = useMemo(
    () => rawProperties.filter((p) => p.listing_type === "rent").length,
    [rawProperties]
  );

  // Selected property
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return rawProperties.find((p) => p.id === selectedPropertyId) ?? null;
  }, [rawProperties, selectedPropertyId]);

  // Center coordinate: compute from properties or fallback to Dhaka
  const center = useMemo(() => {
    const withCoords = filteredProperties.find(
      (p) => typeof p.location_lat === "number" && typeof p.location_lng === "number"
    );
    if (withCoords?.location_lat && withCoords?.location_lng) {
      return { lat: withCoords.location_lat, lng: withCoords.location_lng };
    }
    return DHAKA_CENTER;
  }, [filteredProperties]);

  // Listen for PROPERTY_SELECTED messages from the Leaflet map iframe
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PROPERTY_SELECTED" && event.data.id) {
        setSelectedPropertyId(String(event.data.id));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // HTML content for Leaflet map inside iframe
  const mapHtml = useMemo(() => {
    const markerData = filteredProperties.map((p, idx) => {
      // Coordinate fallback with deterministic spreading around Dhaka / area centers
      let lat = p.location_lat;
      let lng = p.location_lng;

      if (!lat || !lng) {
        const areaName = p.area?.name || "";
        const areaPoint = areaCenterFor(p.area_id || "", areaName, []);
        const jitterLat = ((idx % 7) - 3) * 0.006;
        const jitterLng = ((idx % 5) - 2) * 0.006;
        lat = (areaPoint?.lat || center.lat) + jitterLat;
        lng = (areaPoint?.lng || center.lng) + jitterLng;
      }

      const isRent = p.listing_type === "rent";
      const isContactForPrice = !p.price || p.price <= 0;
      const variant = isContactForPrice ? "neutral" : isRent ? "rent" : "sale";
      const dotClass = isContactForPrice ? "dot-neutral" : isRent ? "dot-rent" : "dot-sale";
      const priceText = formatPillPrice(p.price, p.listing_type);

      return {
        id: sanitize(p.id),
        title: sanitize(p.title),
        price: sanitize(priceText),
        variant,
        dotClass,
        lat,
        lng,
        width: Math.max(76, priceText.length * 7.5 + 24),
      };
    });

    const markersJson = JSON.stringify(markerData);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <style>
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      overflow: hidden;
    }
    .leaflet-container {
      background: #F1F5F9;
      font-family: inherit;
    }
    .price-marker-wrap {
      background: transparent;
      border: none;
    }
    .price-marker {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-weight: 700;
      font-size: 11.5px;
      line-height: 1;
      padding: 5px 10px;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.22);
      white-space: nowrap;
      text-align: center;
      cursor: pointer;
      transition: transform 0.16s ease, box-shadow 0.16s ease;
      user-select: none;
    }
    .price-marker.sale {
      background-color: #0F172A;
      color: #FFFFFF;
      border: 1.5px solid #1E293B;
    }
    .price-marker.rent {
      background-color: #059669;
      color: #FFFFFF;
      border: 1.5px solid #047857;
    }
    .price-marker.neutral {
      background-color: #334155;
      color: #F8FAFC;
      border: 1.5px solid #475569;
    }
    .marker-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }
    .dot-sale { background-color: #38BDF8; }
    .dot-rent { background-color: #6EE7B7; }
    .dot-neutral { background-color: #94A3B8; }

    .price-marker:hover {
      transform: translateY(-2px) scale(1.06);
      box-shadow: 0 6px 14px rgba(15, 23, 42, 0.28);
      z-index: 500 !important;
    }
    .price-marker.active {
      transform: scale(1.15);
      box-shadow: 0 0 0 3px #10B981, 0 8px 22px rgba(15, 23, 42, 0.35);
      z-index: 1000 !important;
    }
    /* Cluster bubble */
    .custom-cluster {
      background-color: rgba(15, 23, 42, 0.12);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-cluster-inner {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: #0F172A;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
    }
    /* Clean zoom control */
    .leaflet-top.leaflet-right .leaflet-control-zoom {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      margin-top: 12px;
      margin-right: 12px;
    }
    .leaflet-control-zoom a {
      color: #0F172A !important;
      background-color: #FFFFFF !important;
      font-weight: 700;
    }
    .leaflet-control-zoom a:hover {
      background-color: #F8FAFC !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([${center.lat}, ${center.lng}], 13);

    // High quality road/neighborhood basemap with minimal POI distraction
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var markersCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        return L.divIcon({
          html: '<div class="custom-cluster-inner">' + count + '</div>',
          className: 'custom-cluster',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
      }
    });

    var markersData = ${markersJson};
    var markerMap = {};

    markersData.forEach(function(item) {
      var icon = L.divIcon({
        className: 'price-marker-wrap',
        html: '<div class="price-marker ' + item.variant + '" id="marker-' + item.id + '">' +
                '<span class="marker-dot ' + item.dotClass + '"></span>' +
                '<span>' + item.price + '</span>' +
              '</div>',
        iconSize: [item.width, 28],
        iconAnchor: [item.width / 2, 14]
      });
      var marker = L.marker([item.lat, item.lng], { icon: icon });
      markerMap[item.id] = marker;
      marker.on('click', function(e) {
        setActiveMarker(item.id);
        window.parent.postMessage({ type: 'PROPERTY_SELECTED', id: item.id }, '*');
      });
      markersCluster.addLayer(marker);
    });

    map.addLayer(markersCluster);

    function setActiveMarker(id) {
      document.querySelectorAll('.price-marker').forEach(function(el) {
        el.classList.remove('active');
      });
      var target = document.getElementById('marker-' + id);
      if (target) {
        target.classList.add('active');
      }
    }

    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'SELECT_PROPERTY_FROM_OUTSIDE') {
        setActiveMarker(event.data.id);
        var m = markerMap[event.data.id];
        if (m) {
          map.panTo(m.getLatLng(), { animate: true, duration: 0.5 });
        }
      }
    });
  </script>
</body>
</html>`;
  }, [filteredProperties, center]);

  const mapHeight = isPhone ? 420 : isTablet ? 490 : 540;

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
  }, [selectedProperty?.id]);

  const exploreAllHref = activeFilter === "rent" ? "/rent" : "/buy";

  return (
    <View style={styles.sectionContainer}>
      {/* ─────────────────────────────────────────────────────────────
          1. SECTION HEADER: Crisp, enterprise-grade marketplace copy
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.headerRow, isPhone && styles.headerRowPhone]}>
        <View style={styles.headerTitles}>
          <Text style={styles.kickerTag}>{t("home.mapExplorer.kicker")}</Text>
          <Text style={styles.headlineText} accessibilityRole="header" aria-level={2}>
            {t("home.mapExplorer.headline")}
          </Text>
          <Text style={styles.subheadlineText}>{t("home.mapExplorer.subheadline")}</Text>
        </View>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("home.mapExplorer.exploreAll")}
          onPress={() => router.push(exploreAllHref as never)}
          style={({ hovered }: { hovered?: boolean }) => [
            styles.exploreLink,
            webPointer,
            hovered && styles.exploreLinkHovered,
          ]}
        >
          <Text style={styles.exploreLinkText}>{t("home.mapExplorer.exploreAll")}</Text>
          <ChevronRight size={16} color={colors.greenOnLight} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER PILLS BAR: All / For Sale / For Rent
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveFilter("all")}
          style={[
            styles.filterPill,
            activeFilter === "all" && styles.filterPillActive,
            webPointer,
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
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
            activeFilter === "sale" && styles.filterPillActive,
            webPointer,
          ]}
        >
          <View style={[styles.filterDot, styles.filterDotSale]} />
          <Text
            style={[
              styles.filterPillText,
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
            activeFilter === "rent" && styles.filterPillActive,
            webPointer,
          ]}
        >
          <View style={[styles.filterDot, styles.filterDotRent]} />
          <Text
            style={[
              styles.filterPillText,
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
        ) : Platform.OS === "web" ? (
          <iframe
            srcDoc={mapHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="HomeNet Interactive Property Map Explorer"
          />
        ) : (
          <View style={styles.nativeFallback}>
            <MapPin size={36} color={colorTokens.brandText} />
            <Text style={styles.nativeFallbackTitle}>Dhaka Property Map</Text>
            <Text style={styles.nativeFallbackSub}>
              {filteredProperties.length} active listings ready to explore
            </Text>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. FLOATING PROPERTY PREVIEW CARD (OnClick Pin)
        ───────────────────────────────────────────────────────────── */}
        {selectedProperty ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View details for ${selectedProperty.title}`}
            onPress={handleCardPress}
            style={({ pressed, hovered }: { pressed?: boolean; hovered?: boolean }) => [
              styles.previewCard,
              isPhone && styles.previewCardPhone,
              webPointer,
              pressed && { opacity: 0.96 },
              hovered && styles.previewCardHovered,
            ]}
          >
            {/* Image Thumbnail */}
            <View style={styles.previewImageWrap}>
              {selectedPhoto ? (
                <Image
                  source={{ uri: cdnImage(selectedPhoto, 240, 200) }}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.previewImageFallback}>
                  <MapPin size={22} color={colorTokens.subtle} />
                </View>
              )}
            </View>

            {/* Info Content */}
            <View style={styles.previewContent}>
              {/* Badge + Close button row */}
              <View style={styles.previewTopRow}>
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

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close property preview"
                  onPress={(e) => {
                    e.stopPropagation?.();
                    setSelectedPropertyId(null);
                  }}
                  style={[styles.closeBtn, webPointer]}
                >
                  <X size={14} color="#64748B" />
                </Pressable>
              </View>

              {/* Price */}
              <Text style={styles.previewPrice} numberOfLines={1}>
                {formatLocalizedPrice(
                  selectedProperty.price,
                  selectedProperty.price_currency || "BDT",
                  language
                )}
                {selectedProperty.listing_type === "rent" ? (
                  <Text style={styles.previewPerMonth}> /mo</Text>
                ) : null}
              </Text>

              {/* Title */}
              <Text numberOfLines={1} style={styles.previewTitle}>
                {selectedProperty.title}
              </Text>

              {/* Neighborhood / Address */}
              <View style={styles.previewLocationRow}>
                <MapPin size={12} color="#64748B" style={{ marginTop: 1 }} />
                <Text numberOfLines={1} style={styles.previewLocation}>
                  {selectedProperty.area?.name || selectedProperty.address || "Dhaka"}
                </Text>
              </View>

              {/* Beds / Baths / Sqft specs */}
              {selectedSpecs && (selectedSpecs.beds || selectedSpecs.baths || selectedSpecs.sqft) ? (
                <View style={styles.previewSpecsRow}>
                  {selectedSpecs.beds ? (
                    <Text style={styles.previewSpecItem}>
                      {selectedSpecs.beds}{" "}
                      {selectedSpecs.beds === 1 ? t("home.mapExplorer.bed") : t("home.mapExplorer.beds")}
                    </Text>
                  ) : null}
                  {selectedSpecs.beds && selectedSpecs.baths ? (
                    <Text style={styles.specDivider}>•</Text>
                  ) : null}
                  {selectedSpecs.baths ? (
                    <Text style={styles.previewSpecItem}>
                      {selectedSpecs.baths}{" "}
                      {selectedSpecs.baths === 1 ? t("home.mapExplorer.bath") : t("home.mapExplorer.baths")}
                    </Text>
                  ) : null}
                  {(selectedSpecs.beds || selectedSpecs.baths) && selectedSpecs.sqft ? (
                    <Text style={styles.specDivider}>•</Text>
                  ) : null}
                  {selectedSpecs.sqft ? (
                    <Text style={styles.previewSpecItem}>
                      {selectedSpecs.sqft.toLocaleString()} {t("home.mapExplorer.sqft")}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {/* Direct CTA button */}
              <View style={styles.ctaRow}>
                <View style={styles.viewPropertyCta}>
                  <Text style={styles.viewPropertyText}>{t("home.mapExplorer.viewProperty")}</Text>
                  <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionContainer: {
    width: "100%",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  headerRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headerTitles: {
    flex: 1,
  },
  kickerTag: {
    color: "#059669",
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headlineText: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  subheadlineText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
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
    fontSize: 14,
    fontWeight: "600",
  },

  /* Filter Tabs */
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  filterPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  countActive: {
    color: "#94A3B8",
    fontSize: 12,
  },
  countInactive: {
    color: "#64748B",
    fontSize: 12,
  },
  filterDot: {
    width: 7,
    height: 7,
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
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    position: "relative",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 4px 18px -2px rgba(15, 23, 42, 0.06)",
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
  nativeFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  nativeFallbackTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "#0F172A",
  },
  nativeFallbackSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#64748B",
  },

  /* Bottom Peek Preview Card */
  previewCard: {
    position: "absolute",
    bottom: 14,
    left: 14,
    width: 390,
    maxWidth: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 100,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 12px 30px -4px rgba(15, 23, 42, 0.18), 0 4px 8px -2px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }
      : {}),
  },
  previewCardPhone: {
    left: 10,
    right: 10,
    width: undefined,
    maxWidth: undefined,
    bottom: 10,
  },
  previewCardHovered: {
    transform: [{ translateY: -2 }],
  },
  previewImageWrap: {
    width: 104,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    flexShrink: 0,
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
    gap: 2,
  },
  previewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
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
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  previewPrice: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: "#0B1A17",
    fontWeight: "700",
  },
  previewPerMonth: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "400",
  },
  previewTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#1E293B",
  },
  previewLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  previewLocation: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#64748B",
  },
  previewSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  previewSpecItem: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "#475569",
  },
  specDivider: {
    color: "#94A3B8",
    fontSize: 10,
  },
  ctaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  viewPropertyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0F172A",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  viewPropertyText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: "600",
  },
});
