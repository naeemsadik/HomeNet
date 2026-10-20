import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  Building,
  Car,
  Check,
  Compass,
  FileCheck2,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from "@/components/icons";
import { colorTokens, colors, fonts, radius, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useInstantValuation } from "../hooks/useInstantValuation";
import type { ValuationAmenities } from "../types/valuationTypes";

interface AmenityOption {
  key: keyof ValuationAmenities;
  label: string;
  impactTag: string;
  desc: string;
  icon: typeof Zap;
}

const DHAKA_AMENITIES: AmenityOption[] = [
  {
    key: "lift",
    label: "Lift / Elevator",
    impactTag: "+7% Value Premium",
    desc: "Essential for 3rd floor and above in Dhaka residential buildings.",
    icon: Layers,
  },
  {
    key: "generator",
    label: "Full Backup Generator",
    impactTag: "+5% Value Premium",
    desc: "Uninterrupted power for water pumps, lift, and essential home appliances.",
    icon: Zap,
  },
  {
    key: "parking",
    label: "Dedicated Car Parking",
    impactTag: "+6% Value Premium",
    desc: "Guaranteed allocated parking space (worth BDT 5–12 Lakh in Dhaka).",
    icon: Car,
  },
  {
    key: "gas",
    label: "Titas / Reticulated LPG Gas",
    impactTag: "+4% Value Premium",
    desc: "Continuous piped gas supply eliminates heavy cylinder handling.",
    icon: Sparkles,
  },
  {
    key: "cctv",
    label: "24/7 CCTV & Security Guards",
    impactTag: "+2% Value Premium",
    desc: "Guarded gate, intercom system, and perimeter surveillance.",
    icon: ShieldCheck,
  },
  {
    key: "rooftop",
    label: "Rooftop Garden / Community Space",
    impactTag: "+2% Value Premium",
    desc: "Landscaped terrace, walking path, and community gathering hall.",
    icon: Building,
  },
  {
    key: "lakeParkView",
    label: "Lake / Open Park View",
    impactTag: "+6% Value Premium",
    desc: "Direct view of Dhanmondi/Gulshan lake or open park reserve.",
    icon: Compass,
  },
];

export function Step3Amenities() {
  const { form, toggleAmenity, executeValuation, prevStep } = useInstantValuation();
  const { isPhone } = useResponsive();

  const selectedCount = Object.values(form.amenities).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dhaka-Specific Value Drivers & Amenities</Text>
        <Text style={styles.subtitle}>
          In Dhaka, building utilities (standby generator, lift, gas line) drive massive resale value and rental yields.
        </Text>
      </View>

      {/* Selected Counter Chip */}
      <View style={styles.counterBanner}>
        <Sparkles color={colorTokens.brandText} size={16} strokeWidth={2.2} />
        <Text style={styles.counterBannerText}>
          {selectedCount} key value driver{selectedCount === 1 ? "" : "s"} selected for valuation
        </Text>
      </View>

      {/* Amenities Grid */}
      <View style={[styles.amenitiesGrid, isPhone && styles.amenitiesGridPhone]}>
        {DHAKA_AMENITIES.map((amenity) => {
          const isSelected = form.amenities[amenity.key];
          const Icon = amenity.icon;

          return (
            <Pressable
              key={amenity.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              onPress={() => toggleAmenity(amenity.key)}
              style={({ hovered }: any) => [
                styles.amenityCard,
                isPhone && styles.amenityCardPhone,
                isSelected && styles.amenityCardSelected,
                hovered && !isSelected && styles.amenityCardHovered,
                webPointer,
              ]}
            >
              <View style={styles.amenityHeader}>
                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.iconBoxSelected,
                  ]}
                >
                  <Icon
                    color={isSelected ? colorTokens.onBrand : colors.muted}
                    size={18}
                    strokeWidth={2}
                  />
                </View>

                <View style={styles.amenityBadge}>
                  <Text style={styles.amenityBadgeText}>{amenity.impactTag}</Text>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Check color={colorTokens.onBrand} size={12} strokeWidth={3} />
                  )}
                </View>
              </View>

              <Text
                style={[
                  styles.amenityLabel,
                  isSelected && styles.amenityLabelSelected,
                ]}
              >
                {amenity.label}
              </Text>
              <Text style={styles.amenityDesc}>{amenity.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Dhaka Real Estate Market Tip Banner */}
      <View style={styles.tipBox}>
        <View style={styles.tipIconWrap}>
          <FileCheck2 color={colorTokens.info} size={18} strokeWidth={2} />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>HomeNet Verification Engine</Text>
          <Text style={styles.tipText}>
            Our algorithmic pricing cross-references active listings, building age, and verified road accessibility across 26 Dhaka municipal wards.
          </Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={prevStep}
          style={[styles.backButton, webPointer]}
        >
          <ArrowLeft color={colorTokens.ink} size={18} strokeWidth={2} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => executeValuation()}
          style={({ pressed, hovered }: any) => [
            styles.calculateButton,
            hovered && styles.calculateButtonHovered,
            pressed && { opacity: 0.9 },
            webPointer,
          ]}
        >
          <Sparkles color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
          <Text style={styles.calculateButtonText}>Calculate Instant Valuation</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 20,
  },
  counterBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 20,
  },
  counterBannerText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  amenitiesGridPhone: {
    flexDirection: "column",
  },
  amenityCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.10)",
    borderRadius: radius.md,
    padding: 14,
  },
  amenityCardPhone: {
    minWidth: "100%",
  },
  amenityCardSelected: {
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brandSurface,
    ...shadow,
  },
  amenityCardHovered: {
    borderColor: colorTokens.brandBorder,
  },
  amenityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: colorTokens.brand,
  },
  amenityBadge: {
    backgroundColor: "rgba(4, 207, 146, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.15)",
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  amenityLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  amenityLabelSelected: {
    color: colorTokens.brandText,
  },
  amenityDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 16,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: colorTokens.infoSurface,
    borderWidth: 1,
    borderColor: "rgba(34, 81, 214, 0.15)",
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  tipIconWrap: {
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.info,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.body,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brand,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
    ...shadow,
  },
  calculateButtonHovered: {
    backgroundColor: colorTokens.brandHover,
  },
  calculateButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colorTokens.onBrand,
  },
});
