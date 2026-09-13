import {
  AlertTriangle,
  ArrowRight,
  Check,
  Edit3,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react-native";
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
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";
import {
  type AiParsedProperty,
  AI_FIELD_DEFINITIONS,
  AiParseError,
} from "../types/aiListing";
import { parsePropertyWithAi } from "../services/aiPropertyParser";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SheetState = "idle" | "loading" | "preview";

interface AiListingSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (data: AiParsedProperty) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AiListingSheet({ visible, onClose, onApply }: AiListingSheetProps) {
  const { isPhone, width } = useResponsive();
  const [state, setState] = useState<SheetState>("idle");
  const [description, setDescription] = useState("");
  const [parsed, setParsed] = useState<AiParsedProperty | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerMaxWidth = isPhone ? "100%" : Math.min(width - 120, 640);

  const resetSheet = useCallback(() => {
    setState("idle");
    setParsed(null);
    setEditingField(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    // Prevent cancelling while AI is actively reading/parsing
    if (state === "loading") return;
    resetSheet();
    setDescription("");
    onClose();
  }, [state, onClose, resetSheet]);

  const handleAnalyze = useCallback(async () => {
    if (description.trim().length < 20) return;
    setState("loading");
    setError(null);
    try {
      const result = await parsePropertyWithAi(description.trim());
      setParsed(result);
      setState("preview");
    } catch (err) {
      setError(
        err instanceof AiParseError
          ? err.message
          : "Something went wrong parsing your description. Please try again.",
      );
      setState("idle");
    }
  }, [description]);

  const handleTryAgain = useCallback(() => {
    setState("idle");
    setParsed(null);
    setEditingField(null);
    setError(null);
  }, []);

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
            accessibilityHint="Dismisses the AI listing dialog"
            accessibilityLabel="Close AI listing dialog"
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
                accessibilityHint="Closes the AI listing dialog"
                accessibilityLabel="Close"
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
                  <Text style={s.headerTitle}>AI Property Listing</Text>
                  <Text style={s.headerSubtitle}>
                    {state === "preview"
                      ? "Review extracted fields before applying"
                      : "Describe your property and let AI fill the form"}
                  </Text>
                </View>
              </View>

              <View style={s.divider} />

              <ScrollView
                contentContainerStyle={s.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {/* Error banner with Try Again button */}
                {error && (
                  <View style={s.errorBanner}>
                    <AlertTriangle color="#D96A24" size={16} />
                    <View style={s.errorTextWrap}>
                      <Text style={s.errorText}>{error}</Text>
                    </View>
                    <Pressable
                      accessibilityHint="Retries the AI property parsing"
                      accessibilityLabel="Try again"
                      accessibilityRole="button"
                      onPress={handleTryAgain}
                      style={({ pressed }) => [
                        s.errorTryAgainBtn,
                        webPointer,
                        pressed && s.pressed,
                      ]}
                    >
                      <Text style={s.errorTryAgainText}>Try again</Text>
                    </Pressable>
                  </View>
                )}

                {/* ── IDLE & LOADING STATES ─────────────────────────────── */}
                {(state === "idle" || state === "loading") && (
                  <View style={s.idleBody}>
                    <TextInput
                      accessibilityHint="Type your property details in plain text"
                      accessibilityLabel="Property description input"
                      editable={state !== "loading"}
                      multiline
                      numberOfLines={6}
                      onChangeText={setDescription}
                      placeholder={
                        "e.g. 3-bed apartment in Gulshan 2, 7th floor south-facing, 1800 sqft, for sale at 1.8 Cr BDT, has lift, generator, and parking"
                      }
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
                        {description.trim().length} characters
                        {description.trim().length < 20
                          ? " (minimum 20 characters)"
                          : ""}
                      </Text>
                    </View>

                    {state === "loading" ? (
                      <View style={s.loadingWrap}>
                        <ActivityIndicator color={colors.green} size="small" />
                        <Text style={s.loadingText}>
                          AI is reading your description…
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityHint="Parses your natural language description into property details"
                        accessibilityLabel="Analyze with AI"
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
                        <Sparkles color="#FFFFFF" size={16} />
                        <Text style={s.analyzeBtnText}>Analyze with AI</Text>
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
                          Some key fields weren't detected — please fill them in the wizard
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

                      return (
                        <View key={section} style={s.sectionWrap}>
                          <Text style={s.sectionTitle}>{section}</Text>
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
                                      accessibilityHint="AI is less certain about this value — please verify"
                                      accessibilityLabel="Uncertain field warning"
                                      style={s.lowConfBadge}
                                    >
                                      <AlertTriangle color="#D4870A" size={11} />
                                      <Text style={s.lowConfText}>
                                        AI is less certain — please verify
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                {isEditing ? (
                                  <View style={s.fieldEditRow}>
                                    <TextInput
                                      accessibilityLabel={`Edit ${field.label}`}
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
                                      accessibilityHint="Confirms edited value"
                                      accessibilityLabel="Save edit"
                                      accessibilityRole="button"
                                      onPress={() => setEditingField(null)}
                                      style={[s.fieldEditDone, webPointer]}
                                    >
                                      <Check color={colors.green} size={16} />
                                    </Pressable>
                                  </View>
                                ) : (
                                  <Pressable
                                    accessibilityHint={`Tap to edit ${field.label}`}
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
                        <Text style={s.sectionTitle}>Amenities</Text>
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
                        accessibilityHint="Resets and lets you re-type your description"
                        accessibilityLabel="Try again"
                        accessibilityRole="button"
                        onPress={handleTryAgain}
                        style={({ pressed }) => [
                          s.tryAgainBtn,
                          webPointer,
                          pressed && s.pressed,
                        ]}
                      >
                        <RotateCcw color={colors.muted} size={14} />
                        <Text style={s.tryAgainText}>Try again</Text>
                      </Pressable>

                      <Pressable
                        accessibilityHint="Applies parsed details to wizard and opens property creation"
                        accessibilityLabel="Apply & Continue"
                        accessibilityRole="button"
                        onPress={handleApply}
                        style={({ pressed }) => [
                          s.applyBtn,
                          webPointer,
                          pressed && s.pressed,
                        ]}
                      >
                        <Text style={s.applyBtnText}>Apply & Continue</Text>
                        <ArrowRight color="#FFFFFF" size={16} />
                      </Pressable>
                    </View>

                    {/* Disclaimer */}
                    <Text style={s.disclaimerText}>
                      AI may make mistakes — you can edit before submitting
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
    color: "#D96A24",
    lineHeight: 18,
  },
  errorTryAgainBtn: {
    backgroundColor: "#D96A24",
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
    color: "#FFFFFF",
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
    color: "#FFFFFF",
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
  },
});
