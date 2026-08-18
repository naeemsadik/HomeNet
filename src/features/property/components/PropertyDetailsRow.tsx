import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bed, Bath, Maximize, MapPin } from "lucide-react-native";
import { feedColors } from "./PropertyBadge";

interface PropertyDetailsRowProps {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  locationName?: string;
}

export function PropertyDetailsRow({
  bedrooms,
  bathrooms,
  sqft,
  locationName,
}: PropertyDetailsRowProps) {
  return (
    <View style={styles.container}>
      {bedrooms !== undefined && bedrooms > 0 ? (
        <View style={styles.detailItem}>
          <Bed color={feedColors.textMuted} size={16} />
          <Text style={styles.detailValue}>{bedrooms} Beds</Text>
        </View>
      ) : null}

      {bathrooms !== undefined && bathrooms > 0 ? (
        <View style={styles.detailItem}>
          <Bath color={feedColors.textMuted} size={16} />
          <Text style={styles.detailValue}>{bathrooms} Baths</Text>
        </View>
      ) : null}

      {sqft !== undefined && sqft > 0 ? (
        <View style={styles.detailItem}>
          <Maximize color={feedColors.textMuted} size={16} />
          <Text style={styles.detailValue}>{sqft.toLocaleString()} sqft</Text>
        </View>
      ) : null}

      {locationName ? (
        <View style={[styles.detailItem, styles.locationItem]}>
          <MapPin color={feedColors.textMuted} size={16} />
          <Text style={styles.detailValue} numberOfLines={1}>
            {locationName}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  locationItem: {
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 14,
    color: feedColors.text,
    fontWeight: "500",
  },
});
