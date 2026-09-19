import { ArrowRight, ChartNoAxesCombined, MapPin, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, radius } from "@/theme";

const PLANNED = [
  {
    icon: MapPin,
    title: "Area price trends",
    copy: "Median asking price per sqft across Dhaka neighbourhoods, drawn from live listings.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Time on market",
    copy: "How long listings stay active before they are marked sold or rented.",
  },
  {
    icon: ShieldCheck,
    title: "Verified supply",
    copy: "How much verified inventory exists by area, category and listing type.",
  },
];

export function MarketScreen() {
  const { isPhone } = useResponsive();

  return (
    <AppChrome active="market">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <View style={styles.card}>
          <View style={styles.iconWell}>
            <ChartNoAxesCombined color={colors.greenOnLight} size={26} />
          </View>

          <Eyebrow>Insights</Eyebrow>
          <Text style={[styles.title, isPhone && styles.titlePhone]}>
            Market insights are coming soon
          </Text>
          <Text style={styles.copy}>
            HomeNet reports market data from real listings, not estimates. There
            is not yet enough verified inventory to publish figures we would
            stand behind, so this page stays empty until there is.
          </Text>

          <View style={[styles.plannedGrid, isPhone && styles.plannedGridPhone]}>
            {PLANNED.map(({ icon: Icon, title, copy }) => (
              <View key={title} style={styles.plannedCard}>
                <Icon color={colors.greenOnLight} size={18} />
                <Text style={styles.plannedTitle}>{title}</Text>
                <Text style={styles.plannedCopy}>{copy}</Text>
              </View>
            ))}
          </View>

          <AppLink href="/buy" style={styles.cta}>
            <Text style={styles.ctaText}>Browse verified listings</Text>
            <ArrowRight color={colors.white} size={16} />
          </AppLink>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 48,
    alignItems: "center",
  },
  containerPhone: {
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    maxWidth: 760,
    alignItems: "center",
    gap: 12,
    padding: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconWell: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.greenLight,
    marginBottom: 4,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.headingExtraBold,
    fontSize: 28,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  titlePhone: {
    fontSize: 22,
  },
  copy: {
    maxWidth: 520,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  plannedGrid: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 20,
  },
  plannedGridPhone: {
    flexDirection: "column",
  },
  plannedCard: {
    flex: 1,
    gap: 6,
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  plannedTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  plannedCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    marginTop: 24,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
  },
  ctaText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
