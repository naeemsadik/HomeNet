import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Compass,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react-native";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { landingCopy } from "@/content/landingCopy";

export function TechBlock() {
  const { isTablet, isPhone } = useResponsive();
  const { tech } = landingCopy;

  const pillars = [
    {
      icon: <Cpu color="#0F6D55" size={22} strokeWidth={2.2} />,
      title: "Direct API Engine",
      subtitle: "High-throughput RESTful endpoints with sub-second response times, zero middleware buffering, and client-side caching.",
      tag: "Performance",
    },
    {
      icon: <Compass color="#0F6D55" size={22} strokeWidth={2.2} />,
      title: tech.locationTitle,
      subtitle: tech.locationDesc,
      tag: "Geospatial",
    },
    {
      icon: <Database color="#0F6D55" size={22} strokeWidth={2.2} />,
      title: tech.schemaTitle,
      subtitle: tech.schemaDesc,
      tag: "Database",
    },
  ];

  return (
    <View style={styles.container}>
      {/* 3 Engineering Architecture Cards */}
      <View style={[styles.techRow, isTablet && styles.techRowTablet]}>
        {pillars.map((pillar) => (
          <View key={pillar.title} style={styles.pillarCard}>
            <View style={styles.pillarTopRow}>
              <View style={styles.iconWell}>{pillar.icon}</View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{pillar.tag}</Text>
              </View>
            </View>
            <Text style={styles.pillarTitle}>{pillar.title}</Text>
            <Text style={styles.pillarDesc}>{pillar.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* Dhaka Coverage & Roadmap Strip */}
      <View style={[styles.roadmapStrip, isPhone && styles.roadmapStripPhone]}>
        <View style={styles.roadmapHeader}>
          <CheckCircle2 size={16} color="#0F6D55" />
          <Text style={styles.roadmapLabel}>SYSTEM CAPABILITIES & ROADMAP:</Text>
        </View>
        <Text style={styles.roadmapItems}>
          Dhaka Ward-level indexing · GPS radius search · Automated completeness gate · In-app owner chat (upcoming)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 20,
  },
  techRow: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  techRowTablet: {
    flexDirection: "column",
  },
  pillarCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24,
    gap: 10,
  },
  pillarTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  tagBadge: {
    backgroundColor: "rgba(15, 109, 85, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "#0F6D55",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pillarTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 18,
    fontWeight: "700",
  },
  pillarDesc: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  roadmapStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    flexWrap: "wrap",
  },
  roadmapStripPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  roadmapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roadmapLabel: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  roadmapItems: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
