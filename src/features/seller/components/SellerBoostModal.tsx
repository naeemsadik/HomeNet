import { Check, Rocket, X } from "@/components/icons";
import { Modal, Pressable, Text, View } from "react-native";
import { colorTokens, colors, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { styles } from "../screens/SellerDashboardScreen.styles";

type SellerBoostModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedPackage: string;
  onSelectPackage: (packageId: string) => void;
};

/** Pick a boost package. "Activate Boost" only closes the dialog: there is no boost API yet. */
export function SellerBoostModal({ visible, onClose, selectedPackage, onSelectPackage }: SellerBoostModalProps) {
  const { t } = useTranslation();

  const packages = [
    {
      id: "featured",
      name: t("seller.boost.packages.featured.name"),
      price: t("seller.boost.packages.featured.price"),
      highlight: t("seller.boost.packages.featured.highlight"),
      desc: t("seller.boost.packages.featured.desc"),
    },
    {
      id: "ai_priority",
      name: t("seller.boost.packages.aiPriority.name"),
      price: t("seller.boost.packages.aiPriority.price"),
      highlight: t("seller.boost.packages.aiPriority.highlight"),
      desc: t("seller.boost.packages.aiPriority.desc"),
    },
    {
      id: "omni_blast",
      name: t("seller.boost.packages.omniBlast.name"),
      price: t("seller.boost.packages.omniBlast.price"),
      highlight: t("seller.boost.packages.omniBlast.highlight"),
      desc: t("seller.boost.packages.omniBlast.desc"),
    },
  ];

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          onPress={onClose}
          style={styles.modalBackdropTouch}
        />
        <View style={styles.boostModalCard}>
          <View style={styles.boostModalHeader}>
            <View style={styles.boostHeaderIconWrap}>
              <Rocket color={colors.green} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.boostModalTitle}>{t("seller.boost.modal.title")}</Text>
              <Text style={styles.boostModalSub}>
                {t("seller.boost.modal.subtitle")}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={t("seller.boost.modal.closeAria")}
              onPress={onClose}
              style={[styles.modalCloseBtn, webPointer]}
            >
              <X color={colors.muted} size={18} />
            </Pressable>
          </View>

          {/* Boost Packages */}
          <View style={styles.packagesList}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => onSelectPackage(pkg.id)}
                  style={[
                    styles.pkgCard,
                    isSelected && styles.pkgCardSelected,
                    webPointer,
                  ]}
                >
                  <View
                    style={[
                      styles.pkgRadio,
                      isSelected && styles.pkgRadioSelected,
                    ]}
                  >
                    {isSelected ? (
                      <Check color={colorTokens.onBrand} size={12} strokeWidth={3} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.pkgTitleRow}>
                      <Text style={styles.pkgName}>{pkg.name}</Text>
                      <View style={styles.pkgBadge}>
                        <Text style={styles.pkgBadgeText}>{pkg.highlight}</Text>
                      </View>
                    </View>
                    <Text style={styles.pkgDesc}>{pkg.desc}</Text>
                    <Text style={styles.pkgPrice}>{pkg.price}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Modal Actions */}
          <View style={styles.boostModalActions}>
            <Pressable
              onPress={onClose}
              style={[styles.boostCancelBtn, webPointer]}
            >
              <Text style={styles.boostCancelBtnText}>{t("seller.boost.modal.cancelBtn")}</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={[styles.boostConfirmBtn, webPointer]}
            >
              <Rocket color={colorTokens.onBrand} size={16} />
              <Text style={styles.boostConfirmBtnText}>{t("seller.boost.modal.activateBtn")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
