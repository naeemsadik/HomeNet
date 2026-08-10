import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Building2,
  Compass,
  Home,
  House,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trees,
  TrendingUp,
  Warehouse,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppLink, Eyebrow, SectionHeader, SelectField } from "@/components/ui";
import { allProperties, propertyImages } from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

const categories: { label: string; icon: LucideIcon }[] = [
  { label: "Apartments", icon: Building2 },
  { label: "Houses", icon: House },
  { label: "Condos", icon: Home },
  { label: "Land", icon: Trees },
  { label: "Commercial", icon: Store },
  { label: "Warehouses", icon: Warehouse },
];

const neighborhoods = [
  { name: "Gulshan", image: propertyImages.tower },
  { name: "Banani", image: propertyImages.apartment },
  { name: "Baridhara", image: propertyImages.house },
  { name: "Dhanmondi", image: propertyImages.living },
  { name: "Uttara", image: propertyImages.skyline },
  { name: "Bashundhara", image: propertyImages.bright },
];

export function HomeScreen() {
  const { isPhone, isTablet, width } = useResponsive();
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("Buy");
  const [activeCategory, setActiveCategory] = useState("Apartments");
  const [searchMessage, setSearchMessage] = useState("");

  const visibleProperties = useMemo(() => {
    if (!query.trim()) return allProperties.slice(0, 6);
    const normalized = query.toLowerCase();
    return allProperties.filter((property) => `${property.title} ${property.location}`.toLowerCase().includes(normalized));
  }, [query]);

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]);
  }

  function search() {
    const resultCount = visibleProperties.length;
    setSearchMessage(
      query.trim()
        ? `${resultCount} ${propertyType.toLowerCase()} option${resultCount === 1 ? "" : "s"} found near ${query}.`
        : `Showing AI-ranked homes available to ${propertyType.toLowerCase()}.`,
    );
  }

  return (
    <AppChrome active="home">
      <ImageBackground
        imageStyle={styles.heroImage}
        resizeMode="cover"
        source={{ uri: propertyImages.tower }}
        style={[styles.hero, isTablet && styles.heroTablet, isPhone && styles.heroPhone]}
      >
        <LinearGradient
          colors={isPhone ? ["rgba(49,91,194,0.58)", "rgba(5,91,69,0.82)", "rgba(5,91,69,0.98)"] : ["rgba(5,108,77,0.96)", "rgba(5,108,77,0.80)", "rgba(49,91,194,0.81)"]}
          end={isPhone ? { x: 0, y: 1 } : { x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroContent, isTablet && styles.heroContentTablet, isPhone && styles.heroContentPhone]}>
          <View style={styles.heroKicker}>
            <Sparkles color="rgba(255,255,255,0.82)" size={14} />
            <Eyebrow light>AI-powered home search</Eyebrow>
          </View>
          <Text style={[styles.heroTitle, isTablet && styles.heroTitleTablet, isPhone && styles.heroTitlePhone]}>Find a home you can trust, priced by AI.</Text>
          <Text style={[styles.heroCopy, isPhone && styles.heroCopyPhone]}>Search verified properties, compare fair values, and move with confidence.</Text>
          <View style={[styles.searchBox, isPhone && styles.searchBoxPhone]}>
            <View style={[styles.searchField, isPhone && styles.searchFieldPhone]}>
              <MapPin color={colors.green} size={19} />
              <TextInput
                accessibilityLabel="Search location"
                onChangeText={setQuery}
                onSubmitEditing={search}
                placeholder="Area, neighborhood, or property"
                placeholderTextColor="#899790"
                style={styles.searchInput}
                value={query}
              />
            </View>
            <SelectField onChange={setPropertyType} options={["Buy", "Rent"]} style={[styles.typeField, isPhone && styles.typeFieldPhone]} value={propertyType} />
            <Pressable onPress={search} style={({ pressed }) => [styles.searchButton, isPhone && styles.searchButtonPhone, webPointer, pressed && styles.pressed]}>
              <Search color={colors.white} size={18} />
              <Text style={styles.searchButtonText}>Search</Text>
            </Pressable>
          </View>
          <View style={styles.quickSearches}>
            <Text style={styles.quickLabel}>Popular:</Text>
            {["Gulshan", "Banani", "Dhanmondi"].map((area) => (
              <Pressable key={area} onPress={() => setQuery(area)} style={[styles.quickButton, webPointer]}>
                <Text style={styles.quickButtonText}>{area}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ImageBackground>

      <View style={[styles.categoryStrip, isPhone && styles.categoryStripPhone]}>
        {categories.slice(0, isPhone ? 4 : 6).map(({ label, icon: Icon }) => {
          const selected = activeCategory === label;
          return (
            <Pressable key={label} onPress={() => setActiveCategory(label)} style={[styles.categoryButton, { width: isPhone ? "23%" : "15.3%" }, webPointer]}>
              <View style={[styles.categoryIcon, isPhone && styles.categoryIconPhone, selected && styles.categoryIconActive]}>
                <Icon color={selected ? colors.white : colors.green} size={20} />
              </View>
              <Text style={[styles.categoryLabel, selected && styles.categoryLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.featuredSection}>
        <SectionHeader eyebrow="Handpicked for you" href="/buy" title="Featured properties" />
        <View style={[styles.featuredGrid, isPhone && styles.featuredGridPhone]}>
          {allProperties.slice(0, isPhone ? 1 : 2).map((property, index) => (
            <PropertyCard
              feature
              key={property.id}
              onSave={() => toggleFavorite(property.id)}
              property={property}
              saved={favorites.includes(property.id)}
              style={isPhone ? styles.featureCardPhone : { flex: index === 0 ? 1.28 : 0.72 }}
            />
          ))}
        </View>
      </View>

      <LinearGradient colors={["#EDF8F3", "#F3F5FB"]} end={{ x: 1, y: 0 }} style={[styles.trustBanner, isPhone && styles.trustBannerPhone]}>
        <View style={styles.trustIcon}><Sparkles color={colors.white} size={20} /></View>
        <View style={styles.trustCopyWrap}>
          <Text style={styles.trustTitle}>Buy with a clearer view of value</Text>
          <Text style={styles.trustCopy}>HomeNet compares location, amenities, demand, and recent sales to flag fair prices.</Text>
        </View>
        <AppLink href="/ai-finder" style={[styles.trustLink, isPhone && styles.trustLinkPhone]}>
          <Text style={styles.trustLinkText}>How AI pricing works</Text>
          <TrendingUp color={colors.green} size={15} />
        </AppLink>
      </LinearGradient>

      <View style={styles.contentSection}>
        <SectionHeader eyebrow={`Selected category: ${activeCategory}`} href="/buy" title="Recommended for you" />
        {searchMessage ? (
          <View style={styles.searchResult}><SlidersHorizontal color={colors.greenDark} size={15} /><Text style={styles.searchResultText}>{searchMessage}</Text></View>
        ) : null}
        <PropertyGrid>
          {(visibleProperties.length ? visibleProperties : allProperties).slice(0, 3).map((property) => (
            <PropertyCard badgeText="Est. fair" key={property.id} onSave={() => toggleFavorite(property.id)} property={property} saved={favorites.includes(property.id)} />
          ))}
        </PropertyGrid>
      </View>

      <View style={styles.contentSection}>
        <SectionHeader eyebrow="Homes moving this week" href="/buy" title="Trending near you" />
        <PropertyGrid>
          {allProperties.slice(3, 6).map((property) => (
            <PropertyCard badgeText="Est. fair" key={property.id} onSave={() => toggleFavorite(property.id)} property={property} saved={favorites.includes(property.id)} />
          ))}
        </PropertyGrid>
      </View>

      <View style={styles.contentSection}>
        <SectionHeader eyebrow="Explore the city" href="/buy" title="Popular neighborhoods" />
        <ScrollView contentContainerStyle={[styles.neighborhoodRow, !isPhone && styles.neighborhoodRowDesktop]} horizontal={isPhone} showsHorizontalScrollIndicator={false}>
          {neighborhoods.map((neighborhood) => (
            <AppLink href={`/buy?area=${neighborhood.name}`} key={neighborhood.name} style={[styles.neighborhood, isPhone ? styles.neighborhoodPhone : { width: `${(100 - 5 * 0.95) / 6}%` }]}>
              <ImageBackground source={{ uri: neighborhood.image }} style={styles.neighborhoodImage}>
                <LinearGradient colors={["transparent", "rgba(5,26,20,0.80)"]} style={StyleSheet.absoluteFill} />
                <Text style={styles.neighborhoodName}>{neighborhood.name}</Text>
              </ImageBackground>
            </AppLink>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.marketSection, isPhone && styles.marketSectionPhone]}>
        <View style={styles.marketHeading}>
          <View><Eyebrow style={styles.marketEyebrow}>HomeNet intelligence</Eyebrow><Text style={styles.marketTitle}>Dhaka market pulse</Text></View>
          <Text style={styles.marketUpdated}>Updated this week</Text>
        </View>
        <View style={[styles.marketGrid, isTablet && styles.marketGridTablet]}>
          <View style={styles.trendCard}>
            <View style={styles.trendTopline}>
              <View><Text style={styles.trendLabel}>Average asking price</Text><View style={styles.trendPriceRow}><Text style={styles.trendPrice}>BDT 12,480</Text><Text style={styles.trendUnit}>per sq ft</Text></View></View>
              <View style={styles.trendUp}><TrendingUp color={colors.green} size={15} /><Text style={styles.trendUpText}>4.8%</Text></View>
            </View>
            <View style={styles.barChart}>
              {[38, 48, 45, 62, 72, 88, 81, 96, 106, 120, 132, 146].map((height, index) => <LinearGradient colors={["rgba(8,122,91,0.20)", "rgba(8,122,91,0.72)"]} key={index} style={[styles.bar, { height }]} />)}
            </View>
            <View style={styles.chartLabels}>{["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => <Text key={month} style={styles.chartLabel}>{month}</Text>)}</View>
          </View>
          <View style={[styles.marketList, isTablet && styles.marketListTablet]}>
            {[
              ["Homes for sale", "1,284", Compass],
              ["Median time listed", "34 days", Bell],
              ["Buyer competition", "High", TrendingUp],
              ["AI fair-price matches", "86%", ShieldCheck],
            ].map(([label, value, Icon]) => {
              const MarketIcon = Icon as LucideIcon;
              return <View key={label as string} style={styles.marketListRow}><View style={styles.marketListIcon}><MarketIcon color={colors.green} size={17} /></View><Text style={styles.marketListLabel}>{label as string}</Text><Text style={styles.marketListValue}>{value as string}</Text></View>;
            })}
          </View>
        </View>
      </View>

      <View style={styles.contentSection}>
        <SectionHeader eyebrow="Learn before you move" href="/about" title="Latest property guides" />
        <ScrollView contentContainerStyle={[styles.articleGrid, !isPhone && styles.articleGridDesktop]} horizontal={isPhone} showsHorizontalScrollIndicator={false}>
          {[
            ["A practical guide to buying your first apartment", propertyImages.apartment, "8 min read"],
            ["Five details to check before making an offer", propertyImages.interior, "6 min read"],
            ["What Dhaka home values are telling us now", propertyImages.skyline, "5 min read"],
          ].map(([title, image, readTime]) => (
            <View key={title} style={[styles.articleCard, isPhone ? { width: Math.min(width * 0.78, 302) } : { width: "32.5%" }]}>
              <ImageBackground source={{ uri: image }} style={styles.articleImage} />
              <View style={styles.articleBody}><Eyebrow>{readTime}</Eyebrow><Text style={styles.articleTitle}>{title}</Text><AppLink href="/about"><Text style={styles.articleLink}>Read guide</Text></AppLink></View>
            </View>
          ))}
        </ScrollView>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.8 },
  hero: { minWidth: 0, width: "100%", maxWidth: "100%", minHeight: 355, overflow: "hidden", borderRadius: 24, backgroundColor: "#135F65", ...shadow },
  heroTablet: { minHeight: 415, borderRadius: 19 },
  heroPhone: { minHeight: 446 },
  heroImage: { borderRadius: 24 },
  heroContent: { minHeight: 355, justifyContent: "center", padding: 61 },
  heroContentTablet: { minHeight: 415, justifyContent: "flex-end", padding: 30 },
  heroContentPhone: { minHeight: 446, paddingHorizontal: 21, paddingVertical: 25 },
  heroKicker: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 13 },
  heroTitle: { maxWidth: 540, color: colors.white, fontFamily: fonts.bold, fontSize: 52, letterSpacing: -2.9, lineHeight: 55 },
  heroTitleTablet: { fontSize: 44, lineHeight: 47 },
  heroTitlePhone: { maxWidth: 340, fontSize: 34, lineHeight: 36, letterSpacing: -1.9 },
  heroCopy: { maxWidth: 560, marginTop: 13, marginBottom: 22, color: "rgba(242,250,255,0.78)", fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  heroCopyPhone: { fontSize: 11, lineHeight: 17, marginTop: 11, marginBottom: 18 },
  searchBox: { width: "100%", maxWidth: 720, minHeight: 55, flexDirection: "row", gap: 6, padding: 6, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" },
  searchBoxPhone: { maxWidth: "100%", minWidth: 0, minHeight: 102, flexWrap: "wrap", overflow: "hidden", borderRadius: 15 },
  searchField: { minWidth: 0, flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 },
  searchFieldPhone: { flexBasis: "68%", height: 44 },
  searchInput: { minWidth: 0, flex: 1, color: colors.ink, fontFamily: fonts.regular, fontSize: 12 },
  typeField: { width: 100, borderLeftWidth: 1, borderLeftColor: colors.line },
  typeFieldPhone: { width: 84, height: 44 },
  searchButton: { width: 110, minHeight: 43, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 999, backgroundColor: colors.green },
  searchButtonPhone: { width: "100%", minHeight: 42, borderRadius: 10 },
  searchButtonText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 14 },
  quickSearches: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  quickLabel: { color: "rgba(255,255,255,0.69)", fontFamily: fonts.regular, fontSize: 10 },
  quickButton: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.19)" },
  quickButtonText: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.regular, fontSize: 10 },
  categoryStrip: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 27, marginBottom: 52 },
  categoryStripPhone: { gap: 4, marginTop: 20, marginBottom: 37 },
  categoryButton: { alignItems: "center", gap: 8, padding: 5 },
  categoryIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, backgroundColor: "#F1F8F5", borderWidth: 1, borderColor: "#E2EEE8" },
  categoryIconPhone: { width: 42, height: 42, borderRadius: 21 },
  categoryIconActive: { backgroundColor: colors.green, borderColor: colors.green },
  categoryLabel: { color: "#687A72", fontFamily: fonts.bold, fontSize: 10 },
  categoryLabelActive: { color: colors.greenDark, fontFamily: fonts.extraBold },
  featuredSection: { marginTop: 0 },
  featuredGrid: { flexDirection: "row", gap: 15 },
  featuredGridPhone: { flexDirection: "column" },
  featureCardPhone: { width: "100%" },
  contentSection: { marginTop: 47 },
  trustBanner: { flexDirection: "row", alignItems: "center", gap: 15, marginTop: 25, paddingHorizontal: 22, paddingVertical: 19, borderRadius: 15, borderWidth: 1, borderColor: "#E2EEE8" },
  trustBannerPhone: { flexWrap: "wrap", padding: 16 },
  trustIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.green },
  trustCopyWrap: { flex: 1, minWidth: 180 },
  trustTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 12 },
  trustCopy: { marginTop: 4, color: colors.muted, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15 },
  trustLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustLinkPhone: { marginLeft: 54 },
  trustLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 9 },
  searchResult: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: -5, marginBottom: 15 },
  searchResultText: { color: colors.greenDark, fontFamily: fonts.bold, fontSize: 10 },
  neighborhoodRow: { gap: 11 },
  neighborhoodRowDesktop: { width: "100%", flexDirection: "row" },
  neighborhood: { height: 125, overflow: "hidden", borderRadius: 14, backgroundColor: "#D8E1DD" },
  neighborhoodPhone: { width: 108, height: 108 },
  neighborhoodImage: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 8, paddingBottom: 10 },
  neighborhoodName: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 10 },
  marketSection: { marginTop: 53, padding: 27, borderRadius: 20, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  marketSectionPhone: { paddingHorizontal: 14, paddingVertical: 20 },
  marketHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 18 },
  marketEyebrow: { marginBottom: 4 },
  marketTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 24, letterSpacing: -1 },
  marketUpdated: { color: colors.muted, fontFamily: fonts.regular, fontSize: 9 },
  marketGrid: { flexDirection: "row", gap: 18 },
  marketGridTablet: { flexDirection: "column" },
  trendCard: { flex: 1.25, paddingHorizontal: 21, paddingTop: 21, paddingBottom: 15, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: "#E7ECE9" },
  trendTopline: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  trendLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 9 },
  trendPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 7, marginTop: 2 },
  trendPrice: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 20, letterSpacing: -0.8 },
  trendUnit: { color: colors.muted, fontFamily: fonts.regular, fontSize: 8 },
  trendUp: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: colors.greenLight },
  trendUpText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 9 },
  barChart: { height: 155, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", gap: 7, marginTop: 15, paddingTop: 9, paddingHorizontal: 7, borderBottomWidth: 1, borderBottomColor: "#DFE8E3" },
  bar: { width: "6%", maxHeight: 145, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 7, paddingTop: 8 },
  chartLabel: { color: "#91A098", fontFamily: fonts.regular, fontSize: 8 },
  marketList: { flex: 0.75, justifyContent: "center", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: "#E7ECE9" },
  marketListTablet: { flexDirection: "row", flexWrap: "wrap" },
  marketListRow: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#EDF2EF" },
  marketListIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#EDF7F2" },
  marketListLabel: { flex: 1, color: colors.muted, fontFamily: fonts.regular, fontSize: 9 },
  marketListValue: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 10 },
  articleGrid: { gap: 15 },
  articleGridDesktop: { width: "100%", flexDirection: "row" },
  articleCard: { overflow: "hidden", borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  articleImage: { height: 145 },
  articleBody: { paddingHorizontal: 15, paddingTop: 14, paddingBottom: 16 },
  articleTitle: { minHeight: 37, marginTop: 7, marginBottom: 12, color: colors.ink, fontFamily: fonts.bold, fontSize: 12, lineHeight: 17 },
  articleLink: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 9 },
});
