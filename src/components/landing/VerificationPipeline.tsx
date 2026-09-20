import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, FileCheck, Lock, ShieldCheck } from "lucide-react-native";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { landingCopy } from "@/content/landingCopy";

export function VerificationPipeline() {
  const { isTablet } = useResponsive();
  const steps = landingCopy.trust.steps;

  const icons = [FileCheck, CheckCircle2, ShieldCheck, Lock];

  return (
    <View style={styles.container}>
      <View style={[styles.pipelineRow, isTablet && styles.pipelineRowTablet]}>
        {steps.map((step, idx) => {
          const Icon = icons[idx];
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.title}>
              <View style={styles.nodeCard}>
                <View style={styles.iconWell}>
                  <Icon color="#2251D6" size={22} strokeWidth={2.2} />
                </View>
                <Text style={styles.nodeTitle}>{step.title}</Text>
                <Text style={styles.nodeDesc}>{step.desc}</Text>
              </View>

              {!isLast && !isTablet && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.ruleBanner}>
        <Lock color="#2251D6" size={16} strokeWidth={2.2} />
        <Text style={styles.ruleBannerText}>
          Strict 404 Protection: If a listing has not been verified, it is completely unreachable on HomeNet.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 24,
  },
  pipelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
    width: "100%",
  },
  pipelineRowTablet: {
    flexDirection: "column",
    gap: 16,
  },
  nodeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(34, 81, 214, 0.15)",
    padding: 24,
    gap: 10,
    minHeight: 180,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 16,
    fontWeight: "700",
  },
  nodeDesc: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  connector: {
    justifyContent: "center",
    alignItems: "center",
    width: 20,
  },
  connectorLine: {
    height: 2,
    width: 20,
    backgroundColor: "rgba(34, 81, 214, 0.25)",
  },
  ruleBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#E8EEFC",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 81, 214, 0.2)",
    flexWrap: "wrap",
  },
  ruleBannerText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
