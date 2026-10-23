import React from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { AiFinderWorkflow } from "@/components/AiFinderWorkflow";
import { useResponsive } from "@/hooks/useResponsive";

export function AiFinderScreen() {
  const { isPhone } = useResponsive();
  // The hero search box sends what was typed as ?prompt= on phones.
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();

  return (
    <AppChrome active="ai">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <AiFinderWorkflow initialPrompt={typeof prompt === "string" ? prompt : ""} />
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  containerPhone: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
});
