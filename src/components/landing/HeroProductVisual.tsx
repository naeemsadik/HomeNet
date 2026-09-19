import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Compass,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { BrowserFrame } from "./BrowserFrame";
import { PhoneFrame } from "./PhoneFrame";
import { previewProperties } from "@/data/landingPreview";
import { PropertyCard } from "@/features/property/components/PropertyCard";

export function HeroProductVisual() {
  const { isPhone, isTablet, isCompact } = useResponsive();

  const handleOpenApp = () => {
    router.push("/buy" as any);
  };

  const p1 = previewProperties[0];
  const p2 = previewProperties[1];

  return (
    <Pressable
      onPress={handleOpenApp}
      accessibilityRole="link"
      accessibilityLabel="Open live properties in HomeNet"
      style={[styles.container, webPointer]}
    >
      {/* On desktop and tablet: full browser frame with phone overlay */}
      {!isPhone ? (
        <View style={styles.compositionWrap}>
          {/* Main Desktop Browser Frame */}
          <BrowserFrame
            url="homenet.com.bd/buy?city=Dhaka"
            style={[
              styles.browserFrame,
              isCompact && styles.browserFrameCompact,
            ]}
            contentStyle={styles.browserBody}
          >
            {/* Decorative Search Bar Replica */}
            <View style={styles.searchReplicaBar}>
              <View style={styles.searchReplicaInput}>
                <Search color="#5C6B66" size={16} strokeWidth={2} />
                <Text numberOfLines={1} style={styles.searchReplicaPlaceholder}>
                  Gulshan, Banani, Dhanmondi, or area...
                </Text>
              </View>
              <View style={styles.searchReplicaAreaBtn}>
                <MapPin color="#0F6D55" size={14} strokeWidth={2} />
                <Text style={styles.searchReplicaAreaText}>Dhaka</Text>
              </View>
              <View style={styles.searchReplicaBtn}>
                <Text style={styles.searchReplicaBtnText}>Search</Text>
              </View>
            </View>

            {/* Two Live Property Cards */}
            <View style={styles.cardsRow}>
              <View style={styles.cardCol}>
                <PropertyCard property={p1} onPress={handleOpenApp} />
              </View>
              <View style={styles.cardCol}>
                <PropertyCard property={p2} onPress={handleOpenApp} />
              </View>
            </View>
          </BrowserFrame>

          {/* Overlapping Phone Frame (Detail View) */}
          <View style={styles.phoneOverlapWrap}>
            <PhoneFrame style={styles.phoneFrame}>
              <View style={styles.mobileDetailPreview}>
                <View style={styles.mobileDetailImageWrap}>
                  <Image
                    source={{ uri: p1.media?.[0]?.url }}
                    style={styles.mobileDetailImage}
                    resizeMode="cover"
                  />
                  <View style={styles.mobileDetailBadge}>
                    <ShieldCheck color="#2251D6" size={12} strokeWidth={2.5} />
                    <Text style={styles.mobileDetailBadgeText}>Verified</Text>
                  </View>
                </View>

                <View style={styles.mobileDetailBody}>
                  <Text numberOfLines={1} style={styles.mobileDetailLocation}>
                    Road 92, Gulshan-2
                  </Text>
                  <Text numberOfLines={1} style={styles.mobileDetailTitle}>
                    {p1.title}
                  </Text>
                  <Text style={styles.mobileDetailPrice}>৳4.85 Crore</Text>

                  <View style={styles.mobileContactBtn}>
                    <Mail color="#FFFFFF" size={13} strokeWidth={2} />
                    <Text style={styles.mobileContactBtnText}>Contact Owner Directly</Text>
                  </View>
                </View>
              </View>
            </PhoneFrame>
          </View>
        </View>
      ) : (
        /* Mobile Only: Focused Single Phone Frame Preview */
        <View style={styles.mobileVisualWrap}>
          <PhoneFrame style={styles.mobileStandalonePhone}>
            <View style={styles.mobileDetailPreview}>
              <View style={styles.mobileDetailImageWrap}>
                <Image
                  source={{ uri: p1.media?.[0]?.url }}
                  style={styles.mobileDetailImage}
                  resizeMode="cover"
                />
                <View style={styles.mobileDetailBadge}>
                  <ShieldCheck color="#2251D6" size={12} strokeWidth={2.5} />
                  <Text style={styles.mobileDetailBadgeText}>Verified</Text>
                </View>
              </View>

              <View style={styles.mobileDetailBody}>
                <Text numberOfLines={1} style={styles.mobileDetailLocation}>
                  Road 92, Gulshan-2, Dhaka
                </Text>
                <Text numberOfLines={1} style={styles.mobileDetailTitle}>
                  {p1.title}
                </Text>
                <Text style={styles.mobileDetailPrice}>৳4.85 Crore</Text>

                <View style={styles.mobileContactBtn}>
                  <Mail color="#FFFFFF" size={13} strokeWidth={2} />
                  <Text style={styles.mobileContactBtnText}>Contact Owner Directly</Text>
                </View>
              </View>
            </View>
          </PhoneFrame>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  compositionWrap: {
    position: "relative",
    width: "100%",
    maxWidth: 920,
    alignItems: "center",
  },
  browserFrame: {
    width: "100%",
    maxWidth: 860,
  },
  browserFrameCompact: {
    maxWidth: 740,
  },
  browserBody: {
    padding: 18,
    backgroundColor: "#F8FAF9",
  },
  searchReplicaBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    marginBottom: 16,
  },
  searchReplicaInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  searchReplicaPlaceholder: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  searchReplicaAreaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchReplicaAreaText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  searchReplicaBtn: {
    backgroundColor: "#04cf92",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchReplicaBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 16,
  },
  cardCol: {
    flex: 1,
  },
  phoneOverlapWrap: {
    position: "absolute",
    right: -14,
    bottom: -24,
    zIndex: 10,
    transform: [{ rotate: "1.5deg" }],
  },
  phoneFrame: {
    width: 250,
  },
  mobileVisualWrap: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  mobileStandalonePhone: {
    width: "100%",
    maxWidth: 320,
  },
  mobileDetailPreview: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 14,
  },
  mobileDetailImageWrap: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  mobileDetailImage: {
    width: "100%",
    height: "100%",
  },
  mobileDetailBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8EEFC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  mobileDetailBadgeText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: "600",
  },
  mobileDetailBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 4,
  },
  mobileDetailLocation: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  mobileDetailTitle: {
    color: "#0B1A17",
    fontFamily: fonts.headingBold,
    fontSize: 13.5,
    fontWeight: "700",
  },
  mobileDetailPrice: {
    color: "#0F6D55",
    fontFamily: fonts.headingExtraBold,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  mobileContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0F6D55",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  mobileContactBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 11.5,
    fontWeight: "700",
  },
});
