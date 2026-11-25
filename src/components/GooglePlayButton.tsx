import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { notify } from "@/lib/alert";
import { fonts, webPointer } from "@/theme";

export function GooglePlayButton() {
  return (
    <Pressable
      accessibilityLabel="Get it on Google Play"
      style={[styles.playStoreBtn, webPointer]}
      onPress={() => {
        notify(
          "Download Homenet",
          "Homenet for Android is launching soon on the Google Play Store!"
        );
      }}
    >
      <Svg width="22" height="24" viewBox="0 0 512 512">
        <Path
          fill="#4285F4"
          d="M32.5 48.3v415.4c0 10.9 5.8 20.9 15.1 26.4l230.9-234.1L47.6 21.9c-9.3 5.5-15.1 15.5-15.1 26.4z"
        />
        <Path
          fill="#FBBC04"
          d="M380.2 329.8l-101.7-73.8 101.7-73.8 54.3 31.3c15.4 8.9 25 25.3 25 42.5s-9.6 33.6-25 42.5l-54.3 31.3z"
        />
        <Path
          fill="#EA4335"
          d="M278.5 256L47.6 489.1c11.9 6.8 26.6 6.8 38.5 0l294.1-159.3-101.7-73.8z"
        />
        <Path
          fill="#34A853"
          d="M380.2 182.2L86.1 22.9C74.2 16 59.5 16 47.6 22.9L278.5 256l101.7-73.8z"
        />
      </Svg>
      <View style={styles.playStoreTextWrap}>
        <Text style={styles.playStoreSub}>GET IT ON</Text>
        <Text style={styles.playStoreTitle}>Google Play</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  playStoreBtn: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  playStoreTextWrap: {
    justifyContent: "center",
  },
  playStoreSub: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontFamily: fonts.medium,
    letterSpacing: 0.5,
    lineHeight: 11,
  },
  playStoreTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: "700",
    lineHeight: 17,
  },
});
