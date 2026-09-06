import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  Hospital,
  Info,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Phone,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Train,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink } from "@/components/ui";
import { allProperties, propertyImages, searchPageListings } from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import Svg, { Path } from "react-native-svg";
import { usePropertyDetail, useSimilarProperties } from "../hooks/usePropertyDetail";

function WhatsAppIcon({ size = 18, color = "#25D366" }: { size?: number; color?: string }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size} fill="none">
      <Path
        d="M20.52 3.48A11.93 11.93 0 0012.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 5.99L0 24l6.19-1.62a11.93 11.93 0 005.87 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.44z"
        fill={color}
      />
      <Path
        d="M17.5 14.37c-.28-.14-1.65-.81-1.91-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.09-.16.18-.32.21-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.23-.54-.46-.47-.63-.48-.16-.01-.35-.01-.54-.01-.19 0-.49.07-.75.35-.25.28-.97.95-.97 2.32s1 2.69 1.13 2.88c.14.19 1.95 2.97 4.72 4.17.66.28 1.18.45 1.58.58.66.21 1.26.18 1.74.11.53-.08 1.65-.67 1.88-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.19-.53-.33z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

const unsupportedDetailContent = {
  aiValuation: {
    estimatedValue: "47,000",
    differencePercent: "4%",
    comparisonText: "Estimated fair value 47,000 ৳. This listing is priced below AI estimate by 4%.",
    trend: "+4.5% area appreciation YoY",
  },
  aiRecommendation:
    "Buyers who viewed this also considered penthouses in Gulshan 1 and 2 bedroom apartments in Dhanmondi. Based on your budget, this property offers 12% better value per sqft than similar verified listings.",
  nearbyPlaces: [
    { name: "Darun Ihsan University", distance: "0.6 km", icon: GraduationCap },
    { name: "Eden Hospital", distance: "1.2 km", icon: Hospital },
    { name: "Metro Station", distance: "0.9 km", icon: Train },
  ],
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
  const [saved, setSaved] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);

  const property = useMemo(() => {
    if (!apiDetail) return null;

    const rawAmenities = (apiDetail.amenities as Record<string, any>) || {};
    const amenityList = Object.keys(rawAmenities).filter(
      (key) => !["bedrooms", "bathrooms", "floor", "facing"].includes(key) && rawAmenities[key]
    );

    const images = apiDetail.media
      ? apiDetail.media.filter((m) => m.media_type === "image").map((m) => m.url)
      : [];

    const identity = apiDetail.user?.auth_identities?.[0];
    const location = [apiDetail.area?.name, (apiDetail.area as any)?.city].filter(Boolean).join(", ");

    return {
      id: apiDetail.id,
      title: apiDetail.title,
      location: location || apiDetail.address || "Location unavailable",
      address: apiDetail.address || "Address unavailable",
      type: apiDetail.subtype || (apiDetail.type ? apiDetail.type.charAt(0).toUpperCase() + apiDetail.type.slice(1) : "Property"),
      listingType: apiDetail.listing_type === "rent" ? "For Rent" : "For Sale",
      price: typeof apiDetail.price === "number" ? apiDetail.price.toLocaleString("en-BD") : String(apiDetail.price || 0),
      priceCurrency: apiDetail.price_currency === "BDT" ? "৳" : (apiDetail.price_currency || "৳"),
      pricePeriod: apiDetail.listing_type === "rent" ? "/mo" : "",
      isVerified: Boolean(apiDetail.is_verified),
      isBoosted: false,
      score: (apiDetail as any).score ?? 85,
      bedrooms: Number((apiDetail as any).bedrooms ?? rawAmenities.bedrooms ?? 0),
      bathrooms: Number((apiDetail as any).bathrooms ?? rawAmenities.bathrooms ?? 0),
      areaSqft: apiDetail.area_size ? apiDetail.area_size.toLocaleString("en-BD") : null,
      aiValuation: unsupportedDetailContent.aiValuation,
      description: apiDetail.description || "No description provided.",
      amenities: amenityList,
      mediaImages: images,
      seller: {
        name: apiDetail.user?.full_name || "Verified Seller",
        agency: "HomeNet Verified Partner",
        rating: "4.8",
        reviewsCount: 12,
        repliesTime: "Replies ~1 hr",
        isVerified: Boolean(apiDetail.is_verified),
        avatarUrl: apiDetail.user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        phone: identity?.phone || "+8801700000000",
        email: identity?.email || "",
      },
      aiRecommendation: unsupportedDetailContent.aiRecommendation,
      nearbyPlaces: unsupportedDetailContent.nearbyPlaces,
      similarProperties: similarProperties.map((sim) => {
        const simAmenities = (sim.amenities as Record<string, any>) || {};
        return {
          id: sim.id,
          title: sim.title,
          location: [sim.area?.name, (sim.area as any)?.city].filter(Boolean).join(", ") || sim.address || "Dhaka",
          price: `${sim.price_currency || "৳"} ${typeof sim.price === "number" ? sim.price.toLocaleString() : sim.price}`,
          specs: `${Number(simAmenities.bedrooms ?? 0)} Beds · ${Number(simAmenities.bathrooms ?? 0)} Baths · ${sim.area_size?.toLocaleString() ?? "N/A"} ${sim.area_unit || "sqft"}`,
          imageUrl: sim.media?.find((m) => m.media_type === "image")?.url || sim.media?.[0]?.url,
          status: sim.status,
          views: (sim.view_count || 0).toLocaleString(),
          score: (sim as any).score ?? 85,
        };
      }),
    };
  }, [apiDetail, similarProperties]);

  const handleCall = () => {
    if (!property?.seller.phone) {
      Alert.alert("Phone unavailable", "The property owner has not shared a phone number.");
      return;
    }
    void Linking.openURL(`tel:${property.seller.phone}`);
  };

  const handleWhatsApp = () => {
    const rawPhone = property?.seller.phone || "+8801700000000";
    const cleanPhone = rawPhone.replace(/[^\d]/g, "");
    const message = `Hello ${property?.seller.name || "Seller"}, I'm interested in your property "${property?.title || "Property"}" (${property?.priceCurrency || "৳"} ${property?.price || ""}${property?.pricePeriod || ""}) on Homenet. Is this property currently available?`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    void Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(
        "WhatsApp",
        `Could not launch WhatsApp. You can message the seller directly at ${rawPhone}.`,
      );
    });
  };

  const handleShare = () => {
    if (!property) return;
    Alert.alert("Share Property", `Share link for "${property.title}" copied to clipboard.`);
  };

  if (isLoading && !property) {
    return (
      <AppChrome active="property">
        <View style={styles.requestState}>
          <ActivityIndicator color="#0F6D55" size="large" />
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
            <RotateCcw color="#FFFFFF" size={16} />
            <Text style={styles.retryText}>{error ? "Retry" : "Go Back"}</Text>
          </Pressable>
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome active="property">
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
              style={({ pressed }) => [styles.actionCircleBtn, webPointer, pressed && styles.pressed]}
            >
              <Share2 color="#0B1A17" size={18} />
            </Pressable>

            <Pressable
              onPress={() => setSaved((s) => !s)}
              style={({ pressed }) => [styles.actionCircleBtn, webPointer, pressed && styles.pressed]}
            >
              <Heart
                color={saved ? "#D4183D" : "#0B1A17"}
                fill={saved ? "#D4183D" : "transparent"}
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
              <View style={styles.mainImageWrap}>
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
                      <ShieldCheck color="#0F6D55" size={14} />
                      <Text style={styles.verifiedTagText}>Verified</Text>
                    </View>
                  ) : null}

                  <View style={styles.forRentTag}>
                    <Text style={styles.forRentTagText}>{property.listingType}</Text>
                  </View>
                </View>
              </View>

              {/* Thumbnails Row */}
              <View style={styles.thumbnailsRow}>
                {property.mediaImages.map((img, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setActiveImageIndex(idx)}
                    style={[
                      styles.thumbnailCard,
                      activeImageIndex === idx && styles.thumbnailCardActive,
                      webPointer,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbnailImg} />
                  </Pressable>
                ))}
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
                    <ShieldCheck color="#0F6D55" size={14} />
                    <Text style={styles.verifiedSmallText}>Verified</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.propertyTitle}>{property.title}</Text>

              <View style={styles.locationSubRow}>
                <MapPin color="#0F6D55" size={16} />
                <Text style={styles.locationSubText}>{property.location}</Text>
              </View>

              {/* Key Specs Bar */}
              <View style={styles.keySpecsRow}>
                <View style={styles.specItem}>
                  <BedDouble color="#0F6D55" size={18} />
                  <Text style={styles.specText}>{property.bedrooms} Beds</Text>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specItem}>
                  <Bath color="#0F6D55" size={18} />
                  <Text style={styles.specText}>{property.bathrooms} Baths</Text>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specItem}>
                  <Maximize2 color="#0F6D55" size={18} />
                  <Text style={styles.specText}>{property.areaSqft} sqft</Text>
                </View>
              </View>
            </View>

            {/* AI Property Valuation Box */}
            {property.aiValuation ? (
            <View style={styles.aiValuationCard}>
              <View style={styles.aiValuationHeader}>
                <Sparkles color="#0F6D55" size={20} />
                <Text style={styles.aiValuationTitle}>AI Property Valuation</Text>
              </View>

              <Text style={styles.aiValuationDesc}>
                Estimated fair value <Text style={styles.boldText}>৳ {property.aiValuation.estimatedValue} /mo</Text>.{" "}
                {property.aiValuation.comparisonText}
              </Text>

              <View style={styles.aiTrendBadge}>
                <TrendingUp color="#0F6D55" size={14} />
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
                    <Check color="#0F6D55" size={16} />
                    <Text style={styles.amenityCheckText}>{am}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Location & neighbourhood */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>Location & neighbourhood</Text>

              <View style={styles.mapCard}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80" }}
                  style={styles.mapImage}
                />
                <View style={styles.mapPinOverlay}>
                  <View style={styles.mapTooltip}>
                    <Text style={styles.mapTooltipText}>Dhanmondi, Dhaka 1205, Bangladesh</Text>
                  </View>
                  <View style={styles.mapPinCircle}>
                    <MapPin color="#FFFFFF" size={18} />
                  </View>
                </View>
              </View>

              {/* Nearby Points of Interest */}
              {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
              <View style={styles.nearbyGrid}>
                {property.nearbyPlaces.map((poi: any) => {
                  const PoiIcon = poi.icon;
                  return (
                    <View key={poi.name} style={styles.poiCard}>
                      <View style={styles.poiIconBg}>
                        <PoiIcon color="#2251D6" size={18} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={styles.poiName}>{poi.name}</Text>
                        <Text style={styles.poiDist}>{poi.distance}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              )}
            </View>

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
                <ActivityIndicator color="#0F6D55" size="small" />
              ) : similarError ? (
                <Pressable onPress={() => void refetchSimilar()} style={styles.similarRequestState}>
                  <RotateCcw color="#0F6D55" size={15} />
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
                                <Sparkles color="#0F6D55" size={12} />
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
                  <Text style={styles.sellerAgency}>{property.seller.agency}</Text>
                  <View style={styles.sellerRatingRow}>
                    <Star color="#F4823A" fill="#F4823A" size={14} />
                    <Text style={styles.ratingText}>
                      {property.seller.rating} ({property.seller.reviewsCount}) · {property.seller.repliesTime || "Replies ~1 hr"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Asking Price Callout */}
              <View style={styles.priceCalloutWrap}>
                <View style={styles.priceCalloutHeader}>
                  <Text style={styles.priceCalloutLabel}>Asking price</Text>
                  {property.score ? (
                    <View style={styles.scoreBadge}>
                      <Sparkles color="#0F6D55" size={14} />
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
                  onPress={handleCall}
                  style={({ pressed }) => [styles.sellerActionBtn, webPointer, pressed && styles.pressed]}
                >
                  <Phone color="#0B1A17" size={16} />
                  <Text style={styles.sellerActionText}>Call</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="WhatsApp Message"
                  onPress={handleWhatsApp}
                  style={({ pressed }) => [styles.whatsAppActionBtn, webPointer, pressed && styles.pressed]}
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
                <Calendar color="#FFFFFF" size={18} />
                <Text style={styles.bookVisitBtnText}>Book a visit</Text>
              </Pressable>
            </View>

            {/* AI Recommendation Box */}
            <View style={styles.aiRecCard}>
              <View style={styles.aiRecHeader}>
                <Sparkles color="#0F6D55" size={18} />
                <Text style={styles.aiRecTitle}>AI Recommendation</Text>
              </View>

              <Text style={styles.aiRecBody}>{property.aiRecommendation}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Visit Modal */}
      <Modal animationType="fade" onRequestClose={() => setBookModalVisible(false)} transparent visible={bookModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book a Property Visit</Text>
              <Pressable onPress={() => setBookModalVisible(false)} style={styles.closeBtn}>
                <X color="#0B1A17" size={20} />
              </Pressable>
            </View>

            <Text style={styles.modalBodyText}>
              Schedule an in-person viewing of <Text style={{ fontFamily: fonts.bold }}>{property.title}</Text> with agent {property.seller.name}.
            </Text>

            <Pressable
              onPress={() => {
                setBookModalVisible(false);
                Alert.alert("Visit Requested!", "The seller will contact you shortly to confirm the appointment.");
              }}
              style={styles.confirmVisitBtn}
            >
              <Text style={styles.confirmVisitText}>Confirm Visit Request</Text>
            </Pressable>

            <View style={styles.modalDivider}>
              <View style={styles.modalDividerLine} />
              <Text style={styles.modalDividerText}>or chat directly</Text>
              <View style={styles.modalDividerLine} />
            </View>

            <Pressable
              onPress={() => {
                setBookModalVisible(false);
                handleWhatsApp();
              }}
              style={[styles.modalWhatsAppBtn, webPointer]}
            >
              <WhatsAppIcon size={18} color="#FFFFFF" />
              <Text style={styles.modalWhatsAppBtnText}>Chat on WhatsApp with Agent</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  requestState: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
  },
  requestError: {
    color: "#4F625D",
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: "#0F6D55",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: { color: "#FFFFFF", fontFamily: fonts.semiBold, fontSize: 14 },
  scrollBody: {
    padding: 24,
    gap: 20,
  },
  scrollBodyPhone: {
    padding: 16,
    gap: 16,
  },
  topHeaderNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  actionHeaderBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainLayoutGrid: {
    flexDirection: "row",
    gap: 24,
  },
  mainLayoutGridTablet: {
    flexDirection: "column",
  },
  leftColumn: {
    flex: 1.8,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    gap: 20,
  },
  galleryContainer: {
    gap: 12,
  },
  mainImageWrap: {
    width: "100%",
    height: 380,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F4F6F5",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  mediaPlaceholder: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  mediaPlaceholderText: { color: "#6B7D78", fontFamily: fonts.regular, fontSize: 14 },
  similarThumbPlaceholder: { alignItems: "center", backgroundColor: "#E8EEEC", justifyContent: "center" },
  galleryBadgesRow: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  verifiedTagText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  forRentTag: {
    backgroundColor: "#E8EEFC",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  forRentTagText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#2251D6",
  },
  thumbnailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  thumbnailCard: {
    width: 100,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailCardActive: {
    borderColor: "#0F6D55",
  },
  thumbnailImg: {
    width: "100%",
    height: "100%",
  },
  overviewHeaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
    gap: 12,
    overflow: "hidden",
  },
  titleCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#E7F2EE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  verifiedSmallBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedSmallText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  propertyTitle: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.4,
  },
  locationSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationSubText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  keySpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 12,
    rowGap: 8,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  specText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  specDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(11,26,23,0.15)",
  },
  aiValuationCard: {
    backgroundColor: "#E7F2EE",
    borderRadius: 24,
    padding: 24,
    gap: 10,
  },
  aiValuationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiValuationTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#0F6D55",
  },
  aiValuationDesc: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    lineHeight: 20,
  },
  boldText: {
    fontFamily: fonts.bold,
  },
  aiTrendBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  aiTrendText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
    gap: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAllLink: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  descriptionParagraph: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    lineHeight: 22,
  },
  amenitiesCheckGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  amenityCheckItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "45%",
  },
  amenityCheckText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  mapCard: {
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapPinOverlay: {
    position: "absolute",
    top: "30%",
    left: "35%",
    alignItems: "center",
    gap: 6,
  },
  mapTooltip: {
    backgroundColor: "#0B1A17",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapTooltipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  mapPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyGrid: {
    flexDirection: "row",
    gap: 12,
  },
  poiCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E8EEFC",
    borderRadius: 16,
    padding: 12,
  },
  poiIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  poiName: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  poiDist: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  similarScroll: {
    width: "100%",
  },
  similarRow: {
    flexDirection: "row",
    gap: 16,
  },
  similarCard: {
    width: 220,
    backgroundColor: "#FAFBFB",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
  },
  similarThumb: {
    width: "100%",
    height: 130,
  },
  similarInfo: {
    padding: 12,
    gap: 4,
  },
  similarPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  similarPrice: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#0F6D55",
  },
  similarScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  similarScoreText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: "#0F6D55",
  },
  similarTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  similarLoc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  similarSpecs: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 4,
  },
  sellerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 24,
    gap: 16,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sellerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  similarRequestState: { alignItems: "center", flexDirection: "row", gap: 8, paddingVertical: 14 },
  sellerAvatarPlaceholder: {
    alignItems: "center",
    backgroundColor: "#E8EEEC",
    justifyContent: "center",
  },
  sellerName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  sellerAgency: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  sellerRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  priceCalloutWrap: {
    backgroundColor: "#F4F6F5",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  priceCalloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceCalloutLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#0F6D55",
  },
  priceCalloutValue: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  priceCalloutPeriod: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  sellerActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  sellerActionBtn: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.12)",
    backgroundColor: "#FFFFFF",
  },
  sellerActionText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  whatsAppActionBtn: {
    flex: 1.25,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "#F0FDF4",
    borderWidth: 1.2,
    borderColor: "#25D366",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  whatsAppActionText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#166534",
  },
  bookVisitBtn: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F4823A",
    borderRadius: 999,
  },
  bookVisitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  aiRecCard: {
    backgroundColor: "#E7F2EE",
    borderRadius: 24,
    padding: 24,
    gap: 10,
  },
  aiRecHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiRecTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#0F6D55",
  },
  aiRecBody: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBodyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    lineHeight: 20,
  },
  confirmVisitBtn: {
    height: 44,
    backgroundColor: "#0F6D55",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  confirmVisitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  modalDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(11,26,23,0.08)",
  },
  modalDividerText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  modalWhatsAppBtn: {
    height: 44,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#25D366",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalWhatsAppBtnText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
});
