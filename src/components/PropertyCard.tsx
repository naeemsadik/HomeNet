import { Bath, BedDouble, Heart, LandPlot, MapPin, ShieldCheck, Sparkles } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle, View } from "react-native";
import type { Property } from "@/data/properties";
import { colors, fonts, webPointer } from "@/theme";
import { AppLink } from "./ui";

export function PropertyCard({
  property,
  saved,
  onSave,
  mode,
  imageHeight,
  list = false,
  feature = false,
  badgeText,
  style,
}: {
  property: Property;
  saved: boolean;
  onSave: () => void;
  mode?: "buy" | "rent";
  imageHeight?: number;
  list?: boolean;
  feature?: boolean;
  badgeText?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const isRent = mode === "rent" || property.forRent === true;
  const isNew = property.tag === "New" || property.id % 2 === 1;

  return (
    <View style={[styles.card, style]}>
      {/* Image Container */}
      <View style={[styles.imageWrap, imageHeight ? { height: imageHeight } : null]}>
        <Image source={{ uri: property.image }} style={styles.image} resizeMode="cover" />

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.badgeCluster}>
            <View style={styles.verifiedBadge}>
              <ShieldCheck color="#0F6D55" size={14} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
            {isNew ? (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            ) : null}
          </View>

          {/* Heart / Save Button */}
          <Pressable
            accessibilityLabel={saved ? "Remove from saved" : "Save property"}
            onPress={onSave}
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
      <View style={styles.body}>
        {/* Price & Investment Score */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {isRent ? property.monthlyPrice : property.price}
            </Text>
          </View>
          <View style={styles.scoreContainer}>
            <Sparkles color="#0F6D55" size={14} />
            <Text style={styles.scoreText}>{property.score}</Text>
          </View>
        </View>

        {/* Title */}
        <AppLink href={`/property/${property.id}`} style={styles.titleLink}>
          <Text numberOfLines={1} style={styles.titleText}>
            {property.title}
          </Text>
        </AppLink>

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin color="#5C6B66" size={14} />
          <Text numberOfLines={1} style={styles.locationText}>
            {property.location}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <BedDouble color="#5C6B66" size={16} />
            <Text style={styles.specText}>{property.beds}</Text>
          </View>
          <View style={styles.specItem}>
            <Bath color="#5C6B66" size={16} />
            <Text style={styles.specText}>{property.baths}</Text>
          </View>
          <View style={styles.specItem}>
            <LandPlot color="#5C6B66" size={16} />
            <Text style={styles.specText}>{property.area}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    padding: 0.8,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 209.4,
    backgroundColor: "#F4F6F5",
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
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
  specsRow: {
    marginTop: 6,
    paddingTop: 12.8,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
