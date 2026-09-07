import { LinearGradient } from "expo-linear-gradient";
import {
  Bookmark,
  Building2,
  Eye,
  GitCompare,
  Heart,
  Plus,
  Share2,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { AppLink } from "@/components/ui";
import { getSavedProperties, unsaveProperty } from "@/services/propertyApi";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";

export function SavedScreen() {
  const { isPhone, isTablet, width } = useResponsive();
  const queryClient = useQueryClient();

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["properties", "saved"],
    queryFn: getSavedProperties,
    staleTime: 5 * 60 * 1000,
  });

  const savedListings = savedData?.data ?? [];

  const unsaveMutation = useMutation({
    mutationFn: (id: string) => unsaveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "saved"] });
    },
  });

  function handleToggleSaved(id: string | number) {
    unsaveMutation.mutate(String(id));
  }

  return (
    <AppChrome active="saved">
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER (Figma data-node-id="1:1452")
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.headerRow, isPhone && styles.headerRowPhone]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.pageHeading}>Saved</Text>
          <Text style={styles.pageSubtitle}>
            Your saved properties &amp; bookmarks
          </Text>
        </View>

        <View style={styles.headerActions}>
          <AppLink href="/buy" style={styles.exploreLink}>
            <Text style={styles.exploreLinkText}>Browse more homes</Text>
          </AppLink>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. SAVED PROPERTIES
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIconRow}>
            <Bookmark color="#0B1A17" size={20} />
            <Text style={styles.sectionTitle}>Saved properties ({savedListings.length})</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={{ padding: 48, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0F6D55" />
            <Text style={{ marginTop: 12, color: "#5C6B66", fontFamily: fonts.medium }}>
              Loading saved properties...
            </Text>
          </View>
        ) : savedListings.length === 0 ? (
          <View style={styles.emptySavedBox}>
            <Heart color="#899790" size={48} />
            <Text style={styles.emptySavedTitle}>No saved properties yet</Text>
            <Text style={styles.emptySavedText}>
              Properties you save while browsing will appear here for easy comparison.
            </Text>
            <AppLink href="/buy" style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Explore properties</Text>
            </AppLink>
          </View>
        ) : (
          <View style={[styles.savedPropertiesGrid, isPhone && styles.savedPropertiesGridPhone]}>
            {savedListings.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                imageHeight={isPhone ? 180 : 220}
                saved={true}
                onSave={() => handleToggleSaved(prop.id)}
                style={[styles.savedCardItem, isPhone && styles.savedCardItemPhone]}
              />
            ))}
          </View>
        )}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  /* 1. Page Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 16,
    width: "100%",
  },
  headerRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
  },
  headerTitleWrap: {
    gap: 4,
  },
  pageHeading: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 25.6,
    fontWeight: "800",
    lineHeight: 38.4,
    letterSpacing: -0.512,
  },
  pageSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16.8,
    paddingVertical: 8.8,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11, 26, 23, 0.08)",
    backgroundColor: "#FFFFFF",
  },
  shareBtnText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#0F6D55",
  },
  compareBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  /* 2. Folders Row */
  foldersSection: {
    marginTop: 32,
    width: "100%",
  },
  foldersRow: {
    flexDirection: "row",
    gap: 16,
  },
  folderCard: {
    width: 176,
    height: 132,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.6,
    borderColor: "transparent",
  },
  folderCardActive: {
    borderColor: "#0F6D55",
  },
  folderBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  folderContent: {
    padding: 12,
    gap: 2,
  },
  folderName: {
    marginTop: 4,
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  folderCount: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  newFolderCard: {
    width: 176,
    height: 132,
    borderRadius: 20,
    borderWidth: 1.6,
    borderStyle: "dashed",
    borderColor: "rgba(11, 26, 23, 0.08)",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  newFolderText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  /* Common Section Header */
  sectionSpacing: {
    marginTop: 32,
    width: "100%",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  titleWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.4,
  },

  /* 3. Saved Properties (2 Columns) */
  savedPropertiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
    alignItems: "flex-start",
  },
  savedPropertiesGridPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  savedCardItem: {
    flexBasis: "48.5%",
    flexGrow: 1,
    minWidth: 320,
  },
  savedCardItemPhone: {
    flexBasis: "auto",
    flexGrow: 0,
    minWidth: 0,
    width: "100%",
  },

  /* 4. Recently Viewed (3 Columns) */
  recentlyViewedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
    alignItems: "flex-start",
  },
  recentlyViewedGridPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  recentCardItem: {
    flex: 1,
    minWidth: 260,
  },
  recentCardItemPhone: {
    flex: 0,
    flexGrow: 0,
    minWidth: 0,
    width: "100%",
  },
  exploreLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E7F2EE",
  },
  exploreLinkText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  emptySavedBox: {
    width: "100%",
    padding: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  emptySavedTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.headingBold,
    color: "#0B1A17",
  },
  emptySavedText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    textAlign: "center",
    maxWidth: 400,
  },
  browseButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#0F6D55",
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
// text for pull request