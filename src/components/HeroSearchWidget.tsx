import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react-native";
import { fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { SearchTabs, type SearchTabType } from "./SearchTabs";
import { AreaPicker } from "./AreaPicker";
import type { Area } from "@/types/api";

export type HeroSearchTab = SearchTabType;
export type HeroSearchMode = "classic" | "ai";

interface HeroSearchWidgetProps {
  initialTab?: HeroSearchTab;
  onSearch?: (query: string, tab: HeroSearchTab, area?: Area | null) => void;
  showMetaStats?: boolean;
}

export function HeroSearchWidget({
  initialTab = "buy",
  onSearch,
  showMetaStats = true,
}: HeroSearchWidgetProps) {
  const { isPhone } = useResponsive();
  const [activeTab, setActiveTab] = useState<HeroSearchTab>(initialTab);
  const [searchMode, setSearchMode] = useState<HeroSearchMode>("classic");
  const [query, setQuery] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const handleSearch = () => {
    if (searchMode === "ai") {
      const params = new URLSearchParams();
      if (query.trim()) params.set("prompt", query.trim());
      if (selectedArea) {
        if (selectedArea.city) params.set("city", selectedArea.city);
        params.set("location", selectedArea.name);
      }
      const qs = params.toString();
      router.push((qs ? `/ai-finder?${qs}` : "/ai-finder") as any);
      return;
    }

    if (onSearch) {
      onSearch(query, activeTab, selectedArea);
    } else {
      const targetRoute = (activeTab === "rent" || activeTab === "short-let") ? "/rent" : "/buy";
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("query", query.trim());
      }
      if (activeTab === "short-let") {
        params.set("subtype", "short-let");
      }
      if (selectedArea) {
        if (selectedArea.city) params.set("city", selectedArea.city);
        params.set("location", selectedArea.name);
      }
      const queryString = params.toString();
      router.push((queryString ? `${targetRoute}?${queryString}` : targetRoute) as any);
    }
  };

  const getPromptText = () => {
    if (searchMode === "ai") {
      return "Ask AI to find matching properties anywhere in Bangladesh";
    }
    switch (activeTab) {
      case "short-let":
        return "Search short-let & serviced apartments";
      case "rent":
        return "Search properties to rent";
      case "buy":
      default:
        return "Search properties to buy";
    }
  };

  const locationLabel = selectedArea ? selectedArea.name : "All Locations";

  return (
    <View style={[styles.wrapper, isPhone && styles.wrapperPhone]}>
      {/* ─── Centered Search Container Card ────────────────────────────── */}
      <View style={[styles.card, isPhone && styles.cardPhone]}>
        {/* Top Header Row: Tabs on Left, Segmented Mode Pill on Right */}
        <View style={[styles.tabsHeader, isPhone && styles.tabsHeaderPhone]}>
          <SearchTabs
            activeTab={activeTab}
            compact={isPhone}
            onChange={setActiveTab}
            variant="light"
          />

          {/* Segmented Mode Toggle Pill: [ Q Classic | ✨ AI Search ] */}
          <View style={[styles.modeTogglePill, isPhone && styles.modeTogglePillPhone]}>
            <Pressable
              onPress={() => setSearchMode("classic")}
              style={[
                styles.modeOption,
                searchMode === "classic" && styles.modeOptionActive,
                webPointer,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Classic search mode"
            >
              <Search
                color={searchMode === "classic" ? "#FFFFFF" : "#5C6B66"}
                size={13}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.modeOptionText,
                  searchMode === "classic" && styles.modeOptionTextActive,
                ]}
              >
                Classic
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSearchMode("ai")}
              style={[
                styles.modeOption,
                searchMode === "ai" && styles.modeOptionActive,
                webPointer,
              ]}
              accessibilityRole="button"
              accessibilityLabel="AI search mode"
            >
              <Sparkles
                color={searchMode === "ai" ? "#FFFFFF" : "#04cf92"}
                size={13}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.modeOptionText,
                  searchMode === "ai" && styles.modeOptionTextActive,
                ]}
              >
                AI Search
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Prompt Label Row */}
        <View style={styles.promptWrap}>
          <Text style={[styles.promptLabel, isPhone && styles.promptLabelPhone]}>
            {getPromptText()}
          </Text>
        </View>

        {/* Input & Action Row: Search Input + Blended Area Picker + Search Button */}
        <View style={[styles.inputActionRow, isPhone && styles.inputActionRowPhone]}>
          {/* Search Input Container */}
          <View style={[styles.inputContainer, isPhone && styles.inputContainerPhone]}>
            <Search color="#5C6B66" size={18} strokeWidth={2} />
            <TextInput
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              placeholder={
                searchMode === "ai"
                  ? "Try: 3 bed modern apartment in Gulshan under ৳2.5Cr"
                  : "Gulshan, Banani, Dhanmondi, or area..."
              }
              placeholderTextColor="rgba(11, 26, 23, 0.45)"
              returnKeyType="search"
              style={[styles.textInput, isPhone && styles.textInputPhone]}
              value={query}
            />
            {query ? (
              <Pressable
                onPress={() => setQuery("")}
                style={[styles.clearBtn, webPointer]}
                accessibilityLabel="Clear search input"
              >
                <X color="#8C9A95" size={15} />
              </Pressable>
            ) : null}
          </View>

          {/* Blended Area Picker Button (left of search button, right of search bar) */}
          <Pressable
            onPress={() => setAreaPickerOpen(true)}
            style={[
              styles.areaButton,
              selectedArea && styles.areaButtonSelected,
              isPhone && styles.areaButtonPhone,
              webPointer,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Filter by area, current: ${locationLabel}`}
          >
            <MapPin
              color={selectedArea ? "#04cf92" : "#5C6B66"}
              size={isPhone ? 14 : 15}
              strokeWidth={2}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.areaButtonText,
                selectedArea && styles.areaButtonTextSelected,
                isPhone && styles.areaButtonTextPhone,
              ]}
            >
              {locationLabel}
            </Text>
            {selectedArea ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedArea(null);
                }}
                style={styles.areaClearIcon}
                accessibilityLabel="Clear location filter"
              >
                <X color="#04cf92" size={13} />
              </Pressable>
            ) : null}
          </Pressable>

          {/* Search Button (Our signature primary color #04cf92) */}
          <Pressable
            onPress={handleSearch}
            style={[styles.searchButton, isPhone && styles.searchButtonPhone, webPointer]}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Search color="#FFFFFF" size={16} strokeWidth={2.2} />
            <Text style={[styles.searchButtonText, isPhone && styles.searchButtonTextPhone]}>
              Search
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ─── Centered Meta Stats Row ─────────────────────────────────────── */}
      {showMetaStats ? (
        <View style={[styles.metaStatsRow, isPhone && styles.metaStatsRowPhone]}>
          <View style={styles.metaStatItem}>
            <ShieldCheck color="rgba(255, 255, 255, 0.9)" size={15} />
            <Text style={[styles.metaStatText, isPhone && styles.metaStatTextPhone]}>
              12,400+ verified listings
            </Text>
          </View>

          <View style={styles.metaStatItem}>
            <TrendingUp color="rgba(255, 255, 255, 0.9)" size={15} />
            <Text style={[styles.metaStatText, isPhone && styles.metaStatTextPhone]}>
              Live market intelligence
            </Text>
          </View>

          <View style={styles.metaStatItem}>
            <Sparkles color="rgba(255, 255, 255, 0.9)" size={15} />
            <Text style={[styles.metaStatText, isPhone && styles.metaStatTextPhone]}>
              AI valuation & scores
            </Text>
          </View>
        </View>
      ) : null}

      {/* Area Picker Modal */}
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
  wrapper: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingTop: 20,
    gap: 14,
  },
  wrapperPhone: {
    paddingTop: 14,
    gap: 10,
    maxWidth: "100%",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  cardPhone: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  tabsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1.2,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
    paddingBottom: 2,
    gap: 12,
    flexWrap: "wrap",
  },
  tabsHeaderPhone: {
    gap: 8,
    paddingBottom: 4,
  },
  modeTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 999,
    padding: 3,
    flexShrink: 0,
  },
  modeTogglePillPhone: {
    alignSelf: "flex-end",
    marginTop: -2,
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 999,
  },
  modeOptionActive: {
    backgroundColor: "#04cf92",
  },
  modeOptionText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 12.5,
    fontWeight: "500",
  },
  modeOptionTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  promptWrap: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  promptLabel: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  promptLabelPhone: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  inputActionRowPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  inputContainerPhone: {
    width: "100%",
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 14.5,
    paddingVertical: 0,
    outlineStyle: "none",
  } as any,
  textInputPhone: {
    fontSize: 13,
    height: 40,
  },
  clearBtn: {
    padding: 4,
  },
  areaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 14,
    flexShrink: 0,
    maxWidth: 200,
  },
  areaButtonSelected: {
    backgroundColor: "#E6FAF4",
    borderColor: "rgba(4, 207, 146, 0.25)",
  },
  areaButtonPhone: {
    maxWidth: "100%",
    width: "100%",
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
  },
  areaButtonText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 13.5,
    maxWidth: 130,
  },
  areaButtonTextSelected: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontWeight: "600",
  },
  areaButtonTextPhone: {
    fontSize: 13,
    maxWidth: 220,
  },
  areaClearIcon: {
    padding: 2,
    marginLeft: 2,
  },
  searchButton: {
    flexShrink: 0,
    backgroundColor: "#04cf92",
    paddingHorizontal: 26,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#04cf92",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  searchButtonPhone: {
    width: "100%",
    height: 46,
    borderRadius: 12,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  searchButtonTextPhone: {
    fontSize: 14,
  },
  metaStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 6,
    minHeight: 28,
  },
  metaStatsRowPhone: {
    gap: 12,
    flexWrap: "wrap",
    minHeight: 24,
  },
  metaStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaStatText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  metaStatTextPhone: {
    fontSize: 12.5,
  },
});
