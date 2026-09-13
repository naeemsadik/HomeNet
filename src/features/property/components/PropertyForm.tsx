import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Send, ArrowRight, ArrowLeft, Check, MapPin } from "lucide-react-native";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colorTokens, fonts, webPointer } from "@/theme";
import { FormFloatingInput } from "@/components/FormFloatingInput";
import { FormSelectField } from "@/components/FormSelectField";
import { ErrorBanner, AuthButton } from "@/components/AuthFormFields";
import { AreaPicker } from "@/components/AreaPicker";
import { ImageUploader } from "./ImageUploader";
import {
  propertyFormSchema,
  PROPERTY_STEP_FIELDS,
  type PropertyFormData,
} from "@/lib/schemas/property";
import type { Area, UpsertPropertyDto } from "@/types/api";

interface PropertyFormProps {
  mode: "create" | "edit";
  initialData?: Partial<UpsertPropertyDto>;
  initialArea?: Area | null;
  initialImages?: Array<{ uri: string; file?: Blob | File }>;
  onSubmit: (data: UpsertPropertyDto, images: Array<{ uri: string; file?: Blob | File }>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

const STEPS = ["Details", "Location", "Features", "Images"] as const;

export function PropertyForm({
  mode,
  initialData,
  initialArea = null,
  initialImages = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}: PropertyFormProps) {
  const [step, setStep] = useState(0);
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const [area, setArea] = useState<Area | null>(initialArea);
  const [images, setImages] = useState<Array<{ uri: string; file?: Blob | File }>>(initialImages);

  const { control, handleSubmit, trigger, setValue, watch, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema) as Resolver<PropertyFormData>,
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      type: (initialData?.type as PropertyFormData["type"]) ?? "residential",
      listing_type: (initialData?.listing_type as PropertyFormData["listing_type"]) ?? "sale",
      price: initialData?.price ? String(initialData.price) : "",
      area_id: area?.id ?? initialData?.area_id ?? "",
      address: initialData?.address ?? "",
      bedrooms: initialData?.amenities?.bedrooms ? String(initialData.amenities.bedrooms) : "",
      bathrooms: initialData?.amenities?.bathrooms ? String(initialData.amenities.bathrooms) : "",
      area_size: initialData?.area_size ? String(initialData.area_size) : "",
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    const stepFields = PROPERTY_STEP_FIELDS[step];
    if (stepFields) {
      const valid = await trigger(stepFields);
      if (!valid) return;
    }
    setStep((s) => s + 1);
  };

  const onFormSubmit = (data: PropertyFormData) => {
    const dto: UpsertPropertyDto = {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      type: data.type as UpsertPropertyDto["type"],
      subtype: initialData?.subtype,
      listing_type: data.listing_type as UpsertPropertyDto["listing_type"],
      price: Number(data.price),
      price_currency: initialData?.price_currency || "BDT",
      area_id: data.area_id.trim(),
      address: data.address?.trim() || undefined,
      area_size: data.area_size ? Number(data.area_size) : undefined,
      area_unit: initialData?.area_unit || "sqft",
      location_lat: initialData?.location_lat,
      location_lng: initialData?.location_lng,
      amenities: {
        ...initialData?.amenities,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
      },
      virtual_tour_url: initialData?.virtual_tour_url,
    };

    onSubmit(dto, images);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotDone]}>
                {i < step ? (
                  <Check color={colorTokens.textInverse} size={13} />
                ) : (
                  <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <ErrorBanner message={error} />

        {/* Step Content */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <FormFloatingInput
              control={control}
              name="title"
              label="Title"
              autoCapitalize="words"
            />
            <FormFloatingInput
              control={control}
              name="description"
              label="Description (optional)"
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Type</Text>
                <FormSelectField
                  control={control}
                  name="type"
                  options={["residential", "commercial", "land", "parking"]}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Listing</Text>
                <FormSelectField
                  control={control}
                  name="listing_type"
                  options={["sale", "rent"]}
                />
              </View>
            </View>
            <FormFloatingInput
              control={control}
              name="price"
              label="Price"
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.fieldLabel}>Area</Text>
            <Pressable onPress={() => setAreaPickerVisible(true)} style={styles.areaButton}>
              <MapPin color={colorTokens.primary} size={18} />
              <Text style={styles.areaButtonText}>{area?.name || initialArea?.name || "Select an API area"}</Text>
            </Pressable>
            {errors.area_id && (
              <Text style={styles.fieldError}>{errors.area_id.message}</Text>
            )}
            <FormFloatingInput
              control={control}
              name="address"
              label="Address (optional)"
              autoCapitalize="words"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormFloatingInput
                  control={control}
                  name="bedrooms"
                  label="Bedrooms"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <FormFloatingInput
                  control={control}
                  name="bathrooms"
                  label="Bathrooms"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <FormFloatingInput
              control={control}
              name="area_size"
              label="Area size (sqft)"
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Images</Text>
            <ImageUploader
              images={images}
              onAdd={(newImgs) => setImages((prev) => [...prev, ...newImgs])}
              onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
              maxImages={20}
            />
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navRow}>
          {step > 0 ? (
            <AuthButton
              label="Back"
              onPress={() => setStep((s) => s - 1)}
              variant="secondary"
              icon={ArrowLeft}
              style={styles.navBtn}
            />
          ) : onCancel ? (
            <AuthButton
              label="Cancel"
              onPress={onCancel}
              variant="secondary"
              style={styles.navBtn}
            />
          ) : (
            <View style={styles.navBtn} />
          )}

          {step < STEPS.length - 1 ? (
            <AuthButton
              label="Next"
              onPress={handleNext}
              icon={ArrowRight}
              style={styles.navBtn}
            />
          ) : (
            <AuthButton
              label={mode === "create" ? "Create Property" : "Save Changes"}
              onPress={handleSubmit(onFormSubmit as any)}
              loading={loading}
              disabled={loading}
              icon={Send}
              style={styles.navBtn}
            />
          )}
        </View>
      </ScrollView>
      <AreaPicker
        visible={areaPickerVisible}
        onClose={() => setAreaPickerVisible(false)}
        onSelect={(selected) => {
          if (!selected) return;
          setArea(selected);
          setValue("area_id", selected.id, { shouldValidate: true });
          setAreaPickerVisible(false);
        }}
        selectedArea={area ?? initialArea}
        initialCity={area?.city ?? initialArea?.city ?? undefined}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 0,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
  },
  stepDotActive: {
    backgroundColor: colorTokens.primary,
    borderColor: colorTokens.primary,
  },
  stepDotDone: {
    backgroundColor: colorTokens.primaryDark,
    borderColor: colorTokens.primaryDark,
  },
  stepDotText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.textMuted,
  },
  stepDotTextActive: {
    color: colorTokens.textInverse,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colorTokens.textMuted,
  },
  stepLabelActive: {
    color: colorTokens.primary,
    fontFamily: fonts.bold,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: colorTokens.divider,
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: colorTokens.primary,
  },
  stepContent: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colorTokens.textPrimary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
    marginBottom: 6,
  },
  fieldError: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colorTokens.error,
    marginTop: 4,
  },
  areaButton: {
    alignItems: "center",
    backgroundColor: colorTokens.backgroundAlt,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  areaButtonText: {
    color: colorTokens.textPrimary,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  navBtn: {
    flex: 1,
  },
});
