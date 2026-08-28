import {
  Building2,
  Check,
  Grid2X2,
  List,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton, AppLink, Eyebrow, SelectField } from "@/components/ui";
import { savedPropertyIds, type Property as CardProperty } from "@/data/properties";
import { usePropertyFeed } from "@/features/property/hooks/usePropertyFeed";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

import { AreaPicker } from "@/components/AreaPicker";
import type { Area, PropertyType } from "@/types/api";

type BrowseCardProperty = Omit<CardProperty, "id"> & { id: string };

function FilterPanel({
  beds,
  setBeds,
  mode,
  checks,
  toggleCheck,
  resetFilters,
  onClose,
  modal = false,
}: {
  beds: number;
  setBeds: (val: number) => void;
  mode: "buy" | "rent";
  checks: string[];
  toggleCheck: (val: string) => void;
  resetFilters: () => void;
  onClose?: () => void;
  modal?: boolean;
}) {
  return (
    <View style={[styles.filterPanel, modal && styles.filterPanelModal]}>
      <View style={styles.filterHeading}>
        <Text style={styles.filterHeadingText}>Filters</Text>
        {onClose ? (
          <Pressable accessibilityLabel="Close filters modal" onPress={onClose} style={webPointer}>
            <X color={colors.muted} size={16} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Bedrooms</Text>
        <View style={styles.optionRow}>
          {[0, 1, 2, 3, 4].map((count) => {
            const active = beds === count;
            const text = count === 0 ? "Any" : `${count}+`;
            return (
              <Pressable
                key={count}
                accessibilityLabel={`${count} bedrooms`}
                onPress={() => setBeds(count)}
                style={[styles.optionButton, active && styles.optionButtonActive, webPointer]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{text}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Trust verification</Text>
        <View style={styles.checkList}>
          {["AI verified price", "Verified title deed", "Home inspection report"].map((check) => {
            const active = checks.includes(check);
            return (
              <Pressable
                key={check}
                accessibilityLabel={check}
                onPress={() => toggleCheck(check)}
                style={[styles.checkRow, webPointer]}
              >
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? <Check color={colors.white} size={11} /> : null}
                </View>
                <Text style={styles.checkLabel}>{check}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Pressable accessibilityLabel="Reset all filters" onPress={resetFilters} style={[styles.resetButton, webPointer]}>
        <Text style={styles.resetText}>RESET FILTERS</Text>
      </Pressable>
    </View>
  );
}

export function BrowseScreen({ mode }: { mode: "buy" | "rent" }) {
  const { isPhone, isTablet } = useResponsive();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [beds, setBeds] = useState(0);
  const [savedIds, setSavedIds] = useState<Array<string | number>>(savedPropertyIds);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [checks, setChecks] = useState(["AI verified price"]);

  // Location Picker State
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedAreaPath, setSelectedAreaPath] = useState<Area[]>([]);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  const apiFilters = useMemo(
    () => ({
      listing_type: mode === "buy" ? ("sale" as const) : ("rent" as const),
      area_id: selectedArea?.id,
      search: query.trim() || undefined,
      type: type === "All types" ? undefined : (type.toLowerCase() as PropertyType),
      bedrooms: beds || undefined,
      status: "active" as const,
      limit: 18,
    }),
    [beds, mode, query, selectedArea?.id, type],
  );
  const { properties, loading, error, hasMore, fetchingNextPage, loadMore, refresh } = usePropertyFeed(apiFilters);
  const results = useMemo(
    () =>
      properties.map((property): BrowseCardProperty => {
        const amenities = property.amenities ?? {};
        const formattedPrice = `${property.price_currency || "BDT"} ${property.price.toLocaleString()}`;
        return {
          id: property.id,
          title: property.title,
          location:
            [property.area?.name, property.area?.city].filter(Boolean).join(", ") ||
            property.address ||
            "Location unavailable",
          price: formattedPrice,
          monthlyPrice: `${formattedPrice}/mo`,
          image: property.media?.find((media) => media.media_type === "image")?.url || "",
          tag: property.is_verified ? "Verified" : "",
          beds: Number(amenities.bedrooms ?? 0),
          baths: Number(amenities.bathrooms ?? 0),
          area: `${property.area_size?.toLocaleString() ?? "N/A"} ${property.area_unit || "sqft"}`,
          type:
            property.type === "commercial"
              ? "Commercial"
              : property.subtype?.toLowerCase().includes("house")
                ? "House"
                : property.subtype?.toLowerCase().includes("condo")
                  ? "Condo"
                  : "Apartment",
          forRent: property.listing_type === "rent",
          isVerified: property.is_verified,
        };
      }),
    [properties],
  );

  function toggleSaved(id: string | number) {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  }

  function resetFilters() {
    setQuery("");
    setType("All types");
    setBeds(0);
    setChecks(["AI verified price"]);
    setSelectedArea(null);
    setSelectedAreaPath([]);
  }

  function toggleCheck(value: string) {
    setChecks((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  const title = mode === "buy" ? "Homes for sale" : "Homes for rent";
  const description = mode === "buy" ? "Explore verified properties with AI-backed price guidance." : "Find a verified rental with clear monthly pricing and local context.";

  return (
    <AppChrome active={mode}>
      <View style={[styles.pageIntro, isPhone && styles.pageIntroPhone]}>
        <View style={styles.pageIntroCopy}>
          <Eyebrow style={styles.introEyebrow}>Verified across Dhaka</Eyebrow>
          <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>{title}</Text>
          <Text style={styles.pageDescription}>{description}</Text>
        </View>
        <AppLink href={mode === "buy" ? "/rent" : "/buy"} style={[styles.switchLink, isPhone && styles.switchLinkPhone]}>
          <Text style={styles.switchLinkText}>{mode === "buy" ? "View rentals" : "View homes for sale"}</Text>
        </AppLink>
      </View>

      <View style={[styles.searchPanel, isPhone && styles.searchPanelPhone]}>
        <View style={styles.searchLocation}>
          <Pressable 
            onPress={() => setAreaPickerOpen(true)}
            style={({ pressed }) => [styles.locationTrigger, pressed && styles.pressed, webPointer]}
          >
            <MapPin color={colors.green} size={18} />
            <Text 
              style={[
                styles.locationText, 
                selectedArea ? styles.locationTextSelected : styles.locationTextPlaceholder
              ]} 
              numberOfLines={1}
            >
              {selectedArea ? selectedAreaPath.map(n => n.name).join(" > ") : "Select Area"}
            </Text>
            {selectedArea ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedArea(null);
                  setSelectedAreaPath([]);
                }}
                style={styles.locationClearBtn}
              >
                <X color={colors.muted} size={14} />
              </Pressable>
            ) : null}
          </Pressable>
          <View style={styles.searchDivider} />
          <TextInput 
            onChangeText={setQuery} 
            placeholder="Search keywords..." 
            placeholderTextColor="#899790" 
            style={styles.searchInput} 
            value={query} 
          />
        </View>
        <View style={styles.typeSelect}><Building2 color={colors.green} size={17} /><SelectField onChange={setType} options={["All types", "Residential", "Commercial", "Land", "Parking"]} style={styles.typePicker} value={type} /></View>
        <AppButton icon={Search} label="Search" style={[styles.searchAction, isPhone && styles.searchActionPhone]} />
      </View>

      <View style={styles.toolbar}>
        <View><Text style={styles.resultCount}>{results.length} properties</Text><Text style={styles.resultHint}>AI-ranked for trust and fair value</Text></View>
        <View style={styles.toolbarActions}>
          {isTablet ? (
            <Pressable onPress={() => setFiltersOpen(true)} style={[styles.mobileFilterButton, webPointer]}><SlidersHorizontal color={colors.muted} size={15} /><Text style={styles.mobileFilterText}>Filters</Text></Pressable>
          ) : null}
          <View style={styles.viewToggle}>
            <Pressable accessibilityLabel="Grid view" onPress={() => setView("grid")} style={[styles.viewButton, view === "grid" && styles.viewButtonActive, webPointer]}><Grid2X2 color={view === "grid" ? colors.green : colors.muted} size={15} /></Pressable>
            <Pressable accessibilityLabel="List view" onPress={() => setView("list")} style={[styles.viewButton, view === "list" && styles.viewButtonActive, webPointer]}><List color={view === "list" ? colors.green : colors.muted} size={16} /></Pressable>
          </View>
        </View>
      </View>

      <View style={styles.browseLayout}>
        {!isTablet ? (
          <View style={styles.filterColumn}><FilterPanel beds={beds} checks={checks} mode={mode} resetFilters={resetFilters} setBeds={setBeds} toggleCheck={toggleCheck} /></View>
        ) : null}
        <View style={styles.resultsColumn}>
          {loading ? (
            <View style={styles.requestState}>
              <ActivityIndicator color={colors.green} size="large" />
              <Text style={styles.resultHint}>Loading properties...</Text>
            </View>
          ) : error ? (
            <View style={styles.requestState}>
              <Text style={styles.emptyTitle}>Could not load properties</Text>
              <Text style={styles.emptyCopy}>{error}</Text>
              <AppButton icon={RotateCcw} label="Retry" onPress={() => void refresh()} />
            </View>
          ) : results.length ? (
            <View style={styles.resultsWithPagination}>
              {view === "grid" ? (
                <PropertyGrid desktopColumns={3} horizontalOnPhone={false} tabletColumns={2} gap={14}>
                  {results.map((property) => <PropertyCard imageHeight={isPhone ? 220 : 158} key={property.id} mode={mode} onSave={() => toggleSaved(property.id)} property={property} saved={savedIds.includes(property.id)} />)}
                </PropertyGrid>
              ) : (
                <View style={styles.listResults}>{results.map((property) => <PropertyCard imageHeight={isPhone ? 220 : undefined} key={property.id} list={!isPhone} mode={mode} onSave={() => toggleSaved(property.id)} property={property} saved={savedIds.includes(property.id)} />)}</View>
              )}
              {hasMore ? (
                <AppButton
                  label={fetchingNextPage ? "Loading..." : "Load more"}
                  onPress={() => void loadMore()}
                  disabled={fetchingNextPage}
                  style={styles.loadMoreButton}
                />
              ) : null}
            </View>
          ) : (
            <View style={styles.empty}><Search color={colors.green} size={26} /><Text style={styles.emptyTitle}>No homes match these filters</Text><Text style={styles.emptyCopy}>Try a nearby area or clear one of your filters.</Text><AppButton label="Clear filters" onPress={resetFilters} /></View>
          )}
        </View>
      </View>

      <Modal animationType="slide" onRequestClose={() => setFiltersOpen(false)} transparent visible={isTablet && filtersOpen}>
        <View style={styles.modalLayer}><Pressable accessibilityLabel="Close filters" onPress={() => setFiltersOpen(false)} style={styles.modalOverlay} /><View style={styles.modalPanel}><FilterPanel beds={beds} checks={checks} modal mode={mode} onClose={() => setFiltersOpen(false)} resetFilters={resetFilters} setBeds={setBeds} toggleCheck={toggleCheck} /></View></View>
      </Modal>

      <AreaPicker 
        visible={areaPickerOpen} 
        onClose={() => setAreaPickerOpen(false)} 
        onSelect={(area, path) => {
          setSelectedArea(area);
          setSelectedAreaPath(path);
        }} 
        selectedArea={selectedArea} 
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pageIntro: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 28, paddingTop: 22, paddingBottom: 25 },
  pageIntroPhone: { flexDirection: "column", alignItems: "flex-start", gap: 18, paddingTop: 13 },
  pageIntroCopy: { flex: 1 },
  introEyebrow: { marginBottom: 7 },
  pageTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 46, letterSpacing: -2.5, lineHeight: 49 },
  pageTitlePhone: { fontSize: 33, lineHeight: 36, letterSpacing: -1.8 },
  pageDescription: { maxWidth: 580, marginTop: 9, color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
  switchLink: { minHeight: 44, justifyContent: "center", paddingHorizontal: 18, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  switchLinkPhone: { minHeight: 0, paddingHorizontal: 0, borderWidth: 0 },
  switchLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 13 },
  searchPanel: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 16, backgroundColor: "#F3F7F5", borderWidth: 1, borderColor: colors.line },
  searchPanelPhone: { flexDirection: "column" },
  searchLocation: { minHeight: 50, minWidth: 0, flex: 1, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: "#E0E8E4" },
  locationTrigger: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, minWidth: 120 },
  locationText: { fontSize: 14, fontFamily: fonts.semiBold, flex: 1 },
  locationTextPlaceholder: { color: "#899790" },
  locationTextSelected: { color: "#1D3B2F" },
  locationClearBtn: { padding: 4 },
  searchDivider: { width: 1, height: 24, backgroundColor: colors.line, marginHorizontal: 4 },
  pressed: { opacity: 0.78 },
  searchInput: { minWidth: 0, flex: 1, height: 42, color: colors.ink, fontFamily: fonts.regular, fontSize: 14, paddingHorizontal: 8 },
  typeSelect: { width: 210, minHeight: 50, flexDirection: "row", alignItems: "center", gap: 5, paddingLeft: 14, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: "#E0E8E4" },
  typePicker: { flex: 1 },
  searchAction: { minWidth: 112, minHeight: 50, borderRadius: 999 },
  searchActionPhone: { minHeight: 46 },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 25, marginBottom: 14 },
  resultCount: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 15 },
  resultHint: { marginTop: 3, color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  toolbarActions: { flexDirection: "row", gap: 8 },
  mobileFilterButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  mobileFilterText: { color: colors.muted, fontFamily: fonts.extraBold, fontSize: 12 },
  viewToggle: { flexDirection: "row", gap: 3, padding: 3, borderRadius: 9, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  viewButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 6 },
  viewButtonActive: { backgroundColor: colors.white },
  browseLayout: { flexDirection: "row", gap: 20, alignItems: "flex-start" },
  filterColumn: { width: 230 },
  filterPanel: { padding: 20, borderRadius: 16, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line },
  filterPanelModal: { flex: 1, padding: 22, borderRadius: 0, borderWidth: 0 },
  filterHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  filterHeadingText: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 15 },
  filterGroup: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  filterLabel: { marginBottom: 10, color: "#53675E", fontFamily: fonts.extraBold, fontSize: 13 },
  optionRow: { flexDirection: "row", gap: 6 },
  optionButton: { minWidth: 38, height: 38, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  optionButtonActive: { backgroundColor: colors.green, borderColor: colors.green },
  optionText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  optionTextActive: { color: colors.white, fontFamily: fonts.bold },
  priceInputs: { flexDirection: "row", gap: 8 },
  priceField: { flex: 1, gap: 4 },
  priceCaption: { color: "#89958F", fontFamily: fonts.regular, fontSize: 12 },
  priceInput: { width: "100%", height: 42, paddingHorizontal: 10, color: colors.ink, fontFamily: fonts.regular, fontSize: 13, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  checkList: { gap: 10 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 18, height: 18, alignItems: "center", justifyContent: "center", borderRadius: 5, backgroundColor: colors.white, borderWidth: 1, borderColor: "#CDDAD4" },
  checkboxActive: { backgroundColor: colors.green, borderColor: colors.green },
  checkLabel: { color: "#60736A", fontFamily: fonts.regular, fontSize: 13 },
  resetButton: { width: "100%", marginTop: 16, padding: 10, alignItems: "center" },
  resetText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 12 },
  resultsColumn: { minWidth: 0, flex: 1 },
  resultsWithPagination: { gap: 18 },
  requestState: { alignItems: "center", gap: 12, justifyContent: "center", minHeight: 380, padding: 32 },
  loadMoreButton: { alignSelf: "center", minWidth: 160 },
  listResults: { gap: 14 },
  empty: { minHeight: 380, alignItems: "center", justifyContent: "center", padding: 35, borderRadius: 16, backgroundColor: "#F8FBF9", borderWidth: 1, borderStyle: "dashed", borderColor: "#CADBD3" },
  emptyTitle: { marginTop: 12, marginBottom: 5, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyCopy: { marginBottom: 16, color: colors.muted, fontFamily: fonts.regular, fontSize: 10 },
  modalLayer: { flex: 1, alignItems: "flex-end" },
  modalOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(8,31,23,0.34)" },
  modalPanel: { width: "88%", maxWidth: 330, height: "100%", backgroundColor: colors.white, ...shadow },
});
