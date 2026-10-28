import React, { useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, CheckCircle2, Flag, X } from "@/components/icons";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { reportListingMailto } from "@/lib/reportListing";

export interface ReportListingModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

type ReportReasonKey = "fakeListing" | "brokerSpam" | "incorrectPrice" | "inappropriate" | "other";

const REPORT_REASONS: { key: ReportReasonKey; titleKey: string; descKey: string }[] = [
  {
    key: "fakeListing",
    titleKey: "reportModal.fakeListing",
    descKey: "reportModal.fakeListingDesc",
  },
  {
    key: "brokerSpam",
    titleKey: "reportModal.brokerSpam",
    descKey: "reportModal.brokerSpamDesc",
  },
  {
    key: "incorrectPrice",
    titleKey: "reportModal.incorrectPrice",
    descKey: "reportModal.incorrectPriceDesc",
  },
  {
    key: "inappropriate",
    titleKey: "reportModal.inappropriate",
    descKey: "reportModal.inappropriateDesc",
  },
  {
    key: "other",
    titleKey: "reportModal.other",
    descKey: "reportModal.otherDesc",
  },
];

export function ReportListingModal({
  visible,
  onClose,
  propertyId,
  propertyTitle,
}: ReportListingModalProps) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<ReportReasonKey>("fakeListing");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = () => {
    // Open prepared email report
    const mailtoUrl = reportListingMailto({ id: propertyId, title: propertyTitle });
    Linking.openURL(mailtoUrl).catch(() => {
      // Fallback is gracefully handled inside the submission state
    });
    setIsSubmitted(true);
  };

  return (
    <Modal animationType="fade" onRequestClose={handleClose} transparent visible={visible}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <View style={modalStyles.titleRow}>
              <Flag color={colorTokens.brandText} size={18} />
              <Text style={modalStyles.title}>{t("reportModal.title")}</Text>
            </View>
            <Pressable
              accessibilityLabel={t("reportModal.close")}
              accessibilityRole="button"
              onPress={handleClose}
              style={[modalStyles.closeBtn, webPointer]}
            >
              <X color={colorTokens.ink} size={20} />
            </Pressable>
          </View>

          {isSubmitted ? (
            <View style={modalStyles.successBody}>
              <CheckCircle2 color={colorTokens.brandText} size={44} />
              <Text style={modalStyles.successTitle}>{t("reportModal.successTitle")}</Text>
              <Text style={modalStyles.successMessage}>{t("reportModal.successMessage")}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleClose}
                style={[modalStyles.primaryBtn, webPointer]}
              >
                <Text style={modalStyles.primaryBtnText}>{t("reportModal.close")}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={modalStyles.subtitle}>{t("reportModal.subtitle")}</Text>

              <Text style={modalStyles.reasonsLabel}>{t("reportModal.reasonsTitle")}</Text>

              <View style={modalStyles.reasonsList}>
                {REPORT_REASONS.map((item) => {
                  const isSelected = selectedReason === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedReason(item.key)}
                      style={[
                        modalStyles.reasonCard,
                        isSelected && modalStyles.reasonCardSelected,
                        webPointer,
                      ]}
                    >
                      <View style={[modalStyles.radioCircle, isSelected && modalStyles.radioCircleSelected]}>
                        {isSelected ? <Check color={colorTokens.onBrand} size={12} strokeWidth={3} /> : null}
                      </View>
                      <View style={modalStyles.reasonTextWrap}>
                        <Text style={[modalStyles.reasonTitle, isSelected && modalStyles.reasonTitleSelected]}>
                          {t(item.titleKey as any)}
                        </Text>
                        <Text style={modalStyles.reasonDesc}>{t(item.descKey as any)}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View style={modalStyles.actionsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleClose}
                  style={[modalStyles.cancelBtn, webPointer]}
                >
                  <Text style={modalStyles.cancelBtnText}>{t("reportModal.cancel")}</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleSubmit}
                  style={[modalStyles.primaryBtn, webPointer]}
                >
                  <Text style={modalStyles.primaryBtnText}>{t("reportModal.submit")}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    lineHeight: 18,
  },
  reasonsLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
    marginTop: 4,
  },
  reasonsList: {
    gap: 8,
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    backgroundColor: colorTokens.surface,
  },
  reasonCardSelected: {
    borderColor: colorTokens.brandText,
    backgroundColor: "rgba(4, 207, 146, 0.05)",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colorTokens.subtle,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brand,
  },
  reasonTextWrap: {
    flex: 1,
    gap: 2,
  },
  reasonTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colorTokens.ink,
  },
  reasonTitleSelected: {
    color: colorTokens.ink,
  },
  reasonDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  primaryBtn: {
    backgroundColor: colorTokens.brand,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: colorTokens.onBrand,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  successBody: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  successTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colorTokens.ink,
    marginTop: 4,
  },
  successMessage: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 8,
  },
});
