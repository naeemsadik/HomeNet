import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  Compass,
  Layers,
  Maximize2,
} from "@/components/icons";
import { colorTokens, colors, fonts, radius, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { useInstantValuation } from "../hooks/useInstantValuation";
import type { PropertyCondition, PropertyFacing } from "../types/valuationTypes";

export function Step2PropertySpecs() {
  const { t } = useTranslation();
  const { form, setFormField, nextStep, prevStep, isStep2Valid } = useInstantValuation();
  const { isPhone } = useResponsive();

  const facingOptions: {
    key: PropertyFacing;
    label: string;
    tag?: string;
    desc: string;
  }[] = [
    {
      key: "south",
      label: t("valuation.step2.facing.south"),
      tag: t("valuation.step2.facing.southTag"),
      desc: t("valuation.step2.facing.southDesc"),
    },
    {
      key: "east",
      label: t("valuation.step2.facing.east"),
      desc: t("valuation.step2.facing.eastDesc"),
    },
    {
      key: "north",
      label: t("valuation.step2.facing.north"),
      desc: t("valuation.step2.facing.northDesc"),
    },
    {
      key: "west",
      label: t("valuation.step2.facing.west"),
      desc: t("valuation.step2.facing.westDesc"),
    },
  ];

  const floorTiers = [
    { label: t("valuation.step2.floors.ground"), value: "1", note: "Security/privacy discount" },
    { label: t("valuation.step2.floors.low"), value: "2", note: "Standard low-rise" },
    { label: t("valuation.step2.floors.mid"), value: "6", note: "Dhaka Sweet Spot (+4%)", popular: true },
    { label: t("valuation.step2.floors.high"), value: "11", note: "High view & clean air" },
    { label: t("valuation.step2.floors.top"), value: "16", note: "Exclusive skyline level" },
  ];

  const conditionOptions: {
    key: PropertyCondition;
    label: string;
    desc: string;
  }[] = [
    {
      key: "brand_new",
      label: t("valuation.step2.conditions.brandNew"),
      desc: t("valuation.step2.conditions.brandNewDesc"),
    },
    {
      key: "under_construction",
      label: t("valuation.step2.conditions.underConstruction"),
      desc: t("valuation.step2.conditions.underConstructionDesc"),
    },
    {
      key: "resale",
      label: t("valuation.step2.conditions.resale"),
      desc: t("valuation.step2.conditions.resaleDesc"),
    },
  ];

  const currentUnitLabel =
    form.sizeUnit === "katha" ? t("valuation.step2.unitKatha") : t("valuation.step2.unitSqft");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("valuation.step2.title")}</Text>
        <Text style={styles.subtitle}>
          {t("valuation.step2.subtitle")}
        </Text>
      </View>

      {/* Property Size Input with Unit Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("valuation.step2.sizeLabel", { unit: currentUnitLabel })}
        </Text>
        <View style={styles.sizeInputRow}>
          <View style={styles.sizeInputWrap}>
            <Maximize2 color={colors.muted} size={18} strokeWidth={2} />
            <TextInput
              keyboardType="numeric"
              onChangeText={(v) => setFormField("sizeInput", v)}
              placeholder={t("valuation.step2.sizePlaceholder")}
              placeholderTextColor={colors.muted}
              style={styles.sizeInput}
              value={form.sizeInput}
            />
          </View>

          <View style={styles.unitToggle}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFormField("sizeUnit", "sqft")}
              style={[
                styles.unitBtn,
                form.sizeUnit === "sqft" && styles.unitBtnActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.unitBtnText,
                  form.sizeUnit === "sqft" && styles.unitBtnTextActive,
                ]}
              >
                {t("valuation.step2.unitSqft")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFormField("sizeUnit", "katha")}
              style={[
                styles.unitBtn,
                form.sizeUnit === "katha" && styles.unitBtnActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.unitBtnText,
                  form.sizeUnit === "katha" && styles.unitBtnTextActive,
                ]}
              >
                {t("valuation.step2.unitKatha")}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.inputHelper}>
          {form.sizeUnit === "katha"
            ? t("valuation.step2.kathaHelper")
            : t("valuation.step2.sqftHelper")}
        </Text>
      </View>

      {/* Bedrooms & Bathrooms Steppers */}
      <View style={[styles.counterRow, isPhone && styles.counterRowPhone]}>
        <View style={styles.counterBox}>
          <View style={styles.counterHeader}>
            <Bed color={colors.greenOnLight} size={16} strokeWidth={2.2} />
            <Text style={styles.counterTitle}>{t("valuation.step2.bedrooms")}</Text>
          </View>
          <View style={styles.pillRow}>
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = form.bedrooms === num;
              return (
                <Pressable
                  key={num}
                  accessibilityRole="button"
                  onPress={() => setFormField("bedrooms", num)}
                  style={[
                    styles.counterPill,
                    isSelected && styles.counterPillSelected,
                    webPointer,
                  ]}
                >
                  <Text
                    style={[
                      styles.counterPillText,
                      isSelected && styles.counterPillTextSelected,
                    ]}
                  >
                    {num === 5 ? "5+" : num}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.counterBox}>
          <View style={styles.counterHeader}>
            <Bath color={colors.greenOnLight} size={16} strokeWidth={2.2} />
            <Text style={styles.counterTitle}>{t("valuation.step2.bathrooms")}</Text>
          </View>
          <View style={styles.pillRow}>
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = form.bathrooms === num;
              return (
                <Pressable
                  key={num}
                  accessibilityRole="button"
                  onPress={() => setFormField("bathrooms", num)}
                  style={[
                    styles.counterPill,
                    isSelected && styles.counterPillSelected,
                    webPointer,
                  ]}
                >
                  <Text
                    style={[
                      styles.counterPillText,
                      isSelected && styles.counterPillTextSelected,
                    ]}
                  >
                    {num === 5 ? "5+" : num}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Floor Level Tier */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderWithIcon}>
          <Layers color={colors.greenOnLight} size={16} strokeWidth={2} />
          <Text style={styles.sectionLabel}>{t("valuation.step2.floorLabel")}</Text>
        </View>
        <View style={styles.floorChipsRow}>
          {floorTiers.map((tier) => {
            const isSelected = form.floorLevel === tier.value;
            return (
              <Pressable
                key={tier.value}
                accessibilityRole="button"
                onPress={() => setFormField("floorLevel", tier.value)}
                style={[
                  styles.floorChip,
                  isSelected && styles.floorChipSelected,
                  webPointer,
                ]}
              >
                <Text
                  style={[
                    styles.floorChipText,
                    isSelected && styles.floorChipTextSelected,
                  ]}
                >
                  {tier.label}
                </Text>
                {tier.popular && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{t("valuation.step2.sweetSpot")}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Building Facing (Dhaka's South-facing premium) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderWithIcon}>
          <Compass color={colors.greenOnLight} size={16} strokeWidth={2} />
          <Text style={styles.sectionLabel}>{t("valuation.step2.facingLabel")}</Text>
        </View>
        <View style={[styles.facingGrid, isPhone && styles.facingGridPhone]}>
          {facingOptions.map((f) => {
            const isSelected = form.facing === f.key;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="button"
                onPress={() => setFormField("facing", f.key)}
                style={[
                  styles.facingCard,
                  isSelected && styles.facingCardSelected,
                  webPointer,
                ]}
              >
                <View style={styles.facingCardHeader}>
                  <Text
                    style={[
                      styles.facingCardTitle,
                      isSelected && styles.facingCardTitleSelected,
                    ]}
                  >
                    {f.label}
                  </Text>
                  {f.tag && (
                    <View style={styles.greenTag}>
                      <Text style={styles.greenTagText}>{f.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.facingCardDesc}>{f.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Property Condition / Age */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("valuation.step2.conditionLabel")}</Text>
        <View style={[styles.conditionRow, isPhone && styles.conditionRowPhone]}>
          {conditionOptions.map((c) => {
            const isSelected = form.propertyAge === c.key;
            return (
              <Pressable
                key={c.key}
                accessibilityRole="button"
                onPress={() => setFormField("propertyAge", c.key)}
                style={[
                  styles.conditionCard,
                  isSelected && styles.conditionCardSelected,
                  webPointer,
                ]}
              >
                <Text
                  style={[
                    styles.conditionTitle,
                    isSelected && styles.conditionTitleSelected,
                  ]}
                >
                  {c.label}
                </Text>
                <Text style={styles.conditionDesc}>{c.desc}</Text>
              </Pressable>
            );
          })}
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
          <Text style={styles.backButtonText}>{t("valuation.step2.backCTA")}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!isStep2Valid}
          onPress={nextStep}
          style={({ pressed, hovered }: any) => [
            styles.continueButton,
            !isStep2Valid && styles.continueButtonDisabled,
            hovered && isStep2Valid && styles.continueButtonHovered,
            pressed && isStep2Valid && { opacity: 0.9 },
            webPointer,
          ]}
        >
          <Text style={styles.continueButtonText}>{t("valuation.step2.continueCTA")}</Text>
          <ArrowRight color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
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
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  sizeInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  sizeInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.12)",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    gap: 10,
  },
  sizeInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  unitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
    justifyContent: "center",
  },
  unitBtnActive: {
    backgroundColor: colorTokens.surface,
    ...shadow,
  },
  unitBtnText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  unitBtnTextActive: {
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
  },
  inputHelper: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 5,
  },
  counterRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 22,
  },
  counterRowPhone: {
    flexDirection: "column",
  },
  counterBox: {
    flex: 1,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.10)",
    borderRadius: radius.md,
    padding: 14,
  },
  counterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  counterTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  pillRow: {
    flexDirection: "row",
    gap: 6,
  },
  counterPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  counterPillSelected: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  counterPillText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  counterPillTextSelected: {
    color: colorTokens.onBrand,
  },
  floorChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  floorChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.10)",
    gap: 8,
  },
  floorChipSelected: {
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brandSurface,
  },
  floorChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.ink,
  },
  floorChipTextSelected: {
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
  },
  tag: {
    backgroundColor: "rgba(4, 207, 146, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  facingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  facingGridPhone: {
    flexDirection: "column",
  },
  facingCard: {
    flex: 1,
    minWidth: 200,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.10)",
  },
  facingCardSelected: {
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brandSurface,
  },
  facingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  facingCardTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  facingCardTitleSelected: {
    color: colorTokens.brandText,
  },
  facingCardDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  greenTag: {
    backgroundColor: "rgba(4, 207, 146, 0.20)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  greenTagText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colorTokens.brandText,
  },
  conditionRow: {
    flexDirection: "row",
    gap: 10,
  },
  conditionRowPhone: {
    flexDirection: "column",
  },
  conditionCard: {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.10)",
  },
  conditionCardSelected: {
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brandSurface,
  },
  conditionTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
    marginBottom: 2,
  },
  conditionTitleSelected: {
    color: colorTokens.brandText,
  },
  conditionDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
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
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
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
