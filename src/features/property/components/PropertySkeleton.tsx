import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colorTokens, radius } from "@/theme";

/** Mirrors PropertyCard's standard geometry so the swap to real content is calm. */
export function PropertySkeleton() {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.card} accessibilityLabel="Loading property">
      <Animated.View style={[styles.image, { opacity: pulse }]} />
      <View style={styles.body}>
        <Animated.View style={[styles.price, { opacity: pulse }]} />
        <Animated.View style={[styles.titleLong, { opacity: pulse }]} />
        <Animated.View style={[styles.titleShort, { opacity: pulse }]} />
        <View style={styles.specs}>
          <Animated.View style={[styles.spec, { opacity: pulse }]} />
          <Animated.View style={[styles.spec, { opacity: pulse }]} />
          <Animated.View style={[styles.spec, { opacity: pulse }]} />
        </View>
      </View>
    </View>
  );
}

export function PropertySkeletonFeed() {
  return (
    <View style={styles.feed}>
      <PropertySkeleton />
      <PropertySkeleton />
      <PropertySkeleton />
    </View>
  );
}

const shimmer = colorTokens.surfaceSunken;

const styles = StyleSheet.create({
  feed: { gap: 16, paddingVertical: 8 },
  card: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  image: { width: "100%", aspectRatio: 16 / 9, backgroundColor: shimmer },
  body: { padding: 16, gap: 9 },
  price: { height: 20, width: "45%", borderRadius: 4, backgroundColor: shimmer },
  titleLong: { height: 14, width: "85%", borderRadius: 4, backgroundColor: shimmer },
  titleShort: { height: 14, width: "55%", borderRadius: 4, backgroundColor: shimmer },
  specs: {
    flexDirection: "row",
    gap: 14,
    marginTop: 2,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  spec: { height: 12, width: 54, borderRadius: 4, backgroundColor: shimmer },
});
