import { ExternalLink, MapPin, type LucideIcon } from "@/components/icons";
import { Pressable, Text, View } from "react-native";
import { openExternalUrl } from "@/lib/safeUrl";
import { colorTokens, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { GoogleMapEmbed } from "./GoogleMapEmbed";
import { styles } from "../screens/PropertyDetailScreen.styles";

export type NearbyPlace = {
  name: string;
  distance: string;
  icon: LucideIcon;
};

type PropertyLocationSectionProps = {
  title: string;
  address: string;
  location: string;
  nearbyPlaces: NearbyPlace[];
  mapEmbedUrl: string;
  mapExternalUrl: string;
};

/**
 * The listing's location: Google's embedded map, on the web and in the app alike. In the app it
 * used to be a stock photo of a wooden world map with a pin drawn on top, which looked like a
 * real map and pointed nowhere.
 */
export function PropertyLocationSection({
  title,
  address,
  location,
  nearbyPlaces,
  mapEmbedUrl,
  mapExternalUrl,
}: PropertyLocationSectionProps) {
  const { t } = useTranslation();
  const place = address || location;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.locationHeader}>
        <Text style={styles.sectionHeading}>{t("propertyDetail.location")}</Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("propertyDetail.openGoogleMaps")}
          onPress={() => openExternalUrl(mapExternalUrl)}
          hitSlop={8}
          style={({ pressed }) => [styles.openMapsBtn, webPointer, pressed && styles.pressed]}
        >
          <ExternalLink color={colorTokens.brandText} size={14} />
          <Text style={styles.openMapsBtnText}>{t("propertyDetail.openGoogleMaps")}</Text>
        </Pressable>
      </View>

      <View style={styles.mapCard}>
        <GoogleMapEmbed title={title} embedUrl={mapEmbedUrl} />

        <View pointerEvents="none" style={styles.mapAddressPill}>
          <MapPin color={colorTokens.brandText} size={14} />
          <Text numberOfLines={1} style={styles.mapAddressPillText}>
            {place}
          </Text>
        </View>
      </View>

      {/* Nearby Points of Interest */}
      {nearbyPlaces.length > 0 && (
      <View style={styles.nearbyGrid}>
        {nearbyPlaces.map((poi) => {
          const PoiIcon = poi.icon;
          return (
            <View key={poi.name} style={styles.poiCard}>
              <View style={styles.poiIconBg}>
                <PoiIcon color="#2251D6" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.poiName}>{poi.name}</Text>
                <Text style={styles.poiDist}>{poi.distance}</Text>
              </View>
            </View>
          );
        })}
      </View>
      )}
    </View>
  );
}
