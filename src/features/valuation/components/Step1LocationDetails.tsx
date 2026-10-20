import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Home,
  LandPlot,
  MapPin,
  Sparkles,
} from "@/components/icons";
import { AreaPicker } from "@/components/AreaPicker";
import { colorTokens, colors, fonts, radius, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useInstantValuation } from "../hooks/useInstantValuation";
import type { ValuationPropertyType } from "../types/valuationTypes";
import type { Area } from "@/types/api";

const DHAKA_POPULAR_NEIGHBORHOODS = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Uttara",
  "Bashundhara",
  "Mirpur",
  "Mohammadpur",
  "Baridhara",
];

const PROPERTY_TYPES: {
  key: ValuationPropertyType;
  label: string;
  sub: string;
  icon: typeof Building2;
}[] = [
  {
    key: "apartment",
    label: "Apartment / Flat",
    sub: "Residential unit in multistoried building",
    icon: Building2,
  },
  {
    key: "house",
    label: "Independent House",
    sub: "Duplex, triplex, or detached building",
    icon: Home,
  },
  {
    key: "commercial",
    label: "Commercial Space",
    sub: "Office floor, showroom, or retail",
    icon: Building2,
  },
  {
    key: "land",
    label: "Land / Plot",
    sub: "Residential or commercial plot (Katha)",
    icon: LandPlot,
  },
];

export function Step1LocationDetails() {
  const { form, setFormField, nextStep, isStep1Valid } = useInstantValuation();
  const { isPhone } = useResponsive();
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  const handleSelectArea = (area: Area | null) => {
    if (area) {
      setFormField("areaId", area.id);
      setFormField("areaName", area.name);
      setFormField("address", `${area.name}, Dhaka`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Where is your property located?</Text>
        <Text style={styles.subtitle}>
          Dhaka property values vary significantly by neighborhood, sector, and road frontage.
        </Text>
      </View>

      {/* Purpose Toggle: Sale vs Rent */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Valuation Purpose</Text>
        <View style={styles.purposeToggleRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFormField("purpose", "sale")}
            style={[
              styles.purposeTab,
              form.purpose === "sale" && styles.purposeTabActive,
              webPointer,
            ]}
          >
            <Sparkles
              color={form.purpose === "sale" ? colorTokens.onBrand : colors.muted}
              size={16}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.purposeTabText,
                form.purpose === "sale" && styles.purposeTabTextActive,
              ]}
            >
              Sale Valuation
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setFormField("purpose", "rent")}
            style={[
              styles.purposeTab,
              form.purpose === "rent" && styles.purposeTabActive,
              webPointer,
            ]}
          >
            <Home
              color={form.purpose === "rent" ? colorTokens.onBrand : colors.muted}
              size={16}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.purposeTabText,
                form.purpose === "rent" && styles.purposeTabTextActive,
              ]}
            >
              Rental Valuation
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Property Type Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Property Type</Text>
        <View style={[styles.typesGrid, isPhone && styles.typesGridPhone]}>
          {PROPERTY_TYPES.map((t) => {
            const isSelected = form.propertyType === t.key;
            const Icon = t.icon;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="button"
                onPress={() => setFormField("propertyType", t.key)}
                style={({ hovered }: any) => [
                  styles.typeCard,
                  isPhone && styles.typeCardPhone,
                  isSelected && styles.typeCardSelected,
                  hovered && !isSelected && styles.typeCardHovered,
                  webPointer,
                ]}
              >
                <View
                  style={[
                    styles.typeIconBox,
                    isSelected && styles.typeIconBoxSelected,
                  ]}
                >
                  <Icon
                    color={isSelected ? colorTokens.onBrand : colors.muted}
                    size={18}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.typeContent}>
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && styles.typeLabelSelected,
                    ]}
                  >
                    {t.label}
                  </Text>
                  <Text style={styles.typeSub} numberOfLines={1}>
                    {t.sub}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Dhaka Area Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Dhaka Neighborhood / Thana</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => setAreaPickerOpen(true)}
          style={({ hovered }: any) => [
            styles.areaSelector,
            hovered && styles.areaSelectorHovered,
            webPointer,
          ]}
        >
          <View style={styles.areaLeft}>
            <MapPin color={colors.greenOnLight} size={18} strokeWidth={2.2} />
            <Text style={styles.areaValueText}>
              {form.areaName || "Select Area in Dhaka (e.g. Gulshan, Dhanmondi)"}
            </Text>
          </View>
          <ChevronDown color={colors.muted} size={18} strokeWidth={2} />
        </Pressable>

        {/* Quick select chips */}
        <View style={styles.quickChipsRow}>
          {DHAKA_POPULAR_NEIGHBORHOODS.map((area) => {
            const isSelected = form.areaName.toLowerCase() === area.toLowerCase();
            return (
              <Pressable
                key={area}
                accessibilityRole="button"
                onPress={() => {
                  setFormField("areaName", area);
                  setFormField("areaId", `${area.toLowerCase()}-dhaka`);
                  setFormField("address", `${area}, Dhaka`);
                }}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  webPointer,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {area}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Address Details: Road / Sector / Plot */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Road, Sector, or Block (Crucial for micro-pricing)</Text>
        <TextInput
          onChangeText={(v) => {
            setFormField("roadOrBlock", v);
            setFormField("address", `${v ? `${v}, ` : ""}${form.areaName}, Dhaka`);
          }}
          placeholder="e.g. Road 92, Sector 4, Block D, Avenue 3"
          placeholderTextColor={colors.muted}
          style={styles.textInput}
          value={form.roadOrBlock}
        />
        <Text style={styles.inputHelper}>
          In Gulshan, Banani, and Uttara, specific blocks or avenues can impact price by 15–20%.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Building or Project Name (Optional)</Text>
        <TextInput
          onChangeText={(v) => setFormField("buildingName", v)}
          placeholder="e.g. Shanta Forum, Concord Tower, Private Residence"
          placeholderTextColor={colors.muted}
          style={styles.textInput}
          value={form.buildingName}
        />
      </View>

      {/* Next Step CTA */}
      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!isStep1Valid}
          onPress={nextStep}
          style={({ pressed, hovered }: any) => [
            styles.continueButton,
            !isStep1Valid && styles.continueButtonDisabled,
            hovered && isStep1Valid && styles.continueButtonHovered,
            pressed && isStep1Valid && { opacity: 0.9 },
            webPointer,
          ]}
        >
          <Text style={styles.continueButtonText}>Continue to Property Specs</Text>
          <ArrowRight color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
        </Pressable>
      </View>

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedArea={null}
        onSelect={(area) => {
          handleSelectArea(area);
          setAreaPickerOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 24,
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
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
    marginBottom: 8,
  },
  purposeToggleRow: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  purposeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 8,
  },
  purposeTabActive: {
    backgroundColor: colorTokens.brand,
    ...shadow,
  },
  purposeTabText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  purposeTabTextActive: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typesGridPhone: {
    flexDirection: "column",
  },
  typeCard: {
    flex: 1,
    minWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.10)",
    backgroundColor: colorTokens.surface,
    gap: 12,
  },
  typeCardPhone: {
    minWidth: "100%",
  },
  typeCardSelected: {
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brandSurface,
  },
  typeCardHovered: {
    borderColor: colorTokens.brandBorder,
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconBoxSelected: {
    backgroundColor: colorTokens.brand,
  },
  typeContent: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  typeLabelSelected: {
    color: colorTokens.brandText,
  },
  typeSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
  },
  areaSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.12)",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  areaSelectorHovered: {
    borderColor: colorTokens.brand,
  },
  areaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  areaValueText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colorTokens.ink,
  },
  quickChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  chipSelected: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brand,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  chipTextSelected: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
  },
  textInput: {
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.12)",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colorTokens.ink,
  },
  inputHelper: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 5,
  },
  footerRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.brand,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    ...shadow,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonHovered: {
    backgroundColor: colorTokens.brandHover,
  },
  continueButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colorTokens.onBrand,
  },
});
