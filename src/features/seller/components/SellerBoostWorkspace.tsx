import { CheckCircle2, MessageSquare, Rocket, Sparkles, TrendingUp } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, webPointer } from "@/theme";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Boost tab: packages and boosted listings. */
export function SellerBoostWorkspace({ onOpenBoost }: { onOpenBoost: (packageId?: string) => void }) {
  const { isPhone } = useResponsive();
  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={styles.tabHeroIconWrap}>
            <Rocket color={colors.green} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              Boost Listings & Maximize Reach
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              Promote your properties to reach up to 10x more verified buyers across Dhaka with top search placement.
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
          <Text style={styles.tabHeroActionText}>Boost a Property</Text>
        </Pressable>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, isPhone && styles.kpiCardPhone]}>
          <Text style={[styles.kpiValue, { color: colors.green }]}>0</Text>
          <Text style={styles.kpiLabel}>Active Boosts</Text>
          <Text style={styles.kpiSub}>Currently promoted</Text>
        </View>
      </View>

      <View style={styles.boostBenchmarkRow}>
        {[
          { label: "Typical impression lift", value: "up to 3x", icon: TrendingUp },
          { label: "Typical inquiry lift", value: "up to 5x", icon: MessageSquare },
        ].map((item) => (
          <View key={item.label} style={styles.boostBenchmarkItem}>
            <item.icon color={colors.muted} size={14} />
            <Text style={styles.boostBenchmarkText}>
              <Text style={styles.boostBenchmarkValue}>{item.value}</Text> {item.label} reported across boosted listings
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Available Boost Packages</Text>
          <Text style={styles.tabCardSub}>Choose a tailored tier to supercharge visibility for your listings</Text>
        </View>

        <View style={styles.boostPackagesGrid}>
          {[
            {
              id: "featured",
              name: "Featured Spotlight",
              price: "৳ 1,500 / 7 days",
              badge: "Quick Sales",
              popular: false,
              bullets: [
                "Top placement in search results",
                "Featured badge on property card",
                "Priority indexing for 7 days",
              ],
            },
            {
              id: "ai_priority",
              name: "AI Recommendation Priority",
              price: "৳ 2,500 / 14 days",
              badge: "Most Popular",
              popular: true,
              bullets: [
                "Ranked #1 in Homenet AI Matchmaker",
                "Instant SMS alerts to active buyers",
                "Featured across area landing pages",
              ],
            },
            {
              id: "omni_blast",
              name: "VIP Omni-Channel Blast",
              price: "৳ 4,500 / 30 days",
              badge: "Maximum Visibility",
              popular: false,
              bullets: [
                "Homepage hero showcase banner",
                "Weekly buyer newsletter highlight",
                "Dedicated WhatsApp partner advisor",
              ],
            },
          ].map((pkg) => (
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
                  Select Plan
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Your Boosted Properties</Text>
          <Text style={styles.tabCardSub}>Track live promotions, impressions, and expiry schedules</Text>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <Rocket color={colors.green} size={26} />
          </View>
          <Text style={styles.emptyTitle}>No Active Boosts</Text>
          <Text style={styles.emptyDesc}>
            None of your properties are currently boosted. Select a listing from your inventory to launch a campaign.
          </Text>
          <AppLink href="/my-properties" style={styles.emptyActionBtn}>
            <Text style={styles.emptyActionBtnText}>Manage My Listings</Text>
          </AppLink>
        </View>
      </View>
    </>
  );
}
