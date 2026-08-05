import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  Share,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Linking,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Video,
  X,
  Globe,
  RotateCcw,
  BedDouble,
  Bath,
  LandPlot,
} from "lucide-react-native";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fontTokens, shadow, webPointer } from "@/theme";
import { usePropertyDetail, type PropertyDetail } from "../hooks/usePropertyDetail";
import { PropertyHighlights } from "../components/PropertyHighlights";
import { PropertyAmenities } from "../components/PropertyAmenities";
import { SellerCard } from "../components/SellerCard";
import { SimilarProperties } from "../components/SimilarProperties";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85";

/* ─── Skeleton Loader ────────────────────────────────────────────────────── */

function DetailSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine80} />
        <View style={styles.skeletonLine50} />
        <View style={styles.skeletonLine60} />
        <View style={styles.skeletonGrid}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
        <View style={styles.skeletonLineFull} />
        <View style={styles.skeletonLineFull} />
        <View style={styles.skeletonLine70} />
      </View>
    </View>
  );
}

/* ─── Image Carousel ─────────────────────────────────────────────────────── */

function ImageCarousel({
  media,
  onOpenFullscreen,
}: {
  media: { url: string; media_type: string }[];
  onOpenFullscreen: (index: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const images =
    media.length > 0
      ? media.filter((m) => m.media_type === "image").map((m) => m.url)
      : [FALLBACK_IMAGE];

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (cardWidth <= 0) return;
      const index = Math.round(
        event.nativeEvent.contentOffset.x / cardWidth,
      );
      if (index >= 0 && index < images.length) {
        setActiveIndex(index);
      }
    },
    [cardWidth, images.length],
  );

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, i) => `img-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onOpenFullscreen(index)}
            style={[styles.carouselImageWrap, { width: cardWidth || 340 }]}
            accessibilityLabel={`View photo ${index + 1}`}
          >
            <Image source={{ uri: item }} style={styles.carouselImage} />
          </Pressable>
        )}
      />

      {/* Photo Index Pill */}
      {images.length > 1 ? (
        <View style={styles.photoIndexPill}>
          <Text style={styles.photoIndexText}>
            {activeIndex + 1}/{images.length}
          </Text>
        </View>
      ) : null}

      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.backBtn, webPointer]}
        accessibilityLabel="Go back"
      >
        <ArrowLeft color={colorTokens.textInverse} size={20} />
      </Pressable>
    </View>
  );
}

/* ─── Fullscreen Image Viewer ────────────────────────────────────────────── */

function FullscreenViewer({
  images,
  initialIndex,
  visible,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const width = event.nativeEvent.layoutMeasurement.width;
      if (width <= 0) return;
      const index = Math.round(
        event.nativeEvent.contentOffset.x / width,
      );
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    },
    [images.length],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.fullscreenOverlay}>
        <Pressable
          onPress={onClose}
          style={styles.fullscreenCloseBtn}
          accessibilityLabel="Close fullscreen"
        >
          <X color={colorTokens.textInverse} size={24} />
        </Pressable>

        <FlatList
          data={images}
          keyExtractor={(_, i) => `full-${i}`}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: 340,
            offset: 340 * index,
            index,
          })}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        />

        {images.length > 1 ? (
          <View style={styles.fullscreenCounter}>
            <Text style={styles.fullscreenCounterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */

export function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPhone } = useResponsive();
  const { data: property, isLoading, error, refetch } = usePropertyDetail(id ?? "");

  const [saved, setSaved] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const handleShare = () => {
    if (!property) return;
    void Share.share({
      message: `${property.title} — ${property.area?.name ?? ""} ${property.area?.city ?? ""}\n${property.price_currency} ${property.price.toLocaleString()}`,
    });
  };

  const handleOpenFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  const imagesForFullscreen =
    property?.media
      ?.filter((m) => m.media_type === "image")
      .map((m) => m.url) ?? [];

  const hasMap =
    property?.location_lat != null && property.location_lng != null;

  const descriptionLines = property?.description?.split("\n") ?? [];
  const isLongDescription = descriptionLines.length > 3 || (property?.description?.length ?? 0) > 200;
  const displayDescription =
    descriptionExpanded || !isLongDescription
      ? property?.description
      : descriptionLines.slice(0, 3).join("\n") + "…";

  /* ─── Loading ─────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <AppChrome active="property">
        <DetailSkeleton />
      </AppChrome>
    );
  }

  /* ─── Error ───────────────────────────────────────────────────────────── */
  if (error || !property) {
    return (
      <AppChrome active="property">
        <View style={styles.centerState}>
          <View style={styles.errorIconWrap}>
            <RotateCcw color={colorTokens.textMuted} size={36} />
          </View>
          <Text style={styles.centerTitle}>
            {error ? "Something went wrong" : "Property not found"}
          </Text>
          <Text style={styles.centerSubtitle}>
            {error?.message ?? "This property may have been removed."}
          </Text>
          <Pressable
            onPress={() => (error ? refetch() : router.back())}
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>
              {error ? "Try Again" : "Go Back"}
            </Text>
          </Pressable>
        </View>
      </AppChrome>
    );
  }

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <AppChrome active="property">
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isPhone && styles.scrollContentPhone,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumbs */}
        <View style={styles.breadcrumbs}>
          <Pressable onPress={() => router.back()} style={styles.breadcrumbLink}>
            <Text style={styles.breadcrumbText}>Properties</Text>
          </Pressable>
          <ChevronRight color={colorTokens.textMuted} size={12} />
          {property.area ? (
            <>
              <Text style={styles.breadcrumbText} numberOfLines={1}>
                {property.area.name}
              </Text>
              <ChevronRight color={colorTokens.textMuted} size={12} />
            </>
          ) : null}
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
            {property.title}
          </Text>
        </View>

        {/* Image Carousel */}
        <ImageCarousel
          media={property.media ?? []}
          onOpenFullscreen={handleOpenFullscreen}
        />

        {/* Property Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              {/* Listing Type Badge */}
              <View
                style={[
                  styles.listingBadge,
                  {
                    backgroundColor:
                      property.listing_type === "sale"
                        ? colorTokens.primary
                        : colorTokens.verified,
                  },
                ]}
              >
                <Text style={styles.listingBadgeText}>
                  {property.listing_type === "sale" ? "FOR SALE" : "FOR RENT"}
                </Text>
              </View>

              {/* Verified Badge */}
              {property.is_verified ? (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck color={colorTokens.verified} size={14} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>

            {/* Share & Save Buttons */}
            <View style={styles.headerActions}>
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.actionCircle,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel="Share property"
              >
                <Share2 color={colorTokens.textSecondary} size={18} />
              </Pressable>
              <Pressable
                onPress={() => setSaved((s) => !s)}
                style={({ pressed }) => [
                  styles.actionCircle,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel={saved ? "Remove from saved" : "Save property"}
              >
                <Heart
                  color={saved ? colorTokens.error : colorTokens.textSecondary}
                  fill={saved ? colorTokens.error : "transparent"}
                  size={18}
                />
              </Pressable>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, isPhone && styles.titlePhone]}>
            {property.title}
          </Text>

          {/* Price */}
          <Text style={styles.price}>
            {property.price_currency || "BDT"}{" "}
            {property.price.toLocaleString()}
            {property.listing_type === "rent" ? (
              <Text style={styles.priceSuffix}>/mo</Text>
            ) : null}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin color={colorTokens.primary} size={16} />
            <Text style={styles.locationText}>
              {property.area?.name ?? ""}
              {property.area?.city ? `, ${property.area.city}` : ""}
            </Text>
          </View>

          {/* Address */}
          {property.address ? (
            <Text style={styles.address}>{property.address}</Text>
          ) : null}
        </View>

        {/* Highlights Grid */}
        <View style={styles.section}>
          <PropertyHighlights
            areaSize={property.area_size}
            areaUnit={property.area_unit}
            type={property.type}
            listingType={property.listing_type}
            publishedAt={property.published_at}
          />
        </View>

        {/* Description */}
        {property.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text style={styles.description}>{displayDescription}</Text>
            {isLongDescription ? (
              <Pressable
                onPress={() => setDescriptionExpanded((e) => !e)}
                style={styles.expandBtn}
                accessibilityLabel={descriptionExpanded ? "Show less" : "Read more"}
              >
                <Text style={styles.expandBtnText}>
                  {descriptionExpanded ? "Show less" : "Read more"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Amenities */}
        <View style={styles.section}>
          <PropertyAmenities amenities={property.amenities} />
        </View>

        {/* Map Preview */}
        {hasMap ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps?q=${property.location_lat},${property.location_lng}`,
                )
              }
              style={({ pressed }) => [
                styles.mapPreview,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="View on Google Maps"
            >
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/staticmap?center=${property.location_lat},${property.location_lng}&zoom=15&size=600x300&markers=color:green%7C${property.location_lat},${property.location_lng}&key=`,
                }}
                style={styles.mapImage}
              />
              <View style={styles.mapOverlay}>
                <Globe color={colorTokens.primary} size={18} />
                <Text style={styles.mapOverlayText}>View on Map</Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* Virtual Tour */}
        {property.virtual_tour_url ? (
          <View style={styles.section}>
            <Pressable
              onPress={() => Linking.openURL(property.virtual_tour_url!)}
              style={({ pressed }) => [
                styles.virtualTourBtn,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Open virtual tour"
            >
              <Video color={colorTokens.textInverse} size={18} />
              <Text style={styles.virtualTourText}>Virtual Tour</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Seller Card */}
        <View style={styles.section}>
          <SellerCard user={property.user} />
        </View>

        {/* Similar Properties */}
        {property.area ? (
          <View style={styles.section}>
            <SimilarProperties
              type={property.type}
              areaId={property.area.id}
              excludeId={property.id}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Fullscreen Image Viewer */}
      <FullscreenViewer
        images={imagesForFullscreen}
        initialIndex={fullscreenIndex}
        visible={fullscreenVisible}
        onClose={() => setFullscreenVisible(false)}
      />
    </AppChrome>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  scrollContentPhone: {
    paddingBottom: 30,
  },

  /* ─── Breadcrumbs ───────────────────────────────────────────────────── */
  breadcrumbs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    paddingVertical: 2,
  },
  breadcrumbText: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  breadcrumbCurrent: {
    flex: 1,
    minWidth: 60,
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },

  /* ─── Carousel ──────────────────────────────────────────────────────── */
  carouselContainer: {
    position: "relative",
    width: "100%",
    height: 380,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colorTokens.backgroundAlt,
  },
  carouselImageWrap: {
    height: "100%",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  photoIndexPill: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  photoIndexText: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
  backBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  /* ─── Header ────────────────────────────────────────────────────────── */
  headerSection: {
    marginTop: 20,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  listingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  listingBadgeText: {
    fontSize: 11,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textInverse,
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colorTokens.verifiedLight,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: fontTokens.bold,
    color: colorTokens.verified,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  titlePhone: {
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  price: {
    fontSize: 28,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.primary,
    letterSpacing: -1,
  },
  priceSuffix: {
    fontSize: 16,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textMuted,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  address: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },

  /* ─── Sections ──────────────────────────────────────────────────────── */
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
    marginBottom: 12,
  },

  /* ─── Description ───────────────────────────────────────────────────── */
  description: {
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 22,
  },
  expandBtn: {
    marginTop: 8,
    paddingVertical: 4,
  },
  expandBtnText: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },

  /* ─── Map ───────────────────────────────────────────────────────────── */
  mapPreview: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  mapImage: {
    width: "100%",
    height: 180,
  },
  mapOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  mapOverlayText: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },

  /* ─── Virtual Tour ──────────────────────────────────────────────────── */
  virtualTourBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colorTokens.primary,
  },
  virtualTourText: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },

  /* ─── Center States ─────────────────────────────────────────────────── */
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    marginBottom: 8,
  },
  centerTitle: {
    fontSize: 18,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  centerSubtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colorTokens.primary,
  },
  retryBtnText: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },

  /* ─── Skeleton ──────────────────────────────────────────────────────── */
  skeletonContainer: {
    gap: 16,
  },
  skeletonImage: {
    width: "100%",
    height: 380,
    borderRadius: 18,
    backgroundColor: colorTokens.divider,
  },
  skeletonContent: {
    gap: 14,
    paddingVertical: 8,
  },
  skeletonLine80: {
    height: 28,
    width: "80%",
    borderRadius: 6,
    backgroundColor: colorTokens.divider,
  },
  skeletonLine50: {
    height: 20,
    width: "50%",
    borderRadius: 6,
    backgroundColor: colorTokens.divider,
  },
  skeletonLine60: {
    height: 16,
    width: "60%",
    borderRadius: 6,
    backgroundColor: colorTokens.divider,
  },
  skeletonLine70: {
    height: 16,
    width: "70%",
    borderRadius: 6,
    backgroundColor: colorTokens.divider,
  },
  skeletonLineFull: {
    height: 14,
    width: "100%",
    borderRadius: 4,
    backgroundColor: colorTokens.divider,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skeletonCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: 140,
    height: 90,
    borderRadius: 14,
    backgroundColor: colorTokens.divider,
  },

  /* ─── Fullscreen ────────────────────────────────────────────────────── */
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  fullscreenCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  fullscreenImage: {
    width: 340,
    height: 340,
  },
  fullscreenCounter: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  fullscreenCounterText: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
});
