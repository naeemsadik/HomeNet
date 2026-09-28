import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Maximize2,
  Phone,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
} from "@/components/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PageMeta } from "@/components/PageMeta";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { notify } from "@/lib/alert";
import { shareLink } from "@/lib/share";
import { cdnImage } from "@/lib/cloudinaryImage";
import { colorTokens, webPointer } from "@/theme";
import { usePropertyDetail, useSimilarProperties } from "../hooks/usePropertyDetail";
import { useSavedStore } from "@/stores/savedStore";
import { styles } from "./PropertyDetailScreen.styles";
import { BookVisitModal } from "../components/BookVisitModal";
import { PropertyLightbox } from "../components/PropertyLightbox";
import { PropertyLocationSection, type NearbyPlace } from "../components/PropertyLocationSection";
import { WhatsAppIcon } from "../components/WhatsAppIcon";

type AiValuation = {
  estimatedValue: string;
  comparisonText: string;
  trend: string;
};

export function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPhone, isTablet } = useResponsive();
  const { data: apiDetail, error, isLoading, refetch } = usePropertyDetail(id ?? "");
  const {
    data: similarProperties = [],
    error: similarError,
    isLoading: similarLoading,
    refetch: refetchSimilar,
  } = useSimilarProperties(
    apiDetail?.type,
    apiDetail?.area?.id,
    id ?? "",
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isPropertySaved = useSavedStore((s) => s.isSaved(id ?? ""));
  const toggleSaved = useSavedStore((s) => s.toggleSaved);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [thumbScrollX, setThumbScrollX] = useState(0);
  const [maxThumbScroll, setMaxThumbScroll] = useState(448);
  const [thumbContainerWidth, setThumbContainerWidth] = useState(884);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const thumbScrollRef = useRef<ScrollView>(null);
  const lightboxThumbScrollRef = useRef<ScrollView>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const property = useMemo(() => {
    if (!apiDetail) return null;

    const rawAmenities = (apiDetail.amenities as Record<string, any>) || {};
    const amenityList = Object.keys(rawAmenities).filter(
      (key) => !["bedrooms", "bathrooms", "floor", "facing"].includes(key) && rawAmenities[key]
    );

    const rawImages = apiDetail.media
      ? apiDetail.media.filter((m) => m.media_type === "image").map((m) => m.url)
      : [];

    // The gallery is the largest image on the page, so it gets a generous
    // width — but still a bounded one, not the 3 MB original.
    const images = rawImages
      .map((url) => cdnImage(url, 1600, 1000))
      .filter((url): url is string => Boolean(url));

    const identity = apiDetail.user?.auth_identities?.[0];
    const location = [apiDetail.area?.name, (apiDetail.area as any)?.city].filter(Boolean).join(", ");

    return {
      id: apiDetail.id,
      title: apiDetail.title,
      location: location || apiDetail.address || "Location unavailable",
      address: apiDetail.address || location || "Address unavailable",
      latitude: apiDetail.location_lat,
      longitude: apiDetail.location_lng,
      type: apiDetail.subtype || (apiDetail.type ? apiDetail.type.charAt(0).toUpperCase() + apiDetail.type.slice(1) : "Property"),
      listingType: apiDetail.listing_type === "rent" ? "For Rent" : "For Sale",
      price: typeof apiDetail.price === "number" ? apiDetail.price.toLocaleString("en-BD") : String(apiDetail.price || 0),
      priceCurrency: apiDetail.price_currency === "BDT" ? "৳" : (apiDetail.price_currency || "৳"),
      pricePeriod: apiDetail.listing_type === "rent" ? "/mo" : "",
      isVerified: Boolean(apiDetail.is_verified),
      isBoosted: false,
      score: (apiDetail as any).score ?? null,
      bedrooms: Number((apiDetail as any).bedrooms ?? rawAmenities.bedrooms ?? 0),
      bathrooms: Number((apiDetail as any).bathrooms ?? rawAmenities.bathrooms ?? 0),
      areaSqft: apiDetail.area_size ? apiDetail.area_size.toLocaleString("en-BD") : null,
      // Placeholder: the API has no valuation yet, so the card below never
      // renders. Wire this up when the backend ships one.
      aiValuation: null as AiValuation | null,
      description: apiDetail.description || "No description provided.",
      amenities: amenityList,
      mediaImages: images,
      seller: {
        name: apiDetail.user?.full_name || "Verified Seller",
        agency: null as string | null,
        isVerified: Boolean(apiDetail.is_verified),
        avatarUrl: apiDetail.user?.avatar_url || null,
        phone: identity?.phone || null,
        email: identity?.email || "",
      },
      // Placeholder, like aiValuation: no API field yet, so the
      // recommendation card never renders.
      aiRecommendation: null as string | null,
      nearbyPlaces: [] as NearbyPlace[],
      similarProperties: similarProperties.map((sim) => {
        const simAmenities = (sim.amenities as Record<string, any>) || {};
        return {
          id: sim.id,
          title: sim.title,
          location: [sim.area?.name, (sim.area as any)?.city].filter(Boolean).join(", ") || sim.address || "Dhaka",
          price: `${sim.price_currency || "৳"} ${typeof sim.price === "number" ? sim.price.toLocaleString() : sim.price}`,
          specs: `${Number(simAmenities.bedrooms ?? 0)} Beds · ${Number(simAmenities.bathrooms ?? 0)} Baths · ${sim.area_size?.toLocaleString() ?? "N/A"} ${sim.area_unit || "sqft"}`,
          imageUrl: cdnImage(
        sim.media?.find((m) => m.media_type === "image")?.url || sim.media?.[0]?.url,
        700,
        460,
      ),
          status: sim.status,
          views: (sim.view_count || 0).toLocaleString(),
          score: (sim as any).score ?? null,
        };
      }),
    };
  }, [apiDetail, similarProperties]);

  const handleCall = () => {
    if (!property?.seller.phone) {
      notify("Phone unavailable", "The property owner has not shared a phone number.");
      return;
    }
    void Linking.openURL(`tel:${property.seller.phone}`);
  };

  const openWhatsApp = (message: string) => {
    const rawPhone = property?.seller.phone;
    if (!rawPhone) {
      notify("Phone unavailable", "The property owner has not shared a phone number.");
      return;
    }
    const cleanPhone = rawPhone.replace(/[^\d]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    void Linking.openURL(whatsappUrl).catch(() => {
      notify(
        "WhatsApp",
        `Could not launch WhatsApp. You can message the seller directly at ${rawPhone}.`,
      );
    });
  };

  const handleWhatsApp = () => {
    openWhatsApp(
      `Hello ${property?.seller.name || "Seller"}, I'm interested in your property "${property?.title || "Property"}" (${property?.priceCurrency || "৳"} ${property?.price || ""}${property?.pricePeriod || ""}) on Homenet. Is this property currently available?`,
    );
  };

  // There is no visit-booking API, so the request goes to the seller directly
  // instead of a confirmation screen promising a callback nobody schedules.
  const handleRequestVisit = () => {
    const link = Platform.OS === "web" && typeof window !== "undefined" ? ` (${window.location.href})` : "";
    openWhatsApp(
      `Hello ${property?.seller.name || "Seller"}, I'd like to visit your property "${property?.title || "Property"}" listed on Homenet${link}. When would be a good time to see it?`,
    );
  };

  // Used to claim the link was copied without copying anything.
  const handleShare = () => {
    if (!property) return;
    void shareLink({ title: property.title });
  };

  // Guests get a "saved on this device" toast from the saved store.
  const handleToggleSaved = () => {
    const target = apiDetail ?? id;
    if (target) void toggleSaved(target);
  };

  const DESKTOP_VISIBLE_COUNT = 8;
  const totalPhotos = property?.mediaImages.length || 0;
  const hasExtraPhotos = totalPhotos > DESKTOP_VISIBLE_COUNT;
  const extraPhotosCount = totalPhotos - DESKTOP_VISIBLE_COUNT;

  const scrollThumbTo = (index: number) => {
    const cardWidth = isPhone ? 82 : 100;
    const gap = isPhone ? 8 : 12;
    const targetX = Math.max(0, index * (cardWidth + gap) - 100);
    thumbScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleNextPhoto = () => {
    if (!property || !property.mediaImages.length) return;
    setActiveImageIndex((prev) => {
      const next = Math.min(prev + 1, property.mediaImages.length - 1);
      scrollThumbTo(next);
      return next;
    });
  };

  const handlePrevPhoto = () => {
    if (!property || !property.mediaImages.length) return;
    setActiveImageIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      scrollThumbTo(next);
      return next;
    });
  };

  const handleExpandMore = () => {
    const cardWidth = isPhone ? 82 : 100;
    const gap = isPhone ? 8 : 12;
    const step = 4 * (cardWidth + gap);
    thumbScrollRef.current?.scrollTo({ x: step, animated: true });
    setThumbScrollX(step);
  };

  const handleScrollLeft = () => {
    const cardWidth = isPhone ? 82 : 100;
    const gap = isPhone ? 8 : 12;
    const step = (isPhone ? 2 : 4) * (cardWidth + gap);
    const newX = Math.max(0, thumbScrollX - step);
    thumbScrollRef.current?.scrollTo({ x: newX, animated: true });
    setThumbScrollX(newX);
  };

  const handleScrollRight = () => {
    const cardWidth = isPhone ? 82 : 100;
    const gap = isPhone ? 8 : 12;
    const step = (isPhone ? 2 : 4) * (cardWidth + gap);
    const newX = Math.min(maxThumbScroll, thumbScrollX + step);
    thumbScrollRef.current?.scrollTo({ x: newX, animated: true });
    setThumbScrollX(newX);
  };

  useEffect(() => {
    scrollThumbTo(activeImageIndex);
    if (lightboxVisible && lightboxThumbScrollRef.current) {
      const targetX = Math.max(0, activeImageIndex * 86 - 160);
      lightboxThumbScrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [activeImageIndex, thumbContainerWidth, lightboxVisible]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (isInput) return;

      if (lightboxVisible) {
        if (e.key === "Escape") {
          setLightboxVisible(false);
        } else if (e.key === "ArrowLeft") {
          handlePrevPhoto();
        } else if (e.key === "ArrowRight") {
          handleNextPhoto();
        }
      } else {
        if (e.key === "ArrowLeft") {
          handlePrevPhoto();
        } else if (e.key === "ArrowRight") {
          handleNextPhoto();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxVisible, property?.mediaImages.length]);

  const mapLocationQuery = property
    ? property.latitude && property.longitude
      ? `${property.latitude},${property.longitude}`
      : `${property.address ? property.address + ", " : ""}${property.location}, Bangladesh`
    : "";

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocationQuery)}`;

  if (isLoading && !property) {
    return (
      <AppChrome active="property">
        <View style={styles.requestState}>
          <ActivityIndicator color="#04cf92" size="large" />
          <Text style={styles.requestError}>Loading property details...</Text>
        </View>
      </AppChrome>
    );
  }

  if (!property) {
    return (
      <AppChrome active="property">
        <View style={styles.requestState}>
          <Text style={styles.requestError}>{error instanceof Error ? error.message : "Property not found."}</Text>
          <Pressable onPress={() => (error ? void refetch() : router.back())} style={styles.retryButton}>
            <RotateCcw color={colorTokens.onBrand} size={16} />
            <Text style={styles.retryText}>{error ? "Retry" : "Go Back"}</Text>
          </Pressable>
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome active="property">
      {/* The listing itself is the page title — that is what a search result
          for this URL should read. */}
      <PageMeta
        title={`${property.title} — ${property.location} | HomeNet`}
        description={`${property.listingType} at ${property.priceCurrency}${property.price}${property.pricePeriod}. ${property.address}.`}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          isPhone && styles.scrollBodyPhone,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row: Back Link & Share/Favorite */}
        <View style={styles.topHeaderNav}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backLink, webPointer, pressed && styles.pressed]}
          >
            <ArrowLeft color="#0B1A17" size={18} />
            <Text style={styles.backLinkText}>Back</Text>
          </Pressable>

          <View style={styles.actionHeaderBtns}>
            <Pressable
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share property"
              style={({ pressed }) => [styles.actionCircleBtn, webPointer, pressed && styles.pressed]}
            >
              <Share2 color="#0B1A17" size={18} />
            </Pressable>

            <Pressable
              onPress={handleToggleSaved}
              accessibilityRole="button"
              accessibilityLabel={isPropertySaved ? "Remove from saved" : "Save property"}
              style={({ pressed }) => [styles.actionCircleBtn, webPointer, pressed && styles.pressed]}
            >
              <Heart
                color={isPropertySaved ? "#D4183D" : "#0B1A17"}
                fill={isPropertySaved ? "#D4183D" : "transparent"}
                size={18}
              />
            </Pressable>
          </View>
        </View>


        {/* Main Content & Sidebar Grid */}
        <View style={[styles.mainLayoutGrid, isTablet && styles.mainLayoutGridTablet]}>
          {/* Left Main Details Column */}
          <View style={styles.leftColumn}>
            {/* Hero Image Gallery */}
            <View style={styles.galleryContainer}>
              <Pressable
                onPress={() => setLightboxVisible(true)}
                style={[styles.mainImageWrap, isPhone && styles.mainImageWrapPhone, webPointer]}
                onTouchStart={(e) => {
                  touchStartX.current = e.nativeEvent.pageX;
                  touchStartY.current = e.nativeEvent.pageY;
                }}
                onTouchEnd={(e) => {
                  const dx = touchStartX.current - e.nativeEvent.pageX;
                  const dy = touchStartY.current - e.nativeEvent.pageY;
                  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                      handleNextPhoto();
                    } else {
                      handlePrevPhoto();
                    }
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="View full photo gallery"
              >
                {property.mediaImages.length ? (
                  <Image
                    source={{ uri: property.mediaImages[activeImageIndex] || property.mediaImages[0] }}
                    style={styles.mainImage}
                  />
                ) : (
                  <View style={styles.mediaPlaceholder}>
                    <Building2 color="#6B7D78" size={48} />
                    <Text style={styles.mediaPlaceholderText}>No property media</Text>
                  </View>
                )}

                {/* Status Badges Overlay */}
                <View style={styles.galleryBadgesRow}>
                  {property.isVerified ? (
                    <View style={styles.verifiedTag}>
                      <ShieldCheck color="#04cf92" size={14} />
                      <Text style={styles.verifiedTagText}>Verified</Text>
                    </View>
                  ) : null}

                  <View style={styles.forRentTag}>
                    <Text style={styles.forRentTagText}>{property.listingType}</Text>
                  </View>
                </View>

                {/* Photo Counter & Fullscreen Trigger Badge */}
                {property.mediaImages.length > 0 ? (
                  <View style={[styles.photoCountPill, webPointer]}>
                    <Camera color="#FFFFFF" size={13} />
                    <Text style={styles.photoCountText}>
                      {activeImageIndex + 1} / {property.mediaImages.length}
                    </Text>
                    <Maximize2 color="rgba(255, 255, 255, 0.75)" size={12} style={{ marginLeft: 3 }} />
                  </View>
                ) : null}
              </Pressable>

              {/* Thumbnails Row with navigation arrows for both PC & Mobile */}
              <View
                style={styles.thumbnailsContainer}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) setThumbContainerWidth(w);
                }}
              >
                {thumbScrollX > 8 ? (
                  <Pressable
                    onPress={handleScrollLeft}
                    style={({ pressed }) => [
                      styles.thumbScrollBtn,
                      styles.thumbScrollBtnLeft,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                    accessibilityLabel="Previous thumbnails"
                  >
                    <ChevronLeft color="#FFFFFF" size={18} />
                  </Pressable>
                ) : null}

                <ScrollView
                  ref={thumbScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsScrollContent}
                  scrollEventThrottle={16}
                  onScroll={(e) => setThumbScrollX(e.nativeEvent.contentOffset.x)}
                  onContentSizeChange={(contentWidth) => {
                    setMaxThumbScroll(Math.max(0, contentWidth - thumbContainerWidth));
                  }}
                >
                  {property.mediaImages.map((img, idx) => {
                    const isEighthCard = idx === 7;
                    const showPlusBadge = !isPhone && hasExtraPhotos && isEighthCard && thumbScrollX < 40;

                    return (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          setActiveImageIndex(idx);
                          if (showPlusBadge) {
                            handleExpandMore();
                          }
                        }}
                        style={[
                          styles.thumbnailCard,
                          isPhone && styles.thumbnailCardPhone,
                          activeImageIndex === idx ? styles.thumbnailCardActive : styles.thumbnailCardInactive,
                          webPointer,
                        ]}
                      >
                        <Image source={{ uri: img }} style={styles.thumbnailImg} />
                        {showPlusBadge ? (
                          <View style={styles.moreImagesOverlay}>
                            <Text style={styles.moreImagesText}>+{extraPhotosCount} images</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {maxThumbScroll > 10 && thumbScrollX < maxThumbScroll - 8 ? (
                  <Pressable
                    onPress={handleScrollRight}
                    style={({ pressed }) => [
                      styles.thumbScrollBtn,
                      styles.thumbScrollBtnRight,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                    accessibilityLabel="More thumbnails"
                  >
                    <ChevronRight color="#FFFFFF" size={18} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Property Overview Header */}
            <View style={styles.overviewHeaderCard}>
              <View style={styles.titleCategoryRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{property.type}</Text>
                </View>
                {property.isVerified ? (
                  <View style={styles.verifiedSmallBadge}>
                    <ShieldCheck color="#04cf92" size={14} />
                    <Text style={styles.verifiedSmallText}>Verified</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.propertyTitle}>{property.title}</Text>

              <View style={styles.locationSubRow}>
                <MapPin color="#04cf92" size={16} />
                <Text style={styles.locationSubText}>{property.location}</Text>
              </View>

              {/* Key Specs Bar */}
              <View style={styles.keySpecsRow}>
                <View style={styles.specItem}>
                  <BedDouble color="#04cf92" size={18} />
                  <Text style={styles.specText}>{property.bedrooms} Beds</Text>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specItem}>
                  <Bath color="#04cf92" size={18} />
                  <Text style={styles.specText}>{property.bathrooms} Baths</Text>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specItem}>
                  <Maximize2 color="#04cf92" size={18} />
                  <Text style={styles.specText}>{property.areaSqft} sqft</Text>
                </View>
              </View>
            </View>

            {/* AI Property Valuation Box */}
            {property.aiValuation ? (
            <View style={styles.aiValuationCard}>
              <View style={styles.aiValuationHeader}>
                <Sparkles color="#04cf92" size={20} />
                <Text style={styles.aiValuationTitle}>AI Property Valuation</Text>
              </View>

              <Text style={styles.aiValuationDesc}>
                Estimated fair value <Text style={styles.boldText}>৳ {property.aiValuation.estimatedValue}{property.pricePeriod}</Text>.{" "}
                {property.aiValuation.comparisonText}
              </Text>

              <View style={styles.aiTrendBadge}>
                <TrendingUp color="#04cf92" size={14} />
                <Text style={styles.aiTrendText}>{property.aiValuation.trend}</Text>
              </View>
            </View>
            ) : null}

            {/* About this property */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>About this property</Text>
              <Text style={styles.descriptionParagraph}>{property.description}</Text>

              {/* Amenities Grid */}
              <View style={styles.amenitiesCheckGrid}>
                {property.amenities.map((am) => (
                  <View key={am} style={styles.amenityCheckItem}>
                    <Check color="#04cf92" size={16} />
                    <Text style={styles.amenityCheckText}>{am}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Location & neighbourhood */}
            <PropertyLocationSection
              address={property.address}
              location={property.location}
              mapEmbedUrl={googleMapsEmbedUrl}
              mapExternalUrl={googleMapsExternalUrl}
              nearbyPlaces={property.nearbyPlaces}
              title={property.title}
            />

            {/* Similar properties Carousel */}
            {property.similarProperties && property.similarProperties.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.sectionHeading}>Similar properties</Text>
                <AppLink href="/buy">
                  <Text style={styles.seeAllLink}>See all</Text>
                </AppLink>
              </View>

              {similarLoading ? (
                <ActivityIndicator color="#04cf92" size="small" />
              ) : similarError ? (
                <Pressable onPress={() => void refetchSimilar()} style={styles.similarRequestState}>
                  <RotateCcw color="#04cf92" size={15} />
                  <Text style={styles.similarLoc}>
                    {similarError instanceof Error ? similarError.message : "Could not load similar listings."} Press to retry.
                  </Text>
                </Pressable>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
                  <View style={styles.similarRow}>
                    {property.similarProperties.map((sim) => (
                      <AppLink href={`/property/${sim.id}`} key={sim.id} style={styles.similarCard}>
                        {sim.imageUrl ? (
                          <Image source={{ uri: sim.imageUrl }} style={styles.similarThumb} />
                        ) : (
                          <View style={[styles.similarThumb, styles.similarThumbPlaceholder]}>
                            <Building2 color="#6B7D78" size={24} />
                          </View>
                        )}
                        <View style={styles.similarInfo}>
                          <View style={styles.similarPriceRow}>
                            <Text style={styles.similarPrice}>{sim.price}</Text>
                            {sim.score ? (
                              <View style={styles.similarScoreBadge}>
                                <Sparkles color="#04cf92" size={12} />
                                <Text style={styles.similarScoreText}>{sim.score}</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text numberOfLines={1} style={styles.similarTitle}>{sim.title}</Text>
                          <Text style={styles.similarLoc}>{sim.location}</Text>
                          <Text style={styles.similarSpecs}>{sim.specs}</Text>
                        </View>
                      </AppLink>
                    ))}
                    {property.similarProperties.length === 0 ? (
                      <Text style={styles.similarLoc}>No similar active listings found.</Text>
                    ) : null}
                  </View>
                </ScrollView>
              )}
            </View>
            )}
          </View>

          {/* Right Sidebar Column (Sticky Seller Card & AI Rec) */}
          <View style={styles.rightColumn}>
            {/* Seller Contact Card */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerRow}>
                {property.seller.avatarUrl ? (
                  <Image source={{ uri: property.seller.avatarUrl }} style={styles.sellerAvatar} />
                ) : (
                  <View style={[styles.sellerAvatar, styles.sellerAvatarPlaceholder]}>
                    <UserRound color="#4F625D" size={24} />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.sellerName}>{property.seller.name}</Text>
                  {property.seller.agency ? (
                    <Text style={styles.sellerAgency}>{property.seller.agency}</Text>
                  ) : null}
                </View>
              </View>

              {/* Asking Price Callout */}
              <View style={styles.priceCalloutWrap}>
                <View style={styles.priceCalloutHeader}>
                  <Text style={styles.priceCalloutLabel}>Asking price</Text>
                  {property.score ? (
                    <View style={styles.scoreBadge}>
                      <Sparkles color="#04cf92" size={14} />
                      <Text style={styles.scoreBadgeText}>{property.score}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.priceCalloutValue}>
                  {property.priceCurrency} {property.price}{" "}
                  <Text style={styles.priceCalloutPeriod}>{property.pricePeriod}</Text>
                </Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.sellerActionsRow}>
                <Pressable
                  accessibilityLabel="Call Seller"
                  disabled={!property.seller.phone}
                  onPress={handleCall}
                  style={({ pressed }) => [
                    styles.sellerActionBtn,
                    webPointer,
                    pressed && styles.pressed,
                    !property.seller.phone && styles.actionBtnDisabled,
                  ]}
                >
                  <Phone color="#0B1A17" size={16} />
                  <Text style={styles.sellerActionText}>Call</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="WhatsApp Message"
                  disabled={!property.seller.phone}
                  onPress={handleWhatsApp}
                  style={({ pressed }) => [
                    styles.whatsAppActionBtn,
                    webPointer,
                    pressed && styles.pressed,
                    !property.seller.phone && styles.actionBtnDisabled,
                  ]}
                >
                  <WhatsAppIcon size={18} color="#25D366" />
                  <Text style={styles.whatsAppActionText}>WhatsApp</Text>
                </Pressable>
              </View>

              {/* Book a visit Primary Button */}
              <Pressable
                onPress={() => setBookModalVisible(true)}
                style={({ pressed }) => [styles.bookVisitBtn, webPointer, pressed && styles.pressed]}
              >
                <Calendar color={colorTokens.onAccent} size={18} />
                <Text style={styles.bookVisitBtnText}>Book a visit</Text>
              </Pressable>
            </View>

            {/* AI Recommendation Box */}
            {property.aiRecommendation ? (
            <View style={styles.aiRecCard}>
              <View style={styles.aiRecHeader}>
                <Sparkles color="#04cf92" size={18} />
                <Text style={styles.aiRecTitle}>AI Recommendation</Text>
              </View>

              <Text style={styles.aiRecBody}>{property.aiRecommendation}</Text>
            </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <BookVisitModal
        onCall={handleCall}
        onClose={() => setBookModalVisible(false)}
        onRequestVisit={handleRequestVisit}
        propertyTitle={property.title}
        sellerName={property.seller.name}
        sellerPhone={property.seller.phone}
        visible={bookModalVisible}
      />

      <PropertyLightbox
        activeIndex={activeImageIndex}
        images={property.mediaImages}
        onClose={() => setLightboxVisible(false)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        onSelect={setActiveImageIndex}
        thumbScrollRef={lightboxThumbScrollRef}
        title={property.title}
        visible={lightboxVisible}
      />
    </AppChrome>
  );
}
