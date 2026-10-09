import { CheckCircle2 } from "@/components/icons";
import { Text, View } from "react-native";
import { subtypeLabel, type PropertyTypeConfig } from "../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 5: review before publishing. */
export function WizardReviewStep({ activeTypeConfig }: { activeTypeConfig: PropertyTypeConfig }) {
  const store = usePropertyWizardStore();

  return (
    <View style={styles.stepFormBody}>
      {/* Ready to Publish Alert Banner */}
      <View style={styles.readyAlertBanner}>
        <View style={styles.readyAlertTitleRow}>
          <CheckCircle2 color="#04cf92" size={18} />
          <Text style={styles.readyAlertTitle}>Ready for verification</Text>
        </View>
        <Text style={styles.readyAlertDesc}>
          Review your listing below. Submission sends it to the verification queue.
        </Text>
      </View>

      {/* Summary Key-Value Cards Grid */}
      <View style={styles.reviewGrid}>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Title</Text>
          <Text style={styles.reviewCardValue}>{store.title}</Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Category & Subtype</Text>
          <Text style={styles.reviewCardValue}>
            {activeTypeConfig.label} ({subtypeLabel(activeTypeConfig, store.subtype)}) ·{" "}
            {store.listingType === "sale" ? "For Sale" : "For Rent"}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Price</Text>
          <Text style={styles.reviewCardValue}>
            BDT {Number(store.price).toLocaleString()}
            {store.subtype === "short-let" ? " (Short-let rate)" : store.listingType === "rent" ? "/mo" : ""}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Area Size</Text>
          <Text style={styles.reviewCardValue}>
            {store.areaSize || "Not specified"} {store.areaUnit || activeTypeConfig.defaultUnit}
          </Text>
        </View>

        {activeTypeConfig.hasBedrooms && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Beds / Baths</Text>
            <Text style={styles.reviewCardValue}>
              {store.bedrooms || "0"} Beds / {store.bathrooms || "0"} Baths
            </Text>
          </View>
        )}

        {activeTypeConfig.hasFloor && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Floor Level</Text>
            <Text style={styles.reviewCardValue}>{store.floor || "Not specified"}</Text>
          </View>
        )}

        {activeTypeConfig.hasFacing && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Facing</Text>
            <Text style={styles.reviewCardValue}>{store.facing || "Not specified"}</Text>
          </View>
        )}

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Location</Text>
          <Text style={styles.reviewCardValue}>
            {[store.address, store.areaName, store.district].filter(Boolean).join(", ") || "Not specified"}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Amenities</Text>
          <Text style={styles.reviewCardValue}>
            {Object.values(store.amenities).filter(Boolean).length} features selected
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>Media</Text>
          <Text style={styles.reviewCardValue}>
            {store.media.filter((m) => m.mediaType === "image").length} photos
            {store.media.some((m) => m.mediaType === "video") ? " · 1 video" : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}
