import { Phone, X } from "@/components/icons";
import { Modal, Pressable, Text, View } from "react-native";
import { colorTokens, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { styles } from "../screens/PropertyDetailScreen.styles";
import { WhatsAppIcon } from "./WhatsAppIcon";

type BookVisitModalProps = {
  visible: boolean;
  onClose: () => void;
  propertyTitle: string;
  sellerName: string;
  sellerPhone: string | null;
  /** Opens WhatsApp with a prefilled visit request. */
  onRequestVisit: () => void;
  onCall: () => void;
};

/**
 * There is no visit-booking API, so this hands the request to the seller
 * directly (WhatsApp or a call) rather than confirming a booking nobody made.
 */
export function BookVisitModal({
  visible,
  onClose,
  propertyTitle,
  sellerName,
  sellerPhone,
  onRequestVisit,
  onCall,
}: BookVisitModalProps) {
  const { t } = useTranslation();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("bookVisit.title")}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X color="#0B1A17" size={20} />
            </Pressable>
          </View>

          <Text style={styles.modalBodyText}>
            {t("bookVisit.body", { sellerName, propertyTitle })}
          </Text>

          {sellerPhone ? null : (
            <Text style={styles.modalNoPhoneText}>
              {t("bookVisit.noPhone")}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={!sellerPhone}
            onPress={() => {
              onClose();
              onRequestVisit();
            }}
            style={[
              styles.confirmVisitBtn,
              webPointer,
              !sellerPhone && styles.confirmVisitBtnDisabled,
            ]}
          >
            <WhatsAppIcon size={18} color={sellerPhone ? colorTokens.onBrand : colorTokens.subtle} />
            <Text
              style={[
                styles.confirmVisitText,
                !sellerPhone && styles.confirmVisitTextDisabled,
              ]}
            >
              {t("bookVisit.requestWhatsApp")}
            </Text>
          </Pressable>

          <View style={styles.modalDivider}>
            <View style={styles.modalDividerLine} />
            <Text style={styles.modalDividerText}>{t("bookVisit.orCall")}</Text>
            <View style={styles.modalDividerLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!sellerPhone}
            onPress={() => {
              onClose();
              onCall();
            }}
            style={[
              styles.modalCallBtn,
              webPointer,
              !sellerPhone && styles.modalCallBtnDisabled,
            ]}
          >
            <Phone size={18} color={sellerPhone ? colorTokens.ink : colorTokens.subtle} />
            <Text
              style={[
                styles.modalCallBtnText,
                !sellerPhone && styles.modalCallBtnTextDisabled,
              ]}
            >
              {t("bookVisit.callSeller", { sellerName })}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
