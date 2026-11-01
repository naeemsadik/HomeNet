import React, { useCallback, useMemo, useState } from "react";
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
import { formatLocalizedPrice, isPriceOnRequest, useTranslation } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import type { Property } from "../types/property";
import { HomeMapCanvas } from "./HomeMapCanvas";
import type { HomeMapMarker } from "./HomeMapCanvas.types";

type MappableProperty = Property & { location_lat: number; location_lng: number };

function hasCoordinates(p: Property): p is MappableProperty {
  return (
    typeof p.location_lat === "number" &&
    typeof p.location_lng === "number" &&
    Number.isFinite(p.location_lat) &&
    Number.isFinite(p.location_lng) &&
    !(p.location_lat === 0 && p.location_lng === 0)
  );
}

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

  // The map runs Leaflet in the page (HomeMapCanvas.web.tsx). It used to be a srcdoc
  // iframe loading Leaflet from unpkg with an inline script, which the site's
  // Content-Security-Policy blocks, so the map was a blank grey box in production.
  // Only listings with a real pin go on the map; a made-up spot would mislead.
  const perMonth = t("propertyCard.perMonth");
  const markers = useMemo<HomeMapMarker[]>(
    () =>
      properties.filter(hasCoordinates).map((p) => {
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
    [properties, language, perMonth],
  );

  const handleSelect = useCallback(
    (id: string) => {
      const found = properties.find((p) => String(p.id) === id);
      if (!found) return;
      setSelectedProperty(found);
      onSelectProperty?.(found);
    },
    [properties, onSelectProperty],
  );

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
        <HomeMapCanvas
          markers={markers}
          selectedId={selectedProperty ? String(selectedProperty.id) : null}
          onSelect={handleSelect}
          accessibilityLabel={`${activeLocation || "Dhaka"} properties map`}
          // The map is the whole view here, so one finger pans it. The zoom
          // buttons move to the bottom because the listing card sits on top.
          touchDrag
          zoomControlPosition="bottomright"
        />
      ) : (
        <View style={styles.nativeFallback}>
          <MapPin size={32} color={colorTokens.brandText} />
          <Text style={styles.nativeFallbackText}>
            {activeLocation || "Dhaka"} Properties
          </Text>
        </View>
      )}

      {/* Selected property peek card */}
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
  // The card sits at the top of the map: on phones the List/Map pill floats over
  // the bottom of the screen, which is where the card used to be.
  peekCard: {
    position: "absolute",
    top: 12,
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
