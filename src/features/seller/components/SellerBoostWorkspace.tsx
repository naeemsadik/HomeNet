import { CheckCircle2, MessageSquare, Rocket, Sparkles, TrendingUp } from "@/components/icons";
import { Pressable, Text, View } from "react-native";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, webPointer } from "@/theme";
import { useTranslation, formatLocalizedNumber } from "@/i18n";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Boost tab: packages and boosted listings. */
export function SellerBoostWorkspace({ onOpenBoost }: { onOpenBoost: (packageId?: string) => void }) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();

  const packages = [
    {
      id: "featured",
      name: t("seller.boost.packages.featured.name"),
      price: t("seller.boost.packages.featured.price"),
      badge: t("seller.boost.packages.featured.badge"),
      popular: false,
      bullets: [
        t("seller.boost.packages.featured.bullet1"),
        t("seller.boost.packages.featured.bullet2"),
        t("seller.boost.packages.featured.bullet3"),
      ],
    },
    {
      id: "ai_priority",
      name: t("seller.boost.packages.aiPriority.name"),
      price: t("seller.boost.packages.aiPriority.price"),
      badge: t("seller.boost.packages.aiPriority.badge"),
      popular: true,
      bullets: [
        t("seller.boost.packages.aiPriority.bullet1"),
        t("seller.boost.packages.aiPriority.bullet2"),
        t("seller.boost.packages.aiPriority.bullet3"),
      ],
    },
    {
      id: "omni_blast",
      name: t("seller.boost.packages.omniBlast.name"),
      price: t("seller.boost.packages.omniBlast.price"),
      badge: t("seller.boost.packages.omniBlast.badge"),
      popular: false,
      bullets: [
        t("seller.boost.packages.omniBlast.bullet1"),
        t("seller.boost.packages.omniBlast.bullet2"),
        t("seller.boost.packages.omniBlast.bullet3"),
      ],
    },
  ];

  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={styles.tabHeroIconWrap}>
            <Rocket color={colors.green} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              {t("seller.boost.workspace.heroTitle")}
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              {t("seller.boost.workspace.heroSubtitle")}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => onOpenBoost()}
          style={[
            styles.tabHeroActionBtn,
            isPhone && styles.tabHeroActionBtnPhone,
            webPointer,
          ]}
        >
          <Rocket color={colors.ink} size={16} />
          <Text style={styles.tabHeroActionText}>{t("seller.boost.workspace.boostPropertyBtn")}</Text>
        </Pressable>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: colors.green }]}>{formatLocalizedNumber(0, language)}</Text>
          <Text style={styles.kpiLabel}>{t("seller.boost.workspace.activeBoosts")}</Text>
          <Text style={styles.kpiSub}>{t("seller.boost.workspace.currentlyPromoted")}</Text>
        </View>
      </View>

      <View style={styles.boostBenchmarkRow}>
        {[
          {
            text: t("seller.boost.workspace.benchmarkImpressions", { value: "up to 3x" }),
            icon: TrendingUp,
          },
          {
            text: t("seller.boost.workspace.benchmarkInquiries", { value: "up to 5x" }),
            icon: MessageSquare,
          },
        ].map((item, idx) => (
          <View key={idx} style={styles.boostBenchmarkItem}>
            <item.icon color={colors.muted} size={14} />
            <Text style={styles.boostBenchmarkText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.boost.workspace.packagesTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.boost.workspace.packagesSubtitle")}</Text>
        </View>

        <View style={styles.boostPackagesGrid}>
          {packages.map((pkg) => (
            <View
              key={pkg.id}
              style={[
                styles.boostPkgCard,
                pkg.popular && styles.boostPkgCardPopular,
              ]}
            >
              {pkg.popular ? (
                <View style={styles.popularTag}>
                  <Sparkles color={colors.ink} size={12} />
                  <Text style={styles.popularTagText}>{pkg.badge}</Text>
                </View>
              ) : (
                <View style={styles.standardTag}>
                  <Text style={styles.standardTagText}>{pkg.badge}</Text>
                </View>
              )}
              <Text style={styles.boostPkgName}>{pkg.name}</Text>
              <Text style={styles.boostPkgPrice}>{pkg.price}</Text>

              <View style={styles.pkgBulletsList}>
                {pkg.bullets.map((b, i) => (
                  <View key={i} style={styles.pkgBulletRow}>
                    <CheckCircle2 color={colors.green} size={15} />
                    <Text style={styles.pkgBulletText}>{b}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => onOpenBoost(pkg.id)}
                style={[
                  styles.selectPkgBtn,
                  pkg.popular && styles.selectPkgBtnPopular,
                  webPointer,
                ]}
              >
                <Rocket color={pkg.popular ? colors.ink : colors.green} size={15} />
                <Text
                  style={[
                    styles.selectPkgBtnText,
                    pkg.popular && styles.selectPkgBtnTextPopular,
                  ]}
                >
                  {t("seller.boost.workspace.selectPlan")}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.boost.workspace.boostedPropertiesTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.boost.workspace.boostedPropertiesSubtitle")}</Text>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <Rocket color={colors.green} size={26} />
          </View>
          <Text style={styles.emptyTitle}>{t("seller.boost.workspace.noActiveBoostsTitle")}</Text>
          <Text style={styles.emptyDesc}>
            {t("seller.boost.workspace.noActiveBoostsDesc")}
          </Text>
          <AppLink href="/my-properties" style={styles.emptyActionBtn}>
            <Text style={styles.emptyActionBtnText}>{t("seller.boost.workspace.manageListings")}</Text>
          </AppLink>
        </View>
      </View>
    </>
  );
}
