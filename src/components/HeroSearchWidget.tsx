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
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import { fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

import { SearchTabs, type SearchTabType } from "./SearchTabs";

export type HeroSearchTab = SearchTabType;

interface HeroSearchWidgetProps {
  initialTab?: HeroSearchTab;
  onSearch?: (query: string, tab: HeroSearchTab) => void;
  showMetaStats?: boolean;
}

export function HeroSearchWidget({
  initialTab = "buy",
  onSearch,
  showMetaStats = true,
}: HeroSearchWidgetProps) {
  const { isPhone } = useResponsive();
  const [activeTab, setActiveTab] = useState<HeroSearchTab>(initialTab);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, activeTab);
    } else {
      const targetRoute = (activeTab === "rent" || activeTab === "short-let") ? "/rent" : "/buy";
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("query", query.trim());
      }
      if (activeTab === "short-let") {
        params.set("subtype", "short-let");
      }
      const queryString = params.toString();
      router.push((queryString ? `${targetRoute}?${queryString}` : targetRoute) as any);
    }
  };

  const getPromptText = () => {
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

  return (
    <View style={[styles.wrapper, isPhone && styles.wrapperPhone]}>
      {/* ─── HeroSearchWidget Card ─────────────────────────────────────── */}
      <View style={[styles.card, isPhone && styles.cardPhone]}>
        {/* Top Header Row with Tabs (Figma node 214:4735) and AI-powered Badge */}
        <View style={[styles.tabsHeader, isPhone && styles.tabsHeaderPhone]}>
          <SearchTabs activeTab={activeTab} onChange={setActiveTab} compact={isPhone} />

          {/* AI-powered Pill Badge */}
          <View style={[styles.aiBadge, isPhone && styles.aiBadgePhone]}>
            <Sparkles color="#0F6D55" size={isPhone ? 11 : 12} />
            <Text style={[styles.aiBadgeText, isPhone && styles.aiBadgeTextPhone]}>
              AI-powered
            </Text>
          </View>
        </View>

        {/* Bottom Search Section */}
        <View style={[styles.searchBody, isPhone && styles.searchBodyPhone]}>
          <Text style={[styles.promptLabel, isPhone && styles.promptLabelPhone]}>
            {getPromptText()}
          </Text>

          <View style={[styles.inputActionRow, isPhone && styles.inputActionRowPhone]}>
            <View style={[styles.inputContainer, isPhone && styles.inputContainerPhone]}>
              <Search color="#5C6B66" size={16} />
              <TextInput
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                placeholder="Try: 3 bed apartment in Gulshan under ৳2Cr"
                placeholderTextColor="#5C6B66"
                returnKeyType="search"
                style={[styles.textInput, isPhone && styles.textInputPhone]}
                value={query}
              />
            </View>

            <Pressable
              onPress={handleSearch}
              style={[styles.searchButton, isPhone && styles.searchButtonPhone, webPointer]}
            >
              {isPhone ? <Search color="#FFFFFF" size={16} /> : null}
              <Text style={[styles.searchButtonText, isPhone && styles.searchButtonTextPhone]}>
                Search
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ─── Bottom Meta Stats Row ───────────────────────────────────────── */}
      {showMetaStats ? (
        <View style={[styles.metaStatsRow, isPhone && styles.metaStatsRowPhone]}>
          <View style={styles.metaStatItem}>
            <ShieldCheck color="rgba(255, 255, 255, 0.85)" size={15} />
            <Text style={[styles.metaStatText, isPhone && styles.metaStatTextPhone]}>
              12,400+ verified
            </Text>
          </View>

          <View style={styles.metaStatItem}>
            <TrendingUp color="rgba(255, 255, 255, 0.85)" size={15} />
            <Text style={[styles.metaStatText, isPhone && styles.metaStatTextPhone]}>
              Live market data
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 672,
    paddingTop: 24,
    gap: 12,
  },
  wrapperPhone: {
    paddingTop: 16,
    gap: 10,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
  },
  cardPhone: {
    borderRadius: 16,
  },
  tabsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 18,
    paddingTop: 8,
    paddingBottom: 0,
    borderBottomWidth: 1.2,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
  },
  tabsHeaderPhone: {
    paddingLeft: 8,
    paddingRight: 10,
    paddingTop: 4,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginTop: 2,
    flexShrink: 0,
  },
  aiBadgePhone: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 2,
  },
  aiBadgeText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  aiBadgeTextPhone: {
    fontSize: 11,
  },
  searchBody: {
    padding: 12,
    gap: 8,
  },
  searchBodyPhone: {
    padding: 10,
    gap: 6,
  },
  promptLabel: {
    paddingHorizontal: 4,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  promptLabelPhone: {
    fontSize: 11.5,
  },
  inputActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    maxWidth: "100%",
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
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 46,
    overflow: "hidden",
  },
  inputContainerPhone: {
    width: "100%",
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 0,
    outlineStyle: "none",
  } as any,
  textInputPhone: {
    fontSize: 13,
  },
  searchButton: {
    flexShrink: 0,
    backgroundColor: "#0F6D55",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  searchButtonPhone: {
    width: "100%",
    height: 42,
    borderRadius: 14,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  searchButtonTextPhone: {
    fontSize: 13.5,
  },
  metaStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 4,
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
    gap: 4,
  },
  metaStatText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  metaStatTextPhone: {
    fontSize: 12.5,
  },
});
