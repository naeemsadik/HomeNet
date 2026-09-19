import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Bot,
  Building,
  CheckCircle2,
  Compass,
  Home,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react-native";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

interface EcosystemDiagramProps {
  activeCount?: number;
  areasCount?: number;
}

export function EcosystemDiagram({
  activeCount = 0,
  areasCount = 0,
}: EcosystemDiagramProps) {
  const { isTablet, isPhone } = useResponsive();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.diagramWrap,
          isTablet && styles.diagramWrapTablet,
        ]}
      >
        {/* Node 1: Owners */}
        <View style={styles.node}>
          <View style={styles.nodeIconWrap}>
            <Home color="#0F6D55" size={24} strokeWidth={2.2} />
          </View>
          <Text style={styles.nodeTitle}>Property Owners</Text>
          <Text style={styles.nodeSub}>Individual sellers & landlords</Text>
          <View style={styles.nodePill}>
            <Text style={styles.nodePillText}>0 BDT listing fee</Text>
          </View>
        </View>

        {/* Flow Connector 1 */}
        <View style={[styles.arrowWrap, isTablet && styles.arrowWrapTablet]}>
          <Text style={styles.flowLabel}>AI Listing & Review</Text>
          <ArrowRight
            color="#04cf92"
            size={isTablet ? 18 : 20}
            strokeWidth={2.5}
            style={isTablet ? { transform: [{ rotate: "90deg" }] } : undefined}
          />
        </View>

        {/* Central Core: HomeNet Platform */}
        <LinearGradient
          colors={["#0B1A17", "#0F6D55"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coreNode}
        >
          <View style={styles.coreIconWrap}>
            <ShieldCheck color="#FFFFFF" size={28} strokeWidth={2.2} />
          </View>
          <Text style={styles.coreTitle}>HomeNet Engine</Text>
          <Text style={styles.coreSpecs}>
            {activeCount > 0 ? `${activeCount} Verified Listings` : "Verified Marketplace"}
          </Text>
          <Text style={styles.coreSub}>
            {areasCount > 0
              ? `Completeness checks · 2-level ${areasCount} Dhaka areas`
              : "Completeness checks · Two-level Dhaka area hierarchy"}
          </Text>
        </LinearGradient>

        {/* Flow Connector 2 */}
        <View style={[styles.arrowWrap, isTablet && styles.arrowWrapTablet]}>
          <Text style={styles.flowLabel}>Direct Discovery</Text>
          <ArrowRight
            color="#04cf92"
            size={isTablet ? 18 : 20}
            strokeWidth={2.5}
            style={isTablet ? { transform: [{ rotate: "90deg" }] } : undefined}
          />
        </View>

        {/* Node 2: Seekers */}
        <View style={styles.node}>
          <View style={styles.nodeIconWrap}>
            <Users color="#0F6D55" size={24} strokeWidth={2.2} />
          </View>
          <Text style={styles.nodeTitle}>Property Seekers</Text>
          <Text style={styles.nodeSub}>Buyers & tenants across Bangladesh</Text>
          <View style={styles.nodePill}>
            <Text style={styles.nodePillText}>0% broker commission</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  diagramWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 32,
    gap: 12,
  },
  diagramWrapTablet: {
    flexDirection: "column",
    gap: 18,
    padding: 24,
  },
  node: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
    minWidth: 180,
  },
  nodeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  nodeSub: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12.5,
    textAlign: "center",
  },
  nodePill: {
    backgroundColor: "rgba(4, 207, 146, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },
  nodePillText: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: "700",
  },
  arrowWrap: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
  },
  arrowWrapTablet: {
    paddingVertical: 4,
  },
  flowLabel: {
    color: "#8C9A95",
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    fontWeight: "600",
    textAlign: "center",
  },
  coreNode: {
    flex: 1.2,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
    minWidth: 200,
    shadowColor: "rgba(11, 26, 23, 0.2)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  coreIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  coreTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.headingExtraBold,
    fontSize: 18,
    fontWeight: "800",
  },
  coreSpecs: {
    color: "#04cf92",
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  coreSub: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
});
