import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "@/components/icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppButton, AppLink, Eyebrow, FeatureCard, SectionHeader, SelectField } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, colors, fonts, shadow } from "@/theme";

import { useTranslation } from "@/i18n";

export function SellScreen() {
  const { t } = useTranslation();
  const { isPhone, isTablet, isCompact } = useResponsive();
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [submitted, setSubmitted] = useState(false);

  const propertyTypeOptions = [
    t("sellScreen.propertyTypes.apartment"),
    t("sellScreen.propertyTypes.house"),
    t("sellScreen.propertyTypes.condo"),
    t("sellScreen.propertyTypes.commercial"),
  ];

  return (
    <AppChrome active="sell">
      <LinearGradient colors={["#075C46", "#086B55", "#365FB7"]} end={{ x: 1, y: 0 }} style={[styles.hero, isTablet && styles.heroTablet, isPhone && styles.heroPhone]}>
        <View style={styles.heroCopyWrap}>
          <View style={styles.heroKicker}><Sparkles color="rgba(255,255,255,0.82)" size={14} /><Eyebrow light>{t("sellScreen.kicker")}</Eyebrow></View>
          <Text style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}>{t("sellScreen.heroTitle")}</Text>
          <Text style={styles.heroCopy}>{t("sellScreen.heroCopy")}</Text>
          <View style={styles.proofRow}>
            <View style={styles.proofItem}><ShieldCheck color="rgba(255,255,255,0.86)" size={16} /><Text style={styles.proofText}>{t("sellScreen.verifiedInquiries")}</Text></View>
            <View style={styles.proofItem}><Clock3 color="rgba(255,255,255,0.86)" size={16} /><Text style={styles.proofText}>{t("sellScreen.fasterShortlists")}</Text></View>
          </View>
        </View>
        <View style={[styles.valuationCard, isPhone && styles.valuationCardPhone]}>
          <View style={styles.valuationHead}>
            <View style={styles.valuationIcon}><BarChart3 color={colorTokens.onBrand} size={20} /></View>
            <View style={styles.valuationHeadText}><Text style={styles.valuationTitle}>{t("sellScreen.valuationTitle")}</Text><Text style={styles.valuationCopy}>{t("sellScreen.valuationCopy")}</Text></View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{t("sellScreen.addressLabel")}</Text>
            <View style={styles.inputShell}><MapPin color={colors.green} size={16} /><TextInput onChangeText={setAddress} placeholder={t("sellScreen.addressPlaceholder")} placeholderTextColor="#899790" style={styles.input} value={address} /></View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{t("sellScreen.propertyTypeLabel")}</Text>
            <View style={styles.inputShell}><Building2 color={colors.green} size={16} /><SelectField onChange={setPropertyType} options={propertyTypeOptions} style={styles.propertySelect} value={propertyType} /></View>
          </View>
          <AppButton
            label={t("sellScreen.getEstimate")}
            onPress={() => setSubmitted(true)}
            trailingIcon={ArrowRight}
            style={styles.submitButton}
          />
          {submitted ? <View style={styles.valuationResult}><CheckCircle2 color={colors.greenDark} size={15} /><Text style={styles.valuationResultText}>{t("sellScreen.valuationResult", { address: address || t("sellScreen.defaultProperty") })}</Text></View> : null}
        </View>
      </LinearGradient>

      <View style={styles.processSection}>
        <SectionHeader eyebrow={t("sellScreen.processEyebrow")} right={<View />} title={t("sellScreen.processTitle")} />
        <View style={[styles.stepGrid, isPhone && styles.stepGridPhone]}>
          {[
            [BarChart3, t("sellScreen.step1Title"), t("sellScreen.step1Copy")],
            [BadgeCheck, t("sellScreen.step2Title"), t("sellScreen.step2Copy")],
            [ShieldCheck, t("sellScreen.step3Title"), t("sellScreen.step3Copy")],
          ].map(([Icon, title, copy], index) => (
            <FeatureCard
              key={title as string}
              icon={Icon as LucideIcon}
              title={title as string}
              description={copy as string}
              step={`0${index + 1}`}
              iconSize={21}
              style={styles.stepCard}
              iconWrapStyle={styles.stepIcon}
              titleStyle={styles.stepTitle}
              descriptionStyle={styles.stepCopy}
              stepStyle={styles.stepNumber}
            />
          ))}
        </View>
      </View>

      <LinearGradient colors={["#EEF8F3", "#EFF3FB"]} end={{ x: 1, y: 0 }} style={[styles.insightCard, isCompact && styles.insightCardCompact, isPhone && styles.insightCardPhone]}>
        <View style={styles.insightCopyWrap}>
          <Eyebrow style={styles.insightEyebrow}>{t("sellScreen.intelEyebrow")}</Eyebrow>
          <Text style={styles.insightTitle}>{t("sellScreen.intelTitle")}</Text>
          <Text style={styles.insightCopy}>{t("sellScreen.intelCopy")}</Text>
          <AppLink href="/market" style={styles.insightLink}><Text style={styles.insightLinkText}>{t("sellScreen.openMarket")}</Text><ArrowRight color={colors.green} size={15} /></AppLink>
        </View>
        <View style={[styles.stats, isPhone && styles.statsPhone]}>
          {[
            [t("sellScreen.statFee"), t("sellScreen.statFeeVal"), t("sellScreen.statFeeSub")],
            [t("sellScreen.statVerif"), t("sellScreen.statVerifVal"), t("sellScreen.statVerifSub")],
            [t("sellScreen.statContact"), t("sellScreen.statContactVal"), t("sellScreen.statContactSub")],
          ].map(([label, value, detail]) => <View key={label} style={[styles.statCard, isPhone && styles.statCardPhone]}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statDetail}>{detail}</Text></View>)}
        </View>
      </LinearGradient>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 480, flexDirection: "row", alignItems: "center", gap: 70, overflow: "hidden", padding: 72, borderRadius: 24 },
  heroTablet: { flexDirection: "column", alignItems: "stretch", gap: 30 },
  heroPhone: { minHeight: 0, paddingHorizontal: 20, paddingVertical: 30, borderRadius: 19 },
  heroCopyWrap: { flex: 1.1 },
  heroKicker: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 13 },
  heroTitle: { maxWidth: 560, color: colors.white, fontFamily: fonts.bold, fontSize: 50, lineHeight: 54, letterSpacing: -0.5 },
  heroTitlePhone: { fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  heroCopy: { maxWidth: 510, marginTop: 17, marginBottom: 24, color: "rgba(255,255,255,0.85)", fontFamily: fonts.regular, fontSize: 15, lineHeight: 24 },
  proofRow: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  proofItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  proofText: { color: "rgba(255,255,255,0.92)", fontFamily: fonts.semiBold, fontSize: 14 },
  valuationCard: { flex: 0.9, gap: 14, padding: 24, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.98)", borderWidth: 1, borderColor: "rgba(255,255,255,0.72)", ...shadow },
  valuationCardPhone: { padding: 18 },
  valuationHead: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 3 },
  valuationIcon: { width: 41, height: 41, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.green },
  valuationHeadText: { flex: 1, minWidth: 0 },
  valuationTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 16 },
  valuationCopy: { marginTop: 3, color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  formGroup: { gap: 6 },
  formLabel: { color: "#52675E", fontFamily: fonts.extraBold, fontSize: 13 },
  inputShell: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  input: { minWidth: 0, flex: 1, height: 42, color: colors.ink, fontFamily: fonts.regular, fontSize: 14 },
  propertySelect: { minWidth: 0, flex: 1 },
  submitButton: { width: "100%", minHeight: 48 },
  valuationResult: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 12, borderRadius: 10, backgroundColor: colors.greenLight },
  valuationResultText: { flex: 1, color: colors.greenDark, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  processSection: { marginTop: 54 },
  stepGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15 },
  stepGridPhone: { flexDirection: "column" },
  stepCard: { position: "relative", minWidth: 200, flex: 1, overflow: "hidden", padding: 23, borderRadius: 15, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  stepNumber: { position: "absolute", top: 13, right: 16, color: "#D8E4DE", fontFamily: fonts.extraBold, fontSize: 20 },
  stepIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.greenLight },
  stepTitle: { marginTop: 17, marginBottom: 7, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 16 },
  stepCopy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  insightCard: { flexDirection: "row", alignItems: "center", gap: 50, marginTop: 50, padding: 48, borderRadius: 20, borderWidth: 1, borderColor: "#E0E9E5" },
  insightCardCompact: { flexDirection: "column", alignItems: "stretch" },
  insightCardPhone: { gap: 28, paddingHorizontal: 19, paddingVertical: 25 },
  insightCopyWrap: { flex: 1 },
  insightEyebrow: { marginBottom: 7 },
  insightTitle: { maxWidth: 490, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  insightCopy: { maxWidth: 500, marginTop: 13, marginBottom: 19, color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  insightLink: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  insightLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 14 },
  stats: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statsPhone: { flexDirection: "column" },
  statCard: { minHeight: 130, minWidth: 140, flex: 1, justifyContent: "center", padding: 18, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.85)", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" },
  statCardPhone: { minHeight: 95 },
  statLabel: { color: colors.ink, fontFamily: fonts.semiBold, fontSize: 13 },
  statValue: { marginTop: 8, marginBottom: 6, color: colors.greenDark, fontFamily: fonts.extraBold, fontSize: 24, letterSpacing: -0.4 },
  statDetail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
});
