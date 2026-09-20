import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ChevronDown, MapPin, Search, Sparkles, X } from "lucide-react-native";
import { colors, fonts, radius, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useAiFinderModalStore } from "@/stores/useAiFinderModalStore";
import { SearchTabs, type SearchTabType } from "./SearchTabs";
import { AreaPicker } from "./AreaPicker";
import type { Area } from "@/types/api";

export type HeroSearchTab = SearchTabType;

interface HeroSearchWidgetProps {
  initialTab?: HeroSearchTab;
  onSearch?: (query: string, tab: HeroSearchTab, area?: Area | null) => void;
  /** Inside a shell that already owns the radius and shadow (the hero dock). */
  docked?: boolean;
}

export function HeroSearchWidget({
  initialTab = "buy",
  onSearch,
  docked = false,
}: HeroSearchWidgetProps) {
  const { isPhone } = useResponsive();
  const [activeTab, setActiveTab] = useState<HeroSearchTab>(initialTab);
  const [query, setQuery] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const openAiModal = useAiFinderModalStore((state) => state.open);

  const locationParams = (params: URLSearchParams) => {
    if (!selectedArea) return;
    if (selectedArea.city) params.set("city", selectedArea.city);
    params.set("location", selectedArea.name);
  };

  const handleAiSearch = () => {
    if (!isPhone) {
      openAiModal();
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set("prompt", query.trim());
    locationParams(params);
    const qs = params.toString();
    router.push((qs ? `/ai-finder?${qs}` : "/ai-finder") as never);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, activeTab, selectedArea);
      return;
    }
    const target = activeTab === "buy" ? "/buy" : "/rent";
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (activeTab === "short-let") params.set("subtype", "short-let");
    locationParams(params);
    const qs = params.toString();
    router.push((qs ? `${target}?${qs}` : target) as never);
  };

  const placeholder =
    activeTab === "short-let"
      ? "Search short-let and serviced flats"
      : activeTab === "rent"
        ? "Gulshan, Banani, Dhanmondi, or area…"
        : "Gulshan, Banani, Dhanmondi, or area…";

  return (
    <View style={[styles.card, isPhone && styles.cardPhone, docked && styles.cardDocked]}>
      <SearchTabs activeTab={activeTab} compact={isPhone} onChange={setActiveTab} />

      <View style={styles.rule} />

      <View style={[styles.inputRow, isPhone && styles.inputRowPhone]}>
        <View style={[styles.field, isPhone && styles.fieldPhone]}>
          <Search color={colors.muted} size={19} strokeWidth={2} />
          <TextInput
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={[styles.input, isPhone && styles.inputPhone]}
            value={query}
          />
          {query ? (
            <Pressable
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
              style={[styles.clear, webPointer]}
            >
              <X color={colors.muted} size={16} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filter by area, currently ${selectedArea ? selectedArea.name : "all locations"}`}
          onPress={() => setAreaPickerOpen(true)}
          style={({ hovered }: any) => [
            styles.areaButton,
            isPhone && styles.areaButtonPhone,
            selectedArea && styles.areaButtonActive,
            hovered && styles.areaButtonHovered,
            webPointer,
          ]}
        >
          <MapPin
            color={selectedArea ? colors.greenOnLight : colors.muted}
            size={16}
            strokeWidth={2}
          />
          <Text
            numberOfLines={1}
            style={[styles.areaLabel, selectedArea && styles.areaLabelActive]}
          >
            {selectedArea ? selectedArea.name : "All locations"}
          </Text>
          {selectedArea ? (
            <Pressable
              accessibilityLabel="Clear location"
              onPress={(e) => {
                e.stopPropagation();
                setSelectedArea(null);
              }}
              style={styles.areaClear}
            >
              <X color={colors.greenOnLight} size={14} />
            </Pressable>
          ) : (
            <ChevronDown color={colors.muted} size={15} strokeWidth={2} />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search properties"
          onPress={handleSearch}
          style={({ hovered, pressed }: any) => [
            styles.searchButton,
            isPhone && styles.searchButtonPhone,
            hovered && styles.searchButtonHovered,
            pressed && styles.searchButtonPressed,
            webPointer,
          ]}
        >
          <Search color={colors.white} size={17} strokeWidth={2.4} />
          <Text style={styles.searchLabel}>Search</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search with AI"
        onPress={handleAiSearch}
        style={({ hovered }: any) => [styles.aiLink, hovered && styles.aiLinkHovered, webPointer]}
      >
        <Sparkles color={colors.greenOnLight} size={15} strokeWidth={2.2} />
        <Text style={styles.aiText}>
          Describe what you want in plain words — try AI search
        </Text>
      </Pressable>

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedArea={selectedArea}
        onSelect={(area) => {
          setSelectedArea(area);
          setAreaPickerOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Elevation is declared once — shadow, no border.
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 24,
    ...(Platform.select({
      web: { boxShadow: "0 24px 60px -20px rgba(11, 26, 23, 0.28)" },
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.22,
        shadowRadius: 44,
        elevation: 14,
      },
    }) as any),
  },
  cardPhone: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderRadius: radius.sm,
  },
  cardDocked: {
    borderRadius: 0,
    ...(Platform.select({
      web: { boxShadow: "none" },
      default: { shadowOpacity: 0, elevation: 0 },
    }) as any),
  },

  rule: {
    height: 1,
    marginTop: -1,
    marginBottom: 20,
    backgroundColor: colors.line,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputRowPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
  },

  field: {
    flex: 1,
    minWidth: 0,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
  },
  fieldPhone: { height: 50, paddingHorizontal: 14 },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  } as any,
  inputPhone: { fontSize: 15 },
  clear: { padding: 4 },

  areaButton: {
    height: 56,
    maxWidth: 210,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
  },
  areaButtonPhone: { height: 48, maxWidth: "100%", justifyContent: "center" },
  areaButtonActive: { backgroundColor: colors.greenLight },
  areaButtonHovered: { opacity: 0.85 },
  areaLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 15,
    flexShrink: 1,
  },
  areaLabelActive: { color: colors.greenOnLight, fontFamily: fonts.semiBold },
  areaClear: { padding: 2 },

  searchButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.green,
  },
  searchButtonPhone: { height: 50, paddingHorizontal: 20 },
  searchButtonHovered: { backgroundColor: colors.greenOnLight },
  searchButtonPressed: { opacity: 0.9 },
  searchLabel: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  aiLink: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 2,
  },
  aiLinkHovered: { opacity: 0.75 },
  aiText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textDecorationLine: "underline",
    ...(Platform.OS === "web" ? { textUnderlineOffset: 3 } : {}),
  } as any,
});
