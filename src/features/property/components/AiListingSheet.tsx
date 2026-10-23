import {
  AlertTriangle,
  ArrowRight,
  Check,
  Edit3,
  RotateCcw,
  Sparkles,
  X,
} from "@/components/icons";
import React, { useCallback, useState } from "react";
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
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, colors, fonts, shadow, webPointer } from "@/theme";
import {
  type AiParsedProperty,
  AI_FIELD_DEFINITIONS,
} from "../types/aiListing";
import { useGeneratePropertyDescription } from "../hooks/useGeneratePropertyDescription";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SheetState = "idle" | "loading" | "preview";

/** The API's cap on a description (docs/BACKEND_REQUIREMENTS.md §1). */
const MAX_DESCRIPTION_LENGTH = 2000;

interface AiListingSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (data: AiParsedProperty) => void;
  /** Offered when quick listing can't run (service down, daily quota used). */
  onUseManualForm?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AiListingSheet({ visible, onClose, onApply, onUseManualForm }: AiListingSheetProps) {
  const { t } = useTranslation();
  const { isPhone, width } = useResponsive();
  const [step, setStep] = useState<Exclude<SheetState, "loading">>("idle");
  const {
    mutate: runParse,
    reset: resetParse,
    isPending,
    error: parseError,
  } = useGeneratePropertyDescription();
  // Loading comes from the request itself, so it can never be left stuck on.
  const state: SheetState = isPending ? "loading" : step;
  const [description, setDescription] = useState("");
  const [parsed, setParsed] = useState<AiParsedProperty | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const error = parseError?.message ?? null;
  // Retrying won't help when the service is down or the quota is used up.
  const offerManualForm =
    Boolean(onUseManualForm) &&
    (parseError?.code === "UNAVAILABLE" || parseError?.code === "QUOTA_EXCEEDED");

  const containerMaxWidth = isPhone ? "100%" : Math.min(width - 120, 640);

  const resetSheet = useCallback(() => {
    setStep("idle");
    setParsed(null);
    setEditingField(null);
    resetParse();
  }, [resetParse]);

  const handleClose = useCallback(() => {
    // Prevent cancelling while AI is actively reading/parsing
    if (state === "loading") return;
    resetSheet();
    setDescription("");
    onClose();
  }, [state, onClose, resetSheet]);

  const handleAnalyze = useCallback(() => {
    const text = description.trim();
    if (text.length < 20) return;
    runParse(text, {
      onSuccess: (result) => {
        setParsed(result);
        setStep("preview");
      },
    });
  }, [description, runParse]);

  const handleTryAgain = useCallback(() => {
    setStep("idle");
    setParsed(null);
    setEditingField(null);
    resetParse();
  }, [resetParse]);

  const handleUseManualForm = useCallback(() => {
    handleClose();
    onUseManualForm?.();
  }, [handleClose, onUseManualForm]);

  const handleApply = useCallback(() => {
    if (parsed) {
      onApply(parsed);
      handleClose();
    }
  }, [parsed, onApply, handleClose]);

  const handleFieldEdit = useCallback(
    (key: string, value: string) => {
      if (!parsed) return;
      setParsed({ ...parsed, [key]: value });
    },
    [parsed],
  );

  if (!visible) return null;

  // ── Group fields by section for preview ────────────────────────────────────
  const sections = ["Basics", "Details", "Location"] as const;

  const getFieldValue = (key: keyof AiParsedProperty): string | null => {
    if (!parsed) return null;
    const val = parsed[key];
    if (val === undefined || val === null) return null;
    if (typeof val === "object") return null; // skip amenities/confidence as rows
    return String(val);
  };

  const getConfidence = (key: string): "high" | "medium" | "low" | undefined => {
    return parsed?.confidence?.[key];
  };

  // Amenities as a rendered list
  const amenityEntries = parsed?.amenities
    ? Object.entries(parsed.amenities).filter(([, v]) => v)
    : [];

  const isAnalyzeDisabled = description.trim().length < 20;
  const isPartialResult = Boolean(parsed && (!parsed.title || !parsed.type));

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.keyboardView}
      >
        <View style={s.overlay}>
          <Pressable
            accessibilityHint={t("wizard.aiSheet.closeHint")}
            accessibilityLabel={t("wizard.aiSheet.closeAria")}
            accessibilityRole="button"
            disabled={state === "loading"}
            onPress={handleClose}
            style={s.backdrop}
          />

          <View
            style={[
              s.container,
              { maxWidth: containerMaxWidth },
              isPhone && s.containerPhone,
            ]}
          >
            {/* Floating close button */}
            {state !== "loading" && (
              <Pressable
                accessibilityHint={t("wizard.aiSheet.closeBtnHint")}
                accessibilityLabel={t("wizard.aiSheet.closeBtnAria")}
                accessibilityRole="button"
                onPress={handleClose}
                style={({ pressed, hovered }: any) => [
                  s.closeBtn,
                  isPhone && s.closeBtnPhone,
                  hovered && s.closeBtnHovered,
                  pressed && s.closeBtnPressed,
                  webPointer,
                ]}
              >
                <X color="#FFFFFF" size={20} strokeWidth={2.4} />
              </Pressable>
            )}

            {/* Card */}
            <View style={[s.card, isPhone && s.cardPhone]}>
              {/* Header */}
              <View style={s.header}>
                <View style={s.headerIconWrap}>
                  <Sparkles color={colors.green} size={20} />
                </View>
                <View style={s.headerText}>
                  <Text style={s.headerTitle}>{t("wizard.aiSheet.title")}</Text>
                  <Text style={s.headerSubtitle}>
                    {state === "preview"
                      ? t("wizard.aiSheet.subtitlePreview")
                      : t("wizard.aiSheet.subtitleIdle")}
                  </Text>
                </View>
              </View>

              <View style={s.divider} />

              <ScrollView
                contentContainerStyle={s.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {/* Error banner: retry, or the step-by-step form when retrying can't help */}
                {error && (
                  <View style={s.errorBanner}>
                    <AlertTriangle color={colorTokens.warningText} size={16} />
                    <View style={s.errorTextWrap}>
                      <Text style={s.errorText}>{error}</Text>
                    </View>
                    {offerManualForm ? (
                      <Pressable
                        accessibilityHint={t("wizard.aiSheet.useManualFormHint")}
                        accessibilityRole="button"
                        onPress={handleUseManualForm}
                        style={({ pressed }) => [
                          s.errorTryAgainBtn,
                          webPointer,
                          pressed && s.pressed,
                        ]}
                      >
                        <Text style={s.errorTryAgainText}>{t("wizard.aiSheet.useManualForm")}</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityHint={t("wizard.aiSheet.tryAgainHint")}
                        accessibilityLabel={t("wizard.aiSheet.tryAgain")}
                        accessibilityRole="button"
                        onPress={handleTryAgain}
                        style={({ pressed }) => [
                          s.errorTryAgainBtn,
                          webPointer,
                          pressed && s.pressed,
                        ]}
                      >
                        <Text style={s.errorTryAgainText}>{t("wizard.aiSheet.tryAgain")}</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* ── IDLE & LOADING STATES ─────────────────────────────── */}
                {(state === "idle" || state === "loading") && (
                  <View style={s.idleBody}>
                    <TextInput
                      accessibilityHint={t("wizard.aiSheet.inputHint")}
                      accessibilityLabel={t("wizard.aiSheet.inputAria")}
                      editable={state !== "loading"}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      multiline
                      numberOfLines={6}
                      onChangeText={setDescription}
                      placeholder={t("wizard.aiSheet.inputPlaceholder")}
                      placeholderTextColor="#899790"
                      style={[
                        s.textArea,
                        state === "loading" && s.textAreaDisabled,
                      ]}
                      textAlignVertical="top"
                      value={description}
                    />

                    {/* Character count / minimum requirement */}
                    <View style={s.charCountRow}>
                      <Text
                        style={[
                          s.charCountText,
                          description.trim().length > 0 &&
                            description.trim().length < 20 &&
                            s.charCountWarning,
                        ]}
                      >
                        {t("wizard.aiSheet.charCount", { count: description.trim().length })}
                        {description.trim().length < 20
                          ? t("wizard.aiSheet.charCountMin")
                          : ""}
                      </Text>
                    </View>

                    {state === "loading" ? (
                      <View style={s.loadingWrap}>
                        <ActivityIndicator color={colors.green} size="small" />
                        <Text style={s.loadingText}>
                          {t("wizard.aiSheet.readingLoading")}
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityHint={t("wizard.aiSheet.analyzeBtnHint")}
                        accessibilityLabel={t("wizard.aiSheet.analyzeBtn")}
                        accessibilityRole="button"
                        disabled={isAnalyzeDisabled}
                        onPress={() => void handleAnalyze()}
                        style={({ pressed }) => [
                          s.analyzeBtn,
                          isAnalyzeDisabled && s.analyzeBtnDisabled,
                          webPointer,
                          pressed && !isAnalyzeDisabled && s.pressed,
                        ]}
                      >
                        <Sparkles color={colorTokens.onBrand} size={16} />
                        <Text style={s.analyzeBtnText}>{t("wizard.aiSheet.analyzeBtn")}</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* ── PREVIEW STATE ──────────────────────────────────────── */}
                {state === "preview" && parsed && (
                  <View style={s.previewBody}>
                    {/* Partial results warning */}
                    {isPartialResult && (
                      <View style={s.partialWarningBanner}>
                        <AlertTriangle color="#D4870A" size={16} />
                        <Text style={s.partialWarningText}>
                          {t("wizard.aiSheet.partialWarning")}
                        </Text>
                      </View>
                    )}

                    {sections.map((section) => {
                      const sectionFields = AI_FIELD_DEFINITIONS.filter(
                        (f) => f.section === section,
                      );
                      const visibleFields = sectionFields.filter(
                        (f) => getFieldValue(f.key) !== null,
                      );
                      if (visibleFields.length === 0) return null;

                      const sectionTitle =
                        section === "Basics"
                          ? t("wizard.steps.basics")
                          : section === "Details"
                          ? t("wizard.steps.details")
                          : t("wizard.steps.location");

                      return (
                        <View key={section} style={s.sectionWrap}>
                          <Text style={s.sectionTitle}>{sectionTitle}</Text>
                          {visibleFields.map((field) => {
                            const value = getFieldValue(field.key) ?? "";
                            const confidence = getConfidence(field.key as string);
                            const isEditing = editingField === field.key;

                            return (
                              <View key={field.key} style={s.fieldRow}>
                                <View style={s.fieldLabelRow}>
                                  <Text style={s.fieldLabel}>{field.label}</Text>
                                  {confidence === "low" && (
                                    <View
                                      accessibilityHint={t("wizard.aiSheet.uncertainHint")}
                                      accessibilityLabel={t("wizard.aiSheet.uncertainAria")}
                                      style={s.lowConfBadge}
                                    >
                                      <AlertTriangle color="#D4870A" size={11} />
                                      <Text style={s.lowConfText}>
                                        {t("wizard.aiSheet.uncertainWarning")}
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                {isEditing ? (
                                  <View style={s.fieldEditRow}>
                                    <TextInput
                                      accessibilityLabel={t("wizard.aiSheet.editFieldAria", { label: field.label })}
                                      autoFocus
                                      onBlur={() => setEditingField(null)}
                                      onChangeText={(v) =>
                                        handleFieldEdit(field.key, v)
                                      }
                                      onSubmitEditing={() =>
                                        setEditingField(null)
                                      }
                                      style={s.fieldEditInput}
                                      value={value}
                                    />
                                    <Pressable
                                      accessibilityHint={t("wizard.aiSheet.saveEditHint")}
                                      accessibilityLabel={t("wizard.aiSheet.saveEditAria")}
                                      accessibilityRole="button"
                                      onPress={() => setEditingField(null)}
                                      style={[s.fieldEditDone, webPointer]}
                                    >
                                      <Check color={colors.green} size={16} />
                                    </Pressable>
                                  </View>
                                ) : (
                                  <Pressable
                                    accessibilityHint={t("wizard.aiSheet.fieldEditHint", { label: field.label })}
                                    accessibilityLabel={`${field.label}: ${value}`}
                                    accessibilityRole="button"
                                    onPress={() => setEditingField(field.key)}
                                    style={({ pressed }) => [
                                      s.fieldValueRow,
                                      webPointer,
                                      pressed && s.pressed,
                                    ]}
                                  >
                                    <Text
                                      numberOfLines={2}
                                      style={[
                                        s.fieldValue,
                                        confidence === "low" && s.fieldValueLow,
                                      ]}
                                    >
                                      {value}
                                    </Text>
                                    <Edit3 color="#899790" size={14} />
                                  </Pressable>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      );
                    })}

                    {/* Amenities section */}
                    {amenityEntries.length > 0 && (
                      <View style={s.sectionWrap}>
                        <Text style={s.sectionTitle}>{t("wizard.aiSheet.amenitiesSection")}</Text>
                        <View style={s.amenityGrid}>
                          {amenityEntries.map(([key]) => (
                            <View key={key} style={s.amenityChip}>
                              <Check color={colors.green} size={12} />
                              <Text style={s.amenityChipText}>
                                {key.replace(/_/g, " ")}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Preview actions */}
                    <View style={s.previewActions}>
                      <Pressable
                        accessibilityHint={t("wizard.aiSheet.resetTryAgainHint")}
                        accessibilityLabel={t("wizard.aiSheet.tryAgain")}
                        accessibilityRole="button"
                        onPress={handleTryAgain}
                        style={({ pressed }) => [
                          s.tryAgainBtn,
                          webPointer,
                          pressed && s.pressed,
                        ]}
                      >
                        <RotateCcw color={colors.muted} size={14} />
                        <Text style={s.tryAgainText}>{t("wizard.aiSheet.tryAgain")}</Text>
                      </Pressable>

                      <Pressable
                        accessibilityHint={t("wizard.aiSheet.applyContinueHint")}
                        accessibilityLabel={t("wizard.aiSheet.applyContinueBtn")}
                        accessibilityRole="button"
                        onPress={handleApply}
                        style={({ pressed }) => [
                          s.applyBtn,
                          webPointer,
                          pressed && s.pressed,
                        ]}
                      >
                        <Text style={s.applyBtnText}>{t("wizard.aiSheet.applyContinueBtn")}</Text>
                        <ArrowRight color={colorTokens.onBrand} size={16} />
                      </Pressable>
                    </View>

                    {/* Disclaimer */}
                    <Text style={s.disclaimerText}>
                      {t("wizard.aiSheet.disclaimer")}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  pressed: { opacity: 0.85 },
  keyboardView: {
    flex: 1,
  },

  // Overlay + Backdrop
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.45)",
    ...(Platform.OS === "web"
      ? { backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }
      : {}),
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 9999,
  } as any,
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11, 26, 23, 0.15)",
    ...(Platform.OS === "web"
      ? { backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }
      : {}),
  } as any,

  // Container
  container: {
    position: "relative",
    width: "100%",
    maxHeight: "92%",
  } as any,
  containerPhone: {
    maxHeight: "96%",
  },

  // Close button (matches AiFinderModal)
  closeBtn: {
    position: "absolute",
    top: 6,
    right: -46,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web"
      ? {
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
        }
      : {}),
  } as any,
  closeBtnPhone: {
    top: -44,
    right: 4,
  },
  closeBtnHovered: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.7)",
    transform: [{ scale: 1.1 }],
  },
  closeBtnPressed: {
    transform: [{ scale: 0.94 }],
  },

  // Card
  card: {
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    zIndex: 10,
    ...shadow,
  },
  cardPhone: {
    borderRadius: 18,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },

  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: 24,
  },

  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3E4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 106, 36, 0.25)",
  },
  errorTextWrap: {
    flex: 1,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    // Amber, not the old #D96A24 (2.9:1 on this surface).
    color: colorTokens.warningText,
    lineHeight: 18,
  },
  errorTryAgainBtn: {
    backgroundColor: colorTokens.warningText,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  errorTryAgainText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },

  // Partial results banner
  partialWarningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  partialWarningText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: "#B45309",
    lineHeight: 17,
  },

  // ─── Idle / Loading ────────────────────────────────────────────────────────
  idleBody: {
    gap: 12,
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1.2,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    color: colors.ink,
    lineHeight: 22,
    backgroundColor: "#FAFBFA",
    ...(Platform.OS === "web"
      ? { outlineStyle: "none", resize: "vertical" }
      : {}),
  } as any,
  textAreaDisabled: {
    opacity: 0.5,
  },
  charCountRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 4,
  },
  charCountText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  charCountWarning: {
    color: "#D96A24",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  analyzeBtnDisabled: {
    opacity: 0.45,
  },
  analyzeBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.onBrand,
  },

  // ─── Preview ──────────────────────────────────────────────────────────────
  previewBody: {
    gap: 18,
  },
  sectionWrap: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldRow: {
    backgroundColor: "#FAFBFA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  lowConfBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3E4",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lowConfText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: "#D4870A",
  },
  fieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  fieldValue: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    color: colors.ink,
    flex: 1,
  },
  fieldValueLow: {
    color: "#B87A0A",
  },
  fieldEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldEditInput: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: "#FFFFFF",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  } as any,
  fieldEditDone: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.greenLight,
  },

  // Amenities
  amenityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.greenLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amenityChipText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.ink,
    textTransform: "capitalize",
  },

  // Preview actions
  previewActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tryAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: colors.line,
  },
  tryAgainText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  applyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  applyBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.onBrand,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
  },
});
