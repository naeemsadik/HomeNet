import { LinearGradient } from "expo-linear-gradient";
import {
  Bookmark,
  Eye,
  GitCompare,
  Heart,
  Plus,
  Share2,
} from "lucide-react-native";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { AppLink } from "@/components/ui";
import {
  recentlyViewedListings,
  savedCollections,
  savedPageListings,
} from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { useSavedStore } from "@/stores/savedStore";
import { colors, fonts, webPointer } from "@/theme";

export function SavedScreen() {
  const { isPhone, isTablet, width } = useResponsive();
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const { savedIds, toggleSaved } = useSavedStore();

  return (
    <AppChrome active="saved">
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER (Figma data-node-id="1:1452")
      ───────────────────────────────────────────────────────────── */}
      <View style={[styles.headerRow, isPhone && styles.headerRowPhone]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.pageHeading}>Saved</Text>
          <Text style={styles.pageSubtitle}>
            Your collections, comparisons &amp; recently viewed
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Share collection"
            style={[styles.shareBtn, webPointer]}
          >
            <Share2 color="#0B1A17" size={16} />
            <Text style={styles.shareBtnText}>Share collection</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Compare properties"
            style={[styles.compareBtn, webPointer]}
          >
            <GitCompare color="#FFFFFF" size={16} />
            <Text style={styles.compareBtnText}>Compare</Text>
          </Pressable>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. COLLECTIONS / FOLDERS ROW (Figma data-node-id="1:1476")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.foldersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foldersRow}
        >
          {savedCollections.map((folder) => {
            const isSelected = selectedFolder === folder.id;
            return (
              <Pressable
                key={folder.id}
                onPress={() => setSelectedFolder(folder.id)}
                style={[
                  styles.folderCard,
                  isSelected && styles.folderCardActive,
                  webPointer,
                ]}
              >
                <ImageBackground
                  source={{ uri: folder.image }}
                  style={styles.folderBg}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.folderContent}>
                    <Bookmark color="#FFFFFF" size={20} />
                    <Text style={styles.folderName}>{folder.name}</Text>
                    <Text style={styles.folderCount}>{folder.count}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            );
          })}

          {/* New Folder Button */}
          <Pressable
            accessibilityLabel="Create new folder"
            style={[styles.newFolderCard, webPointer]}
          >
            <Plus color="#5C6B66" size={24} />
            <Text style={styles.newFolderText}>New folder</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          3. SAVED PROPERTIES (Figma data-node-id="1:1516")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIconRow}>
            <Bookmark color="#0B1A17" size={20} />
            <Text style={styles.sectionTitle}>Saved properties</Text>
          </View>
        </View>

        {/* 2-Column Large Card Grid matching Figma (imageHeight ~320.7px) */}
        <View style={[styles.savedPropertiesGrid, isPhone && styles.savedPropertiesGridPhone]}>
          {savedPageListings.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              imageHeight={isPhone ? 220 : 320.7}
              saved={savedIds.includes(prop.id)}
              onSave={() => toggleSaved(prop.id)}
              style={styles.savedCardItem}
            />
          ))}
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          4. RECENTLY VIEWED (Figma data-node-id="1:1701")
      ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionSpacing}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIconRow}>
            <Eye color="#0B1A17" size={20} />
            <Text style={styles.sectionTitle}>Recently viewed</Text>
          </View>
        </View>

        {/* 3-Column Standard Card Grid matching Figma */}
        <View style={[styles.recentlyViewedGrid, isPhone && styles.recentlyViewedGridPhone]}>
          {recentlyViewedListings.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              imageHeight={209.4}
              saved={savedIds.includes(prop.id)}
              onSave={() => toggleSaved(prop.id)}
              style={styles.recentCardItem}
            />
          ))}
        </View>
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
  },
  savedPropertiesGridPhone: {
    flexDirection: "column",
  },
  savedCardItem: {
    flexBasis: "48.5%",
    flexGrow: 1,
    minWidth: 320,
  },

  /* 4. Recently Viewed (3 Columns) */
  recentlyViewedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
  },
  recentlyViewedGridPhone: {
    flexDirection: "column",
  },
  recentCardItem: {
    flex: 1,
    minWidth: 260,
  },
});
