import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "BadgeCheck" as const, titleKey: "professionals.verifiedAgency.feature1Title", descKey: "professionals.verifiedAgency.feature1Desc" },
  { icon: "TrendingUp" as const, titleKey: "professionals.verifiedAgency.feature2Title", descKey: "professionals.verifiedAgency.feature2Desc" },
  { icon: "Store" as const, titleKey: "professionals.verifiedAgency.feature3Title", descKey: "professionals.verifiedAgency.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.verifiedAgency.step1Badge", titleKey: "professionals.verifiedAgency.step1Title", descKey: "professionals.verifiedAgency.step1Desc" },
  { stepKey: "professionals.verifiedAgency.step2Badge", titleKey: "professionals.verifiedAgency.step2Title", descKey: "professionals.verifiedAgency.step2Desc" },
  { stepKey: "professionals.verifiedAgency.step3Badge", titleKey: "professionals.verifiedAgency.step3Title", descKey: "professionals.verifiedAgency.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.verifiedAgency.h1Val", labelKey: "professionals.verifiedAgency.h1Label", noteKey: "professionals.verifiedAgency.h1Note" },
  { valKey: "professionals.verifiedAgency.h2Val", labelKey: "professionals.verifiedAgency.h2Label", noteKey: "professionals.verifiedAgency.h2Note" },
  { valKey: "professionals.verifiedAgency.h3Val", labelKey: "professionals.verifiedAgency.h3Label", noteKey: "professionals.verifiedAgency.h3Note" },
] as const;

export function VerifiedAgencyScreen() {
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
      badge={t("professionals.verifiedAgency.badge")}
      features={features}
      featuresTitle={t("professionals.verifiedAgency.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.verifiedAgency.highlightsTitle")}
      metaDescription={t("professionals.verifiedAgency.metaDescription")}
      metaTitle={t("professionals.verifiedAgency.metaTitle")}
      path="/professionals/verified-agency"
      primaryCta={{
        label: t("professionals.verifiedAgency.primaryCta"),
        href: "/property/create",
      }}
      secondaryCta={{
        label: t("professionals.verifiedAgency.secondaryCta"),
        href: "/contact",
      }}
      steps={steps}
      stepsTitle={t("professionals.verifiedAgency.stepsTitle")}
      subtitle={t("professionals.verifiedAgency.subtitle")}
      supportNotice={t("professionals.verifiedAgency.supportNotice")}
      title={t("professionals.verifiedAgency.title")}
    />
  );
}
