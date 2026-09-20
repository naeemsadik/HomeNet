import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowRight,
  Bath,
  Bed,
  Check,
  Eye,
  Home,
  Mail,
  MapPin,
  Maximize2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import { fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { BrowserFrame } from "./BrowserFrame";
import { PhoneFrame } from "./PhoneFrame";
import { previewProperties } from "@/data/landingPreview";
import { PropertyCard } from "@/components/PropertyCard";
import { SellerStatCard } from "@/features/seller/components/SellerStatCard";
import { landingCopy } from "@/content/landingCopy";

export function ShowcaseTabs() {
  const { isPhone, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState<"browse" | "detail" | "create" | "dashboard">(
    "browse"
  );

  const tabs = landingCopy.showcase.tabs;

  const handleOpenActiveRoute = () => {
    switch (activeTab) {
      case "browse":
        router.push("/buy" as any);
        break;
      case "detail":
        router.push("/buy" as any);
        break;
      case "create":
        router.push("/sell" as any);
        break;
      case "dashboard":
        router.push("/seller" as any);
        break;
    }
  };

  const p1 = previewProperties[0];
  const p2 = previewProperties[1];

  return (
    <View style={styles.container}>
      {/* Horizontal Tabs Selection */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.tabPill,
                selected && styles.tabPillActive,
                pressed && { opacity: 0.8 },
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  selected && styles.tabPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Frame Wrapper */}
      <BrowserFrame
        url={`homenet.com.bd/${
          activeTab === "browse"
            ? "buy"
            : activeTab === "detail"
            ? "property/gulshan-penthouse"
            : activeTab === "create"
            ? "property/create"
            : "seller"
        }`}
        style={styles.frame}
        contentStyle={styles.frameBody}
      >
        {activeTab === "browse" && (
          <View style={styles.showcaseContent}>
            <View style={styles.browseFilterMock}>
              <Text style={styles.browseCount}>Showing 14 verified properties in Dhaka</Text>
              <View style={styles.browseFilterPill}>
                <Text style={styles.browseFilterText}>Filter: All residential</Text>
              </View>
            </View>
            <View style={[styles.cardGrid, isTablet && styles.cardGridTablet]}>
              <View style={styles.cardItem}>
                <PropertyCard property={p1} onPress={handleOpenActiveRoute} />
              </View>
              <View style={styles.cardItem}>
                <PropertyCard property={p2} onPress={handleOpenActiveRoute} />
              </View>
            </View>
          </View>
        )}

        {activeTab === "detail" && (
          <View style={styles.detailShowcase}>
            <View style={[styles.detailCols, isTablet && styles.detailColsTablet]}>
              {/* Image Gallery Mock */}
              <View style={styles.detailGalleryMock}>
                <Image
                  source={{ uri: p1.media?.[0]?.url }}
                  style={styles.detailMainImage}
                  resizeMode="cover"
                />
                <View style={styles.detailBadgeRow}>
                  <View style={styles.verifiedTag}>
                    <ShieldCheck color="#2251D6" size={13} strokeWidth={2.5} />
                    <Text style={styles.verifiedTagText}>Verified Property</Text>
                  </View>
                </View>
              </View>

              {/* Specs and Contact Mock */}
              <View style={styles.detailMetaMock}>
                <Text style={styles.detailPrice}>৳4.85 Crore</Text>
                <Text style={styles.detailTitle}>{p1.title}</Text>
                <Text style={styles.detailAddress}>Road 92, Gulshan-2, Dhaka</Text>

                <View style={styles.specChipsRow}>
                  <View style={styles.specChip}>
                    <Bed color="#0F6D55" size={14} />
                    <Text style={styles.specChipText}>4 Bedrooms</Text>
                  </View>
                  <View style={styles.specChip}>
                    <Bath color="#0F6D55" size={14} />
                    <Text style={styles.specChipText}>5 Baths</Text>
                  </View>
                  <View style={styles.specChip}>
                    <Maximize2 color="#0F6D55" size={14} />
                    <Text style={styles.specChipText}>4,200 sqft</Text>
                  </View>
                </View>

                {/* Owner Identity Block */}
                <View style={styles.ownerContactCard}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                    }}
                    style={styles.ownerAvatar}
                  />
                  <View style={styles.ownerInfo}>
                    <Text style={styles.ownerName}>Tanvir Rahman (Owner)</Text>
                    <Text style={styles.ownerDirect}>Direct Contact · No Broker Fee</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "create" && (
          <View style={styles.createShowcase}>
            <View style={styles.wizardHeader}>
              <View style={styles.wizardStepsRow}>
                <View style={[styles.wizardStep, styles.wizardStepActive]}>
                  <Text style={styles.wizardStepActiveText}>1. Basics</Text>
                </View>
                <View style={styles.wizardStepLine} />
                <View style={styles.wizardStep}>
                  <Text style={styles.wizardStepText}>2. Details</Text>
                </View>
                <View style={styles.wizardStepLine} />
                <View style={styles.wizardStep}>
                  <Text style={styles.wizardStepText}>3. Location</Text>
                </View>
                <View style={styles.wizardStepLine} />
                <View style={styles.wizardStep}>
                  <Text style={styles.wizardStepText}>4. Media</Text>
                </View>
              </View>
            </View>

            <View style={styles.wizardBodyMock}>
              <View style={styles.aiFastTrack}>
                <Sparkles color="#0F6D55" size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiFastTrackTitle}>Skip the form — Describe your property</Text>
                  <Text style={styles.aiFastTrackSub}>
                    "4 bed luxury penthouse in Gulshan-2 with 4200 sqft and terrace"
                  </Text>
                </View>
              </View>
              <View style={styles.mockField}>
                <Text style={styles.mockFieldLabel}>Property Title</Text>
                <View style={styles.mockInput}>
                  <Text style={styles.mockInputText}>{p1.title}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "dashboard" && (
          <View style={styles.dashboardShowcase}>
            <View style={styles.statsGridRow}>
              <SellerStatCard
                item={{
                  id: "1",
                  label: "Active Listings",
                  value: "1",
                  trend: "+100%",
                  icon: Home,
                  iconBg: "#E6FAF4",
                  iconColor: "#0F6D55",
                }}
              />
              <SellerStatCard
                item={{
                  id: "2",
                  label: "Total Views",
                  value: "512",
                  trend: "+24% this wk",
                  icon: Eye,
                  iconBg: "#FDEEE2",
                  iconColor: "#F4823A",
                }}
              />
            </View>
            <View style={styles.dashBannerMock}>
              <ShieldCheck color="#0F6D55" size={20} />
              <Text style={styles.dashBannerText}>
                Your listing in Gulshan-2 is live and verified across Dhaka
              </Text>
            </View>
          </View>
        )}

        {/* Frame Action Bar */}
        <View style={styles.frameActionFooter}>
          <Pressable
            onPress={handleOpenActiveRoute}
            style={({ pressed }) => [
              styles.openAppBtn,
              pressed && { opacity: 0.8 },
              webPointer,
            ]}
          >
            <Text style={styles.openAppBtnText}>Open this screen in HomeNet</Text>
            <ArrowRight color="#0F6D55" size={14} strokeWidth={2.5} />
          </Pressable>
        </View>
      </BrowserFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  tabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  tabPillActive: {
    backgroundColor: "#0B1A17",
    borderColor: "#0B1A17",
  },
  tabPillText: {
    color: "#5C6B66",
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    fontWeight: "600",
  },
  tabPillTextActive: {
    color: "#FFFFFF",
  },
  frame: {
    width: "100%",
    maxWidth: 960,
  },
  frameBody: {
    padding: 24,
  },
  showcaseContent: {
    gap: 16,
  },
  browseFilterMock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  browseCount: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  browseFilterPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  browseFilterText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  cardGrid: {
    flexDirection: "row",
    gap: 18,
  },
  cardGridTablet: {
    flexDirection: "column",
  },
  cardItem: {
    flex: 1,
  },
  detailShowcase: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
  },
  detailCols: {
    flexDirection: "row",
    gap: 24,
  },
  detailColsTablet: {
    flexDirection: "column",
  },
  detailGalleryMock: {
    flex: 1,
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  detailMainImage: {
    width: "100%",
    height: "100%",
  },
  detailBadgeRow: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E8EEFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedTagText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
  },
  detailMetaMock: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  detailPrice: {
    color: "#0F6D55",
    fontFamily: fonts.headingExtraBold,
    fontSize: 24,
    fontWeight: "800",
  },
  detailTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 17,
    fontWeight: "700",
  },
  detailAddress: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  specChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 6,
    flexWrap: "wrap",
  },
  specChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  specChipText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  ownerContactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E6FAF4",
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  ownerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  ownerInfo: {
    gap: 2,
  },
  ownerName: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  ownerDirect: {
    color: "#0F6D55",
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },
  createShowcase: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  wizardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
    paddingBottom: 16,
  },
  wizardStepsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wizardStep: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  wizardStepActive: {
    backgroundColor: "#0B1A17",
  },
  wizardStepText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  wizardStepActiveText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
  },
  wizardStepLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(11, 26, 23, 0.1)",
  },
  wizardBodyMock: {
    gap: 14,
  },
  aiFastTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E6FAF4",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(4, 207, 146, 0.25)",
  },
  aiFastTrackTitle: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  aiFastTrackSub: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  mockField: {
    gap: 6,
  },
  mockFieldLabel: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  mockInput: {
    backgroundColor: "#F4F6F5",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  mockInputText: {
    color: "#0B1A17",
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  dashboardShowcase: {
    gap: 16,
  },
  statsGridRow: {
    flexDirection: "row",
    gap: 16,
  },
  dashBannerMock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.06)",
  },
  dashBannerText: {
    color: "#0B1A17",
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  frameActionFooter: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "flex-end",
  },
  openAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  openAppBtnText: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
});
