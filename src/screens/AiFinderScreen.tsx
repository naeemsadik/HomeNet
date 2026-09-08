import React from "react";
import { StyleSheet, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AiFinderWorkflow } from "@/components/AiFinderWorkflow";
import { useResponsive } from "@/hooks/useResponsive";

export function AiFinderScreen() {
  const { isPhone } = useResponsive();

  return (
    <AppChrome active="ai">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <AiFinderWorkflow />
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
