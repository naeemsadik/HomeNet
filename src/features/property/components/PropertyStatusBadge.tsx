import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Check, Clock, AlertTriangle, X as XIcon, FileEdit } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";

type PropertyStatus = "draft" | "pending" | "active" | "sold" | "archived" | "rejected";

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
  isVerified?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<
  PropertyStatus,
  { bg: string; text: string; label: string; icon: typeof Check; pulse?: boolean }
> = {
  draft: {
    bg: colorTokens.backgroundAlt,
    text: colorTokens.textMuted,
    label: "Draft",
    icon: FileEdit,
  },
  pending: {
    bg: colorTokens.warningLight,
    text: colorTokens.warning,
    label: "Pending Review",
    icon: Clock,
    pulse: true,
  },
  active: {
    bg: colorTokens.primaryLight,
    text: colorTokens.primary,
    label: "Active",
    icon: Check,
  },
  sold: {
    bg: colorTokens.verifiedLight,
    text: colorTokens.verified,
    label: "Sold",
    icon: Check,
  },
  rejected: {
    bg: colorTokens.errorLight,
    text: colorTokens.error,
    label: "Rejected",
    icon: XIcon,
  },
  archived: {
    bg: colorTokens.backgroundAlt,
    text: colorTokens.textMuted,
    label: "Archived",
    icon: AlertTriangle,
  },
};

export function PropertyStatusBadge({
  status,
  isVerified,
  size = "md",
}: PropertyStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.draft;
  const Icon = config.icon;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!config.pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [config.pulse, pulseAnim]);

  const isSmall = size === "sm";

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSm,
        config.pulse && { opacity: pulseAnim },
      ]}
    >
      <Icon color={config.text} size={isSmall ? 10 : 12} />
      <Text
        style={[
          styles.label,
          { color: config.text },
          isSmall && styles.labelSm,
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
      {isVerified && status === "active" ? (
        <View style={[styles.verifiedDot, { backgroundColor: colorTokens.primary }]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
    borderRadius: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: fontTokens.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 9,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
