import React, { useCallback, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, Save, ChevronRight } from "lucide-react-native";
import { AppChrome } from "@/components/AppChrome";
import { colorTokens, fontTokens, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";
import { useCreateProperty, useUpdateProperty } from "../hooks/usePropertyMutations";
import { WizardStepBasics } from "../components/WizardStepBasics";
import { WizardStepMedia } from "../components/WizardStepMedia";
import { WizardStepReview } from "../components/WizardStepReview";
import type { CreatePropertyDto } from "@/types/api";

const STEPS = [1, 2, 3] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={styles.stepIndicator}>
      {STEPS.map((s) => (
        <React.Fragment key={s}>
          <View style={[styles.stepDot, s <= current && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, s <= current && styles.stepDotTextActive]}>
              {s}
            </Text>
          </View>
          {s < 3 ? (
            <View style={[styles.stepLine, s < current && styles.stepLineActive]} />
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

export function PropertyCreateWizard() {
  const { isPhone } = useResponsive();
  const {
    currentStep, setCurrentStep, propertyId, setPropertyId,
    title, type, subtype, listingType, price, areaSize, areaId,
    address, description, locationLat, locationLng, media,
    isSubmitting, setIsSubmitting, reset,
  } = usePropertyWizardStore();

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const buildDto = useCallback((): CreatePropertyDto => ({
    title,
    type,
    listing_type: listingType,
    price: Number(price) || 0,
    area_id: areaId,
    area_size: areaSize ? Number(areaSize) : undefined,
    address: address || undefined,
    description: description || undefined,
    location_lat: locationLat ?? undefined,
    location_lng: locationLng ?? undefined,
  }), [title, type, listingType, price, areaId, areaSize, address, description, locationLat, locationLng]);

  const handleSaveBasics = async () => {
    const missing: string[] = [];
    if (!title) missing.push("Title");
    if (!type) missing.push("Property Type");
    if (!listingType) missing.push("Listing Type");
    if (!price) missing.push("Price");
    if (!areaId) missing.push("Area / Location");

    if (missing.length > 0) {
      Alert.alert("Missing required fields", `Please fill in: ${missing.join(", ")}`);
      return false;
    }

    setIsSubmitting(true);
    try {
      if (propertyId) {
        await updateProperty.mutateAsync({ id: propertyId, dto: buildDto() });
      } else {
        const result = await createProperty.mutateAsync(buildDto());
        const newId = result.data?.id;
        if (newId) {
          setPropertyId(newId);
        } else {
          throw new Error("No property ID returned");
        }
      }
      return true;
    } catch {
      Alert.alert("Error", "Could not save property basics. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const ok = await handleSaveBasics();
      if (ok) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (media.length === 0) {
        Alert.alert("No media", "Please add at least one photo or skip to continue.");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    }
  };

  const stepTitles: Record<number, string> = {
    1: "Property Basics",
    2: "Photos & Videos",
    3: "Review & Submit",
  };

  return (
    <AppChrome active="sell">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, webPointer]}
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={colorTokens.textSecondary} size={20} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>New Listing</Text>
            <Text style={styles.headerStep}>{stepTitles[currentStep]}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <StepIndicator current={currentStep} />

        {/* Step Content */}
        <View style={styles.stepContent}>
          {currentStep === 1 && <WizardStepBasics />}
          {currentStep === 2 && <WizardStepMedia />}
          {currentStep === 3 && <WizardStepReview />}
        </View>

        {/* Bottom Navigation */}
        {currentStep < 3 ? (
          <View style={styles.bottomNav}>
            {currentStep > 1 ? (
              <Pressable
                onPress={handleBack}
                style={[styles.navBtn, styles.navBtnSecondary, webPointer]}
                accessibilityLabel="Go back"
              >
                <ArrowLeft color={colorTokens.textSecondary} size={18} />
                <Text style={styles.navBtnSecondaryText}>Back</Text>
              </Pressable>
            ) : (
              <View />
            )}

            <Pressable
              onPress={handleNext}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnPrimary,
                isSubmitting && styles.navBtnDisabled,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={currentStep === 1 ? "Save and continue" : "Continue to review"}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colorTokens.textInverse} size={16} />
              ) : (
                <>
                  <Text style={styles.navBtnPrimaryText}>
                    {currentStep === 1 ? "Save & Continue" : "Continue"}
                  </Text>
                  <ChevronRight color={colorTokens.textInverse} size={18} />
                </>
              )}
            </Pressable>
          </View>
        ) : null}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  containerPhone: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
  },
  headerCenter: {
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  headerStep: {
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.primary,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    paddingVertical: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 2,
    borderColor: colorTokens.divider,
  },
  stepDotActive: {
    backgroundColor: colorTokens.primary,
    borderColor: colorTokens.primary,
  },
  stepDotText: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.textMuted,
  },
  stepDotTextActive: {
    color: colorTokens.textInverse,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colorTokens.divider,
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: colorTokens.primary,
  },
  stepContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  navBtnPrimary: {
    backgroundColor: colorTokens.primary,
  },
  navBtnPrimaryText: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
  navBtnSecondary: {
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
  },
  navBtnSecondaryText: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  navBtnDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
