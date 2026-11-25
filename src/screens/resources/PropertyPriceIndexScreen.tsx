import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { AppButton } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { seoAreaForName } from "@/content/areas";
import { getAreaPriceIndex } from "@/features/valuation/utils/areaPriceIndex";
import { formatCollected } from "@/features/valuation/utils/confidenceText";
import { colorTokens, fonts, radius } from "@/theme";
import { ResourceHero, ResourceNote, ResourcePage, ResourceSection, resourceCard } from "./ResourceKit";

const capitalise = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const AREA_DISPLAY_NAMES: Record<string, { en: string; bn: string }> = {
  baridhara: { en: "Baridhara", bn: "বারিধারা" },
  gulshan: { en: "Gulshan", bn: "গুলশান" },
  banani: { en: "Banani", bn: "বনানী" },
  dhanmondi: { en: "Dhanmondi", bn: "ধানমন্ডি" },
  khulshi: { en: "Khulshi (Chattogram)", bn: "খুলশী (চট্টগ্রাম)" },
  uttara: { en: "Uttara", bn: "উত্তরা" },
  bashundhara: { en: "Bashundhara R/A", bn: "বসুন্ধরা আবাসিক এলাকা" },
  agrabad: { en: "Agrabad (Chattogram)", bn: "আগ্রাবাদ (চট্টগ্রাম)" },
  aftabnagar: { en: "Aftabnagar", bn: "আফতাবনগর" },
  mohammadpur: { en: "Mohammadpur", bn: "মোহাম্মদপুর" },
  uposhohor: { en: "Uposhohor (Sylhet)", bn: "উপশহর (সিলেট)" },
  "khilgaon-malibagh": { en: "Khilgaon / Malibagh", bn: "খিলগাঁও / মালিবাগ" },
  mirpur: { en: "Mirpur", bn: "মিরপুর" },
  banasree: { en: "Banasree", bn: "বনশ্রী" },
  rampura: { en: "Rampura", bn: "রামপুরা" },
  purbachal: { en: "Purbachal", bn: "পূর্বাচল" },
  badda: { en: "Badda", bn: "বাড্ডা" },
  nandipara: { en: "Nandipara", bn: "নন্দীপাড়া" },
};

/** Digits and the Taka sign in the reader's language. */
const taka = (amount: number, language: "en" | "bn") =>
  `৳${Math.round(amount).toLocaleString(language === "bn" ? "bn-BD" : "en-IN")}`;

export function PropertyPriceIndexScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { isPhone } = useResponsive();
  const index = useMemo(() => getAreaPriceIndex(), []);

  const areaName = (key: string) => {
    const custom = AREA_DISPLAY_NAMES[key];
    if (custom) return custom[language] ?? custom.en;
    const area = seoAreaForName(key);
    return area ? (language === "bn" ? area.nameBn : area.name) : capitalise(key);
  };
  const when = formatCollected(index.asOf, language);

  return (
    <AppChrome>
      <ResourcePage>
        <ResourceHero
          title={t("propertyPriceIndex.headline")}
          intro={t("propertyPriceIndex.subheading", { count: index.listingsKept, sites: index.siteCount, date: when })}
        />

        <ResourceSection
          title={t("propertyPriceIndex.areasTitle")}
          subtitle={t("propertyPriceIndex.areasSubtitle", { date: when })}
        >
          <View style={[styles.grid, isPhone && styles.gridPhone]}>
            {index.published.map((row) => (
              <View key={row.key} style={[styles.card, isPhone && styles.cardPhone]}>
                <Text style={styles.area}>{areaName(row.key)}</Text>
                <Text style={styles.rate} accessibilityLabel={t("propertyPriceIndex.rateA11y", { rate: taka(row.median, language) })}>
                  {taka(row.median, language)}
                  <Text style={styles.unit}> {t("propertyPriceIndex.perSqft")}</Text>
                </Text>
                <Text style={styles.detail}>
                  {t("propertyPriceIndex.range", { low: taka(row.p25, language), high: taka(row.p75, language) })}
                </Text>
                <Text style={styles.detail}>{t("propertyPriceIndex.basedOn", { count: row.listings })}</Text>
                {row.mostlyOneSite ? <Text style={styles.caveat}>{t("propertyPriceIndex.oneSite")}</Text> : null}
              </View>
            ))}
          </View>
          {index.published.length === 0 ? <Text style={styles.detail}>{t("propertyPriceIndex.none")}</Text> : null}
        </ResourceSection>

        {index.building.length > 0 ? (
          <ResourceSection
            title={t("propertyPriceIndex.buildingTitle")}
            subtitle={t("propertyPriceIndex.buildingSubtitle", { min: 15 })}
          >
            <Text style={styles.detail}>
              {index.building
                .map((a) => t("propertyPriceIndex.buildingItem", { area: areaName(a.key), count: a.listings }))
                .join(", ")}
            </Text>
          </ResourceSection>
        ) : null}

        <ResourceSection title={t("propertyPriceIndex.howTitle")}>
          <Text style={styles.how}>{t("propertyPriceIndex.howBody")}</Text>
        </ResourceSection>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>{t("propertyPriceIndex.ctaTitle")}</Text>
          <Text style={styles.detail}>{t("propertyPriceIndex.ctaBody")}</Text>
          <View style={styles.ctaButton}>
            <AppButton label={t("propertyPriceIndex.ctaButton")} onPress={() => router.push("/instant-valuation")} />
          </View>
        </View>

        <ResourceNote title={t("propertyPriceIndex.noteTitle")} body={t("propertyPriceIndex.noteBody")} />
      </ResourcePage>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  gridPhone: { flexDirection: "column" },
  card: { ...resourceCard, flexBasis: "47%", flexGrow: 1 },
  cardPhone: { flexBasis: "auto" },
  area: { fontFamily: fonts.semiBold, fontSize: 16, color: colorTokens.ink },
  rate: { marginTop: 8, fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 34, color: colorTokens.ink },
  unit: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted },
  detail: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colorTokens.muted },
  caveat: { marginTop: 8, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colorTokens.warningText },
  how: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: colorTokens.body, maxWidth: 720 },
  cta: { ...resourceCard, marginBottom: 24, backgroundColor: colorTokens.brandSurface, borderColor: colorTokens.brandBorder },
  ctaTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colorTokens.ink },
  ctaButton: { marginTop: 16, alignSelf: "flex-start", borderRadius: radius.lg },
});
