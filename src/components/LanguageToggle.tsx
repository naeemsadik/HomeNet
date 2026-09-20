import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Globe } from "lucide-react-native";
import { useLanguageStore } from "@/utils/language";
import { fonts, webPointer } from "@/theme";

interface LanguageToggleProps {
  compact?: boolean;
  variant?: "default" | "crystal";
}

export function LanguageToggle({
  compact = false,
  variant = "default",
}: LanguageToggleProps) {
  const { currentLanguage, toggleLanguage } = useLanguageStore();
  const isBangla = currentLanguage === "bn";
  const isCrystal = variant === "crystal";

  return (
    <Pressable
      onPress={toggleLanguage}
      {...(Platform.OS === "web" ? ({ className: "notranslate", translate: "no" } as any) : {})}
      style={({ pressed, hovered }: any) => [
        styles.button,
        compact && styles.buttonCompact,
        isCrystal && styles.buttonCrystal,
        hovered && (isCrystal ? styles.buttonCrystalHovered : styles.buttonHovered),
        pressed && styles.buttonPressed,
        webPointer,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        isBangla
          ? "বর্তমান ভাষা বাংলা। ইংরেজি করতে ক্লিক করুন।"
          : "Current language is English. Click for Bangla."
      }
    >
      <View style={styles.iconWrap}>
        <Globe
          color={isCrystal ? "#FFFFFF" : "#0B1A17"}
          size={compact ? 15 : 17}
          strokeWidth={2}
        />
      </View>

      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          isCrystal && styles.labelCrystal,
        ]}
        {...(Platform.OS === "web" ? ({ className: "notranslate", translate: "no" } as any) : {})}
      >
        {isBangla ? "বাংলা" : "English"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(4, 207, 146, 0.85)",
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 999,
    flexShrink: 0,
    shadowColor: "#04cf92",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.select({
      web: {
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      },
      default: {},
    }) as any),
  },
  buttonCompact: {
    height: 32,
    paddingHorizontal: 10,
    gap: 5,
    borderWidth: 1.4,
  },
  buttonHovered: {
    backgroundColor: "rgba(4, 207, 146, 0.05)",
    borderColor: "#03b57f",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(4, 207, 146, 0.1)",
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: "#0B1A17",
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 12,
  },
  labelCrystal: {
    color: "#FFFFFF",
  },
  buttonCrystal: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderColor: "rgba(255, 255, 255, 0.35)",
    shadowColor: "transparent",
  },
  buttonCrystalHovered: {
    backgroundColor: "rgba(255, 255, 255, 0.26)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
});
