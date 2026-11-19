import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { confirmAction, notify } from "@/lib/alert";
import { router, useLocalSearchParams } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { PropertyForm } from "../components/PropertyForm";
import { useDeleteMedia, useUpdateProperty, useUploadMedia } from "../hooks/usePropertyMutations";
import type { UpsertPropertyDto } from "@/types/api";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts } from "@/theme";
import { useQuery } from "@tanstack/react-query";
import { fetchPropertyForViewer } from "../hooks/usePropertyDetail";
import { toApiError } from "@/services/apiClient";
import { isListingPhoto } from "@/features/property/utils/listingMedia";
import { removedPhotos } from "@/features/property/utils/removedPhotos";
import { NotFoundScreen } from "@/screens/NotFoundScreen";
import { useAuthStore } from "@/stores/authStore";

export function PropertyEditScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const updateProperty = useUpdateProperty();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  // One save is several requests; the form stays locked from the first to the last.
  const [saving, setSaving] = useState(false);

  const { data: propertyData, error: propertyError, isLoading } = useQuery({
    queryKey: ["property", id],
    // The public route hides a pending listing, which is the one an owner edits most.
    queryFn: () => fetchPropertyForViewer(id!),
    enabled: !!id,
  });

  const isOwner = Boolean(user && propertyData && user.id === propertyData.user_id);
  // A save sends a live listing, or one approved and held for its owner, back to review.
  const reviewNotice = propertyData?.status === "active" ? "offline" : propertyData?.ready_to_publish ? "held" : null;

  const handleSubmit = async (dto: UpsertPropertyDto, images: { uri: string; file?: Blob | File }[]) => {
    if (!id || !isOwner || saving) return;
    if (reviewNotice) {
      const confirmed = await confirmAction(
        t("property.editConfirmTitle"),
        t("property.editConfirmMessage", { title: propertyData?.title?.trim() || t("property.thisListing") }),
        { confirmLabel: t("property.editConfirmAction"), cancelLabel: t("common.cancel") },
      );
      if (!confirmed) return;
    }
    setSaving(true);
    try {
      const result = await updateProperty.mutateAsync({ id, dto });
      const propertyId = result.data?.id ?? id;

      for (const img of images) {
        if (img.file && !img.uri.startsWith("http")) {
          await uploadMedia.mutateAsync({ propertyId, file: img.file });
        }
      }

      // New photos go up before removed ones come down, so a listing that must keep a photo
      // never passes through having none (the API refuses to remove the last one).
      const photos = (propertyData?.media ?? []).filter(isListingPhoto);
      for (const photo of removedPhotos(photos, images)) {
        await deleteMedia.mutateAsync({ mediaId: photo.id, propertyId });
      }

      // The API decides whether the save changed anything, so ask it what happened. A listing
      // sent for review is no longer public, and the save already worked, so a failed read is
      // not an error.
      const saved = reviewNotice ? await fetchPropertyForViewer(propertyId).catch(() => null) : null;
      const inReview = saved?.status === "pending";
      notify(t("common.success"), t(inReview ? "property.editInReview" : "property.updateSuccess"), { onConfirm: () => router.back() });
    } catch (err: any) {
      notify(t("common.error"), toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !hydrated) {
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
            {propertyError ? toApiError(propertyError).message : t("property.notFound")}
          </Text>
        </View>
      </AppChrome>
    );
  }

  // Least-privilege enforcement: only the authentic owner can edit a listing.
  if (!isOwner) {
    return <NotFoundScreen />;
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
    go_live_on_approval: propertyData.go_live_on_approval ?? true,
  };

  // The edit form shows every photo the listing has (see listingMedia.ts).
  const initialImages = (propertyData.media ?? [])
    .filter(isListingPhoto)
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
          reviewNotice={reviewNotice}
          loading={saving}
          error={updateProperty.error ? toApiError(updateProperty.error).message : null}
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
