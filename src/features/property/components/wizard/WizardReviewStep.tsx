import { CheckCircle2 } from "@/components/icons";
import { Text, View } from "react-native";
import { priceOnRequestLabel, useTranslation } from "@/i18n";
import { subtypeLabel, type PropertyTypeConfig } from "../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 5: review before publishing. */
export function WizardReviewStep({ activeTypeConfig }: { activeTypeConfig: PropertyTypeConfig }) {
  const { t, language } = useTranslation();
  const store = usePropertyWizardStore();

  return (
    <View style={styles.stepFormBody}>
      {/* Ready to Publish Alert Banner */}
      <View style={styles.readyAlertBanner}>
        <View style={styles.readyAlertTitleRow}>
          <CheckCircle2 color="#04cf92" size={18} />
          <Text style={styles.readyAlertTitle}>{t("wizard.review.readyTitle")}</Text>
        </View>
        <Text style={styles.readyAlertDesc}>
          {t("wizard.review.readyDesc")}
        </Text>
      </View>

      {/* Summary Key-Value Cards Grid */}
      <View style={styles.reviewGrid}>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.titleLabel")}</Text>
          <Text style={styles.reviewCardValue}>{store.title}</Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.categorySubtypeLabel")}</Text>
          <Text style={styles.reviewCardValue}>
            {activeTypeConfig.label} ({subtypeLabel(activeTypeConfig, store.subtype)}) ·{" "}
            {store.listingType === "sale" ? t("wizard.basics.forSale") : t("wizard.basics.forRent")}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.priceLabel")}</Text>
          <Text style={styles.reviewCardValue}>
            {store.priceOnRequest
              ? priceOnRequestLabel(language)
              : `${t("wizard.review.bdtPrefix")}${Number(store.price).toLocaleString()}${store.subtype === "short-let" ? t("wizard.review.shortLetRate") : store.listingType === "rent" ? t("wizard.review.perMonth") : ""}`}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.areaSizeLabel")}</Text>
          <Text style={styles.reviewCardValue}>
            {store.areaSize || t("wizard.review.notSpecified")} {store.areaUnit || activeTypeConfig.defaultUnit}
          </Text>
        </View>

        {activeTypeConfig.hasBedrooms && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>{t("wizard.review.bedsBathsLabel")}</Text>
            <Text style={styles.reviewCardValue}>
              {t("wizard.review.bedsBathsValue", { beds: store.bedrooms || "0", baths: store.bathrooms || "0" })}
            </Text>
          </View>
        )}

        {activeTypeConfig.hasFloor && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>{t("wizard.review.floorLevelLabel")}</Text>
            <Text style={styles.reviewCardValue}>{store.floor || t("wizard.review.notSpecified")}</Text>
          </View>
        )}

        {activeTypeConfig.hasFacing && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>{t("wizard.review.facingLabel")}</Text>
            <Text style={styles.reviewCardValue}>{store.facing || t("wizard.review.notSpecified")}</Text>
          </View>
        )}

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.locationLabel")}</Text>
          <Text style={styles.reviewCardValue}>
            {[store.address, store.areaName, store.district].filter(Boolean).join(", ") || t("wizard.review.notSpecified")}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.amenitiesLabel")}</Text>
          <Text style={styles.reviewCardValue}>
            {t("wizard.review.amenitiesCount", { count: Object.values(store.amenities).filter(Boolean).length })}
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardLabel}>{t("wizard.review.mediaLabel")}</Text>
          <Text style={styles.reviewCardValue}>
            {t("wizard.review.photosCount", { count: store.media.filter((m) => m.mediaType === "image").length })}
            {store.media.some((m) => m.mediaType === "video") ? t("wizard.review.oneVideo") : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}
