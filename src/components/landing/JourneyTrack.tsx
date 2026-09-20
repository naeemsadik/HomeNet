import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowRight, PlusCircle, Search } from "lucide-react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { landingCopy } from "@/content/landingCopy";

export function JourneyTrack() {
  const { isTablet } = useResponsive();
  const user = useAuthStore((s) => s.user);

  const handleListProperty = () => {
    if (!user) {
      useAuthModalStore.getState().open(() => {
        router.push("/property/create" as any);
      });
    } else {
      router.push("/property/create" as any);
    }
  };

  const { seekers, owners } = landingCopy.howItWorks;

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {/* Seeker Journey Track */}
      <View style={styles.trackCard}>
        <View style={styles.trackHeader}>
          <View style={styles.trackIconWrap}>
            <Search color="#0F6D55" size={18} strokeWidth={2.2} />
          </View>
          <Text style={styles.trackTitle}>{seekers.title}</Text>
        </View>

        <View style={styles.stepsList}>
          {seekers.steps.map((step, idx) => (
            <View key={step.num} style={styles.stepItem}>
              <View style={styles.nodeColumn}>
                <View style={styles.stepNode}>
                  <Text style={styles.stepNodeNum}>{step.num}</Text>
                </View>
                {idx < seekers.steps.length - 1 && <View style={styles.connectLine} />}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.trackCta}>
          <AppButton
            icon={Search}
            label="Explore properties"
            onPress={() => router.push("/buy" as any)}
            trailingIcon={ArrowRight}
            variant="secondary"
          />
        </View>
      </View>

      {/* Owner Journey Track */}
      <View style={styles.trackCard}>
        <View style={styles.trackHeader}>
          <View style={styles.trackIconWrap}>
            <PlusCircle color="#0F6D55" size={18} strokeWidth={2.2} />
          </View>
          <Text style={styles.trackTitle}>{owners.title}</Text>
        </View>

        <View style={styles.stepsList}>
          {owners.steps.map((step, idx) => (
            <View key={step.num} style={styles.stepItem}>
              <View style={styles.nodeColumn}>
                <View style={styles.stepNode}>
                  <Text style={styles.stepNodeNum}>{step.num}</Text>
                </View>
                {idx < owners.steps.length - 1 && <View style={styles.connectLine} />}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.trackCta}>
          <AppButton
            icon={PlusCircle}
            label="List your property"
            onPress={handleListProperty}
            trailingIcon={ArrowRight}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 24,
    width: "100%",
  },
  containerTablet: {
    flexDirection: "column",
    gap: 20,
  },
  trackCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 28,
    justifyContent: "space-between",
  },
  trackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  trackIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  trackTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 18,
    fontWeight: "700",
  },
  stepsList: {
    gap: 0,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: "row",
    gap: 16,
  },
  nodeColumn: {
    alignItems: "center",
    width: 32,
  },
  stepNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E6FAF4",
    borderWidth: 1,
    borderColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepNodeNum: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
  },
  connectLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: "rgba(4, 207, 146, 0.25)",
  },
  stepContent: {
    flex: 1,
    paddingBottom: 22,
    gap: 4,
  },
  stepTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 15,
    fontWeight: "700",
  },
  stepDesc: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
  },
  trackCta: {
    alignItems: "flex-start",
  },
});
