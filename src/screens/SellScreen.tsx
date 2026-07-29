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
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow, SectionHeader, SelectField } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

export function SellScreen() {
  const { isPhone, isTablet, isCompact } = useResponsive();
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppChrome active="sell">
      <LinearGradient colors={["#075C46", "#086B55", "#365FB7"]} end={{ x: 1, y: 0 }} style={[styles.hero, isTablet && styles.heroTablet, isPhone && styles.heroPhone]}>
        <View style={styles.heroCopyWrap}>
          <View style={styles.heroKicker}><Sparkles color="rgba(255,255,255,0.82)" size={14} /><Eyebrow light>AI-assisted selling</Eyebrow></View>
          <Text style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}>Sell with a price buyers can trust.</Text>
          <Text style={styles.heroCopy}>Get a clear valuation, reach verified buyers, and manage every step from one place.</Text>
          <View style={styles.proofRow}>
            <View style={styles.proofItem}><ShieldCheck color="rgba(255,255,255,0.86)" size={16} /><Text style={styles.proofText}>Verified inquiries</Text></View>
            <View style={styles.proofItem}><Clock3 color="rgba(255,255,255,0.86)" size={16} /><Text style={styles.proofText}>Faster shortlists</Text></View>
          </View>
        </View>
        <View style={[styles.valuationCard, isPhone && styles.valuationCardPhone]}>
          <View style={styles.valuationHead}>
            <View style={styles.valuationIcon}><BarChart3 color={colors.white} size={20} /></View>
            <View><Text style={styles.valuationTitle}>Start with a free valuation</Text><Text style={styles.valuationCopy}>See a data-backed range in under a minute.</Text></View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Property address</Text>
            <View style={styles.inputShell}><MapPin color={colors.green} size={16} /><TextInput onChangeText={setAddress} placeholder="Area, road, or building" placeholderTextColor="#899790" style={styles.input} value={address} /></View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Property type</Text>
            <View style={styles.inputShell}><Building2 color={colors.green} size={16} /><SelectField onChange={setPropertyType} options={["Apartment", "House", "Condo", "Commercial"]} style={styles.propertySelect} value={propertyType} /></View>
          </View>
          <Pressable onPress={() => setSubmitted(true)} style={({ pressed }) => [styles.submitButton, webPointer, pressed && styles.pressed]}>
            <Text style={styles.submitText}>Get my estimate</Text><ArrowRight color={colors.white} size={15} />
          </Pressable>
          {submitted ? <View style={styles.valuationResult}><CheckCircle2 color={colors.greenDark} size={15} /><Text style={styles.valuationResultText}>We found recent matches near {address || "your property"}. Your valuation is ready for review.</Text></View> : null}
        </View>
      </LinearGradient>

      <View style={styles.processSection}>
        <SectionHeader eyebrow="A clearer path to sold" right={<View />} title="How HomeNet helps" />
        <View style={[styles.stepGrid, isPhone && styles.stepGridPhone]}>
          {[
            [BarChart3, "Price with evidence", "Compare recent sales, location demand, and property condition."],
            [BadgeCheck, "Publish a verified listing", "Present complete details that serious buyers can rely on."],
            [ShieldCheck, "Meet qualified buyers", "Organize viewings and offers from identity-checked prospects."],
          ].map(([Icon, title, copy], index) => {
            const StepIcon = Icon as LucideIcon;
            return (
              <View key={title as string} style={styles.stepCard}>
                <Text style={styles.stepNumber}>0{index + 1}</Text>
                <View style={styles.stepIcon}><StepIcon color={colors.green} size={21} /></View>
                <Text style={styles.stepTitle}>{title as string}</Text>
                <Text style={styles.stepCopy}>{copy as string}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <LinearGradient colors={["#EEF8F3", "#EFF3FB"]} end={{ x: 1, y: 0 }} style={[styles.insightCard, isCompact && styles.insightCardCompact, isPhone && styles.insightCardPhone]}>
        <View style={styles.insightCopyWrap}>
          <Eyebrow style={styles.insightEyebrow}>Seller intelligence</Eyebrow>
          <Text style={styles.insightTitle}>Know what is moving in your neighborhood</Text>
          <Text style={styles.insightCopy}>Track comparable listings, buyer interest, and average time on market before choosing your launch price.</Text>
          <AppLink href="/market" style={styles.insightLink}><Text style={styles.insightLinkText}>Open market insights</Text><ArrowRight color={colors.green} size={15} /></AppLink>
        </View>
        <View style={[styles.stats, isPhone && styles.statsPhone]}>
          {[
            ["Average sale window", "34 days", "Dhaka prime areas"],
            ["Verified buyer reach", "12.4k", "Active this month"],
            ["AI valuation accuracy", "94%", "Within final sale range"],
          ].map(([label, value, detail]) => <View key={label} style={[styles.statCard, isPhone && styles.statCardPhone]}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statDetail}>{detail}</Text></View>)}
        </View>
      </LinearGradient>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.82 },
  hero: { minHeight: 480, flexDirection: "row", alignItems: "center", gap: 70, overflow: "hidden", padding: 72, borderRadius: 24 },
  heroTablet: { flexDirection: "column", alignItems: "stretch", gap: 30 },
  heroPhone: { minHeight: 0, paddingHorizontal: 20, paddingVertical: 30, borderRadius: 19 },
  heroCopyWrap: { flex: 1.1 },
  heroKicker: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 13 },
  heroTitle: { maxWidth: 560, color: colors.white, fontFamily: fonts.bold, fontSize: 60, lineHeight: 61, letterSpacing: -3.6 },
  heroTitlePhone: { fontSize: 38, lineHeight: 41, letterSpacing: -2.2 },
  heroCopy: { maxWidth: 510, marginTop: 17, marginBottom: 24, color: "rgba(255,255,255,0.76)", fontFamily: fonts.regular, fontSize: 12, lineHeight: 20 },
  proofRow: { flexDirection: "row", flexWrap: "wrap", gap: 17 },
  proofItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  proofText: { color: "rgba(255,255,255,0.86)", fontFamily: fonts.bold, fontSize: 9 },
  valuationCard: { flex: 0.9, gap: 14, padding: 24, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.98)", borderWidth: 1, borderColor: "rgba(255,255,255,0.72)", ...shadow },
  valuationCardPhone: { padding: 18 },
  valuationHead: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 3 },
  valuationIcon: { width: 41, height: 41, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.green },
  valuationTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 12 },
  valuationCopy: { marginTop: 3, color: colors.muted, fontFamily: fonts.regular, fontSize: 8 },
  formGroup: { gap: 6 },
  formLabel: { color: "#52675E", fontFamily: fonts.extraBold, fontSize: 8 },
  inputShell: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 11, borderRadius: 9, borderWidth: 1, borderColor: colors.line },
  input: { minWidth: 0, flex: 1, color: colors.ink, fontFamily: fonts.regular, fontSize: 9 },
  propertySelect: { minWidth: 0, flex: 1 },
  submitButton: { width: "100%", minHeight: 41, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 999, backgroundColor: colors.green },
  submitText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 10 },
  valuationResult: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 8, backgroundColor: colors.greenLight },
  valuationResultText: { flex: 1, color: colors.greenDark, fontFamily: fonts.regular, fontSize: 8, lineHeight: 12 },
  processSection: { marginTop: 54 },
  stepGrid: { flexDirection: "row", gap: 15 },
  stepGridPhone: { flexDirection: "column" },
  stepCard: { position: "relative", flex: 1, overflow: "hidden", padding: 23, borderRadius: 15, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  stepNumber: { position: "absolute", top: 13, right: 16, color: "#D8E4DE", fontFamily: fonts.extraBold, fontSize: 20 },
  stepIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.greenLight },
  stepTitle: { marginTop: 17, marginBottom: 7, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 13 },
  stepCopy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14 },
  insightCard: { flexDirection: "row", alignItems: "center", gap: 50, marginTop: 50, padding: 55, borderRadius: 20, borderWidth: 1, borderColor: "#E0E9E5" },
  insightCardCompact: { flexDirection: "column", alignItems: "stretch" },
  insightCardPhone: { gap: 28, paddingHorizontal: 19, paddingVertical: 25 },
  insightCopyWrap: { flex: 1 },
  insightEyebrow: { marginBottom: 7 },
  insightTitle: { maxWidth: 490, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 36, lineHeight: 40, letterSpacing: -1.8 },
  insightCopy: { maxWidth: 500, marginTop: 13, marginBottom: 19, color: colors.muted, fontFamily: fonts.regular, fontSize: 10, lineHeight: 17 },
  insightLink: { alignSelf: "flex-start", minHeight: 41, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 17, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  insightLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 10 },
  stats: { flex: 1, flexDirection: "row", gap: 9 },
  statsPhone: { flexDirection: "column" },
  statCard: { minHeight: 130, flex: 1, justifyContent: "center", padding: 16, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.86)" },
  statCardPhone: { minHeight: 95 },
  statLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 7 },
  statValue: { marginTop: 7, marginBottom: 4, color: colors.greenDark, fontFamily: fonts.extraBold, fontSize: 20, letterSpacing: -0.8 },
  statDetail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 7 },
});
