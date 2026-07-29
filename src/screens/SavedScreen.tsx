import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Heart, Search, SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton, AppLink, Eyebrow, SectionHeader, SelectField } from "@/components/ui";
import { allProperties, savedPropertyIds } from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";

export function SavedScreen() {
  const { isPhone } = useResponsive();
  const [savedIds, setSavedIds] = useState(savedPropertyIds);
  const [tab, setTab] = useState<"all" | "sale" | "rent">("all");
  const [sort, setSort] = useState("Recently saved");

  const savedHomes = useMemo(() => allProperties.filter((property) => savedIds.includes(property.id)), [savedIds]);
  const suggestions = allProperties.filter((property) => !savedIds.includes(property.id)).slice(0, 3);

  function toggleSaved(id: number) {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  }

  return (
    <AppChrome active="saved">
      <View style={[styles.pageIntro, isPhone && styles.pageIntroPhone]}>
        <View style={styles.introCopy}>
          <Eyebrow style={styles.eyebrow}>Your collection</Eyebrow>
          <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>Saved homes</Text>
          <Text style={styles.pageDescription}>Keep your shortlist together and compare the homes that feel right.</Text>
        </View>
        <View style={styles.pageActions}>
          <AppLink href="/" style={styles.secondaryLink}><ArrowLeft color={colors.green} size={15} /><Text style={styles.secondaryLinkText}>Back to home</Text></AppLink>
          <AppLink href="/buy" style={styles.primaryLink}><Text style={styles.primaryLinkText}>Browse homes</Text><ArrowRight color={colors.white} size={15} /></AppLink>
        </View>
      </View>

      {savedHomes.length ? (
        <ScrollView contentContainerStyle={[styles.previewStrip, isPhone && styles.previewStripPhone]} horizontal={isPhone} showsHorizontalScrollIndicator={false}>
          {savedHomes.slice(0, 3).map((property) => (
            <AppLink href={`/property/${property.id}`} key={property.id} style={[styles.previewCard, isPhone && styles.previewCardPhone]}>
              <ImageBackground source={{ uri: property.image }} style={styles.previewImage}>
                <LinearGradient colors={["transparent", "rgba(5,29,21,0.80)"]} style={StyleSheet.absoluteFill} />
                <Text style={styles.previewLocation}>{property.location}</Text>
                <Text style={styles.previewPrice}>{property.price}</Text>
              </ImageBackground>
            </AppLink>
          ))}
          {!isPhone ? <View style={styles.savedCount}><Heart color={colors.green} fill={colors.green} size={18} /><Text style={styles.savedCountNumber}>{savedHomes.length}</Text><Text style={styles.savedCountLabel}>saved homes</Text></View> : null}
        </ScrollView>
      ) : null}

      <View style={styles.savedContent}>
        <SectionHeader
          eyebrow="Shortlisted by you"
          right={
            <View style={styles.savedTools}>
              <View style={styles.segmented}>
                {(["all", "sale", "rent"] as const).map((value) => (
                  <Pressable key={value} onPress={() => setTab(value)} style={[styles.segmentButton, tab === value && styles.segmentButtonActive, webPointer]}>
                    <Text style={[styles.segmentText, tab === value && styles.segmentTextActive]}>{value === "all" ? "All" : value === "sale" ? "For sale" : "For rent"}</Text>
                  </Pressable>
                ))}
              </View>
              {!isPhone ? <View style={styles.sortSelect}><SlidersHorizontal color={colors.muted} size={14} /><SelectField onChange={setSort} options={["Recently saved", "Price: low to high", "Best AI match"]} style={styles.sortPicker} value={sort} /></View> : null}
            </View>
          }
          title="Saved properties"
        />
        {savedHomes.length ? (
          <PropertyGrid desktopColumns={2} horizontalOnPhone={false} tabletColumns={2} gap={17}>
            {savedHomes.map((property) => <PropertyCard imageHeight={isPhone ? 228 : 244} key={property.id} mode={tab === "rent" ? "rent" : "buy"} onSave={() => toggleSaved(property.id)} property={property} saved={savedIds.includes(property.id)} />)}
          </PropertyGrid>
        ) : (
          <View style={styles.emptyState}><View style={styles.emptyIcon}><Heart color={colors.green} size={28} /></View><Text style={styles.emptyTitle}>Your shortlist is ready for a first home</Text><Text style={styles.emptyCopy}>Save properties while you browse and they will appear here for easy comparison.</Text><AppButton icon={Search} label="Find a home" /></View>
        )}
      </View>

      <View style={styles.recommendations}>
        <SectionHeader eyebrow="Based on your shortlist" href="/buy" title="You may also like" />
        <PropertyGrid>{suggestions.map((property) => <PropertyCard key={property.id} onSave={() => toggleSaved(property.id)} property={property} saved={savedIds.includes(property.id)} />)}</PropertyGrid>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pageIntro: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 28, paddingTop: 22, paddingBottom: 25 },
  pageIntroPhone: { flexDirection: "column", alignItems: "flex-start", gap: 18, paddingTop: 13 },
  introCopy: { flex: 1 },
  eyebrow: { marginBottom: 7 },
  pageTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 46, lineHeight: 49, letterSpacing: -2.5 },
  pageTitlePhone: { fontSize: 33, lineHeight: 36, letterSpacing: -1.8 },
  pageDescription: { maxWidth: 580, marginTop: 9, color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
  pageActions: { flexDirection: "row", alignItems: "center", gap: 9 },
  secondaryLink: { minHeight: 41, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 17, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  secondaryLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 10 },
  primaryLink: { minHeight: 41, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 17, borderRadius: 999, backgroundColor: colors.green, borderWidth: 1, borderColor: colors.green },
  primaryLinkText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 10 },
  previewStrip: { flexDirection: "row", gap: 11, padding: 14, borderRadius: 18, backgroundColor: "#F7FAF8", borderWidth: 1, borderColor: colors.line },
  previewStripPhone: { padding: 0, backgroundColor: "transparent", borderWidth: 0, borderRadius: 0, gap: 9 },
  previewCard: { flex: 1, height: 112, overflow: "hidden", borderRadius: 12, backgroundColor: "#DBE5E0" },
  previewCardPhone: { width: 220, flex: 0 },
  previewImage: { flex: 1, justifyContent: "flex-end", padding: 12 },
  previewLocation: { color: "rgba(255,255,255,0.78)", fontFamily: fonts.regular, fontSize: 8 },
  previewPrice: { marginTop: 2, color: colors.white, fontFamily: fonts.extraBold, fontSize: 11 },
  savedCount: { width: 145, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderStyle: "dashed", borderColor: "#C7DED3" },
  savedCountNumber: { marginTop: 6, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 18 },
  savedCountLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 8 },
  savedContent: { marginTop: 38 },
  savedTools: { flexDirection: "row", alignItems: "center", gap: 9 },
  segmented: { flexDirection: "row", gap: 3, padding: 3, borderRadius: 9, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  segmentButton: { minHeight: 29, justifyContent: "center", paddingHorizontal: 10, borderRadius: 6 },
  segmentButtonActive: { backgroundColor: colors.white },
  segmentText: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 8 },
  segmentTextActive: { color: colors.greenDark },
  sortSelect: { width: 155, minHeight: 36, flexDirection: "row", alignItems: "center", gap: 2, paddingLeft: 9, borderRadius: 9, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sortPicker: { flex: 1, minHeight: 34 },
  emptyState: { minHeight: 330, alignItems: "center", justifyContent: "center", padding: 34, borderRadius: 18, backgroundColor: "#F8FBF9", borderWidth: 1, borderStyle: "dashed", borderColor: "#CBDCD4" },
  emptyIcon: { width: 60, height: 60, alignItems: "center", justifyContent: "center", borderRadius: 30, backgroundColor: colors.greenLight },
  emptyTitle: { marginTop: 17, marginBottom: 7, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 20, letterSpacing: -0.8, textAlign: "center" },
  emptyCopy: { maxWidth: 430, marginBottom: 18, color: colors.muted, fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, textAlign: "center" },
  recommendations: { marginTop: 50 },
});
