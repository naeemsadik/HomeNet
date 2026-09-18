import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts } from "@/theme";

interface MetricTileProps {
  label: string;
  value: number;
  suffix?: string;
  trigger?: boolean;
}

export function MetricTile({ label, value, suffix = "", trigger = true }: MetricTileProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!trigger || value <= 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const duration = 600;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const factor = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * factor));

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, trigger]);

  return (
    <View style={styles.tile}>
      <Text style={styles.number}>
        {displayValue.toLocaleString()}
        {suffix}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
    flex: 1,
  },
  number: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  label: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
});
