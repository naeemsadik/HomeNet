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
  const [activeTab, setActiveTab] = useState<HeroSearchTab>(initialTab);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, activeTab);
    } else {
      const targetRoute = activeTab === "rent" ? "/rent" : "/buy";
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("query", query.trim());
      }
      if (activeTab === "sold") {
        params.set("status", "sold");
      }
      const queryString = params.toString();
      router.push((queryString ? `${targetRoute}?${queryString}` : targetRoute) as any);
    }
  };

  const getPromptText = () => {
    switch (activeTab) {
      case "rent":
        return "Search properties to rent";
      case "sold":
        return "Search recently sold properties";
      case "buy":
      default:
        return "Search properties to buy";
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* ─── HeroSearchWidget Card ─────────────────────────────────────── */}
      <View style={styles.card}>
        {/* Top Header Row with Tabs (Figma node 214:4735) and AI-powered Badge */}
        <View style={styles.tabsHeader}>
          <SearchTabs activeTab={activeTab} onChange={setActiveTab} />

          {/* AI-powered Pill Badge */}
          <View style={styles.aiBadge}>
            <Sparkles color="#0F6D55" size={12} />
            <Text style={styles.aiBadgeText}>AI-powered</Text>
          </View>
        </View>

        {/* Bottom Search Section */}
        <View style={styles.searchBody}>
          <Text style={styles.promptLabel}>{getPromptText()}</Text>

          <View style={styles.inputActionRow}>
            <View style={styles.inputContainer}>
              <Search color="#5C6B66" size={16} />
              <TextInput
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                placeholder="Try: 3 bed apartment in Gulshan under ৳2Cr"
                placeholderTextColor="#5C6B66"
                returnKeyType="search"
                style={styles.textInput}
                value={query}
              />
            </View>

            <Pressable
              onPress={handleSearch}
              style={[styles.searchButton, webPointer]}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ─── Bottom Meta Stats Row ───────────────────────────────────────── */}
      {showMetaStats ? (
        <View style={styles.metaStatsRow}>
          <View style={styles.metaStatItem}>
            <ShieldCheck color="rgba(255, 255, 255, 0.85)" size={16} />
            <Text style={styles.metaStatText}>12,400+ verified</Text>
          </View>

          <View style={styles.metaStatItem}>
            <TrendingUp color="rgba(255, 255, 255, 0.85)" size={16} />
            <Text style={styles.metaStatText}>Live market data</Text>
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
  tabsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    borderBottomWidth: 1.2,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E7F2EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  aiBadgeText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  searchBody: {
    padding: 12,
    gap: 8,
  },
  promptLabel: {
    paddingHorizontal: 4,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  inputActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 44,
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: "#0F6D55",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  metaStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 4,
    height: 32,
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
});
