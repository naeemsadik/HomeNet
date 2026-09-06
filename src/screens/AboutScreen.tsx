import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  DatabaseZap,
  HeartHandshake,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

export function AboutScreen() {
  const { isPhone } = useResponsive();

  return (
    <AppChrome active="home">
      <View style={[styles.intro, isPhone && styles.introPhone]}>
        <Eyebrow style={styles.eyebrow}>About HomeNet</Eyebrow>
        <Text style={[styles.title, isPhone && styles.titlePhone]}>
          More clarity for every move.
        </Text>
        <Text style={[styles.copy, isPhone && styles.copyPhone]}>
          HomeNet brings verified property information, local market context, and practical AI guidance into one calmer home-search experience.
        </Text>
      </View>

      <View style={[styles.valueGrid, isPhone && styles.valueGridPhone]}>
        {[
          [
            ShieldCheck,
            "Verified where it matters",
            "Clear listing details, ownership checks, and accountable advisors.",
          ],
          [
            DatabaseZap,
            "Data with an explanation",
            "Pricing guidance that shows the market signals behind each range.",
          ],
          [
            HeartHandshake,
            "Human help stays close",
            "Local support from first shortlist through viewing and negotiation.",
          ],
        ].map(([Icon, title, copy]) => {
          const ValueIcon = Icon as LucideIcon;
          return (
            <View key={title as string} style={[styles.valueCard, isPhone && styles.valueCardPhone]}>
              <View style={styles.valueIcon}>
                <ValueIcon color={colors.green} size={22} />
              </View>
              <Text style={styles.valueTitle}>{title as string}</Text>
              <Text style={styles.valueCopy}>{copy as string}</Text>
            </View>
          );
        })}
      </View>

      <LinearGradient
        colors={["#EAF7F1", "#EEF3FB"]}
        end={{ x: 1, y: 0 }}
        style={[styles.contactCard, isPhone && styles.contactCardPhone]}
      >
        <View style={styles.contactLeft}>
          <View style={styles.contactIcon}>
            <HeartHandshake color={colors.white} size={22} />
          </View>
          <View style={styles.contactCopyWrap}>
            <Text style={styles.contactTitle}>Need help with a property decision?</Text>
            <Text style={styles.contactCopy}>
              Our Dhaka property team can help you plan the next practical step.
            </Text>
          </View>
        </View>

        <AppLink
          href="mailto:hello@homenet.example"
          style={[styles.contactLink, isPhone && styles.contactLinkPhone, webPointer]}
        >
          <Text style={styles.contactLinkText}>Contact HomeNet</Text>
          <ArrowRight color={colors.green} size={16} />
        </AppLink>
      </LinearGradient>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  intro: {
    maxWidth: 720,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 36,
    paddingHorizontal: 16,
  },
  introPhone: {
    marginTop: 28,
    marginBottom: 24,
  },
  eyebrow: {
    marginBottom: 10,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  titlePhone: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  copy: {
    maxWidth: 600,
    marginTop: 14,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
  },
  copyPhone: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
  },
  valueGrid: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    gap: 18,
    marginTop: 12,
  },
  valueGridPhone: {
    flexDirection: "column",
    gap: 14,
  },
  valueCard: {
    flex: 1,
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  valueCardPhone: {
    padding: 20,
  },
  valueIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.greenLight,
  },
  valueTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  valueCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  contactCard: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 28,
    marginBottom: 60,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DFEAE5",
    ...shadow,
  },
  contactCardPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 18,
    padding: 20,
    marginBottom: 40,
  },
  contactLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  contactIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.green,
    flexShrink: 0,
  },
  contactCopyWrap: {
    flex: 1,
    minWidth: 0,
  },
  contactTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  contactCopy: {
    marginTop: 4,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  contactLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(15, 109, 85, 0.2)",
    ...shadow,
  },
  contactLinkPhone: {
    width: "100%",
    minHeight: 46,
  },
  contactLinkText: {
    color: colors.green,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});

