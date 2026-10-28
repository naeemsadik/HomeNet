import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink } from "@/components/ui";
import { SEO_AREAS, type SeoArea } from "@/content/areas";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

/** The cities, in the order the site lists them, each with the areas under it. */
const GROUPS = SEO_AREAS.filter((area) => !area.parent).map((city) => ({
  city,
  areas: SEO_AREAS.filter((area) => area.parent === city.slug),
}));

/**
 * Every /buy/<area> and /rent/<area> page in one place. Those 80-odd pages were
 * only in the sitemap: no link on the site led to them, so Google found them and
 * left them "discovered, not indexed". This page, linked from every footer, is
 * the plain-link route to each one.
 */
export function AreasScreen() {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const nameOf = (area: SeoArea) => (language === "bn" ? area.nameBn : area.name);

  const links = (area: SeoArea) => (
    <View key={area.slug} style={[styles.areaRow, isPhone && styles.areaRowPhone]}>
      <Text style={styles.areaName}>{nameOf(area)}</Text>
      <View style={styles.areaLinks}>
        <AppLink
          accessibilityLabel={t("areas.forSaleIn", { area: nameOf(area) })}
          href={`/buy/${area.slug}`}
          style={[styles.link, webPointer]}
        >
          <Text style={styles.linkText}>{t("areas.forSale")}</Text>
        </AppLink>
        <AppLink
          accessibilityLabel={t("areas.forRentIn", { area: nameOf(area) })}
          href={`/rent/${area.slug}`}
          style={[styles.link, webPointer]}
        >
          <Text style={styles.linkText}>{t("areas.forRent")}</Text>
        </AppLink>
      </View>
    </View>
  );

  return (
    <AppChrome active="buy">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <Text accessibilityRole="header" aria-level={1} style={[styles.title, isPhone && styles.titlePhone]}>
          {t("areas.title")}
        </Text>
        <Text style={styles.intro}>{t("areas.intro")}</Text>

        {GROUPS.map(({ city, areas }) => (
          <View key={city.slug} style={styles.group}>
            <Text accessibilityRole="header" aria-level={2} style={styles.cityTitle}>
              {nameOf(city)}
            </Text>
            {links(city)}
            {areas.map(links)}
          </View>
        ))}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", paddingVertical: 40, gap: 12 },
  containerPhone: { paddingVertical: 20 },
  title: { color: colorTokens.ink, fontFamily: fonts.headingExtraBold, fontSize: 30, letterSpacing: -0.5 },
  titlePhone: { fontSize: 24 },
  intro: { maxWidth: 640, color: colorTokens.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  group: {
    marginTop: 16,
    padding: 16,
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  cityTitle: { color: colorTokens.ink, fontFamily: fonts.headingBold, fontSize: 20, marginBottom: 6 },
  areaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, gap: 12 },
  areaRowPhone: { flexWrap: "wrap" },
  areaName: { flexShrink: 1, color: colorTokens.ink, fontFamily: fonts.semiBold, fontSize: 15 },
  areaLinks: { flexDirection: "row", gap: 8 },
  link: {
    minHeight: 36,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
  },
  linkText: { color: colorTokens.brandText, fontFamily: fonts.semiBold, fontSize: 13 },
});
