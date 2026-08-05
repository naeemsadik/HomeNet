import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { colorTokens, fontTokens, webPointer } from "@/theme";
import { useSimilarProperties } from "../hooks/usePropertyDetail";
import type { PropertyDetail } from "../hooks/usePropertyDetail";

interface SimilarPropertiesProps {
  type: string;
  areaId: string;
  excludeId: string;
}

function formatPrice(price: number, currency: string): string {
  if (price >= 10_000_000) {
    return `${currency} ${(price / 10_000_000).toFixed(1)} Cr`;
  }
  if (price >= 100_000) {
    return `${currency} ${(price / 100_000).toFixed(0)} Lac`;
  }
  return `${currency} ${price.toLocaleString()}`;
}

function SimilarCard({ property }: { property: PropertyDetail }) {
  const coverImage =
    property.media?.find((m) => m.media_type === "image")?.url ?? null;

  return (
    <Pressable
      onPress={() => router.push(`/property/${property.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`View ${property.title}`}
    >
      {coverImage ? (
        <Image source={{ uri: coverImage }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.info}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(property.price, property.price_currency || "BDT")}
          {property.listing_type === "rent" ? "/mo" : ""}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>
        {property.area ? (
          <View style={styles.locationRow}>
            <MapPin color={colorTokens.textMuted} size={12} />
            <Text style={styles.location} numberOfLines={1}>
              {property.area.name}
              {property.area.city ? `, ${property.area.city}` : ""}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function SimilarProperties({
  type,
  areaId,
  excludeId,
}: SimilarPropertiesProps) {
  const { data: similar, isLoading } = useSimilarProperties(
    type,
    areaId,
    excludeId,
  );

  if (isLoading || !similar || similar.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Similar Properties</Text>
      <FlatList
        data={similar}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <SimilarCard property={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  heading: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  listContent: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    width: 200,
    borderRadius: 14,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: colorTokens.backgroundAlt,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colorTokens.backgroundAlt,
  },
  info: {
    padding: 12,
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },
  title: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
    flex: 1,
  },
});
