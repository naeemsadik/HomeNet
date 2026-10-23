import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowRight, PlusCircle, Search } from "@/components/icons";
import { router } from "expo-router";
import { AppButton } from "@/components/ui";
import { useTranslation } from "@/i18n";
import { fonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

export function JourneyTrack() {
  const { t } = useTranslation();
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

  const seekerSteps = useMemo(() => [
    {
      num: 1,
      title: t("landing.journey.step1Seeker"),
      desc: t("landing.journey.step1SeekerDesc"),
    },
    {
      num: 2,
      title: t("landing.journey.step2Seeker"),
      desc: t("landing.journey.step2SeekerDesc"),
    },
    {
      num: 3,
      title: t("landing.journey.step3Seeker"),
      desc: t("landing.journey.step3SeekerDesc"),
    },
  ], [t]);

  const ownerSteps = useMemo(() => [
    {
      num: 1,
      title: t("landing.journey.step1Owner"),
      desc: t("landing.journey.step1OwnerDesc"),
    },
    {
      num: 2,
      title: t("landing.journey.step2Owner"),
      desc: t("landing.journey.step2OwnerDesc"),
    },
    {
      num: 3,
      title: t("landing.journey.step3Owner"),
      desc: t("landing.journey.step3OwnerDesc"),
    },
  ], [t]);

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {/* Seeker Journey Track */}
      <View style={styles.trackCard}>
        <View style={styles.trackHeader}>
          <View style={styles.trackIconWrap}>
            <Search color="#75480B" size={18} strokeWidth={2.2} />
          </View>
          <Text style={styles.trackTitle}>{t("landing.journey.seekersTitle")}</Text>
        </View>

        <View style={styles.stepsList}>
          {seekerSteps.map((step, idx) => (
            <View key={step.num} style={styles.stepItem}>
              <View style={styles.nodeColumn}>
                <View style={styles.stepNode}>
                  <Text style={styles.stepNodeNum}>{step.num}</Text>
                </View>
                {idx < seekerSteps.length - 1 && <View style={styles.connectLine} />}
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
            label={t("landing.journey.exploreProperties")}
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
            <PlusCircle color="#75480B" size={18} strokeWidth={2.2} />
          </View>
          <Text style={styles.trackTitle}>{t("landing.journey.ownersTitle")}</Text>
        </View>

        <View style={styles.stepsList}>
          {ownerSteps.map((step, idx) => (
            <View key={step.num} style={styles.stepItem}>
              <View style={styles.nodeColumn}>
                <View style={styles.stepNode}>
                  <Text style={styles.stepNodeNum}>{step.num}</Text>
                </View>
                {idx < ownerSteps.length - 1 && <View style={styles.connectLine} />}
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
            label={t("landing.journey.listYourProperty")}
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
    backgroundColor: "#F9F4EB",
    alignItems: "center",
    justifyContent: "center",
  },
  trackTitle: {
    color: "#1A1612",
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
    backgroundColor: "#F9F4EB",
    borderWidth: 1,
    borderColor: "#8D5C12",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepNodeNum: {
    color: "#75480B",
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
  },
  connectLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: "rgba(141, 92, 18, 0.25)",
  },
  stepContent: {
    flex: 1,
    paddingBottom: 22,
    gap: 4,
  },
  stepTitle: {
    color: "#1A1612",
    fontFamily: fonts.headingBold,
    fontSize: 15,
    fontWeight: "700",
  },
  stepDesc: {
    color: "#6E6458",
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
  },
  trackCta: {
    alignItems: "flex-start",
  },
});
