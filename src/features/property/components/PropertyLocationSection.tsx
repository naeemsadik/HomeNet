import { ExternalLink, MapPin, type LucideIcon } from "@/components/icons";
import { Image, Linking, Platform, Pressable, Text, View } from "react-native";
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

/** Map (embedded on web, a tap-through preview on native) and nearby places. */
export function PropertyLocationSection({
  title,
  address,
  location,
  nearbyPlaces,
  mapEmbedUrl,
  mapExternalUrl,
}: PropertyLocationSectionProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderBetween}>
        <Text style={styles.sectionHeading}>{t("propertyDetail.location")}</Text>
        <Pressable
          accessibilityLabel={t("propertyDetail.openGoogleMaps")}
          onPress={() => void Linking.openURL(mapExternalUrl)}
          style={({ pressed }) => [styles.openMapsBtn, webPointer, pressed && styles.pressed]}
        >
          <ExternalLink color="#04cf92" size={14} />
          <Text style={styles.openMapsBtnText}>{t("propertyDetail.openGoogleMaps")}</Text>
        </Pressable>
      </View>

      <View style={styles.mapCard}>
        {Platform.OS === "web" ? (
          <iframe
            title={`Google Map for ${title}`}
            src={mapEmbedUrl}
            style={{
              width: "100%",
              height: "100%",
              border: 0,
              borderRadius: 16,
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <Pressable
            onPress={() => void Linking.openURL(mapExternalUrl)}
            style={styles.nativeMapContainer}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80" }}
              style={styles.mapImage}
            />
            <View style={styles.mapPinOverlay}>
              <View style={styles.mapTooltip}>
                <Text style={styles.mapTooltipText}>{address || location}</Text>
              </View>
              <View style={styles.mapPinCircle}>
                <MapPin color={colorTokens.onBrand} size={18} />
              </View>
            </View>
          </Pressable>
        )}

        <View style={styles.mapAddressPill}>
          <MapPin color="#04cf92" size={14} />
          <Text numberOfLines={1} style={styles.mapAddressPillText}>
            {address || location}
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
