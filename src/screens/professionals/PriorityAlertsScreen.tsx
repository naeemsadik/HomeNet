import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "MessageSquare" as const, titleKey: "professionals.priorityAlerts.feature1Title", descKey: "professionals.priorityAlerts.feature1Desc" },
  { icon: "MapPin" as const, titleKey: "professionals.priorityAlerts.feature2Title", descKey: "professionals.priorityAlerts.feature2Desc" },
  { icon: "Sliders" as const, titleKey: "professionals.priorityAlerts.feature3Title", descKey: "professionals.priorityAlerts.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.priorityAlerts.step1Badge", titleKey: "professionals.priorityAlerts.step1Title", descKey: "professionals.priorityAlerts.step1Desc" },
  { stepKey: "professionals.priorityAlerts.step2Badge", titleKey: "professionals.priorityAlerts.step2Title", descKey: "professionals.priorityAlerts.step2Desc" },
  { stepKey: "professionals.priorityAlerts.step3Badge", titleKey: "professionals.priorityAlerts.step3Title", descKey: "professionals.priorityAlerts.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.priorityAlerts.h1Val", labelKey: "professionals.priorityAlerts.h1Label", noteKey: "professionals.priorityAlerts.h1Note" },
  { valKey: "professionals.priorityAlerts.h2Val", labelKey: "professionals.priorityAlerts.h2Label", noteKey: "professionals.priorityAlerts.h2Note" },
  { valKey: "professionals.priorityAlerts.h3Val", labelKey: "professionals.priorityAlerts.h3Label", noteKey: "professionals.priorityAlerts.h3Note" },
] as const;

export function PriorityAlertsScreen() {
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
      badge={t("professionals.priorityAlerts.badge")}
      features={features}
      featuresTitle={t("professionals.priorityAlerts.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.priorityAlerts.highlightsTitle")}
      metaDescription={t("professionals.priorityAlerts.metaDescription")}
      metaTitle={t("professionals.priorityAlerts.metaTitle")}
      path="/professionals/priority-alerts"
      primaryCta={{
        label: t("professionals.priorityAlerts.primaryCta"),
        href: "/property/create",
      }}
      secondaryCta={{
        label: t("professionals.priorityAlerts.secondaryCta"),
        href: "/seller",
      }}
      steps={steps}
      stepsTitle={t("professionals.priorityAlerts.stepsTitle")}
      subtitle={t("professionals.priorityAlerts.subtitle")}
      supportNotice={t("professionals.priorityAlerts.supportNotice")}
      title={t("professionals.priorityAlerts.title")}
    />
  );
}
