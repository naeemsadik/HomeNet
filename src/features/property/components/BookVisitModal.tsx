import { Phone, X } from "@/components/icons";
import { Modal, Pressable, Text, View } from "react-native";
import { colorTokens, fonts, webPointer } from "@/theme";
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
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book a Property Visit</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X color="#0B1A17" size={20} />
            </Pressable>
          </View>

          <Text style={styles.modalBodyText}>
            Ask {sellerName} to arrange an in-person viewing of{" "}
            <Text style={{ fontFamily: fonts.bold }}>{propertyTitle}</Text>. WhatsApp opens with
            your request already written.
          </Text>

          {sellerPhone ? null : (
            <Text style={styles.modalNoPhoneText}>
              The owner hasn't shared a phone number, so a visit can't be requested yet.
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
              !sellerPhone && styles.actionBtnDisabled,
            ]}
          >
            <WhatsAppIcon size={18} color={colorTokens.onBrand} />
            <Text style={styles.confirmVisitText}>Request visit on WhatsApp</Text>
          </Pressable>

          <View style={styles.modalDivider}>
            <View style={styles.modalDividerLine} />
            <Text style={styles.modalDividerText}>or call</Text>
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
              !sellerPhone && styles.actionBtnDisabled,
            ]}
          >
            <Phone size={18} color={colorTokens.ink} />
            <Text style={styles.modalCallBtnText}>Call {sellerName}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
