import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { getAreaPriceIndex } from "@/features/valuation/utils/areaPriceIndex";
import { formatCollected } from "@/features/valuation/utils/confidenceText";
import { colorTokens, fonts, webPointer } from "@/theme";
import { ResourceHero, ResourceNote, ResourcePage, ResourceSection, resourceCard } from "./ResourceKit";

const LINKS: { href: string; title: TranslationKey; body: TranslationKey }[] = [
  { href: "/resources/property-price-index", title: "propertyNewsTrends.linkIndexTitle", body: "propertyNewsTrends.linkIndexBody" },
  { href: "/resources/property-valuation-guide", title: "propertyNewsTrends.linkGuideTitle", body: "propertyNewsTrends.linkGuideBody" },
  { href: "/resources/stamp-duty-tax-guide", title: "propertyNewsTrends.linkDutyTitle", body: "propertyNewsTrends.linkDutyBody" },
];

/**
 * There is no news desk yet, and this page says so. It does not invent
 * articles or market figures; it points to the pages that do hold real
 * information and shows when our listing data was last collected.
 */
export function PropertyNewsTrendsScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { isPhone } = useResponsive();
  const index = useMemo(() => getAreaPriceIndex(), []);

  return (
    <AppChrome>
      <ResourcePage>
        <ResourceHero
          eyebrow={t("propertyNewsTrends.eyebrow")}
          title={t("propertyNewsTrends.headline")}
          intro={t("propertyNewsTrends.subheading")}
        />

        <ResourceSection
          title={t("propertyNewsTrends.dataTitle")}
          subtitle={t("propertyNewsTrends.dataBody", {
            count: index.listingsKept,
            sites: index.siteCount,
            date: formatCollected(index.asOf, language),
          })}
        >
          <View style={[styles.links, isPhone && styles.linksPhone]}>
            {LINKS.map((link) => (
              <Pressable
                key={link.href}
                accessibilityRole="link"
                accessibilityLabel={t(link.title)}
                onPress={() => router.push(link.href as never)}
                style={({ pressed }) => [styles.link, isPhone && styles.linkPhone, webPointer, pressed && styles.pressed]}
              >
                <Text style={styles.linkTitle}>{t(link.title)}</Text>
                <Text style={styles.linkBody}>{t(link.body)}</Text>
              </Pressable>
            ))}
          </View>
        </ResourceSection>

        <ResourceNote title={t("propertyNewsTrends.noteTitle")} body={t("propertyNewsTrends.noteBody")} />
      </ResourcePage>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  links: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  linksPhone: { flexDirection: "column" },
  link: { ...resourceCard, flexBasis: "30%", flexGrow: 1 },
  linkPhone: { flexBasis: "auto" },
  pressed: { backgroundColor: colorTokens.surfaceSunken },
  linkTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colorTokens.ink },
  linkBody: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colorTokens.muted },
});
