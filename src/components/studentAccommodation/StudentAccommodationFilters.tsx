import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Check, RotateCcw } from "@/components/icons";
import { colorTokens, fonts, radius } from "@/theme";
import { useTranslation } from "@/i18n";
import type {
  GenderPolicy,
  StudentAccommodationSearchParams,
  StudentSubtype,
} from "@/types/studentAccommodation";

export interface StudentAccommodationFiltersProps {
  initialParams?: StudentAccommodationSearchParams;
  onApply: (params: StudentAccommodationSearchParams) => void;
  onReset?: () => void;
  style?: StyleProp<ViewStyle>;
}

const GENDER_OPTIONS: Array<{ key: GenderPolicy | "all"; labelKey: string }> = [
  { key: "all", labelKey: "studentAccommodation.allGender" },
  { key: "male", labelKey: "studentAccommodation.male" },
  { key: "female", labelKey: "studentAccommodation.female" },
  { key: "mixed", labelKey: "studentAccommodation.mixed" },
];

const SUBTYPE_OPTIONS: StudentSubtype[] = [
  "hostel",
  "mess",
  "shared_flat",
  "dormitory",
  "single_room",
  "sublet",
];

const WALKING_OPTIONS: Array<{ value?: number; labelKey: string }> = [
  { value: undefined, labelKey: "studentAccommodation.anyDistance" },
  { value: 5, labelKey: "studentAccommodation.walkTime5" },
  { value: 10, labelKey: "studentAccommodation.walkTime10" },
  { value: 15, labelKey: "studentAccommodation.walkTime15" },
  { value: 20, labelKey: "studentAccommodation.walkTime20Plus" },
];

export function StudentAccommodationFilters({
  initialParams,
  onApply,
  onReset,
  style,
}: StudentAccommodationFiltersProps) {
  const { t } = useTranslation();

  const [gender, setGender] = useState<GenderPolicy | undefined>(
    initialParams?.gender_policy,
  );
  const [subtype, setSubtype] = useState<StudentSubtype | undefined>(
    initialParams?.subtype,
  );
  const [maxWalkingTime, setMaxWalkingTime] = useState<number | undefined>(
    initialParams?.max_walking_time,
  );
  const [hasLift, setHasLift] = useState<boolean>(
    Boolean(initialParams?.has_lift),
  );
  const [hasMeal, setHasMeal] = useState<boolean>(
    Boolean(initialParams?.has_meal),
  );
  const [hasWifi, setHasWifi] = useState<boolean>(
    Boolean(initialParams?.has_wifi),
  );

  const handleReset = () => {
    setGender(undefined);
    setSubtype(undefined);
    setMaxWalkingTime(undefined);
    setHasLift(false);
    setHasMeal(false);
    setHasWifi(false);

    onReset?.();
  };

  const handleApply = () => {
    const filters: StudentAccommodationSearchParams = {
      ...(gender ? { gender_policy: gender } : {}),
      ...(subtype ? { subtype } : {}),
      ...(maxWalkingTime ? { max_walking_time: maxWalkingTime } : {}),
      ...(hasLift ? { has_lift: true } : {}),
      ...(hasMeal ? { has_meal: true } : {}),
      ...(hasWifi ? { has_wifi: true } : {}),
    };

    onApply(filters);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t("studentAccommodation.filtersTitle")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("studentAccommodation.resetFilters")}
          onPress={handleReset}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <RotateCcw size={14} color={colorTokens.muted} />
          <Text style={styles.resetButtonText}>
            {t("studentAccommodation.resetFilters")}
          </Text>
        </Pressable>
      </View>

      {/* 1. Gender Policy Segmented Bar */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("studentAccommodation.genderTitle")}</Text>
        <View style={styles.segmentedContainer}>
          {GENDER_OPTIONS.map((opt) => {
            const isSelected =
              opt.key === "all" ? gender === undefined : gender === opt.key;
            return (
              <Pressable
                key={opt.key}
                accessibilityRole="button"
                accessibilityLabel={t(opt.labelKey as any)}
                accessibilityState={{ selected: isSelected }}
                onPress={() =>
                  setGender(opt.key === "all" ? undefined : (opt.key as GenderPolicy))
                }
                style={[
                  styles.segmentButton,
                  isSelected && styles.segmentButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextActive,
                  ]}
                >
                  {t(opt.labelKey as any)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Subtype Multi-select / Horizontal Chips */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("studentAccommodation.subtypeTitle")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {SUBTYPE_OPTIONS.map((item) => {
            const isSelected = subtype === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityLabel={t(`studentAccommodation.${item}`)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSubtype(isSelected ? undefined : item)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                {isSelected ? (
                  <Check size={14} color={colorTokens.surface} strokeWidth={2.5} />
                ) : null}
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextActive]}
                >
                  {t(`studentAccommodation.${item}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Max Walking Distance Chips */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("studentAccommodation.maxWalkingDistance")}
        </Text>
        <View style={styles.chipsWrap}>
          {WALKING_OPTIONS.map((opt, idx) => {
            const isSelected = maxWalkingTime === opt.value;
            return (
              <Pressable
                key={opt.value ?? `any-${idx}`}
                accessibilityRole="button"
                accessibilityLabel={t(opt.labelKey as any)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setMaxWalkingTime(opt.value)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextActive]}
                >
                  {t(opt.labelKey as any)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 4. Rule & Safety Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("studentAccommodation.safetyRulesTitle")}
        </Text>
        <View style={styles.chipsWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("studentAccommodation.filterLift")}
            accessibilityState={{ selected: hasLift }}
            onPress={() => setHasLift(!hasLift)}
            style={[styles.chip, hasLift && styles.chipActive]}
          >
            {hasLift ? (
              <Check size={14} color={colorTokens.surface} strokeWidth={2.5} />
            ) : null}
            <Text
              style={[styles.chipText, hasLift && styles.chipTextActive]}
            >
              {t("studentAccommodation.filterLift")}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("studentAccommodation.filterMeal")}
            accessibilityState={{ selected: hasMeal }}
            onPress={() => setHasMeal(!hasMeal)}
            style={[styles.chip, hasMeal && styles.chipActive]}
          >
            {hasMeal ? (
              <Check size={14} color={colorTokens.surface} strokeWidth={2.5} />
            ) : null}
            <Text
              style={[styles.chipText, hasMeal && styles.chipTextActive]}
            >
              {t("studentAccommodation.filterMeal")}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("studentAccommodation.filterWifi")}
            accessibilityState={{ selected: hasWifi }}
            onPress={() => setHasWifi(!hasWifi)}
            style={[styles.chip, hasWifi && styles.chipActive]}
          >
            {hasWifi ? (
              <Check size={14} color={colorTokens.surface} strokeWidth={2.5} />
            ) : null}
            <Text
              style={[styles.chipText, hasWifi && styles.chipTextActive]}
            >
              {t("studentAccommodation.filterWifi")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 5. Apply Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("studentAccommodation.applyFilters")}
        onPress={handleApply}
        style={({ pressed }) => [
          styles.applyButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.applyButtonText}>
          {t("studentAccommodation.applyFilters")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    padding: 16,
    gap: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
      } as ViewStyle,
      default: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colorTokens.ink,
    lineHeight: 24,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  resetButtonText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.muted,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colorTokens.ink,
    lineHeight: 18,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: colorTokens.surface,
    ...Platform.select({
      web: {
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
      } as ViewStyle,
      default: {
        elevation: 1,
      },
    }),
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.muted,
  },
  segmentTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: colorTokens.brandText,
    borderColor: colorTokens.brandText,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  chipTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.surface,
  },
  applyButton: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  applyButtonText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
    color: colorTokens.surface,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});

export default StudentAccommodationFilters;

