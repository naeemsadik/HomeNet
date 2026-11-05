import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { BedDouble, MapPin, X } from "@/components/icons";
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
  /** Sizes the map; the default is a 520px box. */
  style?: StyleProp<ViewStyle>;
  /**
   * How the chosen listing shows: a small card at the top or bottom of the
   * map, or (`carousel`) a swipeable row of cards along the bottom that moves
   * with the pins, the phone map view. `none` shows no card (a preview map).
   */
  peek?: "top" | "bottom" | "carousel" | "none";
  /** Drawn over the map: the results page's own buttons and count. */
  children?: React.ReactNode;
}

const CAROUSEL_GAP = 10;

export function PropertyResultsMap({
  properties,
  activeLocation,
  onSelectProperty,
  style,
  peek = "top",
  children,
}: PropertyResultsMapProps) {
  const { t, language } = useTranslation();
  const isCarousel = peek === "carousel";
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    () => (isCarousel ? properties.find(hasCoordinates) : properties[0]) || null,
  );

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

  // The carousel only holds listings with a pin, so every card has a pin to light up.
  const pinned = useMemo(() => properties.filter(hasCoordinates), [properties]);
  const carouselRef = useRef<ScrollView | null>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const slideWidth = Math.max(0, carouselWidth - 48);

  const scrollCarouselTo = useCallback(
    (id: string) => {
      const index = pinned.findIndex((p) => String(p.id) === id);
      if (index < 0 || !slideWidth) return;
      carouselRef.current?.scrollTo({ x: index * (slideWidth + CAROUSEL_GAP), animated: true });
    },
    [pinned, slideWidth],
  );

  const handleSelect = useCallback(
    (id: string) => {
      const found = properties.find((p) => String(p.id) === id);
      if (!found) return;
      setSelectedProperty(found);
      if (isCarousel) {
        scrollCarouselTo(id);
        return;
      }
      onSelectProperty?.(found);
    },
    [properties, onSelectProperty, isCarousel, scrollCarouselTo],
  );

  // When a filter drops the chosen listing, the carousel falls back to its first card.
  const activeProperty = isCarousel
    ? selectedProperty && pinned.some((p) => p.id === selectedProperty.id)
      ? selectedProperty
      : pinned[0] ?? null
    : selectedProperty;

  const handleCarouselSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!slideWidth) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / (slideWidth + CAROUSEL_GAP));
    const next = pinned[Math.min(Math.max(index, 0), pinned.length - 1)];
    if (next && next.id !== activeProperty?.id) setSelectedProperty(next);
  };

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
    <View style={[styles.container, style]}>
      {/* Leaflet in the page on the website, and the same map in a WebView in the app. */}
      <HomeMapCanvas
        markers={markers}
        selectedId={activeProperty ? String(activeProperty.id) : null}
        onSelect={handleSelect}
        accessibilityLabel={`${activeLocation || "Dhaka"} properties map`}
        // The map is the whole view here, so one finger pans it. The zoom
        // buttons move to the bottom because the listing card sits on top.
        touchDrag
        zoomControlPosition="bottomright"
      />

      {children}

      {isCarousel && pinned.length === 0 && properties.length > 0 ? (
        <View style={styles.noPins} pointerEvents="none">
          <Text style={styles.noPinsText}>{t("search.results.noPins")}</Text>
        </View>
      ) : null}

      {isCarousel && pinned.length > 0 ? (
        <View
          style={styles.carouselWrap}
          onLayout={(e: LayoutChangeEvent) => setCarouselWidth(e.nativeEvent.layout.width)}
        >
          {slideWidth > 0 ? (
            <ScrollView
              ref={carouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={slideWidth + CAROUSEL_GAP}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onMomentumScrollEnd={handleCarouselSettle}
              // Web has no momentum event; a settled scroll position does the same job.
              onScrollEndDrag={handleCarouselSettle}
              scrollEventThrottle={64}
            >
              {pinned.map((p) => (
                <CarouselCard
                  key={p.id}
                  property={p}
                  width={slideWidth}
                  active={p.id === activeProperty?.id}
                  onPress={() =>
                    onSelectProperty ? onSelectProperty(p) : router.push(`/property/${p.id}` as never)
                  }
                />
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {/* Selected property peek card */}
      {!isCarousel && peek !== "none" && selectedProperty ? (
        <View style={[styles.peekCard, peek === "bottom" ? styles.peekCardBottom : styles.peekCardTop]}>
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

/** One card in the phone map's carousel: photo left, price and facts right. */
function CarouselCard({
  property,
  width,
  active,
  onPress,
}: {
  property: Property;
  width: number;
  active: boolean;
  onPress: () => void;
}) {
  const { t, language } = useTranslation();
  const photo =
    property.media?.find((m) => m.media_type === "image")?.url ?? property.media?.[0]?.url ?? null;
  const price = formatLocalizedPrice(property.price, property.price_currency || "BDT", language);
  const beds = Number(property.bedrooms ?? (property.amenities as Record<string, unknown> | null)?.bedrooms);
  const type = property.subtype || property.type;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={t("search.results.openListing", { title: property.title })}
      onPress={onPress}
      style={[styles.slide, { width }, active && styles.slideActive, webPointer]}
    >
      <View style={styles.slideImageWrap}>
        {photo ? (
          <Image source={{ uri: cdnImage(photo, 320, 240) }} style={styles.peekImage} contentFit="cover" />
        ) : (
          <View style={styles.peekImagePlaceholder}>
            <MapPin size={20} color={colorTokens.subtle} />
          </View>
        )}
      </View>
      <View style={styles.slideInfo}>
        <Text numberOfLines={1} style={styles.slidePrice}>
          {price}
          {property.listing_type === "rent" ? (
            <Text style={styles.peekPerMonth}> {t("propertyCard.perMonth")}</Text>
          ) : null}
        </Text>
        <View style={styles.slideFacts}>
          {type ? (
            <Text numberOfLines={1} style={styles.slideType}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace(/[_-]+/g, " ")}
            </Text>
          ) : null}
          {Number.isFinite(beds) && beds > 0 ? (
            <View style={styles.slideBeds}>
              <BedDouble size={15} color={colorTokens.body} strokeWidth={1.9} />
              <Text style={styles.slideType}>{beds}</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.peekLocation}>
          {[property.address, property.area?.name].filter(Boolean).join(", ") || "Dhaka"}
        </Text>
      </View>
    </Pressable>
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
  // The card sits at the top of the map: on phones the List/Map pill floats over
  // the bottom of the screen, which is where the card used to be.
  peekCard: {
    position: "absolute",
    left: 12,
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
  peekCardTop: {
    top: 12,
    right: 12,
  },
  peekCardBottom: {
    bottom: 16,
    width: 380,
    maxWidth: "90%",
  },
  noPins: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surface,
    zIndex: 10,
  },
  noPinsText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
    textAlign: "center",
  },
  carouselWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    // Clears the map's attribution line.
    bottom: 26,
    zIndex: 10,
  },
  carouselContent: {
    paddingHorizontal: 24,
    gap: CAROUSEL_GAP,
  },
  slide: {
    height: 118,
    flexDirection: "row",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  slideActive: {
    borderColor: colorTokens.brand,
  },
  slideImageWrap: {
    width: "42%",
    height: "100%",
    backgroundColor: colorTokens.surfaceSunken,
  },
  slideInfo: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 5,
    justifyContent: "center",
  },
  slidePrice: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colorTokens.ink,
  },
  slideFacts: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slideType: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  slideBeds: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
