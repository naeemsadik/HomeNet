import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { PropertyForm } from "../components/PropertyForm";
import { useCreateProperty, useUploadMedia } from "../hooks/usePropertyMutations";
import type { CreatePropertyDto } from "@/types/api";
import { useResponsive } from "@/hooks/useResponsive";

export function PropertyCreateScreen() {
  const { isPhone } = useResponsive();
  const createProperty = useCreateProperty();
  const uploadMedia = useUploadMedia();

  const handleSubmit = async (dto: CreatePropertyDto, images: Array<{ uri: string; file?: Blob | File }>) => {
    try {
      const result = await createProperty.mutateAsync(dto);
      const propertyId = result.data?.id;

      if (propertyId && images.length > 0) {
        for (const img of images) {
          if (img.file) {
            await uploadMedia.mutateAsync({ propertyId, file: img.file });
          }
        }
      }

      Alert.alert("Success", "Property created successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to create property");
    }
  };

  return (
    <AppChrome active="sell">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <PropertyForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          loading={createProperty.isPending || uploadMedia.isPending}
          error={createProperty.error?.message || null}
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
});
