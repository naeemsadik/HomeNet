import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";

interface AmenityChipsProps {
  type: string;
  amenities: Record<string, boolean>;
  onToggle: (key: string) => void;
}

const AMENITY_OPTIONS: Record<string, string[]> = {
  residential: ["Parking", "Lift", "Generator", "Security", "Gas", "Pool", "Gym", "Rooftop"],
  commercial: ["Parking", "Lift", "Generator", "Security", "Loading Dock", "CCTV"],
  land: ["Road Access", "Electricity", "Water", "Gas"],
  parking: ["Covered", "Security", "CCTV", "EV Charging"],
};

export function AmenityChips({ type, amenities, onToggle }: AmenityChipsProps) {
  const options = AMENITY_OPTIONS[type] ?? AMENITY_OPTIONS.residential;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amenities</Text>
      <Text style={styles.subtitle}>
        Toggle the amenities available for this property
      </Text>
      <View style={styles.grid}>
        {options.map((label) => {
          const key = label.toLowerCase().replace(/\s+/g, "_");
          const active = amenities[key] === true;

          return (
            <Pressable
              key={key}
              onPress={() => onToggle(key)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${label} amenity`}
            >
              <View style={[styles.check, active && styles.checkActive]}>
                {active ? <Check color={colorTokens.textInverse} size={12} strokeWidth={3} /> : null}
              </View>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
  },
  chipActive: {
    backgroundColor: colorTokens.primaryLight,
    borderColor: colorTokens.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: colorTokens.primary,
    borderColor: colorTokens.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  chipTextActive: {
    color: colorTokens.primaryDark,
    fontFamily: fontTokens.bold,
  },
});
