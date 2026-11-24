import React, { memo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Bed, Building2, Compass, type LucideIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import type { UtilityFeatureItem } from "@/content/homeFeatureSections";
import { CardTitleLinkRow } from "./CardTitleLinkRow";

const ICONS: Record<string, LucideIcon> = {
  Building2,
  Bed,
  Compass,
};

export interface UtilityLinkCardProps {
  item: UtilityFeatureItem;
}

export const UtilityLinkCard = memo(function UtilityLinkCard({ item }: UtilityLinkCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isLifted = isHovered || isFocused;

  const title = t(item.titleKey);
  const description = t(item.descriptionKey);

  const IconComponent = ICONS[item.iconName] ?? Building2;

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
      style={[styles.card, isLifted && styles.cardHovered]}
    >
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <IconComponent color={colorTokens.brandText} size={20} strokeWidth={2.2} />
        </View>

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
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    padding: 20,
    flex: 1,
    minWidth: 280,
    position: "relative",
    gap: 16,
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
        boxShadow: "0 4px 16px rgba(11, 26, 23, 0.06)",
      },
      default: {
        elevation: 2,
      },
    }),
  },
  header: {
    gap: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: fonts.regular,
    color: colorTokens.muted,
  },
});
