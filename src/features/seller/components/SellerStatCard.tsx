import { TrendingUp } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import { fonts } from "@/theme";

export interface StatItem {
  id: string;
  label: string;
  value: string;
  trend?: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

export interface SellerStatCardProps {
  item: StatItem;
}

/**
 * Mobile 2-by-2 Stat Card implementing Figma Node 207:2837.
 * Used exclusively for mobile / responsive small screen devices.
 */
export function SellerStatCard({ item }: SellerStatCardProps) {
  const IconComponent = item.icon;

  return (
    <View style={styles.card}>
      {/* Top row: Category icon badge + optional trend badge */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
          <IconComponent color={item.iconColor} size={20} strokeWidth={1.8} />
        </View>

        {item.trend ? (
          <View style={styles.trendPill}>
            <TrendingUp color="#0F6D55" size={12} strokeWidth={2} />
            <Text style={styles.trendText}>{item.trend}</Text>
          </View>
        ) : null}
      </View>

      {/* Dynamic Metric Value */}
      <Text numberOfLines={1} style={styles.statValue}>
        {item.value}
      </Text>

      {/* Metric Label */}
      <Text numberOfLines={1} style={styles.statLabel}>
        {item.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    maxWidth: "48.5%",
    minWidth: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.154,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 16,
    justifyContent: "space-between",
    ...(Platform.OS === "web"
      ? ({ width: "calc(50% - 6px)", maxWidth: "calc(50% - 6px)" } as any)
      : {}),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  trendText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
    lineHeight: 16,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
  },
});
