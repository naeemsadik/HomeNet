import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

export const feedColors = {
  primary: "#0a8a2a",
  primaryDark: "#077a22",
  primaryLight: "#e8f5e9",
  white: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#525252",
  textMuted: "#737373",
  border: "#e0e0e0",
  background: "#f5f5f5",
  card: "#ffffff",
  shadow: "#000000",
};

interface StatusBadgeProps {
  listingType: "sale" | "rent";
}

export function StatusBadge({ listingType }: StatusBadgeProps) {
  const isRent = listingType === "rent";
  return (
    <View style={[styles.statusBadge, { backgroundColor: isRent ? feedColors.primary : "#2196f3" }]}>
      <Text style={styles.statusBadgeText}>{isRent ? "FOR RENT" : "FOR SALE"}</Text>
    </View>
  );
}

interface PriceBadgeProps {
  price: number;
  currency?: string;
  listingType: "sale" | "rent";
}

export function PriceBadge({ price, currency = "BDT", listingType }: PriceBadgeProps) {
  const formattedPrice =
    price >= 10000000
      ? `${currency} ${(price / 10000000).toFixed(1)} Cr`
      : price >= 100000
      ? `${currency} ${(price / 100000).toFixed(0)} Lac`
      : `${currency} ${price.toLocaleString()}`;

  const suffix = listingType === "rent" ? "/mo" : "";

  return (
    <View style={styles.priceBadge}>
      <Text style={styles.priceBadgeText}>
        {formattedPrice}
        {suffix}
      </Text>
    </View>
  );
}

interface VerifiedBadgeProps {
  isVerified?: boolean;
}

export function VerifiedBadge({ isVerified }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  return (
    <View style={styles.verifiedBadge}>
      <Check color={feedColors.primary} size={14} strokeWidth={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 10,
  },
  statusBadgeText: {
    color: feedColors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  priceBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  priceBadgeText: {
    color: feedColors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: feedColors.primaryLight,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: feedColors.primary,
    zIndex: 10,
  },
});
