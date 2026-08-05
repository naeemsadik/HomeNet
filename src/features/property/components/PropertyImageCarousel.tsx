import React, { useState } from "react";
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import type { PropertyMedia } from "../types/property";
import { feedColors } from "./PropertyBadge";

interface PropertyImageCarouselProps {
  media?: PropertyMedia[];
  fallbackImageUrl?: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85";

export function PropertyImageCarousel({
  media = [],
  fallbackImageUrl,
}: PropertyImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const images =
    media.length > 0
      ? media.map((m) => m.url)
      : [fallbackImageUrl || fallbackImage];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (cardWidth <= 0) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / cardWidth);
    if (index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View
      style={styles.carouselContainer}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        data={images}
        keyExtractor={(_, index) => `img-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.imageWrapper, { width: cardWidth || 340 }]}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {images.length > 1 ? (
        <View style={styles.paginationContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#e8ece9",
  },
  imageWrapper: {
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: feedColors.white,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});
