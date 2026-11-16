import React from "react";
import { ProfessionalLandingTemplate } from "@/components/ProfessionalLandingTemplate";
import { useTranslation } from "@/i18n";

const FEATURES_CONFIG = [
  { icon: "MessageSquare" as const, titleKey: "professionals.whatsappInquiries.feature1Title", descKey: "professionals.whatsappInquiries.feature1Desc" },
  { icon: "ShieldCheck" as const, titleKey: "professionals.whatsappInquiries.feature2Title", descKey: "professionals.whatsappInquiries.feature2Desc" },
  { icon: "Phone" as const, titleKey: "professionals.whatsappInquiries.feature3Title", descKey: "professionals.whatsappInquiries.feature3Desc" },
] as const;

const STEPS_CONFIG = [
  { stepKey: "professionals.whatsappInquiries.step1Badge", titleKey: "professionals.whatsappInquiries.step1Title", descKey: "professionals.whatsappInquiries.step1Desc" },
  { stepKey: "professionals.whatsappInquiries.step2Badge", titleKey: "professionals.whatsappInquiries.step2Title", descKey: "professionals.whatsappInquiries.step2Desc" },
  { stepKey: "professionals.whatsappInquiries.step3Badge", titleKey: "professionals.whatsappInquiries.step3Title", descKey: "professionals.whatsappInquiries.step3Desc" },
] as const;

const HIGHLIGHTS_CONFIG = [
  { valKey: "professionals.whatsappInquiries.h1Val", labelKey: "professionals.whatsappInquiries.h1Label", noteKey: "professionals.whatsappInquiries.h1Note" },
  { valKey: "professionals.whatsappInquiries.h2Val", labelKey: "professionals.whatsappInquiries.h2Label", noteKey: "professionals.whatsappInquiries.h2Note" },
  { valKey: "professionals.whatsappInquiries.h3Val", labelKey: "professionals.whatsappInquiries.h3Label", noteKey: "professionals.whatsappInquiries.h3Note" },
] as const;

export function WhatsappInquiriesScreen() {
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
      badge={t("professionals.whatsappInquiries.badge")}
      features={features}
      featuresTitle={t("professionals.whatsappInquiries.featuresTitle")}
      highlights={highlights}
      highlightsTitle={t("professionals.whatsappInquiries.highlightsTitle")}
      metaDescription={t("professionals.whatsappInquiries.metaDescription")}
      metaTitle={t("professionals.whatsappInquiries.metaTitle")}
      path="/professionals/whatsapp-inquiries"
      primaryCta={{
        label: t("professionals.whatsappInquiries.primaryCta"),
        href: "/seller",
      }}
      secondaryCta={{
        label: t("professionals.whatsappInquiries.secondaryCta"),
        href: "/about",
      }}
      steps={steps}
      stepsTitle={t("professionals.whatsappInquiries.stepsTitle")}
      subtitle={t("professionals.whatsappInquiries.subtitle")}
      supportNotice={t("professionals.whatsappInquiries.supportNotice")}
      title={t("professionals.whatsappInquiries.title")}
    />
  );
}
