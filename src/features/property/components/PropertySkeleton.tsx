import React, { useEffect, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { feedColors } from "./PropertyBadge";

export function PropertySkeleton() {
  const [pulseAnim] = useState(new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.card}>
      {/* 16:9 Image Box Skeleton */}
      <Animated.View style={[styles.imageSkeleton, { opacity: pulseAnim }]} />

      {/* Details Padding Container */}
      <View style={styles.content}>
        {/* Title Bar Skeleton */}
        <Animated.View style={[styles.titleLine, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.titleLineShort, { opacity: pulseAnim }]} />

        {/* Details Row Skeleton (Beds, Baths, Sqft) */}
        <View style={styles.detailsRow}>
          <Animated.View style={[styles.detailPill, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.detailPill, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.detailPill, { opacity: pulseAnim }]} />
        </View>

        {/* Location Bar Skeleton */}
        <Animated.View style={[styles.locationLine, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
}

export function PropertySkeletonFeed() {
  return (
    <View style={styles.feedContainer}>
      <PropertySkeleton />
      <PropertySkeleton />
      <PropertySkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: feedColors.card,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: feedColors.border,
  },
  imageSkeleton: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: feedColors.border,
  },
  content: {
    padding: 14,
    gap: 10,
  },
  titleLine: {
    height: 16,
    width: "85%",
    borderRadius: 4,
    backgroundColor: feedColors.border,
  },
  titleLineShort: {
    height: 16,
    width: "55%",
    borderRadius: 4,
    backgroundColor: feedColors.border,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  detailPill: {
    height: 14,
    width: 60,
    borderRadius: 4,
    backgroundColor: feedColors.border,
  },
  locationLine: {
    height: 12,
    width: "40%",
    borderRadius: 4,
    backgroundColor: feedColors.border,
    marginTop: 2,
  },
});
