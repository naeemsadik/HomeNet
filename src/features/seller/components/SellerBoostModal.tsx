import { Check, Rocket, X } from "@/components/icons";
import { Modal, Pressable, Text, View } from "react-native";
import { colorTokens, colors, webPointer } from "@/theme";
import { styles } from "../screens/SellerDashboardScreen.styles";

type SellerBoostModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedPackage: string;
  onSelectPackage: (packageId: string) => void;
};

/** Pick a boost package. "Activate Boost" only closes the dialog: there is no boost API yet. */
export function SellerBoostModal({ visible, onClose, selectedPackage, onSelectPackage }: SellerBoostModalProps) {
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
              <Text style={styles.boostModalTitle}>Boost a listing</Text>
              <Text style={styles.boostModalSub}>
                Get up to 10x more buyer views and inquiries.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close modal"
              onPress={onClose}
              style={[styles.modalCloseBtn, webPointer]}
            >
              <X color={colors.muted} size={18} />
            </Pressable>
          </View>

          {/* Boost Packages */}
          <View style={styles.packagesList}>
            {[
              {
                id: "featured",
                name: "Featured Spotlight",
                price: "৳ 1,500 / 7 days",
                highlight: "3x More Views",
                desc: "Top placement in search results and category landing pages.",
              },
              {
                id: "ai_priority",
                name: "AI Recommendation Priority",
                price: "৳ 2,500 / 14 days",
                highlight: "5x More Inquiries",
                desc: "Ranked #1 in Homenet's AI Matchmaker search algorithm.",
              },
              {
                id: "omni_blast",
                name: "VIP Omni-Channel Blast",
                price: "৳ 4,500 / 30 days",
                highlight: "10x Reach",
                desc: "Included in weekly buyer newsletter and verified partner badges.",
              },
            ].map((pkg) => {
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
              <Text style={styles.boostCancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={[styles.boostConfirmBtn, webPointer]}
            >
              <Rocket color={colorTokens.onBrand} size={16} />
              <Text style={styles.boostConfirmBtnText}>Activate Boost</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
