import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "Layers" as const, titleKey: "professionals.advertise.feature1Title", descKey: "professionals.advertise.feature1Desc" },
  { icon: "MapPin" as const, titleKey: "professionals.advertise.feature2Title", descKey: "professionals.advertise.feature2Desc" },
  { icon: "Building" as const, titleKey: "professionals.advertise.feature3Title", descKey: "professionals.advertise.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.advertise.step1Badge", titleKey: "professionals.advertise.step1Title", descKey: "professionals.advertise.step1Desc" },
  { stepKey: "professionals.advertise.step2Badge", titleKey: "professionals.advertise.step2Title", descKey: "professionals.advertise.step2Desc" },
  { stepKey: "professionals.advertise.step3Badge", titleKey: "professionals.advertise.step3Title", descKey: "professionals.advertise.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.advertise.h1Val", labelKey: "professionals.advertise.h1Label", noteKey: "professionals.advertise.h1Note" },
  { valKey: "professionals.advertise.h2Val", labelKey: "professionals.advertise.h2Label", noteKey: "professionals.advertise.h2Note" },
  { valKey: "professionals.advertise.h3Val", labelKey: "professionals.advertise.h3Label", noteKey: "professionals.advertise.h3Note" },
] as const;

export function AdvertiseScreen() {
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
      badge={t("professionals.advertise.badge")}
      features={features}
      featuresTitle={t("professionals.advertise.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.advertise.highlightsTitle")}
      metaDescription={t("professionals.advertise.metaDescription")}
      metaTitle={t("professionals.advertise.metaTitle")}
      path="/professionals/advertise"
      primaryCta={{
        label: t("professionals.advertise.primaryCta"),
        href: "/contact",
      }}
      secondaryCta={{
        label: t("professionals.advertise.secondaryCta"),
        href: "/about",
      }}
      steps={steps}
      stepsTitle={t("professionals.advertise.stepsTitle")}
      subtitle={t("professionals.advertise.subtitle")}
      supportNotice={t("professionals.advertise.supportNotice")}
      title={t("professionals.advertise.title")}
    />
  );
}
