import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppLink } from "@/components/ui";
import { ArrowRight, MapPin } from "@/components/icons";
import { colorTokens, fonts, radius } from "@/theme";
import { useTranslation } from "@/i18n";
import { seoAreaBySlug } from "@/content/areas";

interface NearbyAreasSectionProps {
  currentSlug?: string;
  mode: "buy" | "rent";
}

/** Top residential hubs in Dhaka for Hub-and-Spoke internal linking */
const POPULAR_DHAKA_SLUGS = [
  "gulshan",
  "banani",
  "baridhara",
  "bashundhara-ra",
  "dhanmondi",
  "uttara",
  "mirpur",
  "mohammadpur",
  "badda",
  "banasree",
  "lalmatia",
  "niketan",
];

export function NearbyAreasSection({ currentSlug, mode }: NearbyAreasSectionProps) {
  const { language } = useTranslation();
  const oppositeMode = mode === "buy" ? "rent" : "buy";
  const currentArea = currentSlug ? seoAreaBySlug(currentSlug) : undefined;

  // Filter out the current area and grab the popular areas
  const targetAreas = POPULAR_DHAKA_SLUGS
    .filter((slug) => slug !== currentSlug)
    .map((slug) => seoAreaBySlug(slug))
    .filter((area): area is NonNullable<typeof area> => Boolean(area));

  const currentAreaName = currentArea
    ? language === "bn"
      ? currentArea.nameBn
      : currentArea.name
    : null;

  return (
    <View style={styles.container}>
      {/* 1. Cross-Link between Buy and Rent for the active area hub */}
      {currentArea && currentSlug ? (
        <View style={styles.crossLinkCard}>
          <View style={styles.crossLinkHeader}>
            <View style={styles.crossLinkIconWrap}>
              <MapPin color={colorTokens.brand} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.crossLinkContent}>
              <Text style={styles.crossLinkTitle}>
                {mode === "buy"
                  ? language === "bn"
                    ? `${currentAreaName}-এ ভাড়ার প্রোপার্টি খুঁজছেন?`
                    : `Looking to rent in ${currentAreaName}?`
                  : language === "bn"
                  ? `${currentAreaName}-এ প্রোপার্টি কিনতে চান?`
                  : `Looking to buy in ${currentAreaName}?`}
              </Text>
              <Text style={styles.crossLinkSubtitle}>
                {mode === "buy"
                  ? language === "bn"
                    ? `সরাসরি মালিকের সাথে কথা বলুন এবং কোনো ব্রোকার ছাড়া ${currentAreaName}-এ বাসা ভাড়া নিন।`
                    : `Browse verified family flats, bachelor apartments and sublets for rent directly from owners.`
                  : language === "bn"
                  ? `০% ব্রোকার কমিশনে সরাসরি মালিকের কাছ থেকে প্রস্তুত ও নির্মাণাধীন ফ্ল্যাট কিনুন।`
                  : `Explore ready and under-construction flats, houses and plots for sale with 0% brokerage.`}
              </Text>
            </View>
          </View>
          <AppLink
            href={`/${oppositeMode}/${currentSlug}`}
            style={styles.crossLinkBtn}
            accessibilityLabel={
              mode === "buy"
                ? `Properties for rent in ${currentArea.name}`
                : `Properties for sale in ${currentArea.name}`
            }
          >
            <Text style={styles.crossLinkBtnText}>
              {mode === "buy"
                ? language === "bn"
                  ? `${currentAreaName}-এ ভাড়া দেখুন`
                  : `See rentals in ${currentArea.name}`
                : language === "bn"
                ? `${currentAreaName}-এ বিক্রয় দেখুন`
                : `See for sale in ${currentArea.name}`}
            </Text>
            <ArrowRight color={colorTokens.onBrand} size={15} strokeWidth={2.2} />
          </AppLink>
        </View>
      ) : null}

      {/* 2. Nearby & Popular Areas in Dhaka */}
      <View style={styles.hubSection}>
        <View style={styles.hubHeader}>
          <MapPin color={colorTokens.brand} size={20} strokeWidth={2.2} />
          <Text style={styles.hubTitle}>
            {language === "bn"
              ? "ঢাকার জনপ্রিয় ও পার্শ্ববর্তী এলাকা"
              : "Nearby & Popular Areas in Dhaka"}
          </Text>
        </View>
        <Text style={styles.hubSubtitle}>
          {language === "bn"
            ? "সেরা আবাসিক এলাকাগুলোর ভেরিফাইড ফ্ল্যাট, অ্যাপার্টমেন্ট ও প্লট দেখুন।"
            : "Discover verified flats, apartments, and plots across top residential hubs in Dhaka."}
        </Text>

        <View style={styles.areasGrid}>
          {targetAreas.map((area) => {
            const areaName = language === "bn" ? area.nameBn : area.name;
            const linkText =
              mode === "buy"
                ? language === "bn"
                  ? `${areaName}-এ ফ্ল্যাট বিক্রয়`
                  : `Flats for sale in ${area.name}`
                : language === "bn"
                ? `${areaName}-এ বাসা ভাড়া`
                : `Properties for rent in ${area.name}`;

            return (
              <AppLink
                key={area.slug}
                href={`/${mode}/${area.slug}`}
                style={styles.areaChip}
                accessibilityLabel={linkText}
              >
                <Text style={styles.areaChipText}>{linkText}</Text>
                <ArrowRight color={colorTokens.brand} size={13} strokeWidth={2} />
              </AppLink>
            );
          })}

          {/* City wide hub link */}
          <AppLink
            href={`/${mode}/dhaka`}
            style={[styles.areaChip, styles.areaChipCity]}
            accessibilityLabel={
              mode === "buy" ? "All properties for sale in Dhaka" : "All properties for rent in Dhaka"
            }
          >
            <Text style={[styles.areaChipText, styles.areaChipCityText]}>
              {language === "bn"
                ? `ঢাকায় ${mode === "buy" ? "বিক্রির" : "ভাড়ার"} সব প্রোপার্টি`
                : `All properties for ${mode} in Dhaka`}
            </Text>
            <ArrowRight color={colorTokens.onBrand} size={13} strokeWidth={2} />
          </AppLink>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  crossLinkCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(4, 207, 146, 0.25)",
    padding: 18,
    gap: 14,
  },
  crossLinkHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  crossLinkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.card,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  crossLinkContent: {
    flex: 1,
    gap: 4,
  },
  crossLinkTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  crossLinkSubtitle: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    lineHeight: 19,
  },
  crossLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colorTokens.brand,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    minHeight: 44,
  },
  crossLinkBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    color: colorTokens.onBrand,
  },
  hubSection: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    padding: 20,
    gap: 12,
  },
  hubHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hubTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  hubSubtitle: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    lineHeight: 19,
  },
  areasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  areaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    minHeight: 44,
  },
  areaChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.textPrimary,
  },
  areaChipCity: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  areaChipCityText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
  },
});
