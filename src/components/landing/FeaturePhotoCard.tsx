import React, { memo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import type { PhotoFeatureItem } from "@/content/homeFeatureSections";
import { CardTitleLinkRow } from "./CardTitleLinkRow";

export interface FeaturePhotoCardProps {
  item: PhotoFeatureItem;
}

export const FeaturePhotoCard = memo(function FeaturePhotoCard({ item }: FeaturePhotoCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isRevealed = isHovered || isFocused;

  const title = t(item.titleKey);
  const description = t(item.descriptionKey);
  const badge = t(item.badgeKey);

  return (
    <View
      onPointerEnter={() => {
        if (
          Platform.OS === "web" &&
          typeof window !== "undefined" &&
          window.matchMedia &&
          !window.matchMedia("(hover: hover)").matches
        ) {
          return;
        }
        setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      style={[styles.card, isRevealed && styles.cardHovered]}
    >
      <View style={styles.imageContainer}>
        <Image
          accessibilityLabel={t(item.imageAltKey)}
          accessibilityIgnoresInvertColors
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: item.imageSource }}
          style={[styles.image, isRevealed && styles.imageHovered]}
        />
        {/* Category badge pill in top-left */}
        <View aria-hidden={true} style={[styles.badge, isRevealed && styles.badgeRevealed]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.content}>
          <CardTitleLinkRow
            href={item.href}
            onFocusChange={setIsFocused}
            onHoverChange={setIsHovered}
            title={title}
            titleStyle={styles.title}
          />
          <Text style={styles.description}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    overflow: "hidden",
    flex: 1,
    minWidth: 280,
    position: "relative",
    ...Platform.select({
      web: {
        transitionProperty: "border-color, box-shadow",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-out",
      },
    }),
  },
  cardHovered: {
    borderColor: colorTokens.brandBorder,
    ...Platform.select({
      web: {
        boxShadow: "0 6px 20px rgba(11, 26, 23, 0.08)",
      },
      default: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colorTokens.surfaceSunken,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    ...Platform.select({
      web: {
        transitionProperty: "transform",
        transitionDuration: "240ms",
        transitionTimingFunction: "ease-out",
      },
    }),
  },
  imageHovered: {
    transform: [{ scale: 1.03 }],
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: colorTokens.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    pointerEvents: "none",
    opacity: 0,
    transform: [{ translateY: -4 }],
    ...Platform.select({
      web: {
        transitionProperty: "opacity, transform",
        transitionDuration: "180ms",
        transitionTimingFunction: "ease-out",
      },
    }),
  },
  badgeRevealed: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  badgeText: {
    color: colorTokens.surface,
    fontSize: 11,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  body: {
    padding: 20,
    flex: 1,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colorTokens.muted,
  },
});
