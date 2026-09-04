import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import type { Property } from "../types/property";
import {
  StatusBadge,
  PriceBadge,
  VerifiedBadge,
  feedColors,
} from "./PropertyBadge";
import { PropertyImageCarousel } from "./PropertyImageCarousel";
import { PropertyDetailsRow } from "./PropertyDetailsRow";

interface PropertyCardProps {
  property: Property;
  onPress?: (property: Property) => void;
}

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  const areaName = property.area?.name || property.address || "Dhaka";

  const handlePress = () => {
    if (onPress) {
      onPress(property);
    } else if (property.id) {
      router.push(`/property/${property.id}` as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}`}
    >
      {/* Top Image Container with Badges */}
      <View style={styles.imageContainer}>
        <PropertyImageCarousel media={property.media} />

        {/* Overlay Badges */}
        <StatusBadge listingType={property.listing_type} />
        <VerifiedBadge isVerified={property.is_verified || property.verification?.status === "verified"} />
        <PriceBadge price={property.price} currency={property.price_currency || "BDT"} listingType={property.listing_type} />
      </View>

      {/* Card Info Section */}
      <View style={styles.contentContainer}>
        {/* Title: 16px semibold, max 2 lines with ellipsis */}
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {property.title}
        </Text>

        {/* Icon & Details Row */}
        <PropertyDetailsRow
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms}
          sqft={property.sqft || property.area_size || undefined}
          locationName={areaName}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: feedColors.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: feedColors.border,
    overflow: "hidden",

    // Elevation & Drop Shadows
    ...Platform.select({
      ios: {
        shadowColor: feedColors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
      },
    }),
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  contentContainer: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: feedColors.text,
    lineHeight: 22,
  },
});
