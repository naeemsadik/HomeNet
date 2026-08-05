import React from "react";
import { Pressable, StyleSheet, Platform } from "react-native";
import { MapPin, List } from "lucide-react-native";
import { feedColors } from "./PropertyBadge";

interface MapListToggleProps {
  viewMode: "list" | "map";
  onToggle: () => void;
}

export function MapListToggle({ viewMode, onToggle }: MapListToggleProps) {
  const isMap = viewMode === "map";

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isMap ? "Switch to list view" : "Switch to map view"}
    >
      {isMap ? (
        <List color={feedColors.white} size={24} />
      ) : (
        <MapPin color={feedColors.white} size={24} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: feedColors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,

    // Elevated shadow
    ...Platform.select({
      ios: {
        shadowColor: feedColors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.22)",
        cursor: "pointer",
      },
    }),
  },
  pressed: {
    backgroundColor: feedColors.primaryDark,
    transform: [{ scale: 0.95 }],
  },
});
