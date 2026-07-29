import { LinearGradient } from "expo-linear-gradient";
import { Bath, BedDouble, Heart, LandPlot, MapPin, ShieldCheck } from "lucide-react-native";
import { ImageBackground, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle, View } from "react-native";
import type { Property } from "@/data/properties";
import { colors, fonts, webPointer } from "@/theme";
import { AppLink } from "./ui";

export function PropertyCard({
  property,
  saved,
  onSave,
  mode = "buy",
  feature = false,
  list = false,
  imageHeight,
  badgeText,
  style,
}: {
  property: Property;
  saved: boolean;
  onSave: () => void;
  mode?: "buy" | "rent";
  feature?: boolean;
  list?: boolean;
  imageHeight?: number;
  badgeText?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, list && styles.cardList, style]}>
      <View style={[styles.imageWrap, feature && styles.featureImage, list && styles.listImage, imageHeight ? { height: imageHeight } : null]}>
        <ImageBackground resizeMode="cover" source={{ uri: property.image }} style={styles.image}>
          <AppLink href={`/property/${property.id}`} accessibilityLabel={`View ${property.title}`} style={StyleSheet.absoluteFill}>
            <View style={styles.fill} />
          </AppLink>
          <View style={styles.tag}>
            <ShieldCheck color={colors.greenDark} size={13} />
            <Text style={styles.tagText}>{property.tag}</Text>
          </View>
          <Pressable
            accessibilityLabel={saved ? "Remove from saved homes" : "Save this home"}
            accessibilityRole="button"
            onPress={onSave}
            style={({ pressed }) => [styles.favorite, webPointer, pressed && styles.pressed]}
          >
            <Heart color={saved ? colors.coral : "#345248"} fill={saved ? colors.coral : "transparent"} size={17} />
          </Pressable>
          {feature ? (
            <LinearGradient colors={["transparent", "rgba(5,27,22,0.84)"]} style={styles.featureCaption}>
              <Text style={styles.featureMeta}>{property.location}</Text>
              <Text style={styles.featureTitle}>{property.title}</Text>
              <Text style={styles.featureMeta}>{property.price}</Text>
            </LinearGradient>
          ) : null}
        </ImageBackground>
      </View>
      {!feature ? (
        <View style={[styles.body, list && styles.bodyList]}>
          <View style={styles.topline}>
            <Text style={styles.price}>{mode === "rent" ? property.monthlyPrice : property.price}</Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{badgeText ?? `${property.score}% match`}</Text>
            </View>
          </View>
          <AppLink href={`/property/${property.id}`}>
            <Text numberOfLines={2} style={styles.title}>{property.title}</Text>
          </AppLink>
          <View style={styles.location}>
            <MapPin color={colors.muted} size={13} />
            <Text numberOfLines={1} style={styles.locationText}>{property.location}</Text>
          </View>
          <View style={styles.meta}>
            <View style={styles.metaItem}><BedDouble color="#71827A" size={14} /><Text style={styles.metaText}>{property.beds} beds</Text></View>
            <View style={styles.metaItem}><Bath color="#71827A" size={14} /><Text style={styles.metaText}>{property.baths} baths</Text></View>
            <View style={styles.metaItem}><LandPlot color="#71827A" size={14} /><Text style={styles.metaText}>{property.area}</Text></View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minWidth: 0, overflow: "hidden", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 15 },
  cardList: { flexDirection: "row" },
  imageWrap: { position: "relative", height: 168, overflow: "hidden", backgroundColor: "#DAE4DF" },
  featureImage: { height: 272 },
  listImage: { width: 270, height: "auto", minHeight: 190 },
  image: { flex: 1 },
  fill: { flex: 1 },
  tag: { position: "absolute", top: 11, left: 11, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: "rgba(241,255,249,0.94)", borderWidth: 1, borderColor: "rgba(255,255,255,0.75)" },
  tagText: { color: colors.greenDark, fontFamily: fonts.extraBold, fontSize: 9 },
  favorite: { position: "absolute", top: 10, right: 10, width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "rgba(255,255,255,0.78)" },
  pressed: { opacity: 0.78 },
  featureCaption: { position: "absolute", right: 0, bottom: 0, left: 0, gap: 4, paddingTop: 46, paddingHorizontal: 17, paddingBottom: 16 },
  featureMeta: { color: "rgba(255,255,255,0.8)", fontFamily: fonts.regular, fontSize: 10 },
  featureTitle: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 14, letterSpacing: -0.3 },
  body: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 15 },
  bodyList: { flex: 1, justifyContent: "center", padding: 23 },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  price: { color: "#172D25", fontFamily: fonts.extraBold, fontSize: 13 },
  matchBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: colors.greenLight },
  matchText: { color: colors.greenDark, fontFamily: fonts.extraBold, fontSize: 8 },
  title: { minHeight: 34, marginTop: 8, marginBottom: 5, color: colors.ink, fontFamily: fonts.bold, fontSize: 12, letterSpacing: -0.3, lineHeight: 17 },
  location: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { flexShrink: 1, color: colors.muted, fontFamily: fonts.regular, fontSize: 9 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 13, marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: "#EDF1EF" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "#71827A", fontFamily: fonts.regular, fontSize: 8 },
});
