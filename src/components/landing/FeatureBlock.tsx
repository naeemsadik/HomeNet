import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Compass,
  FileCheck2,
  Filter,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react-native";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { landingCopy } from "@/content/landingCopy";

export function FeatureBlock() {
  const { isTablet } = useResponsive();
  const items = landingCopy.features.items;

  const icons = [MapPin, Compass, Filter, FileCheck2, Sparkles, Layers];

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const Icon = icons[index];
        const isReversed = index % 2 === 1;

        return (
          <View
            key={item.title}
            style={[
              styles.featureRow,
              isReversed && !isTablet && styles.featureRowReversed,
              isTablet && styles.featureRowTablet,
            ]}
          >
            {/* Copy Column */}
            <View style={styles.copyCol}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.descText}>{item.desc}</Text>
            </View>

            {/* Illustrative Micro-Preview Column */}
            <View style={styles.visualCol}>
              <View style={styles.visualCard}>
                <View style={styles.iconWell}>
                  <Icon color="#0F6D55" size={24} strokeWidth={2.2} />
                </View>
                <View style={styles.visualMockDetails}>
                  <Text style={styles.visualMockTitle}>{item.tag}</Text>
                  <Text style={styles.visualMockSub}>
                    Verified platform engine · Active in production
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  featureRowReversed: {
    flexDirection: "row-reverse",
  },
  featureRowTablet: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 24,
    gap: 20,
  },
  copyCol: {
    flex: 1,
    gap: 8,
  },
  tagPill: {
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  tagText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    fontWeight: "600",
  },
  titleText: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  descText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 22,
  },
  visualCol: {
    flex: 1,
    width: "100%",
  },
  visualCard: {
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  visualMockDetails: {
    flex: 1,
    gap: 4,
  },
  visualMockTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 15,
    fontWeight: "700",
  },
  visualMockSub: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
});
