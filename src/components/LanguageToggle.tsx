import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Globe } from "lucide-react-native";
import { useLanguageStore } from "@/utils/language";
import { fonts, webPointer } from "@/theme";

interface LanguageToggleProps {
  compact?: boolean;
}

export function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { currentLanguage, toggleLanguage } = useLanguageStore();
  const isBangla = currentLanguage === "bn";

  return (
    <Pressable
      onPress={toggleLanguage}
      {...(Platform.OS === "web" ? ({ className: "notranslate", translate: "no" } as any) : {})}
      style={({ pressed, hovered }: any) => [
        styles.button,
        compact && styles.buttonCompact,
        hovered && styles.buttonHovered,
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
          color="#0B1A17"
          size={compact ? 15 : 17}
          strokeWidth={2}
        />
      </View>

      <Text
        style={[styles.label, compact && styles.labelCompact]}
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#04cf92",
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 999,
    flexShrink: 0,
    shadowColor: "#04cf92",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
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
});
