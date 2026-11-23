import { ExternalLink, MapPin, type LucideIcon } from "@/components/icons";
import { Platform, Pressable, Text, View } from "react-native";
import { openExternalUrl } from "@/lib/safeUrl";
import { colorTokens, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
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
 * The listing's location. On the web, Google's embedded map. In the app, the address and the
 * link to Google Maps: it used to be a stock photo of a world map with a pin drawn on top, which
 * looked like a real map and pointed nowhere. A real map with this listing's pin can replace the
 * address card once the pin is checked on a device.
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
  const showMap = Platform.OS === "web";

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

      {showMap ? (
        <View style={styles.mapCard}>
          <iframe
            title={`Google Map for ${title}`}
            src={mapEmbedUrl}
            style={{ width: "100%", height: "100%", border: 0, borderRadius: 16 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          <View pointerEvents="none" style={styles.mapAddressPill}>
            <MapPin color={colorTokens.brandText} size={14} />
            <Text numberOfLines={1} style={styles.mapAddressPillText}>
              {place}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.locationAddressOnly}>
          <MapPin color={colorTokens.brandText} size={18} />
          <Text style={styles.locationAddressOnlyText}>{place}</Text>
        </View>
      )}

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
