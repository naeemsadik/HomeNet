import React, { useState, useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, X } from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { DHAKA_CENTER } from "../constants/areaCenters";
import { formatLocalizedPrice, useTranslation } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import type { Property } from "../types/property";

interface PropertyResultsMapProps {
  properties: Property[];
  activeLocation?: string;
  onSelectProperty?: (property: Property) => void;
}

export function PropertyResultsMap({
  properties,
  activeLocation,
  onSelectProperty,
}: PropertyResultsMapProps) {
  const { t, language } = useTranslation();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(() => properties[0] || null);

  // Compute center
  const center = useMemo(() => {
    const firstWithCoords = properties.find((p) => p.location_lat && p.location_lng);
    if (firstWithCoords && firstWithCoords.location_lat && firstWithCoords.location_lng) {
      return { lat: firstWithCoords.location_lat, lng: firstWithCoords.location_lng };
    }
    return DHAKA_CENTER;
  }, [properties]);

  // Leaflet map HTML for web platform iframe
  const mapHtml = useMemo(() => {
    const validProps = properties
      .map((p, idx) => {
        const lat = p.location_lat || center.lat + (idx % 5 - 2) * 0.008;
        const lng = p.location_lng || center.lng + (idx % 4 - 1.5) * 0.008;
        const price = formatLocalizedPrice(p.price, p.price_currency || "BDT", language);
        return {
          id: p.id,
          title: (p.title || "").replace(/'/g, "\\'"),
          price,
          lat,
          lng,
        };
      })
      .slice(0, 40);

    const markersJson = JSON.stringify(validProps);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .price-marker {
      background-color: #04cf92;
      color: #0B1A17;
      font-weight: 700;
      font-size: 11px;
      padding: 3px 7px;
      border-radius: 12px;
      border: 1.5px solid #0B1A17;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      white-space: nowrap;
      text-align: center;
      cursor: pointer;
    }
    .price-marker.active {
      background-color: #0B1A17;
      color: #FFFFFF;
      border-color: #04cf92;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${center.lat}, ${center.lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var markersData = ${markersJson};
    markersData.forEach(function(item) {
      var icon = L.divIcon({
        className: 'custom-icon',
        html: '<div class="price-marker" id="marker-' + item.id + '">' + item.price + '</div>',
        iconSize: [60, 24],
        iconAnchor: [30, 12]
      });
      var marker = L.marker([item.lat, item.lng], { icon: icon }).addTo(map);
      marker.on('click', function() {
        window.parent.postMessage({ type: 'PROPERTY_SELECTED', id: item.id }, '*');
      });
    });
  </script>
</body>
</html>`;
  }, [properties, center, language]);

  React.useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PROPERTY_SELECTED") {
        const found = properties.find((p) => p.id === event.data.id);
        if (found) {
          setSelectedProperty(found);
          onSelectProperty?.(found);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [properties, onSelectProperty]);

  const handleCardPress = () => {
    if (!selectedProperty) return;
    if (onSelectProperty) {
      onSelectProperty(selectedProperty);
    } else {
      router.push(`/property/${selectedProperty.id}` as never);
    }
  };

  const originalPhoto =
    selectedProperty?.media?.find((m) => m.media_type === "image")?.url ??
    selectedProperty?.media?.[0]?.url ??
    null;

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        // Web Leaflet iframe embed
        <iframe
          srcDoc={mapHtml}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          title="HomeNet Map View"
        />
      ) : (
        <View style={styles.nativeFallback}>
          <MapPin size={32} color={colorTokens.brandText} />
          <Text style={styles.nativeFallbackText}>
            {activeLocation || "Dhaka"} Properties
          </Text>
        </View>
      )}

      {/* Selected Property Bottom Peek Card */}
      {selectedProperty ? (
        <View style={styles.peekCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${selectedProperty.title}, ${formatLocalizedPrice(
              selectedProperty.price,
              selectedProperty.price_currency || "BDT",
              language,
            )}`}
            onPress={handleCardPress}
            style={({ pressed }) => [
              styles.peekContent,
              webPointer,
              pressed && { opacity: 0.95 },
            ]}
          >
            <View style={styles.peekImageWrap}>
              {originalPhoto ? (
                <Image
                  source={{ uri: cdnImage(originalPhoto, 200, 160) }}
                  style={styles.peekImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.peekImagePlaceholder}>
                  <MapPin size={20} color={colorTokens.subtle} />
                </View>
              )}
            </View>

            <View style={styles.peekInfo}>
              <Text style={styles.peekPrice}>
                {formatLocalizedPrice(
                  selectedProperty.price,
                  selectedProperty.price_currency || "BDT",
                  language,
                )}
                {selectedProperty.listing_type === "rent" ? (
                  <Text style={styles.peekPerMonth}> {t("propertyCard.perMonth")}</Text>
                ) : null}
              </Text>
              <Text numberOfLines={1} style={styles.peekTitle}>
                {selectedProperty.title}
              </Text>
              <Text numberOfLines={1} style={styles.peekLocation}>
                {selectedProperty.area?.name || selectedProperty.address || "Dhaka"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close peek card"
            onPress={(e) => {
              e.stopPropagation?.();
              setSelectedProperty(null);
            }}
            style={[styles.peekCloseBtn, webPointer]}
          >
            <X size={14} color={colorTokens.subtle} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 520,
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
  },
  nativeFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nativeFallbackText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.ink,
  },
  peekCard: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  peekContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  peekImageWrap: {
    width: 72,
    height: 56,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colorTokens.surfaceSunken,
  },
  peekImage: {
    width: "100%",
    height: "100%",
  },
  peekImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  peekInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  peekPrice: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  peekPerMonth: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
  },
  peekTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colorTokens.body,
  },
  peekLocation: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
  },
  peekCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
  },
});
