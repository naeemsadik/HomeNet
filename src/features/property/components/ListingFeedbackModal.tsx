import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AlertCircle, Check, Send, X } from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";
import { useListingModeration } from "../hooks/useListingModeration";
import type { Property } from "../types/property";

export interface ListingFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  property: Pick<Property, "id" | "title" | "status"> & {
    areaName?: string | null;
    sellerName?: string | null;
  };
  onSuccess?: () => void;
}

const MAX_NOTES_LENGTH = 1000;

const QA_PRESET_TAGS = [
  { id: "image_quality", labelKey: "moderation.feedbackTagImage" },
  { id: "unrealistic_pricing", labelKey: "moderation.feedbackTagPricing" },
  { id: "incomplete_details", labelKey: "moderation.feedbackTagDetails" },
  { id: "title_description", labelKey: "moderation.feedbackTagTitleDesc" },
  { id: "document_missing", labelKey: "moderation.feedbackTagDocument" },
] as const;

/**
 * Where a moderator tells a seller what to fix: preset reasons, a note, and a
 * plain statement of what sending it does to the listing.
 */
export function ListingFeedbackModal({
  visible,
  onClose,
  property,
  onSuccess,
}: ListingFeedbackModalProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { sendFeedback } = useListingModeration();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedTags([]);
    setNotes("");
    setValidationError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const toggleTag = (tagId: string) => {
    if (validationError) setValidationError(null);
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((item) => item !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const trimmedNotes = notes.trim();
    if (selectedTags.length === 0 && trimmedNotes.length === 0) {
      setValidationError(t("moderation.feedbackValidation"));
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    const ok = await sendFeedback(property, {
      tags: selectedTags,
      notes: trimmedNotes,
      requestChanges: true,
    });
    setSubmitting(false);

    if (ok) {
      resetForm();
      onSuccess?.();
      onClose();
    }
  };

  const canSubmit = selectedTags.length > 0 || notes.trim().length > 0;
  const metaParts = [property.areaName, property.sellerName].filter(Boolean);

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.overlay, isPhone && styles.overlayPhone]}
      >
        <Pressable
          accessibilityLabel={t("moderation.feedbackCancel")}
          accessibilityRole="button"
          onPress={handleClose}
          style={StyleSheet.absoluteFill}
        />

        <View
          accessibilityViewIsModal
          style={[styles.sheet, isPhone && styles.sheetPhone]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("moderation.feedbackTitle")}</Text>
            <Pressable
              accessibilityLabel={t("moderation.feedbackCancel")}
              accessibilityRole="button"
              disabled={submitting}
              hitSlop={4}
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
                webPointer,
              ]}
            >
              <X color={colorTokens.ink} size={18} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Target Listing Summary */}
            <View style={styles.contextCard}>
              <Text numberOfLines={1} style={styles.contextTitle}>
                {property.title}
              </Text>
              {metaParts.length > 0 ? (
                <Text numberOfLines={1} style={styles.contextMeta}>
                  {metaParts.join(" · ")}
                </Text>
              ) : null}
            </View>

            <Text style={styles.subtitle}>{t("moderation.feedbackSubtitle")}</Text>

            {/* Preset Revision Reasons */}
            <View style={styles.section}>
              <Text style={styles.label}>{t("moderation.feedbackTagsLabel")}</Text>
              <View style={styles.tagsWrap}>
                {QA_PRESET_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag.id);
                  const label = t(tag.labelKey);
                  return (
                    <Pressable
                      key={tag.id}
                      accessibilityLabel={label}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      disabled={submitting}
                      onPress={() => toggleTag(tag.id)}
                      style={({ pressed }) => [
                        styles.tagChip,
                        selected && styles.tagChipSelected,
                        pressed && styles.pressed,
                        webPointer,
                      ]}
                    >
                      {selected ? (
                        <Check color={colorTokens.brandText} size={14} strokeWidth={2.4} />
                      ) : null}
                      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t("moderation.feedbackNotesLabel")}</Text>
                <Text style={styles.charCount}>
                  {t("moderation.feedbackCharCount", {
                    count: notes.length,
                    max: MAX_NOTES_LENGTH,
                  })}
                </Text>
              </View>
              <TextInput
                accessibilityLabel={t("moderation.feedbackNotesLabel")}
                editable={!submitting}
                maxLength={MAX_NOTES_LENGTH}
                multiline
                numberOfLines={4}
                onChangeText={(value) => {
                  if (validationError) setValidationError(null);
                  setNotes(value);
                }}
                placeholder={t("moderation.feedbackNotesPlaceholder")}
                placeholderTextColor={colorTokens.subtle}
                style={[
                  styles.textarea,
                  validationError ? styles.textareaError : null,
                ]}
                textAlignVertical="top"
                value={notes}
              />
              {validationError ? (
                <View style={styles.errorRow}>
                  <AlertCircle color={colorTokens.errorText} size={14} strokeWidth={1.8} />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              ) : null}
            </View>

            {/* Status Consequence Notice */}
            <View style={styles.noticeBox}>
              <AlertCircle color={colorTokens.warningText} size={16} strokeWidth={1.8} />
              <Text style={styles.noticeText}>{t("moderation.feedbackStatusNotice")}</Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, isPhone && styles.footerPhone]}>
            <Pressable
              accessibilityLabel={t("moderation.feedbackCancel")}
              accessibilityRole="button"
              disabled={submitting}
              onPress={handleClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                isPhone && styles.footerBtnPhone,
                pressed && styles.pressed,
                webPointer,
              ]}
            >
              <Text style={styles.cancelBtnText}>{t("moderation.feedbackCancel")}</Text>
            </Pressable>

            <Pressable
              accessibilityLabel={t("moderation.feedbackSubmit")}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting || !canSubmit }}
              disabled={submitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                isPhone && styles.footerBtnPhone,
                (!canSubmit || submitting) && styles.submitBtnMuted,
                pressed && styles.pressed,
                webPointer,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colorTokens.onBrand} size="small" />
              ) : (
                <Send color={colorTokens.onBrand} size={16} strokeWidth={2} />
              )}
              <Text style={styles.submitBtnText}>
                {submitting ? t("moderation.feedbackSending") : t("moderation.feedbackSubmit")}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayPhone: {
    justifyContent: "flex-end",
    padding: 0,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "90%",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  sheetPhone: {
    maxWidth: "100%",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    backgroundColor: colorTokens.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  title: {
    flex: 1,
    color: colorTokens.ink,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  closeBtn: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPressed: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  contextCard: {
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  contextTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  contextMeta: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  subtitle: {
    color: colorTokens.body,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  charCount: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ["tabular-nums"],
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: layout.touchTarget,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  tagChipSelected: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandText,
  },
  tagText: {
    color: colorTokens.body,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  tagTextSelected: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
  },
  textarea: {
    minHeight: 112,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    backgroundColor: colorTokens.surfaceSunken,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colorTokens.ink,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  textareaError: {
    borderColor: colorTokens.errorText,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    color: colorTokens.errorText,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colorTokens.warningSurface,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  noticeText: {
    flex: 1,
    color: colorTokens.warningText,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
    backgroundColor: colorTokens.canvas,
  },
  footerPhone: {
    flexDirection: "column-reverse",
    alignItems: "stretch",
  },
  footerBtnPhone: {
    width: "100%",
  },
  cancelBtn: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colorTokens.muted,
    backgroundColor: colorTokens.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  submitBtn: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnMuted: {
    opacity: 0.55,
  },
  submitBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.84,
  },
});
