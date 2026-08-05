import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { PropertyFeed } from "../components/PropertyFeed";
import { feedColors } from "../components/PropertyBadge";

export function PropertyExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PropertyFeed />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: feedColors.white,
  },
});
