import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";

interface PropertyAmenitiesProps {
  amenities: Record<string, unknown> | null;
}

function formatAmenityLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (!amenities || Object.keys(amenities).length === 0) return null;

  const entries = Object.entries(amenities).filter(
    ([, value]) => value === true || typeof value === "string" || typeof value === "number",
  );

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amenities & Features</Text>
      <View style={styles.grid}>
        {entries.map(([key, value]) => {
          const display =
            typeof value === "string"
              ? value
              : typeof value === "number"
                ? `${formatAmenityLabel(key)}: ${value}`
                : formatAmenityLabel(key);

          return (
            <View key={key} style={styles.chip}>
              <View style={styles.checkWrap}>
                <Check color={colorTokens.primary} size={13} strokeWidth={3} />
              </View>
              <Text style={styles.chipText}>{display}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colorTokens.primaryLight,
    borderWidth: 1,
    borderColor: "#C4E4D5",
  },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.background,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.primaryDark,
  },
});
