import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, ChevronDown, MapPin } from "@/components/icons";
import { AppChrome } from "@/components/AppChrome";
import { AreaPicker } from "@/components/AreaPicker";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqPageSchema, valuationToolSchema, VALUATION_FAQ } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { colorTokens, fonts, radius, webPointer, brandButtonState } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { useInstantValuation } from "../hooks/useInstantValuation";
import { InstantValuationWizard } from "../components/InstantValuationWizard";
import type { ValuationPropertyType, ValuationPurpose } from "../types/valuationTypes";

const PAGE_PATH = "/instant-valuation";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

/** Home › Instant Property Valuation. */
const PAGE_CRUMBS = [
  { name: "Home", url: `${SITE_URL}/` },
  { name: "Instant Property Valuation", url: PAGE_URL },
];

/**
 * The valuation page, laid out the way a big portal's valuation page is: one question up front
 * (here the area, which sets most of a Bangladeshi price), a short "how it works", the two ways
 * forward, the questions people ask, and a way to list. Next opens the step-by-step estimate in
 * place of the first question.
 */
export function InstantValuationScreen() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { setInitialFromHero, setFormField } = useInstantValuation();
  const params = useLocalSearchParams<{ area?: string; areaId?: string; purpose?: string; type?: string }>();

  // The area chosen on this page; the wizard starts once Next is pressed with one.
  const [areaName, setAreaName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [startedHere, setStartedHere] = useState(false);
  // From the home page's search card the area is already chosen, so the steps open straight away.
  const started = startedHere || Boolean(params.area);
  const [showAreaError, setShowAreaError] = useState(false);

  // A link's area, purpose and type fill the steps' first answers.
  useEffect(() => {
    if (params.area || params.purpose || params.type) {
      setInitialFromHero({
        areaName: params.area,
        areaId: params.areaId,
        purpose: (params.purpose as ValuationPurpose) || "sale",
        propertyType: (params.type as ValuationPropertyType) || "apartment",
      });
    }
  }, [params.area, params.areaId, params.purpose, params.type, setInitialFromHero]);

  const start = () => {
    if (!areaName) {
      setShowAreaError(true);
      return;
    }
    setInitialFromHero({ areaName, areaId: areaId || undefined });
    setFormField("address", `${areaName}, Dhaka`);
    setStartedHere(true);
  };

  const steps = [t("valuation.landing.step1"), t("valuation.landing.step2"), t("valuation.landing.step3")];
  const factors = [
    t("valuation.landing.factorArea"),
    t("valuation.landing.factorSize"),
    t("valuation.landing.factorRoad"),
    t("valuation.landing.factorFloor"),
    t("valuation.landing.factorPapers"),
    t("valuation.landing.factorUtilities"),
  ];

  return (
    <AppChrome active="valuation">
      <JsonLd nodes={[valuationToolSchema(PAGE_PATH), breadcrumbSchema(PAGE_CRUMBS), faqPageSchema(VALUATION_FAQ, PAGE_URL)]} />

      {/* Hero: the one question, beside what the estimate looks at. */}
      <View style={styles.heroBand}>
        <View style={[styles.inner, styles.heroInner, isPhone && styles.heroInnerPhone]}>
          <View style={[styles.heroMain, started && styles.heroMainStarted]}>
            <Text accessibilityRole="header" aria-level={1} style={[styles.h1, isPhone && styles.h1Phone]}>
              {t("valuation.landing.title")}
            </Text>
            <Text style={styles.lead}>{t("valuation.landing.subtitle")}</Text>

            {started ? null : (
              <View style={styles.askCard}>
                <Text nativeID="valuation-area-label" style={styles.askLabel}>
                  {t("valuation.landing.areaLabel")}
                </Text>
                <View style={[styles.askRow, isPhone && styles.askRowPhone]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t("valuation.landing.areaLabel")}: ${areaName || t("valuation.landing.areaPlaceholder")}`}
                    onPress={() => setPickerOpen(true)}
                    style={({ hovered }: any) => [
                      styles.areaField,
                      showAreaError && !areaName && styles.areaFieldError,
                      hovered && styles.areaFieldHovered,
                      webPointer,
                    ]}
                  >
                    <MapPin color={colorTokens.brandText} size={18} strokeWidth={2.2} />
                    <Text numberOfLines={1} style={[styles.areaText, !areaName && styles.areaPlaceholder]}>
                      {areaName || t("valuation.landing.areaPlaceholder")}
                    </Text>
                    <ChevronDown color={colorTokens.muted} size={18} strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={start}
                    style={({ hovered, pressed }: any) => [
                      styles.nextBtn,
                      isPhone && styles.nextBtnPhone,
                      hovered && styles.nextBtnHovered,
                      pressed && styles.pressed,
                      webPointer,
                    ]}
                  >
                    <Text style={styles.nextText}>{t("valuation.landing.next")}</Text>
                    <ArrowRight color={colorTokens.onBrand} size={18} strokeWidth={2.4} />
                  </Pressable>
                </View>
                {showAreaError && !areaName ? (
                  <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                    {t("valuation.landing.areaRequired")}
                  </Text>
                ) : (
                  <Text style={styles.helper}>{t("valuation.landing.areaHelper")}</Text>
                )}
              </View>
            )}
          </View>

          {started || isPhone ? null : (
            <View style={styles.factorCard}>
              <Text style={styles.factorTitle}>{t("valuation.landing.factorsTitle")}</Text>
              {factors.map((factor, index) => (
                <View key={factor} style={styles.factorRow}>
                  <View style={[styles.factorDot, index === 0 && styles.factorDotMain]} />
                  <Text style={[styles.factorText, index === 0 && styles.factorTextMain]}>{factor}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {started ? (
        <View style={[styles.inner, styles.wizardWrap]}>
          <InstantValuationWizard />
        </View>
      ) : null}

      <View style={[styles.inner, styles.sections, isPhone && styles.sectionsPhone]}>
        {/* How does it work? */}
        <View style={styles.section}>
          <Text accessibilityRole="header" aria-level={2} style={styles.h2}>
            {t("valuation.landing.howTitle")}
          </Text>
          <View style={[styles.stepsRow, isPhone && styles.stepsCol]}>
            {steps.map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>{t("valuation.landing.howNote")}</Text>
        </View>

        {/* The two ways forward. */}
        <View style={styles.section}>
          <Text accessibilityRole="header" aria-level={2} style={styles.h2}>
            {t("valuation.landing.optionsTitle")}
          </Text>
          <View style={[styles.optionsRow, isPhone && styles.optionsCol]}>
            <View style={styles.optionCard}>
              <Text accessibilityRole="header" aria-level={3} style={styles.h3}>
                {t("valuation.landing.instantTitle")}
              </Text>
              <Text style={styles.body}>{t("valuation.landing.instantDesc")}</Text>
              {/* Once the steps are open above, this would only repeat them. */}
              {started ? null : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPickerOpen(true)}
                  style={({ hovered }: any) => [styles.outlineBtn, hovered && styles.outlineBtnHovered, webPointer]}
                >
                  <Text style={styles.outlineText}>{t("valuation.landing.instantCta")}</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.optionCard}>
              <Text accessibilityRole="header" aria-level={3} style={styles.h3}>
                {t("valuation.landing.listTitle")}
              </Text>
              <Text style={styles.body}>{t("valuation.landing.listDesc")}</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/sell" as never)}
                style={({ hovered }: any) => [styles.outlineBtn, hovered && styles.outlineBtnHovered, webPointer]}
              >
                <Text style={styles.outlineText}>{t("valuation.landing.listCta")}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* The questions behind the FAQPage markup above. Google accepts that markup only while the
            same text is on the page, so a closed answer is hidden, not left out. */}
        <View style={styles.section}>
          <Text accessibilityRole="header" aria-level={2} style={styles.h2}>
            {t("valuation.landing.faqTitle")}
          </Text>
          <View style={styles.faqList}>
            {VALUATION_FAQ.map((entry) => (
              <FaqItem key={entry.question} question={entry.question} answer={entry.answer} />
            ))}
          </View>
        </View>

        {/* Closing band. */}
        <View style={[styles.ctaBand, isPhone && styles.ctaBandPhone]}>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>{t("valuation.landing.ctaTitle")}</Text>
            <Text style={styles.ctaBody}>{t("valuation.landing.ctaBody")}</Text>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/sell" as never)}
            style={({ hovered, pressed }: any) => [
              styles.nextBtn,
              hovered && styles.nextBtnHovered,
              pressed && styles.pressed,
              webPointer,
            ]}
          >
            <Text style={styles.nextText}>{t("valuation.landing.ctaButton")}</Text>
          </Pressable>
        </View>
      </View>

      <AreaPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedArea={null}
        onSelect={(area) => {
          setPickerOpen(false);
          if (!area) return;
          setAreaName(area.name);
          setAreaId(area.id);
          setShowAreaError(false);
        }}
      />
    </AppChrome>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <Pressable
        accessibilityRole="button"
        aria-expanded={open}
        onPress={() => setOpen((value) => !value)}
        style={[styles.faqHeader, webPointer]}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <View style={open ? styles.chevronOpen : undefined}>
          <ChevronDown color={colorTokens.ink} size={20} strokeWidth={2.2} />
        </View>
      </Pressable>
      {/* Kept on the web page while closed (hidden), so the FAQ markup matches visible text. */}
      {open || Platform.OS === "web" ? (
        <Text style={[styles.faqAnswer, !open && styles.hidden]}>{answer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { width: "100%", maxWidth: 1100, alignSelf: "center", paddingHorizontal: 24 },
  heroBand: { width: "100%", backgroundColor: colorTokens.brandSurface, paddingVertical: 48, borderRadius: radius.lg },
  heroInner: { flexDirection: "row", alignItems: "center", gap: 48 },
  heroInnerPhone: { flexDirection: "column", alignItems: "stretch", gap: 24, paddingHorizontal: 16 },
  heroMain: { flex: 1, minWidth: 0, gap: 16 },
  heroMainStarted: { maxWidth: 760 },
  h1: { fontFamily: fonts.headingBold, fontSize: 40, lineHeight: 48, color: colorTokens.ink, letterSpacing: -0.6 },
  h1Phone: { fontSize: 28, lineHeight: 34 },
  lead: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: colorTokens.body, maxWidth: 620 },
  askCard: {
    marginTop: 8,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
  },
  askLabel: { fontFamily: fonts.bold, fontSize: 15, color: colorTokens.ink },
  askRow: { flexDirection: "row", gap: 12, alignItems: "stretch" },
  askRowPhone: { flexDirection: "column" },
  areaField: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.2)",
    backgroundColor: colorTokens.surface,
  },
  areaFieldHovered: { borderColor: colorTokens.brand },
  areaFieldError: { borderColor: colorTokens.errorText },
  areaText: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colorTokens.ink },
  areaPlaceholder: { color: colorTokens.muted, fontFamily: fonts.regular },
  nextBtn: {
    minHeight: 52,
    paddingHorizontal: 28,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnPhone: { alignSelf: "stretch" },
  nextBtnHovered: brandButtonState.hovered,
  pressed: brandButtonState.pressed,
  nextText: { fontFamily: fonts.bold, fontSize: 16, color: colorTokens.onBrand },
  helper: { fontFamily: fonts.regular, fontSize: 13, color: colorTokens.muted },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.errorText },
  factorCard: {
    width: 320,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
  },
  factorTitle: { fontFamily: fonts.bold, fontSize: 16, color: colorTokens.ink, marginBottom: 4 },
  factorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  factorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colorTokens.brandBorder },
  factorDotMain: { backgroundColor: colorTokens.brand, width: 10, height: 10, borderRadius: 5 },
  factorText: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.body, flex: 1 },
  factorTextMain: { fontFamily: fonts.bold, color: colorTokens.ink },
  wizardWrap: { paddingTop: 32, paddingBottom: 8 },
  sections: { paddingVertical: 48, gap: 56 },
  sectionsPhone: { paddingVertical: 32, gap: 40, paddingHorizontal: 16 },
  section: { gap: 20 },
  h2: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 32, color: colorTokens.ink, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.bold, fontSize: 18, color: colorTokens.ink },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colorTokens.body },
  stepsRow: { flexDirection: "row", gap: 24 },
  stepsCol: { flexDirection: "column", gap: 16 },
  stepItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  stepNum: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorTokens.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontFamily: fonts.bold, fontSize: 16, color: colorTokens.surface },
  stepText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22, color: colorTokens.ink },
  note: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colorTokens.muted },
  optionsRow: { flexDirection: "row", gap: 20 },
  optionsCol: { flexDirection: "column" },
  optionCard: {
    flex: 1,
    gap: 12,
    padding: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  outlineBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colorTokens.ink,
    justifyContent: "center",
  },
  outlineBtnHovered: { backgroundColor: colorTokens.surfaceSunken },
  outlineText: { fontFamily: fonts.bold, fontSize: 15, color: colorTokens.ink },
  faqList: { borderTopWidth: 1, borderTopColor: colorTokens.divider },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colorTokens.divider },
  faqHeader: { minHeight: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  faqQuestion: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colorTokens.ink },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  faqAnswer: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colorTokens.body, paddingBottom: 18 },
  hidden: { display: "none" },
  ctaBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    padding: 28,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.brandSurface,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
  },
  ctaBandPhone: { flexDirection: "column", alignItems: "stretch" },
  ctaText: { flex: 1, gap: 6 },
  ctaTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colorTokens.ink },
  ctaBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colorTokens.body },
});
