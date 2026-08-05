import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Maximize, Building2, Tag, Calendar } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";

interface PropertyHighlightsProps {
  areaSize: number | null;
  areaUnit: string | null;
  type: string;
  listingType: "sale" | "rent";
  publishedAt: string | null;
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "—";
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function HighlightCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Maximize;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon color={colorTokens.primary} size={18} />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function PropertyHighlights({
  areaSize,
  areaUnit,
  type,
  listingType,
  publishedAt,
}: PropertyHighlightsProps) {
  const areaDisplay =
    areaSize != null
      ? `${areaSize.toLocaleString()} ${areaUnit ?? "sqft"}`
      : "—";

  const typeDisplay =
    type.charAt(0).toUpperCase() + type.slice(1);

  const listingDisplay =
    listingType === "sale" ? "For Sale" : "For Rent";

  const publishedDisplay = formatRelativeTime(publishedAt);

  return (
    <View style={styles.grid}>
      <HighlightCard icon={Maximize} label="Area Size" value={areaDisplay} />
      <HighlightCard icon={Building2} label="Type" value={typeDisplay} />
      <HighlightCard icon={Tag} label="Listing" value={listingDisplay} />
      <HighlightCard icon={Calendar} label="Published" value={publishedDisplay} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    flexGrow: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primaryLight,
  },
  value: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  label: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
});
