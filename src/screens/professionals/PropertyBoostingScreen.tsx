import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "Rocket" as const, titleKey: "professionals.boosting.feature1Title", descKey: "professionals.boosting.feature1Desc" },
  { icon: "Zap" as const, titleKey: "professionals.boosting.feature2Title", descKey: "professionals.boosting.feature2Desc" },
  { icon: "BadgeCheck" as const, titleKey: "professionals.boosting.feature3Title", descKey: "professionals.boosting.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.boosting.step1Badge", titleKey: "professionals.boosting.step1Title", descKey: "professionals.boosting.step1Desc" },
  { stepKey: "professionals.boosting.step2Badge", titleKey: "professionals.boosting.step2Title", descKey: "professionals.boosting.step2Desc" },
  { stepKey: "professionals.boosting.step3Badge", titleKey: "professionals.boosting.step3Title", descKey: "professionals.boosting.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.boosting.h1Val", labelKey: "professionals.boosting.h1Label", noteKey: "professionals.boosting.h1Note" },
  { valKey: "professionals.boosting.h2Val", labelKey: "professionals.boosting.h2Label", noteKey: "professionals.boosting.h2Note" },
  { valKey: "professionals.boosting.h3Val", labelKey: "professionals.boosting.h3Label", noteKey: "professionals.boosting.h3Note" },
] as const;

export function PropertyBoostingScreen() {
  const { t } = useTranslation();

  const features = React.useMemo(
    () =>
      FEATURES_CONFIG.map((f) => ({
        icon: f.icon,
        title: t(f.titleKey as any),
        description: t(f.descKey as any),
      })),
    [t]
  );

  const steps = React.useMemo(
    () =>
      STEPS_CONFIG.map((s) => ({
        step: t(s.stepKey as any),
        title: t(s.titleKey as any),
        description: t(s.descKey as any),
      })),
    [t]
  );

  const highlights = React.useMemo(
    () =>
      HIGHLIGHTS_CONFIG.map((h) => ({
        value: t(h.valKey as any),
        label: t(h.labelKey as any),
        note: t(h.noteKey as any),
      })),
    [t]
  );

  return (
    <ProfessionalLandingTemplate
      badge={t("professionals.boosting.badge")}
      features={features}
      featuresTitle={t("professionals.boosting.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.boosting.highlightsTitle")}
      metaDescription={t("professionals.boosting.metaDescription")}
      metaTitle={t("professionals.boosting.metaTitle")}
      path="/professionals/boosting"
      primaryCta={{
        label: t("professionals.boosting.primaryCta"),
        href: "/property/create",
      }}
      secondaryCta={{
        label: t("professionals.boosting.secondaryCta"),
        href: "/seller",
      }}
      steps={steps}
      stepsTitle={t("professionals.boosting.stepsTitle")}
      subtitle={t("professionals.boosting.subtitle")}
      supportNotice={t("professionals.boosting.supportNotice")}
      title={t("professionals.boosting.title")}
    />
  );
}
