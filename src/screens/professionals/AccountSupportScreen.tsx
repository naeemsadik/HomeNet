import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "UserCheck" as const, titleKey: "professionals.accountSupport.feature1Title", descKey: "professionals.accountSupport.feature1Desc" },
  { icon: "Upload" as const, titleKey: "professionals.accountSupport.feature2Title", descKey: "professionals.accountSupport.feature2Desc" },
  { icon: "FileCheck2" as const, titleKey: "professionals.accountSupport.feature3Title", descKey: "professionals.accountSupport.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.accountSupport.step1Badge", titleKey: "professionals.accountSupport.step1Title", descKey: "professionals.accountSupport.step1Desc" },
  { stepKey: "professionals.accountSupport.step2Badge", titleKey: "professionals.accountSupport.step2Title", descKey: "professionals.accountSupport.step2Desc" },
  { stepKey: "professionals.accountSupport.step3Badge", titleKey: "professionals.accountSupport.step3Title", descKey: "professionals.accountSupport.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.accountSupport.h1Val", labelKey: "professionals.accountSupport.h1Label", noteKey: "professionals.accountSupport.h1Note" },
  { valKey: "professionals.accountSupport.h2Val", labelKey: "professionals.accountSupport.h2Label", noteKey: "professionals.accountSupport.h2Note" },
  { valKey: "professionals.accountSupport.h3Val", labelKey: "professionals.accountSupport.h3Label", noteKey: "professionals.accountSupport.h3Note" },
] as const;

export function AccountSupportScreen() {
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
      badge={t("professionals.accountSupport.badge")}
      features={features}
      featuresTitle={t("professionals.accountSupport.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.accountSupport.highlightsTitle")}
      metaDescription={t("professionals.accountSupport.metaDescription")}
      metaTitle={t("professionals.accountSupport.metaTitle")}
      path="/professionals/account-support"
      primaryCta={{
        label: t("professionals.accountSupport.primaryCta"),
        href: "/contact",
      }}
      secondaryCta={{
        label: t("professionals.accountSupport.secondaryCta"),
        href: "/about",
      }}
      steps={steps}
      stepsTitle={t("professionals.accountSupport.stepsTitle")}
      subtitle={t("professionals.accountSupport.subtitle")}
      supportNotice={t("professionals.accountSupport.supportNotice")}
      title={t("professionals.accountSupport.title")}
    />
  );
}
