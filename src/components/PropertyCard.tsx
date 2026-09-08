import { Bath, BedDouble, Heart, LandPlot, MapPin, ShieldCheck, Sparkles } from "lucide-react-native";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle, View, Platform } from "react-native";
import type { Property } from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";

type PropertyCardData = Omit<Property, "id"> & { id: string | number };

export interface PropertyCardModel {
  id: string | number;
  title: string;
  location: string;
  price: string;
  monthlyPrice?: string;
  image: string;
  tag?: string;
  beds?: number | null;
  baths?: number | null;
  area?: string | null;
  type?: string;
  score?: number;
  forRent?: boolean;
  isVerified?: boolean;
}

export function formatApiPropertyToCardModel(p: any): PropertyCardModel {
  const isRent = p.listing_type === "rent" || Boolean(p.forRent);
  const currency = p.price_currency === "BDT" ? "৳" : (p.price_currency || "৳");
  const formattedPrice = typeof p.price === "number"
    ? `${currency} ${p.price.toLocaleString("en-BD")}`
    : String(p.price || "");
  const monthlyPrice = isRent && !formattedPrice.endsWith("/mo") ? `${formattedPrice}/mo` : formattedPrice;

  // Media
  const image =
    p.media?.find((m: any) => m.media_type === "image")?.url ||
    p.media?.[0]?.url ||
    p.image ||
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85";

  // Location
  const location = p.area?.name
    ? `${p.area.name}, ${p.area.city || "Dhaka"}`
    : p.address || p.location || "Dhaka";

  // Specs
  const rawAmenities = (p.amenities as any) || {};
  const beds = p.bedrooms ?? rawAmenities.bedrooms ?? (p.beds !== undefined ? p.beds : null);
  const baths = p.bathrooms ?? rawAmenities.bathrooms ?? (p.baths !== undefined ? p.baths : null);
  const areaSize = p.area_size || p.sqft;
  const area = areaSize ? `${areaSize} ${p.area_unit || "sqft"}` : (p.area || "");

  return {
    id: p.id,
    title: p.title || "Property",
    location,
    price: formattedPrice,
    monthlyPrice,
    image,
    tag: p.is_verified ? "Verified" : p.tag || "New",
    beds,
    baths,
    area,
    type: p.type || "Apartment",
    score: p.score ?? Math.min(99, Math.max(82, Math.round(85 + ((p.view_count || 0) % 14)))),
    forRent: isRent,
    isVerified: Boolean(p.is_verified ?? (p.tag === "Verified")),
  };
}

export function PropertyCard({
  property: rawProp,
  saved,
  onSave,
  mode,
  imageHeight,
  list = false,
  feature = false,
  badgeText,
  style,
  onPress,
}: {
  property: PropertyCardModel | any;
  saved: boolean;
  onSave: () => void;
  mode?: "buy" | "rent";
  imageHeight?: number;
  list?: boolean;
  feature?: boolean;
  badgeText?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const { isPhone } = useResponsive();
  const property = ("media" in rawProp || "area_size" in rawProp || "listing_type" in rawProp || !rawProp.monthlyPrice)
    ? formatApiPropertyToCardModel(rawProp)
    : rawProp;

  const isRent = mode === "rent" || property.forRent === true;
  const isNew = property.tag === "New";
  const isVerified = Boolean(property.isVerified ?? (property.tag === "Verified"));
  const score = property.score;
  const isHighTierScore = score !== undefined && score >= 85;

  // Split rent price if contains /mo
  const rawPrice = isRent ? (property.monthlyPrice || property.price) : property.price;
  const priceParts = rawPrice ? rawPrice.split("/mo") : [rawPrice];
  const mainPrice = priceParts[0]?.trim();
  const hasMo = isRent || priceParts.length > 1;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (property.id) {
      router.push(`/property/${property.id}` as any);
    }
  };

  const defaultHeight = isPhone ? 180 : 210;
  const finalImageHeight = imageHeight ?? defaultHeight;

  return (
    <Pressable
      accessibilityLabel={`Property ${property.title}`}
      accessibilityRole="button"
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        isPhone && styles.cardPhone,
        webPointer,
        style,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Image Container */}
      <View style={[styles.imageWrap, { height: finalImageHeight }]}>
        {property.image ? (
          <Image source={{ uri: property.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <LandPlot color="#6B7D78" size={36} />
            <Text style={styles.imagePlaceholderText}>No media</Text>
          </View>
        )}

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.badgeCluster}>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck color="#0F6D55" size={14} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
            {isNew ? (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            ) : null}
          </View>

          {/* Heart / Save Button */}
          <Pressable
            accessibilityLabel={saved ? "Remove from saved" : "Save property"}
            onPress={(e) => {
              e?.stopPropagation?.();
              onSave();
            }}
            style={[styles.saveButton, webPointer]}
          >
            <Heart
              color={saved ? "#F4823A" : "#0B1A17"}
              fill={saved ? "#F4823A" : "transparent"}
              size={18}
            />
          </Pressable>
        </View>

        {/* Bottom Tag on Image (For Sale / For Rent) */}
        <View style={styles.intentTagWrap}>
          <View style={styles.intentTag}>
            <Text style={styles.intentTagText}>
              {isRent ? "For Rent" : "For Sale"}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Body */}
      <View style={[styles.body, isPhone && styles.bodyPhone]}>
        {/* Price & Investment Score */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, isPhone && styles.priceTextPhone]}>{mainPrice}</Text>
            {hasMo ? <Text style={styles.moText}> /mo</Text> : null}
          </View>
          {score !== undefined ? (
            <View style={styles.scoreContainer}>
              <Sparkles color={isHighTierScore ? "#0F6D55" : "#2251D6"} size={14} />
              <Text
                style={[
                  styles.scoreText,
                  { color: isHighTierScore ? "#0F6D55" : "#2251D6" },
                ]}
              >
                {score}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.titleLink}>
          <Text numberOfLines={1} style={[styles.titleText, isPhone && styles.titleTextPhone]}>
            {property.title}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin color="#5C6B66" size={14} />
          <Text numberOfLines={1} style={[styles.locationText, isPhone && styles.locationTextPhone]}>
            {property.location}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={[styles.specsRow, isPhone && styles.specsRowPhone]}>
          {property.beds !== undefined && property.beds > 0 ? (
            <View style={styles.specItem}>
              <BedDouble color="#5C6B66" size={16} />
              <Text style={styles.specText}>{property.beds}</Text>
            </View>
          ) : null}
          {property.baths !== undefined && property.baths > 0 ? (
            <View style={styles.specItem}>
              <Bath color="#5C6B66" size={16} />
              <Text style={styles.specText}>{property.baths}</Text>
            </View>
          ) : null}
          {property.area ? (
            <View style={styles.specItem}>
              <LandPlot color="#5C6B66" size={16} />
              <Text style={styles.specText}>{property.area}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
  },
  cardPhone: {
    borderRadius: 16,
  },
  cardPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    backgroundColor: "#F4F6F5",
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: { alignItems: "center", flex: 1, gap: 6, justifyContent: "center" },
  imagePlaceholderText: { color: "#6B7D78", fontFamily: fonts.regular, fontSize: 12 },
  topBadgesRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  newBadge: {
    backgroundColor: "#FDEEE2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newBadgeText: {
    color: "#F4823A",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  intentTagWrap: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  intentTag: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  intentTagText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    padding: 16,
    gap: 6,
  },
  bodyPhone: {
    padding: 12,
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  priceTextPhone: {
    fontSize: 18,
    lineHeight: 24,
  },
  moText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  titleLink: {
    marginTop: 2,
  },
  titleText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  titleTextPhone: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  locationTextPhone: {
    fontSize: 13,
    lineHeight: 18,
  },
  specsRow: {
    marginTop: 6,
    paddingTop: 12.8,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    rowGap: 6,
  },
  specsRowPhone: {
    marginTop: 4,
    paddingTop: 8,
    gap: 10,
    rowGap: 4,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  specText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
