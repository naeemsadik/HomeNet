import React from "react";
import { View, StyleSheet, Alert, ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { PropertyForm } from "../components/PropertyForm";
import { useUpdateProperty, useUploadMedia } from "../hooks/usePropertyMutations";
import type { UpsertPropertyDto } from "@/types/api";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts } from "@/theme";
import { useQuery } from "@tanstack/react-query";
import { getPropertyById } from "@/services/propertyApi";

export function PropertyEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPhone } = useResponsive();
  const updateProperty = useUpdateProperty();
  const uploadMedia = useUploadMedia();

  const { data: propertyData, error: propertyError, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await getPropertyById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (dto: UpsertPropertyDto, images: Array<{ uri: string; file?: Blob | File }>) => {
    if (!id) return;
    try {
      const result = await updateProperty.mutateAsync({ id, dto });
      const propertyId = result.data?.id ?? id;

      for (const img of images) {
        if (img.file && !img.uri.startsWith("http")) {
          await uploadMedia.mutateAsync({ propertyId, file: img.file });
        }
      }

      Alert.alert("Success", "Property updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update property");
    }
  };

  if (isLoading) {
    return (
      <AppChrome active="sell">
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.primary} size="large" />
        </View>
      </AppChrome>
    );
  }

  if (propertyError || !propertyData) {
    return (
      <AppChrome active="sell">
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {propertyError instanceof Error ? propertyError.message : "Property not found."}
          </Text>
        </View>
      </AppChrome>
    );
  }

  const initialData: Partial<UpsertPropertyDto> = {
    title: propertyData.title,
    description: propertyData.description ?? undefined,
    type: propertyData.type,
    listing_type: propertyData.listing_type,
    price: propertyData.price,
    area_id: propertyData.area_id,
    address: propertyData.address ?? undefined,
    area_size: propertyData.area_size ?? undefined,
    area_unit: propertyData.area_unit ?? undefined,
    price_currency: propertyData.price_currency,
    location_lat: propertyData.location_lat ?? undefined,
    location_lng: propertyData.location_lng ?? undefined,
    amenities: propertyData.amenities ?? undefined,
    subtype: propertyData.subtype ?? undefined,
    virtual_tour_url: propertyData.virtual_tour_url ?? undefined,
  };

  const initialImages = (propertyData.media ?? [])
    .filter((m) => m.media_type === "image")
    .map((m) => ({ uri: m.url }));

  return (
    <AppChrome active="sell">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <PropertyForm
          mode="edit"
          initialData={initialData}
          initialArea={propertyData.area ?? null}
          initialImages={initialImages}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          loading={updateProperty.isPending || uploadMedia.isPending}
          error={updateProperty.error?.message || null}
        />
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4EBE7",
  },
  containerPhone: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
  },
});
