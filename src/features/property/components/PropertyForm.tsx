import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Send, ArrowRight, ArrowLeft, Check } from "lucide-react-native";
import { colorTokens, fonts, webPointer } from "@/theme";
import { FloatingInput, ErrorBanner, AuthButton } from "@/components/AuthFormFields";
import { SelectField } from "@/components/ui";
import { ImageUploader } from "./ImageUploader";
import type { CreatePropertyDto } from "@/types/api";

interface PropertyFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreatePropertyDto>;
  initialImages?: Array<{ uri: string; file?: Blob | File }>;
  onSubmit: (data: CreatePropertyDto, images: Array<{ uri: string; file?: Blob | File }>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

const STEPS = ["Details", "Location", "Features", "Images"] as const;

export function PropertyForm({
  mode,
  initialData,
  initialImages = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}: PropertyFormProps) {
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [type, setType] = useState<string>(initialData?.type ?? "residential");
  const [listingType, setListingType] = useState<string>(initialData?.listing_type ?? "sale");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [areaId, setAreaId] = useState(initialData?.area_id ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms ? String(initialData.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms ? String(initialData.bathrooms) : "");
  const [areaSize, setAreaSize] = useState(initialData?.area_size ? String(initialData.area_size) : "");
  const [images, setImages] = useState<Array<{ uri: string; file?: Blob | File }>>(initialImages);

  const canNext = () => {
    if (step === 0) return title.trim().length > 0 && price.trim().length > 0;
    if (step === 1) return areaId.trim().length > 0;
    return true;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required");
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("Validation", "Valid price is required");
      return;
    }
    if (!areaId.trim()) {
      Alert.alert("Validation", "Area is required");
      return;
    }

    const dto: CreatePropertyDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      type: type as CreatePropertyDto["type"],
      listing_type: listingType as CreatePropertyDto["listing_type"],
      price: Number(price),
      area_id: areaId.trim(),
      address: address.trim() || undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      area_size: areaSize ? Number(areaSize) : undefined,
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
                <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i < step ? "✓" : i + 1}</Text>
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
            <FloatingInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="words"
            />
            <FloatingInput
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Type</Text>
                <SelectField
                  value={type}
                  options={["residential", "commercial", "land", "parking"]}
                  onChange={setType}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Listing</Text>
                <SelectField
                  value={listingType}
                  options={["sale", "rent"]}
                  onChange={setListingType}
                />
              </View>
            </View>
            <FloatingInput
              label="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Location</Text>
            <FloatingInput
              label="Area ID"
              value={areaId}
              onChangeText={setAreaId}
              autoCapitalize="none"
            />
            <FloatingInput
              label="Address (optional)"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FloatingInput
                  label="Bedrooms"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <FloatingInput
                  label="Bathrooms"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <FloatingInput
              label="Area size (sqft)"
              value={areaSize}
              onChangeText={setAreaSize}
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
              onPress={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              icon={ArrowRight}
              style={styles.navBtn}
            />
          ) : (
            <AuthButton
              label={mode === "create" ? "Create Property" : "Save Changes"}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon={Send}
              style={styles.navBtn}
            />
          )}
        </View>
      </ScrollView>
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
