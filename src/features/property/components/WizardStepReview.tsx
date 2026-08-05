import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Send,
  Save,
  MapPin,
  Tag,
  DollarSign,
  Maximize,
  Video,
  Globe,
  CheckCircle2,
} from "lucide-react-native";
import { colorTokens, fontTokens, shadow, webPointer } from "@/theme";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";
import { useUpdateProperty, useSubmitForVerification } from "../hooks/usePropertyMutations";
import { AmenityChips } from "./AmenityChips";

export function WizardStepReview() {
  const {
    propertyId, title, type, subtype, listingType, price, areaSize,
    areaName, address, description, media, amenities, virtualTourUrl,
    setAmenities, toggleAmenity, setVirtualTourUrl, isSubmitting, setIsSubmitting,
  } = usePropertyWizardStore();

  const updateProperty = useUpdateProperty();
  const submitVerification = useSubmitForVerification();
  const [submitted, setSubmitted] = useState(false);

  const handleSaveDraft = async () => {
    if (!propertyId) return;
    setIsSubmitting(true);
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        dto: {
          amenities: Object.keys(amenities).length > 0 ? amenities : undefined,
          virtual_tour_url: virtualTourUrl || undefined,
        },
      });
      Alert.alert("Saved", "Your listing has been saved as a draft.");
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!propertyId) return;

    const missing: string[] = [];
    if (!title) missing.push("Title");
    if (!type) missing.push("Property Type");
    if (!listingType) missing.push("Listing Type");
    if (!price) missing.push("Price");

    if (missing.length > 0) {
      Alert.alert(
        "Missing required fields",
        `Please go back and fill in: ${missing.join(", ")}`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        dto: {
          amenities: Object.keys(amenities).length > 0 ? amenities : undefined,
          virtual_tour_url: virtualTourUrl || undefined,
        },
      });
      await submitVerification.mutateAsync(propertyId);
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Could not submit for verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconWrap}>
          <CheckCircle2 color={colorTokens.primary} size={48} />
        </View>
        <Text style={styles.successTitle}>Submitted for Review!</Text>
        <Text style={styles.successSubtitle}>
          Your listing is now pending verification. We'll review it shortly and notify you.
        </Text>
        <Text style={styles.successHint}>
          Status: Pending Review
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.title}>Review & Submit</Text>
        <Text style={styles.subtitle}>
          Review your listing details, then submit for verification.
        </Text>
      </View>

      {/* Summary Card */}
      <View style={[styles.card, shadow]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Listing Summary</Text>
        </View>

        {/* Preview Image */}
        {media.length > 0 ? (
          <Image
            source={{ uri: media[0].url }}
            style={styles.previewImage}
          />
        ) : null}

        <View style={styles.summaryGrid}>
          <SummaryRow icon={Tag} label="Title" value={title || "—"} />
          <SummaryRow
            icon={Tag}
            label="Type"
            value={`${type.charAt(0).toUpperCase() + type.slice(1)}${subtype ? ` · ${subtype}` : ""}`}
          />
          <SummaryRow
            icon={Tag}
            label="Listing"
            value={listingType === "sale" ? "For Sale" : "For Rent"}
          />
          <SummaryRow
            icon={DollarSign}
            label="Price"
            value={price ? `BDT ${Number(price).toLocaleString()}` : "—"}
          />
          <SummaryRow
            icon={Maximize}
            label="Area"
            value={areaSize ? `${Number(areaSize).toLocaleString()} sqft` : "—"}
          />
          <SummaryRow
            icon={MapPin}
            label="Location"
            value={areaName || "—"}
          />
          {address ? (
            <SummaryRow icon={MapPin} label="Address" value={address} />
          ) : null}
          <SummaryRow
            icon={Video}
            label="Media"
            value={`${media.length} item${media.length !== 1 ? "s" : ""}`}
          />
        </View>

        {description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText} numberOfLines={4}>
              {description}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Amenities */}
      <View style={[styles.card, shadow]}>
        <AmenityChips
          type={type}
          amenities={amenities}
          onToggle={toggleAmenity}
        />
      </View>

      {/* Virtual Tour URL */}
      <View style={[styles.card, shadow]}>
        <Text style={styles.sectionTitle}>Virtual Tour</Text>
        <Text style={styles.sectionSubtitle}>
          Optional: Add a link to a virtual tour
        </Text>
        <TextInput
          value={virtualTourUrl}
          onChangeText={setVirtualTourUrl}
          placeholder="https://..."
          placeholderTextColor={colorTokens.textMuted}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.urlInput}
        />
        {virtualTourUrl ? (
          <View style={styles.urlPreview}>
            <Globe color={colorTokens.primary} size={14} />
            <Text style={styles.urlPreviewText} numberOfLines={1}>
              {virtualTourUrl}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleSaveDraft}
          disabled={isSubmitting || !propertyId}
          style={({ pressed }) => [
            styles.draftBtn,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="Save as draft"
        >
          <Save color={colorTokens.textSecondary} size={18} />
          <Text style={styles.draftBtnText}>Save as Draft</Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !propertyId}
          style={({ pressed }) => [
            styles.submitBtn,
            (isSubmitting || !propertyId) && styles.submitBtnDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="Submit for verification"
        >
          {isSubmitting ? (
            <Text style={styles.submitBtnText}>Submitting...</Text>
          ) : (
            <>
              <Send color={colorTokens.textInverse} size={18} />
              <Text style={styles.submitBtnText}>Submit for Verification</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Icon color={colorTokens.textMuted} size={14} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 14,
  },
  header: {
    gap: 6,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 14,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
  },
  summaryGrid: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    width: 70,
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textMuted,
  },
  summaryValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
    paddingTop: 12,
    gap: 6,
  },
  descLabel: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.textMuted,
  },
  descText: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
    marginTop: -8,
  },
  urlInput: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textPrimary,
  },
  urlPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colorTokens.primaryLight,
  },
  urlPreviewText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.primary,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  draftBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
  },
  draftBtnText: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textSecondary,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colorTokens.primary,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
  pressed: {
    opacity: 0.8,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 14,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primaryLight,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  successHint: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.warning,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colorTokens.warningLight,
    overflow: "hidden",
  },
});
