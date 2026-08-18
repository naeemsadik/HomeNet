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
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import { usePropertyDetail } from "../hooks/usePropertyDetail";

// Default mockup fallback property matching Figma Node 53:2
const mockPropertyData = {
  id: "prop-3",
  title: "Modern 2 Bedroom for Rent",
  location: "Dhanmondi, Dhaka",
  address: "House 12, Road 7A, Dhanmondi, Dhaka 1209",
  type: "Apartment",
  listingType: "For Rent",
  price: "45,000",
  priceCurrency: "৳",
  pricePeriod: "/mo",
  isVerified: true,
  isBoosted: true,
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: "1,250",
  aiValuation: {
    estimatedValue: "47,000",
    differencePercent: "4%",
    comparisonText: "This listing is priced below AI estimate by 4%.",
    trend: "+4.2% vs 30-day average",
  },
  description:
    "Freshly renovated 2 bedroom close to Rabindra Sarobar. Ideal for a small family or professionals. Ready to move in with modern fixtures and spacious balcony.",
  amenities: ["Lift", "Parking", "Generator", "CCTV", "Gas Connection"],
  mediaImages: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  ],
  seller: {
    name: "Sun Welly",
    agency: "Metro Properties",
    rating: "4.7",
    reviewsCount: 16,
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    phone: "+8801700000000",
    email: "sunwelly@metroproperties.bd",
  },
  aiRecommendation:
    "Buyers who viewed this also considered penthouses in Gulshan 1. Based on your budget, this property offers 12% better value per sqft than similar verified listings.",
  nearbyPlaces: [
    { name: "Daffodil University", distance: "0.4 km", icon: GraduationCap },
    { name: "Anwer Khan Hospital", distance: "1.2 km", icon: Hospital },
    { name: "Metro Station", distance: "0.8 km", icon: Train },
  ],
  similarProperties: [
    {
      id: "prop-1",
      title: "Skyview Residence",
      location: "Gulshan 2, Dhaka",
      price: "৳ 1.85 Cr",
      specs: "3 Beds · 3 Baths · 2,150 sqft",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
      status: "active",
      views: "4,820",
    },
    {
      id: "prop-2",
      title: "Cozy 1 Bedroom Apartment",
      location: "Uttara Sector 7, Dhaka",
      price: "৳ 22,000 /mo",
      specs: "1 Bed · 1 Bath · 720 sqft",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
      status: "active",
      views: "3,110",
    },
    {
      id: "prop-3-s",
      title: "Family Apartment with Terrace",
      location: "Mirpur DOHS, Dhaka",
      price: "৳ 1.25 Cr",
      specs: "3 Beds · 2 Baths · 1,550 sqft",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
      status: "active",
      views: "1,980",
    },
  ],
};

export function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPhone, isTablet } = useResponsive();
  const { data: apiDetail } = usePropertyDetail(id ?? "");

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);

  // Merge real detail data with default mock values for Figma accuracy
  const property = useMemo(() => {
    if (!apiDetail) return mockPropertyData;

    return {
      id: apiDetail.id,
      title: apiDetail.title,
      location: apiDetail.area?.name ? `${apiDetail.area.name}, Dhaka` : "Dhanmondi, Dhaka",
      address: apiDetail.address || mockPropertyData.address,
      type: apiDetail.type || "Apartment",
      listingType: apiDetail.listing_type === "rent" ? "For Rent" : "For Sale",
      price: apiDetail.price.toLocaleString(),
      priceCurrency: apiDetail.price_currency || "৳",
      pricePeriod: apiDetail.listing_type === "rent" ? "/mo" : "",
      isVerified: apiDetail.is_verified ?? true,
      isBoosted: true,
      bedrooms: (apiDetail as any).bedrooms ?? 2,
      bathrooms: (apiDetail as any).bathrooms ?? 2,
      areaSqft: (apiDetail as any).sqft ? (apiDetail as any).sqft.toLocaleString() : "1,250",
      aiValuation: mockPropertyData.aiValuation,
      description: apiDetail.description || mockPropertyData.description,
      amenities: apiDetail.amenities
        ? Object.keys(apiDetail.amenities).filter((k) => apiDetail.amenities?.[k])
        : mockPropertyData.amenities,
      mediaImages:
        apiDetail.media?.filter((m) => m.media_type === "image").map((m) => m.url) ||
        mockPropertyData.mediaImages,
      seller: {
        name: apiDetail.user?.full_name || mockPropertyData.seller.name,
        agency: "Metro Properties",
        rating: "4.7",
        reviewsCount: 16,
        isVerified: true,
        avatarUrl: apiDetail.user?.avatar_url || mockPropertyData.seller.avatarUrl,
        phone: "+8801700000000",
        email: "contact@homenet.bd",
      },
      aiRecommendation: mockPropertyData.aiRecommendation,
      nearbyPlaces: mockPropertyData.nearbyPlaces,
      similarProperties: mockPropertyData.similarProperties,
    };
  }, [apiDetail]);

  const handleCall = () => {
    void Linking.openURL(`tel:${property.seller.phone}`);
  };

  const handleShare = () => {
    Alert.alert("Share Property", `Share link for "${property.title}" copied to clipboard.`);
  };

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
                <Image
                  source={{ uri: property.mediaImages[activeImageIndex] || property.mediaImages[0] }}
                  style={styles.mainImage}
                />

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
              <View style={styles.nearbyGrid}>
                {property.nearbyPlaces.map((poi) => {
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
            </View>

            {/* Similar properties Carousel */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.sectionHeading}>Similar properties</Text>
                <AppLink href="/buy">
                  <Text style={styles.seeAllLink}>See all</Text>
                </AppLink>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
                <View style={styles.similarRow}>
                  {property.similarProperties.map((sim) => (
                    <AppLink href={`/property/${sim.id}`} key={sim.id} style={styles.similarCard}>
                      <Image source={{ uri: sim.imageUrl }} style={styles.similarThumb} />
                      <View style={styles.similarInfo}>
                        <Text style={styles.similarPrice}>{sim.price}</Text>
                        <Text numberOfLines={1} style={styles.similarTitle}>{sim.title}</Text>
                        <Text style={styles.similarLoc}>{sim.location}</Text>
                        <Text style={styles.similarSpecs}>{sim.specs}</Text>
                      </View>
                    </AppLink>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Right Sidebar Column (Sticky Seller Card & AI Rec) */}
          <View style={styles.rightColumn}>
            {/* Seller Contact Card */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerRow}>
                <Image source={{ uri: property.seller.avatarUrl }} style={styles.sellerAvatar} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.sellerName}>{property.seller.name}</Text>
                  <Text style={styles.sellerAgency}>{property.seller.agency}</Text>
                  <View style={styles.sellerRatingRow}>
                    <Star color="#F4823A" fill="#F4823A" size={14} />
                    <Text style={styles.ratingText}>
                      {property.seller.rating} ({property.seller.reviewsCount}) · Verified
                    </Text>
                  </View>
                </View>
              </View>

              {/* Asking Price Callout */}
              <View style={styles.priceCalloutWrap}>
                <Text style={styles.priceCalloutLabel}>Asking price</Text>
                <Text style={styles.priceCalloutValue}>
                  {property.priceCurrency} {property.price}{" "}
                  <Text style={styles.priceCalloutPeriod}>{property.pricePeriod}</Text>
                </Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.sellerActionsRow}>
                <Pressable
                  onPress={handleCall}
                  style={({ pressed }) => [styles.sellerActionBtn, webPointer, pressed && styles.pressed]}
                >
                  <Phone color="#0B1A17" size={16} />
                  <Text style={styles.sellerActionText}>Call</Text>
                </Pressable>

                <Pressable
                  onPress={() => Alert.alert("Chat", `Starting chat with ${property.seller.name}...`)}
                  style={({ pressed }) => [styles.sellerActionBtn, webPointer, pressed && styles.pressed]}
                >
                  <MessageSquare color="#0B1A17" size={16} />
                  <Text style={styles.sellerActionText}>Chat</Text>
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
          </View>
        </View>
      </Modal>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
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
  similarPrice: {
    fontSize: 15,
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
  priceCalloutLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
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
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
    backgroundColor: "#FFFFFF",
  },
  sellerActionText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
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
});
