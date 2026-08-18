import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Compass,
  Home,
  KeyRound,
  LandPlot,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { AppChrome } from "@/components/AppChrome";
import { AreaPicker } from "@/components/AreaPicker";
import { PropertyCard } from "@/components/PropertyCard";
import { AppLink } from "@/components/ui";
import {
  aiInvestmentPicksListings,
  featuredListings,
  latestNews,
  popularLocations,
  recentlyAddedListings,
  recommendedListings,
  trustedPartners,
  verifiedPropertiesListings,
} from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

const categoryButtons: { label: string; icon: LucideIcon }[] = [
  { label: "Apartment", icon: Building2 },
  { label: "House", icon: Home },
  { label: "Commercial", icon: Briefcase },
  { label: "Land", icon: LandPlot },
  { label: "Rent", icon: KeyRound },
  { label: "Sale", icon: BadgePercent },
];

export function HomeScreen() {
  const { isPhone, isTablet, width } = useResponsive();
  const [favorites, setFavorites] = useState<number[]>([1, 7]);
  const [heroSearch, setHeroSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Apartment");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Dhaka");

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favId) => favId !== id) : [...current, id]
    );
  }

  return (
    <AppChrome active="home">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Figma data-node-id="1:92")
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.heroContainer, isPhone && styles.heroContainerPhone]}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
          }}
          style={styles.heroBg}
          resizeMode="cover"
        >
          {/* Exact Figma Hero Gradient Overlay: 136.17deg from rgba(15, 109, 85, 0.92) to rgba(34, 81, 214, 0.75) */}
          <LinearGradient
            colors={["rgba(15, 109, 85, 0.92)", "rgba(34, 81, 214, 0.75)"]}
            end={{ x: 1, y: 0.85 }}
            start={{ x: 0, y: 0.15 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.heroContent, isPhone && styles.heroContentPhone]}>
            {/* Tag Pill */}
            <View style={styles.heroTagPill}>
              <Sparkles color="#FFFFFF" size={14} />
              <Text style={styles.heroTagText}>
                Bangladesh's AI property marketplace
              </Text>
            </View>

            {/* Heading 1 */}
            <Text style={[styles.heroHeading, isPhone && styles.heroHeadingPhone]}>
              Find a home you can trust, priced by AI.
            </Text>

            {/* Subtitle Paragraph */}
            <Text style={[styles.heroSubtitle, isPhone && styles.heroSubtitlePhone]}>
              Verified listings, AI valuation and investment scores for apartments, houses, land and commercial spaces across Bangladesh.
            </Text>

            {/* Hero Search Box */}
            <View style={[styles.heroSearchBox, isPhone && styles.heroSearchBoxPhone]}>
              <Search color="#5C6B66" size={isPhone ? 18 : 20} />
              <TextInput
                onChangeText={setHeroSearch}
                placeholder={isPhone ? "Search area, project or AI…" : "Try: 3 bedroom in Gulshan under 40000"}
                placeholderTextColor="#5C6B66"
                style={[styles.heroSearchInput, isPhone && styles.heroSearchInputPhone]}
                value={heroSearch}
              />
              <AppLink
                href={`/buy?query=${encodeURIComponent(heroSearch)}`}
                style={[styles.heroAiSearchBtn, isPhone && styles.heroAiSearchBtnPhone]}
              >
                <Sparkles color="#FFFFFF" size={isPhone ? 14 : 16} />
                <Text style={[styles.heroAiSearchBtnText, isPhone && styles.heroAiSearchBtnTextPhone]}>
                  AI Search
                </Text>
              </AppLink>
            </View>

            {/* Below Search Meta Row */}
            <View style={[styles.heroMetaRow, isPhone && styles.heroMetaRowPhone]}>
              {/* Location Pill */}
              <Pressable
                onPress={() => setAreaPickerOpen(true)}
                style={[styles.heroLocationPill, webPointer]}
                accessibilityRole="button"
                accessibilityLabel={`Select location, current: ${selectedLocation}`}
              >
                <MapPin color="#0B1A17" size={16} />
                <Text style={styles.heroLocationPillText}>{selectedLocation}</Text>
                <ChevronDown color="#5C6B66" size={16} />
              </Pressable>

              <View style={styles.heroMetaItem}>
                <ShieldCheck color="rgba(255, 255, 255, 0.9)" size={16} />
                <Text style={styles.heroMetaText}>12,400+ verified</Text>
              </View>

              <View style={styles.heroMetaItem}>
                <TrendingUp color="rgba(255, 255, 255, 0.9)" size={16} />
                <Text style={styles.heroMetaText}>Live market data</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORY BUTTONS ROW (Figma data-node-id="1:147")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categoryButtons.map(({ label, icon: Icon }) => {
            const isSelected = activeCategory === label;
            return (
              <Pressable
                key={label}
                onPress={() => setActiveCategory(label)}
                style={[styles.categoryCard, webPointer]}
              >
                <View style={styles.categoryIconCircle}>
                  <Icon color="#0F6D55" size={24} strokeWidth={1.8} />
                </View>
                <Text style={styles.categoryCardText}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          3. FEATURED PROPERTIES (Figma data-node-id="1:194")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured properties</Text>
            <Text style={styles.sectionSubtitle}>Hand-picked premium listings</Text>
          </View>
          <AppLink href="/buy" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color="#0F6D55" size={16} />
          </AppLink>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredCardsRow}
        >
          {featuredListings.map((item) => (
            <AppLink
              href={`/property/${item.id}`}
              key={item.id}
              style={[
                styles.featuredCard,
                isPhone && { width: Math.min(width - 48, 380) },
              ]}
            >
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.featuredCardBg}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0, 0, 0, 0.0)", "rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.7)"]}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />

                {/* Top badges */}
                <View style={styles.featuredTopBadges}>
                  <View style={styles.featuredVerifiedBadge}>
                    <ShieldCheck color="#0F6D55" size={14} />
                    <Text style={styles.featuredVerifiedText}>Verified</Text>
                  </View>
                  {item.investmentScore ? (
                    <View style={styles.featuredInvestmentBadge}>
                      <Text style={styles.featuredInvestmentText}>
                        {item.investmentScore}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Bottom details */}
                <View style={styles.featuredBottomDetails}>
                  <Text style={styles.featuredLocation}>{item.location}</Text>
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredPrice}>{item.price}</Text>
                </View>
              </ImageBackground>
            </AppLink>
          ))}
        </ScrollView>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          4. AI INVESTMENT PICKS BANNER CARD (Figma data-node-id="1:276")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <LinearGradient
          colors={["#E7F2EE", "#E8EEFC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={styles.aiInsightCard}
        >
          <View style={styles.aiInsightHeader}>
            <View style={styles.aiInsightIconCircle}>
              <Sparkles color="#FFFFFF" size={16} />
            </View>
            <Text style={styles.aiInsightTitle}>AI Investment Picks</Text>
          </View>

          <Text style={styles.aiInsightBody}>
            Based on price trends and rental yield,{" "}
            <Text style={styles.aiInsightBodyBold}>Banani &amp; Bashundhara</Text> show
            the strongest growth this quarter — up to{" "}
            <Text style={styles.aiInsightBodyBold}>+11%</Text>. Explore AI-scored
            listings with the highest projected returns.
          </Text>

          <AppLink href="/ai-finder" style={styles.aiInsightLink}>
            <Text style={styles.aiInsightLinkText}>Explore picks</Text>
            <ArrowUpRight color="#0F6D55" size={16} />
          </AppLink>
        </LinearGradient>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          5. RECOMMENDED FOR YOU (Figma data-node-id="1:295")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <Text style={styles.sectionSubtitle}>Tuned to your searches</Text>
          </View>
          <AppLink href="/buy" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color="#0F6D55" size={16} />
          </AppLink>
        </View>

        <View style={[styles.propertiesGrid, isPhone && styles.propertiesGridPhone]}>
          {recommendedListings.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              saved={favorites.includes(prop.id)}
              onSave={() => toggleFavorite(prop.id)}
              style={styles.propertyCardItem}
            />
          ))}
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          6. RECENTLY ADDED (Figma data-node-id="1:496")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently added</Text>
          <AppLink href="/buy" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color="#0F6D55" size={16} />
          </AppLink>
        </View>

        <View style={[styles.propertiesGrid, isPhone && styles.propertiesGridPhone]}>
          {recentlyAddedListings.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              saved={favorites.includes(prop.id)}
              onSave={() => toggleFavorite(prop.id)}
              style={styles.propertyCardItem}
            />
          ))}
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          7. VERIFIED PROPERTIES (Figma data-node-id="1:698")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <View style={styles.titleWithIconRow}>
              <ShieldCheck color="#0B1A17" size={20} />
              <Text style={styles.sectionTitle}>Verified properties</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Documents checked by Homenet</Text>
          </View>
          <AppLink href="/buy" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color="#0F6D55" size={16} />
          </AppLink>
        </View>

        <View style={[styles.propertiesGrid, isPhone && styles.propertiesGridPhone]}>
          {verifiedPropertiesListings.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              saved={favorites.includes(prop.id)}
              onSave={() => toggleFavorite(prop.id)}
              style={styles.propertyCardItem}
            />
          ))}
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          8. AI INVESTMENT PICKS (Figma data-node-id="1:902")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <View style={styles.titleWithIconRow}>
              <Sparkles color="#0B1A17" size={20} />
              <Text style={styles.sectionTitle}>AI investment picks</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Highest projected returns</Text>
          </View>
          <AppLink href="/ai-finder" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight color="#0F6D55" size={16} />
          </AppLink>
        </View>

        <View style={[styles.propertiesGrid, isPhone && styles.propertiesGridPhone]}>
          {aiInvestmentPicksListings.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              saved={favorites.includes(prop.id)}
              onSave={() => toggleFavorite(prop.id)}
              style={styles.propertyCardItem}
            />
          ))}
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          9. MAJOR CITIES ACROSS BANGLADESH (Figma data-node-id="1:1098")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Explore major cities</Text>
            <Text style={styles.sectionSubtitle}>Browse verified properties across Bangladesh</Text>
          </View>
          <Pressable
            onPress={() => setAreaPickerOpen(true)}
            style={[styles.seeAllLink, webPointer]}
          >
            <Text style={styles.seeAllText}>All areas</Text>
            <ChevronRight color="#0F6D55" size={16} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locationsRow}
        >
          {popularLocations.map((loc) => (
            <Pressable
              key={loc.name}
              onPress={() => {
                setSelectedLocation(loc.name);
                setAreaPickerOpen(true);
              }}
              style={[styles.locationCard, webPointer]}
            >
              <ImageBackground
                source={{ uri: loc.image }}
                style={styles.locationCardBg}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.locationCardCaption}>
                  <Text style={styles.locationCardName}>{loc.name}</Text>
                  <Text style={styles.locationCardCount}>{loc.count}</Text>
                  {"subtext" in loc && (
                    <Text numberOfLines={1} style={styles.locationCardSubtext}>
                      {(loc as any).subtext}
                    </Text>
                  )}
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          10. MARKET INSIGHTS & TRUSTED PARTNERS (Figma data-node-id="1:1156")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={[styles.twoColSection, isTablet && styles.twoColSectionTablet]}>
          {/* Left: Market insights */}
          <View style={styles.marketInsightCard}>
            <View style={styles.sectionHeaderInner}>
              <View>
                <Text style={styles.sectionTitle}>Market insights</Text>
                <Text style={styles.sectionSubtitle}>
                  Avg. price per sqft (in ৳ thousands)
                </Text>
              </View>
              <View style={styles.trendPill}>
                <TrendingUp color="#0F6D55" size={12} />
                <Text style={styles.trendPillText}>+8.4%</Text>
              </View>
            </View>

            {/* SVG Area Chart */}
            <View style={styles.chartWrapper}>
              <Svg height="160" width="100%" viewBox="0 0 360 160">
                <Defs>
                  <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#0F6D55" stopOpacity="0.35" />
                    <Stop offset="100%" stopColor="#0F6D55" stopOpacity="0.0" />
                  </SvgGradient>
                </Defs>

                {/* Filled Area */}
                <Path
                  d="M 10 120 C 60 110, 110 95, 160 85 C 210 75, 260 55, 310 40 C 330 35, 345 32, 350 30 L 350 150 L 10 150 Z"
                  fill="url(#chartGradient)"
                />

                {/* Smooth Curve Line */}
                <Path
                  d="M 10 120 C 60 110, 110 95, 160 85 C 210 75, 260 55, 310 40 C 330 35, 345 32, 350 30"
                  fill="none"
                  stroke="#0F6D55"
                  strokeWidth="2.5"
                />
              </Svg>

              {/* Month Labels */}
              <View style={styles.chartMonthsRow}>
                {["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
                  <Text key={month} style={styles.chartMonthText}>
                    {month}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Right: Trusted partners */}
          <View style={styles.trustedPartnersCard}>
            <View style={styles.sectionHeaderInner}>
              <View>
                <Text style={styles.sectionTitle}>Trusted partners</Text>
                <Text style={styles.sectionSubtitle}>Verified agencies on Homenet</Text>
              </View>
            </View>

            <View style={styles.partnersList}>
              {trustedPartners.map((partner) => (
                <View key={partner.name} style={styles.partnerRow}>
                  <View style={styles.partnerInfoWrap}>
                    <View style={styles.partnerAvatarCircle}>
                      <Text style={styles.partnerAvatarText}>{partner.initial}</Text>
                    </View>
                    <View>
                      <View style={styles.partnerNameRow}>
                        <Text style={styles.partnerNameText}>{partner.name}</Text>
                        <ShieldCheck color="#0F6D55" size={16} />
                      </View>
                      <Text style={styles.partnerDealsText}>{partner.deals}</Text>
                    </View>
                  </View>

                  <AppLink href="/users" style={styles.partnerViewBtn}>
                    <Text style={styles.partnerViewBtnText}>View</Text>
                  </AppLink>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          11. LATEST PROPERTY NEWS (Figma data-node-id="1:1262")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest property news</Text>
          <AppLink href="/about" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See all</Text>
          </AppLink>
        </View>

        <View style={[styles.newsGrid, isPhone && styles.newsGridPhone]}>
          {latestNews.map((article) => (
            <AppLink href="/about" key={article.id} style={styles.newsCard}>
              <View style={styles.newsImageWrap}>
                <Image
                  source={{ uri: article.image }}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.newsBody}>
                <View style={styles.newsTagRow}>
                  <View style={styles.newsTagPill}>
                    <Text style={styles.newsTagPillText}>{article.tag}</Text>
                  </View>
                  <Text style={styles.newsTimeText}>{article.time}</Text>
                </View>
                <Text numberOfLines={2} style={styles.newsTitle}>
                  {article.title}
                </Text>
              </View>
            </AppLink>
          ))}
        </View>
      </View>

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        onSelect={(area) => {
          setSelectedLocation(area?.name || area?.city || "Dhaka");
        }}
        selectedArea={null}
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  sectionSpacing: {
    marginTop: 40,
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeaderInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  titleWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  seeAllLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  /* 1. Hero Section */
  heroContainer: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    minHeight: 495,
  },
  heroContainerPhone: {
    minHeight: 460,
  },
  heroBg: {
    width: "100%",
    minHeight: 495,
    justifyContent: "center",
  },
  heroContent: {
    paddingHorizontal: 40,
    paddingVertical: 56,
    maxWidth: 760,
  },
  heroContentPhone: {
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  heroTagPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroTagText: {
    color: "#FFFFFF",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  heroHeading: {
    color: "#FFFFFF",
    fontFamily: fonts.headingExtraBold,
    fontSize: 47.8,
    fontWeight: "800",
    lineHeight: 50.2,
    letterSpacing: -0.95,
    marginBottom: 12,
  },
  heroHeadingPhone: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 576,
  },
  heroSubtitlePhone: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingLeft: 20.8,
    paddingRight: 6.8,
    paddingVertical: 6.8,
    minHeight: 56,
    gap: 8,
    maxWidth: 672,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  heroSearchBoxPhone: {
    width: "100%",
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 6,
  },
  heroSearchInput: {
    flex: 1,
    minWidth: 0,
    height: 42,
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 8,
    outlineStyle: "none",
  } as any,
  heroSearchInputPhone: {
    fontSize: 14,
    height: 38,
    paddingVertical: 6,
  },
  heroAiSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F6D55",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexShrink: 0,
  },
  heroAiSearchBtnPhone: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 4,
  },
  heroAiSearchBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  heroAiSearchBtnTextPhone: {
    fontSize: 12,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    flexWrap: "wrap",
  },
  heroMetaRowPhone: {
    gap: 10,
  },
  heroLocationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingHorizontal: 12.8,
    paddingVertical: 8.8,
  },
  heroLocationPillText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroMetaText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  /* 2. Category Cards */
  categoryRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  categoryCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 16.8,
    alignItems: "center",
    gap: 8,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E7F2EE",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCardText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  /* 3. Featured Properties */
  featuredCardsRow: {
    flexDirection: "row",
    gap: 20,
  },
  featuredCard: {
    width: 520,
    height: 325,
    borderRadius: 24,
    overflow: "hidden",
  },
  featuredCardBg: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    padding: 16,
  },
  featuredTopBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredVerifiedText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredInvestmentBadge: {
    backgroundColor: "#FDEEE2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredInvestmentText: {
    color: "#F4823A",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredBottomDetails: {
    gap: 2,
  },
  featuredLocation: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
  },
  featuredPrice: {
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginTop: 2,
  },

  /* 4. AI Insight Banner Card */
  aiInsightCard: {
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(15, 109, 85, 0.15)",
    padding: 20.8,
    gap: 8,
  },
  aiInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiInsightIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  aiInsightTitle: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  aiInsightBody: {
    color: "rgba(11, 26, 23, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  aiInsightBodyBold: {
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  aiInsightLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  aiInsightLinkText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },

  /* 5, 6, 7, 8: Property Grid */
  propertiesGrid: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  propertiesGridPhone: {
    flexDirection: "column",
  },
  propertyCardItem: {
    flex: 1,
    minWidth: 260,
  },

  /* 9. Popular Locations / Major Cities */
  locationsRow: {
    flexDirection: "row",
    gap: 14,
    paddingRight: 16,
  },
  locationCard: {
    width: 172,
    height: 154,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  locationCardBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    padding: 14,
  },
  locationCardCaption: {
    gap: 2,
  },
  locationCardName: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  locationCardCount: {
    color: "#4AE8B0",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  locationCardSubtext: {
    color: "rgba(255, 255, 255, 0.75)",
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
  },

  /* 10. Market Insights & Trusted Partners */
  twoColSection: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  twoColSectionTablet: {
    flexDirection: "column",
  },
  marketInsightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24.8,
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  trendPillText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  chartWrapper: {
    marginTop: 16,
    width: "100%",
  },
  chartMonthsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  chartMonthText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
  },

  trustedPartnersCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 24.8,
  },
  partnersList: {
    gap: 12,
    marginTop: 8,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 12,
  },
  partnerInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  partnerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerAvatarText: {
    color: "#2251D6",
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  partnerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partnerNameText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  partnerDealsText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  partnerViewBtn: {
    paddingHorizontal: 12.8,
    paddingVertical: 6.8,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    backgroundColor: "#FFFFFF",
  },
  partnerViewBtnText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },

  /* 11. Latest Property News */
  newsGrid: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  newsGridPhone: {
    flexDirection: "column",
  },
  newsCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    padding: 0.8,
  },
  newsImageWrap: {
    height: 157,
    backgroundColor: "#F4F6F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsBody: {
    padding: 16,
    gap: 8,
  },
  newsTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newsTagPill: {
    backgroundColor: "#E8EEFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newsTagPillText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  newsTimeText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  newsTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
