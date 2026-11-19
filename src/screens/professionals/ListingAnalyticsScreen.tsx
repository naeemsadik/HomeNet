import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "BarChart3" as const, titleKey: "professionals.analytics.feature1Title", descKey: "professionals.analytics.feature1Desc" },
  { icon: "LineChart" as const, titleKey: "professionals.analytics.feature2Title", descKey: "professionals.analytics.feature2Desc" },
  { icon: "Globe" as const, titleKey: "professionals.analytics.feature3Title", descKey: "professionals.analytics.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.analytics.step1Badge", titleKey: "professionals.analytics.step1Title", descKey: "professionals.analytics.step1Desc" },
  { stepKey: "professionals.analytics.step2Badge", titleKey: "professionals.analytics.step2Title", descKey: "professionals.analytics.step2Desc" },
  { stepKey: "professionals.analytics.step3Badge", titleKey: "professionals.analytics.step3Title", descKey: "professionals.analytics.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.analytics.h1Val", labelKey: "professionals.analytics.h1Label", noteKey: "professionals.analytics.h1Note" },
  { valKey: "professionals.analytics.h2Val", labelKey: "professionals.analytics.h2Label", noteKey: "professionals.analytics.h2Note" },
  { valKey: "professionals.analytics.h3Val", labelKey: "professionals.analytics.h3Label", noteKey: "professionals.analytics.h3Note" },
] as const;

export function ListingAnalyticsScreen() {
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
      badge={t("professionals.analytics.badge")}
      features={features}
      featuresTitle={t("professionals.analytics.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.analytics.highlightsTitle")}
      metaDescription={t("professionals.analytics.metaDescription")}
      metaTitle={t("professionals.analytics.metaTitle")}
      path="/professionals/analytics"
      primaryCta={{
        label: t("professionals.analytics.primaryCta"),
        href: "/seller",
      }}
      secondaryCta={{
        label: t("professionals.analytics.secondaryCta"),
        href: "/resources/property-price-index",
      }}
      steps={steps}
      stepsTitle={t("professionals.analytics.stepsTitle")}
      subtitle={t("professionals.analytics.subtitle")}
      supportNotice={t("professionals.analytics.supportNotice")}
      title={t("professionals.analytics.title")}
    />
  );
}
