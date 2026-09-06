import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlusCircle, Rocket } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { AppLink } from "@/components/ui";
import { fonts, webPointer } from "@/theme";

export interface SellerWelcomeBannerProps {
  name?: string;
  viewsThisWeek?: string | number;
  inquiriesThisWeek?: string | number;
  onAddNewProperty?: () => void;
  onBoostListing?: () => void;
  addPropertyHref?: string;
  style?: StyleProp<ViewStyle>;
}

export function SellerWelcomeBanner({
  name = "Ayesha Rahman",
  viewsThisWeek = "3,240",
  inquiriesThisWeek = "18",
  onAddNewProperty,
  onBoostListing,
  addPropertyHref = "/property/create",
  style,
}: SellerWelcomeBannerProps) {
  return (
    <LinearGradient
      colors={["rgb(15, 109, 85)", "rgb(34, 81, 214)"]}
      end={{ x: 0.92, y: 0.92 }}
      start={{ x: 0.08, y: 0.08 }}
      style={[styles.container, style]}
    >
      <View style={styles.contentLeft}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>Welcome back,</Text>

        {/* Heading */}
        <Text style={styles.title}>{name} 👋</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your listings got{" "}
          <Text style={styles.boldText}>
            {typeof viewsThisWeek === "number"
              ? viewsThisWeek.toLocaleString()
              : viewsThisWeek}{" "}
            views
          </Text>{" "}
          this week and{" "}
          <Text style={styles.boldText}>
            {inquiriesThisWeek} new inquiries
          </Text>
          . Keep the momentum going.
        </Text>

        {/* Action Buttons Row */}
        <View style={styles.buttonRow}>
          {addPropertyHref ? (
            <AppLink
              href={addPropertyHref}
              onPress={onAddNewProperty}
              style={[styles.primaryBtn, webPointer]}
            >
              <PlusCircle color="#0F6D55" size={16} strokeWidth={2} />
              <Text style={styles.primaryBtnText}>Add new property</Text>
            </AppLink>
          ) : (
            <Pressable
              onPress={onAddNewProperty}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
                webPointer,
              ]}
            >
              <PlusCircle color="#0F6D55" size={16} strokeWidth={2} />
              <Text style={styles.primaryBtnText}>Add new property</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityLabel="Boost a listing"
            onPress={onBoostListing}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
              webPointer,
            ]}
          >
            <Rocket color="#FFFFFF" size={16} strokeWidth={2} />
            <Text style={styles.secondaryBtnText}>Boost a listing</Text>
          </Pressable>
        </View>
      </View>

      {/* Decorative Rocket Watermark SVG (Figma Node 220:8903) */}
      <View pointerEvents="none" style={styles.watermarkContainer}>
        <Svg
          fill="none"
          height={160}
          viewBox="0 0 160 160"
          width={160}
        >
          <Path
            d="M29.9996 109.999C19.9997 118.399 16.6665 143.332 16.6665 143.332C16.6665 143.332 41.5995 139.998 49.9994 129.998C54.7326 124.398 54.666 115.799 49.3994 110.599C46.8081 108.125 43.3947 106.696 39.8143 106.586C36.2339 106.475 32.7388 107.69 29.9996 109.999Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.1}
            strokeWidth={13.3332}
          />
          <Path
            d="M79.999 99.9988L59.9992 79.999C63.5468 70.7953 68.0138 61.973 73.3324 53.666C81.1002 41.2461 91.9163 31.0199 104.752 23.9603C117.588 16.9007 132.016 13.2423 146.665 13.3332C146.665 31.4663 141.465 63.3325 106.665 86.6656C98.2447 91.9903 89.3112 96.4571 79.999 99.9988Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.1}
            strokeWidth={13.3332}
          />
          <Path
            d="M59.9992 79.999H26.6663C26.6663 79.999 30.333 59.7993 39.9995 53.3327C50.7994 46.1328 73.3324 53.3327 73.3324 53.3327"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.1}
            strokeWidth={13.3332}
          />
          <Path
            d="M79.999 99.9987V133.332C79.999 133.332 100.199 129.665 106.665 119.998C113.865 109.199 106.665 86.6656 106.665 86.6656"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.1}
            strokeWidth={13.3332}
          />
        </Svg>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
  },
  contentLeft: {
    zIndex: 1,
    maxWidth: 520,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.regular,
  },
  title: {
    fontSize: 25.6,
    lineHeight: 38.4,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    letterSpacing: -0.512,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  boldText: {
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  primaryBtn: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: "#0F6D55",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    lineHeight: 20,
  },
  secondaryBtn: {
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  secondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    lineHeight: 20,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  watermarkContainer: {
    position: "absolute",
    right: 12,
    bottom: -15,
    opacity: 0.95,
  },
});
