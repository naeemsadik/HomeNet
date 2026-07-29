import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, DatabaseZap, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts } from "@/theme";

export function AboutScreen() {
  const { isPhone } = useResponsive();

  return (
    <AppChrome active="home">
      <View style={[styles.intro, isPhone && styles.introPhone]}>
        <Eyebrow style={styles.eyebrow}>About HomeNet</Eyebrow>
        <Text style={[styles.title, isPhone && styles.titlePhone]}>More clarity for every move.</Text>
        <Text style={styles.copy}>HomeNet brings verified property information, local market context, and practical AI guidance into one calmer home-search experience.</Text>
      </View>
      <View style={[styles.valueGrid, isPhone && styles.valueGridPhone]}>
        {[
          [ShieldCheck, "Verified where it matters", "Clear listing details, ownership checks, and accountable advisors."],
          [DatabaseZap, "Data with an explanation", "Pricing guidance that shows the market signals behind each range."],
          [HeartHandshake, "Human help stays close", "Local support from first shortlist through viewing and negotiation."],
        ].map(([Icon, title, copy]) => {
          const ValueIcon = Icon as LucideIcon;
          return <View key={title as string} style={styles.valueCard}><View style={styles.valueIcon}><ValueIcon color={colors.green} size={21} /></View><Text style={styles.valueTitle}>{title as string}</Text><Text style={styles.valueCopy}>{copy as string}</Text></View>;
        })}
      </View>
      <LinearGradient colors={["#EAF7F1", "#EEF3FB"]} end={{ x: 1, y: 0 }} style={[styles.contactCard, isPhone && styles.contactCardPhone]}>
        <View style={styles.contactIcon}><HeartHandshake color={colors.white} size={20} /></View>
        <View style={styles.contactCopyWrap}><Text style={styles.contactTitle}>Need help with a property decision?</Text><Text style={styles.contactCopy}>Our Dhaka property team can help you plan the next practical step.</Text></View>
        <AppLink href="mailto:hello@homenet.example" style={[styles.contactLink, isPhone && styles.contactLinkPhone]}><Text style={styles.contactLinkText}>Contact HomeNet</Text><ArrowRight color={colors.green} size={15} /></AppLink>
      </LinearGradient>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  intro: { maxWidth: 680, alignSelf: "center", alignItems: "center", marginTop: 65, marginBottom: 30 },
  introPhone: { marginTop: 25 },
  eyebrow: { marginBottom: 7 },
  title: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 52, lineHeight: 54, letterSpacing: -3.1, textAlign: "center" },
  titlePhone: { fontSize: 36, lineHeight: 39, letterSpacing: -2.1 },
  copy: { maxWidth: 570, marginTop: 12, color: colors.muted, fontFamily: fonts.regular, fontSize: 11, lineHeight: 18, textAlign: "center" },
  valueGrid: { width: "100%", maxWidth: 940, alignSelf: "center", flexDirection: "row", gap: 15, marginTop: 15 },
  valueGridPhone: { flexDirection: "column" },
  valueCard: { flex: 1, padding: 23, borderRadius: 15, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  valueIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.greenLight },
  valueTitle: { marginTop: 17, marginBottom: 7, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 13 },
  valueCopy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14 },
  contactCard: { width: "100%", maxWidth: 940, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 14, marginTop: 20, marginBottom: 50, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: "#DFEAE5" },
  contactCardPhone: { flexWrap: "wrap" },
  contactIcon: { width: 41, height: 41, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.green },
  contactCopyWrap: { minWidth: 0, flex: 1 },
  contactTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 10 },
  contactCopy: { marginTop: 4, color: colors.muted, fontFamily: fonts.regular, fontSize: 8, lineHeight: 12 },
  contactLink: { flexDirection: "row", alignItems: "center", gap: 5 },
  contactLinkPhone: { marginLeft: 55 },
  contactLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 8 },
});
