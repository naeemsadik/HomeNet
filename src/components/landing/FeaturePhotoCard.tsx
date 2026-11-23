import React, { memo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowRight } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { PhotoFeatureItem } from "@/content/homeFeatureSections";

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
  const ctaText = t(item.ctaKey);
  const badge = t(item.badgeKey);

  return (
    <View
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={[styles.card, isRevealed && styles.cardHovered]}
    >
      <View style={styles.imageContainer}>
        <Image
          accessibilityLabel={item.imageAlt}
          accessibilityIgnoresInvertColors
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: item.imageSource }}
          style={[styles.image, isRevealed && styles.imageHovered]}
        />
        <View
          aria-hidden={true}
          style={[styles.badge, isRevealed && styles.badgeRevealed]}
        >
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <Link asChild href={item.href}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`${badge} - ${title} - ${ctaText}`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onHoverIn={() => setIsHovered(true)}
              onHoverOut={() => setIsHovered(false)}
              style={({ hovered }: { hovered?: boolean }) => [
                styles.ctaPressable,
                hovered && styles.ctaPressableHovered,
                webPointer,
              ]}
            >
              <Text style={styles.ctaText}>{ctaText}</Text>
              <ArrowRight color={colorTokens.brandText} size={16} strokeWidth={2.4} />
            </Pressable>
          </Link>
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
    ...Platform.select({
      web: {
        transitionProperty: "border-color, box-shadow",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-out",
      },
    }),
  },
  cardHovered: {
    borderColor: "rgba(11, 26, 23, 0.16)",
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
    backgroundColor: "#181A1B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    opacity: 0,
    transform: [{ translateY: -4 }],
    pointerEvents: "none",
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
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  body: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
    gap: 16,
  },
  content: {
    gap: 6,
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
  ctaContainer: {
    marginTop: "auto",
  },
  ctaPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap",
    minHeight: 44,
  },
  ctaPressableHovered: {
    opacity: 0.82,
  },
  ctaText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: colorTokens.brandText,
    textDecorationLine: "underline",
  },
});
